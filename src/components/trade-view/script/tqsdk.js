/**
 * 支持三种新建形式
 * new Color(0xFF, 0, 0);
 * new Color(0xFF0000);
 * new Color("#FFFF00");
 */
class Color {
    constructor(r, g, b) {
        if (typeof r == 'string' && r.startsWith('#')) {
            let col = parseInt(r.slice(1), 16);
            let cr = (col & 0xFF0000) >> 16;
            let cg = (col & 0x00FF00) >> 8;
            let cb = (col & 0x0000FF);
            this.color = cr | (cg << 8) | (cb << 16);
            this.color_str = r;
        } else if (typeof r == 'number') {
            if (typeof g == 'number' && typeof b == 'number') {
                this.color = r | (g << 8) | (b << 16);
                let c = b | (g << 8) | (r << 16);
                this.color_str = '#' + c.toString(16).padStart(6, '0');
            } else {
                let cr = (r & 0xFF0000) >> 16;
                let cg = (r & 0x00FF00) >> 8;
                let cb = r & 0x0000FF;
                this.color = cr | (cg << 8) | (cb << 16);
                this.color_str = '#' + r.toString(16).padStart(6, '0');
            }
        }
    }
    toJSON() {
        return this.color;
    }
    toString() {
        return this.color_str;
    }
}

const RED = new Color(0xFF, 0, 0);
const GREEN = new Color(0, 0xFF, 0);
const BLUE = new Color(0, 0, 0xFF);
const CYAN = new Color(0, 0xFF, 0xFF);
const BLACK = new Color(0, 0, 0);
const WHITE = new Color(0xFF, 0xFF, 0xFF);
const GRAY = new Color(0x80, 0x80, 0x80);
const MAGENTA = new Color(0xFF, 0, 0xFF);
const YELLOW = new Color(0xFF, 0xFF, 0);
const LIGHTGRAY = new Color(0xD3, 0xD3, 0xD3);
const LIGHTRED = new Color(0xF0, 0x80, 0x80);
const LIGHTGREEN = new Color(0x90, 0xEE, 0x90);
const LIGHTBLUE = new Color(0x8C, 0xCE, 0xFA);

/**
 * 返回 klines object的一个proxy，目前不支持负数下标，并可选的为每个数据项提供一个读取转换函数
 * @param data_array
 * @param item_func
 * @returns {Proxy}
 */
function make_array_proxy(data_array, parent_target, item_func = undefined) {
    let handler = {
        get: function (target, property, receiver) {
            if (!isNaN(property)) {
                let i = Number(property);
                if (i < 0)
                    return NaN;
                // i = target.length + i;
                if (item_func)
                    return item_func(target[i]);
                else
                    return target[i];
            } else if (property === 'last_id' || property === 'left_id') {
                return parent_target[property];
            } else {
                return target[property];
            }
        }
    };
    let p = new Proxy(data_array, handler);
    return p;
}

class DataManager {
    constructor() {
        this.account_id = "";
        this.datas = {};
        this.epoch = 0;
    }

    mergeObject(target, source, deleteNullObj) {
        for (let key in source) {
            let value = source[key];
            switch (typeof value) {
                case 'object':
                    if (value === null) {
                        // 服务器 要求 删除对象
                        if (deleteNullObj) {
                            delete target[key];
                        } else {
                            target[key] = null;
                        }
                    } else if (Array.isArray(value)) {
                        target[key] = target[key] ? target[key] : [];
                        this.mergeObject(target[key], value, deleteNullObj);
                    } else if (key == "data") {
                        //@note: 这里做了一个特例, 使得K线序列数据被保存为一个array, 而非object, 并且记录整个array首个有效记录的id
                        if (!(key in target))
                            target.data = [];
                        if (target.left_id == undefined || isNaN(target.left_id) || Object.keys(value)[0] < target.left_id)
                            target.left_id = Number(Object.keys(value)[0]);
                        // @note: 后面使用 GET_KLINE 返回的是 target.data 的 proxy，这样可以方便取得 last_id
                        // target 不是每次都有 last_id
                        // if(target.last_id) target.data.last_id = target.last_id;
                        this.mergeObject(target[key], value, deleteNullObj);
                    } else if (key == "units") {
                        //@note: 不再接收主程序推送的unit相关数据, 改为sdk内部自行计算
                    } else {
                        target[key] = target[key] ? target[key] : {};
                        this.mergeObject(target[key], value, deleteNullObj);
                    }
                    break;
                case 'string':
                case 'boolean':
                case 'number':
                    target[key] = value === 'NaN' ? NaN : value;
                    break;
                case 'undefined':
                    break;
            }
        }
        target["_epoch"] = this.epoch;
    }

    is_changing(obj) {
        return obj && obj._epoch ? obj._epoch == this.epoch : false;
    }

    clear_data() {
        this.datas = {};
    }

    /**
     * 收到aid=="rtn_data"的数据包时, 由本函数处理
     * @param message_rtn_data
     */
    on_rtn_data(message_rtn_data) {
        //收到行情数据包，更新到数据存储区
        this.epoch += 1;
        for (let i = 0; i < message_rtn_data.data.length; i++) {
            let d = message_rtn_data.data[i];
            if (!this.account_id && d.trade) {
                this.account_id = Object.keys(d.trade)[0];
            }
            this.mergeObject(this.datas, d, true);
        }
    }

    set_default(default_value, ...path) {
        let node = this.datas;
        for (let i = 0; i < path.length; i++) {
            if (!(path[i] in node))
                node[path[i]] = (i + 1 === path.length) ? default_value : {};
            node = node[path[i]];
        }
        return node;
    }

    get(...path) {
        let node = this.datas;
        for (let i = 0; i < path.length; i++) {
            if (!(path[i] in node))
                return undefined;
            node = node[path[i]];
        }
        return node;
    }

    get_ticks_serial(symbol) {
        let ts = this.set_default({
            last_id: -1,
            data: []
        }, "ticks", symbol);
        if (!ts.proxy) {
            ts.proxy = make_array_proxy(ts.data, ts);
            ts.proxy.last_price = make_array_proxy(ts.data, ts, k => k ? k.last_price : undefined);
            ts.proxy.average = make_array_proxy(ts.data, ts, k => k ? k.average : undefined);
            ts.proxy.highest = make_array_proxy(ts.data, ts, k => k ? k.highest : undefined);
            ts.proxy.lowest = make_array_proxy(ts.data, ts, k => k ? k.lowest : undefined);
            ts.proxy.volume = make_array_proxy(ts.data, ts, k => k ? k.volume : undefined);
            ts.proxy.amount = make_array_proxy(ts.data, ts, k => k ? k.amount : undefined);
            ts.proxy.open_interest = make_array_proxy(ts.data, ts, k => k ? k.open_interest : undefined);
        }
        return ts;
    }

    /**
     * 获取 k线序列
     */
    get_kline_serial(symbol, dur_nano) {
        let ks = this.set_default({
            last_id: -1,
            data: []
        }, "klines", symbol, dur_nano);
        if (!ks.proxy) {
            ks.proxy = make_array_proxy(ks.data, ks);
            ks.proxy.open = make_array_proxy(ks.data, ks, k => k ? k.open : undefined);
            ks.proxy.high = make_array_proxy(ks.data, ks, k => k ? k.high : undefined);
            ks.proxy.low = make_array_proxy(ks.data, ks, k => k ? k.low : undefined);
            ks.proxy.close = make_array_proxy(ks.data, ks, k => k ? k.close : undefined);
            ks.proxy.volume = make_array_proxy(ks.data, ks, k => k ? k.volume : undefined);
            ks.proxy.close_oi = make_array_proxy(ks.data, ks, k => k ? k.close_oi : undefined);
            ks.proxy.open_oi = make_array_proxy(ks.data, ks, k => k ? k.open_oi : undefined);
        }
        return ks;
    }
}

class EventTarget {
    constructor() {
        this.handlers = {};
    }

    /**
     * 添加事件 Handler
     * @param type
     * @param handler
     */
    addHandler(type, handler) {
        if (this.handlers[type] == undefined) this.handlers[type] = [];
        this.handlers[type].push(handler);
    }

    /**
     * 删除事件 Handler
     * @param string type 时间类型
     * @param handler function
     */
    removeHandler(type, handler) {
        if (this.handlers[type] instanceof Array) {
            let handlers = this.handlers[type];
            for (let i = 0; i < handlers.length; i++) {
                if (handlers[i] == handler) {
                    this.handlers[type].splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     * 出发事件
     * @param event
     */
    fire(event) {
        if (!event.target) event.target = this;
        if (this.handlers[event.type] instanceof Array) {
            let handlers = this.handlers[event.type];
            for (let i = 0; i < handlers.length; i++) {
                handlers[i](event);
            }
        }
    }
}

class IndicatorContext {
    constructor(ind_func) {
        this.instance = ind_func(this);
        this.ind_class_name = ind_func.name;
        this.OUTS_TYPE = new Proxy({}, {
            get: function (target, property, receiver) {
                switch (property) {
                    case 'COLORBAR':
                    case 'COLORDOT':
                        return 2;
                    case 'KLINE':
                        return 4;
                    default:
                        return 1;
                }
            }
        });
        // 'INVISIBLE': 1, // 不绘制序列
        // 'LINE': 1, // 序列以折线绘制
        // 'DOT': 1, // 序列以点绘制
        // 'BAR': 1, // 序列以柱状图绘制, 使用单一颜色
        // 'PCBAR': 1, //	序列以柱状图绘制, 自动使用对应K线的颜色配置
        // 'RGBAR': 1, // 序列以柱状图绘制, 当序列值>=0时使用红色, <0时使用绿色
        // 'COLORBAR': 2, // 序列以柱状图绘制, 并为每个柱子单独指定颜色. C.OUTS的返回类型为 [array, array], 分别为值序列和颜色序列
        // 'COLORDOT': 2,
        // 'KLINE': 4 //序列以K线图绘制, C.OUTS的返回类型为 [array, array, array, array], 分别为开高低收4个序列
        //
    }
    init() {
        this.instance.next();
    }
    DEFINE() {};
    PARAM() {};
    OUTS() {};
    ORDER() {};
    TRADE_AT_CLOSE() {};
    TRADE_OC_CYCLE() {};
}

class IndicatorDefineContext extends IndicatorContext {
    constructor(ind_func) {
        super(ind_func);
        this.define = {
            aid: 'register_indicator_class',
            name: this.ind_class_name,
            cname: this.ind_class_name,
            type: 'SUB',
            state: 'KLINE',
            yaxis: [{
                id: 0
            }],
            params: [],
        };
        this.params = new Map();
    }

    DEFINE(options) {
        if (options) {
            Object.assign(this.define, options);
        }
    };

    PARAM(paramDefaultValue, paramName, options) {
        let paramDefine = this.params.get(paramName);
        if (!paramDefine) {
            paramDefine = {
                name: paramName,
                default: paramDefaultValue,
            };
            if (typeof paramDefaultValue === 'string') {
                paramDefine.type = 'STRING';
            } else if (typeof paramDefaultValue === 'number') {
                paramDefine.type = 'NUMBER';
            } else if (paramDefaultValue instanceof COLOR) {
                paramDefine.type = 'COLOR';
            }

            if (options !== undefined) {
                Object.assign(paramDefine, options);
            }
            this.params.set(paramName, paramDefine);
        }
        return paramDefaultValue;
    };
    get_define() {
        super.init();
        this.params.forEach((value) => this.define.params.push(value));
        return this.define;
    }
}
class IndicatorRunContext extends IndicatorContext {
    constructor(ind_func, instance_id, symbol, dur_nano, params, ds, tq) {
        super(ind_func);
        //技术指标参数, 合约代码/周期也作为参数项放在这里面
        this.TQ = tq;
        this.instance_id = instance_id;
        this.symbol = symbol;
        this.dur_nano = dur_nano;
        this._ds = ds; //基础序列, 用作输出序列的X轴
        this.DS = ds.proxy; //提供给用户代码使用的ds proxy
        this.PARAMS = params; //指标参数
        this.outs = {}; //输出序列访问函数
        this.out_define = {}; //输出序列格式声明
        this.out_values = {}; //输出序列值
        this.out_drawings = {};
        this.valid_left = -1; //已经计算过的可靠结果范围(含左右两端点), valid_right永远>=valid_left. 如果整个序列没有计算过任何数据, 则 valid_left=valid_right= -1
        this.valid_right = -1;

        this.enable_trade = false;
        this.trade_symbol = symbol;
        this.unit_id = "TA." + this.instance_id;
        this.volume_limit = 10;

        this.epoch = 0;
        this.view_left = -1;
        this.view_right = -1;
        this.is_error = false;
        this.trade_at_close = false;
        this.trade_oc_cycle = false;

        super.init(); // init
    }

    PARAM(defaultValue, name) {
        if (!this.PARAMS[name]) {
            this.PARAMS[name] = defaultValue;
        }
        return this.PARAMS[name];
    }

    DRAW(id, params) {
        this.out_drawings[id] = params;
    }
    DRAW_LINE(id, x1, y1, x2, y2, color = 0xFFFFFF, width = 1, style = 0) {
        this.out_drawings[id] = {
            type: "LINE",
            x1,
            y1,
            x2,
            y2,
            color,
            width,
            style
        };
    };
    DRAW_RAY(id, x1, y1, x2, y2, color = 0xFFFFFF, width = 1, style = 0) {
        this.out_drawings[id] = {
            type: "RAY",
            x1,
            y1,
            x2,
            y2,
            color,
            width,
            style
        };
    };
    DRAW_SEG(id, x1, y1, x2, y2, color = 0xFFFFFF, width = 1, style = 0) {
        this.out_drawings[id] = {
            type: "SEG",
            x1,
            y1,
            x2,
            y2,
            color,
            width,
            style
        };
    };
    DRAW_BOX(id, x1, y1, x2, y2, color = 0xFFFFFF, width = 1, style = 0) {
        this.out_drawings[id] = {
            type: "BOX",
            x1,
            y1,
            x2,
            y2,
            color,
            width,
            style
        };
    };
    DRAW_PANEL(id, x1, y1, x2, y2, color = 0xFFFFFF) {
        this.out_drawings[id] = {
            type: "PANEL",
            x1,
            y1,
            x2,
            y2,
            color
        };
    };
    DRAW_ICON(id, x1, y1, icon) {
        this.out_drawings[id] = {
            type: "ICON",
            x1,
            y1,
            icon
        };
    };
    DRAW_TEXT(id, x1, y1, text = "", color = 0xFFFFFF) {
        this.out_drawings[id] = {
            type: "TEXT",
            x1,
            y1,
            text,
            color
        };
    };

    /**
     * 某个范围内有效数据
     * @param left
     * @param right
     * @returns 返回存在数据的最后一个 id, 如果不存在 返回的数字比 left 小
     */
    _exist_data_range(left, right) {
        if (left > right)
            return left - 1;
        for (let i = left; i <= right && !this._ds.data[i]; i++) {
            right = i - 1;
            break;
        }
        return right;
    }

    /**
     * 要求指标实例计算X范围从left到right(包含两端点)的结果值
     * @param left:
     * @param right
     * @return [update_left, update_right]: 本次计算中更新的数据范围, update_right总是>=update_left. 如果本次计算没有任何结果被更新, 返回 [-1, -1]
     */
    calc_range(left, right) {
        // 无法计算的情形
        if (this.is_error || !this._ds || this._ds.last_id == -1 || left > this._ds.last_id) {
            return [-1, -1];
        }


        let calc_left = -1,
            calc_right = -1;
        let isDefault = false;

        if (left === undefined || right === undefined) {
            // 1 默认值  => 没有数据就不计算
            left = this.view_left < this._ds.left_id ? this._ds.left_id : this.view_left;
            right = this.view_right > this._ds.last_id ? this._ds.last_id : this.view_right;
            if (right < left) return [-1, -1];
            isDefault = true;

        } else {
            // 2 用户输入值 => 即使没有数据也要计算填入 NaN, 把用户输入的范围记下来
            [calc_left, calc_right] = [left, right];
        }

        /**
         * ------[-----------------]------- this._ds.data
         *   valid_left        valid_right
         */
        if (this.valid_left === -1 || this.valid_right === -1 || right < this.valid_left || left > this.valid_right) {
            // -------------------------------
            // --(***)--[----------------]----
            // ----[----------------]--(***)--
            right = this._exist_data_range(left, right);
            if (right >= left) {
                this.valid_left = left;
                this.valid_right = right;
            } else {
                if (isDefault) return [-1, -1];
            }
        } else if (left < this.valid_left) {
            // 向前移动
            // --(***[**************]***)--
            // --(***[****)---------]------
            let temp_right = this._exist_data_range(left, this.valid_left);
            if (temp_right >= left) {
                if (temp_right < this.valid_left) {
                    // this.valid_left 之前有不存在的数据
                    this.valid_right = right = temp_right;
                } else if (right > this.valid_right) {
                    // --(***[**************]***)--
                    right = this._exist_data_range(this.valid_right, right);
                    this.valid_right = right;
                } else {
                    // --(***[****)---------]------
                    calc_right = right = this.valid_left;
                }
                this.valid_left = left;
            } else {
                if (isDefault) return [-1, -1];
            }
        } else {
            // 向后移动
            if (right < this.valid_right) {
                // --[---(*******)-----]-----
                return [-1, -1];
            } else {
                // --[---(************]***)--
                calc_left = left = this.valid_right;
                right = this._exist_data_range(this.valid_right, right);
                this.valid_right = right;
            }
        }
        if (isDefault)[calc_left, calc_right] = [left, right];
        let runId = TaManager.Keys.next().value;
        let content = {
            id: runId,
            instanceId: this.instance_id,
            className: this.ind_class_name,
            range: [calc_left, calc_right]
        };
        try {
            if (IsWebWorker)
                self.postMessage({
                    cmd: 'calc_start',
                    content
                });
            for (let i = calc_left; i <= calc_right; i++) {
                this.instance.next(i);
            }
            if (IsWebWorker)
                self.postMessage({
                    cmd: 'calc_end',
                    content
                });
        } catch (e) {
            console.error(e);
            this.is_error = true;
            if (IsWebWorker)
                self.postMessage({
                    cmd: 'calc_end',
                    content
                });
            if (IsWebWorker)
                self.postMessage({
                    cmd: 'feedback',
                    content: {
                        error: true,
                        type: 'run',
                        message: e.message,
                        func_name: this.ind_class_name,
                    },
                });
        }
        return [calc_left, calc_right];

    };

    /**
     * 设定是否只在K线完成时刻发出交易信号
     * @param b : b==true,只在一根K线结束的时刻,才会发出交易信号, 一根K线最多只发出一个交易信号; b==false, K线每次变化时都可能发出交易信号, 一根K线可以发出多个交易信号
     *
     * 默认值为 false
     */
    TRADE_AT_CLOSE(b) {
        this.trade_at_close = b;
    }
    /**
     * 设定是否强制使用开平循环模式
     * @param b : b==true,在未持仓情况下只会发出开仓信号, 有持仓时只会发出平仓信号. b==false, 有持仓时也可以发出开仓信号
     *
     * 默认值为 false
     */
    TRADE_OC_CYCLE(b) {
        this.trade_oc_cycle = b;
    }
    ISLAST(i) {
        return this._ds.last_id === i;
    }
    ORDER(current_i, direction, offset, volume, limit_price = undefined, order_symbol = this.trade_symbol) {
        if (this.is_error || !this._ds || this._ds.last_id === -1)
            return;
        if (!this.out_series_mark) {
            this.out_series_mark = this.OUTS('MARK', 'mk', {});
        }
        this.out_series_mark[current_i] = direction === "BUY" ? ICON_BUY : ICON_SELL;
        if (!this.enable_trade)
            return;

        // 要求在K线完成的时刻满足下单条件才会动作
        if (this.trade_at_close && (current_i <= this.last_i || this._ds.last_id !== current_i + 1))
            return;
        // 要求任意时刻满足下单条件都会动作
        if (!this.trade_at_close && this._ds.last_id !== current_i)
            return;

        this.last_i = current_i;
        //确定下单价格
        if (!limit_price) {
            // 引用了上层的 TQ
            let quote = this.TQ.GET_QUOTE(order_symbol);
            let price_field = direction === "BUY" ? 'ask_price1' : 'bid_price1';
            if (!quote[price_field]) // 取不到对应的价格 包括 NaN 、 undefined
                return;
            limit_price = quote[price_field];
        }

        let position = this.TQ.GET_UNIT_POSITION(this.unit_id, order_symbol);
        let volume_open = 0;
        let volume_close = 0;
        if (offset === "CLOSE" || offset === "CLOSEOPEN") {
            let long_closeable_volume = position.volume_long ? position.volume_long - position.order_volume_sell_close : 0;
            let short_closeable_volume = position.volume_short ? position.volume_short - position.order_volume_buy_close : 0;
            if (direction === "BUY") {
                volume_close = Math.min(short_closeable_volume, volume);
            } else {
                volume_close = Math.min(long_closeable_volume, volume);
            }
            if (volume_close > 0) {
                return this.TQ.INSERT_ORDER({
                    symbol: order_symbol,
                    direction: direction,
                    offset: order_symbol.startsWith("SHFE.") ? "CLOSETODAY" : "CLOSE",
                    volume: volume_close,
                    limit_price: limit_price,
                    unit_id: this.unit_id,
                });
            }
        }
        if (offset === "OPEN" || offset === "CLOSEOPEN") {
            let long_position_volume = (position.volume_long + position.order_volume_buy_open) ? position.volume_long + position.order_volume_buy_open : 0;
            let short_position_volume = (position.volume_short + position.order_volume_sell_open) ? position.volume_short + position.order_volume_sell_open : 0;
            let pos_volume = (direction === "BUY") ? long_position_volume : short_position_volume;
            if (pos_volume === 0 || !this.trade_oc_cycle) {
                if (this.volume_limit) {
                    if (this.volume_limit > pos_volume)
                        volume_open = Math.min(this.volume_limit - pos_volume, volume);
                    else
                        volume_open = 0;
                } else {
                    volume_open = volume;
                }
            }
            if (volume_open > 0) {
                return this.TQ.INSERT_ORDER({
                    symbol: order_symbol,
                    direction: direction,
                    offset: "OPEN",
                    volume: volume_open,
                    limit_price: limit_price,
                    unit_id: this.unit_id,
                });
            }
        }
    };
    CANCEL_ALL() {
        return this.TQ.CANCEL_ORDER(this.unit_id);
    };
    LOG(msg, color = '#000000', bkcolor = '#ffffff') {
        let dt = (new Date()).toISOString().slice(0, 23).replace('T', ' ');
        let dt_css = 'background: #ddd; color: #000 ';
        let d_css = 'background: #fff; color: #000 ';
        let css = 'background: ' + bkcolor + '; color:' + color;
        //console.log(`%c${dt}%c %c${JSON.stringify(msg)}`, dt_css, d_css, css);
    }
    OUTS(style, name, options = {}) {
        options.style = style;
        this.out_define[name] = options;
        var out_serial = [];
        this.out_values[name] = out_serial;
        let self = this;
        let length_of_outs = this.OUTS_TYPE[style];
        for (let i = 0; i < length_of_outs; i++) {
            out_serial[i] = [];
        }
        this.outs[name] = (function (len) {
            return function (left, right = null) {
                //每个序列的输出函数允许一次性提取一段数据(含left, right两点)
                //如果提供了left/right 两个参数,则返回一个 array
                //如果只提供left, 则返回一个value
                //无法输出结果的情形
                let result = [];
                for (let i = 0; i < len; i++) {
                    result[i] = right === null ? null : [];
                }
                if (self.is_error || !self._ds || self._ds.last_id === -1) {
                    return result;
                }
                //负数支持, 如果left/right为负数, 需要先转换到正数, 这一转换又必须事先有一个合约/周期来标定X轴
                if (left < 0)
                    left = self._ds.last_id + left + 1;
                if (right < 0)
                    right = self._ds.last_id + right + 1;
                //尝试更新计算数据
                let [l, r] = [left, right ? right : left];
                if (self.view_left === -1 && self.valid_right === -1) {
                    l = self._ds.last_id - 500;
                    l = l < self._ds.left_id ? self._ds.left_id : l;
                    r = self._ds.last_id;
                }
                let [calc_left, calc_right] = self.calc_range(l, r);
                //输出数据结果
                for (var i = 0; i < len; i++) {
                    result[i] = right === null ? out_serial[i][left] : out_serial[i].slice(left, right + 1);
                }
                return len === 1 ? result[0] : result;
            }
        }(length_of_outs));
        if (length_of_outs === 1) return out_serial[0];
        return out_serial;
    }
    // 模仿 wh 添加的接口
    MARGIN(order_symbol = this.trade_symbol) {
        let quote = this.TQ.GET_QUOTE(order_symbol);
        // quote.margin 每手保证金
        // 返回保证金率 默认 0.08
        let margin_rate = quote.margin / quote.last_price / quote.volume_multiple;
        return margin_rate ? margin_rate : 0.08;
    }

    PTICK(order_symbol = this.trade_symbol) {
        let quote = this.TQ.GET_QUOTE(order_symbol);
        return quote.price_tick;
    }

    VM(order_symbol = this.trade_symbol) {
        let quote = this.TQ.GET_QUOTE(order_symbol);
        return quote.volume_multiple;
    }

    FEE(order_symbol = this.trade_symbol) {
        let quote = this.TQ.GET_QUOTE(order_symbol);
        // 每手手续费
        return quote.commission;
    }

    BACK_BUY_INTERVAL(current_i) {
        if (this.out_series_mark) {
            let i = 1;
            while (this.out_series_mark[current_i - i] !== ICON_BUY) {
                i++;
                if (i > 100) return undefined;
            }
            return i;
        }
        return undefined;
    }

    BACK_SELL_INTERVAL(current_i) {
        if (this.out_series_mark) {
            let i = 1;
            while (this.out_series_mark[current_i - i] !== ICON_SELL) {
                i++;
                if (i > 100) return undefined;
            }
            return i;
        }
        return undefined;
    }

    // 100根k线内，最后一次交易信号是 BUY
    IS_LAST_BUY(current_i) {
        if (this.out_series_mark) {
            let i = current_i;
            while (current_i - i < 100) {
                if (this.out_series_mark[i] === ICON_BUY) return true;
                if (this.out_series_mark[i] === ICON_SELL) return false;
                i--;
            }
        }
        return undefined;
    }

    // 100根k线内，最后一次交易信号是 SELL
    IS_LAST_SELL(current_i) {
        if (this.out_series_mark) {
            let i = current_i;
            while (current_i - i < 100) {
                if (this.out_series_mark[i] === ICON_SELL) return true;
                if (this.out_series_mark[i] === ICON_BUY) return false;
                i--;
            }
        }
        return undefined;
    }

    // current_i 当前 k 线距离收盘的分钟数
    CLOSE_MINUTE(current_i, order_symbol = this.trade_symbol) {
        // 收盘时间
        let [close_hour, close_minute] = this.TQ.GET_CLOSE_TIME(order_symbol).split(':');
        let close = null;
        let nowtime = this.DS[current_i].datetime;
        let now = new Date(nowtime / 1000000);
        if (close_hour - now.getHours() >= 0) {
            // 同一天
            close = new Date(now);
        } else {
            // 前一天
            close = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }
        close.setHours(close_hour);
        close.setMinutes(close_minute);
        return Math.round((close - now) / 60000);
    }
}

class PublicData {
    constructor(date = 'latest') {
        this.url = `http://ins.shinnytech.com/publicdata/${date}.json`;
        this.active = null;

        this.cffex_option = null;
        this.combine = null;
        this.future = null;
        this.option = null;

        this.ins_volatility = null;
        this.night = null;
        this.risk_free_interest = null;
        this.times = null;
        this.times_extra = null;
        this.tradingday = null;

        // 'CFFEX.IF1806' => ["CEEEX.IF1806", "CEEEX", "IF", "1806"]
        // 'IF1806'       => ["IF1806", undefined, "IF", "1806"]
        // 'IF'           => ["IF", undefined, "IF", ""]
        this.reg = new RegExp(/([A-Z]*(?=\.))?\.?([A-Za-z]*)([0-9]*)/);
        this.appendData();
    }

    appendData(url = this.url) {
        let _this = this;
        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (response) {
                _this.active = response.active.split[','];
                _this.cffex_option = response.data.cffex_option;
                _this.combine = response.data.combine;
                _this.future = response.data.future;
                _this.option = response.data.option;
                _this.ins_volatility = response.ins_volatility;
                _this.night = response.night.split[','];
                _this.risk_free_interest = response.risk_free_interest;
                _this.times = {};
                for (let indlist in response.times) {
                    for (let ind in indlist.split(',')) {
                        _this.times[ind] = response.times[indlist];
                    }
                }
                _this.times_extra = response.times_extra;
                _this.tradingday = response.tradingday;
            });
    }

    getPriceTick(ind) {
        let match_arr = ind.match(this.reg);
        if (match_arr && match_arr[2]) {
            return this.future[match_arr[2]].n.ptick;
        }
        return undefined;
    }

    getContractMultiplier(ind) {
        let match_arr = ind.match(this.reg);
        if (match_arr && match_arr[2]) {
            return this.future[match_arr[2]].n.contract_multiplier;
        }
        return undefined;
    }

    /**
     * 在一组时间对中，找到对应的开盘、收盘时间
     * @param {*} ind AP
     * @param {*} when 'O' | 'C' 开盘或者收盘
     * @param {*} times 一组时间对
     */
    findTime(ind, when, times) {
        let opentime, closetime;

        let max_start = '00:00',
            min_start = '23:59',
            max1_end = '00:00',
            max2_end = '00:00';

        for (let start in times) {
            if (start.padStart(5, '0') > max_start) max_start = start;
            if (start.padStart(5, '0') < min_start) min_start = start;
            let end = times[start];
            if (end.padStart(5, '0') > max1_end) max1_end = end;
            else if (end.padStart(5, '0') > max2_end) max2_end = end;
        }
        opentime = max_start > '20:00' ? max_start : min_start;
        closetime = max_start > '20:00' ? times[max_start] == max1_end ? max2_end : max1_end : max1_end;

        return when === 'O' ? opentime : closetime;
    }

    getOpenCloseTime(ind, when) {
        let match_arr = ind.match(this.reg);
        if (match_arr && match_arr[2]) {
            let ind = match_arr[2],
                dt = match_arr[3],
                ind_dt = match_arr[2] + match_arr[3];
            let timesObj = this.times["default"];
            if (this.times_extra[ind_dt]) {
                timesObj = this.times_extra[ind_dt];
            } else if (this.times[ind]) {
                timesObj = this.times[ind];
            }
            return this.findTime(ind, when, timesObj);
        }
        return undefined;
    }

    getCloseTime(ind) {
        return getOpenCloseTime(ind, 'C');
    }

    getOpenTime(ind) {
        return getOpenCloseTime(ind, 'O');
    }

}
class TaManager {
    constructor(tq) {
        this.TQ = tq;
        this.class_dict = {};
        this.instance_dict = {};
    }

    register_indicator_class(ind_func) {
        this.class_dict[ind_func.name] = ind_func;
        return new IndicatorDefineContext(ind_func);
    };

    unregister_indicator_class(ind_func_name) {
        delete this.class_dict[ind_func_name];
    };

    new_indicator_instance(ind_func, symbol, dur_nano, ds, params = {}, instance_id) {
        let ind_instance = new IndicatorRunContext(ind_func, instance_id, symbol, dur_nano, params, ds, this.TQ);
        this.instance_dict[instance_id] = ind_instance;
        return ind_instance;
    };

    delete_indicator_instance(ind_instance) {
        delete this.instance_dict[ind_instance.instance_id];
    };
}

TaManager.Keys = GenerateSequence();
class Task {
    constructor(task_id, func, waitConditions = null) {
        this.id = task_id;
        this.func = func;
        this.paused = false;
        this.waitConditions = waitConditions;
        // this.timeout = 6000000; // 每个任务默认时间
        // this.endTime = 0;
        this.stopped = false;
        this.events = {};
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    stop() {
        this.stopped = true;
    }
}

class TaskManager {
    constructor() {
        this.aliveTasks = {};
        this.intervalTime = 50; // 任务执行循环间隔
        this.runningTask = null; // 正在执行的 Task
        this.events = {};
        this.GenTaskId = GenerateSequence();
        this.interval = setInterval(function () {
            for (var taskId in this.aliveTasks) {
                var task = this.aliveTasks[taskId];
                // 用户显示定义了 timeout 才记录 timeout 字段
                if (task.timeout) {
                    if (task.paused) {
                        task.endTime += this.intervalTime;
                    } else {
                        var now = (new Date()).getTime();
                        if (task.endTime <= now)
                            this.runTask(task);
                    }
                }
            }
        }, this.intervalTime);
    }

    getEndTime(t) {
        return (new Date()).getTime() + t;
    }

    checkTask(task) {
        var status = {};
        task.timeout = undefined;
        for (var cond in task.waitConditions) {
            if (cond.toUpperCase() === 'TIMEOUT') {
                task.timeout = task.waitConditions[cond];
                if ((new Date()).getTime() >= task.endTime) status['TIMEOUT'] = true;
                else status['TIMEOUT'] = false;
                continue;
            }

            try {
                status[cond] = task.waitConditions[cond]();
            } catch (err) {
                //console.log(err)
                status[cond] = false;
            }
        }
        return status;
    }

    runTask(task) {
        this.runningTask = task;
        var waitResult = this.checkTask(task);
        /**
         * ret: { value, done }
         */
        for (var r in waitResult) {
            if (waitResult[r] === true) {
                // waitConditions 中某个条件为真才执行 next
                var ret = task.func.next(waitResult);
                if (ret.done) {
                    task.stopped = true;
                    task.return = ret.value;
                    this.any_task_stopped = true;
                } else {
                    if (task.timeout) task.endTime = this.getEndTime(task.timeout);
                    task.waitConditions = ret.value;
                }
                break;
            }
        }
    }

    run(obj) {
        if (obj) {
            if (!(obj.type in this.events)) this.events[obj.type] = {};
            if (!(obj.id in this.events[obj.type])) this.events[obj.type][obj.id] = obj.data;
        }
        this.any_task_stopped = false; // 任何一个task 的状态改变，都重新 run
        for (var taskId in this.aliveTasks) {
            if (this.aliveTasks[taskId].paused || this.aliveTasks[taskId].stopped)
                continue;
            try {
                this.runTask(this.aliveTasks[taskId]);
            } catch (err) {
                if (err == 'not logined') {
                    if (IsBrowser) Notify.error('未登录交易，请在软件中登录后重试。');
                    else if (IsWebWorker) self.postMessage({
                        cmd: 'feedback',
                        content: {
                            error: true,
                            message: '未登录交易，请在软件中登录后重试。'
                        }
                    });
                } else {

                }

            }
        }
        if (obj) {
            delete this.events[obj.type][obj.id];
        }
        if (this.any_task_stopped)
            this.run();
    }

    add(func) {
        var task_id = this.GenTaskId.next().value;
        var task = new Task(task_id, func);
        this.aliveTasks[task_id] = task;
        this.runningTask = task;
        var ret = task.func.next();
        if (ret.done) {
            task.stopped = true;
            task.return = ret.value;
        } else {
            for (var cond in ret.value) {
                if (cond.toUpperCase() === 'TIMEOUT') {
                    task.timeout = ret.value[cond];
                    task.endTime = getEndTime(task.timeout);
                    break;
                }
            }
            task.waitConditions = ret.value;
        }
        return task;
    }

    remove(task) {
        delete this.aliveTasks[task.id];
    }

    start_task(func) {
        if (typeof func === 'function') {

            var args = [];
            if (arguments.length > 1) {
                var len = 1;
                while (len < arguments.length)
                    args.push(arguments[len++]);
            }
            var f = func.apply(null, args);
            if (f.next && (typeof f.next === 'function')) {
                return this.add(f);
            } else {
                //console.log('task 参数类型错误');
            }
        } else {
            //console.log('task 参数类型错误');
        }
    }

    stop_task(task) {
        if (task)
            task.stop();
        return null;
    }

    pause_task(task) {
        task.pause();
    }

    resume_task(task) {
        task.resume();
    }
}
// 系统常量
const ICON_BUY = 1;
const ICON_SELL = 2;
const ICON_BLOCK = 3;
const IsBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document);
const IsWebWorker = !IsBrowser && typeof importScripts !== 'undefined';
const IsTest = !(IsBrowser || IsWebWorker);

/**
 * 返回指定变量的数据类型
 * @param  {Any} data
 * @return {String} Array Object Generator Function String Number Null Undefined Boolean
 */
function type(data) {
    return Object.prototype.toString.call(data).slice(8, -1);
}

/**
 * 生成指定长度的随机字符串
 * 默认长度为 8
 */
function RandomStr(len = 8) {
    var charts = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var s = '';
    for (var i = 0; i < len; i++) s += charts[Math.random() * 0x3e | 0];
    return s;
}

/**
 * 生成序列生成器
 * 默认从 0 开始
 */
function* GenerateSequence(start = 0) {
    while (true) {
        yield start.toString(36);
        start++;
    }
}

/**
 * 解析字符串，读取交易所和交易代码
 */
function ParseSymbol(str) {
    var match_arr = str.match(/([^\.]+)\.(.*)/);
    return {
        exchange_id: match_arr ? match_arr[1] : '', // 交易所代码
        instrument_id: match_arr ? match_arr[2] : '' // 合约代码
    }
}

/**
 * 深度比较两个对象是否相同
 * @param x
 * @param y
 * @returns {boolean}
 */
Object.equals = function (x, y) {
    if (!(x instanceof Object && y instanceof Object)) {
        return x == y;
    }
    for (let p in y) {
        if (!x.hasOwnProperty(p)) return false;
    }
    for (let p in x) {
        if (!y.hasOwnProperty(p)) return false;
        if (typeof y[p] != typeof x[p]) return false;
        if (!Object.equals(x[p], y[p])) return false;
    }
    return true;
}

function getobj(obj, ...path) {
    let node = obj;
    for (let i = 0; i < path.length; i++) {
        if (!(path[i] in node))
            return undefined;
        node = node[path[i]];
    }
    return node;
}

class Store {
    constructor(key) {
        this.key = key;
        this.init();
    }
    init() {
        if (localStorage.getItem(this.key) === null)
            localStorage.setItem(this.key, "{}");
    }
    save(obj) {
        obj = JSON.stringify(obj);
        localStorage.setItem(this.key, obj);
        return obj;
    }
    get() {
        return JSON.parse(localStorage.getItem(this.key));
    }
    remove() {
        localStorage.removeItem(this.key);
    }
}
class ErrorStore {
    constructor(key, webworker) {
        this.key = key;
        this.errClassList = [];
        this.records = {};
        this.init();
        this.webworker = webworker;
    }
    init() {
        let item = localStorage.getItem(this.key);
        if (item === null) {
            localStorage.setItem(this.key, "");
            this.errClassList = [];
        } else {
            this.errClassList = item.split(',');
        }
    }
    add(name) {
        if (this.errClassList.indexOf(name) === -1) {
            this.errClassList.push(name);
            localStorage.setItem(this.key, this.errClassList.join(','));
            this.webworker.error_class_name(this.errClassList);
            return this.errClassList;
        }
    }
    remove(name) {
        if (this.errClassList.indexOf(name) > -1) {
            this.errClassList.splice(this.errClassList.indexOf(name), 1);
            localStorage.setItem(this.key, this.errClassList.join(','));
            this.webworker.error_class_name(this.errClassList);
            return this.errClassList;
        }
    }
    has(name) {
        return this.errClassList.indexOf(name) > -1;
    }
    get() {
        return this.errClassList;
    }
    clear() {
        localStorage.setItem(this.key, '');
        this.errClassList = [];
        return this.errClassList;
    }
}

// event.js
class TqWebsocket extends EventTarget {
    constructor(url) {
        super();
        this.url = url;
        this.ws = null;
        this.queue = [];

        // 自动重连开关
        this.reconnect = true;
        this.reconnectTask = null;
        this.reconnectInterval = 3000;

        this.STATUS = {
            CONNECTING: 0,
            OPEN: 1,
            CLOSING: 2,
            CLOSED: 3,
        };
    }

    send_json(obj) {
        if (this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(obj));
        } else {
            this.queue.push(JSON.stringify(obj));
        }
    };

    isReady() {
        return this.ws.readyState === 1;
    };

    init() {
        this.ws = new WebSocket(this.url);
        var _this = this;
        this.ws.onmessage = function (message) {
            let data = eval('(' + message.data + ')');
            _this.fire({
                type: 'onmessage',
                data: data
            });
        };

        this.ws.onclose = function (event) {
            _this.fire({
                type: 'onclose'
            });

            // 清空 queue
            _this.queue = [];

            // 自动重连
            if (_this.reconnect) {
                _this.reconnectTask = setInterval(function () {
                    if (_this.ws.readyState === 3) _this.init();
                }, _this.reconnectInterval);
            }
        };

        this.ws.onerror = function (error) {
            _this.ws.close();
        };

        this.ws.onopen = function () {
            _this.fire({
                type: 'onopen'
            });

            if (this.reconnectTask) {
                clearInterval(_this.reconnectTask);
                _this.fire({
                    type: 'onreconnect'
                });
            }

            if (_this.queue.length > 0) {
                while (_this.queue.length > 0) {
                    if (_this.ws.readyState === 1) _this.ws.send(_this.queue.shift());
                    else break;
                }
            }
        };
    };
}
const GLOBAL_CONTEXT = {
    current_account_id: "",
    current_symbol: "SHFE.cu1810",
    current_dur: "5000000000",
};

class TQSDK {
    constructor(mock_ws, ws_addr) {
        this.id = RandomStr(4);

        if (mock_ws) {
            this.ws = typeof mock_ws === 'string' ? new TqWebsocket(mock_ws) : mock_ws;
        } else {
            //this.ws = new TqWebsocket('ws://127.0.0.1:7777/')
            this.ws = new TqWebsocket(ws_addr)
        }

        this.pd = new PublicData();
        this.dm = new DataManager();
        this.tm = new TaskManager();
        this.ta = new TaManager(this);

        // 最小变动单位
        this.GET_PTICK = this.pd.getPriceTick.bind(this.pd);
        // 合约乘数
        this.GET_VM = this.pd.getContractMultiplier.bind(this.pd);
        this.GET_OPEN_TIME = this.pd.getOpenTime.bind(this.pd);
        this.GET_CLOSE_TIME = this.pd.getCloseTime.bind(this.pd);

        this.DATA = this.dm.datas;
        this.SEND_MESSAGE = this.ws.send_json;
        this.START_TASK = this.tm.start_task.bind(this.tm);
        this.PAUSE_TASK = this.tm.pause_task.bind(this.tm);
        this.RESUME_TASK = this.tm.resume_task.bind(this.tm);
        this.STOP_TASK = this.tm.stop_task.bind(this.tm);

        this.ws.init();
        this.UI = new Proxy(() => null, {
            get: function (target, key, receiver) {
                let res = UiUtils.readNodeBySelector('input#' + key);
                if (res[key]) return res[key];
                res = UiUtils.readNodeBySelector('input[name="' + key + '"]'); // radio
                if (res[key]) return res[key];
                res = UiUtils.readNodeBySelector('span#' + key);
                if (res[key]) return res[key];
                return undefined;
            },
            set: function (target, key, value, receiver) {
                UiUtils.writeNode(key, value);
            },
            apply: function (target, ctx, args) {
                let params = args[0];
                if (params)
                    for (let key in params) UiUtils.writeNode(key, params[key]);
                else return UiUtils.readNodeBySelector('input');
                return args[0];
            }
        });
        this.init_ui(this);
        this.init_ws_handlers();

        this._subcribe_charts = {};
    }

    register_trade_ui(trade_ui_obj, update_interval) {
        this.trade_ui = trade_ui_obj;
        this.trade_ui_update_time = new Date();
        this.trade_ui_update_interval = update_interval;

        this.orders_key_set = [];
        this.orders_list = [];

        this.positions_key_set = [];
        this.positions_list = [];

        this.trades_key_set = [];
        this.trades_list = [];
    }

    register_index_ui(index_ui_obj, update_interval) {
        this.index_ui = index_ui_obj;
        this.index_ui_update_time = new Date();
        this.index_ui_update_interval = update_interval;
    }

    set_index_code_list(index_code_list) {
        this.index_code_list = index_code_list;
    }

    subcribe_chart(symbol, dur_sec) {
        if (!symbol || !dur_sec) return undefined;
        let key = symbol + '.' + dur_sec;
        let dur_nano = dur_sec * 1e9;
        if (!this._subcribe_charts[key]) {
            let chart_id = RandomStr();
            this.ws.send_json({
                "aid": "set_chart",
                "chart_id": chart_id,
                "ins_list": symbol,
                "duration": dur_nano,
                "view_width": 500, // 默认为 500
            });
            this._subcribe_charts[key] = chart_id;
        }
        return this.dm.get_kline_serial(symbol, dur_nano);
    }

    init_ws_handlers() {
        this.ws.addHandler('onmessage', (function (message) {
            switch (message.data.aid) {
                case "rtn_data":
                    this.on_rtn_data(message.data);
                    break;
                case "update_indicator_instance":
                    this.on_update_indicator_instance(message.data);
                    break;
                case "update_custom_combine":
                    if (!this.dm.datas.combines) this.dm.datas.combines = {};
                    this.dm.datas.combines[message.data.symbol] = message.data.weights;
                    break;
                default:
                    return;
            }

            var time_now = (new Date()).getTime();
            if (typeof (this.index_ui) != "undefined") {
                //console.log(22222222222222);
                if ((time_now - this.index_ui_update_time) > this.index_ui_update_interval) {
                    //console.log(message.data);
                    this.index_ui_update_time = time_now;
                    //console.log(this.index_code_list);
                    if (typeof (this.index_code_list) != "undefined") {
                        var quote_list = [];
                        for (var i in this.index_code_list) {
                            var symbol = this.index_code_list[i]
                            quote_list.push(TQ.dm.datas.quotes[symbol]);
                        }
                        //console.log(111111111);
                        //console.log(quote_list);
                        this.index_ui.quote = quote_list;
                    }
                }
            }
            if (typeof (this.trade_ui) != "undefined") {
                if ((time_now - this.trade_ui_update_time) > this.trade_ui_update_interval) {
                    //console.log(message.data);
                    this.index_ui_update_time = time_now;

                    //var account_id = "046578"
                    var account_id = "SIM"
                    this.trade_ui.account = [tr_TQ.dm.datas.trade[account_id].accounts.CNY];

                    // tr_TQ.dm.datas.trade[account_id].orders.forEach(function (value, key, map) {
                    //     if( !this.orders_key_set.has(key) ){
                    //         this.orders_key_set.add( key );
                    //         this.orders_list.push( value );
                    //     }
                    // });

                    this.orders_key_set = Object.keys(tr_TQ.dm.datas.trade[account_id].orders).sort().reverse();
                    this.orders_list = [];
                    for (var i in this.orders_key_set) {
                        var value = tr_TQ.dm.datas.trade[account_id].orders[this.orders_key_set[i]]
                        if (typeof (value) == "object") {
                            this.orders_list.push(value);
                        }
                    }
                    this.trade_ui.orders = this.orders_list.reverse();

                    this.positions_key_set = Object.keys(tr_TQ.dm.datas.trade[account_id].positions).sort().reverse();
                    this.positions_list = [];
                    for (var i in this.positions_key_set) {
                        var value = tr_TQ.dm.datas.trade[account_id].positions[this.positions_key_set[i]]
                        if (typeof (value) == "object") {
                            value.volume_long = value.volume_long_his + value.volume_long_today;
                            value.volume_short = value.volume_short_his + value.volume_short_today;
                            this.positions_list.push(value);
                        }
                    }
                    this.trade_ui.positions = this.positions_list.reverse();

                    this.trades_key_set = Object.keys(tr_TQ.dm.datas.trade[account_id].trades).sort().reverse();
                    this.trades_list = [];
                    for (var i in this.trades_key_set) {
                        var value = tr_TQ.dm.datas.trade[account_id].trades[this.trades_key_set[i]]
                        if (typeof (value) == "object") {
                            this.trades_list.push(value);
                        }
                    }
                    this.trade_ui.trades = this.trades_list.reverse();

                }
            }


        }).bind(this));

        this.ws.addHandler('onclose', (function () {
            this.dm.clear_data();
        }).bind(this));
    }

    register_ws_processor(type, processor_func) {
        this.ws.addHandler(type, processor_func);
    }

    unregister_ws_processor(type, processor_func) {
        this.ws.removeHandler(type, processor_func);
    }

    /**
     * 收到aid=="rtn_data"的数据包时, 由本函数处理
     * @param message_rtn_data
     */
    on_rtn_data(message_rtn_data) {
        //收到行情数据包
        //根据更新数据包, 调整unit信息
        for (let i = 0; i < message_rtn_data.data.length; i++) {
            let d = message_rtn_data.data[i];
            let orders = getobj(d, 'trade', this.dm.account_id, 'orders');
            for (let order_id in orders) {
                let order = orders[order_id];
                let orign_order = this.dm.get('trade', this.dm.account_id, 'orders', order_id);
                let volume_change = order.status == "ALIVE" ? order.volume_left : 0;
                if (orign_order && orign_order.status == "ALIVE") {
                    volume_change = volume_change - orign_order.volume_left;
                }
                this.process_unit_order(order, volume_change);
            }
            let trades = getobj(d, 'trade', this.dm.account_id, 'trades');
            for (let trade_id in trades) {
                let trade = trades[trade_id];
                this.process_unit_trade(trade);
            }
        }

        //更新到数据存储区
        this.dm.on_rtn_data(message_rtn_data);
        //重新计算所有技术指标 instance
        for (let id in this.ta.instance_dict) {
            let instance = this.ta.instance_dict[id];
            if (this.dm.is_changing(instance._ds)) {
                let [calc_left, calc_right] = instance.calc_range();
                this.send_indicator_data(instance, calc_left, calc_right);
            }
        }
        this.tm.run();
    }

    process_unit_order(order, volume_change) {
        let symbol = order.exchange_id + "." + order.instrument_id;
        let order_id_parts = order.order_id.split(".");

        for (let i = 0; i < order_id_parts.length; i++) {
            let unit_id = order_id_parts.slice(0, i).join(".");
            let position = this.GET_UNIT_POSITION(unit_id, symbol);
            if (order.offset == "OPEN") {
                if (order.direction == "BUY")
                    position.order_volume_buy_open += volume_change;
                else
                    position.order_volume_sell_open += volume_change;
            } else {
                if (order.direction == "BUY")
                    position.order_volume_buy_close += volume_change;
                else
                    position.order_volume_sell_close += volume_change;
            }
        }
    }

    process_unit_trade(trade) {
        let symbol = trade.exchange_id + "." + trade.instrument_id;
        let order_id_parts = trade.order_id.split(".");
        for (let i = 0; i < order_id_parts.length; i++) {
            let unit_id = order_id_parts.slice(0, i).join(".");
            let position = this.GET_UNIT_POSITION(unit_id, symbol);
            let unit = this.dm.set_default({}, "trade", this.dm.account_id, "units", unit_id);
            if (trade.offset == "OPEN") {
                if (trade.direction == "BUY") {
                    position.volume_long += trade.volume;
                    position.cost_long += trade.volume * trade.price;
                } else {
                    position.volume_short += trade.volume;
                    position.cost_short += trade.volume * trade.price;
                }
            } else {
                let close_profit = 0;
                if (trade.direction == "BUY") {
                    let v = Math.min(trade.volume, position.volume_short);
                    if (v > 0) {
                        let c = position.cost_short / position.volume_short * v;
                        close_profit = c - v * trade.price;
                        position.cost_short -= c;
                        position.volume_short -= v;
                    }
                } else {
                    let v = Math.min(trade.volume, position.volume_long);
                    if (v > 0) {
                        let c = position.cost_long / position.volume_long * v;
                        close_profit = v * trade.price - c;
                        position.cost_long -= c;
                        position.volume_long -= v;
                    }
                }
                unit.stat.close_profit += close_profit;
            }
        }
    }

    on_update_indicator_instance(pack) {
        //重置指标参数
        let instance_id = pack.instance_id;
        let instance = null;
        let params = {};
        for (let name in pack.params) {
            params[name] = pack.params[name].value;
        }
        let ds = this.dm.get_kline_serial(pack.ins_id, pack.dur_nano);
        let c = this.ta.class_dict[pack.ta_class_name];
        if (!c)
            return;

        if (!this.ta.instance_dict[instance_id]) {
            instance = this.ta.new_indicator_instance(c, pack.ins_id, pack.dur_nano, ds, params, pack.instance_id);
        } else {
            instance = this.ta.instance_dict[pack.instance_id];
            if (ds != instance.ds || !Object.equals(params, instance.PARAMS)) {
                this.ta.delete_indicator_instance(instance);
                instance = this.ta.new_indicator_instance(c, pack.ins_id, pack.dur_nano, ds, params, pack.instance_id);
            }
        }
        instance.epoch = pack.epoch;
        instance.view_left = pack.view_left;
        instance.view_right = pack.view_right;

        instance.enable_trade = pack.enable_trade;
        if (pack.trade_symbol)
            instance.trade_symbol = pack.trade_symbol;
        if (pack.unit_id)
            instance.unit_id = pack.unit_id;
        instance.volume_limit = pack.volume_limit;

        let [calc_left, calc_right] = instance.calc_range();
        this.send_indicator_data(instance, calc_left, calc_right);
    }
    send_indicator_data(instance, calc_left, calc_right) {
        //计算指标值
        if (calc_left > -1 && instance.view_left > -1) {
            let datas = {};
            for (let sn in instance.out_values) {
                if (instance.out_define[sn].style === 'INVISIBLE')
                    continue;
                datas[sn] = [];
                let s = instance.out_values[sn];
                for (let i in s) {
                    datas[sn][i] = s[i].slice(calc_left, calc_right + 1);
                }
            }
            let set_data = {
                aid: "set_indicator_data", //必填, 标示此数据包为技术指标结果数据
                instance_id: instance.instance_id, //必填, 指标实例ID，应当与 update_indicator_instance 中的值一致
                epoch: instance.epoch, //必填, 指标实例版本号，应当与 update_indicator_instance 中的值一致
                range_left: calc_left, //必填, 表示此数据包中第一个数据对应图表X轴上的位置序号
                range_right: calc_right, //必填, 表示此数据包中最后一个数据对应图表X轴上的位置序号
                serials: instance.out_define,
                datas: datas,
                drawings: instance.out_drawings,
            };
            this.ws.send_json(set_data);
        }
    }

    IS_CHANGING(obj) {
        return this.dm.is_changing(obj);
    }

    GET_ACCOUNT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'accounts', 'CNY');
    };

    GET_POSITION(symbol) {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'positions', symbol);
    };

    GET_UNIT_POSITION(unit_id, symbol) {
        let unit = this.dm.set_default({
            unit_id,
            stat: {
                close_profit: 0
            },
        }, "trade", this.dm.account_id, "units", unit_id);
        unit._epoch = this.dm.epoch;
        let position = this.dm.set_default({
            symbol,
            unit_id,
            order_volume_buy_open: 0,
            order_volume_sell_open: 0,
            order_volume_buy_close: 0,
            order_volume_sell_close: 0,

            volume_long: 0,
            cost_long: 0,
            volume_short: 0,
            cost_short: 0,
        }, unit, "positions", symbol);
        return position;
    };

    GET_COMBINE(combine_id) {
        return this.dm.set_default({}, 'combines', 'USER.' + combine_id);
    }

    GET_POSITION_DICT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'positions');
    }

    GET_TRADE_DICT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'trades');
    };

    GET_ORDER_DICT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'orders');
    };

    GET_QUOTE(symbol) {
        // 订阅行情
        var ins_list = this.dm.datas.ins_list;
        if (ins_list && !ins_list.includes(symbol)) {
            var s = ins_list + "," + symbol;
            this.ws.send_json({
                aid: "subscribe_quote",
                ins_list: s,
            });
        }
        return this.dm.set_default({}, 'quotes', symbol);
    }

    GET_KLINE({
        kline_id = RandomStr(),
        symbol = GLOBAL_CONTEXT.symbol,
        dur_sec = GLOBAL_CONTEXT.duration,
        width = 100
    } = {}) {
        let ds = this.subcribe_chart(symbol, dur_sec);
        return ds.proxy; // 这里返回的是实际数据的 proxy
    }

    INSERT_ORDER({
        symbol,
        direction,
        offset,
        volume = 1,
        price_type = "LIMIT",
        limit_price,
        order_id,
        unit_id = "EXT"
    } = {}) {
        if (!this.dm.account_id) {
            Notify.error('未登录，请在软件中登录后重试。');
            return null;
        }
        if (!order_id)
            order_id = unit_id + '.' + RandomStr(8);
        let {
            exchange_id,
            instrument_id
        } = ParseSymbol(symbol);
        let send_obj = {
            "aid": "insert_order",
            "order_id": order_id,
            "exchange_id": exchange_id,
            "instrument_id": instrument_id,
            "direction": direction,
            "offset": offset,
            "volume": volume,
            "price_type": "LIMIT",
            "limit_price": limit_price,
            "user_id": this.dm.account_id
        };
        this.ws.send_json(send_obj);

        let order = this.dm.set_default({
            order_id: order_id,
            status: "ALIVE",
            offset: offset,
            direction: direction,
            volume_orign: volume,
            volume_left: volume,
            exchange_id: exchange_id,
            instrument_id: instrument_id,
            limit_price: limit_price,
            price_type: "LIMIT",
        }, "trade", this.dm.account_id, "orders", order_id);
        order._epoch = this.dm.epoch;
        this.process_unit_order(order, volume);
        return order;
    };

    CANCEL_ORDER(order) {
        let orders = {};
        if (typeof order === 'object') {
            orders[order.order_id] = order;
        } else if (typeof order === 'string') {
            let all_orders = this.dm.get('trade', this.dm.account_id, 'orders');
            for (var order_id in all_orders) {
                var ord = all_orders[order_id];
                if (ord.status === "ALIVE" && order_id.startsWith(order))
                    orders[order_id] = ord;
            }
        }
        for (let order_id in orders) {
            if (orders[order_id].status === "ALIVE")
                this.ws.send_json({
                    "aid": "cancel_order",
                    "order_id": order_id,
                    "user_id": this.dm.account_id
                });
        }
        return Object.keys(orders).length;
    }

    REGISTER_INDICATOR_CLASS(ind_class) {
        let define_context = this.ta.register_indicator_class(ind_class);
        this.ws.send_json(define_context.get_define());
    }
    UNREGISTER_INDICATOR_CLASS(ind_class_name) {
        this.ta.unregister_indicator_class(ind_class_name);
        this.ws.send_json({
            "aid": "unregister_indicator_class",
            "name": ind_class_name
        });
    }

    NEW_INDICATOR_INSTANCE(ind_func, symbol, dur_sec, params = {}, instance_id = RandomStr()) {
        let ds = this.subcribe_chart(symbol, dur_sec);
        if (ds) {
            let dur_nano = dur_sec * 1e9;
            return this.ta.new_indicator_instance(ind_func, symbol, dur_nano, ds, params, instance_id);
        }
        return null;
    }
    DELETE_INDICATOR_INSTANCE(ind_instance) {
        return this.ta.delete_indicator_instance(ind_instance);
    }

    /**
     * UI 相关
     */
    SET_STATE(cmd) {
        cmd = cmd.toUpperCase();
        if (cmd === 'START' || cmd === 'RESUME') {
            $('.panel-title .STATE').html('<span class="label label-success">运行中</span>');
            $('input').attr('disabled', true);
            $('button.START').attr('disabled', true);
        } else if (cmd === 'PAUSE') {
            $('.panel-title .STATE').html('<span class="label label-warning">已暂停</span>');
            $('input').attr('disabled', true);
            $('button.START').attr('disabled', true);
        } else if (cmd === 'STOP') {
            $('.panel-title .STATE').html('<span class="label label-danger">已停止</span>');
            $('input').attr('disabled', false);
            $('button.START').attr('disabled', false);
        }
    }

    ON_CLICK(dom_id) {
        var this_tq = this;
        return function () {
            if (this_tq.tm.events['click'] && this_tq.tm.events['click'][dom_id]) {
                var d = Object.assign({}, this_tq.tm.events['click'][dom_id]);
                return true;
            }
            return false;
        }
    }

    ON_CHANGE(dom_id) {
        var this_tq = this;
        return function () {
            if (this_tq.tm.events['change'] && this_tq.tm.events['change'][dom_id]) {
                var d = Object.assign({}, this_tq.tm.events['change'][dom_id]);
                return true;
            }
            return false;
        }
    }

    init_ui() {
        if (IsBrowser) {
            var this_tq = this;
            $(() => {
                // init code
                var lines = $('#TRADE-CODE').text().split('\n');
                lines.forEach((el, i, arr) => lines[i] = el.replace(/\s{8}/, ''));
                var html = hljs.highlightAuto(lines.join('\n'));
                $('#code_container code').html(html.value);

                $('#collapse').on('hide.bs.collapse', () => $('#collapse_arrow').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down'));
                $('#collapse').on('show.bs.collapse', () => $('#collapse_arrow').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up'));

                $(document).on('click', function (e) {
                    // 页面 Click 事件统一处理 4 类按钮 START RESUME PAUSE END
                    var dataSet = Object.assign({}, e.target.dataset);
                    this_tq.tm.run({
                        type: e.type,
                        id: e.target.id,
                        data: dataSet
                    });
                });
                $('input').on('change', function (e) {
                    var dataSet = Object.assign({}, e.target.dataset);
                    this_tq.tm.run({
                        type: e.type,
                        id: e.target.id,
                        data: dataSet
                    });
                });
            });
        }
    }

}

export default TQSDK


/************************************************************
 * UI 部分
 *************************************************************/

const UiUtils = (function () {
    function _writeBySelector(sel, value) {
        let nodeList = document.querySelectorAll(sel);
        let success = false;
        nodeList.forEach((node, index, array) => {
            if (node.nodeName === 'SPAN' || node.nodeName === 'DIV') {
                node.innerText = value;
                success = true;
            } else if (node.nodeName === 'INPUT') {
                if (node.type === 'text' || node.type === 'number') {
                    node.value = value;
                    success = true;
                } else if (node.type === 'radio' && node.value === value) {
                    node.checked = true;
                    success = true;
                }
            }
        });
        return success;
    }
    return {
        readNodeBySelector(sel) {
            let nodeList = document.querySelectorAll(sel);
            let params = {};
            nodeList.forEach((node, index, array) => {
                Object.assign(params, UiUtils.readNode(node));
            });
            return params;
        },
        readNode(node) {
            if (node.nodeName == 'INPUT')
                switch (node.type) {
                    case 'number':
                        return {
                            [node.id]: node.valueAsNumber
                        };
                    case 'text':
                        return {
                            [node.id]: node.value
                        };
                    case 'radio':
                        return node.checked ? {
                            [node.name]: node.value
                        } : {};
                    default:
                        return {
                            [node.id]: undefined
                        };
                }
            else if (node.nodeName == 'SPAN')
                return {
                    [node.id]: node.innerText
                }
        },
        writeNode(key, value) {
            if (!_writeBySelector('#' + key, value))
                _writeBySelector('input[type="radio"][name=' + key + ']', value);
        }
    }
})();
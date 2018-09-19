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
        let ts = this.set_default({last_id: -1, data: []}, "ticks", symbol);
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
        let ks = this.set_default({last_id: -1, data: []}, "klines", symbol, dur_nano);
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

    DEFINE() {
    };

    PARAM() {
    };

    OUTS() {
    };

    ORDER() {
    };

    TRADE_AT_CLOSE() {
    };

    TRADE_OC_CYCLE() {
    };
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
            yaxis: [{id: 0}],
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

// 系统常量
const IsBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document);
const IsWebWorker = !IsBrowser && typeof importScripts !== 'undefined';

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
        exchange_id: match_arr ? match_arr[1] : '',// 交易所代码
        instrument_id: match_arr ? match_arr[2] : ''// 合约代码
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
			_this.ws.send('{"aid":"peek_message"}');
        };

        this.ws.onclose = function (event) {
            _this.fire({type: 'onclose'});

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
			_this.ws.send('{"aid":"peek_message"}');
            _this.fire({type: 'onopen'});

            if (this.reconnectTask) {
                clearInterval(_this.reconnectTask);
                _this.fire({type: 'onreconnect'});
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

class TrTqWebsocket extends EventTarget {
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
            if( data["aid"] == "rtn_brokers" ){
                window.broker_list = data["brokers"]
                console.log( window.broker_list )
            }

            _this.fire({
                type: 'onmessage',
                data: data
            });
			_this.ws.send('{"aid":"peek_message"}');
        };

        this.ws.onclose = function (event) {
            _this.fire({type: 'onclose'});

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
			_this.ws.send('{"aid":"peek_message"}');
            _this.fire({type: 'onopen'});

            if (this.reconnectTask) {
                clearInterval(_this.reconnectTask);
                _this.fire({type: 'onreconnect'});
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

let md_url = 'ws://openmd.shinnytech.com/t/md/front/mobile'
let td_url = 'ws://opentd.shinnytech.com/trade/user1'

class TQSDK {
    constructor() {
        this.id = RandomStr(4);
		this.ws_md = new TqWebsocket(md_url);
		this.ws_td = new TrTqWebsocket(td_url);

        this.pd = new PublicData();
        this.dm = new DataManager();

        // 最小变动单位
        this.GET_PTICK = this.pd.getPriceTick.bind(this.pd);
        // 合约乘数
        this.GET_VM = this.pd.getContractMultiplier.bind(this.pd);
        this.GET_OPEN_TIME = this.pd.getOpenTime.bind(this.pd);
        this.GET_CLOSE_TIME = this.pd.getCloseTime.bind(this.pd);

        this.DATA = this.dm.datas;

        this.ws_md.init();
		this.ws_td.init();
        this.init_ws_handlers();
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

    subcribe_chart(symbol, dur_nano, left_kline_id, view_width) {
		if( left_kline_id == -1 ) {
			this.ws_md.send_json({
				"aid": "set_chart",
				"chart_id": "WEB",
				"ins_list": symbol,
				"duration": dur_nano,
				"view_width": view_width,
			});
		}else{
			this.ws_md.send_json({
				"aid": "set_chart",
				"chart_id": "WEB",
				"ins_list": symbol,
				"duration": dur_nano,
				"view_width": view_width,
				"left_kline_id":left_kline_id,
			});
		}
        return this.dm.get_kline_serial(symbol, dur_nano);
    }

    copy(obj) {
        var newobj = {};
        for (var attr in obj) {
            newobj[attr] = obj[attr];
        }
        return newobj;
    }

    subscribe_quote(code_list) {
        var send_data = {
            aid: "subscribe_quote",
            ins_list: code_list.join()
        };

        this.ws_md.send_json(send_data);
    }

    trade_login(broker_id, user_name, password){
		this.ws_td.send_json({
			aid: "req_login",
			bid: broker_id,
			user_name: user_name,
			password: password
		});
	}

	cancel_order(user_id, order_id){
		this.ws_td.send_json({
			aid: "cancel_order", // 撤单请求
			order_id: order_id,
			user_id: user_id
		});
	}
    update_quote(time_now, force) {
        if (typeof(this.index_ui) != "undefined") {
            //console.log("TQ update_quote");

            if (force || (time_now - this.index_ui_update_time) > this.index_ui_update_interval) {
                this.index_ui_update_time = time_now;
                if (typeof(this.index_code_list) != "undefined") {
                    var quote_list = [];
                    if (TQ.dm.datas.quotes === undefined) {
                        console.warn("TQ.dm.datas.quotes not load finish")
                        return 0;
                    }
                    for (var i in this.index_code_list) {
                        var symbol = this.index_code_list[i]
                        var data_temp = TQ.dm.datas.quotes[symbol]
                        if (!(data_temp === undefined)) {
                            data_temp["change"] = data_temp.last_price - data_temp.pre_settlement;
                            data_temp["change_percent"] = data_temp["change"] / data_temp.pre_settlement;
                            data_temp["color"] = this.index_ui.change_to_color(data_temp["change"]);
                            this.index_ui.quotes_data_map[symbol] = data_temp;
                            quote_list.push(this.copy(data_temp));
                        }
                        else {
                            console.log(symbol + " TQ.dm.datas.quotes leak!");
                            var bak_data = this.index_ui.quotes_data_map[symbol];
                            if (!(bak_data === undefined)) {
                                quote_list.push(bak_data);
                            }
                        }
                    }
                    //console.log(quote_list);
                    this.index_ui.quote = quote_list;
                }
            }
        }
    }

	update_tr_quote(time_now, force) {
		if (typeof(this.trade_ui) != "undefined") {
			if ((time_now - this.trade_ui_update_time) > this.trade_ui_update_interval) {
				this.trade_ui_update_time = time_now;

				var account_id = window.account_id
				this.trade_ui.account = [TQ.dm.datas.trade[account_id].accounts.CNY];

				this.orders_key_set = Object.keys(TQ.dm.datas.trade[account_id].orders).sort().reverse();
				this.orders_list = [];
				for (var i in this.orders_key_set) {
					var value = TQ.dm.datas.trade[account_id].orders[this.orders_key_set[i]]
					if (typeof(value) == "object") {
						this.orders_list.push(value);
					}
				}
				this.trade_ui.orders = this.orders_list//.reverse();

				this.positions_key_set = Object.keys(TQ.dm.datas.trade[account_id].positions).sort().reverse();
				this.positions_list = [];
				for (var i in this.positions_key_set) {
					var value = TQ.dm.datas.trade[account_id].positions[this.positions_key_set[i]]
					if (this.positions_key_set[i] === "undefined") {
						continue;
					}
					if (typeof(value) == "object") {
						value.volume_long = value.volume_long_his + value.volume_long_today;
						value.volume_short = value.volume_short_his + value.volume_short_today;
						if( value.volume_long == 0 && value.volume_short == 0 ){
							continue
						}
						this.positions_list.push(value);
					}
				}
				this.trade_ui.positions = this.positions_list.reverse();

				this.trades_key_set = Object.keys(TQ.dm.datas.trade[account_id].trades).sort().reverse();
				this.trades_list = [];
				for (var i in this.trades_key_set) {
					var value = TQ.dm.datas.trade[account_id].trades[this.trades_key_set[i]]
					if (typeof(value) == "object") {
						this.trades_list.push(value);
					}
				}
				this.trade_ui.trades = this.trades_list.reverse();

			}
		}
	}

    init_ws_handlers() {
        this.ws_md.addHandler('onmessage', (function (message) {
			this.on_rtn_data(message.data);
        }).bind(this));
		this.ws_td.addHandler('onmessage', (function (message) {
			this.on_rtn_data(message.data);
		}).bind(this));
    }

    on_rtn_data(message_rtn_data) {
        //更新到数据存储区
		if (message_rtn_data.aid == "rtn_data")
        	this.dm.on_rtn_data(message_rtn_data);
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
            this.ws_md.send_json({
                aid: "subscribe_quote",
                ins_list: s,
            });
        }
        return this.dm.set_default({}, 'quotes', symbol);
    }

    GET_KLINE({kline_id = RandomStr(), symbol = GLOBAL_CONTEXT.symbol, dur_sec = GLOBAL_CONTEXT.duration, width = 100} = {}) {
        let ds = this.subcribe_chart(symbol, dur_sec);
        return ds.proxy; // 这里返回的是实际数据的 proxy
    }

    insert_order({order_id, exchange_id, instrument_id, direction, offset, volume = 1, price_type = "LIMIT", limit_price} = {}) {
        if (!this.dm.account_id) {
            Notify.error('未登录，请在软件中登录后重试。');
            return null;
        }
        let send_obj = {
            "aid": "insert_order",
			"user_id": this.dm.account_id,
            "order_id": order_id,
            "exchange_id": exchange_id,
            "instrument_id": instrument_id,
            "direction": direction,
            "offset": offset,
            "volume": volume,
            "price_type": "LIMIT",
            "limit_price": limit_price,
        };
        this.ws_td.send_json(send_obj);

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
        return order;
    };
}

import './chart'
import Io from './socket'
import Datafeeds from './datafeed'

export default {
    widget: null,
    dataFeed: null,
    dataCache: {}, // 缓存数据
    getBarTimer: null,

    data_record_map: {},
    data_cache_time_map: {},
    skip_period_map: {},
    left_end_map: {},
    fetch_time_interval: 8000,

    init: function (options) {
        var update_interval = 1000;
        this.dataFeed = new Datafeeds(this, update_interval)

        this.widget = new TradingView.widget({
            autosize: true,
            symbol: options.symbol,
            interval: options.interval,
            container_id: 'tv_chart_container',
            datafeed: this.dataFeed,
            library_path: '/static/charting_library/',
            drawings_access: {
                type: 'black',
                tools: [{
                    name: 'Regression Trend'
                }]
            },
            disabled_features: [
                'header_symbol_search',
                'use_localstorage_for_settings',
                'symbol_search_hot_key',
                'header_chart_type',
                'header_compare',
                'header_undo_redo', //左右箭头
                'header_screenshot',
                'header_saveload',
                'timeframes_toolbar',
                'context_menus',
                'left_toolbar',
                'header_indicators', // 图表指标
                'header_settings', //设置
                'header_resolutions', //时间下拉框
                'header_interval_dialog_button',
                'show_interval_dialog_on_key_press',
                'header_fullscreen_button', //全屏按钮
                //'border_around_the_chart', //周围边框
                'volume_force_overlay', //k线与销量分开
                'legend_context_menu',
                'edit_buttons_in_legend',
                'widget_logo', //取消logo显示
            ],
            enabled_features: [],
            numeric_formatting: {
                decimal_sign: '.'
            },
            overrides: {
                //蜡烛样式
                //red: #EF4D5A; green: #52BA84 from screenshot
                //red: #d75442; green: #6ba583 from document
                "mainSeriesProperties.candleStyle.upColor": "#EF4D5A",
                "mainSeriesProperties.candleStyle.downColor": "#52BA84",
                //烛心
                "mainSeriesProperties.candleStyle.drawWick": true,
                //烛心颜色
                "mainSeriesProperties.candleStyle.wickUpColor:": 'rgba( 115, 115, 117, 1)',
                "mainSeriesProperties.candleStyle.wickDownColor": 'rgba( 115, 115, 117, 1)',
                //边框
                "mainSeriesProperties.candleStyle.drawBorder": true,
                //"mainSeriesProperties.candleStyle.borderColor": "#378658",
                "mainSeriesProperties.candleStyle.borderUpColor": "#EF4D5A",
                "mainSeriesProperties.candleStyle.borderDownColor": "#52BA84",
            },
            studies_overrides: {
                //成交量颜色
                "volume.volume.color.0": "#52BA84",
                "volume.volume.color.1": "#FF4D5A",
            },
            timezone: 'Asia/Shanghai',
            locale: 'zh',
            debug: true
        })

        window.widget = this.widget;

        this.widget.onChartReady(() => {
            //this.widget.chart().createStudy('MA Cross', false, false, [30, 120])

            var btn_setResolution = this.widget.createButton().on('click', function (e) {
                window.widget.chart().setResolution('15');
                $(e.target).addClass('select').closest('div.space-single').siblings('div.space-single').find('div.button').removeClass('select');
            });
            btn_setResolution[0].innerHTML = '15' + '分钟';

            var btn_setResolution = this.widget.createButton().on('click', function (e) {
                window.widget.chart().setResolution('60');
                $(e.target).addClass('select').closest('div.space-single').siblings('div.space-single').find('div.button').removeClass('select');
            });
            btn_setResolution[0].innerHTML = '1' + '小时';

            var btn_setResolution = this.widget.createButton().on('click', function (e) {
                window.widget.chart().setResolution('1D');
                $(e.target).addClass('select').closest('div.space-single').siblings('div.space-single').find('div.button').removeClass('select');
            });
            btn_setResolution[0].innerHTML = '1' + '天';

            // var btn_setResolution = this.widget.createButton().on('click', function (e) {
            //     window.route_obj.back(-1);;
            //     $(e.target).addClass('select').closest('div.space-single').siblings('div.space-single').find('div.button').removeClass('select');
            // });
            // btn_setResolution[0].innerHTML = '后退';

            // var btn_setResolution = this.widget.createButton().on('click', function(e){
            //     window.widget.chart().setResolution( '22D' );
            //     $(e.target).addClass('select').closest('div.space-single').siblings('div.space-single').find('div.button').removeClass('select');
            // });
            // btn_setResolution[0].innerHTML = '1'+'月';

            // var btn_setSymbol = this.widget.createButton().on('click', function(e){
            //   //console.log("widget btn_setSymbolllllllllllllll")
            //   //window.widget.chart().setResolution('15');
            //   window.widget.chart().setSymbol('CFFEX.IF1809');
            //   $(e.target).addClass('select').closest('div.space-single').siblings('div.space-single').find('div.button').removeClass('select');
            // });
            // btn_setSymbol[0].innerHTML =  'IF1809';
            // btn_setSymbol[0].title =  'IF1809';
        })

    },

    setResolution: function (resolution_num) {
        window.widget.chart().setResolution(resolution_num);
    },

    setSymbol: function (symbol) {
        window.widget.chart().setSymbol(symbol);
    },

    setRoute: function (route_obj) {
        window.route_obj = route_obj;
    },
    setStore: function (store_obj) {
        window.store_obj = store_obj;
    },

    subscribe_tq: function (tq_obj) {
        this.TQ = tq_obj;
        Io.init(this.TQ);

        var symbol = "SHFE.cu1809";
        var dur_nano = 3600 * 24 * 1000 * 1000 * 1000;
        var view_width = 100;

        Io.init_symbol_data(symbol, dur_nano, view_width);
    },

    has_key: function (dict_map, key) {
        return !!dict_map[key];
    },

    getBars: function (symbol, resolution, from, to, callback) {
        //console.log("getBars start judgeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee ")
        let data
        const symbolData = this.dataCache[symbol]
        if (symbolData) {
            data = symbolData[resolution]
        }
        if (resolution === 'D') {
            resolution = '1D'
        }

        if (this.getBarTimer) {
            clearTimeout(this.getBarTimer)
        }
        const fromMs = from * 1000
        const toMs = to * 1000

        //console.log( "取缓存数据" )
        //console.log( data )
        //console.log( "fromMs : "+fromMs+" "+" toMs : "+toMs )

        // 取缓存数据
        const fetchCacheData = data => {
            const newBars = []
            let count = 0
            data.forEach(function (element) {
                const barTime = element.time
                if (barTime >= fromMs && barTime <= toMs) {
                    newBars.push(element)
                    count++
                }
            }, this)

            //nexttime判断
            try {
                //console.log( "nexttime_judge" )
                //console.log( this.skip_period_map )
                var nexttime_data = this.skip_period_map[symbol + resolution][from + "-" + to];
                if (typeof (nexttime_data) != "undefined") {
                    //console.log("data length is 0,use nextTime")
                    //console.log( nexttime_data )
                    callback && callback(nexttime_data)
                }
            } catch (err) {}

            //左边到头没有数据判断
            try {
                //console.log( "left_no_dataa judge" )
                //console.log( this.left_end_map )
                var left_no_dataa_judge = this.left_end_map[symbol + resolution];
                if (typeof (left_no_dataa_judge) != "undefined" && to < left_no_dataa_judge["left_no_data"]) {
                    //console.log("left no data return zero data")
                    callback && callback({
                        s: 'no_data'
                    })
                    return
                    //console.log("left no data return zero dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
                }
            } catch (err) {}

            //console.log( "newBars" );
            //console.log( newBars );
            if (count > 0) {
                newBars.sort((l, r) => l.time > r.time ? 1 : -1)
                //console.log( "fetchCacheData callbackkkkkk" )
                //console.log( { s: 'ok', bars: newBars } )
                callback && callback({
                    s: 'ok',
                    bars: newBars
                })
            } else {
                //console.log( "fetchCacheData count0000000000000000000000000" )
                if (this.data_record_map[id_key] == "no_data") {
                    //console.log("fetchCacheData send no data")
                    callback && callback({
                        s: 'no_data'
                    })
                }
                if (!isNaN(fromMs)) {
                    requestData()
                }
            }
            const params = {
                resolution: resolution,
                symbol: symbol,
                type: 'updata',
                from: from,
                to: to
            }
            //console.log( "fetchCacheData" );
            //console.log( params );
            Io.subscribeKline(params, this.onUpdateData.bind(this))
        }
        // 请求数据
        const requestData = list => {
            //console.log("requestData getBarTimerrrrrrrrrrrrrrrrrrrrrrrr")
            const params = {
                resolution: resolution,
                symbol: symbol,
                type: 'kline',
                from: from,
                to: to
            }
            //console.log( "requestData" );
            //console.log( params );
            Io.subscribeKline(params, this.onUpdateData.bind(this))

            this.getBarTimer = setTimeout(() => {
                this.getBars(symbol, resolution, from, to, callback)
            }, 300)
        }

        if (typeof (data) == "object" && data.length == 0) {
            var id_key = symbol + from + to;
            if (id_key in this.data_record_map) {
                if (new Date() - this.data_record_map[id_key] > this.fetch_time_interval) {
                    data = [];
                    this.data_record_map[id_key] = "no_data";
                } else {
                    data = undefined
                }
            } else {
                this.data_record_map[id_key] = new Date()
                data = undefined
            }
        }

        data ? fetchCacheData(data) : requestData()

    },

    getBars_update: function (symbol, resolution, from, to, callback) {
        const params = {
            resolution: resolution,
            symbol: symbol,
            type: 'kline',
            from: from,
            to: to
        }
        var data = Io.fetch_update_data(params, callback)
        callback && callback({
            s: 'ok',
            bars: data
        })
    },

    getConfig: function () {
        return {

        }
    },

    getServerTime: function () {
        return parseInt(Date.now() / 1000)
    },

    resolveTVSymbol: function (symbol) {
        return {
            'name': symbol,
            'exchange-traded': '',
            'exchange-listed': '',
            'timezone': 'Asia/Shanghai',
            'minmov': 1,
            'minmov2': 0,
            'pointvalue': 1,
            'fractional': false,
            'session': '24x7',
            'has_intraday': true,
            'has_no_volume': false,
            'description': symbol,
            'pricescale': symbol.indexOf("CFFEX.T") > -1 ? 1000 : 100,
            'ticker': symbol,
            'supported_resolutions': ['1', '5', '15', '30', '60', '1D', '2D', '3D', '1W', '1M']
        }
    },

    onUpdateData: function (data) {
        //console.log("onUpdateData");
        //console.log( data );
        if (!data.kline) {
            return false
        }
        if (!this.dataCache[data.symbol]) {
            this.dataCache[data.symbol] = {}
            this.data_cache_time_map[data.symbol] = {}
        }
        if (!this.dataCache[data.symbol][data.resolution]) {
            this.dataCache[data.symbol][data.resolution] = []
            this.data_cache_time_map[data.symbol][data.resolution] = {}
        }
        if (data.kline.length) {
            //console.log("onUpdateData");
            //console.log( data.kline );
            //console.log( this.dataCache );
            data.kline.forEach(elm => {
                var datetime_temp = elm.time;
                if (!(datetime_temp in this.data_cache_time_map[data.symbol][data.resolution])) {
                    this.dataCache[data.symbol][data.resolution].push(elm);
                    this.data_cache_time_map[data.symbol][data.resolution][datetime_temp] = 1;
                }
            })
        } else {
            if ("nextTime" in data) {
                //console.log( "nextTimeeeeeeeeeeeeeeeeeeeeeeee" )
                if (!(data.symbol in this.skip_period_map)) {
                    this.skip_period_map[data.symbol + data.resolution] = {};
                }
                this.skip_period_map[data.symbol + data.resolution][data.from + "-" + data.to] = {
                    "s": "no_data",
                    "nextTime": data.nextTime * 1000
                }
            } else if ("left_no_data" in data) {
                //console.log( "left_no_dataaaaaaaaaaaaaaaaaaaaa" )
                this.left_end_map[data.symbol + data.resolution] = {
                    "s": "no_data",
                    "left_no_data": data.left_no_data
                };
            }
        }
    }
}
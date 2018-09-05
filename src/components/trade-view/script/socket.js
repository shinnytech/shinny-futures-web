const delay = timeout => {
    return new Promise(resolve => {
        window.setTimeout(resolve, timeout);
    });
};


const Io = {
  //ws: null,

  time_map : {},
  kline_id_map : {},

  init: function (tq_obj) {
    //const BrowserWebSocket = window.WebSocket || window.MozWebSocket
    //this.ws = new BrowserWebSocket('ws://localhost:3010')
    //this.ws = new BrowserWebSocket('ws://0.0.0.0:7777')

    this.TQ = tq_obj;
    this.ws = this.TQ.ws;
    this.resolution_map = {"1":60, "5":300, "15":900, "30":1800, "60":3600, "1D":86400};
  },

  init_symbol_data: function (symbol, dur_nano, view_width) {
      this.send_kline_request( symbol, dur_nano, -1, view_width );
  },

  has_key: function (dict_map, key){
      return !!dict_map[key];
  },

  // sleep: function (ms) {
  //     return new Promise(resolve => setTimeout(resolve, ms));
  // },


  sleep: function (d){
      for(var t = Date.now();Date.now() - t <= d;);
  },

  judge_data_complete: function (symbol, dur_nano, left_kline_id, view_width){
    try{
        if( typeof( this.TQ.dm.datas.klines[symbol][dur_nano]["data"] ) == "undefined" )
            return false;
    }
    catch(err){
        return false;
    }

      var judge_data = this.TQ.dm.datas.klines[symbol][dur_nano]["data"];
      if( judge_data.length == 0 ){
          return false;
      }

      var symbol_map_data = this.time_map[symbol+dur_nano]
      if( typeof(symbol_map_data) == "undefined" )
          this.time_map[symbol+dur_nano] = {}
          var symbol_map_data = {}

      var judge_start_pos = left_kline_id;
      if( left_kline_id == -1 ){
          var last_id = this.TQ.dm.datas.klines[symbol][dur_nano].last_id
          if( typeof(last_id)=="undefined" ){
              return false;
          }
          judge_start_pos = last_id - view_width + 1;
      }
      console.log("judge_start_pos:"+" "+judge_start_pos)

      if( judge_start_pos>0 ) {//TODO 应该更仔细地去判断是>还是>=，细节问题
        for (var i = 0; i < view_width; i++) {
          var id_temp = judge_start_pos + i;
          if (this.has_key(symbol_map_data, id_temp))
            continue;
          if (this.has_key(judge_data, id_temp)) {
            symbol_map_data[id_temp] = judge_data[id_temp].datetime;
          }
          else {
            console.log("judge_data_complete leak data")
            console.log(id_temp)
            return false;
          }
        }
      }
      else{
        for (var i = 0; i <=last_id; i++) {
          var id_temp = i;
          if (this.has_key(symbol_map_data, id_temp))
            continue;
          if (this.has_key(judge_data, id_temp)) {
            symbol_map_data[id_temp] = judge_data[id_temp].datetime;
          }
          else {
            console.log("judge_data_complete leak data")
            console.log(id_temp)
            return false;
          }
        }
      }

      var left_id = this.TQ.dm.datas.klines[symbol][dur_nano].left_id
      var last_id = this.TQ.dm.datas.klines[symbol][dur_nano].last_id

      if( judge_data[left_id]===undefined || judge_data[last_id]===undefined )
          return false;

      this.kline_id_map[symbol+dur_nano] = {"left_id":left_id,"left_id_datetime":judge_data[left_id]["datetime"]/1000000000,
                                               "last_id":last_id,"last_id_datetime":judge_data[last_id]["datetime"]/1000000000,};

      // if( typeof( this.TQ.dm.datas.klines[symbol][dur_nano]["data"][left_kline_id] ) != "undefined" )
      //     return true;
      return true;
  },

  request_kline_period: function( symbol, dur_nano, left_kline_id, view_width ) {
      this.send_kline_request( symbol, dur_nano, left_kline_id, view_width );

      console.log("request_kline_period");
      //console.log(this.TQ.dm.datas.klines);
      var UPDATE_result = this.judge_data_complete(symbol, dur_nano, left_kline_id, view_width);
      console.log(UPDATE_result);

      return UPDATE_result;
  },

  send_kline_request: function ( symbol, dur_nano, left_kline_id, view_width ){
      if( left_kline_id == -1 ){
          this.ws.send_json( {
            "aid": "set_chart",
            "chart_id": "abcd123",
            "ins_list": symbol,
            "duration": dur_nano,
            "view_width":view_width,
          } );
      }
      else{
          this.ws.send_json( {
            "aid": "set_chart",
            "chart_id": "abcd123",
            "ins_list": symbol,
            "duration": dur_nano,
            "view_width":view_width,
            "left_kline_id":left_kline_id,
          } );
      }



      //let ks = TQ.dm.get_kline_serial( symbol, dur_nano );
      //return ks.d;
  },

  process_kline_data: function (symbol, dur_nano, left_kline_id, view_width){
      var kline_data = this.TQ.dm.datas.klines[symbol][dur_nano]["data"]

      var judge_start_pos = left_kline_id;
      if( left_kline_id == -1 ){
        var last_id = this.TQ.dm.datas.klines[symbol][dur_nano].last_id
        if( typeof(last_id)=="undefined" ){
          return false;
        }
        judge_start_pos = last_id - view_width + 1;
      }

      var pos_temp = judge_start_pos;
      var data_temp = kline_data[pos_temp];
      let return_data = [];

      for(var i=0;i<view_width;i++){
          if( typeof(data_temp) == "undefined" )
              continue

          return_data.push({"time":data_temp.datetime / 1000000,"open":data_temp.open,"close":data_temp.close,"low":data_temp.low,"high":data_temp.high,"volume":data_temp.volume})
          pos_temp += 1;
          data_temp = kline_data[pos_temp]
      }

      return {"kline":return_data};
  },

  process_kline_data_from_to: function (symbol, dur_nano, from, to){
    var kline_data = this.TQ.dm.datas.klines[symbol][dur_nano]["data"]

    var left_id_datetime = this.kline_id_map[symbol+dur_nano]["left_id_datetime"]
    var last_id_datetime = this.kline_id_map[symbol+dur_nano]["last_id_datetime"]
    var left_id = this.kline_id_map[symbol+dur_nano]["left_id"]
    var last_id = this.kline_id_map[symbol+dur_nano]["last_id"]

      console.log( "left_id:"+left_id+" to:"+to+" left_id_datetime:"+left_id_datetime )
      if( left_id==0 && to<left_id_datetime ){
          return {"kline":[], "left_no_data":left_id_datetime};
      }

    if( (from-left_id_datetime)/(last_id_datetime-left_id_datetime)<0.5 )
        var direction = "left"
    else
        var direction = "right"
    console.log( "process_kline_data_from_to" )
    console.log( from +" "+to+" "+ left_id_datetime +" "+ last_id_datetime )
    console.log( direction )
    var return_data = [];

    var last_lagerest_left_date = undefined;
    if( direction == "left" ){
      for(var pos_temp=left_id;pos_temp<=last_id;pos_temp++){
        var data_temp = kline_data[pos_temp];
        if( typeof(data_temp)=="undefined" )
            continue
        var date_temp = data_temp.datetime / 1000000;
        var date_judge_temp = data_temp.datetime / 1000000000;
        // console.log( date_judge_temp );
        // console.log( (date_judge_temp>=from)&&(date_judge_temp<=to) );
          if( date_judge_temp<from )
              last_lagerest_left_date = date_judge_temp
          else if( (date_judge_temp>=from)&&(date_judge_temp<=to) )
              return_data.push({"time":date_temp,"open":data_temp.open,"close":data_temp.close,"low":data_temp.low,"high":data_temp.high,"volume":data_temp.volume})
          else if( date_judge_temp>to )
              break
      }
    }
    else{
      for(var pos_temp=last_id;pos_temp>=left_id;pos_temp--){
        var data_temp = kline_data[pos_temp];
        if( typeof(data_temp)=="undefined" )
          continue
        var date_temp = data_temp.datetime / 1000000;
        var date_judge_temp = data_temp.datetime / 1000000000;
        // console.log( date_judge_temp );
        // console.log( (date_judge_temp>=from)&&(date_judge_temp<=to) );
        if( (date_judge_temp>=from)&&(date_judge_temp<=to) )
            return_data.push({"time":date_temp,"open":data_temp.open,"close":data_temp.close,"low":data_temp.low,"high":data_temp.high,"volume":data_temp.volume})
        else if( date_judge_temp<from ){
            last_lagerest_left_date = date_judge_temp;
            break;
        }
      }
    }

    if( return_data.length==0 && typeof(last_lagerest_left_date)!="undefined" )//TODO:这边逻辑有小问题，关于每时刻右边动态刷新的逻辑判断
        return {"kline":return_data, "nextTime":last_lagerest_left_date, "from":from,"to":to};
    else
        return {"kline":return_data};
  },

  calc_left_kline_id : function(symbol, dur_nano, time_from, time_to ){
      console.log( "kline_id_mappppppppppppppppppppppppppppp" );
      console.log( this.kline_id_map );
      console.log( dur_nano );
      console.log( time_from );
      console.log( time_to );

      if( !this.has_key(this.kline_id_map,symbol+dur_nano) ){
        return {"left_kline_id":-1,"view_width":200}
      }

      var left_id_datetime = this.kline_id_map[symbol+dur_nano]["left_id_datetime"]
      var left_id = this.kline_id_map[symbol+dur_nano]["left_id"]
      if( time_from<left_id_datetime ){
          var sub_value = Math.ceil( (left_id_datetime-time_from)/dur_nano*1000000000 )

          return {"left_kline_id":Math.max(left_id-sub_value,0),"view_width":sub_value}
      }
      else{
          return {"left_kline_id":left_id,"view_width":1}
      }
  },

  subscribeKline: function (params, callback) {

    // if (this.ws === null) {
    //   this.init(null)
    // }
    //
    // if (this.ws.readyState) {
    //   this.ws.send(JSON.stringify(params))
    // } else {
    //   this.ws.onopen = evt => {
    //     this.ws.send(JSON.stringify(params))
    //   }
    // }
    // this.ws.onmessage = e => {
    //   console.log( TQ );
    //   if( typeof( e.data["ping"] ) != "undefined" )
    //     console.log( e.data );
    //   callback(JSON.parse(e.data))
    // }

    console.log( JSON.stringify(params) );

    // var symbol        = "SHFE.cu1809";
    // var dur_nano      = 3600*24*1000*1000*1000;
    // var left_kline_id = 100;
    // var view_width    = 50;

    var resolution = params["resolution"]
    var symbol     = params["symbol"]
    var type       = params["type"]
    var from       = params["from"]
    var to         = params["to"]

    var dur_nano = this.resolution_map[resolution]*1000000000

    var calc_left_kline_id_result = this.calc_left_kline_id(symbol, dur_nano, from, to )
    console.log( calc_left_kline_id_result );
    var left_kline_id = calc_left_kline_id_result["left_kline_id"];
    var view_width    = calc_left_kline_id_result["view_width"];

    var request_result = this.request_kline_period(symbol, dur_nano, left_kline_id, view_width)

    if( request_result ){
        console.log( 'request_kline_period finished' )
        //console.log( symbol + "  " + dur_nano + "  " + left_kline_id + "  " + view_width )
        //console.log( this.process_kline_data(symbol, dur_nano, left_kline_id, view_width) )

        //var kline_data = this.process_kline_data(symbol, dur_nano, left_kline_id, view_width);
        var kline_data = this.process_kline_data_from_to(symbol, dur_nano, from, to);
    }
    else{
        var kline_data = {"kline":[]};
    }

    //var kline_data = this.process_kline_data(symbol, dur_nano, left_kline_id, view_width)
    kline_data.symbol      = params["symbol"]
    kline_data.resolution = params["resolution"]
    kline_data.type        = params["type"]

    console.log( 11111111111111 );
    console.log( kline_data );
    callback( kline_data );
    //return kline_data;

  },

    fetch_update_data: function (params, callback) {
        var resolution = params["resolution"]
        var symbol     = params["symbol"]

        var dur_nano = this.resolution_map[resolution]*1000000000
        var kline_data = this.TQ.dm.datas.klines[symbol][dur_nano]
        var last_id = kline_data.last_id

        this.send_kline_request( symbol, dur_nano, -1, 2 );
        var UPDATE_result = this.judge_data_complete(symbol, dur_nano, last_id-1, 2);
        console.log( "update_data_complete_result : "+UPDATE_result );

        if( UPDATE_result ){
            //var kline_data = this.process_kline_data(symbol, dur_nano, left_kline_id, view_width);
            var return_data = [];
            for( var pos_temp=last_id-1;pos_temp<=last_id;pos_temp++ ){
                var data_temp = kline_data.data[pos_temp];
                if( typeof(data_temp)=="undefined" )
                    continue
                var date_temp = data_temp.datetime / 1000000;
                var date_judge_temp = data_temp.datetime / 1000000000;
                return_data.push({"time":date_temp,"open":data_temp.open,"close":data_temp.close,"low":data_temp.low,"high":data_temp.high,"volume":data_temp.volume})
            }
        }
        else{
            var return_data = [];
        }

        console.log( "update_data_complete_return_data : " )
        console.log( return_data )
        //return {"kline":return_data};
        return return_data;
    },
}
export default Io

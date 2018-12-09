import store from '@/store/index'
import BaseModule from './BaseModule'
const Order = BaseModule({ 
  //order_id, 用于唯一标识一个委托单. 对于一个USER, order_id 是永远不重复的
  //委托单初始属性(由下单者在下单前确定, 不再改变)
  "user_id": "",                      //用户ID
  "order_id": "",                        //委托单ID, 对于一个USER, order_id 是永远不重复的
  "exchange_id": "",                    //交易所
  "instrument_id": "",                //在交易所中的合约代码
  "direction": "",                       //下单方向
  "offset": "",                         //开平标志
  "volume_orign": 0,                        //总报单手数
  "price_type": "",                    //指令类型 ["LIMIT", "ANY"]
  "limit_price": 0,                     //委托价格, 仅当 price_type = LIMIT 时有效
  "time_condition": "",                  //时间条件 ["GTD"]
  "volume_condition": "",                //数量条件 ["ANY"]
  //下单后获得的信息(由期货公司返回, 不会改变)
  "insert_date_time": 0,        //下单时间, epoch nano
  "exchange_order_id": "",            //交易所单号
  //委托单当前状态
  "status": "",                        //委托单状态, ALIVE=有效, FINISHED=已完
  "volume_left": 0,                         //未成交手数
  "frozen_margin": 0,                  //冻结保证金
  "last_msg": "",                           //提示信息
  //内部序号
  "seqno": 0
})

export default {
  namespaced: true,
  state: {
    OrdersList: [],
  },
  mutations: {
    UPDATE_ORDERS: (state, payload) => {
      for (let id in payload) {
        if (!state[id]) {
          store.registerModule(['orders', id], Order)
          state.OrdersList.push(id)
        } 
        store.commit('orders/' + id + '/UPDATE', payload[id])
      }
    }
  },
  actions: {},
  getters: {
    GET_ORDERS: (state) => {
      let result = []
      for (let i = 0; i < state.OrdersList.length; i++) {
        result.push(state[state.OrdersList[i]])
      }
      return result
    }
  }
}

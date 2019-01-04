
const cart = {
  _wheels: 4,

  get wheels () {
    return this._wheels;
  },

  set wheels (value) {
    if (value < this._wheels) {
      throw new Error('数值太小了！');
    }
    this._wheels += value;
  }
}

console.log(cart)

let a = new Object(cart)
console.log(a, a.wheels, a._wheels)
a.wheels = 6
console.log(a, a.wheels, a._wheels)
console.log(cart.wheels === a.wheels, cart._wheels === a._wheels)

import GenPrototype from './datastructure'

const MakeArrayProxy = function (data_array, parent_target, item_func = undefined) {
  let handler = {
    get: function (target, prop, receiver) {
      if (!isNaN(prop)) {
        let i = Number(prop);
        if (i < 0)
          return NaN;
        if (item_func)
          return item_func(target[i]);
        else
          return target[i];
      } else if (prop in ['last_id', 'trading_day_start_id', 'trading_day_end_id']) {
        return parent_target[prop];
      } else {
        return target[prop];
      }
    }
  }
  return new Proxy(data_array, handler);
}

class DataManager {
  constructor (options = {}) {
    this._data = {
      quotes: {},
      klines: {},
      ticks: {},
      charts: {}
    }
    this._epoch = 0 // 数据版本控制
  }

  getByPath (_path) {
    let path = unifyArrayStyle(_path)
    let d = this._data
    let i = 0
    for (; i < path.length; i++) {
      d = d[path[i]]
      if (d === undefined) break
    }
    if (i < path.length - 1) return {}
    return d
  }

  asyncGetByPath (_path, cb) {
    let d = this.getByPath(_path)
    cb(d)
  }

  getQuote (symbol) {
    if (!this._data.quotes[symbol]) {
      this._data.quotes[symbol] = GenPrototype('quote')
    }
    return this._data.quotes[symbol]
  }

  getKlines (symbol, dur_nano) {
    let ks = this.set_default({last_id: -1, data: []}, "klines", symbol, dur_nano)
    if (!ks.proxy) {
      ks.proxy = MakeArrayProxy(ks.data, ks)
      let arr = ['open', 'close', 'high', 'low', 'volume', 'close_oi', 'open_oi', 'datetime']
      arr.forEach(key => {
        ks.data[key] = MakeArrayProxy(ks.data, ks, d => d ? d[key] : NaN)
      })
    }
    return ks.proxy
  }

  set_default (_default, ...pathArr){
    let parent = this._data
    let child = this._data[pathArr[0]]
    let i = 0
    for (; i < pathArr.length; i++) {
      child = parent[pathArr[i]]
      if (child === undefined){
        parent[pathArr[i]] = i === pathArr.length - 1 ? _default : {[pathArr[i]]: {}}
        child = parent[pathArr[i]]
      }
    }
    return child
  }

  // get_kline_serial(symbol, dur_nano) {
  //   let ks = this.set_default({last_id: -1, data:[]}, "klines", symbol, dur_nano);
  //   if (!ks.proxy){
  //     ks.proxy = make_array_proxy(ks.data, ks);
  //     ks.proxy.open = make_array_proxy(ks.data, ks, k => k?k.open:undefined);
  //     ks.proxy.high = make_array_proxy(ks.data, ks, k => k?k.high:undefined);
  //     ks.proxy.low = make_array_proxy(ks.data, ks, k => k?k.low:undefined);
  //     ks.proxy.close = make_array_proxy(ks.data, ks, k => k?k.close:undefined);
  //     ks.proxy.volume = make_array_proxy(ks.data, ks, k => k?k.volume:undefined);
  //     ks.proxy.close_oi = make_array_proxy(ks.data, ks, k => k?k.close_oi:undefined);
  //     ks.proxy.open_oi = make_array_proxy(ks.data, ks, k => k?k.open_oi:undefined);
  //   }
  //   return ks;
  // }

  getTicks (symbol, dur) {
    if (!this._data.ticks[symbol]) {
      this._data.ticks[symbol] = {
        last_id: -1,
        data: []
      }
    }
    return this._data.klines[symbol][dur]
  }

  mergeData (source, epochIncrease = true, deleteNullObj = true) {
    if (epochIncrease) this._epoch += 1
    if (Array.isArray(source)) {
      for (let i in source) {
        // 过滤掉空对象
        if (Object.keys(source[i]).length > 0) {
          DataManager.mergeObject(this._data, source[i], this._epoch, deleteNullObj)
        }
      }
    } else {
      DataManager.mergeObject(this._data, source, this._epoch, deleteNullObj)
    }

    for (let path in this.handlers) {
      let _path = unifyArrayStyle(path)
      let isChanged = this.isChanging(_path, source)
      if (isChanged) {
        this.fire(path, this.getByPath(_path))
      }
    }
  }

  isChanging (_path, source) {
    let path = unifyArrayStyle(_path)
    // _data 中，只能找到对象类型中记录的 _epoch
    let d = this._data
    for (let i = 0; i < path.length; i++) {
      d = d[path[i]]
      if (d === undefined) return false
    }
    if (typeof d === 'object') {
      return d._epoch && d._epoch === this._epoch ? true : false
    }
    if (source) {
      // 在 source 中找，找到能找到的数据
      let d = source
      for (let i = 0; i < path.length; i++) {
        d = d[path[i]]
        if (d === undefined) return false
      }
      return true
    }
    return false
  }

  subscribe (path, fn) {
    this.addEventListener(path, fn)
  }

  unsubscribe (path, fn) {
    this.removeEventListener(path, fn)
  }

  // 静态方法
  static mergeObject (target, source, _epoch = 0, deleteNullObj = true) {
    for (let property in source) {
      let value = source[property]
      switch (typeof value) {
        case 'object':
          if (value === null) {
            // 服务器 要求 删除对象
            if (deleteNullObj && property) delete target[property]
            continue
          } else if (Array.isArray(value) || property === 'data') {
            //@note: 这里做了一个特例, 使得K线序列数据被保存为一个array, 而非object, 并且记录整个array首个有效记录的id
            if (!(property in target)) target[property] = []
            // @note: 后面使用 GET_KLINE 返回的是 target.data 的 proxy，这样可以方便取得 last_id target 不是每次都有 last_id
            // if (target.last_id) target['data']['last_id'] = target.last_id
          } else {
            if (!(property in target)) target[property] = {}
          }
          if (property === 'quotes') {
            // 不删除 quotes 下的对象
            DataManager.mergeObject(target[property], value, _epoch, false)
          } else {
            DataManager.mergeObject(target[property], value, _epoch, deleteNullObj)
          }
          break
        case 'string':
        case 'boolean':
        case 'number':
          target[property] = value === 'NaN' ? NaN : value
          break
        case 'undefined':
          break
      }
    }
    // _epoch 不应该被循环到的 key
    if (!target['_epoch']) Object.defineProperty(target, '_epoch', {
      configurable: false,
      enumerable: false,
      writable: true
    })
    target['_epoch'] = _epoch
  }

}

function unifyArrayStyle (path) {
  if (!(path instanceof Array)) path = path.split('/')
  return path.filter(x => x !== '')
}

let dm = new DataManager()

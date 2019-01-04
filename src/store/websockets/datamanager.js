import EventTarget from './event'
import GenPrototype from './datastructure'

const MakeArrayProxy = function (data_array, parent_target, item_func = undefined) {
  let handler = {
    get: function (target, prop, receiver) {
      if (!isNaN(prop)) {
        let i = Number(prop)
        return i < 0 ? NaN : (item_func ? item_func(target[i]) : target[i])
      } else if (['last_id', 'trading_day_start_id', 'trading_day_end_id'].includes(prop)) {
        return parent_target[prop]
      } else {
        return target[prop]
      }
    }
  }
  return new Proxy(data_array, handler)
}

const MergeObject = function (target, source, _epoch = 0, deleteNullObj = true) {
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
          MergeObject(target[property], value, _epoch, false)
        } else {
          MergeObject(target[property], value, _epoch, deleteNullObj)
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

export default class DataManager extends EventTarget {
  constructor (options = {}) {
    super()
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

  getAccount (user_id) {
    return this.set_default('account', 'trade', user_id)
  }

  getQuote (symbol) {
    return this.set_default('quote', 'quotes', symbol)
  }

  getQuoteAsync (symbol) {
    return new Promise((resolve, reject) => {
      let quote = this.set_default('quote', 'quotes', symbol)
      if (quote.instrument_id === symbol) {
        resolve(quote)
      } else {
        reject()
      }
    })
  }

  getKlines (symbol, dur_nano) {
    let ks = this.set_default({last_id: -1, data: []}, 'klines', symbol, dur_nano)
    let ksData = this.set_default([], 'klines', symbol, dur_nano, 'data')
    if (!ks.proxy) {
      ks.proxy = MakeArrayProxy(ksData, ks)
      let arr = ['open', 'close', 'high', 'low', 'volume', 'close_oi', 'open_oi', 'datetime']
      arr.forEach(key => {
        ks.data[key] = MakeArrayProxy(ksData, ks, d => d ? d[key] : NaN)
      })
    }
    return ks.proxy
  }

  getTicks (symbol) {
    let ts = this.set_default({last_id: -1, data: []}, 'ticks', symbol)
    if (!ts.proxy) {
      ts.proxy = MakeArrayProxy(ts.data, ts)
      let arr = ['last_price', 'average', 'highest', 'lowest', 'ask_price1', 'ask_volume1', 'bid_price1',
        'bid_volume1', 'volume', 'amount', 'open_interest', 'datetime']
      arr.forEach(key => {
        ts.data[key] = MakeArrayProxy(ts.data, ts, d => d ? d[key] : NaN)
      })
    }
    return ts.proxy
  }

  set_default (default_value, ...path) {
    let node = typeof path[0] === 'object' ? path[0] : this._data
    for (let i = 0; i < path.length; i++) {
      if (typeof path[i] === 'string' || typeof path[i] === 'number') {
        if (!(path[i] in node)) {
          if (i + 1 === path.length) {
            default_value = typeof default_value === 'string' ? GenPrototype(default_value) : default_value
            node[path[i]] = default_value
          } else {
            node[path[i]] = {}
          }
        }
        node = node[path[i]]
      }
    }
    return node
  }

  mergeData (source, epochIncrease = true, deleteNullObj = true) {
    if (epochIncrease) this._epoch += 1
    if (Array.isArray(source)) {
      for (let i in source) {
        // 过滤掉空对象
        if (Object.keys(source[i]).length > 0) {
          MergeObject(this._data, source[i], this._epoch, deleteNullObj)
        }
      }
    } else {
      MergeObject(this._data, source, this._epoch, deleteNullObj)
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
}

function unifyArrayStyle (path) {
  if (!(path instanceof Array)) path = path.split('/')
  return path.filter(x => x !== '')
}


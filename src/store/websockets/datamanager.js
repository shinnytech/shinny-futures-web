import EventTarget from './event'

export default class DataManager extends EventTarget {
  constructor (options = {}) {
    super()
    this._data = {}
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

  mergeData (source, epochIncrease=true, deleteNullObj=true) {
    if (epochIncrease) this._epoch += 1
    if (Array.isArray(source)){
      for (let i in source) {
        // 过滤掉空对象
        if ( Object.keys(source[i]).length > 0 ){
          DataManager.mergeObject(this._data, source[i], this._epoch, deleteNullObj)
        }
      }
    } else {
      DataManager.mergeObject(this._data, source, this._epoch, deleteNullObj)
    }

    for (var path in this.handlers) {
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
    if (typeof d === 'object'){
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
  static mergeObject(target, source, _epoch=0, deleteNullObj=true) {
    for (let property in source) {
      let value = source[property]
      switch (typeof value) {
        case 'object':
          if (value === null) {
            // 服务器 要求 删除对象
            if (deleteNullObj) delete target[property]
            continue
          } else if (Array.isArray(value) || property === "data") {
            //@note: 这里做了一个特例, 使得K线序列数据被保存为一个array, 而非object, 并且记录整个array首个有效记录的id
            if (!(property in target)) target[property] = []
            // @note: 后面使用 GET_KLINE 返回的是 target.data 的 proxy，这样可以方便取得 last_id target 不是每次都有 last_id
            // if (target.last_id) target['data']['last_id'] = target.last_id
          } else {
            if (!(property in target)) target[property] = {}
          }
          DataManager.mergeObject(target[property], value, _epoch, deleteNullObj);
          break;
        case 'string':
        case 'boolean':
        case 'number':
          target[property] = value === 'NaN' ? NaN : value;
          break;
        case 'undefined':
          break;
      }
    }
    // _epoch 不应该被循环到的 key
    if(!target['_epoch']) Object.defineProperty(target, "_epoch", {
        configurable: false,
        enumerable: false,
        writable: true
    })
    target['_epoch'] = _epoch
  }

}

function unifyArrayStyle (path) {
  if (!(path instanceof Array)) path = path.split('/')
  return path.filter(x => x!=='')
}


/* eslint-disable no-eval */
/**
 * todo: 限定最大重连次数；在一组 urls 中切换 url
 */

import EventTarget from './event'

/**
 * events = ['message', 'open', 'reconnect', 'close', 'error']
 *
 * let ws = new TqWebsocket(url)
 * ws.addEventListener('message', (data) => {......})
 * ws.send([obj])
 * ws.send([string])
 * ws.init()
 */

export default class TqWebsocket extends EventTarget {
  constructor (url) {
    super()
    if (url instanceof Array) {
      this.urlList = url
      this.url = url[0]
    } else {
      this.urlList = [url]
      this.url = url
    }

    this.ws = null
    this.queue = []

    // 自动重连开关
    this.reconnect = true
    this.reconnectTask = null
    this.reconnectInterval = 3000
    this.reconnectMaxTimes = 5
    this.reconnectTimes = 0
    this.reconnectUrlIndex = 0

    this.STATUS = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    }
    this.init()
  }

  // string or object
  send (obj) {
    let objToJson = typeof obj === 'string' ? obj : JSON.stringify(obj)
    if (this.isReady()) {
      this.ws.send(objToJson)
    } else {
      this.queue.push(objToJson)
    }
  }

  isReady () {
    return this.ws.readyState === this.STATUS.OPEN
  }

  init () {
    this.ws = new WebSocket(this.url)
    var _this = this
    this.ws.onmessage = function (message) {
      let data = eval('(' + message.data + ')')
      _this.fire('message', data)
      // _this.ws.send('{"aid":"peek_message"}')
    }

    this.ws.onclose = function (event) {
      _this.fire('close')
      // 清空 queue
      _this.queue = []
      // 自动重连
      if (_this.reconnect) {
        _this.reconnectTask = setInterval(function () {
          if (_this.ws.readyState === 3) _this.init()
        }, _this.reconnectInterval)
      }
    }

    this.ws.onerror = error => {
      console.error(error)
      _this.fire('error')
      _this.ws.close()
    }

    this.ws.onopen = function () {
      _this.fire('open')
      if (this.reconnectTask) {
        clearInterval(_this.reconnectTask)
        _this.fire('reconnect')
      }
      while (_this.queue.length > 0) {
        if (_this.ws.readyState === 1) _this.ws.send(_this.queue.shift())
        else break
      }
    }
  }
}

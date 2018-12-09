export default class EventTarget {
  constructor () {
    this.handlers = {}
  }

  addEventListener (eventType, handler) {
    // 用 void 0 代替 undefined
    if (this.handlers[eventType] === void 0) this.handlers[eventType] = []
    this.handlers[eventType].push(handler)
  }

  removeEventListener (eventType, handler) {
    if (this.handlers[eventType] instanceof Array) {
      let handlers = this.handlers[eventType]
      for (let i = 0; i < handlers.length; i++) {
        if (handlers[i] === handler) {
          this.handlers[eventType].splice(i, 1)
          break
        }
      }
      if (this.handlers[eventType].length === 0) {
        delete this.handlers[eventType]
      }
    }
  }

  fire (eventType, payload) {
    if (this.handlers[eventType] instanceof Array) {
      let handlers = this.handlers[eventType]
      for (let i = 0; i < handlers.length; i++) {
        handlers[i](payload)
      }
    }
  }
}

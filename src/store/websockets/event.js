export default class EventTarget {
	constructor() {
		this.handlers = {}
		this.on = this.addEventListener
		this.emit = this.fire
		this.off = this.removeEventListener
	}

	addEventListener(eventType, handler) {
		EventTarget.ToArray(eventType).forEach((item) => {
			(this.handlers[item] || (this.handlers[item] = [])).push(handler)
		});
	}

	removeEventListener(eventType, handler) {
		EventTarget.ToArray(eventType).forEach((item) => {
			if (this.handlers[item] instanceof Array) {
				let handlers = this.handlers[item]
				for (let i = 0; i < handlers.length; i++) {
					if (handlers[i] === handler) {
						this.handlers[item].splice(i, 1)
						break
					}
				}
				if (this.handlers[item].length === 0) {
					delete this.handlers[item]
				}
			}
		})
	}

	fire(eventType, payload) {
		if (this.handlers[eventType] instanceof Array) {
			let handlers = this.handlers[eventType]
			for (let i = 0; i < handlers.length; i++) {
				handlers[i](payload)
			}
		}
	}

	static ToArray(a) {
		return Array.isArray(a) ? a : [a]
	}
}

/**
 * This provides methods used for event handling. It's not meant to
 * be used directly, except as a provider of related methods.
 *
 * @mixin
 */
const EventMixin = {
  /**
   * Subscribe to an event.
   *
   * @param {string} eventNames
   * @param {function} handler
   */
  on (eventNames, handler) {
    if (!this._eventHandlers) this._eventHandlers = {}
    eventNames.split(' ').forEach(eventName => {
      if (!this._eventHandlers[eventName]) {
        this._eventHandlers[eventName] = []
      }
      this._eventHandlers[eventName].push(handler)
    })
    return this
  },

  /**
   * Remove an event subscription.
   *
   * @param {string} eventNames
   * @param {function} handler
   */
  off (eventNames, handler) {
    eventNames.split(' ').forEach(eventName => {
      const handlers = this._eventHandlers && this._eventHandlers[eventName]
      if (!handlers) return
      for (let i = 0; i < handlers.length; i++) {
        if (handlers[i] === handler) {
          handlers.splice(i--, 1)
        }
      }
    })
  },

  /**
   * Emit an event.
   *
   * @param {string} eventName
   * @param {...*} args

   */
  emit (eventName, ...args) {
    if (!this._eventHandlers || !this._eventHandlers[eventName]) {
      return // no handlers for that event name
    }

    // call the handlers
    this._eventHandlers[eventName].forEach(handler => handler.apply(this, args))
  },

  /**
   * Subscribe to an event and pass it through to the parent.
   *
   * @param {string} eventName
   * @param {function} handler
   */
  passThroughEvent (target, eventName) {
    target.on(eventName, (...args) => {
      // console.log('[EventMixin] Passing through: ' + eventName)
      this.emit(eventName, ...args)
    })
  },
}

export default EventMixin

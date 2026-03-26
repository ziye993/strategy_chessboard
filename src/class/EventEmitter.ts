export default class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if(Array.isArray(event)){
      event.forEach(ev=>{this.on(ev,callback)})
      return;
    }
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(events, data) {
    if (Array.isArray(events)) {
      events.forEach(event => {
        this.emit(event, data);
      });
      return
    } else {
      if (this.events[events]) {
        for (const callback of this.events[events]) {
          const flagCallback = callback(data);
          if (flagCallback) {
            break;
          }
        }
      }
    }
  }

  clear(eventlist) {
    if (Array.isArray(eventlist)) {
      eventlist.forEach(event => {
        this.clear(event);
      });
    } else {
      const event = eventlist;
      this.events[event] = null;
    }

  }
}
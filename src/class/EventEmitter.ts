type EventCallback = (data?: unknown) => unknown;

export default class EventEmitter {
  private events: Record<string, EventCallback[] | null>;

  constructor() {
    this.events = {};
  }

  on(event: string | string[], callback: EventCallback) {
    if (Array.isArray(event)) {
      event.forEach(ev => { this.on(ev, callback) })
      return;
    }
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(callback);
  }

  emit(events: string | string[], data?: unknown) {
    if (Array.isArray(events)) {
      events.forEach(event => {
        this.emit(event, data);
      });
      return
    } else {
      if (this.events[events]) {
        for (const callback of this.events[events]!) {
          const flagCallback = callback(data);
          if (flagCallback) {
            break;
          }
        }
      }
    }
  }

  clear(eventlist: string | string[]) {
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

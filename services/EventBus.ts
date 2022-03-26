class EventBus extends EventTarget {
  public on(type: string, listener: (event: Event) => void) {
    this.addEventListener(type, listener);
  }
  public off(type: string, listener: (event: Event) => void) {
    this.removeEventListener(type, listener);
  }
  public emit(type: string, data: any) {
    const customEvent = new CustomEvent(type, { detail: data });
    this.dispatchEvent(customEvent);
  }
}

export default EventBus;

import { EventTarget as EventTargetShim } from "event-target-shim";
import type { Event as EventShim } from "event-target-shim";

const eventBusNode = new EventTargetShim();

class EventBus {
  public on(type: string, listener: (event: Event) => void) {
    eventBusNode.addEventListener(type, listener);
  }
  public off(type: string, listener: (event: Event) => void) {
    eventBusNode.removeEventListener(type, listener);
  }
  public emit(type: string, data: any) {
    const customEvent = new CustomEvent(type, { detail: data });
    eventBusNode.dispatchEvent(customEvent as EventShim);
  }
}

export default EventBus;

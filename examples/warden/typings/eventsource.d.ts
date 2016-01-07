declare module "eventsource" {
    class EventSource {
        constructor(url: string);
        onmessage: Function;
        onerror: Function;
    }
}
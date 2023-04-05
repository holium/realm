// Declare @holium/eventsource as a module with types pointing to @types/eventsource.
declare module '@holium/eventsource' {
  import EventSource from 'eventsource';
  export = EventSource;
}

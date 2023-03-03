import { ShipConfig, ProtocolConfig } from '@holium/realm-room';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

declare global {
  interface Window {
    shipConfig: ShipConfig;
    protocolConfig: ProtocolConfig;
    rid: string;
  }
}

export {};

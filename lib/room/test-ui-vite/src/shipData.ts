import { ShipConfig } from '@holium/realm-room';
import shipConfigsUntyped from './ship-configs.json';

const shipConfigs: Record<string, ShipConfig> = shipConfigsUntyped;

export const getShipConfig = (patp: string) => shipConfigs[patp];

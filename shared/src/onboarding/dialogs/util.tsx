import { ReactNode } from 'react';

import { Flex } from '@holium/design-system/general';
import { ThirdEarthProduct, ThirdEarthShip } from '@holium/shared';

export const OnboardingDialogWrapper = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Flex
    className="wallpaper"
    justifyContent="center"
    alignItems="center"
    width="100%"
    height="calc(100vh - 32px)"
  >
    {children}
  </Flex>
);

export const thirdEarthMockShip: ThirdEarthShip = {
  id: 0,
  patp: '~pasren-satmex',
  ship_type: 'planet',
  product_type: 'planet',
} as any;

export const thirdEarthMockProduct: ThirdEarthProduct = {
  id: 1,
  client_id: 1,
  droplet_class_id: 1,
  is_migration: false,
  is_planet: true,
  lang_code: 'en',
  priority: 1,
  product_status: 'active',
  product_type: 'subscription',
  threshold: 0,
  comet_count: '0',
  title: 'Monthly',
  description: 'Monthly subscription',
  long_description: 'Monthly subscription',
  price_id: '11',
  subscription_price: 15,
};

export const thirdEarthMockProducts = [
  thirdEarthMockProduct,
  {
    ...thirdEarthMockProduct,
    id: 2,
    title: 'Yearly',
    description: 'Yearly subscription',
    long_description: 'Yearly subscription',
    price_id: '12',
    subscription_price: 150,
  },
];

export const mockPatps = [
  '~zod',
  '~bus',
  '~wicdev-wisryt',
  '~nidsut-tomdun',
  '~fipfep-foslup',
  '~norsyr-tomdun',
  '~lopsyp-doztun',
  '~lomder-librun',
  '~littel-wolfur',
];

export function bytesToString(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`;
}

type MaintenanceWindow = {
  weekDay: string;
  startTime: string;
  endTime: string;
};

export const maintenanceWindows: MaintenanceWindow[] = [
  {
    weekDay: 'Wednesday',
    startTime: '18:00',
    endTime: '19:00',
  },
  {
    weekDay: 'Thursday',
    startTime: '00:00',
    endTime: '01:00',
  },
  {
    weekDay: 'Thursday',
    startTime: '06:00',
    endTime: '07:00',
  },
  {
    weekDay: 'Saturday',
    startTime: '18:00',
    endTime: '19:00',
  },
  {
    weekDay: 'Sunday',
    startTime: '00:00',
    endTime: '01:00',
  },
  {
    weekDay: 'Sunday',
    startTime: '06:00',
    endTime: '07:00',
  },
];

export const maintenanceWindowToString = ({
  weekDay,
  startTime,
  endTime,
}: MaintenanceWindow) => `${weekDay} ${startTime} - ${endTime} GMT`;

import { ReactNode } from 'react';

import { Flex } from '@holium/design-system/general';
import {
  ThirdEarthPeriodicity,
  ThirdEarthPriceOption,
  ThirdEarthShip,
} from '@holium/shared';

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

export const thirdEarthMockPriceOptions: ThirdEarthPriceOption[] = [
  {
    unit: 'usd',
    description: 'monthly subscription',
    periodicity: 'month' as ThirdEarthPeriodicity,
    one_time_price: 0,
    recurring_price: 15,
    stripe_price_id: 'price_1MDqoIHhoM3uGGuYAZZN23Yr',
  },
  {
    unit: 'usd',
    description: 'yearly subscription',
    periodicity: 'year' as ThirdEarthPeriodicity,
    one_time_price: 0,
    recurring_price: 150,
    stripe_price_id: 'price_1MDqoIHhoM3uGGuY00mWc29l',
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
  time: string;
  optimizedFor: string;
};

export const maintenanceWindows: MaintenanceWindow[] = [
  {
    weekDay: 'Wednesday',
    time: '18:00',
    optimizedFor: 'Asia/Pacific',
  },
  {
    weekDay: 'Thursday',
    time: '00:00',
    optimizedFor: 'EU/Africa',
  },
  {
    weekDay: 'Thursday',
    time: '06:00',
    optimizedFor: 'Americas',
  },
  {
    weekDay: 'Saturday',
    time: '18:00',
    optimizedFor: 'Asia/Pacific',
  },
  {
    weekDay: 'Sunday',
    time: '00:00',
    optimizedFor: 'EU/Africa',
  },
  {
    weekDay: 'Sunday',
    time: '06:00',
    optimizedFor: 'Americas',
  },
];

export const displayMaintenanceWindow = (index: number) => {
  const { weekDay, time, optimizedFor } =
    maintenanceWindows[index % maintenanceWindows.length];

  return (
    <>
      <span>
        {weekDay} {time} GMT{' '}
      </span>
      <span style={{ fontWeight: 400 }}>(optimal for {optimizedFor})</span>
    </>
  );
};

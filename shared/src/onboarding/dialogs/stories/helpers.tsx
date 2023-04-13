import { ReactNode } from 'react';
import { Flex } from '@holium/design-system/general';
import { ThirdEarthProduct } from '@holium/shared';

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

const thirdEarthMockProduct: ThirdEarthProduct = {
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

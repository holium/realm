import { Flex } from '@holium/design-system/general';

import {
  ThirdEarthPeriodicity,
  ThirdEarthPriceOption,
} from '../../types/index';
import { ProductCard } from './ProductCard';

type Props = {
  priceOptions: ThirdEarthPriceOption[];
  periodicity: ThirdEarthPeriodicity;
  setPeriodicity: (periodicity: ThirdEarthPeriodicity) => void;
};

export const ProductCards = ({
  priceOptions,
  periodicity,
  setPeriodicity,
}: Props) => (
  <Flex gap={16}>
    {priceOptions.sort().map((priceOption) => {
      const isMonthly = priceOption.periodicity === ThirdEarthPeriodicity.MONTH;
      const isSelected = priceOption.periodicity === periodicity;

      return (
        <ProductCard
          key={priceOption.stripe_price_id}
          h2Text={`$${priceOption.recurring_price}.00`}
          bodyText={isMonthly ? 'Monthly' : 'Yearly'}
          hintText={
            isMonthly
              ? `$${priceOption.recurring_price * 12} yearly`
              : undefined
          }
          isSelected={isSelected}
          onClick={() => setPeriodicity(priceOption.periodicity)}
        />
      );
    })}
  </Flex>
);

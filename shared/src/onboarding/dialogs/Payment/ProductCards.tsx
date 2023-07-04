import { useEffect } from 'react';

import { Flex } from '@holium/design-system/general';

import { ThirdEarthProduct } from '../../types/index';
import { ProductCard } from './ProductCard';

type Props = {
  products: ThirdEarthProduct[];
  productId: number;
  setProductId: (productId: number) => void;
};

export const ProductCards = ({ products, productId, setProductId }: Props) => {
  const byopProduct = products.find(
    (product) => product.product_type === 'byop-p'
  );

  useEffect(() => {
    if (byopProduct) {
      setProductId(byopProduct.id);
    }
  }, [byopProduct, setProductId]);

  return (
    <Flex gap={16}>
      {/* Assume the cheapest is monthly and the second yearly. */}
      {products.sort().map((product, index) => (
        <ProductCard
          key={product.id}
          h2Text={`$${product.subscription_price}.00`}
          bodyText={index === 0 ? 'Monthly' : 'Yearly'}
          hintText={
            index === 0
              ? `$${product.subscription_price * 12} yearly`
              : undefined
          }
          isSelected={productId === product.id}
          onClick={() => setProductId(product.id)}
        />
      ))}
    </Flex>
  );
};

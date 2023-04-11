import { Flex } from '@holium/design-system';
import { ProductCard } from './ProductCard';
import { ThirdEarthProduct } from '../../types/index';

type Props = {
  products: ThirdEarthProduct[];
  productId: number;
  setProductId: (productId: number) => void;
};

export const ProductCards = ({ products, productId, setProductId }: Props) => (
  <Flex gap={16}>
    {/* Assume the cheapest is monthly and the second yearly. */}
    {products.sort().map((product, index) => (
      <ProductCard
        key={product.id}
        h2Text={`$${product.subscription_price}.00`}
        bodyText={index === 0 ? 'Monthly' : 'Yearly'}
        hintText={
          index === 0 ? `$${product.subscription_price * 12} yearly` : undefined
        }
        isSelected={productId === product.id}
        onClick={() => setProductId(product.id)}
      />
    ))}
  </Flex>
);

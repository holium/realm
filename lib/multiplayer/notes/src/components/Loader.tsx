import { Flex, Spinner } from '@holium/design-system';

export const Loader = () => (
  <Flex justifyContent="center" alignItems="center" height="100vh">
    <Spinner size={6} />
  </Flex>
);

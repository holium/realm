import { Flex, Text, Icon } from '@holium/design-system';

export const CourierRoot = () => (
  <Flex flexDirection="column">
    <Flex height={50} flexDirection="row" alignItems="center">
      <Icon name="Messages" size={24} opacity={0.8} mr={2} />
      <Text.Custom opacity={0.8} textTransform="uppercase" fontWeight={600}>
        Courier
      </Text.Custom>
    </Flex>
  </Flex>
);

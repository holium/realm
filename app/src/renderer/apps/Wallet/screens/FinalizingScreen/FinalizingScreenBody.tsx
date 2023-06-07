import { Flex, Spinner, Text } from '@holium/design-system/general';

export const FinalizingScreenBody = () => (
  <Flex flex={1} flexDirection="column" justifyContent="center">
    <Flex width="100%" flexDirection="column" alignItems="center" gap="20px">
      <Spinner size={3} />
      <Text.Body style={{ fontWeight: 300 }}>Creating wallet...</Text.Body>
    </Flex>
  </Flex>
);

import { Flex, Text } from '@holium/design-system';

export const UnreadBadge = ({ count }: { count: number }) => {
  return (
    <Flex
      px="10px"
      py="1px"
      justifyContent="center"
      alignItems="center"
      width="fit-content"
      borderRadius={12}
      height={16}
      minWidth={12}
      background={count ? '#569BE2' : 'transparent'}
    >
      {count > 0 && (
        <Text.Custom fontSize={1} style={{ color: 'white' }} fontWeight={400}>
          {count}
        </Text.Custom>
      )}
    </Flex>
  );
};

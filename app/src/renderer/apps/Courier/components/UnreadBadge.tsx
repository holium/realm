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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ default: { duration: 0.2 } }}
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

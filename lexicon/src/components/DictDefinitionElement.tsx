import { Flex, Text } from '@holium/design-system/general';

export const DictDefinitionElement = ({
  count,
  text,
  example,
}: {
  count: string;
  text: string;
  example: string;
}) => {
  return (
    <Flex flexDirection={'column'}>
      <Flex>
        <Text.Body style={{ textDecoration: 'underline', marginRight: 5 }}>
          {count}.
        </Text.Body>
        <Text.Body>{text}</Text.Body>
      </Flex>
      <Text.Body style={{ marginLeft: '18px', marginTop: '2px', opacity: 0.7 }}>
        {example}
      </Text.Body>
    </Flex>
  );
};

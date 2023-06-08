import React from 'react';

import { Box, Card, Flex, Text } from '@holium/design-system';

export const Dictionary = () => {
  return (
    <Card p={3} elevation={4} maxWidth={400} minWidth={400} marginBottom={12}>
      <Flex flexDirection={'column'} justifyContent={'space-between'}>
        <Text.H3 fontWeight={600} style={{ marginBottom: '20px' }}>
          based
        </Text.H3>
        <Flex flexDirection={'column'} gap="14px">
          <Definition />
          <Definition />
        </Flex>
      </Flex>
    </Card>
  );
};
const Definition = () => {
  return (
    <Box>
      <Text.H6
        fontWeight={600}
        fontStyle={'italic'}
        style={{ marginBottom: '16px' }}
      >
        adjective
      </Text.H6>
      <Flex flexDirection={'column'} gap="10px" marginBottom={'16px'}>
        <DefinitionElement
          count="1"
          text="definition one"
          example="An example sentence"
        />
        <DefinitionElement
          count="2"
          text="definition two"
          example="An example sentence"
        />
        <DefinitionElement
          count="3"
          text="definition three"
          example="An example sentence"
        />
        <DefinitionElement
          count="4"
          text="definition four"
          example="An example sentence"
        />
      </Flex>
      <Flex>
        <Flex flexDirection="column" width={'50%'} gap="6px">
          <Text.H6 fontWeight={600} style={{ marginBottom: '6px' }}>
            Synonyms
          </Text.H6>
          <Text.Body color="accent" style={{ cursor: 'pointer' }}>
            Antonyms
          </Text.Body>
          <Text.Body color="accent" style={{ cursor: 'pointer' }}>
            Antonyms
          </Text.Body>
          <Text.Body color="accent" style={{ cursor: 'pointer' }}>
            Antonyms
          </Text.Body>
          <Text.Body color="accent" style={{ cursor: 'pointer' }}>
            Antonyms
          </Text.Body>
        </Flex>
        <Flex flexDirection="column" width={'50%'} gap="6px">
          <Text.H6 fontWeight={600} style={{ marginBottom: '6px' }}>
            Antonyms
          </Text.H6>
          <Text.Body color="accent" style={{ cursor: 'pointer' }}>
            Antonyms
          </Text.Body>
          <Text.Body color="accent" style={{ cursor: 'pointer' }}>
            Antonyms
          </Text.Body>
          <Text.Body color="accent" style={{ cursor: 'pointer' }}>
            Antonyms
          </Text.Body>
          <Text.Body color="accent" style={{ cursor: 'pointer' }}>
            Antonyms
          </Text.Body>
          <Text.Body color="accent" style={{ cursor: 'pointer' }}>
            Antonyms
          </Text.Body>
        </Flex>
      </Flex>
    </Box>
  );
};
function DefinitionElement({
  count,
  text,
  example,
}: {
  count: string;
  text: string;
  example: string;
}) {
  return (
    <Flex flexDirection={'column'}>
      <Flex>
        <Text.Body style={{ textDecoration: 'underline' }}>{count}.</Text.Body>
        <Text.Body>{text}</Text.Body>
      </Flex>
      <Text.Body style={{ marginLeft: '18px', marginTop: '2px', opacity: 0.7 }}>
        {example}
      </Text.Body>
    </Flex>
  );
}
export default Dictionary;
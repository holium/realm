import { Box, Flex, Text } from '@holium/design-system/general';

import { DictDefinitionElement } from './DictDefinitionElement';

export const DictDefinition = ({
  definitions,
  partOfSpeech,
  synonyms,
  antonyms,
  navigate,
}: any) => {
  return (
    <Box>
      <Text.H6
        fontWeight={600}
        fontStyle={'italic'}
        style={{ marginBottom: '16px' }}
      >
        {partOfSpeech}
      </Text.H6>
      <Flex flexDirection={'column'} gap="10px" marginBottom={'16px'}>
        {definitions.map((item: any, index: number) => {
          const { definition, example } = item;
          return (
            <DictDefinitionElement
              key={'definition-element-' + index}
              count={(index + 1).toString()}
              text={definition}
              example={example}
            />
          );
        })}
      </Flex>
      <Flex>
        <Flex flexDirection="column" width={'50%'} gap="6px">
          {synonyms.length > 0 && (
            <Text.H6 fontWeight={600} style={{ marginBottom: '6px' }}>
              Synonyms
            </Text.H6>
          )}
          {synonyms.map((word: any, index: number) => {
            return (
              <Text.Body
                key={'synonym-element-' + index}
                color="accent"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  navigate('../dict/' + word);
                }}
              >
                {word}
              </Text.Body>
            );
          })}
        </Flex>
        <Flex flexDirection="column" width={'50%'} gap="6px">
          {antonyms.length > 0 && (
            <Text.H6 fontWeight={600} style={{ marginBottom: '6px' }}>
              Antonyms
            </Text.H6>
          )}
          {antonyms.map((word: any, index: number) => {
            return (
              <Text.Body
                key={'antonym-element-' + index}
                color="accent"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  navigate('../dict/' + word);
                }}
              >
                {word}
              </Text.Body>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};

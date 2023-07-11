import { Card, Flex, Spinner, Text } from '@holium/design-system/general';

import { DictDefinition } from '../components';
interface Props {
  navigate: any;
  word: string | undefined;
  defs: any;
  loading: boolean;
  noResults: boolean | undefined;
}
export const Dictionary = ({
  navigate,
  word,
  defs,
  loading,
  noResults,
}: Props) => {
  return (
    <Card flex={1} p={3} elevation={4} width={'100%'}>
      <Flex flexDirection={'column'} justifyContent={'space-between'}>
        <Text.H3 fontWeight={600} style={{ marginBottom: '20px' }}>
          {word}
        </Text.H3>
        <Flex flexDirection={'column'} gap="14px">
          {loading && (
            <Flex alignItems={'center'} justifyContent={'center'}>
              <Spinner size={1} />
            </Flex>
          )}

          {noResults ? (
            <Text.H6 opacity=".7" fontWeight={500} textAlign="center">
              No result found
            </Text.H6>
          ) : (
            defs?.map((meaning: any, index: number) => {
              const { synonyms, antonyms, definitions, partOfSpeech } = meaning;
              return (
                <DictDefinition
                  key={'word-definition-' + index}
                  definitions={definitions}
                  partOfSpeech={partOfSpeech}
                  synonyms={synonyms}
                  antonyms={antonyms}
                  navigate={navigate}
                />
              );
            })
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

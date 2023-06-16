import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Card, Flex, Spinner, Text } from '@holium/design-system/general';

export const Dictionary = () => {
  const [defs, setDefs] = useState<any>([]);
  const [noResults, setNoResults] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  const { word } = useParams();
  const navigate = useNavigate();

  const fetchDict = async () => {
    setNoResults(false);
    setLoading(true);
    setDefs([]);
    try {
      const result = await fetch(
        'https://api.dictionaryapi.dev/api/v2/entries/en/' + word
      );
      const data = await result.json();

      if (data[0]?.meanings) {
        setDefs(data[0].meanings);
      } else {
        setNoResults(true);
      }
    } catch {
      setNoResults(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDict();
  }, [word]);
  return (
    <Card p={3} elevation={4} width={'100%'} margin={'12px 20px'}>
      <Flex flexDirection={'column'} justifyContent={'space-between'}>
        <Text.H3 fontWeight={600} style={{ marginBottom: '20px' }}>
          {word}
        </Text.H3>
        <Flex flexDirection={'column'} gap="14px">
          {loading && <Spinner size={1} />}

          {noResults ? (
            <Text.H6 opacity=".7" fontWeight={500}>
              No result found
            </Text.H6>
          ) : (
            defs?.map((meaning: any, index: number) => {
              const { synonyms, antonyms, definitions, partOfSpeech } = meaning;
              return (
                <Definition
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
const Definition = ({
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
            <DefinitionElement
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
                  navigate('../index.html/dict/' + word);
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
                  navigate('../index.html/dict/' + word);
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
}

export default Dictionary;

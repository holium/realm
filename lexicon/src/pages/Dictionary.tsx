import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Card, Flex, Spinner, Text } from '@holium/design-system/general';

import { Definition } from '../components';
import { Store, useStore } from '../store';

export const Dictionary = () => {
  const api = useStore((store: Store) => store.api);
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
      const data = await api.getDictonaryDefinition(word);

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

export default Dictionary;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Button,
  Card,
  Flex,
  Icon,
  Menu,
  Text,
  TextInput,
} from '@holium/design-system';

import { DefinitionRow, SentenceRow } from '../api/types/bedrock';
import { TabPanel, Tabs, Vote } from '../components';
import { Store, useStore } from '../store';
import { TabItem } from '../types';
import { displayDate, log } from '../utils';

const tabData: TabItem[] = [
  { label: 'Definitions', value: 0 },
  { label: 'Sentences', value: 1 },
];

export const Word = () => {
  const api = useStore((store: Store) => store.api);
  const space = useStore((state: Store) => state.space);

  const { state } = useLocation();
  const navigate = useNavigate();
  const definitionMap = useStore((state: Store) => state.definitionMap);
  const sentenceMap = useStore((state: Store) => state.sentenceMap);
  const voteMap = useStore((state: Store) => state.voteMap);

  const [tabValue, setTabValue] = useState<number>(0);
  const [definitionList, setDefinitionList] = useState<any>([]);
  const [sentenceList, setSentenceList] = useState<any>([]);
  const [votes, setVotes] = useState<any>([]);

  useEffect(() => {
    if (state) {
      const wordId = state.id;

      const newDefinitionList = definitionMap.get(wordId) ?? [];
      setDefinitionList(newDefinitionList);

      const newSentenceList = sentenceMap.get(wordId) ?? [];
      setSentenceList(newSentenceList);

      const newVotes = voteMap.get(wordId);
      setVotes(newVotes);
    }
  }, [state, definitionMap, sentenceMap, voteMap]);
  const removeWord = async () => {
    if (!space) return;
    try {
      const result = await api.removeWord(space, state.id);
      navigate(-1);
      log('removeWord result =>', result);
    } catch (e) {
      log('removeWord error => ', removeWord);
    }
  };
  const goToDict = () => {
    navigate('/index.html/dict/' + state.word);
  };
  return (
    <Card flex={1} p={3} elevation={4} width={'100%'}>
      <Flex justifyContent={'space-between'} mb={'8px'}>
        <Text.H3 fontWeight={600}>{state.word}</Text.H3>

        <Flex alignItems="center" justifyContent={'center'} gap={4}>
          <Flex
            alignItems="center"
            justifyContent={'center'}
            gap={4}
            style={{
              padding: '4px 6px',
              backgroundColor: '#FDC14E1F',
              borderRadius: '6px',
            }}
          >
            <Icon
              name="StarFilled"
              size={14}
              iconColor="#FDC14E"
              style={{ marginTop: -2 }}
            />
            <Text.H6 fontWeight={400} style={{ color: '#FDC14E' }}>
              {votes?.upVotes ?? 0}
            </Text.H6>
          </Flex>

          <Menu
            orientation="bottom-left"
            id={`menu`}
            fontStyle={'normal'}
            width={'200px'}
            triggerEl={
              <Button.IconButton size={25}>
                <Icon name="MoreVertical" size={18} opacity={0.5} />
              </Button.IconButton>
            }
            options={[
              {
                id: `menu-element-2`,
                label: 'See dictionary definition',
                disabled: false,
                onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
                  evt.stopPropagation();
                  goToDict();
                },
              },
              {
                id: `menu-element-1`,
                label: 'Delete word',
                disabled: false,
                onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
                  evt.stopPropagation();
                  removeWord();
                },
              },
            ]}
          />
        </Flex>
      </Flex>
      <Flex justifyContent={'space-between'} mb={'16px'}>
        <Text.Body opacity={0.5} fontWeight={500}>
          {state.id?.split('/')[1]}
        </Text.Body>
        <Text.Body opacity={0.5} fontWeight={500}>
          {state.createdAt && displayDate(state.createdAt)}
        </Text.Body>
      </Flex>
      <Tabs
        value={tabValue}
        onChange={(newValue: number) => setTabValue(newValue)}
        tabData={tabData}
      />
      <TabPanel value={tabValue} index={0} other={null}>
        <Flex flexDirection={'column'} flex={1}>
          <Definitions
            definitionList={definitionList}
            state={state}
            space={space}
          />
        </Flex>
      </TabPanel>
      <TabPanel value={tabValue} index={1} other={null}>
        <Flex flexDirection={'column'} flex={1}>
          <Sentences sentenceList={sentenceList} state={state} space={space} />
        </Flex>
      </TabPanel>
    </Card>
  );
};
function Definition({
  text,
  id,
  votes,
}: {
  text: string;
  id: string;
  votes: any;
}) {
  return (
    <Flex flexDirection={'column'} gap={8}>
      <Text.Body>{text}</Text.Body>
      <Flex justifyContent={'space-between'}>
        <Vote id={id} votes={votes} />
        <Text.Body opacity={0.5}> {id?.split('/')[1]}</Text.Body>
      </Flex>
    </Flex>
  );
}
const Sentences = ({ sentenceList, space, state }: any) => {
  const api = useStore((store: Store) => store.api);

  const [newSentence, setNewSentence] = useState<string>('');
  const sentenceVoteMap = useStore((state: Store) => state.sentenceVoteMap);

  const handleSubmitNewSentence = async () => {
    if (!space) return;
    try {
      const wordId = state.id;

      const definitionResult = await api.createSentence(
        space,
        wordId,
        newSentence
      );

      log('handleSubmitNewSentence result =>', definitionResult);
      setNewSentence('');
    } catch (e) {
      log('handleSubmitNewSentence error => ', e);
    }
  };
  return (
    <>
      <Flex flexDirection="column" gap={20}>
        {sentenceList.map((item: SentenceRow, index: number) => {
          const votes = sentenceVoteMap.get(item.id);

          return (
            <Definition
              id={item.id}
              text={item.sentence}
              votes={votes}
              key={'sentence-item-' + index}
            />
          );
        })}
      </Flex>

      <Flex flexDirection={'column'} gap={10} marginTop={'auto'}>
        <TextInput
          id="definition-input"
          name="definition"
          style={{
            marginTop: 30,
            borderRadius: 6,
            paddingLeft: 9,
          }}
          value={newSentence}
          placeholder="Add a new sentence..."
          error={false}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewSentence(evt.target.value);
          }}
        />
        <Button.TextButton
          fontSize={1}
          fontWeight={500}
          alignSelf={'flex-end'}
          onClick={handleSubmitNewSentence}
        >
          Submit
        </Button.TextButton>
      </Flex>
    </>
  );
};
const Definitions = ({ definitionList, state, space }: any) => {
  const api = useStore((store: Store) => store.api);

  const [newDefinition, setNewDefinition] = useState<string>('');
  const definitionVoteMap = useStore((state: Store) => state.definitionVoteMap);

  const handleSubmitNewDefinition = async () => {
    if (!space) return;
    try {
      const wordId = state.id;

      const definitionResult = await api.createDefinition(
        space,
        wordId,
        newDefinition
      );

      log('handleSubmitNewDefinition result =>', definitionResult);
      setNewDefinition('');
    } catch (e) {
      log('handleSubmitNewDefinition error => ', e);
    }
  };
  return (
    <>
      <Flex flexDirection="column" gap={20}>
        {definitionList.map((item: DefinitionRow, index: number) => {
          const votes = definitionVoteMap.get(item.id);
          return (
            <Definition
              id={item.id}
              text={item.definition}
              key={'definition-item-' + index}
              votes={votes}
            />
          );
        })}
      </Flex>

      <Flex flexDirection={'column'} gap={10} marginTop={'auto'}>
        <TextInput
          id="definition-input"
          name="definition"
          style={{
            marginTop: 30,
            borderRadius: 6,
            paddingLeft: 9,
          }}
          value={newDefinition}
          placeholder="Add a new definition..."
          error={false}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
            setNewDefinition(evt.target.value);
          }}
        />
        <Button.TextButton
          fontSize={1}
          fontWeight={500}
          alignSelf={'flex-end'}
          onClick={handleSubmitNewDefinition}
        >
          Submit
        </Button.TextButton>
      </Flex>
    </>
  );
};

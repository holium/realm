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

import api from '../api';
import { TabPanel, Tabs, Vote } from '../components';
import { Store, useStore } from '../store';
import { TabItem } from '../types';
import { log, shipName } from '../utils';

const tabData: TabItem[] = [
  { label: 'Definitions', value: 0 },
  { label: 'Sentences', value: 1 },
];
export const Word = () => {
  const [tabValue, setTabValue] = useState<number>(0);
  const { state } = useLocation();
  const navigate = useNavigate();
  const space = useStore((state: Store) => state.space);

  const [definitionList, setDefinitionList] = useState<any>([]);
  const [sentenceList, setSentenceList] = useState<any>([]);
  const [votes, setVotes] = useState<any>([]);

  const definitionMap = useStore((state: Store) => state.definitionMap);
  const sentenceMap = useStore((state: Store) => state.sentenceMap);
  const voteMap = useStore((state: Store) => state.voteMap);
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
  return (
    <Card p={3} elevation={4} width={400} marginBottom={12}>
      <Text.Label opacity={0.7} fontWeight={400} style={{ marginBottom: 4 }}>
        Word of the day
      </Text.Label>
      <Flex justifyContent={'space-between'} mb={'8px'}>
        <Text.H3 fontWeight={600}>{state.word}</Text.H3>

        <Flex alignItems="center" justifyContent={'center'} gap={4}>
          <Flex
            alignItems="center"
            justifyContent={'center'}
            gap={4}
            style={{
              padding: '4px 3px',
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
        <Text.Body opacity={0.5}>~lodlev-migdev</Text.Body>
        <Text.Body opacity={0.5}>07/21/2022 10:30 AM</Text.Body>
      </Flex>
      <Tabs
        value={tabValue}
        onChange={(newValue: number) => setTabValue(newValue)}
        tabData={tabData}
      />
      <TabPanel value={tabValue} index={0} other={null}>
        <Definitions
          definitionList={definitionList}
          state={state}
          space={space}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1} other={null}>
        <Sentences sentenceList={sentenceList} state={state} space={space} />
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
        <Text.Body opacity={0.5}> ~lodlev-migdev</Text.Body>
      </Flex>
    </Flex>
  );
}
const Sentences = ({ sentenceList, space, state }: any) => {
  const [newSentence, setNewSentence] = useState<string>('');
  const voteRows = useStore((state: Store) => state.voteRows);
  const [sentenceVotesMap, setSentenceVoteMap] = useState<any>(new Map());

  const makeVoteMap = () => {
    //construct a vote map for the definitions of this word
    const voteMap: any = new Map();
    const sentenceDefinitionId = new Set(); //set of our definition ids
    sentenceList.forEach((item: any) => {
      sentenceDefinitionId.add(item.id);
    });
    voteRows.forEach((item: any) => {
      if (sentenceDefinitionId.has(item['parent-id'])) {
        //accumulate rows into their respective parents (words)
        const lastVoteData = voteMap.get(item['parent-id']);

        let upVotes = lastVoteData?.upVotes ?? 0;
        let downVotes = lastVoteData?.downVotes ?? 0;
        let currentShipVoted = lastVoteData?.currentShipVoted ?? null;
        const newVotes = lastVoteData?.votes ?? [];
        //incremenet/decrement vote count accrodingly

        if (item.up) {
          if (item.ship === '~' + shipName())
            currentShipVoted = { vote: true, voteId: item.id };
          upVotes++;
        } else {
          if (item.ship === '~' + shipName())
            currentShipVoted = { vote: false, voteId: item.id };

          downVotes++;
        }

        //we count the up/down vote
        newVotes.push(item);
        voteMap.set(item['parent-id'], {
          votes: newVotes,
          upVotes,
          downVotes,
          currentShipVoted,
        });
      }
    });
    setSentenceVoteMap(voteMap);
  };
  useEffect(() => {
    makeVoteMap();
  }, [sentenceList, voteRows]);
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
    <Flex flexDirection="column" gap={20}>
      {sentenceList.map((item: any, index: number) => {
        const votes = sentenceVotesMap.get(item.id);

        return (
          <Definition
            id={item.id}
            text={item.sentence}
            votes={votes}
            key={'sentence-item-' + index}
          />
        );
      })}
      <Flex flexDirection={'column'} gap={10}>
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
          fontWeight={600}
          alignSelf={'flex-end'}
          onClick={handleSubmitNewSentence}
        >
          Submit
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};
const Definitions = ({ definitionList, state, space }: any) => {
  const [newDefinition, setNewDefinition] = useState<string>('');
  const voteRows = useStore((state: Store) => state.voteRows);
  const [definitionVotesMap, setDefinitionVotesMap] = useState<any>(new Map());

  const makeVoteMap = () => {
    //construct a vote map for the definitions of this word
    const voteMap: any = new Map();
    const definitionIdSet = new Set(); //set of our definition ids
    definitionList.forEach((item: any) => {
      definitionIdSet.add(item.id);
    });
    voteRows.forEach((item: any) => {
      if (definitionIdSet.has(item['parent-id'])) {
        //accumulate rows into their respective parents (words)
        const lastVoteData = voteMap.get(item['parent-id']);

        let upVotes = lastVoteData?.upVotes ?? 0;
        let downVotes = lastVoteData?.downVotes ?? 0;
        let currentShipVoted = lastVoteData?.currentShipVoted ?? null;
        const newVotes = lastVoteData?.votes ?? [];
        //incremenet/decrement vote count accrodingly

        if (item.up) {
          if (item.ship === '~' + shipName())
            currentShipVoted = { vote: true, voteId: item.id };
          upVotes++;
        } else {
          if (item.ship === '~' + shipName())
            currentShipVoted = { vote: false, voteId: item.id };

          downVotes++;
        }

        //we count the up/down vote
        newVotes.push(item);
        voteMap.set(item['parent-id'], {
          votes: newVotes,
          upVotes,
          downVotes,
          currentShipVoted,
        });
      }
    });
    setDefinitionVotesMap(voteMap);
  };
  useEffect(() => {
    makeVoteMap();
  }, [definitionList, voteRows]);
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
    <Flex flexDirection="column" gap={20}>
      {definitionList.map((item: any, index: number) => {
        const votes = definitionVotesMap.get(item.id);
        return (
          <Definition
            id={item.id}
            text={item.definition}
            key={'definition-item-' + index}
            votes={votes}
          />
        );
      })}
      <Flex flexDirection={'column'} gap={10}>
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
          fontWeight={600}
          alignSelf={'flex-end'}
          onClick={handleSubmitNewDefinition}
        >
          Submit
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};

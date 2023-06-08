import React, { useEffect, useState } from 'react';

import { Button, Card, Flex, Icon, Text } from '@holium/design-system';

import api from '../api';
import { useStore } from '../store';
import { displayDate, log, shipName } from '../utils';

export const Home = () => {
  const { space } = useStore();
  const [wordList, setWordList] = useState<any>([]);

  const { wordRows, setWordRows, voteRows, setVoteRows } = useStore();

  const [voteMap, setVoteMap] = useState<any>(new Map());
  const getPathData = async () => {
    if (!space) return;
    //fetch data stored in db under the current space(path)
    try {
      const result = await api.getPath(space);
      //select the table with type => "lexicon-word"
      if (result) {
        let newWordRows: any = [];
        let newVoteRows: any = [];
        result.tables.forEach((item: any) => {
          if (item.type === 'lexicon-word') {
            newWordRows = item.rows;
          } else if (item.type === 'vote') {
            newVoteRows = item.rows;
          }
        });
        setVoteRows(newVoteRows);
        setWordRows(newWordRows);
      }
      log('getPathData result =>', result);
    } catch (e) {
      log('getPathData error =>', e);
    }
  };

  const makeWordList = () => {
    const wordMap: any = new Map();
    if (wordRows.length > 0) {
      let newWordList = wordRows.map((item: any) => {
        wordMap.set(item.id, item);
        return {
          id: item.id,
          word: item.word,
          createdAt: item['created-at'],
          votes: item.votes,
        };
      });
      setWordList(newWordList);
    }
    const voteMap: any = new Map();

    voteRows.map((item: any) => {
      //if this vote is linked to a word (we check wordMap) add it to our voteMap under that word's idea
      if (wordMap.has(item['parent-id'])) {
        const lastVoteData = voteMap.get(item['parent-id']);

        let upVotes = lastVoteData?.upVotes ?? 0;
        let downVotes = lastVoteData?.downVotes ?? 0;
        let currentShipVoted = lastVoteData?.currentShipVoted ?? null;
        let newVotes = lastVoteData?.votes ?? [];
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
    setVoteMap(voteMap);
  };

  useEffect(() => {
    makeWordList();
  }, [wordRows, voteRows]);

  useEffect(() => {
    getPathData();
  }, [space]);

  const voteOnWord = async (
    worId: string,
    voteType: null | boolean,
    voteId: string = ''
  ) => {
    if (!space) return;
    try {
      const result = await api.voteOnWord(
        space,
        worId,
        voteId,
        voteType,
        '~' + shipName()
      );
      log('voteOnWord result =>', result);
    } catch (e) {
      log('voteOnWord error =>', e);
    }
  };
  return (
    <Card p={'10px'} elevation={4} maxWidth={400} minWidth={400}>
      <Flex flexDirection={'column'}>
        {wordList.map((item: any, index: number) => {
          const { id, word, createdAt } = item;
          const votes = voteMap.get(id);
          return (
            <WordItem
              key={'word-item-' + index}
              id={id}
              word={word}
              createdAt={createdAt}
              votes={votes}
              onVote={voteOnWord}
            />
          );
        })}
      </Flex>
    </Card>
  );
};
interface WordItemProps {
  id: string;
  word: string;
  createdAt: number;
  votes: any;
  onVote: Function;
}
const WordItem = ({ id, word, createdAt, votes, onVote }: WordItemProps) => {
  return (
    <Flex
      flexDirection={'column'}
      gap={8}
      padding={'10px'}
      style={{ borderRadius: 6 }}
      className="highlight-hover"
      tabIndex={0}
    >
      <Flex justifyContent={'space-between'} alignItems={'flex-end'}>
        <Text.H6 fontWeight={600}>{word}</Text.H6>
        <Text.Body opacity={0.5}> ~lodlev-migdev</Text.Body>
      </Flex>
      <Flex justifyContent={'space-between'} alignItems={'flex-end'}>
        <Flex gap={10}>
          <Button.IconButton
            onClick={() => {
              if (votes?.currentShipVoted.vote === true) {
                //user already voted, remove his vote
                onVote(id, null, votes?.currentShipVoted.voteId);
              } else if (votes?.currentShipVoted.vote === false) {
                //user voted down, remove the down vote and add an upvote
                onVote(id, true); //new up vote
                onVote(id, null, votes?.currentShipVoted.voteId);
              } else {
                //user has no other votes on this word, just up vote
                onVote(id, true);
              }
            }}
            style={{
              backgroundColor:
                votes?.currentShipVoted.vote === true
                  ? 'rgba(var(--rlm-accent-rgba), .1)'
                  : 'transparent',
              paddingLeft: 4,
              paddingRight: 4,
            }}
            iconColor={
              votes?.currentShipVoted.vote === true
                ? 'rgba(var(--rlm-accent-rgba))'
                : 'icon'
            }
          >
            <Icon
              opacity={0.7}
              name="ThumbsUp"
              size={20}
              style={{
                marginTop: 3,
                marginRight: -5,
              }}
            />
            <Text.Body
              opacity=".7"
              style={{
                color:
                  votes?.currentShipVoted.vote === true
                    ? 'rgba(var(--rlm-accent-rgba))'
                    : 'rgba(var(--rlm-text-color), .7)',
              }}
            >
              {votes?.upVotes ?? 0}
            </Text.Body>
          </Button.IconButton>
          <Button.IconButton
            onClick={() => {
              if (votes?.currentShipVoted.vote === true) {
                //user up voted, remove his up vote and add a down vote
                onVote(id, null, votes?.currentShipVoted.voteId);
                onVote(id, false);
              } else if (votes?.currentShipVoted.vote === false) {
                //user already down voted, remove the down vote
                onVote(id, null, votes?.currentShipVoted.voteId);
              } else {
                //user has no other votes on this word, just down vote
                onVote(id, false);
              }
            }}
            style={{
              backgroundColor:
                votes?.currentShipVoted.vote === false
                  ? 'rgba(var(--rlm-intent-alert-rgba),.1)'
                  : 'transparent',
              paddingLeft: 4,
              paddingRight: 4,
            }}
            iconColor={
              votes?.currentShipVoted.vote === false
                ? 'rgba(var(--rlm-intent-alert-rgba))'
                : 'icon'
            }
          >
            <Icon
              opacity={0.7}
              name="ThumbsDown"
              size={20}
              style={{ marginBottom: -7, marginRight: -5 }}
            />

            <Text.Body
              opacity={0.7}
              style={{
                color:
                  votes?.currentShipVoted.vote === false
                    ? 'rgba(var(--rlm-intent-alert-rgba))'
                    : 'rgba(var(--rlm-text-color))',
              }}
            >
              {votes?.downVotes ?? 0}
            </Text.Body>
          </Button.IconButton>
        </Flex>
        <Text.Body opacity={0.5} style={{ marginBottom: 3 }}>
          {displayDate(createdAt)}
        </Text.Body>
      </Flex>
    </Flex>
  );
};

import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Box } from '@holium/design-system';

import api from './api';
import { Navigation } from './Navigation';
import { Dictionary, Home, Word } from './pages';
import { Store, useStore } from './store';
import { log, shipName } from './utils';

declare global {
  interface Window {
    ship: string;
  }
}

export const App = () => {
  const space = useStore((store: Store) => store.space);
  const wordRows = useStore((store: Store) => store.wordRows);
  const setWordRows = useStore((store: Store) => store.setWordRows);
  const voteRows = useStore((store: Store) => store.voteRows);
  const setVoteRows = useStore((store: Store) => store.setVoteRows);
  const setVoteMap = useStore((store: Store) => store.setVoteMap);
  const definitionRows = useStore((store: Store) => store.definitionRows);
  const setDefinitionRows = useStore((store: Store) => store.setDefinitionRows);
  const sentenceRows = useStore((store: Store) => store.sentenceRows);
  const setSentenceRows = useStore((store: Store) => store.setSentenceRows);
  const setDefinitionMap = useStore((store: Store) => store.setDefinitionMap);
  const setSentenceMap = useStore((store: Store) => store.setSentenceMap);
  const wordMap = useStore((store: Store) => store.wordMap);
  const setWordMap = useStore((store: Store) => store.setWordMap);
  const setWordList = useStore((store: Store) => store.setWordList);
  const setLoadingMain = useStore((store: Store) => store.setLoadingMain);
  const setSentenceVoteMap = useStore(
    (store: Store) => store.setSentenceVoteMap
  );
  const setDefinitionVoteMap = useStore(
    (store: Store) => store.setDefinitionVoteMap
  );

  const getPathData = async () => {
    if (!space) return;
    setLoadingMain(true);
    //fetch data stored in db under the current space(path)
    try {
      const result = await api.getPath(space);
      const subscribeToSpace = await api.subscribePath(space); //TOOD: maybe make a button to re-sub in case it dies
      log('subscribeToSpace', subscribeToSpace);
      //select the table with type => "lexicon-word"
      if (result) {
        let newWordRows: any = [];
        let newVoteRows: any = [];
        let newSentenceRows: any = [];
        let newDefinitionRows: any = [];

        result.tables.forEach((item: any) => {
          if (item.type === 'lexicon-word') {
            newWordRows = item.rows;
          } else if (item.type === 'vote') {
            newVoteRows = item.rows;
          } else if (item.type === 'lexicon-definition') {
            newDefinitionRows = item.rows;
          } else if (item.type === 'lexicon-sentence') {
            newSentenceRows = item.rows;
          }
        });
        setVoteRows(newVoteRows);
        setWordRows(newWordRows);
        setSentenceRows(newSentenceRows);
        setDefinitionRows(newDefinitionRows);
      }
      log('getPathData result =>', result);
    } catch (e) {
      log('getPathData error =>', e);
    }
    setLoadingMain(false);
  };

  const makeSentenceMap = () => {
    const sentenceMap: any = new Map();
    sentenceRows.forEach((item: any) => {
      //if this vote is linked to a word (we check wordMap) add it to our voteMap under that word's idea
      if (wordMap.has(item['word-id'])) {
        const newSentenceList = sentenceMap.get(item['word-id']) ?? [];

        newSentenceList.push(item);
        sentenceMap.set(item['word-id'], newSentenceList);
      }
    });
    setSentenceMap(sentenceMap);
  };
  const makeDefinitionMap = () => {
    const definitionMap: any = new Map();
    definitionRows.forEach((item: any) => {
      //if this vote is linked to a word (we check wordMap) add it to our voteMap under that word's idea
      if (wordMap.has(item['word-id'])) {
        const newDefinitionList = definitionMap.get(item['word-id']) ?? [];

        newDefinitionList.push(item);
        definitionMap.set(item['word-id'], newDefinitionList);
      }
    });
    setDefinitionMap(definitionMap);
  };
  useEffect(() => {
    getPathData();
  }, [space]);
  useEffect(() => {
    makeDefinitionMap();
  }, [definitionRows, wordMap]);
  useEffect(() => {
    makeSentenceMap();
  }, [sentenceRows, wordMap]);

  const makeWordList = () => {
    const wordMap: any = new Map();
    const newWordList = wordRows.map((item: any) => {
      wordMap.set(item.id, item);
      return {
        id: item.id,
        word: item.word,
        createdAt: item['created-at'],
        votes: item.votes,
      };
    });
    setWordList(newWordList);

    setWordMap(wordMap);
  };
  const makeWordMap = () => {
    const voteMap: any = new Map();

    voteRows.forEach((item: any) => {
      //if this vote is linked to a word (we check wordMap) add it to our voteMap under that word's idea
      if (wordMap.has(item['parent-id'])) {
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
    setVoteMap(voteMap);
  };
  const definitionVoteMap = () => {
    const newVoteMap: any = new Map();
    const definitionIdSet = new Set(); //set of our definition ids
    definitionRows.forEach((item: any) => {
      definitionIdSet.add(item.id);
    });
    voteRows.forEach((item: any) => {
      if (definitionIdSet.has(item['parent-id'])) {
        //accumulate rows into their respective parents (words)
        const lastVoteData = newVoteMap.get(item['parent-id']);

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
        newVoteMap.set(item['parent-id'], {
          votes: newVotes,
          upVotes,
          downVotes,
          currentShipVoted,
        });
      }
    });
    setDefinitionVoteMap(newVoteMap);
  };
  const sentenceVoteMap = () => {
    const newVoteMap: any = new Map();
    const sentenceIdSet = new Set(); //set of our definition ids
    sentenceRows.forEach((item: any) => {
      sentenceIdSet.add(item.id);
    });
    voteRows.forEach((item: any) => {
      if (sentenceIdSet.has(item['parent-id'])) {
        //accumulate rows into their respective parents (words)
        const lastVoteData = newVoteMap.get(item['parent-id']);

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
        newVoteMap.set(item['parent-id'], {
          votes: newVotes,
          upVotes,
          downVotes,
          currentShipVoted,
        });
      }
    });
    setSentenceVoteMap(newVoteMap);
  };
  useEffect(() => {
    definitionVoteMap();
  }, [voteRows, definitionRows]);
  useEffect(() => {
    sentenceVoteMap();
  }, [voteRows, sentenceRows]);
  useEffect(() => {
    makeWordMap();
  }, [voteRows, wordMap]);
  useEffect(() => {
    makeWordList();
  }, [wordRows, voteRows]);
  return (
    <main
      style={{
        overflowY: 'auto',
        height: '100vh',
        backgroundColor: 'transparent',
      }}
    >
      <div id="portal-root" />
      <Box maxWidth={600} margin="auto">
        <Router>
          <Routes>
            <Route element={<Navigation />}>
              <Route
                path="/apps/lexicon/:ship/:group/:word"
                element={<Word />}
              />
              <Route path="/apps/lexicon/:ship/:group" element={<Home />} />
              <Route path="/apps/lexicon/dict/:word" element={<Dictionary />} />
              <Route
                path="/apps/lexicon/"
                element={<p>don't mind me just redirecting over here</p>}
              />
            </Route>
          </Routes>
        </Router>
      </Box>
    </main>
  );
};

import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import api from './api';
import { Navigation } from './Navigation';
import { Dictionary, Home, Word } from './pages';
import { useStore } from './store';
import { log, shipName } from './utils';

declare global {
  interface Window {
    ship: string;
  }
}

function App() {
  const {
    space,
    wordRows,
    setWordRows,
    voteRows,
    setVoteRows,
    setVoteMap,
    definitionRows,
    setDefinitionRows,
    sentenceRows,
    setSentenceRows,
    setDefinitionMap,
    setSentenceMap,
    wordMap,
    setWordMap,
    setWordList,
  } = useStore();
  const getPathData = async () => {
    if (!space) return;
    //fetch data stored in db under the current space(path)
    try {
      const result = await api.getPath(space);
      //select the table with type => "lexicon-word"
      if (result) {
        let newWordRows: any = [];
        let newVoteRows: any = [];
        let newSentenceRows: any = [];
        let newDefinitionRows: any = [];

        log('result', result.tables);
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
  };
  useEffect(() => {
    getPathData();
  }, [space]);
  const makeSentenceMap = () => {
    if (wordMap.size === 0) return;
    const sentenceMap: any = new Map();
    sentenceRows.forEach((item: any) => {
      log('item', item);
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
    if (wordMap.size === 0) return;
    const definitionMap: any = new Map();
    definitionRows.forEach((item: any) => {
      log('item', item);
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
    makeDefinitionMap();
  }, [definitionRows, wordMap]);
  useEffect(() => {
    makeSentenceMap();
  }, [sentenceRows, wordMap]);
  const doStateScry = async () => {
    if (!space) return;
    try {
      const s = await api.getState();
      const subscribeToSpace = await api.subscribePath(space);
      // const path = await api.createPath(space, []);
      //log('path', path);

      log('s', s);
      log('subscribeToSpace', subscribeToSpace);
    } catch (error) {
      log('Error performing /db scry:', error);
    }
  };
  useEffect(() => {
    doStateScry();
  }, [space]);
  const makeWordList = () => {
    const wordMap: any = new Map();
    if (wordRows.length > 0) {
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
    }
    setWordMap(wordMap);
  };
  const makeWordMap = () => {
    if (wordMap.size === 0) return;
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

  useEffect(() => {
    makeWordMap();
  }, [voteRows, wordMap]);
  useEffect(() => {
    makeWordList();
  }, [wordRows, voteRows]);
  return (
    <>
      <div id="portal-root" />
      <Router>
        <Routes>
          <Route element={<Navigation />}>
            <Route path="/apps/lexicon/:ship/:group/:word" element={<Word />} />
            <Route path="/apps/lexicon/:ship/:group" element={<Home />} />
            <Route path="/apps/lexicon/dict/:word" element={<Dictionary />} />
            <Route
              path="/apps/lexicon/"
              element={<p>don't mind me just redirecting over here</p>}
            />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import {
  DefinitionRow,
  SentenceRow,
  VoteRow,
  WordRow,
} from './api/types/bedrock';
import { updateHandler } from './api/updates';
import { Navigation } from './components/Navigation';
import { DictionaryPage, HomePage, WordPage } from './pages';
import { Store, useStore } from './store';
import { log } from './utils';

const GlobalStyle = createGlobalStyle`
  html {
    overflow: hidden;
  }
  .highlight-hover:hover {
    background-color: rgba(var(--rlm-overlay-hover-rgba));
    cursor: pointer;
  }
  .highlight-hover:focus {
    background-color: rgba(var(--rlm-overlay-hover-rgba));
    transition: '.25s ease';
    outline: none;
  }
`;

declare global {
  interface Window {
    ship: string;
  }
}

interface Props {
  selectedSpace: string;
  lexiconIPC: any;
  shipName: string;
  update: any;
}

export const Lexicon = ({
  selectedSpace,
  lexiconIPC,
  update,
  shipName,
}: Props) => {
  const api = useStore((store: Store) => store.api);
  const setApi = useStore((store: Store) => store.setApi);

  const setShipName = useStore((store: Store) => store.setShipName);

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
  const [appInit, setAppInit] = useState<boolean>(false);
  const getPathData = async () => {
    if (!space) return;
    setLoadingMain(true);
    //fetch data stored in db under the current space(path)
    try {
      const result = await lexiconIPC.getPath(space);
      const subscribeToSpace = await lexiconIPC.subscribePath(space);
      log('subscribeToSpace', subscribeToSpace);
      if (result) {
        const newWordRows: WordRow[] = result.words;
        const newSentenceRows: SentenceRow[] = result.sentences;
        const newDefinitionRows: DefinitionRow[] = result.definitions;
        const newVoteRows: VoteRow[] = result.votes;

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
    sentenceRows.forEach((item: SentenceRow) => {
      //if this vote is linked to a word (we check wordMap) add it to our voteMap under that word's idea
      if (wordMap.has(item['word_id'])) {
        const newSentenceList = sentenceMap.get(item['word_id']) ?? [];

        newSentenceList.push(item);
        sentenceMap.set(item['word_id'], newSentenceList);
      }
    });
    setSentenceMap(sentenceMap);
  };
  const makeDefinitionMap = () => {
    const definitionMap: any = new Map();
    definitionRows.forEach((item: DefinitionRow) => {
      //if this vote is linked to a word (we check wordMap) add it to our voteMap under that word's idea
      if (wordMap.has(item['word_id'])) {
        const newDefinitionList = definitionMap.get(item['word_id']) ?? [];

        newDefinitionList.push(item);
        definitionMap.set(item['word_id'], newDefinitionList);
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
    const newWordList = wordRows.map((item: WordRow) => {
      wordMap.set(item.id, item);
      return {
        id: item.id,
        word: item.word,
        createdAt: item['created_at'],
      };
    });
    setWordList(newWordList);

    setWordMap(wordMap);
  };
  const makeWordMap = () => {
    const voteMap: any = new Map();

    voteRows.forEach((item: VoteRow) => {
      //if this vote is linked to a word (we check wordMap) add it to our voteMap under that word's idea
      if (wordMap.has(item['parent_id'])) {
        //accumulate rows into their respective parents (words)
        const lastVoteData = voteMap.get(item['parent_id']);

        let upVotes = lastVoteData?.upVotes ?? 0;
        let downVotes = lastVoteData?.downVotes ?? 0;
        let currentShipVoted = lastVoteData?.currentShipVoted ?? {};
        const newVotes = lastVoteData?.votes ?? [];
        //incremenet/decrement vote count accrodingly
        if (item.up) {
          if (item.creator === shipName)
            currentShipVoted = { vote: true, voteId: item.id };
          upVotes++;
        } else {
          if (item.creator === shipName)
            currentShipVoted = { vote: false, voteId: item.id };

          downVotes++;
        }

        //we count the up/down vote
        newVotes.push(item);
        voteMap.set(item['parent_id'], {
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
    definitionRows.forEach((item: DefinitionRow) => {
      definitionIdSet.add(item.id);
    });
    voteRows.forEach((item: VoteRow) => {
      if (definitionIdSet.has(item['parent_id'])) {
        //accumulate rows into their respective parents (words)
        const lastVoteData = newVoteMap.get(item['parent_id']);

        let upVotes = lastVoteData?.upVotes ?? 0;
        let downVotes = lastVoteData?.downVotes ?? 0;
        let currentShipVoted = lastVoteData?.currentShipVoted ?? {};
        const newVotes = lastVoteData?.votes ?? [];
        //incremenet/decrement vote count accrodingly

        if (item.up) {
          if (item.creator === shipName)
            currentShipVoted = { vote: true, voteId: item.id };
          upVotes++;
        } else {
          if (item.creator === shipName)
            currentShipVoted = { vote: false, voteId: item.id };

          downVotes++;
        }

        //we count the up/down vote
        newVotes.push(item);
        newVoteMap.set(item['parent_id'], {
          votes: newVotes,
          upVotes,
          downVotes,
          currentShipVoted,
        });
      }
    });
    log('newVoteMap', newVoteMap);

    setDefinitionVoteMap(newVoteMap);
  };
  const sentenceVoteMap = () => {
    const newVoteMap: any = new Map();
    const sentenceIdSet = new Set(); //set of our definition ids
    sentenceRows.forEach((item: SentenceRow) => {
      sentenceIdSet.add(item.id);
    });
    voteRows.forEach((item: VoteRow) => {
      if (sentenceIdSet.has(item['parent_id'])) {
        //accumulate rows into their respective parents (words)
        const lastVoteData = newVoteMap.get(item['parent_id']);

        let upVotes = lastVoteData?.upVotes ?? 0;
        let downVotes = lastVoteData?.downVotes ?? 0;
        let currentShipVoted = lastVoteData?.currentShipVoted ?? {};
        const newVotes = lastVoteData?.votes ?? [];
        //incremenet/decrement vote count accrodingly

        if (item.up) {
          if (item.creator === shipName)
            currentShipVoted = { vote: true, voteId: item.id };
          upVotes++;
        } else {
          if (item.creator === shipName)
            currentShipVoted = { vote: false, voteId: item.id };

          downVotes++;
        }

        //we count the up/down vote
        newVotes.push(item);
        newVoteMap.set(item['parent_id'], {
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

  useEffect(() => {
    //add our api instance to the store
    setApi(lexiconIPC);
  }, [lexiconIPC]);

  useEffect(() => {
    //listen to updates from LexiconIPC
    if (update) {
      updateHandler(update);
    }
  }, [update]);
  useEffect(() => {
    setShipName(shipName);
  }, [shipName]);

  useEffect(() => {
    //redirect once using <navigate/>
    setAppInit(true);
  }, []);

  if (!api) return null;

  return (
    <main
      style={{
        overflowY: 'auto',
        height: '100vh',
        backgroundColor: 'transparent',
      }}
    >
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route element={<Navigation selectedSpace={selectedSpace} />}>
            <Route path="/:ship/:group/:word" element={<WordPage />} />
            <Route path="/:ship/:group" element={<HomePage />} />
            <Route path="/dict/:word" element={<DictionaryPage />} />
            <Route
              path="/"
              element={<p>don't mind me just redirecting over here</p>}
            />
          </Route>
        </Routes>
        {!appInit && <Navigate to={selectedSpace} />}
      </BrowserRouter>
    </main>
  );
};

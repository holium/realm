import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Word } from '../components/Word';
import { Store, useStore } from '../store';
import { log } from '../utils';

export const WordPage = () => {
  const api = useStore((store: Store) => store.api);
  const space = useStore((state: Store) => state.space);

  const { state } = useLocation();
  const navigate = useNavigate();
  const definitionMap = useStore((state: Store) => state.definitionMap);
  const sentenceMap = useStore((state: Store) => state.sentenceMap);
  const voteMap = useStore((state: Store) => state.voteMap);

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
    navigate('/dict/' + state.word);
  };
  return (
    <Word
      space={space}
      state={state}
      definitionList={definitionList}
      sentenceList={sentenceList}
      votes={votes}
      removeWord={removeWord}
      goToDict={goToDict}
    />
  );
};

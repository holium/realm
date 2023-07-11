import { useNavigate } from 'react-router-dom';

import { Home } from '../components';
import { Store, useStore } from '../store';

export const HomePage = () => {
  const navigate = useNavigate();

  const addModalOpen = useStore((state: Store) => state.addModalOpen);
  const voteMap = useStore((state: Store) => state.voteMap);
  const wordList = useStore((state: Store) => state.wordList);
  const loadingMain = useStore((state: Store) => state.loadingMain);

  console.log('wordList', wordList);

  return (
    <Home
      navigate={navigate}
      addModalOpen={addModalOpen}
      voteMap={voteMap}
      wordList={wordList}
      loadingMain={loadingMain}
    />
  );
};

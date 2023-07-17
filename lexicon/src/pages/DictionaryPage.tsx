import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Dictionary } from '../components';
import { Store, useStore } from '../store';

export const DictionaryPage = () => {
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
    <Dictionary
      navigate={navigate}
      word={word}
      defs={defs}
      loading={loading}
      noResults={noResults}
    />
  );
};

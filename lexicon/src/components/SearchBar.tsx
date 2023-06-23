import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  Flex,
  Icon,
  Text,
  TextInput,
} from '@holium/design-system';

import { Store, useStore } from '../store';

interface Props {
  addModalOpen: boolean;
  onAddWord: () => void;
  backButton: boolean;
  onBack: () => void;
}
export const SearchBar = ({
  onAddWord,
  addModalOpen,
  backButton,
  onBack,
}: Props) => {
  const space = useStore((store: Store) => store.space);
  const wordList = useStore((store: Store) => store.wordList);
  const setAddModalOpen = useStore((state: Store) => state.setAddModalOpen);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matchedWords, setMatchedWords] = useState<any>([]);
  const [displaySuggestions, setDisplaySuggestions] = useState<boolean>(false);

  const handleSearchQueryChnage = (
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newMatchedWords: any = wordList.filter((item: any) => {
      return item.word.toLowerCase().includes(evt.target.value.toLowerCase());
    });
    if (!evt.target.value) {
      setDisplaySuggestions(false);
    } else {
      setDisplaySuggestions(true);
    }
    setMatchedWords(newMatchedWords);
    setSearchQuery(evt.target.value);
  };

  const onWordClick = (selectedWord: any) => {
    const { word, id, createdAt, votes, webSearch } = selectedWord;
    //if we navigate using the search bar, make sure it's closed
    setAddModalOpen(false);
    if (webSearch) {
      navigate('/index.html/dict/' + word);
    } else {
      navigate('/index.html' + space + '/' + word, {
        state: { id, word, createdAt, votes, webSearch },
      });
    }
    resetSearch();
  };
  const resetSearch = () => {
    setSearchQuery('');
    setDisplaySuggestions(false);
    setMatchedWords([]);
  };
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    data: any
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onWordClick(data);
    }
  };
  return (
    <Flex
      flex={1}
      gap={10}
      justifyContent={'center'}
      style={{ position: 'relative', width: '80%' }}
      marginTop="14px"
      marginBottom="14px"
      maxHeight="34px"
    >
      {backButton && (
        <Button.IconButton onClick={() => onBack()}>
          <Icon name="ArrowLeftLine" size={22} />
        </Button.IconButton>
      )}
      <TextInput
        id="search-input"
        name="search"
        required
        leftAdornment={<Icon name="Search" size={16} opacity={0.7} />}
        style={{
          paddingLeft: 9,
          flex: 1,
        }}
        height={'30px'}
        value={searchQuery}
        placeholder="Search words"
        error={false}
        onChange={handleSearchQueryChnage}
      />
      {displaySuggestions && (
        <Card
          padding={'5px'}
          elevation={4}
          width={'100%'}
          style={{ position: 'absolute', left: 0, top: 40, zIndex: 1 }}
        >
          <Flex flexDirection={'column'}>
            {matchedWords.map((item: any, index: number) => {
              return (
                <Box
                  key={'search-suggestion-' + index}
                  className="highlight-hover"
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                  }}
                  tabIndex={0}
                  onClick={() => onWordClick(item)}
                  onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyDown(event, item)
                  }
                >
                  <Text.Body fontWeight={500}> {item.word}</Text.Body>
                </Box>
              );
            })}

            <Box
              key={'search-suggestion-search-web'}
              className="highlight-hover"
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
              }}
              tabIndex={0}
              onClick={() =>
                onWordClick({ word: searchQuery, webSearch: true })
              }
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(event, { word: searchQuery, webSearch: true })
              }
            >
              <Text.Body fontWeight={500} opacity={0.7}>
                search web for: {searchQuery}?
              </Text.Body>
            </Box>
          </Flex>
        </Card>
      )}
      {!backButton && (
        <Button.TextButton
          fontSize={1}
          fontWeight={500}
          onClick={() => onAddWord()}
          disabled={addModalOpen}
        >
          Add Word
        </Button.TextButton>
      )}
    </Flex>
  );
};

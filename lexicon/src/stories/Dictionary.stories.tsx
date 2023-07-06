import { Flex } from '@holium/design-system';

import { SearchBar } from '../components';
import { Dictionary } from '../pages';

export default {
  title: 'Lexicon/Dictionary Definition',
  component: Dictionary,
};

export const Default = () => (
  <Flex flexDirection="column" alignItems={'center'} marginBottom={10}>
    <Flex flexDirection="column" alignItems={'center'} width={600}>
      <SearchBar
        onAddWord={() => null}
        addModalOpen={false}
        backButton={true}
        onBack={() => null}
        navigate={null}
      />
      <Dictionary
        navigate={null}
        defs={defs}
        word={'word'}
        loading={false}
        noResults={false}
      />
    </Flex>
  </Flex>
);
const defs = [
  {
    partOfSpeech: 'noun',
    definitions: [
      {
        definition:
          'The smallest unit of language that has a particular meaning and can be expressed by itself; the smallest discrete, meaningful unit of language. (contrast morpheme.)',
        synonyms: [],
        antonyms: [],
      },
      {
        definition: 'Something like such a unit of language:',
        synonyms: [],
        antonyms: [],
      },
      {
        definition:
          'The fact or act of speaking, as opposed to taking action. .',
        synonyms: [],
        antonyms: [],
      },
      {
        definition:
          'Something that someone said; a comment, utterance; speech.',
        synonyms: [],
        antonyms: [],
      },
      {
        definition:
          'A watchword or rallying cry, a verbal signal (even when consisting of multiple words).',
        synonyms: [],
        antonyms: [],
        example: "mum's the word",
      },
      {
        definition: 'A proverb or motto.',
        synonyms: [],
        antonyms: [],
      },
      {
        definition: 'News; tidings (used without an article).',
        synonyms: [],
        antonyms: [],
        example: 'Have you had any word from John yet?',
      },
      {
        definition:
          'An order; a request or instruction; an expression of will.',
        synonyms: [],
        antonyms: [],
        example: "Don't fire till I give the word",
      },
      {
        definition: 'A promise; an oath or guarantee.',
        synonyms: ['promise'],
        antonyms: [],
        example: 'I give you my word that I will be there on time.',
      },
      {
        definition: 'A brief discussion or conversation.',
        synonyms: [],
        antonyms: [],
        example: 'Can I have a word with you?',
      },
      {
        definition: '(in the plural) See words.',
        synonyms: [],
        antonyms: [],
        example:
          'There had been words between him and the secretary about the outcome of the meeting.',
      },
      {
        definition:
          '(sometimes Word) Communication from God; the message of the Christian gospel; the Bible, Scripture.',
        synonyms: ['Bible', 'word of God'],
        antonyms: [],
        example:
          'Her parents had lived in Botswana, spreading the word among the tribespeople.',
      },
      {
        definition: '(sometimes Word) Logos, Christ.',
        synonyms: ['God', 'Logos'],
        antonyms: [],
      },
    ],
    synonyms: ['Bible', 'word of God', 'God', 'Logos', 'promise', 'vocable'],
    antonyms: [],
  },
  {
    partOfSpeech: 'verb',
    definitions: [
      {
        definition:
          'To say or write (something) using particular words; to phrase (something).',
        synonyms: ['express', 'phrase', 'put into words', 'state'],
        antonyms: [],
        example: 'I’m not sure how to word this letter to the council.',
      },
      {
        definition: 'To flatter with words, to cajole.',
        synonyms: [],
        antonyms: [],
      },
      {
        definition: 'To ply or overpower with words.',
        synonyms: [],
        antonyms: [],
      },
      {
        definition: 'To conjure with a word.',
        synonyms: [],
        antonyms: [],
      },
      {
        definition: 'To speak, to use words; to converse, to discourse.',
        synonyms: [],
        antonyms: [],
      },
    ],
    synonyms: ['express', 'phrase', 'put into words', 'state'],
    antonyms: [],
  },
  {
    partOfSpeech: 'interjection',
    definitions: [
      {
        definition:
          'Truth, indeed, that is the truth! The shortened form of the statement "My word is my bond."',
        synonyms: [],
        antonyms: [],
        example:
          '"Yo, that movie was epic!" / "Word?" ("You speak the truth?") / "Word." ("I speak the truth.")',
      },
      {
        definition:
          '(stereotypically) An abbreviated form of word up; a statement of the acknowledgment of fact with a hint of nonchalant approval.',
        synonyms: [],
        antonyms: [],
      },
    ],
    synonyms: [],
    antonyms: [],
  },
];

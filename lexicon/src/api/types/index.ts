import { Schema } from './bedrock';

export const WordSchema: Schema = [['word', 't']];

export const DefinitionSchema: Schema = [
  ['definition', 't'],
  ['word-id', 'id'],
];

export const SentenceSchema: Schema = [
  ['sentence', 't'],
  ['word-id', 'id'],
];

export const RelatedSchema: Schema = [
  ['related', 't'],
  ['word-id', 'id'],
];

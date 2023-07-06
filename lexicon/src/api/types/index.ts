import { Schema } from './bedrock';

export const WordSchema: Schema = [
  ['word', 't'],
  ['votes', 'map'],
];

export const DefinitionSchema: Schema = [
  ['definition', 't'],
  ['word-id', 'id'],
  ['votes', 'map'],
];

export const SentenceSchema: Schema = [
  ['sentence', 't'],
  ['word-id', 'id'],
  ['votes', 'map'],
];

export const RelatedSchema: Schema = [
  ['related', 't'],
  ['word-id', 'id'],
  ['votes', 'map'],
];

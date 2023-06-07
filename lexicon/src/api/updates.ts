import { dbChange, dbChanges } from './types/bedrock';

const changesHandler = (changes: dbChanges) => {
  console.log('Handled changes!');
  console.log({ changes: changes });
  for (const change of changes) {
    changeHandler(change);
  }
};

const changeHandler = (change: dbChange) => {
  console.log({ change: change });
};

export { changesHandler };

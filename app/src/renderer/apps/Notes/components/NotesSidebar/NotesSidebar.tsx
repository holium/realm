import { useState } from 'react';
import { observer } from 'mobx-react';

import type { NotesStore_Note } from 'renderer/stores/notes/notes.store.types';
import { useShipStore } from 'renderer/stores/ship.store';

import { schema } from '../Editor/schema';
import { NotesSidebarView } from './NotesSidebarView';

type Props = {
  myNotes: NotesStore_Note[];
  isPersonalSpace: boolean;
  spacePath: string | undefined;
  spaceTitle: string | undefined;
  spaceNotes: NotesStore_Note[] | undefined;
  selectedNote: NotesStore_Note | undefined;
  setSelectedNote: (note: NotesStore_Note) => void;
};

const NotesSidebarPresenter = ({
  myNotes,
  isPersonalSpace,
  spaceTitle,
  spacePath,
  spaceNotes,
  selectedNote,
  setSelectedNote,
}: Props) => {
  const { notesStore } = useShipStore();

  const [_, setSearchString] = useState<string>('');

  const onClickNewNote = async () => {
    if (!spacePath) return;

    const newDoc = schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('\n')]),
    ]);
    const newDocJSON = newDoc.toJSON();
    const noteId = notesStore.createNote({
      title: 'My note',
      doc: newDocJSON,
      space: spacePath,
    });
    console.log('noteId', noteId);
  };

  return (
    <NotesSidebarView
      myNotes={myNotes}
      isPersonalSpace={isPersonalSpace}
      spaceTitle={spaceTitle}
      spaceNotes={spaceNotes}
      selectedNote={selectedNote}
      setSelectedNote={setSelectedNote}
      onChangeSearchInput={setSearchString}
      onClickNewNote={onClickNewNote}
    />
  );
};

export const NotesSidebar = observer(NotesSidebarPresenter);

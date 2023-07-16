import { useState } from 'react';

import type { NotesStore_Note } from 'renderer/stores/notes/notes.store.types';

import { Editor } from '../Editor/Editor';
import { NoteHeader } from '../NoteHeader/NoteHeader';
import { NotesSidebar } from '../NotesSidebar/NotesSidebar';
import {
  NotesContainer,
  NotesViewContainer,
  NoteView,
} from './NotesBody.styles';

type Props = {
  myNotes: NotesStore_Note[];
  isPersonalSpace: boolean;
  spaceTitle: string | undefined;
  spacePath: string | undefined;
  spaceNotes: NotesStore_Note[] | undefined;
};

export const NotesBody = ({
  myNotes,
  isPersonalSpace,
  spaceTitle,
  spacePath,
  spaceNotes,
}: Props) => {
  const [selectedNote, setSelectedNote] = useState<
    NotesStore_Note | undefined
  >();

  return (
    <NotesContainer>
      <NotesSidebar
        myNotes={myNotes}
        isPersonalSpace={isPersonalSpace}
        spacePath={spacePath}
        spaceTitle={spaceTitle}
        spaceNotes={spaceNotes}
        selectedNote={selectedNote}
        setSelectedNote={setSelectedNote}
      />
      <NotesViewContainer>
        {selectedNote && (
          <NoteView key={selectedNote.id}>
            <NoteHeader
              noteTitle={selectedNote.title}
              noteAuthor={selectedNote.author}
              onClickDelete={() => {
                // NotesIPC.deleteNote(selectedNote.id);
              }}
            />
            <Editor
              noteId={selectedNote.id}
              noteTitle={selectedNote.title}
              noteDoc={selectedNote.doc}
            />
          </NoteView>
        )}
      </NotesViewContainer>
    </NotesContainer>
  );
};

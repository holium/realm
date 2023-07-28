import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';

import { useShipStore } from 'renderer/stores/ship.store';

import { NotesSidebar } from './components/NotesSidebar/NotesSidebar';
import { NoteView } from './components/NoteView/NoteView';
import { NotesContainer } from './Notes.styles';

const NotesPresenter = () => {
  const { spacesStore, notesStore } = useShipStore();

  const selectedSpace = useMemo(
    () => spacesStore.selected,
    [spacesStore.selected]
  );

  useEffect(() => {
    notesStore.setSelectedNoteId({ id: null });

    if (!selectedSpace?.path) return;

    if (!selectedSpace.isOur) {
      // Load space if it's not our personal space.
      notesStore.loadLocalSpaceNotes({ space: selectedSpace.path });
    }

    // Always load personal notes.
    notesStore.loadLocalPersonalNotes({ space: `/${window.ship}/our` });

    // Always load notes updates.
    notesStore.applyNotesUpdates();

    // Connect to bedrock.
    notesStore.connectToBedrock({ space: selectedSpace.path });
  }, [selectedSpace?.path]);

  return (
    <NotesContainer>
      <NotesSidebar />
      <NoteView />
    </NotesContainer>
  );
};

export const Notes = observer(NotesPresenter);

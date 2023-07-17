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
    if (!selectedSpace) return;

    if (!selectedSpace.isOur) {
      // Load space if it's not our personal space.
      notesStore.loadLocalSpaceNotes({ space: selectedSpace.path });
    }

    // Always load personal notes.
    notesStore.loadLocalPersonalNotes({ space: `/${window.ship}/our` });

    // Subscribe to Bedrock updates.
    notesStore.subscribeToBedrockUpdates({ space: selectedSpace.path });

    // Sync local notes with Bedrock.
    // notesStore.syncLocalNotesWithBedrock(selectedSpace.path);
  }, [selectedSpace]);

  return (
    <NotesContainer>
      <NotesSidebar />
      <NoteView />
    </NotesContainer>
  );
};

export const Notes = observer(NotesPresenter);

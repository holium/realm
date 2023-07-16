import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';

import { useAppState } from 'renderer/stores/app.store';
import { NotesIPC } from 'renderer/stores/ipc';
import { useShipStore } from 'renderer/stores/ship.store';

import { NotesBody } from './components/NotesBody/NotesBody';

const NotesPresenter = () => {
  const { loggedInAccount } = useAppState();
  const { spacesStore, notesStore } = useShipStore();

  const spacePath = useMemo(
    () => spacesStore.selected?.path,
    [spacesStore.selected?.path]
  );
  const ourSpacePath = useMemo(
    () => '/' + loggedInAccount?.serverId + '/our',
    [loggedInAccount?.serverId]
  );
  const isPersonalSpace = useMemo(
    () => spacePath === ourSpacePath,
    [spacePath, ourSpacePath]
  );

  useEffect(() => {
    if (!spacePath) return;

    if (!isPersonalSpace) {
      notesStore.loadSpaceNotes(spacePath);
    }

    notesStore.loadMyNotes(ourSpacePath);
  }, [spacePath, ourSpacePath, isPersonalSpace]);

  useEffect(() => {
    if (spacePath) NotesIPC.subscribe(spacePath);
  }, [spacePath]);

  return (
    <NotesBody
      myNotes={notesStore.myNotes}
      isPersonalSpace={isPersonalSpace}
      spaceTitle={spacesStore.selected?.name}
      spacePath={spacePath}
      spaceNotes={notesStore.spaceNotes}
    />
  );
};

export const Notes = observer(NotesPresenter);

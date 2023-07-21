import debounce from 'lodash/debounce';
import { observer } from 'mobx-react';

import { Flex, Spinner } from '@holium/design-system/general';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useShipStore } from 'renderer/stores/ship.store';

import { EditorView } from './EditorView';

import './prosemirror.css';

const EditorPresenter = () => {
  const shipStore = useShipStore();
  const roomsStore = useRoomsStore();

  const { selectedNote, updateNote } = shipStore.notesStore;

  if (!selectedNote) return null;

  const onBlurDoc = debounce((newHistory: string[]) => {
    updateNote({
      id: selectedNote.id,
      history: newHistory,
    });
  }, 1000);

  // const onChangeDoc = (doc: Node) => {
  //   if (selectedNote.doc.content.eq(doc.content)) return;

  //   notesStore._updateNoteLocally({
  //     id: selectedNote.id,
  //     doc,
  //   });
  // };

  if (!roomsStore.currentRoom)
    return (
      <Flex flex={1} justifyContent="center" alignItems="center" height="100%">
        <Spinner size="24px" />
      </Flex>
    );

  return (
    <EditorView
      history={selectedNote.history}
      roomsStore={roomsStore}
      shipStore={shipStore}
      onBlurDoc={onBlurDoc}
    />
  );
};

export const Editor = observer(EditorPresenter);

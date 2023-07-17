import { useShipStore } from 'renderer/stores/ship.store';

import { NoteHeaderTitleInput } from './NoteHeaderTitle.styles';

export const NoteHeaderTitle = () => {
  const { notesStore } = useShipStore();

  const { selectedNoteId } = notesStore;

  if (!selectedNoteId) return null;

  const selectedNote = notesStore.getNoteById(selectedNoteId);

  const onChangeTitle = (title: string) => {
    if (!selectedNote) return;
    notesStore._updateNoteLocally({
      id: selectedNote.id,
      title,
    });
  };

  const onBlurTitle = () => {
    if (!selectedNote) return;
    notesStore.persistLocalNoteChanges(selectedNote.id);
  };

  return (
    <NoteHeaderTitleInput
      id="note-title-input"
      name="note-title-input"
      value={selectedNote?.title}
      placeholder="Title"
      onChange={(e) => onChangeTitle(e.target.value)}
      onBlur={onBlurTitle}
    />
  );
};

import { fromUint8Array } from 'js-base64';
import { DebouncedFunc } from 'lodash';
import { Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
import * as Y from 'yjs';

import { NotesBroadcastChannel } from './Editor';
import { ySyncPluginKey } from './plugins/keys';
import {
  OnAwarenessUpdate,
  OnYdocUpdate,
  useEditorView,
} from './useEditorView';

import './prosemirror.css';

// Set of edits that have not yet been sent to the server.
let editQueue: string[] = [];

type Props = {
  ydoc: Y.Doc;
  awareness: Awareness;
  broadcast: (channel: NotesBroadcastChannel, data: string) => void;
  onSave: DebouncedFunc<(editQueue: string[]) => Promise<void>>;
};

export const EditorView = ({ ydoc, awareness, broadcast, onSave }: Props) => {
  const onYdocUpdate: OnYdocUpdate = (update, origin) => {
    const base64EncodedUpdate = fromUint8Array(update);

    // Only broadcast updates that originate from us.
    if (origin === ySyncPluginKey) {
      broadcast(NotesBroadcastChannel.YDocUpdate, base64EncodedUpdate);
    }

    editQueue = [...editQueue, base64EncodedUpdate];

    onSave(editQueue)?.then(() => {
      editQueue = [];
    });
  };

  const onAwarenessUpdate: OnAwarenessUpdate = (
    { added, updated, removed },
    origin
  ) => {
    // Only broadcast updates that originate from us.
    if (origin !== 'local') return;

    const changedClients = added.concat(updated).concat(removed);
    const awarenessUpdate = encodeAwarenessUpdate(awareness, changedClients);

    broadcast(
      NotesBroadcastChannel.AwarenessUpdate,
      fromUint8Array(awarenessUpdate)
    );
  };

  const { onEditorRef } = useEditorView({
    ydoc,
    awareness,
    onYdocUpdate,
    onAwarenessUpdate,
  });

  return (
    <div className="editor-container">
      <div ref={onEditorRef} style={{ flex: 1 }} />
    </div>
  );
};

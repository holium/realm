import { useEffect } from 'react';
import { fromUint8Array } from 'js-base64';
import { Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
import * as Y from 'yjs';

import { NotesBroadcastChannel } from './Editor';
import { ySyncPluginKey } from './plugins/keys';
import { UserMetadata } from './plugins/y-caret-plugin';
import { useEditorView } from './useEditorView';

import './prosemirror.css';

type OnYdocUpdate = (update: Uint8Array, origin: any) => void;

type OnAwarenessChange = (
  update: {
    added: number[];
    updated: number[];
    removed: number[];
  },
  origin: any
) => void;

type Props = {
  user: UserMetadata;
  ydoc: Y.Doc;
  awareness: Awareness;
  broadcast: (channel: NotesBroadcastChannel, data: string) => void;
  onChange: (base64EncodedUpdate: string) => void;
};

export const EditorView = ({
  user,
  ydoc,
  awareness,
  broadcast,
  onChange,
}: Props) => {
  const { onEditorRef } = useEditorView({
    user,
    ydoc,
    awareness,
  });

  const onYdocUpdate: OnYdocUpdate = (update, origin) => {
    const base64EncodedUpdate = fromUint8Array(update);

    // Only broadcast updates that originate from us.
    if (origin === ySyncPluginKey) {
      broadcast(NotesBroadcastChannel.YDocUpdate, base64EncodedUpdate);
    }

    onChange(base64EncodedUpdate);
  };

  const onAwarenessChange: OnAwarenessChange = (
    { added, updated, removed },
    origin
  ) => {
    // Only broadcast updates that originate from us.
    if (origin !== 'local') return;
    console.log('onAwarenessChange');

    const changedClients = added.concat(updated).concat(removed);
    const awarenessUpdate = encodeAwarenessUpdate(awareness, changedClients);

    broadcast(
      NotesBroadcastChannel.AwarenessUpdate,
      fromUint8Array(awarenessUpdate)
    );
  };

  useEffect(() => {
    // Set up listeners for updates to the ydoc and awareness.
    ydoc.on('update', onYdocUpdate);
    awareness.on('change', onAwarenessChange);

    return () => {
      ydoc._observers.delete('change');
      awareness._observers.delete('change');
    };
  }, []);

  return (
    <div className="editor-container">
      <div ref={onEditorRef} style={{ flex: 1 }} />
    </div>
  );
};

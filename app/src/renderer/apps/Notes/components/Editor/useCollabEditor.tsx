import { useEffect, useState } from 'react';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { exampleSetup } from 'prosemirror-example-setup';
import { redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as Y from 'yjs';

import { PresenceBroadcast } from '@holium/realm-presence';

import {
  DataPacket,
  DataPacketKind,
} from 'renderer/apps/Rooms/store/room.types';
import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useShipStore } from 'renderer/stores/ship.store';

import { ySyncPlugin, yUndoPlugin } from './plugins/y-prosemirror';
import { schema } from './schema';

type Props = {
  history: string[];
  shipStore: ReturnType<typeof useShipStore>;
  roomsStore: ReturnType<typeof useRoomsStore>;
};

export const useCollabEditor = ({ history, roomsStore }: Props) => {
  const [ydoc, setYdoc] = useState<Y.Doc>();
  const [editorView, setEditorView] = useState<EditorView>();

  useEffect(() => {
    if (!ydoc) return;

    // Listen.const onDataChannel = async (
    const onDataChannel = async (
      _rid: string,
      _peer: string,
      data: DataPacket
    ) => {
      const broadcastPayload = data.value.broadcast;
      console.log('RECEEEEEIVED.', broadcastPayload);
      if (!broadcastPayload) return;
      if (broadcastPayload.event !== 'broadcast') return;

      const [update] = broadcastPayload.data;
      const binaryEncodedUpdate = toUint8Array(update as string);
      console.log('update RECEIVED', binaryEncodedUpdate);
      Y.applyUpdate(ydoc, binaryEncodedUpdate);
    };

    roomsStore.registerListeners({
      onLeftRoom: () => {},
      onDataChannel,
    });
  }, [ydoc, roomsStore]);

  const broadcast = (update: string, ydoc: Y.Doc) => {
    // Apply the update to this provider
    const binaryEncodedUpdate = toUint8Array(update);
    Y.applyUpdate(ydoc, binaryEncodedUpdate);

    const broadcast: PresenceBroadcast = {
      event: 'broadcast',
      data: [update],
    };
    roomsStore.sendDataToRoom({
      kind: DataPacketKind.DATA,
      value: { broadcast },
    });
  };

  useEffect(() => {
    if (!ydoc) return;
    // Set up broadcasting.
    ydoc.on('update', (update: Uint8Array) => {
      const base64EncodedUpdate = fromUint8Array(update);
      console.log('BROADCAST-ING', base64EncodedUpdate);
      broadcast(base64EncodedUpdate, ydoc);
    });
  }, [ydoc]);

  const onEditorRef = (editorRef: HTMLDivElement) => {
    // Wait for the editor to be mounted.
    if (!editorRef) return;
    // Only initialize the editor once.
    if (ydoc || editorView) return;

    // Initialize the ydoc with the history from the database.
    const freshYdoc = new Y.Doc();
    history.forEach((base64EncodedUpdate) => {
      const binaryEncodedUpdate = toUint8Array(base64EncodedUpdate);
      Y.applyUpdate(freshYdoc, binaryEncodedUpdate);
    });

    const type = freshYdoc.getXmlFragment('prosemirror');
    const prosemirrorView = new EditorView(editorRef, {
      state: EditorState.create({
        schema,
        plugins: [
          ySyncPlugin(type),
          // yCursorPlugin(provider.awareness),
          yUndoPlugin(),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
          }),
        ].concat(exampleSetup({ schema })),
      }),
    });

    setYdoc(freshYdoc);
    setEditorView(prosemirrorView);
  };

  return { ydoc, editorView, onEditorRef };
};

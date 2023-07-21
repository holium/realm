import { useEffect, useState } from 'react';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { exampleSetup } from 'prosemirror-example-setup';
import { redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import * as Y from 'yjs';

import { PresenceBroadcast } from '@holium/realm-presence';

import {
  DataPacket,
  DataPacketKind,
} from 'renderer/apps/Rooms/store/room.types';
import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';

import { ySyncPlugin, yUndoPlugin } from './plugins/y-prosemirror';
import { schema } from './schema';

type Props = {
  updates: string[];
  roomsStore: ReturnType<typeof useRoomsStore>;
  onChangeDoc: (newHistory: string) => void;
};

export const useCollabEditor = ({
  updates,
  roomsStore,
  onChangeDoc,
}: Props) => {
  const [ydoc, setYdoc] = useState<Y.Doc>();
  const [editorView, setEditorView] = useState<EditorView>();

  useEffect(() => {
    if (!ydoc) return;

    // Listen to updates from other peers.
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

    // Set up broadcasting and automatic saving.
    ydoc.on('update', (update: Uint8Array) => {
      const base64EncodedUpdate = fromUint8Array(update);
      console.log('BROADCAST-ING', base64EncodedUpdate);
      broadcast(base64EncodedUpdate, ydoc);
      onChangeDoc(base64EncodedUpdate);
    });
  }, [ydoc]);

  const onEditorRef = (editorRef: HTMLDivElement) => {
    // Only initialize the editor once.
    if (ydoc || editorView) return;

    // Initialize the ydoc with the history from the database.
    const newYdoc = new Y.Doc();
    console.log('applying updates', updates);
    updates.forEach((update) => {
      const binaryEncodedUpdate = toUint8Array(update);
      Y.applyUpdate(newYdoc, binaryEncodedUpdate);
    });

    const type = newYdoc.getXmlFragment('prosemirror');
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
          new Plugin({
            props: {
              decorations(state) {
                const decorations: Decoration[] = [];
                const { doc, selection } = state;
                const { from, to } = selection;
                doc.descendants((node, pos) => {
                  if (node.type.name === 'paragraph') {
                    const isCurrent = from >= pos && to <= pos + node.nodeSize;
                    const className = isCurrent
                      ? 'text-cursor current-element'
                      : 'text-cursor';
                    decorations.push(
                      Decoration.node(pos, pos + node.nodeSize, {
                        class: className,
                      })
                    );
                  }
                });
                return DecorationSet.create(doc, decorations);
              },
            },
          }),
        ].concat(exampleSetup({ schema })),
      }),
    });

    setYdoc(newYdoc);
    setEditorView(prosemirrorView);
  };

  return { editorView, onEditorRef };
};

import { sigil, stringRenderer } from '@tlon/sigil-js';
import * as math from 'lib0/math';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationAttrs, DecorationSet } from 'prosemirror-view';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

import { yCaretPluginKey, ySyncPluginKey } from './keys';
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  setMeta,
} from './lib';

export type UserMetadata = {
  patp: string;
  nickname: string | null;
  color: string;
  avatar: string | null;
};

export const cursorBuilder = (user: UserMetadata) => {
  const cursor = document.createElement('span');
  cursor.classList.add('ProseMirror-yjs-cursor');
  cursor.setAttribute('style', `border-color: rgba(${user.color}, 1)`);
  const userDiv = document.createElement('div');
  userDiv.classList.add('ProseMirror-yjs-cursor-user');
  userDiv.setAttribute(
    'style',
    `
    background-color: rgba(${user.color}, 0.5);
    border: 1px solid rgba(${user.color}, 1);
    `
  );

  let avatar = document.createElement('div');
  avatar.classList.add('ProseMirror-yjs-avatar');
  if (user.avatar) {
    avatar = document.createElement('img');
    avatar.setAttribute('src', user.avatar);
  } else {
    const svgString = sigil({
      patp: user.patp,
      size: 16,
      icon: true,
      margin: false,
      renderer: stringRenderer,
    });
    avatar = document.createElement('div');
    avatar.classList.add('ProseMirror-yjs-avatar');
    avatar.innerHTML = svgString;
  }
  userDiv.insertBefore(avatar, null);
  cursor.insertBefore(userDiv, null);

  return cursor;
};

export const selectionBuilder = (user: UserMetadata): DecorationAttrs => {
  return {
    style: `background-color: rgba(${user.color}, 0.3)`,
    class: 'ProseMirror-yjs-selection',
  };
};

export const createDecorations = (
  state: EditorState,
  awareness: Awareness,
  createCursor: typeof cursorBuilder,
  createSelection: typeof selectionBuilder
): DecorationSet => {
  const ystate = ySyncPluginKey.getState(state);
  const y = ystate.doc;
  const decorations: Decoration[] = [];

  if (
    ystate.snapshot != null ||
    ystate.prevSnapshot != null ||
    ystate.binding === null
  ) {
    // do not render cursors while snapshot is active
    return DecorationSet.create(state.doc, []);
  }

  awareness.getStates().forEach((aw, clientId) => {
    if (clientId === y.clientID) {
      return;
    }

    if (!aw.cursor?.user) return;

    const user = aw.cursor.user;

    if (aw.cursor != null) {
      let anchor = relativePositionToAbsolutePosition(
        y,
        ystate.type,
        Y.createRelativePositionFromJSON(aw.cursor.anchor),
        ystate.binding.mapping
      );
      let head = relativePositionToAbsolutePosition(
        y,
        ystate.type,
        Y.createRelativePositionFromJSON(aw.cursor.head),
        ystate.binding.mapping
      );
      if (anchor !== null && head !== null) {
        const maxsize = math.max(state.doc.content.size - 1, 0);
        anchor = math.min(anchor, maxsize);
        head = math.min(head, maxsize);
        decorations.push(
          Decoration.widget(head, () => createCursor(user), {
            key: clientId + '',
            side: 10,
          })
        );
        const from = math.min(anchor, head);
        const to = math.max(anchor, head);
        decorations.push(
          Decoration.inline(from, to, createSelection(user), {
            inclusiveEnd: true,
            inclusiveStart: false,
          })
        );
      }
    }
  });

  return DecorationSet.create(state.doc, decorations);
};

/**
 * A prosemirror plugin that listens to awareness information on Yjs.
 * This requires that a `prosemirrorPlugin` is also bound to the prosemirror.
 */
export const yCaretPlugin = (awareness: Awareness, user: UserMetadata) => {
  return new Plugin({
    key: yCaretPluginKey,
    state: {
      init(_, state) {
        return createDecorations(
          state,
          awareness,
          cursorBuilder,
          selectionBuilder
        );
      },
      apply(tr, prevState, _oldState, newState) {
        const ystate = ySyncPluginKey.getState(newState);
        const yCursorState = tr.getMeta(yCaretPluginKey);
        if (
          (ystate && ystate.isChangeOrigin) ||
          (yCursorState && yCursorState.awarenessUpdated)
        ) {
          return createDecorations(
            newState,
            awareness,
            cursorBuilder,
            selectionBuilder
          );
        }
        return prevState.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations: (state) => {
        return yCaretPluginKey.getState(state);
      },
    },
    view: (view) => {
      const awarenessListener = () => {
        // @ts-ignore
        if (view.docView) {
          setMeta(view, yCaretPluginKey, { awarenessUpdated: true });
        }
      };
      const updateCursorInfo = () => {
        const ystate = ySyncPluginKey.getState(view.state);
        // @note We make implicit checks when checking for the cursor property
        const current = awareness.getLocalState() || {};
        if (ystate.binding == null) {
          return;
        }
        if (view.hasFocus()) {
          const selection = view.state.selection;
          const anchor = absolutePositionToRelativePosition(
            selection.anchor,
            ystate.type,
            ystate.binding.mapping
          );
          const head = absolutePositionToRelativePosition(
            selection.head,
            ystate.type,
            ystate.binding.mapping
          );
          if (
            current.cursor == null ||
            !Y.compareRelativePositions(
              Y.createRelativePositionFromJSON(current.cursor.anchor),
              anchor
            ) ||
            !Y.compareRelativePositions(
              Y.createRelativePositionFromJSON(current.cursor.head),
              head
            )
          ) {
            awareness.setLocalStateField('cursor', {
              anchor,
              head,
              user,
            });
          }
        } else if (
          current.cursor != null &&
          relativePositionToAbsolutePosition(
            ystate.doc,
            ystate.type,
            Y.createRelativePositionFromJSON(current.cursor.anchor),
            ystate.binding.mapping
          ) !== null
        ) {
          // delete cursor information if current cursor information is owned by this editor binding
          awareness.setLocalStateField('cursor', null);
        }
      };
      awareness.on('change', awarenessListener);
      view.dom.addEventListener('focusin', updateCursorInfo);
      view.dom.addEventListener('focusout', updateCursorInfo);
      return {
        update: updateCursorInfo,
        destroy: () => {
          view.dom.removeEventListener('focusin', updateCursorInfo);
          view.dom.removeEventListener('focusout', updateCursorInfo);
          awareness.off('change', awarenessListener);
          awareness.setLocalStateField('cursor', null);
        },
      };
    },
  });
};

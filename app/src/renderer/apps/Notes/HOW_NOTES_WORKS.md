# How Notes works

Notes is a simple note taking app that allows realtime collaboration between multiple users.

## Realtime synchronization

Notes uses [Yjs](https://github.com/yjs/yjs) as a CRDT (conflict-free replicated data type) to synchronize edits between multiple users.

The TL;DR is that Yjs only cares about edits as a unit of change, and it doesn't care about the order in which edits are applied. This allows for a very simple synchronization algorithm: We simpy broadcast edits through WebRTC to all connected peers and each peer applies the edits in the order they arrive.

## How we persist a document

There is no one source of truth, instead we store a given document's edit history on the Urbit network which promises eventual consistency.

## When we persist a document

We autosave a document to the Urbit network after a few seconds of inactivity (debounced save). We also add on a randomized delay to avoid all clients saving at the same time.

## When we load a document

We load a document's edit history from the Urbit network and apply all edits to the document upon opening the app.

If a multiplayer session is active, the broadcasted edits will take presedence over a potentially ongoing Urbit-sync.

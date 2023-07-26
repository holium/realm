# Notes - Explained

Notes is a simple note taking app that allows realtime collaboration between multiple clients.

## How we broadcast edits in real time

Notes uses [Yjs](https://github.com/yjs/yjs) as a CRDT to resolve edits between multiple clients.

**The CRDT only cares about edits as a unit of change, and it doesn't care about which order edits are applied**. This allows for a simple synchronization algorithm.

We simply broadcast edits through WebRTC to all connected peers, and every peer applies the edits in the order they arrive.

## How we persist edits

There is no one source of truth, instead, we save every edit made to a document, both locally, and to every ship on the Urbit network, which guarantees **eventual consistency**.

### Autosaving

Saving is done automatically after a few seconds of inactivity (debounced save). We also add on a randomized delay to avoid multiple clients poking the network at the same time.

### Loading documents

Upon opening the Notes app, we do an initial sync of all edits with the Urbit network and apply them to the documents. Syncing is done in two directions:

1. The first direction is from Urbit -> client.
2. The second direction is client -> Urbit.

Note that the order is arbitrary, we just want to make sure neither side has edits that the other side doesn't have.

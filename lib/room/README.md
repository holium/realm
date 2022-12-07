# Rooms primitive

**NOTE**: This is a redefined spec that is not currently implemented.

A presence lib and agents for Realm and Realm-enabled applications.

## Usage

```js
export const rooms = new RealmRooms();
// init with our patp
rooms.init('~zod');
const room = new
```

## `@holium/rooms` lib

Allows for developers to interface with the rooms primitive.

There are a few concepts to detail here:

- `Room`: a class that manages all updates and actions sent to the rooms provider agent. Also manages the connection of peers.
  - `Slip`: arbitrary JSON data relayed peer-to-peer between participants.
  - `DataChannel`: each room will have and established data channel that propagates data between peers.
- `Participants`: an abstract class of those present in a room.
  - `LocalParticipant`: you -- manages audio and video tracks and streaming to other peers.
  - `RemoteParticipant`: the remote peers who are streaming data and tracks to you.

## The agents

There is the concept of the room provider and the room peer.

We call this the **provider-peer model**.

The room "provider" hosts of a list of rooms and manages updates for those rooms. This will usually be a space or group host.
The "provider" is the source of truth in regards to who is present, who has left the room, who is allowed into the room, etc.

A "peer" can create a room via the host and perform certain actions against the provider.

- `%rooms`: the provider agent
- `%room`: the peer agent

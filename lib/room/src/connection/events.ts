export enum ProtocolEvent {
  Ready = 'ready',
  ProviderUpdated = 'providerUpdated',
  HostLeft = 'hostLeft',
  PeerAdded = 'peerAdded',
  PeerRemoved = 'peerRemoved',
  RoomUpdated = 'roomUpdated',
  RoomInitial = 'roomInitial',
  CreatingRoom = 'creatingRoom',
  RoomEntered = 'roomEntered',
  RoomLeft = 'roomLeft',
  RoomCreated = 'roomCreated',
  RoomDeleted = 'roomDeleted',
  PeerDataReceived = 'peerDataReceived',
}

import type LocalAudioTrack from './LocalAudioTrack';
// import type LocalVideoTrack from './LocalVideoTrack';
import type RemoteAudioTrack from './LocalAudioTrack';
// import type RemoteVideoTrack from './RemoteVideoTrack';

export type RemoteTrack = RemoteAudioTrack;
export type AudioTrack = RemoteAudioTrack | LocalAudioTrack;
// export type VideoTrack = RemoteVideoTrack | LocalVideoTrack;

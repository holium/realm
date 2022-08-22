import { RoomsModelType } from 'os/services/tray/rooms.model';
import { Patp } from 'os/types';
import { Participant } from '.';
import {
  AudioCaptureOptions,
  Track,
  TrackPublishOptions,
} from '../track/options';
import { LocalTrack } from '../track';
import { RemoteParticipant } from './remote';
import { Room } from '../room';
import { ParticipantEvent } from './events';
import { TrackEvent } from '../track/events';

export type Handshake = 'awaiting-offer' | 'offer' | 'ice-candidate' | 'answer';

export const DEFAULT_AUDIO_CONSTRAINTS = {
  channelCount: 1,
  sampleRate: 16000,
  sampleSize: 16,
  volume: 1,
  noiseSuppresion: true,
};
export class LocalParticipant extends Participant {
  isLoaded: boolean = false;
  stream?: MediaStream;
  private pendingPublishing = new Set<Track.Source>();
  private microphoneError: Error | undefined;

  constructor(patp: Patp, room: Room) {
    super(patp, room);
  }

  async connect() {
    const tracks = await this.setMicrophoneEnabled(true);
    this.audio = tracks![0];
    this.audio.on(TrackEvent.Muted, () => {
      console.log('in local participant, muting');
      this.emit(ParticipantEvent.MuteToggled, true);
    });
    this.audio.on(TrackEvent.Unmuted, () => {
      console.log('in local participant, unmuting');
      this.emit(ParticipantEvent.MuteToggled, false);
    });
    this.isLoaded = true;
  }

  get audioStream() {
    console.log(this.audio);
    return this.audio;
  }

  streamTracks(peer: RemoteParticipant) {
    if (!this.isLoaded) return;
    if (this.audio!.isMuted) return;
    console.log('streaming tracks');
    peer.replaceAudioTrack(this.audio!.mediaStreamTrack);
    // peer.streamAudioTrack(this.audio!.mediaStreamTrack);

    // this.stream!.getTracks().forEach((track: MediaStreamTrack) => {
    //   peerConn.addTrack(track, this.stream!);
    // });
  }

  getTrack(): any | undefined {
    const track = super.getTracks();
    if (track) {
      return track as MediaStreamTrack;
    }
  }

  get lastMicrophoneError(): Error | undefined {
    return this.microphoneError;
  }

  /**
   * Enable or disable a participant's microphone track.
   *
   * If a track has already published, it'll mute or unmute the track.
   * Resolves with a `LocalTrackPublication` instance if successful and `undefined` otherwise
   */
  setMicrophoneEnabled(
    enabled: boolean,
    options?: AudioCaptureOptions,
    publishOptions?: TrackPublishOptions
  ): Promise<LocalTrack[] | undefined> {
    return this.setTrackEnabled(
      Track.Source.Microphone,
      enabled,
      options,
      publishOptions
    );
  }

  /**
   * Enable or disable publishing for a track by source. This serves as a simple
   * way to manage the common tracks (camera, mic, or screen share).
   * Resolves with LocalTrackPublication if successful and void otherwise
   */
  private async setTrackEnabled(
    source: Track.Source,
    enabled: boolean,
    options?: AudioCaptureOptions,
    publishOptions?: TrackPublishOptions
  ) {
    console.log('setTrackEnabled', { source, enabled });
    let track = this.getTrack();
    if (enabled) {
      if (track) {
        await track.unmute();
      } else {
        if (this.pendingPublishing.has(source)) {
          console.info('skipping duplicate published source', { source });
          // no-op it's already been requested
          return;
        }

        this.pendingPublishing.add(source);
        // const audioOptions = { audio: options }
        try {
          const localTracks = await this.createTracks();
          return localTracks;
        } catch (e) {
          if (e instanceof Error) {
            // this.emit(ParticipantEvent.MediaDevicesError, e);
          }
          throw e;
        } finally {
          this.pendingPublishing.delete(source);
        }
        // try {
        //   // const published = this.publishTrack(localTrack, publishOptions);
        //   const publishPromises: Array<Promise<LocalTrack>> = [];
        //   for (const localTrack of localTracks) {
        //     publishPromises.push(this.publishTrack(localTrack, publishOptions));
        //   }
        // } catch (e) {
        //   if (e instanceof Error) {
        //     // this.emit(ParticipantEvent.MediaDevicesError, e);
        //   }
        //   throw e;
        // } finally {
        //   this.pendingPublishing.delete(source);
        // }
      }
    }
    // return track;
  }

  async createTracks(constraints?: { audio: AudioCaptureOptions }) {
    let stream: MediaStream | undefined;
    const mergedConstraints = {
      audio: {
        ...DEFAULT_AUDIO_CONSTRAINTS,
        ...constraints,
      },
    };
    try {
      stream = await navigator.mediaDevices.getUserMedia(mergedConstraints);
    } catch (err) {
      if (err instanceof Error) {
        if (mergedConstraints.audio) {
          this.microphoneError = err;
        }
        // if (mergedConstraints.video) {
        //   this.cameraError = err;
        // }
      }

      throw err;
    }

    if (mergedConstraints.audio) {
      this.microphoneError = undefined;
    }

    return stream.getTracks().map((mediaStreamTrack: MediaStreamTrack) => {
      // const isAudio = mediaStreamTrack.kind === 'audio';
      let track = new LocalTrack(
        this.room.participants,
        mediaStreamTrack,
        Track.Kind.Audio
      );
      track.mediaStream = stream;
      return track;
    });
  }
}

import { Participant } from './Participant';
import {
  AudioCaptureOptions,
  Track,
  TrackPublishOptions,
} from '../track/options';
import { LocalTrack } from '../track/LocalTrack';
import { LocalTrackPublication } from '../track/LocalTrackPublication';
import { TrackPublication } from '../track/TrackPublication';

import { RemoteParticipant } from './RemoteParticipant';
import { Room } from '../room';
import { ParticipantEvent } from './events';
import { TrackEvent } from '../track/events';
import { Patp, RoomsModelType } from '../types';
import LocalAudioTrack from '../track/LocalAudioTrack';
import { isFireFox } from '../utils';

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
  audioTracks: Map<string, LocalTrackPublication>;
  videoTracks: Map<string, LocalTrackPublication>;
  /** map of track sid => all published tracks */
  tracks: Map<string, LocalTrackPublication>;
  private pendingPublishing = new Set<Track.Source>();
  private microphoneError: Error | undefined;

  constructor(patp: Patp, room: Room) {
    super(patp, room);
    this.audioTracks = new Map();
    this.videoTracks = new Map();
    this.tracks = new Map();
  }

  async connect() {
    const tracks = (await this.setMicrophoneEnabled(
      true
    )) as LocalTrackPublication[];
    tracks.forEach((track: LocalTrackPublication) => {
      if (track.kind === Track.Kind.Audio) {
        // this.audioTracks.set(track.trackName, track);
        track.on(TrackEvent.Muted, () => {
          console.log('in local participant, muting');
          track.track?.detach();
          this.emit(ParticipantEvent.MuteToggled, true);
        });
        track.on(TrackEvent.Unmuted, () => {
          console.log('in local participant, unmuting');
          track.track?.attach();
          this.emit(ParticipantEvent.MuteToggled, false);
        });
      }
      // this.tracks.set(track.trackName, track);
    });

    this.isLoaded = true;
  }

  muteAudioTracks() {
    console.log(this.audioTracks);
    this.audioTracks.forEach((track: LocalTrackPublication) => {
      track.track?.mute();
    });
  }

  unmuteAudioTracks() {
    console.log(this.audioTracks);
    this.audioTracks.forEach((track: LocalTrackPublication) => {
      track.track?.unmute();
    });
  }
  streamTracks(peer: RemoteParticipant) {
    if (!this.isLoaded) return;
    console.log('streaming tracks');
    // peer.replaceAudioTrack(this.audio!.mediaStreamTrack);
    // peer.streamAudioTrack(this.audio!.mediaStreamTrack);

    // this.stream!.getTracks().forEach((track: MediaStreamTrack) => {
    //   peerConn.addTrack(track, this.stream!);
    // });
  }

  // getTrack(): any | undefined {
  //   const track = super.getTracks();
  //   if (track) {
  //     return track;
  //   }
  // }

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
  ): Promise<LocalTrackPublication[] | undefined> {
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
    let track = this.getTrack(source);
    if (enabled) {
      if (track) {
        // track.unmute();
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
          const publishPromises: Array<Promise<LocalTrackPublication>> = [];
          for (const localTrack of localTracks) {
            publishPromises.push(this.publishTrack(localTrack, publishOptions));
          }
          const publishedTracks = await Promise.all(publishPromises);
          // for screen share publications including audio, this will only return the screen share publication, not the screen share audio one
          // revisit if we want to return an array of tracks instead for v2
          [track] = publishedTracks;
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
    return [track] as LocalTrackPublication[];
  }

  async createTracks(constraints?: MediaTrackConstraints) {
    let stream: MediaStream | undefined;
    const mergedConstraints = {
      audio: DEFAULT_AUDIO_CONSTRAINTS,
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
      // let track = new LocalTrack(
      //   mediaStreamTrack,
      //   Track.Kind.Audio
      // );
      let track = new LocalAudioTrack(mediaStreamTrack, constraints);
      track.source = Track.Source.Microphone;
      track.mediaStream = stream;
      return track;
    });
  }

  /**
   * Publish a new track to the room
   * @param track
   * @param options
   */
  async publishTrack(
    track: LocalTrack | MediaStreamTrack,
    options?: TrackPublishOptions
  ): Promise<LocalTrackPublication> {
    const opts: TrackPublishOptions = {
      ...options,
    };

    // convert raw media track into audio or video track
    if (track instanceof MediaStreamTrack) {
      switch (track.kind) {
        case 'audio':
          track = new LocalAudioTrack(track, undefined, true);
          break;
        default:
          throw new Error(`unsupported MediaStreamTrack kind ${track.kind}`);
      }
    }

    // is it already published? if so skip
    let existingPublication: LocalTrackPublication | undefined;
    this.tracks.forEach((publication) => {
      if (!publication.track) {
        return;
      }
      if (publication.track === track) {
        existingPublication = publication as LocalTrackPublication;
      }
    });

    if (existingPublication) return existingPublication;

    if (opts.source) {
      track.source = opts.source;
    }
    const existingTrackOfSource = Array.from(this.tracks.values()).find(
      (publishedTrack) =>
        track instanceof LocalTrack && publishedTrack.source === track.source
    );
    if (existingTrackOfSource) {
      try {
        // throw an Error in order to capture the stack trace
        throw Error(
          `publishing a second track with the same source: ${track.source}`
        );
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.warn(e.message, {
            oldTrack: existingTrackOfSource,
            newTrack: track,
            trace: e.stack,
          });
        }
      }
    }
    if (opts.stopMicTrackOnMute && track instanceof LocalAudioTrack) {
      track.stopOnMute = true;
    }

    if (track.source === Track.Source.ScreenShare && isFireFox()) {
      // Firefox does not work well with simulcasted screen share
      // we frequently get no data on layer 0 when enabled
      opts.simulcast = false;
    }

    // handle track actions
    track.on(TrackEvent.Muted, this.onTrackMuted);
    track.on(TrackEvent.Unmuted, this.onTrackUnmuted);
    // track.on(TrackEvent.Ended, this.handleTrackEnded);
    track.on(TrackEvent.UpstreamPaused, this.onTrackUpstreamPaused);
    track.on(TrackEvent.UpstreamResumed, this.onTrackUpstreamResumed);

    // const ti = await this.engine.addTrack(req);
    const publication = new LocalTrackPublication(
      Track.Kind.Audio,
      // @ts-ignore
      { sid: track.sid!, name: 'our-audio' },
      track
    );
    // save options for when it needs to be republished again
    publication.options = opts;
    // track.sid = ti.sid;

    this.room.participants.forEach((peer: RemoteParticipant) => {
      peer.streamAudioTrack(publication.audioTrack!);
    });

    // this.peer.negotiate();

    // if (track instanceof LocalVideoTrack) {
    //   track.startMonitor(this.engine.client);
    // }
    if (track instanceof LocalAudioTrack) {
      track.startMonitor();
    }

    this.addTrackPublication(publication);

    // send event for publication
    this.emit(ParticipantEvent.LocalTrackPublished, publication);
    return publication;
  }

  private onTrackUnmuted = (track: LocalTrack) => {
    this.onTrackMuted(track, track.isUpstreamPaused);
  };

  // when the local track changes in mute status, we'll notify server as such
  /** @internal */
  private onTrackMuted = (track: LocalTrack, muted?: boolean) => {
    if (muted === undefined) {
      muted = true;
    }
    this.room.participants.forEach((peer: RemoteParticipant) => {
      peer.updateOurInfo({
        patp: this.patp,
        muted: track.isMuted,
        cursor: this.isCursorSharing,
      });
    });
    // this.engine.updateMuteStatus(track.sid, muted);
  };

  private onTrackUpstreamPaused = (track: LocalTrack) => {
    console.debug('upstream paused');
    this.onTrackMuted(track, true);
  };

  private onTrackUpstreamResumed = (track: LocalTrack) => {
    console.debug('upstream resumed');
    this.onTrackMuted(track, track.isMuted);
  };
}

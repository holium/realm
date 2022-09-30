import { Participant } from './Participant';
import {
  AudioCaptureOptions,
  CreateLocalTracksOptions,
  TrackPublishOptions,
} from '../track/options';
import { LocalTrack } from '../track/LocalTrack';
import { LocalTrackPublication } from '../track/LocalTrackPublication';
import { RemoteParticipant } from './RemoteParticipant';
import { Room } from '../room';
import { ParticipantEvent } from './events';
import { TrackEvent } from '../track/events';
import { Patp } from '../types';
import LocalAudioTrack from '../track/LocalAudioTrack';
import { Track } from '../track/Track';
import { action, makeObservable, observable } from 'mobx';

export type Handshake = 'awaiting-offer' | 'offer' | 'ice-candidate' | 'answer';

export const DEFAULT_AUDIO_OPTIONS = {
  channelCount: {
    ideal: 2,
    min: 1,
  },
  sampleRate: 48000,
  sampleSize: 16,
  volume: 1,
  noiseSuppresion: true,
  // echoCancellation: false,
  // autoGainControl: true,
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
    makeObservable(this, {
      isLoaded: observable,
      mute: action.bound,
      unmute: action.bound,
    });
  }

  async connect() {
    await this.setMicrophoneEnabled(true);
    this.isLoaded = true;
  }

  disconnect() {
    // console.log("local participant disconnect");
    this.tracks.forEach((track: LocalTrackPublication) => {
      track.removeAllListeners();
      track.track?.detach();
    });
    this.audioTracks = new Map();
    this.videoTracks = new Map();
    this.tracks = new Map();
    this.isLoaded = false;
    this.removeAllListeners();
  }

  mute() {
    this.setTrackEnabled(Track.Source.Microphone, false);
    this.isMuted = true;
  }

  unmute() {
    this.setTrackEnabled(Track.Source.Microphone, true);
    this.isMuted = false;
  }

  getTrack(source: Track.Source): LocalTrackPublication | undefined {
    const track = super.getTrack(source);
    if (track) {
      return track as LocalTrackPublication;
    }
    return undefined;
  }

  // getTrackByName(name: string): LocalTrackPublication | undefined {
  //   const track = super.getTrackByName(name);
  //   if (track) {
  //     return track as LocalTrackPublication;
  //   }
  // }

  streamTracks(peer: RemoteParticipant) {
    console.log('streamTracks');
    if (!this.isLoaded) return;
    console.log('streaming tracks TO ', peer.patp);

    this.audioTracks.forEach((pub: LocalTrackPublication) => {
      // @ts-ignore
      peer.streamAudioTrack(pub.track!);
      console.log('peer.streamAudioTrack(pub.track!);', pub.track);
    });
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
  ): Promise<LocalTrackPublication | undefined> {
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
    // console.log('setTrackEnabled', { source, enabled });
    let track = this.getTrack(source);
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
        const audioOptions = {
          audio: options || DEFAULT_AUDIO_OPTIONS,
        } as CreateLocalTracksOptions;
        try {
          const localTracks = await this.createTracks(audioOptions);
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
      }
    } else if (track && track.track) {
      await track.mute();
    }
    return track;
  }

  async createTracks(options: CreateLocalTracksOptions) {
    let stream: MediaStream | undefined;
    try {
      if (options && options.audio) options! as AudioCaptureOptions;
      stream = await navigator.mediaDevices.getUserMedia(options);
    } catch (err) {
      if (err instanceof Error) {
        if (options.audio) {
          this.microphoneError = err;
        }
        // if (mergedConstraints.video) {
        //   this.cameraError = err;
        // }
      }

      throw err;
    }

    if (options.audio) {
      this.microphoneError = undefined;
    }

    return stream.getTracks().map((mediaStreamTrack: MediaStreamTrack) => {
      let track = new LocalAudioTrack(
        mediaStreamTrack,
        options.audio as AudioCaptureOptions
      );
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

    console.log('publishTrack');

    // convert raw media track into audio or video track
    if (track instanceof MediaStreamTrack) {
      switch (track.kind) {
        case 'audio':
          track = new LocalAudioTrack(track, DEFAULT_AUDIO_OPTIONS, true);
          break;
        default:
          throw new Error(`unsupported MediaStreamTrack kind ${track.kind}`);
      }
    }

    // is it already published? if so skip
    let existingPublication: LocalTrackPublication | undefined;
    this.tracks.forEach((publication) => {
      if (!publication.track) {
        // console.log("skippyboi")

        return;
      }
      if (publication.track === track) {
        existingPublication = publication as LocalTrackPublication;
      }
    });

    if (existingPublication) {
      // console.log("skippyboi 2")
      return existingPublication;
    }

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

    // handle track actions
    track.on(TrackEvent.Muted, this.onTrackMuted);
    track.on(TrackEvent.Unmuted, this.onTrackUnmuted);
    track.on(TrackEvent.Ended, this.handleTrackEnded);
    track.on(TrackEvent.UpstreamPaused, this.onTrackUpstreamPaused);
    track.on(TrackEvent.UpstreamResumed, this.onTrackUpstreamResumed);

    // const ti = await this.engine.addTrack(req);
    const publication = new LocalTrackPublication(
      Track.Kind.Audio,
      // @ts-ignore
      { sid: track.id, source: track.source, name: 'our-audio' },
      track
    );
    // save options for when it needs to be republished again
    publication.options = opts;
    // track.sid = ti.sid;

    this.room.participants.forEach((peer: RemoteParticipant) => {
      console.log('publishing track to:', peer.patp);
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
    console.log('emitting published traK');
    this.emit(ParticipantEvent.LocalTrackPublished, publication);
    return publication;
  }

  unpublishTrack(
    track: LocalTrack | MediaStreamTrack,
    stopOnUnpublish?: boolean
  ): LocalTrackPublication | undefined {
    // look through all published tracks to find the right ones
    const publication = this.getPublicationForTrack(track);

    console.debug('unpublishing track', { track, method: 'unpublishTrack' });

    if (!publication || !publication.track) {
      console.warn(
        'track was not unpublished because no publication was found',
        {
          track,
          method: 'unpublishTrack',
        }
      );
      return undefined;
    }

    track = publication.track;
    track.off(TrackEvent.Muted, this.onTrackMuted);
    track.off(TrackEvent.Unmuted, this.onTrackUnmuted);
    track.off(TrackEvent.Ended, this.handleTrackEnded);
    track.off(TrackEvent.UpstreamPaused, this.onTrackUpstreamPaused);
    track.off(TrackEvent.UpstreamResumed, this.onTrackUpstreamResumed);

    // if (stopOnUnpublish === undefined) {
    //   stopOnUnpublish = this.roomOptions?.stopLocalTrackOnUnpublish ?? true;
    // }
    if (stopOnUnpublish) {
      track.stop();
    }

    // TODO this.peers.notifyUnpublishTrack
    // if (
    //   this.room.participants &&
    //   this.engine.publisher.pc.connectionState !== 'closed' &&
    //   track.sender
    // ) {
    //   try {
    //     // this.engine.removeTrack(track.sender);
    //   } catch (e) {
    //     console.warn('failed to unpublish track', {
    //       error: e,
    //       method: 'unpublishTrack',
    //     });
    //   } finally {
    //     // this.engine.negotiate();
    //   }
    // }

    track._sender = undefined;

    // remove from our maps
    this.tracks.delete(publication.trackSid);
    switch (publication.kind) {
      case Track.Kind.Audio:
        this.audioTracks.delete(publication.trackSid);
        break;
      default:
        break;
    }

    this.emit(ParticipantEvent.LocalTrackUnpublished, publication);
    publication.setTrack(undefined);

    return publication;
  }

  // removeTrack(sender: any) {
  //   // this.pee
  // }

  unpublishTracks(
    tracks: LocalTrack[] | MediaStreamTrack[]
  ): LocalTrackPublication[] {
    const publications: LocalTrackPublication[] = [];
    tracks.forEach((track: LocalTrack | MediaStreamTrack) => {
      const pub = this.unpublishTrack(track);
      if (pub) {
        publications.push(pub);
      }
    });
    return publications;
  }

  private getPublicationForTrack(
    track: LocalTrack | MediaStreamTrack
  ): LocalTrackPublication | undefined {
    let publication: LocalTrackPublication | undefined;
    this.tracks.forEach((pub) => {
      const localTrack = pub.track;
      if (!localTrack) {
        return;
      }

      // this looks overly complicated due to this object tree
      if (track instanceof MediaStreamTrack) {
        if (localTrack instanceof LocalAudioTrack) {
          if (localTrack.mediaStreamTrack === track) {
            publication = pub as LocalTrackPublication;
          }
        }
      } else if (track === localTrack) {
        publication = pub as LocalTrackPublication;
      }
    });
    return publication;
  }

  /** @internal */
  publishedTracksInfo(): any[] {
    const infos: any[] = [];
    this.tracks.forEach((track: LocalTrackPublication) => {
      if (track.track !== undefined) {
        infos.push({
          cid: track.track.mediaStreamID,
          track: track.trackInfo,
        });
      }
    });
    return infos;
  }

  // ------------------------------------------------------------------------
  // ------------------------------- Handlers -------------------------------
  // ------------------------------------------------------------------------
  private onTrackUnmuted = (track: LocalTrack) => {
    // console.log('on track unmuted => LocalParticipant');
    this.onTrackMuted(track, track.isUpstreamPaused);
  };

  // when the local track changes in mute status, we'll notify server as such
  /** @internal */
  private onTrackMuted = (track: LocalTrack, muted?: boolean) => {
    console.log('on track muted => LocalParticipant');
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

  // private handleLocalTrackUnpublished = (unpublished: any) => {
  //   const track = this.tracks.get(unpublished.trackSid);
  //   if (!track) {
  //     console.warn('received unpublished event for unknown track', {
  //       method: 'handleLocalTrackUnpublished',
  //       trackSid: unpublished.trackSid,
  //     });
  //     return;
  //   }
  //   this.unpublishTrack(track.track!);
  // };

  private handleTrackEnded = async (track: LocalTrack) => {
    if (
      track.source === Track.Source.ScreenShare ||
      track.source === Track.Source.ScreenShareAudio
    ) {
      console.debug('unpublishing local track due to TrackEnded', {
        track: track.sid,
      });
      this.unpublishTrack(track);
    } else if (track.isUserProvided) {
      await track.pauseUpstream();
    } else if (track instanceof LocalAudioTrack) {
      try {
        try {
          const currentPermissions = await navigator?.permissions.query({
            // the permission query for camera and microphone currently not supported in Safari and Firefox
            // track.source === 'video' ? 'microphone'
            // @ts-ignore
            name: 'microphone',
          });
          if (currentPermissions && currentPermissions.state === 'denied') {
            console.warn(`user has revoked access to ${track.source}`);

            // detect granted change after permissions were denied to try and resume then
            currentPermissions.onchange = () => {
              if (currentPermissions.state !== 'denied') {
                track.restartTrack();
                currentPermissions.onchange = null;
              }
            };
            throw new Error('GetUserMedia Permission denied');
          }
        } catch (e: any) {
          // permissions query fails for firefox, we continue and try to restart the track
        }

        console.debug('track ended, attempting to use a different device');
        await track.restartTrack();
      } catch (e) {
        console.warn(`could not restart track, pausing upstream instead`);
        await track.pauseUpstream();
      }
    }
  };
}

import { LocalTrack } from './LocalTrack';
import { TrackEvent } from './events';
import { Track, TrackInfo, TrackPublishOptions } from './options';
import { TrackPublication } from './TrackPublication';

export class LocalTrackPublication extends TrackPublication {
  track?: LocalTrack = undefined;

  options?: TrackPublishOptions;

  get isUpstreamPaused() {
    return this.track?.streamState === Track.StreamState.Paused;
  }

  constructor(kind: Track.Kind, ti: TrackInfo, track?: LocalTrack) {
    super(kind, ti.sid, ti.name);

    this.updateInfo(ti);
    this.setTrack(track);
  }

  setTrack(track?: LocalTrack) {
    if (this.track) {
      this.track.off(TrackEvent.Ended, this.handleTrackEnded);
    }

    super.setTrack(track);

    if (track) {
      track.on(TrackEvent.Ended, this.handleTrackEnded);
    }
  }

  get isMuted(): boolean {
    if (this.track) {
      return this.track.isMuted;
    }
    return super.isMuted;
  }

  get audioTrack(): LocalTrack | undefined {
    return super.audioTrack as LocalTrack | undefined;
  }

  // get videoTrack(): LocalVideoTrack | undefined {
  //   return super.videoTrack as LocalVideoTrack | undefined;
  // }

  /**
   * Mute the track associated with this publication
   */
  async mute() {
    return this.track?.mute();
  }

  /**
   * Unmute track associated with this publication
   */
  async unmute() {
    return this.track?.unmute();
  }

  /**
   * Pauses the media stream track associated with this publication from being sent to the server
   * and signals "muted" event to other participants
   * Useful if you want to pause the stream without pausing the local media stream track
   */
  async pauseUpstream() {
    await this.track?.pauseUpstream();
  }

  /**
   * Resumes sending the media stream track associated with this publication to the server after a call to [[pauseUpstream()]]
   * and signals "unmuted" event to other participants (unless the track is explicitly muted)
   */
  async resumeUpstream() {
    await this.track?.resumeUpstream();
  }

  handleTrackEnded = () => {
    this.emit(TrackEvent.Ended);
  };
}

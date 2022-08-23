export enum TrackEvent {
  Message = 'message',
  Muted = 'muted',
  Unmuted = 'unmuted',
  Ended = 'ended',
  Subscribed = 'subscribed',
  Unsubscribed = 'unsubscribed',
  /** @internal */
  UpdateSettings = 'updateSettings',
  /** @internal */
  UpdateSubscription = 'updateSubscription',
  /** @internal */
  AudioPlaybackStarted = 'audioPlaybackStarted',
  /** @internal */
  AudioPlaybackFailed = 'audioPlaybackFailed',
  /**
   * @internal
   * Only fires on LocalAudioTrack instances
   */
  AudioSilenceDetected = 'audioSilenceDetected',
  /** @internal */
  VisibilityChanged = 'visibilityChanged',
  /** @internal */
  VideoDimensionsChanged = 'videoDimensionsChanged',
  /** @internal */
  ElementAttached = 'elementAttached',
  /** @internal */
  ElementDetached = 'elementDetached',
  /**
   * @internal
   * Only fires on LocalTracks
   */
  UpstreamPaused = 'upstreamPaused',
  /**
   * @internal
   * Only fires on LocalTracks
   */
  UpstreamResumed = 'upstreamResumed',
  /**
   * @internal
   * Fires on RemoteTrackPublication
   */
  SubscriptionPermissionChanged = 'subscriptionPermissionChanged',
}

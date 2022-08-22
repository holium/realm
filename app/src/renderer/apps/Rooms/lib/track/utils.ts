let emptyAudioStreamTrack: MediaStreamTrack | undefined;

export function getEmptyAudioStreamTrack() {
  if (!emptyAudioStreamTrack) {
    // implementation adapted from https://blog.mozilla.org/webrtc/warm-up-with-replacetrack/
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    oscillator.connect(dst);
    oscillator.start();
    [emptyAudioStreamTrack] = dst.stream.getAudioTracks();
    if (!emptyAudioStreamTrack) {
      throw Error('Could not get empty media stream audio track');
    }
    emptyAudioStreamTrack.enabled = false;
  }
  return emptyAudioStreamTrack;
}

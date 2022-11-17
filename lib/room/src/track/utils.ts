import { sleep } from '../utils';
import { AudioTrack } from './type';

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

let emptyVideoStreamTrack: MediaStreamTrack | undefined;

export function getEmptyVideoStreamTrack() {
  if (!emptyVideoStreamTrack) {
    const canvas = document.createElement('canvas');
    // the canvas size is set to 16, because electron apps seem to fail with smaller values
    canvas.width = 16;
    canvas.height = 16;
    canvas.getContext('2d')?.fillRect(0, 0, canvas.width, canvas.height);
    // @ts-expect-error
    const emptyStream = canvas.captureStream();
    [emptyVideoStreamTrack] = emptyStream.getTracks();
    if (!emptyVideoStreamTrack) {
      throw Error('Could not get empty media stream video track');
    }
    emptyVideoStreamTrack.enabled = false;
  }
  return emptyVideoStreamTrack;
}

/**
 * This function detects silence on a given [[Track]] instance.
 * Returns true if the track seems to be entirely silent.
 */
export async function detectSilence(
  track: AudioTrack,
  timeOffset = 200
): Promise<boolean> {
  const ctx = getNewAudioContext();
  if (ctx) {
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const source = ctx.createMediaStreamSource(
      new MediaStream([track.mediaStreamTrack])
    );

    source.connect(analyser);
    await sleep(timeOffset);
    analyser.getByteTimeDomainData(dataArray);
    const someNoise = dataArray.some(
      (sample) => sample !== 128 && sample !== 0
    );
    ctx.close();
    return !someNoise;
  }
  return false;
}

export function getNewAudioContext(): AudioContext | void {
  // @ts-expect-error
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    return new AudioContext();
  }
}

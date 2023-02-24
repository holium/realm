import { LocalPeer } from '../peer/LocalPeer';
import { BaseAnalyser } from './BaseAnalyser';
import { IAudioAnalyser } from './types';

export class SpeakingDetectionAnalyser extends BaseAnalyser {
  audioContext: AudioContext | null = null;
  mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  analyser: AnalyserNode | null = null;
  bufferLength: number = 0;
  dataArray: Uint8Array | null = null;
  currentFrameId: number = 0;
  averageFrequency: number = 0;
  lo: number = 0;
  hi: number = 0;
  static initialize(peer: LocalPeer): IAudioAnalyser {
    const analyser = new SpeakingDetectionAnalyser();
    analyser.attach(peer);
    return analyser;
  }
  private detect(_timestamp: DOMHighResTimeStamp) {
    this.currentFrameId = requestAnimationFrame(this.detect.bind(this));
    this.analyser?.getByteFrequencyData(this.dataArray!);
    let total = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      total += this.dataArray![i];
    }
    this.averageFrequency = total / (this.bufferLength * 1.0);
    if (this.averageFrequency > 16.0) {
      this.lo = 0;
      this.hi++;
      if (!this.peer?.isSpeaking && this.hi > 24) {
        this.peer?.isSpeakingChanged(true);
      }
    } else {
      this.lo++;
      this.hi = 0;
      if (this.peer?.isSpeaking && this.lo > 64) {
        this.peer?.isSpeakingChanged(false);
      }
    }
  }
  override attach(peer: LocalPeer) {
    super.attach(peer);
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(
      peer.stream!
    );
    this.mediaStreamSource.connect(this.analyser);
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0.85;
    this.analyser.fftSize = 64;
    this.bufferLength = this.analyser.frequencyBinCount; // 0.5 of fft
    this.dataArray = new Uint8Array(this.bufferLength);
    requestAnimationFrame(this.detect.bind(this));
  }
  override detach() {
    if (this.currentFrameId !== 0) {
      cancelAnimationFrame(this.currentFrameId);
      this.currentFrameId = 0;
    }
    super.detach();
  }
}

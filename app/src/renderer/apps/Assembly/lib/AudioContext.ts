const audioCtx = new window.AudioContext();
let analyser = audioCtx.createAnalyser();

export const AudioContext = {
  getAudioContext() {
    return audioCtx;
  },

  getAnalyser() {
    return analyser;
  },

  resetAnalyser() {
    analyser = audioCtx.createAnalyser();
  },
};

export default AudioContext;

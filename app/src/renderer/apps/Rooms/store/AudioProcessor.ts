export class AudioProcessor {
  private context: AudioContext;
  private source: MediaStreamAudioSourceNode;
  private processor: SpeexProcessor;

  constructor(stream: MediaStream) {
    this.context = new AudioContext();
    this.source = this.context.createMediaStreamSource(stream);
    this.processor = new SpeexProcessor(this.context.sampleRate, {
      noiseSuppress: -30,
    });
  }

  process() {
    const scriptProcessor = this.context.createScriptProcessor(4096, 1, 1);
    this.source.connect(scriptProcessor);
    scriptProcessor.connect(this.context.destination);

    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      const inputBuffer = audioProcessingEvent.inputBuffer;
      const outputBuffer = audioProcessingEvent.outputBuffer;

      for (
        let channel = 0;
        channel < outputBuffer.numberOfChannels;
        channel++
      ) {
        const inputData = inputBuffer.getChannelData(channel);
        const outputData = outputBuffer.getChannelData(channel);
        const processedData = this.processor.preprocess(inputData);

        for (let sample = 0; sample < processedData.length; sample++) {
          outputData[sample] = processedData[sample];
        }
      }
    };
  }
}

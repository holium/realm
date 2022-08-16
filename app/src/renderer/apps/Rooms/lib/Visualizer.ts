import AudioContext from './AudioContext';

let drawVisual: any;

const barCount = 6;

export const Visualizer = {
  frequencyBars(
    canvasCtx: any,
    width: number,
    height: number,
    backgroundColor: string,
    strokeColor: string
  ) {
    let analyser = AudioContext.getAnalyser();
    analyser.fftSize = 6;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, width, height);

    function draw() {
      drawVisual = requestAnimationFrame(draw);

      analyser = AudioContext.getAnalyser();
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillStyle = strokeColor;
        canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    }

    draw();
  },
  voice(
    canvasCtx: any,
    canvas: any,
    frequencyData: any,
    width: number,
    height: number,
    backgroundColor: string,
    strokeColor: string
  ) {
    let barWidth = 4;
    let barHeight = 10;
    let barSpacing = 2;

    const radiusReduction = 70;
    const amplitudeReduction = 6;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - radiusReduction;
    const maxBarNum = Math.floor(
      (radius * 2 * Math.PI) / (barWidth + barSpacing)
    );
    const slicedPercent = Math.floor((maxBarNum * 25) / 100);
    const barNum = maxBarNum - slicedPercent;
    const freqJump = Math.floor(frequencyData.length / maxBarNum);

    for (let i = 0; i < barNum; i++) {
      const amplitude = frequencyData[i * freqJump];
      const theta = (i * 2 * Math.PI) / maxBarNum;
      const delta = ((3 * 45 - barWidth) * Math.PI) / 180;
      const x = 0;
      const y = radius - (amplitude / 12 - barHeight);
      const w = barWidth;
      const h = amplitude / amplitudeReduction + barHeight;

      canvasCtx.save();
      canvasCtx.translate(cx + barSpacing, cy + barSpacing);
      canvasCtx.rotate(theta - delta);
      canvasCtx.fillRect(x, y, w, h);
      canvasCtx.restore();
    }

    return this;
  },
};

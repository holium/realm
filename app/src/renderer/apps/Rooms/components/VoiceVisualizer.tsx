import { FC, createRef, useEffect, useState, useMemo } from 'react';
import { Flex } from 'renderer/components';
import theme from 'renderer/theme';
import AudioContext from '../lib/AudioContext';
import { Visualizer } from '../lib/Visualizer';

interface VoiceAnalyzerProps {
  audio: MediaStream;
}

export const VoiceAnalyzer: FC<VoiceAnalyzerProps> = (
  props: VoiceAnalyzerProps
) => {
  const voiceCanvas = createRef<SVGElement>();

  const [audioData, setAudioData] = useState(new Uint8Array(0));
  const [rafId, setRafId] = useState(0);
  // localRafId = requestAnimationFrame(tick);

  useEffect(() => {
    const audioCtx = AudioContext.getAudioContext();
    const analyser = AudioContext.getAnalyser();
    // Get audio stream
    const source = audioCtx.createMediaStreamSource(props.audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const update = () => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      setAudioData(data);
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update.bind(this));
    // analyser.get
  }, []);

  // useEffect(() => {
  //   // const canvas = voiceCanvas.current!;
  //   // const height = canvas.height;
  //   // const width = canvas.width;
  //   // const context = canvas.getContext('2d');
  //   Visualizer.frequencyBars(
  //     context,
  //     width,
  //     height,
  //     'transparent',
  //     theme.light.colors.brand.primary
  //   );
  // }, [props.audio]);

  // const Visualizer = useMemo(() => {
  //   console.log(audioData);
  //   return (
  //     <Flex width={30} height={30}>
  //       <svg
  //         width="24"
  //         height="24"
  //         viewBox="0 0 24 24"
  //         fill="none"
  //         xmlns="http://www.w3.org/2000/svg"
  //       >
  //         <rect x="1" y="10" width="2" height="5" rx="1" fill="#4E9EFD" />
  //         <rect x="13" y="4" width="2" height="19" rx="1" fill="#4E9EFD" />
  //         <rect x="21" y="10" width="2" height="5" rx="1" fill="#4E9EFD" />
  //         <rect x="5" y="7" width="2" height="11" rx="1" fill="#4E9EFD" />
  //         <rect x="9" y="2" width="2" height="19" rx="1" fill="#4E9EFD" />
  //         <rect x="17" y="7" width="2" height="11" rx="1" fill="#4E9EFD" />
  //       </svg>
  //     </Flex>
  //   );
  // }, [audioData]);

  return <VoiceVisualizer audioData={audioData} />;
};

interface VoiceVisualizerProps {
  audioData: Uint8Array;
}

export const VoiceVisualizer: FC<VoiceVisualizerProps> = (
  props: VoiceVisualizerProps
) => {
  const voiceCanvas = createRef<HTMLCanvasElement>();
  // console.log(props.audioData);
  const draw = () => {
    const canvas = voiceCanvas.current!;
    const height = canvas.height;
    const width = canvas.width;
    const context = canvas.getContext('2d')!;
    Visualizer.voice(
      context,
      canvas,
      props.audioData,
      width,
      height,
      'transparent',
      theme.light.colors.brand.primary
    );

    // let x = 0;
    // const sliceWidth = (width * 1.0) / audioData.length;

    // context.lineWidth = 2;
    // context.strokeStyle = '#000000';
    // context.clearRect(0, 0, width, height);

    // context.beginPath();
    // context.moveTo(0, height / 2);
    // for (const item of audioData) {
    //   const y = (item / 255.0) * height;
    //   context.lineTo(x, y);
    //   x += sliceWidth;
    // }
    // context.lineTo(x, height / 2);
    // context.stroke();
  };

  useEffect(() => {
    draw();
  }, [props.audioData]);
  // useEffect(() => {
  //   const canvas = voiceCanvas.current!;
  //   const height = canvas.height;
  //   const width = canvas.width;
  //   const context = canvas.getContext('2d');
  //   Visualizer.frequencyBars(
  //     context,
  //     width,
  //     height,
  //     'transparent',
  //     theme.light.colors.brand.primary
  //   );
  // }, [props.audioData]);

  return <canvas width="30" height="30" ref={voiceCanvas} />;
};

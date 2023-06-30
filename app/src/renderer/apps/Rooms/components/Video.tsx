type Props = {
  id: string;
  innerRef: React.RefObject<HTMLVideoElement>;
};

export const Video = ({ id, innerRef }: Props) => (
  <video
    id={id}
    ref={innerRef}
    style={{
      zIndex: 0,
      display: 'none',
      position: 'absolute',
      pointerEvents: 'none',
      top: '-50%',
      left: '-50%',
      transform: 'translate(50%, 50%)',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      background: 'black',
    }}
    autoPlay
    playsInline
    muted
  />
);

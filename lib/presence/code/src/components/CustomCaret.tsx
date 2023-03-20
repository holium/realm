type Props = {
  top: number;
  left: number;
};

export const CustomCaret = ({ top, left }: Props) => (
  <div
    style={{
      position: 'absolute',
      top,
      left,
      width: 2,
      height: 17,
      background: 'white',
    }}
  />
);

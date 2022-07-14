import { FC } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import CrestSymbol from './Icons/crest';

const crestSize = {
  xsm: 16,
  sm: 32,
  md: 64,
  md2: 80,
  lg: 128,
  xlg: 256,
};

const crestRadius = {
  xsm: 2,
  sm: 6,
  md: 12,
  md2: 12,
  lg: 12,
  xlg: 16,
};

type CrestStyleProps = {
  height: number;
  width: number;
  background?: string;
  borderRadius: number;
};

export const ColorCrest = styled(motion.div)<CrestStyleProps>`
  height: ${(p) => p.height}px;
  width: ${(p) => p.width}px;
  border-radius: ${(p) => p.borderRadius}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ImageCrest = styled(motion.img)<CrestStyleProps>`
  background: ${(p) => p.background};
  border-radius: ${(p) => p.borderRadius}px;
  position: relative;
  box-sizing: content-box;
  img {
    position: absolute;
  }
`;

interface ICrest {
  picture?: string;
  color: string;
  size: keyof typeof crestSize;
}
export const Crest: FC<ICrest> = (props: ICrest) => {
  const { picture, color, size } = props;

  return picture ? (
    <ImageCrest
      height={crestSize[size]}
      width={crestSize[size]}
      borderRadius={crestRadius[size]}
      background={color}
      src={picture}
    />
  ) : (
    <ColorCrest
      initial={{ backgroundColor: color }}
      animate={{ backgroundColor: color }}
      height={crestSize[size]}
      width={crestSize[size]}
      borderRadius={crestRadius[size]}
    >
      <CrestSymbol
        fill={color}
        height={crestSize[size] * 0.65}
        width={crestSize[size] * 0.65}
      />
    </ColorCrest>
  );
};

Crest.defaultProps = {
  color: '#000000',
  size: 'sm',
};

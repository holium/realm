import { FC } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
export const isValidHexColor = (hex: string) => {
  return hexRegex.test(`${hex}`);
};
const urlRegex =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
export const isValidImageUrl = (url: string) => {
  return urlRegex.test(url);
};

export const isImgUrl = (url: string): Promise<boolean> => {
  const img = new Image();
  img.src = url;
  return new Promise((resolve) => {
    img.onerror = () => resolve(false);
    img.onload = () => resolve(true);
  });
};

const crestSize = {
  xsm: 16,
  sm: 32,
  sm2: 40,
  md: 64,
  md2: 80,
  lg: 128,
  xlg: 256,
};

const crestRadius = {
  xsm: 2,
  sm: 4,
  sm2: 6,
  md: 6,
  md2: 12,
  lg: 12,
  xlg: 16,
};

interface CrestStyleProps {
  height: number;
  width: number;
  background?: string;
  borderRadius: number;
}

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
  object-fit: cover;
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
      transition={{ backgroundColor: { duration: 0.5 } }}
    >
      {/* <CrestSymbol
        fill={color}
        transitionDuration={0.5}
        height={crestSize[size] * 0.65}
        width={crestSize[size] * 0.65}
      /> */}
    </ColorCrest>
  );
};

Crest.defaultProps = {
  color: '#000000',
  size: 'sm',
};

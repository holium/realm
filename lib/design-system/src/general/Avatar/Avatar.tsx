import { reactRenderer, sigil } from '@tlon/sigil-js';
import { motion } from 'framer-motion';

import { contrastAwareBlackOrWhiteHex } from '../../../util';
import { AvatarInner, AvatarWrapper } from './Avatar.styles';

type Props = {
  patp: string;
  avatar?: string | null;
  size: number;
  simple?: boolean;
  sigilColor: [string, string];
  clickable?: boolean;
  borderRadiusOverride?: string;
};

export const Avatar = ({
  patp,
  avatar,
  size,
  sigilColor = ['#000000', '#ffffff'],
  simple,
  clickable,
  borderRadiusOverride,
}: Props) => {
  const responsiveSigilColor: [string, string] = [
    sigilColor[0],
    contrastAwareBlackOrWhiteHex(sigilColor[0], 'white'),
  ];

  let innerContent = null;
  if (avatar) {
    innerContent = (
      <AvatarInner
        src={avatar}
        style={{
          borderRadius: borderRadiusOverride,
          width: size,
          height: size,
        }}
      />
    );
  } else {
    if (!patp) return null;
    const sigilSize = size / 2;
    const innerPadding = sigilSize / 2;
    innerContent = (
      <motion.div
        style={{
          padding: innerPadding,
          backgroundColor: responsiveSigilColor[0],
          width: size,
          height: size,
        }}
      >
        {patp.split('-').length <= 2 &&
          sigil({
            patp,
            renderer: reactRenderer,
            size: sigilSize,
            icon: simple,
            margin: false,
            colors: responsiveSigilColor,
          })}
      </motion.div>
    );
  }

  return (
    <AvatarWrapper
      borderRadiusOverride={borderRadiusOverride}
      clickable={clickable}
      sigilSize={size}
    >
      {innerContent}
    </AvatarWrapper>
  );
};

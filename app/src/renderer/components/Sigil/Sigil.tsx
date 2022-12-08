import { FC, useMemo } from 'react';
import { sigil, reactRenderer } from '@tlon/sigil-js';
import { AvatarWrapper, SigilStyle } from './Sigil.styles';

export interface SigilProps {
  patp: string;
  avatar?: string | null;
  nickname?: string;
  size: number;
  simple?: boolean;
  borderRadiusOverride?: string;
  borderColor?: string;
  color: [string, string];
  isLogin?: boolean;
  clickable?: boolean;
  opacity?: number;
}

export const Sigil: FC<SigilProps> = (props: SigilProps) => {
  const {
    patp,
    avatar,
    size,
    color,
    borderRadiusOverride,
    simple,
    clickable,
    isLogin,
    opacity,
  } = props;
  return useMemo(() => {
    const sigilSize = size / 2;
    const horizontalPadding = sigilSize / 2;
    return avatar ? (
      <AvatarWrapper
        id="ship"
        opacity={opacity || 1}
        raised={isLogin}
        style={{ borderRadius: borderRadiusOverride || 4 }}
        borderRadiusOverride={borderRadiusOverride}
      >
        <img
          src={avatar}
          width={size}
          height={size}
          alt={`avatar-${patp}`}
          style={{
            borderRadius: borderRadiusOverride || 4,
            background: 'hsl(230, 20%, 88%)',
          }}
        />
      </AvatarWrapper>
    ) : (
      <SigilStyle
        opacity={opacity || 1}
        raised={isLogin}
        sigilSize={size}
        sigilColor={color[0]}
        clickable={clickable}
        style={{
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
          borderRadius: borderRadiusOverride || 4,
        }}
        borderRadiusOverride={borderRadiusOverride}
      >
        {patp && patp.split('-').length <= 2 ? (
          sigil({
            patp,
            renderer: reactRenderer,
            size: sigilSize,
            icon: simple,
            margin: false,
            colors: color,
          })
        ) : (
          <div
            style={{
              backgroundColor: color[0],
              width: sigilSize,
              height: sigilSize,
            }}
          />
        )}
      </SigilStyle>
    );
  }, [patp, avatar, color]);
};

Sigil.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  size: 30,
  simple: true,
};

export default { Sigil };

// eslint-disable-next-line import/no-unresolved
import { FC } from 'react';
import { sigil, reactRenderer } from '@tlon/sigil-js';
import { AvatarWrapper, SigilStyle } from './Sigil.styles';

export type SigilProps = {
  patp: string;
  avatar?: string | null;
  nickname?: string;
  size: number;
  simple?: boolean;
  borderRadiusOverride?: string;
  color: [string, string];
  isLogin?: boolean;
  clickable?: boolean;
};

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
  } = props;
  const sigilSize = size / 2;
  const horizontalPadding = sigilSize / 2;

  return avatar ? (
    <AvatarWrapper
      id="ship"
      raised={isLogin}
      style={{ borderRadius: borderRadiusOverride || 4 }}
      borderRadiusOverride={borderRadiusOverride}
    >
      <img
        src={avatar}
        width={size}
        height={size}
        alt={`avatar-${patp}`}
        style={{ borderRadius: borderRadiusOverride || 4 }}
      />
    </AvatarWrapper>
  ) : (
    <SigilStyle
      raised={isLogin}
      sigilSize={size}
      sigilColor={color[0]}
      clickable={clickable}
      style={{
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
      }}
      borderRadiusOverride={borderRadiusOverride}
    >
      {patp.split('-').length <= 2 ? (
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
};

Sigil.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  size: 30,
  simple: true,
};

export default { Sigil };

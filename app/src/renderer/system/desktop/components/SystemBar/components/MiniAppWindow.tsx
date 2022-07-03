/* Mainbar */
import { FC, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { rgba, darken } from 'polished';
import styled from 'styled-components';

import { ThemeType } from '../../../../../theme';

type MiniAppStyleProps = {
  theme: ThemeType;
  customBg?: string;
};

export const MiniAppWindow = styled(styled(motion.div)<MiniAppStyleProps>`
  border-radius: 16px;
  backdrop-filter: var(--blur-enabled);
  --webkit-backface-visibility: hidden;
  --webkit-transform: translate3d(0, 0, 0);
  --webkit-perspective: 1000;
  transform: translateZ(0);
  width: 270px;
  box-shadow: ${(props: MiniAppStyleProps) => props.theme.elevations.two};
  border: 1px solid
    ${(props: MiniAppStyleProps) => darken(0.1, props.customBg!)};
  /* border: 1px solid ${(props: MiniAppStyleProps) =>
    rgba(props.customBg!, 0.7)}; */
`)<MiniAppStyleProps>({
  // @ts-expect-error annoying
  backgroundColor: (props: SystemBarStyleProps) => props.customBg || 'initial',
});

type MiniAppProps = {
  id: string;
  ref?: any;
  onClose?: () => void;
  canScroll?: boolean;
  backgroundColor?: string;
  dimensions: {
    height: number;
    width: number;
  };
  textColor?: string;
  buttonRef?: any;
  children?: React.ReactNode;
};

const DEFAULT_PROPS = {
  onClose: () => {},
  dimensions: {
    height: 350,
    width: 290,
  },
};

export const MiniApp: FC<MiniAppProps> = forwardRef(
  (props: MiniAppProps, ref: any) => {
    const { id, dimensions, backgroundColor, textColor, children } = props;

    return (
      <MiniAppWindow
        id={id}
        ref={ref}
        style={{
          height: dimensions.height,
          width: dimensions.width,
          overflowY: 'hidden',
        }}
        color={textColor}
        customBg={backgroundColor}
      >
        {children}
      </MiniAppWindow>
    );
  }
);

MiniApp.defaultProps = DEFAULT_PROPS;

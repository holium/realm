import styled from 'styled-components';
// import { rgba } from 'polished';
import { BorderProps, SpaceProps } from 'styled-system';
import type { ThemeType } from '../../../../../../theme';
import { Box } from '../../../../../../components/Box';

export type TrayButtonProps = BorderProps &
  SpaceProps & {
    theme: ThemeType;
    baseColor?: string;
    noRestingBg?: boolean;
    circular?: boolean;
    transparency?: number;
  };

export const Tray = styled(Box)<TrayButtonProps>`
  flex: 1;
`;

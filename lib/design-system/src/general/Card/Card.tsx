import styled from 'styled-components';
import { BorderProps, ShadowProps } from 'styled-system';
import { BoxProps, Flex } from '../index';

export type CardProps = {
  customBg?: string;
  elevation?: 'none' | 'one' | 'two' | 'three' | 'lifted';
} & BoxProps &
  BorderProps &
  ShadowProps;

export const Card = styled(Flex)<CardProps>`
  background: ${(props) => props.customBg || 'var(--rlm-card-color)'};
  border: 1px solid var(--rlm-border-color);
  transition: var(--transition);
  box-sizing: border-box;
  border-radius: 12px;
  box-shadow: ${(props) => {
    switch (props.elevation) {
      case 'one':
        return 'var(--rlm-box-shadow-1)';
      case 'two':
        return 'var(--rlm-box-shadow-2)';
      case 'three':
        return 'var(--rlm-box-shadow-3)';
      case 'lifted':
        return 'var(--rlm-box-shadow-4)';
      case 'none':
      default:
        return 'none';
    }
  }};
`;

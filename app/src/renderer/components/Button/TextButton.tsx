import styled, { css } from 'styled-components';
import {
  compose,
  space,
  color,
  backgroundColor,
  layout,
  opacity,
  OpacityProps,
  typography,
} from 'styled-system';
import { ThemeType } from '../../theme';

type IProps = {
  highlightColor?: string;
  fontSize?: string;
  theme: ThemeType;
} & OpacityProps;

export const TextButton = styled(styled.button`
  font-family: ${(props: any) => props.theme.fonts.body};
  font-style: normal;
  font-weight: 500;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 26px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  padding: 0px 7px;
  border: none;
  background-color: transparent;
  /* padding-top: 3px; */
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;

  ${(props: IProps) =>
    css`
      font-size: ${props.fontSize ? `${props.fontSize}px` : '14px'};
      color: ${props.theme.colors.brand.primary};
      transition: .1s;
      :hover {
        transition: .1s
        background-color: ${
          props.highlightColor
            ? `${props.highlightColor}25`
            : `${props.theme.colors.brand.primary}25`
        };
      }
      &:active, &:focus {
        background-color: ${
          props.highlightColor
            ? `${props.highlightColor}30`
            : `${props.theme.colors.brand.primary}30`
        };
        transition: ${props.theme.transition};
        outline: none;
        border-color: ${props.theme.colors.brand.primary} ;
      }
      &:disabled {
        background-color: transparent;
        opacity: .3;
        cursor: default;
        /* pointer-events: none; */
      }
    `};
`)<IProps>(
  {},
  compose(space, color, layout, backgroundColor, typography, opacity)
);

TextButton.displayName = 'TextButton';

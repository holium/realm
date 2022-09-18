import { FC } from 'react';
import styled, { css } from 'styled-components';
import {
  compose,
  space,
  color,
  ColorProps,
  backgroundColor,
  layout,
  opacity,
  OpacityProps,
  position,
  PositionProps,
  typography,
  ButtonStyleProps,
} from 'styled-system';
import { ThemeType } from '../../theme';

type IProps = {
  highlightColor?: string;
  showBackground?: boolean;
  textColor?: string;
  fontWeight?: string | number;
  fontSize?: string | number;
  theme: ThemeType;
  disabled?: boolean;
} & OpacityProps &
  ButtonStyleProps &
  PositionProps &
  ColorProps;

export const TextButtonStyle = styled(styled.div`
  font-family: ${(props: any) => props.theme.fonts.body};
  font-style: normal;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 26px;
  border-radius: 4px;
  text-decoration: none;
  /* cursor: pointer; */
  padding: 0px 7px;
  border: none;
  background-color: transparent;

  ${(props: IProps) =>
    css`
      font-size: ${props.fontSize ? `${props.fontSize}px` : '14px'};
      font-weight: ${props.fontWeight ? props.fontWeight : 500};
      color: ${props.textColor || props.theme.colors.brand.primary};
      background-color: ${
        props.showBackground ? `${props.highlightColor}15` : 'transparent'
      };
      transition: .1s;
      :hover {
        transition: .1s
        background-color: ${
          props.highlightColor
            ? `${props.highlightColor}20`
            : `${props.theme.colors.brand.primary}20`
        };
      }
      &:active, &:focus {
        background-color: ${
          props.highlightColor
            ? `${props.highlightColor}25`
            : `${props.theme.colors.brand.primary}25`
        };
        transition: ${props.theme.transition};
        outline: none;
        border-color: ${props.theme.colors.brand.primary} ;
      }
      ${
        props.disabled &&
        css`
          pointer-events: none;
          background-color: transparent;
          opacity: 0.3;
        `
      }

    `};
`)<IProps>(
  {},
  compose(space, color, layout, backgroundColor, typography, opacity, position)
);

type TextButtonProps = {
  tabIndex?: number;
  highlightColor?: string;
  showBackground?: boolean;
  textColor?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  disabled?: boolean;
  style?: any;
  onClick?: (evt: any) => void;
  onKeyDown?: (evt: any) => void;
} & PositionProps;

export const TextButton: FC<TextButtonProps> = (props: TextButtonProps) => {
  return (
    <div
      className={
        props.disabled ? 'dynamic-mouse-disabled' : 'realm-cursor-hover'
      }
    >
      <TextButtonStyle {...props}></TextButtonStyle>
    </div>
  );
};

TextButton.displayName = 'TextButton';

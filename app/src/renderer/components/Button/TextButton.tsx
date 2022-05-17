import { FC } from 'react';
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
  ButtonStyleProps,
} from 'styled-system';
import { ThemeType } from '../../theme';

type IProps = {
  highlightColor?: string;
  fontSize?: string;
  theme: ThemeType;
  disabled?: boolean;
} & OpacityProps &
  ButtonStyleProps;

export const TextButtonStyle = styled(styled.div`
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
  /* cursor: pointer; */
  padding: 0px 7px;
  border: none;
  background-color: transparent;
  /* padding-top: 3px; */
  /* button[disabled] {
    pointer-events: all;
  } */

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
  compose(space, color, layout, backgroundColor, typography, opacity)
);

type TextButtonProps = {
  highlightColor?: string;
  fontSize?: string;
  disabled?: boolean;
  style?: any;
  onClick?: (evt: any) => void;
};

export const TextButton: FC<TextButtonProps> = (props: TextButtonProps) => {
  return (
    <div
      className={
        props.disabled ? 'dynamic-mouse-disabled' : 'dynamic-mouse-hover'
      }
    >
      <TextButtonStyle {...props}></TextButtonStyle>
    </div>
  );
};

TextButton.displayName = 'TextButton';

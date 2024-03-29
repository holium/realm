/* eslint-disable react/prop-types */
import styled, { css } from 'styled-components';

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  ${(props: { disabled: boolean }) =>
    props.disabled &&
    css`
      opacity: 0.5;
      cursor: default;
    `}
`;

const Switch = styled.div`
  ${(props: { src: string; color: string }) =>
    props.src &&
    css`
      position: relative;
      width: 40px;
      height: 22px;
      background: ${props.color}; //#4CDD86;
      border-radius: 32px;
      padding: 4px;
      transition: 300ms all;

      &:before {
        transition: 300ms all;
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 35px;
        top: 50%;
        left: 3px;
        background: url(${props.src}) no-repeat, white;
        background-size: 16px;
        transform: translate(0, -50%);
      }
    `}
`;
//background: url(${UqbarLogo}) no-repeat, white;
const Input = styled.input`
  display: none;
  &:checked + ${Switch} {
    background: #4d69cb;
    &:before {
      transform: translate(18px, -50%);
    }
  }
`;

export const ImageToggle = (props: {
  src: string;
  checked: boolean;
  color: string;
  disabled: boolean;
  onClick: () => void;
}) => {
  return (
    // @ts-ignore
    <Label disabled={props.disabled} onClick={props.onClick}>
      {/* @ts-ignore */}
      <Input checked={props.checked} type="checkbox" readOnly />
      <Switch src={props.src} color={props.color} />
    </Label>
  );
};

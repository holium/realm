import styled from 'styled-components';

type Props = {
  size: number;
  color?: string;
};

export const StyledSpinner = styled.div<Props>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-width: ${({ size }) => (size < 2 ? 0.75 : 5)}px;
  border-style: solid;
  // TODO: get brand color from a CSS variable.
  border-color: rgba(117, 117, 117, 0.2);
  border-bottom-color: ${({ color }) => color ?? '#ef9134'};
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

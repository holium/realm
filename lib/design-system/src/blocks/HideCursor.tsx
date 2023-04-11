import styled from 'styled-components';

export const HideCursorWrapper = styled.div`
  position: relative;
`;

export const HideCursor = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  cursor: none;
  z-index: 100;
`;

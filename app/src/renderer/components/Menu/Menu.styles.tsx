import styled from 'styled-components';
import { compose, space, color, typography } from 'styled-system';

export const MenuWrapper = styled(styled.div`
  z-index: 3;
  position: absolute;
  display: flex;
  margin-top: 1px;
  flex-direction: column;
  background: ${(props) => props.theme.colors.bg.secondary};
  border: 1px solid ${(props) => props.theme.colors.ui.input.borderColor};
  transition: ${(props) => props.theme.transition};
  min-width: 125px;
  padding: 5px 0 5px 0;
  box-shadow: ${(props) => props.theme.elevations.one};
  box-sizing: border-box;
  border-radius: ${(props) => props.theme.containers.outerBorderRadius}px;
  color: ${(props) => props.theme.colors.text.primary};
  &:hover {
    transition: ${(props) => props.theme.transition};
    /* border-color: ${(props) => props.theme.colors.ui.input.borderHover}; */
  }
`)(compose(space, color, typography));

import styled from 'styled-components';

type MainProps = {
  noBackground: boolean;
};

export const Main = styled.main<MainProps>`
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ noBackground }) =>
    noBackground
      ? ''
      : `
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url(https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=100);
  `}
`;

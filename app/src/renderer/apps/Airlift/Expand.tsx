import styled from 'styled-components';

const ExpandBox = styled.span`
  position: absolute;
  width: 30px;
  height: 10px;

  background: white;
  border-radius: 7.5px;
`;

const Ellipses = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -75%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  border-radius: 50%;
`;

export const Expand = () => {
  return (
    <ExpandBox>
      <Ellipses>...</Ellipses>
    </ExpandBox>
  );
};

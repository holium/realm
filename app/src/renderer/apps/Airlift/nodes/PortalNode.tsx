import { Flex, LinkBlock } from '@holium/design-system';
import styled from 'styled-components';

const PortalBox = styled.div`
  /* Frame 1353 */

  box-sizing: border-box;

  /* Auto layout */

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  gap: 10px;

  position: absolute;
  width: 176px;
  height: 134px;
  left: 1252px;
  top: 12px;

  background: rgba(113, 122, 112, 0.5);
  border: 1px solid rgba(113, 122, 112, 0.4);
  backdrop-filter: blur(3.5px);
  /* Note: backdrop-filter has minimal browser support */

  border-radius: 5px;
`;
const StatusIndicator = styled.div<{ isSubscribed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ isSubscribed }) =>
    isSubscribed ? '#38CD7C' : '#EA2424'};
`;

export function PortalNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <PortalBox />
      <LinkBlock id={data.id} link={'https://holium.com/'} by={'by'} />
      <LinkBlock id={data.id} link={'https://holium.com/'} by={'by'} />
      <StatusIndicator isSubscribed={false} />
    </Flex>
  );
}

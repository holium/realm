import { Flex, Text } from '@holium/design-system';
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

  position: relative;
  width: 176px;
  height: 134px;

  background: rgba(113, 122, 112, 0.5);
  border: 1px solid rgba(113, 122, 112, 0.4);
  backdrop-filter: blur(3.5px);
  /* Note: backdrop-filter has minimal browser support */

  border-radius: 5px;
`;

export function PortalNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <PortalBox>
        <Flex flexDirection="column" ml={5} gap={10}>
          <Text.H4></Text.H4>
          <Text.H6 opacity={0.6}>~novned-tidsyl</Text.H6>
        </Flex>
      </PortalBox>
    </Flex>
  );
}

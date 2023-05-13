import styled from 'styled-components';

import {
  Box,
  BoxProps,
  Button,
  Flex,
  FlexProps,
  Icon,
} from '@holium/design-system/general';

const Window = styled(Box)<BoxProps>`
  background: var(--rlm-window-bg);
  border: 1px solid var(--rlm-border-color);
  backdrop-filter: blur(32.5px);
  border-radius: 12px;
`;

const Topbar = styled(Flex)<FlexProps>`
  height: 40px;
  display: flex;
  padding: 0 8px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const App = styled(Box)<BoxProps>`
  /* padding: 12px; */
  /* display: flex;
  flex-direction: column;
  flex: 1; */
  /* justify-content: center;
  height: calc(100% - 80px); */
`;

type AppWindowProps = {
  children: React.ReactNode;
  onClose: () => void;
} & BoxProps;

export const AppWindow = ({
  children,
  height,
  width,
  onClose,
  px = 2,
  py = 2,
}: AppWindowProps) => {
  return (
    <Window className="waitlist-window" height={height} width={width}>
      <Topbar>
        <Flex width={1}></Flex>
        <Button.IconButton
          size={24}
          onClick={() => {
            onClose();
          }}
        >
          <Icon name="Close" size={20} opacity={0.5} />
        </Button.IconButton>
      </Topbar>
      <App px={px} py={py}>
        {children}
      </App>
    </Window>
  );
};

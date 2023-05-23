import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

import { OnboardDialogTitle } from '../../components/OnboardDialog.styles';

const LogCard = styled(Flex)`
  flex-direction: column;
  gap: 4px;
  height: 200px;
  padding: 12px 16px;
  background: rgba(var(--rlm-window-bg-rgba));
  border: 1px solid rgba(var(--rlm-window-border-rgba));
  border-radius: 9px;
  overflow-y: scroll;
`;

const LogText = styled(Text.Body)`
  font-family: monospace;
`;

type Props = {
  logs: string[];
};

export const BootingDialogBody = ({ logs }: Props) => (
  <Flex flexDirection="column" gap={16}>
    <OnboardDialogTitle>Booting your personal server</OnboardDialogTitle>
    <LogCard>
      {logs.map((log, i) => (
        <LogText key={`log-${i}`}>{log}</LogText>
      ))}
    </LogCard>
  </Flex>
);

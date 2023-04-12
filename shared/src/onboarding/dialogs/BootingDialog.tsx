import styled from 'styled-components';
import { Flex, Icon, Spinner, Text } from '@holium/design-system/general';
import { OnboardDialog } from '../components/OnboardDialog';
import { OnboardDialogTitle } from 'onboarding/components/OnboardDialog.styles';

type Props = {
  logs: string[];
  isBooting: boolean;
  onNext: () => Promise<boolean>;
};

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

export const BootingDialog = ({ logs, isBooting, onNext }: Props) => (
  <OnboardDialog
    icon={
      isBooting ? (
        <Spinner size={8} />
      ) : (
        <Icon name="CheckCircle" fill="intent-success" size={80} />
      )
    }
    body={
      <Flex flexDirection="column" gap={16}>
        <OnboardDialogTitle>Booting your personal server</OnboardDialogTitle>
        <LogCard>
          {logs.map((log, i) => (
            <LogText key={`log-${i}`}>{log}</LogText>
          ))}
        </LogCard>
      </Flex>
    }
    onNext={isBooting ? undefined : onNext}
  />
);

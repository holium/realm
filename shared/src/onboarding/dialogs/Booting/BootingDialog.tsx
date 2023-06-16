import { Icon, Spinner } from '@holium/design-system/general';

import { OnboardDialog } from '../../components/OnboardDialog';
import { BootingDialogBody } from './BootingDialogBody';

type Props = {
  logs: string[];
  isBooting: boolean;
  isError: boolean;
  onNext: () => Promise<boolean>;
};

export const BootingDialog = ({ logs, isBooting, isError, onNext }: Props) => (
  <OnboardDialog
    icon={
      isBooting ? (
        <Spinner size={8} />
      ) : isError ? (
        <Icon name="Close" fill="intent-alert" size={80} />
      ) : (
        <Icon name="CheckCircle" fill="intent-success" size={80} />
      )
    }
    body={<BootingDialogBody logs={logs} />}
    onNext={isBooting ? undefined : onNext}
  />
);

import { Icon, Spinner } from '@holium/design-system/general';

import { OnboardDialog } from '../../components/OnboardDialog';
import { BootingDialogBody } from './BootingDialogBody';

type Props = {
  logs: string[];
  isBooting: boolean;
  onNext: () => Promise<boolean>;
};

export const BootingDialog = ({ logs, isBooting, onNext }: Props) => (
  <OnboardDialog
    icon={
      isBooting ? (
        <Spinner size={8} />
      ) : (
        <Icon name="CheckCircle" fill="intent-success" size={80} />
      )
    }
    body={<BootingDialogBody logs={logs} />}
    onNext={isBooting ? undefined : onNext}
  />
);

import { OnboardDialog } from '../../components/OnboardDialog';
import { HostingIcon } from '../../icons/HostingIcon';
import { HostingDialogBody } from './HostingDialogBody';

type Props = {
  onBack: () => void;
  onGetHosting: () => void;
  onAddExistingServer: () => void;
};

export const HostingDialog = ({
  onBack,
  onGetHosting,
  onAddExistingServer,
}: Props) => (
  <OnboardDialog
    icon={<HostingIcon />}
    body={
      <HostingDialogBody
        onGetHosting={onGetHosting}
        onAddExistingServer={onAddExistingServer}
      />
    }
    hideNextButton
    onBack={onBack}
  />
);

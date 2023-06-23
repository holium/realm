import { OnboardDialog } from '../../components/OnboardDialog';
import { GetIdIcon } from '../../icons/GetIdIcon';
import { GetRealmDialogBody } from './GetOnRealmDialogBody';

type Props = {
  onBack?: () => void;
  onUploadId: () => void;
  onPurchaseId: () => void;
  onAlreadyHaveAccount?: () => void;
};

export const GetOnRealmDialog = ({
  onBack,
  onUploadId,
  onPurchaseId,
  onAlreadyHaveAccount,
}: Props) => (
  <OnboardDialog
    icon={<GetIdIcon size={200} />}
    body={
      <GetRealmDialogBody
        onUploadId={onUploadId}
        onPurchaseId={onPurchaseId}
        onAlreadyHaveAccount={onAlreadyHaveAccount}
      />
    }
    onBack={onBack}
    hideNextButton
  />
);

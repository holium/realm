import { OnboardDialog } from '../../components/OnboardDialog';
import { GetIdIcon } from '../../icons/GetIdIcon';
import { GetRealmDialogBody } from './GetOnRealmDialogBody';

type Props = {
  onBack?: () => void;
  onUploadPier: () => void;
  onPurchaseId: () => void;
  onAlreadyHaveAccount?: () => void;
};

export const GetOnRealmDialog = ({
  onBack,
  onUploadPier,
  onPurchaseId,
  onAlreadyHaveAccount,
}: Props) => (
  <OnboardDialog
    icon={<GetIdIcon size={200} />}
    body={
      <GetRealmDialogBody
        onUploadPier={onUploadPier}
        onPurchaseId={onPurchaseId}
        onAlreadyHaveAccount={onAlreadyHaveAccount}
      />
    }
    onBack={onBack}
    hideNextButton
  />
);

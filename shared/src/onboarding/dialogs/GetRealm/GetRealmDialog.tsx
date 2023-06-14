import { OnboardDialog } from '../../components/OnboardDialog';
import { GetRealmDialogBody } from './GetRealmDialogBody';

type Props = {
  onBack: () => void;
  onPurchaseId: () => void;
  onMigrateId: () => void;
};

export const GetRealmDialog = ({
  onBack,
  onPurchaseId,
  onMigrateId,
}: Props) => (
  <OnboardDialog
    body={
      <GetRealmDialogBody
        onPurchaseId={onPurchaseId}
        onMigrateId={onMigrateId}
      />
    }
    hideNextButton
    onBack={onBack}
  />
);

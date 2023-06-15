import { OnboardDialog } from '../../components/OnboardDialog';
import { GetIdIcon } from '../../icons/GetIdIcon';
import { GetRealmDialogBody } from './GetOnRealmDialogBody';

type Props = {
  onBack?: () => void;
  onMigrateId: () => void;
  onPurchaseId: () => void;
};

export const GetOnRealmDialog = ({
  onBack,
  onMigrateId,
  onPurchaseId,
}: Props) => (
  <OnboardDialog
    icon={<GetIdIcon size={200} />}
    body={
      <GetRealmDialogBody
        onMigrateId={onMigrateId}
        onPurchaseId={onPurchaseId}
      />
    }
    onBack={onBack}
    hideNextButton
  />
);

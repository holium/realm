import { OnboardDialog } from '../../components/OnboardDialog';
import { GetIdIcon } from '../../icons/GetIdIcon';
import { GetRealmDialogBody } from './GetOnRealmDialogBody';

type Props = {
  onBack: () => void;
  onBuyAnId: () => void;
  onMigrateAnId: () => void;
};

export const GetOnRealmDialog = ({
  onBack,
  onBuyAnId,
  onMigrateAnId,
}: Props) => (
  <OnboardDialog
    icon={<GetIdIcon size={200} />}
    body={
      <GetRealmDialogBody onBuyAnId={onBuyAnId} onMigrateAnId={onMigrateAnId} />
    }
    hideNextButton
    onBack={onBack}
  />
);

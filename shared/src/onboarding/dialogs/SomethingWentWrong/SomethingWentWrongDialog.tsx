import { OnboardDialog } from '../../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { GetIdIcon } from '../../icons/GetIdIcon';

type Props = {
  onBack: () => void;
};

export const SomethingWentWrongDialog = ({ onBack }: Props) => (
  <OnboardDialog
    icon={<GetIdIcon />}
    body={
      <>
        <OnboardDialogTitle>Something went wrong.</OnboardDialogTitle>
        <OnboardDialogDescription>
          We could not add you to the waitlist. Please try again later.
        </OnboardDialogDescription>
      </>
    }
    hideNextButton
    onBack={onBack}
  />
);

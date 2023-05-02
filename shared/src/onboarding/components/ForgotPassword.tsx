import {
  OnboardDialogFooter,
  OnboardDialogFooterLink,
} from './TermsDisclaimer';

type Props = {
  onClick: () => void;
};

export const ForgotPassword = ({ onClick }: Props) => (
  <OnboardDialogFooter>
    Forgot your password?{' '}
    <OnboardDialogFooterLink onClick={onClick}>
      Reset it here
    </OnboardDialogFooterLink>
    .
  </OnboardDialogFooter>
);

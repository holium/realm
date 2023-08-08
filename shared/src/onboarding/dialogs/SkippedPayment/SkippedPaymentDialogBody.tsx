import {
  OnboardDialogDescriptionSmall,
  OnboardDialogTitleBig,
} from '../../components/OnboardDialog.styles';

type Props = {
  dueDate: string;
};

export const SkippedPaymentDialogBody = ({ dueDate }: Props) => {
  return (
    <>
      <OnboardDialogTitleBig>You skipped payment</OnboardDialogTitleBig>
      <OnboardDialogDescriptionSmall as="label" htmlFor="eth-address">
        You must fund your account by{' '}
        <span style={{ fontWeight: 500 }}>{dueDate}</span> to continue service.
        You can see the current funding amount in your account page once you
        finish onboarding.
      </OnboardDialogDescriptionSmall>
    </>
  );
};

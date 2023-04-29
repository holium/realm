import { Anchor, Button, Flex } from '@holium/design-system/general';

import { Modal } from './Modal';
import {
  OnboardDialogButtonText,
  OnboardDialogDescription,
  OnboardDialogTitle,
} from './OnboardDialog.styles';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  onAccept: () => void;
};

export const LearnMoreModal = ({ isOpen, onDismiss, onAccept }: Props) => (
  <Modal
    isOpen={isOpen}
    maxWidth={500}
    onDismiss={onDismiss}
    onSubmit={onAccept}
  >
    <OnboardDialogTitle>Learn more</OnboardDialogTitle>
    <OnboardDialogDescription>
      To use Realm, you need to be invited.
    </OnboardDialogDescription>
    <OnboardDialogDescription>
      If you haven't been invited, you can{' '}
      <Anchor href="https://holium.com" rel="noreferrer" target="_blank">
        join the waitlist
      </Anchor>{' '}
      and we'll let you know when you can join.
    </OnboardDialogDescription>
    <OnboardDialogDescription>
      If you have been invited, but still can't log in, please check your email.
      We recently made a revamp of our account system and you might need to
      reset your password.
    </OnboardDialogDescription>
    <OnboardDialogDescription>
      If you have any other issues, please shoot us an email to{' '}
      <Anchor href="mailto:support@holium.com" rel="noreferrer" target="_blank">
        support@holium.com
      </Anchor>
      .
    </OnboardDialogDescription>
    <Flex justifyContent="flex-end">
      <Button.TextButton type="button" onClick={onAccept}>
        <OnboardDialogButtonText>Agree</OnboardDialogButtonText>
      </Button.TextButton>
    </Flex>
  </Modal>
);

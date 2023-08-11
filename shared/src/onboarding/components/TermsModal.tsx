import { Anchor, Button, Flex } from '@holium/design-system/general';

import { getSupportMailTo, SUPPORT_EMAIL_ADDRESS } from '../onboarding';
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

export const TermsModal = ({ isOpen, onDismiss, onAccept }: Props) => (
  <Modal
    isOpen={isOpen}
    maxWidth={500}
    onDismiss={onDismiss}
    onSubmit={onAccept}
  >
    <OnboardDialogTitle>Terms of Service</OnboardDialogTitle>
    <OnboardDialogDescription>
      User acknowledges and agrees that this software and system are
      experimental, that all use thereof is on an “as is” basis, and that Holium
      Corporation makes no warranties and EXPRESSLY DISCLAIMS the warranties of
      merchantability, fitness for a particular purpose, and non-infringement.
      User accordingly agrees to be an Alpha user under these conditions.
    </OnboardDialogDescription>
    <OnboardDialogDescription>
      Possible addition, or separate instruction to users: Alpha users are
      encouraged to report any perceived bugs or problems in the software and
      system to Holium Corporation via email:{' '}
      <Anchor
        href={getSupportMailTo(undefined, 'REALM issue')}
        rel="noreferrer"
        target="_blank"
      >
        Email {SUPPORT_EMAIL_ADDRESS}
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

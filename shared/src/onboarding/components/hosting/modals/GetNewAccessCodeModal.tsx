import { CSSProperties, FormEvent } from 'react';

import { Flex, Text } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { Modal } from '../../Modal';
import { SubmitButton } from '../SubmitButton';

type Props = {
  isOpen: boolean;
  style?: CSSProperties;
  onDismiss: () => void;
  onSubmit: () => Promise<boolean>;
};

export const GetNewAccessCodeModal = ({
  isOpen,
  style,
  onDismiss,
  onSubmit,
}: Props) => {
  const submitting = useToggle(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    submitting.toggleOn();

    const response = await onSubmit();

    if (!response) submitting.toggleOff();
    else {
      // Refresh the page to show the new access code
      window.location.reload();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      style={style}
      onDismiss={onDismiss}
      onSubmit={handleSubmit}
    >
      <Text.H5>New Access Code</Text.H5>
      <Text.Body>
        Generating a new access code will disconect all active sessions for this
        ID and require re-authentication with your new access code (you will
        remain connected to your Holium account).
      </Text.Body>
      <Flex justifyContent="flex-end" paddingTop="8px">
        <SubmitButton text="Confirm" submitting={submitting.isOn} />
      </Flex>
    </Modal>
  );
};

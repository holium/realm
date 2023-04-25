import { ChangeEvent, FormEvent, useState } from 'react';
import {
  ErrorBox,
  Flex,
  SuccessBox,
  Text,
} from '@holium/design-system/general';
import { RadioList, TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { Modal } from '../../Modal';
import { SubmitButton } from '../SubmitButton';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (ejectAddress: string, ethAddress: string) => Promise<boolean>;
};

export const EjectIdModal = ({ isOpen, onDismiss, onSubmit }: Props) => {
  const submitting = useToggle(false);

  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const [selectedEjectOption, setSelectedEjectOption] = useState<
    'masterTicket' | 'ethereumAddress'
  >('masterTicket');
  const [ethAddress, setEthAddress] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    if (!selectedEjectOption) return;

    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    event.preventDefault();
    submitting.toggleOn();

    const ejectAddress =
      selectedEjectOption === 'masterTicket' ? 'master-ticket-value' : '';

    const response = await onSubmit(ejectAddress, ethAddress);

    submitting.toggleOff();

    if (response) {
      setSuccessMessage(
        "Your Request has been sent. You will be contacted within 24 hours at your account's email address."
      );
    } else {
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const onChangeEthAddress = (e: ChangeEvent<HTMLInputElement>) => {
    setEthAddress(e.target.value);
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} onSubmit={handleSubmit}>
      <Text.H5>Eject ID</Text.H5>
      <Text.Body>
        Ejecting your ID begins the process of taking cryptographic ownership of
        it.
      </Text.Body>
      <Flex flexDirection="column" gap="16px">
        <RadioList
          options={[
            {
              value: 'masterTicket',
              label: 'Eject to Master Ticket',
            },
            {
              value: 'ethereumAddress',
              label: 'Eject to Ethereum address',
            },
          ]}
          selected={selectedEjectOption}
          onClick={setSelectedEjectOption}
        />
        {selectedEjectOption === 'ethereumAddress' && (
          <TextInput
            height="38px"
            id="eth-address"
            name="eth-address"
            type="password"
            placeholder="Ethereum address"
            onChange={onChangeEthAddress}
          />
        )}
        {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
        {successMessage && <SuccessBox>{successMessage}</SuccessBox>}
      </Flex>
      <Flex justifyContent="flex-end" paddingTop="8px">
        <SubmitButton
          text="Submit"
          submitting={submitting.isOn}
          disabled={
            selectedEjectOption === 'ethereumAddress' && ethAddress === ''
          }
        />
      </Flex>
    </Modal>
  );
};

import { FormEvent, useState } from 'react';
import { Text, Flex, useToggle, RadioList } from '@holium/design-system';
import { Modal } from '../Modal';
import { SubmitButton } from './SubmitButton';
import {
  maintenanceWindows,
  maintenanceWindowToString,
} from '../../dialogs/util/maintenanceWindows';

type Props = {
  isOpen: boolean;
  initialSelected?: string;
  onDismiss: () => void;
  onSubmit: (maintenanceWindow: string) => Promise<boolean>;
};

export const ChangeMaintenanceWindowModal = ({
  isOpen,
  initialSelected = '0',
  onDismiss,
  onSubmit,
}: Props) => {
  const submitting = useToggle(false);

  const [selectedMaintenanceWindow, setSelectedMaintenanceWindow] =
    useState(initialSelected);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    submitting.toggleOn();

    const response = await onSubmit(selectedMaintenanceWindow);

    if (!response) submitting.toggleOff();
    else {
      // Refresh the page to show the new maintenance window.
      window.location.reload();
    }
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} onSubmit={handleSubmit}>
      <Text.H5>Change maintenance window</Text.H5>
      <Flex>
        <RadioList
          options={maintenanceWindows.map((window, index) => ({
            label: maintenanceWindowToString(window),
            value: index.toString(),
          }))}
          selected={selectedMaintenanceWindow}
          onClick={setSelectedMaintenanceWindow}
        />
      </Flex>
      <Flex justifyContent="flex-end" paddingTop="8px">
        <SubmitButton text="Confirm" submitting={submitting.isOn} />
      </Flex>
    </Modal>
  );
};

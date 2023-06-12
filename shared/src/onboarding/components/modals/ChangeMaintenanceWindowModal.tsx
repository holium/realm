import { CSSProperties, FormEvent, useState } from 'react';

import { Flex, Text } from '@holium/design-system/general';
import { RadioList } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import {
  maintenanceWindows,
  maintenanceWindowToString,
} from '../../dialogs/util';
import { Modal } from '../Modal';
import { SubmitButton } from '../SubmitButton';

type Props = {
  isOpen: boolean;
  initialSelected?: string;
  style?: CSSProperties;
  onDismiss: () => void;
  onSubmit: (maintenanceWindow: string) => Promise<boolean>;
};

export const ChangeMaintenanceWindowModal = ({
  isOpen,
  initialSelected = '0',
  style,
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

    submitting.toggleOff();

    return response;
  };

  return (
    <Modal
      isOpen={isOpen}
      style={style}
      onDismiss={onDismiss}
      onSubmit={handleSubmit}
    >
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

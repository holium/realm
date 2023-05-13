import { observer } from 'mobx-react';

import { Button, Flex, Spinner, Text } from '@holium/design-system';

import { useAppState } from 'renderer/stores/app.store';

interface ConfirmDialogProps {
  loading: boolean;
  title: string;
  description: string;
  innerContent?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => any;
}

const ConfirmDialogPresenter = ({
  title,
  description,
  innerContent,
  loading,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
}: ConfirmDialogProps) => {
  const { shellStore } = useAppState();

  const handleOnConfirm = () => {
    onConfirm().then(() => {
      shellStore.closeDialog();
      shellStore.setIsBlurred(false);
    });
  };

  return (
    <Flex
      flex={1}
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Text.Custom fontSize={3} fontWeight={600}>
        {title}
      </Text.Custom>
      <Text.Custom fontSize={2} fontWeight={300}>
        {description}
      </Text.Custom>
      {innerContent}
      <Flex justifyContent="space-between">
        <Button.TextButton
          data-close-tray="false"
          tabIndex={2}
          style={{ fontWeight: 400 }}
          onClick={() => {
            shellStore.closeDialog();
            shellStore.setIsBlurred(false);
          }}
        >
          {cancelText}
        </Button.TextButton>
        <Button.TextButton
          data-close-tray="false"
          tabIndex={1}
          color="intent-alert"
          disabled={loading}
          style={{ fontWeight: 400 }}
          onClick={handleOnConfirm}
        >
          {loading ? <Spinner size={0} /> : confirmText}
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};

export const ConfirmDialog = observer(ConfirmDialogPresenter);

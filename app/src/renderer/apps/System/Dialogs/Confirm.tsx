import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Spinner, Text, Button } from '@holium/design-system';
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

export const ConfirmDialog: FC<ConfirmDialogProps> = observer(
  (props: ConfirmDialogProps) => {
    const { shellStore } = useAppState();
    const { loading } = props;

    const onConfirm = () => {
      props.onConfirm().then(() => {
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
          {props.title}
        </Text.Custom>
        <Text.Custom fontSize={2} fontWeight={300}>
          {props.description}
        </Text.Custom>
        {props.innerContent}
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
            {props.cancelText}
          </Button.TextButton>
          <Button.TextButton
            data-close-tray="false"
            tabIndex={1}
            color="intent-alert"
            disabled={loading}
            style={{ fontWeight: 400 }}
            onClick={() => onConfirm()}
          >
            {loading ? <Spinner size={0} /> : props.confirmText}
          </Button.TextButton>
        </Flex>
      </Flex>
    );
  }
);

ConfirmDialog.defaultProps = {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

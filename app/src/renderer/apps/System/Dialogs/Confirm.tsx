import { FC } from 'react';
import { observer } from 'mobx-react';
import { Flex, Spinner } from '@holium/design-system';
import { Text, TextButton } from 'renderer/components';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';

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
    const { theme } = useServices();
    const { loading } = props;

    const onConfirm = () => {
      props.onConfirm().then(() => {
        ShellActions.closeDialog();
        ShellActions.setBlur(false);
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
        <Text fontSize={3} fontWeight={600}>
          {props.title}
        </Text>
        <Text fontSize={2} fontWeight={300}>
          {props.description}
        </Text>
        {props.innerContent}
        <Flex justifyContent="space-between">
          <TextButton
            tabIndex={2}
            showBackground
            highlightColor={theme.currentTheme.accentColor}
            textColor={theme.currentTheme.accentColor}
            style={{ fontWeight: 400 }}
            onClick={() => {
              ShellActions.closeDialog();
              ShellActions.setBlur(false);
            }}
          >
            {props.cancelText}
          </TextButton>
          <TextButton
            tabIndex={1}
            highlightColor="#EC415A"
            showBackground
            textColor="#EC415A"
            disabled={loading}
            style={{ fontWeight: 400 }}
            onClick={() => onConfirm()}
          >
            {loading ? <Spinner size={0} /> : props.confirmText}
          </TextButton>
        </Flex>
      </Flex>
    );
  }
);

ConfirmDialog.defaultProps = {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

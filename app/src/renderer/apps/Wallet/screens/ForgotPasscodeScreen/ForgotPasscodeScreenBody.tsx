import {
  Button,
  Flex,
  Icon,
  Spinner,
  Text,
} from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

type Props = {
  onClickCancel: () => void;
  onClickDelete?: () => void;
  onClickDeleteAsync?: () => Promise<void>;
  bodyText: string;
};

export const ForgotPasscodeScreenBody = ({
  onClickCancel,
  onClickDelete,
  onClickDeleteAsync,
  bodyText,
}: Props) => {
  const deleting = useToggle(false);

  const handleOnClickDelete = async () => {
    deleting.toggleOn();
    onClickDelete && onClickDelete();
    onClickDeleteAsync && (await onClickDeleteAsync());
    deleting.toggleOff();
  };

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="24px"
    >
      <Icon name="Info" size={36} />
      <Flex flexDirection="column" gap="12px" alignItems="center">
        <Text.H3>Delete wallet</Text.H3>
        <Text.Body textAlign="center">{bodyText}</Text.Body>
      </Flex>
      <Flex gap="10px">
        <Button.Transparent
          height={32}
          fontWeight={500}
          disabled={deleting.isOn}
          onClick={onClickCancel}
        >
          Cancel
        </Button.Transparent>
        <Button.TextButton
          height={32}
          fontWeight={500}
          color="intent-alert"
          disabled={deleting.isOn}
          onClick={handleOnClickDelete}
        >
          {deleting.isOn ? <Spinner size={0} /> : 'Delete'}
        </Button.TextButton>
      </Flex>
    </Flex>
  );
};

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
  onClickDelete: () => Promise<void>;
};

export const ForgotPasscodeScreenBody = ({
  onClickCancel,
  onClickDelete,
}: Props) => {
  const deleting = useToggle(false);

  const handleOnClickDelete = async () => {
    deleting.toggleOn();
    onClickDelete && onClickDelete();
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
      <Icon name="Info" size={32} opacity={0.5} />
      <Flex flexDirection="column" gap="12px" alignItems="center">
        <Text.H4>Delete wallet</Text.H4>
        <Text.Body px="30px" opacity={0.7} textAlign="center">
          If you've forgotten your passcode, you can delete your wallet and then
          import it again using your recovery phrase.
        </Text.Body>
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

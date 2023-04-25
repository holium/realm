import { Button, Flex, Icon } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';
import { TextInput } from '@holium/design-system/inputs';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';

type Props = {
  shipCode: string;
};

export const ChangeAccessCode = ({ shipCode }: Props) => {
  const showAccessKey = useToggle(false);

  return (
    <AccountDialogTableRow title="Access Code">
      <Flex flex={1}>
        <TextInput
          id="hosting-access-code"
          name="hosting-access-code"
          value={shipCode}
          width="100%"
          readOnly={true}
          type={showAccessKey.isOn ? 'text' : 'password'}
          rightAdornment={
            <Button.IconButton type="button" onClick={showAccessKey.toggle}>
              <Icon
                name={showAccessKey.isOn ? 'EyeOff' : 'EyeOn'}
                opacity={0.5}
                size={18}
              />
            </Button.IconButton>
          }
        />
      </Flex>
    </AccountDialogTableRow>
  );
};

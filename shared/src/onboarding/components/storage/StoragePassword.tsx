import { Button, Flex, Icon } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { AccountDialogTableRow } from '../AccountDialogTableRow';

type Props = {
  storagePassword: string;
};

export const StoragePassword = ({ storagePassword }: Props) => {
  const showStoragePassword = useToggle(false);

  return (
    <AccountDialogTableRow title="Storage Password">
      <Flex flex={1}>
        <TextInput
          height="38px"
          id="hosting-access-code"
          name="hosting-access-code"
          value={storagePassword}
          width="100%"
          readOnly={true}
          type={showStoragePassword.isOn ? 'text' : 'password'}
          rightAdornment={
            <Button.IconButton
              type="button"
              onClick={showStoragePassword.toggle}
            >
              <Icon
                name={showStoragePassword.isOn ? 'EyeOff' : 'EyeOn'}
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

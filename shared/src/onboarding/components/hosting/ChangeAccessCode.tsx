import { Button, Flex, Icon } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';

type Props = {
  shipCode: string;
  label?: string;
};

export const ChangeAccessCode = ({
  shipCode,
  label = 'Access Code',
}: Props) => {
  const showAccessKey = useToggle(false);

  return (
    <AccountDialogTableRow title={label}>
      <Flex flex={1}>
        <TextInput
          width="100%"
          height="38px"
          id="hosting-access-code"
          name="hosting-access-code"
          value={shipCode}
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

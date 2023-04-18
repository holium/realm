import { Button, Flex, Icon } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';
import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';

type Props = {
  s3Password: string;
};

export const S3Password = ({ s3Password }: Props) => {
  const showS3Password = useToggle(false);

  return (
    <AccountDialogTableRow title="S3 password">
      <Flex flex={1}>
        <TextInput
          height="38px"
          id="hosting-access-code"
          name="hosting-access-code"
          value={s3Password}
          width="100%"
          readOnly={true}
          type={showS3Password.isOn ? 'text' : 'password'}
          rightAdornment={
            <Button.IconButton type="button" onClick={showS3Password.toggle}>
              <Icon
                name={showS3Password.isOn ? 'EyeOff' : 'EyeOn'}
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

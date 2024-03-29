import { useFormikContext } from 'formik';

import { Button, Flex, Icon } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { OnboardDialogInputLabel } from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

type AddIdentityFields = {
  id: string;
  url: string;
  code: string;
};

export const AddIdentityDialogBody = () => {
  const { errors } = useFormikContext<AddIdentityFields>();

  const showAccessKey = useToggle(false);

  return (
    <>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="id-onboarding">
          ID
        </OnboardDialogInputLabel>
        <FormField
          name="id"
          type="text"
          placeholder="~sampel-palnet"
          isError={Boolean(errors.id)}
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="url-onboarding">
          URL
        </OnboardDialogInputLabel>
        <FormField
          name="url"
          type="text"
          placeholder="https://my-server.host.com"
          isError={Boolean(errors.url)}
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="access-key-onboarding">
          Code
        </OnboardDialogInputLabel>
        <FormField
          name="code"
          type={showAccessKey.isOn ? 'text' : 'password'}
          placeholder="sample-micsev-bacmug-moldex"
          isError={Boolean(errors.code)}
          rightIcon={
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
    </>
  );
};

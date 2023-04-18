import { ChangeEvent, useState } from 'react';
import { Button, ErrorBox, Flex, Icon } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';
import { OnboardDialog } from '../components/OnboardDialog';
import { CredentialsIcon } from '../icons/CredentialsIcon';
import { OnboardDialogInputLabel } from '../components/OnboardDialog.styles';
import { TextInput } from '@holium/design-system/inputs';

type Props = {
  onBack: () => void;
  onNext: (id: string, url: string, code: string) => Promise<void>;
};

export const AddServerDialog = ({ onBack, onNext }: Props) => {
  const [id, setId] = useState('');
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');

  const showAccessKey = useToggle(false);

  const idError = useToggle(false);
  const urlError = useToggle(false);
  const codeError = useToggle(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onBlurId = () => {
    const isValidId = id?.length > 1 && id?.startsWith('~');

    if (!isValidId) idError.toggleOn();
  };

  const onBlurUrl = () => {
    const isValidUrl = url?.length > 1 && url?.startsWith('http');

    if (!isValidUrl) urlError.toggleOn();
  };

  const onBlurCode = () => {
    const isValidCode = code?.length > 1;

    if (!isValidCode) codeError.toggleOn();
  };

  const onChangeId = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
    idError.toggleOff();
  };

  const onChangeUrl = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    urlError.toggleOff();
  };

  const onChangeCode = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    codeError.toggleOff();
  };

  const handleOnNext = async () => {
    setFormError(null);

    try {
      await onNext(id, url, code);

      return true;
    } catch (e: any) {
      setFormError(e.message);

      return Promise.reject(e);
    }
  };

  return (
    <OnboardDialog
      icon={<CredentialsIcon />}
      body={
        <>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="id-onboarding">
              Server ID
            </OnboardDialogInputLabel>
            <TextInput
              height="38px"
              id="id-onboarding"
              name="id-onboarding"
              type="text"
              placeholder="~sampel-palnet"
              value={id}
              error={idError.isOn}
              onBlur={onBlurId}
              onChange={onChangeId}
            />
          </Flex>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="url-onboarding">
              Server URL
            </OnboardDialogInputLabel>
            <TextInput
              height="38px"
              id="url-onboarding"
              name="url-onboarding"
              type="text"
              placeholder="https://my-server.host.com"
              value={url}
              error={urlError.isOn}
              onBlur={onBlurUrl}
              onChange={onChangeUrl}
            />
          </Flex>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="access-key-onboarding">
              Server Code
            </OnboardDialogInputLabel>
            <TextInput
              height="38px"
              id="access-key-onboarding"
              name="access-key-onboarding"
              type={showAccessKey.isOn ? 'text' : 'password'}
              placeholder="sample-micsev-bacmug-moldex"
              value={code}
              error={codeError.isOn}
              onBlur={onBlurCode}
              onChange={onChangeCode}
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
          {formError && <ErrorBox>{formError}</ErrorBox>}
        </>
      }
      nextText="Add Ship"
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};

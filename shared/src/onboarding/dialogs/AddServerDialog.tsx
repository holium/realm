import { useState } from 'react';
import { Flex } from '@holium/design-system/general';
import { OnboardDialog } from '../components/OnboardDialog';
import { CredentialsIcon } from '../icons/CredentialsIcon';
import {
  OnboardDialogInput,
  OnboardDialogInputLabel,
} from '../components/OnboardDialog.styles';

type Props = {
  onBack: () => void;
  onNext: () => Promise<boolean>;
};

export const AddServerDialog = ({ onBack, onNext }: Props) => {
  const [id, setId] = useState('');
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');

  return (
    <OnboardDialog
      icon={<CredentialsIcon />}
      body={
        <>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="email">
              Server ID
            </OnboardDialogInputLabel>
            <OnboardDialogInput
              type="text"
              placeholder="~sampel-palnet"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </Flex>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="email">
              Server URL
            </OnboardDialogInputLabel>
            <OnboardDialogInput
              type="text"
              placeholder="https://my-server.host.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Flex>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="email">
              Server Code
            </OnboardDialogInputLabel>
            <OnboardDialogInput
              type="text"
              placeholder="sample-micsev-bacmug-moldex"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Flex>
        </>
      }
      nextText="Add Ship"
      onBack={onBack}
      onNext={onNext}
    />
  );
};

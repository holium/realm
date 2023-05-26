import { useState } from 'react';

import { CopyButton, Flex, Spinner, Text } from '@holium/design-system/general';
import { TextInput, Toggle } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { joinApi } from './JoinApi';

type Props = {
  initialLink?: string;
  onGenerateLink: (link: string) => void;
};

export const JoinLink = ({ initialLink, onGenerateLink }: Props) => {
  const loading = useToggle(false);
  const [link, setLink] = useState<string | null>(initialLink ?? null);

  const onChangeToggle = async (checked: boolean) => {
    if (!checked) {
      setLink(null);

      loading.toggleOn();

      await joinApi.deleteAllSpaceInvites({ path: 'test' });

      loading.toggleOff();

      return;
    }

    loading.toggleOn();

    try {
      const createSpaceInviteResponse = await joinApi.createSpaceInvite({
        from: '~lopsyp-doztun',
        space: {
          path: '~test',
          name: 'test',
          description: 'test',
          membersCount: 777,
          picture: '',
          theme: '',
        },
      });

      setLink(createSpaceInviteResponse.inviteUrl);
      onGenerateLink(createSpaceInviteResponse.inviteUrl);
    } catch (error) {
      console.error(error);
    } finally {
      loading.toggleOff();
    }
  };

  return (
    <Flex col gap="8px">
      <Text.Body opacity={0.6} style={{ marginTop: 4 }}>
        External link to onboard members into your space.
      </Text.Body>
      <Flex width="100%" align="center" gap="10px" height="34px">
        <Toggle disabled={loading.isOn} onChange={onChangeToggle} />
        {loading.isOn && <Spinner size={0} />}
        {link && link?.length > 0 && (
          <TextInput
            id="invite-link"
            name="invite-link"
            value={link}
            readOnly
            width="100%"
            rightAdornment={<CopyButton content={link} />}
          />
        )}
      </Flex>
    </Flex>
  );
};

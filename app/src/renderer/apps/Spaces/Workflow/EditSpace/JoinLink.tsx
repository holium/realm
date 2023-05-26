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
  const generating = useToggle(false);
  const [link, setLink] = useState<string | null>(initialLink ?? null);

  const onChangeToggle = async (checked: boolean) => {
    if (!checked) {
      setLink(null);
      return;
    }

    generating.toggleOn();

    try {
      const createSpaceInviteResponse = await joinApi.createSpaceInvite({
        from: '~lopsyp-doztun',
        space: {
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
      generating.toggleOff();
    }
  };

  return (
    <Flex col gap="8px">
      <Text.Body opacity={0.6} style={{ marginTop: 4 }}>
        External link to onboard members into your space.
      </Text.Body>
      <Flex width="100%" align="center" gap="10px" height="34px">
        <Toggle disabled={generating.isOn} onChange={onChangeToggle} />
        {generating.isOn && <Spinner size={0} />}
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

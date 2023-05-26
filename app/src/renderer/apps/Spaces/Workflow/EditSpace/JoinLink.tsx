import { useState } from 'react';

import { CopyButton, Flex, Spinner, Text } from '@holium/design-system/general';
import { TextInput, Toggle } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';
import { CreateSpaceInvitePayload } from '@holium/shared';

import { joinApi } from './JoinApi';

type Props = {
  payload: CreateSpaceInvitePayload;
  initialLink?: string;
  onGenerateLink: (link: string) => void;
};

export const JoinLink = ({ payload, initialLink, onGenerateLink }: Props) => {
  const loading = useToggle(false);
  const error = useToggle(false);
  const [link, setLink] = useState<string | null>(initialLink ?? null);

  const onChangeToggle = async (checked: boolean) => {
    error.toggleOff();
    if (!checked) {
      setLink(null);

      loading.toggleOn();

      try {
        await joinApi.deleteAllSpaceInvites({ path: payload.space.path });
      } catch (msg) {
        console.error(msg);
      }

      loading.toggleOff();

      return;
    }

    loading.toggleOn();

    try {
      const createSpaceInviteResponse = await joinApi.createSpaceInvite(
        payload
      );

      setLink(createSpaceInviteResponse.inviteUrl);
      onGenerateLink(createSpaceInviteResponse.inviteUrl);
    } catch (msg) {
      console.error(msg);
      error.toggleOn();
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
        <Toggle
          initialChecked={Boolean(initialLink)}
          disabled={loading.isOn}
          onChange={onChangeToggle}
        />
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
        {error.isOn && (
          <Text.Body color="intent-alert">
            Couldn't generate join link. Please try again.
          </Text.Body>
        )}
      </Flex>
    </Flex>
  );
};

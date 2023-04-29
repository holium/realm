import { useEffect, useState } from 'react';

import { Flex, Text, useToggle } from '@holium/design-system';
import { Spinner } from '@holium/design-system/general';
import { PassportCard } from '@holium/shared';

import { AuthIPC, OnboardingIPC, ShipIPC } from 'renderer/stores/ipc';
import { MobXAccount } from 'renderer/stores/models/account.model';

import { ColorPicker } from '../../components/ColorPicker';
import { SettingSection } from '../../components/SettingSection';

type Props = {
  account: MobXAccount;
};

export const AccountPassportSection = ({ account }: Props) => {
  const loading = useToggle(true);

  const [nickname, setNickname] = useState(account.nickname ?? '');
  const [description, setDescription] = useState('');
  const [avatarSrc, setAvatarSrc] = useState(account.avatar ?? '');
  const [accentColor, setAccentColor] = useState(account.color ?? '#000');

  const handleSetAvatarSrc = (src?: string) => {
    setAvatarSrc(src ?? '');
  };

  const onUploadFile = async (file: File) => {
    const src = await ShipIPC.uploadFile({
      source: 'file',
      content: file.path,
      contentType: file.type,
    });

    return src;
  };

  const onSubmit = async () => {
    if (!nickname) return false;

    const authResult = await AuthIPC.updatePassport(
      account.patp,
      nickname,
      description,
      avatarSrc,
      accentColor
    );

    // Sync friends agent
    const shipResult = await ShipIPC.updatePassport(
      nickname,
      description,
      avatarSrc,
      accentColor
    );

    return Boolean(authResult && shipResult);
  };

  useEffect(() => {
    loading.toggleOn();

    OnboardingIPC.getPassport()
      .then((ourPassport) => {
        setNickname(ourPassport?.nickname);
        setAvatarSrc(ourPassport?.avatar);
        setDescription(ourPassport?.bio);
        setAccentColor(ourPassport?.color);
      })
      .finally(loading.toggleOff);
  }, []);

  return (
    <SettingSection
      title="Passport"
      elevation={2}
      onSubmit={onSubmit}
      body={
        loading.isOn ? (
          <Flex
            width="100%"
            height="180px"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner size={6} />
          </Flex>
        ) : (
          <>
            <PassportCard
              patp={account.patp}
              color={accentColor}
              nickname={nickname}
              setNickname={setNickname}
              description={description}
              setDescription={setDescription}
              initialAvatarSrc={avatarSrc}
              setAvatarSrc={handleSetAvatarSrc}
              onUploadFile={onUploadFile}
              noContainer
            />
            <Flex flexDirection="row" gap="20px">
              <Flex width="68px" />
              <Flex flexDirection="row" gap="8px" alignItems="center">
                <ColorPicker
                  top={148}
                  left={138}
                  swatches={[
                    '#4E9EFD',
                    '#FFFF00',
                    '#00FF00',
                    '#FF0000',
                    '#52B278',
                    '#D9682A',
                    '#ff3399',
                    '#8419D9',
                  ]}
                  initialColor={accentColor}
                  onChange={setAccentColor}
                />
                <Text.Custom fontSize="14px" opacity={0.6}>
                  Accent Color
                </Text.Custom>
              </Flex>
            </Flex>
          </>
        )
      }
    />
  );
};

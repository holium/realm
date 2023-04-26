import { useState } from 'react';

import { Flex, Text } from '@holium/design-system';
import { PassportCard } from '@holium/shared';

import { AuthIPC, OnboardingIPC } from 'renderer/stores/ipc';
import { ShipMobxType } from 'renderer/stores/ship.store';

import { ColorPicker } from '../../components/ColorPicker';
import { SettingSection } from '../../components/SettingSection';

type Props = {
  ship: ShipMobxType;
};

export const AccountPassportSection = ({ ship }: Props) => {
  const [nickname, setNickname] = useState(ship.nickname ?? '');
  const [description, setDescription] = useState('');
  const [avatarSrc, setAvatarSrc] = useState(ship.avatar ?? '');
  const [accentColor, setAccentColor] = useState(ship.color ?? '#000');

  const handleSetAvatarSrc = (src?: string) => {
    setAvatarSrc(src ?? '');
  };

  const onUploadFile = async (_file: File) => {
    return '';
  };

  const onSubmit = async () => {
    if (!nickname) return false;

    await AuthIPC.updatePassport(
      ship.patp,
      nickname,
      description,
      avatarSrc,
      accentColor
    );

    // Sync friends agent
    await OnboardingIPC.updatePassport(ship.patp, {
      nickname,
      avatar: avatarSrc,
      bio: description,
    });

    return true;
  };

  return (
    <SettingSection
      title="Passport"
      elevation={2}
      onSubmit={onSubmit}
      body={
        <>
          <PassportCard
            patp={ship.patp}
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
      }
    />
  );
};

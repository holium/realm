import { useState } from 'react';

import { Flex, Text } from '@holium/design-system';
import { PassportCard } from '@holium/shared';

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

  const onSubmit = async () => {};

  return (
    <SettingSection
      title="Passport"
      elevation={2}
      onSubmit={onSubmit}
      body={
        <>
          <PassportCard
            patp={ship.patp}
            color={ship.color ?? '#000'}
            nickname={nickname}
            setNickname={setNickname}
            description={description}
            setDescription={setDescription}
            initialAvatarSrc={avatarSrc}
            setAvatarSrc={handleSetAvatarSrc}
            onUploadFile={onUploadFile}
            noContainer
          />

          <Flex flexDirection={'row'} flex={4} justifyContent="flex-start">
            <Text.Custom fontWeight={500} flex={1} mt={2}>
              Accent Color
            </Text.Custom>
            <ColorPicker
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
          </Flex>
        </>
      }
    />
  );
};

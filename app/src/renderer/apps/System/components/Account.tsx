import React, { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Card, Input, RadioGroup, TextButton} from 'renderer/components';
import { lighten } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ColorPicker } from './ColorPicker';
import { useForm, useField } from 'mobx-easy-form';
import { ShipActions } from 'renderer/logic/actions/ship';




export const AccountPanel: FC<any> = observer(() => {
  const { desktop, ship, contacts } = useServices();

  const { windowColor, textColor, accentColor, inputColor } = desktop.theme;

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

    
  type avatarOptionType = 'color' | 'image' ;

  const [avatarOption, setAvatarOption] =
    useState<avatarOptionType>(ship!.avatar ? 'image' : 'color');


  const profileForm = useForm({
    async onSubmit({ values }: any) {

      //
      console.log('submit', values, avatarOption)
      

      let profileData = {
        color: values.avatarColor,
        nickname: values.nickname,
        avatar: values.avatarImage
      };

      if(avatarOption === 'color') {
        profileData.avatar = '';
      }

      await ShipActions.saveMyContact(profileData);
      // ShipActions.
      // ship!.avatar = values.avatarImage!;
      // ship!.color = values.avatarColor;
      // ship!.nickname = values.nickname;

    }
  });

  const avatarColorField = useField({
    id: 'avatarColor',
    form: profileForm,
    initialValue: ship!.color!,
    });

  const avatarImageField = useField({
    id: 'avatarImage',
    form: profileForm,
    initialValue: ship!.avatar ? ship!.avatar : '',
  });

  const nicknameField = useField({
    id: 'nickname',
    form: profileForm,
    initialValue: ship!.nickname ? ship!.nickname : '',
  });


  return (

    <Flex gap={12} flexDirection="column" p="12px" width='100%'>

      <Text
        fontSize={8}
        fontWeight={600}
        mb={6}
      >
        Account
      </Text>

      <Text opacity={0.7} fontSize={3} fontWeight={500}>
      PROFILE
    </Text>
    <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
        mb={2}
      >

        <Flex gap={20} flexDirection={'column'} mt={2}>
          <Flex flexDirection={'row'} flex={4} justifyContent='flex-start'>
            <Text fontWeight={500} flex={1}>
              Urbit ID
            </Text>
            <Text flex={2}>
              {ship!.patp!}
            </Text>
          </Flex>
          
          <Flex flexDirection={'row'} flex={4} justifyContent='flex-start'>
            <Text fontWeight={500} flex={1} margin='auto'>
              Nickname
            </Text>
            <Input
            flex={2}
            className="realm-cursor-text-cursor"
            type="text"
            placeholder="(none)"
            value={nicknameField.state.value}
            wrapperStyle={{
              cursor: 'none',
              borderRadius: 9,
              backgroundColor: inputColor,
            }}
            // defaultValue={ship!.nickname ? ship!.nickname : ''}
            // error={!shipUrl.computed.isDirty || shipUrl.computed.error}
            onChange={(e: any) =>
              nicknameField.actions.onChange(e.target.value)
            }
          />
          </Flex>

          <Flex flexDirection={'row'} flex={4} justifyContent='flex-start'>
            <Text fontWeight={500} flex={1} mt={2}>
              Avatar
            </Text>

            <Flex flex={2} flexDirection={'column'} justifyContent={'flex-start'} gap={8}>
              <RadioGroup
                  customBg={windowColor}
                  textColor={textColor}
                  selected={avatarOption}
                  options={[
                    { label: 'Color', value: 'color' },
                    { label: 'Image', value: 'image' },
                  ]}
                  onClick={(value: avatarOptionType) => {
                    setAvatarOption(value);
                  }}
                />

                <Flex height={30}>
                {avatarOption === 'color' && 
                  <ColorPicker
                    initialColor={ship!.color!}
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
                    onChange={(color: string) =>
                      // console.log('color avatar input', color)
                      avatarColorField.actions.onChange(color)
                      }
                  />
                }
                {avatarOption === 'image' &&
                    <Input
                    className="realm-cursor-text-cursor"
                    type="text"
                    placeholder="Paste url here"
                    value={avatarImageField.state.value}
                    wrapperStyle={{
                      cursor: 'none',
                      borderRadius: 9,
                      backgroundColor: inputColor,
                    }}
                    // defaultValue={customWallpaper.state.value}
                    // error={!shipUrl.computed.isDirty || shipUrl.computed.error}
                    onChange={(e: any) =>
                      avatarImageField.actions.onChange(e.target.value)
                      // customWallpaper.actions.onChange(e.target.value)
                    }
                  />
                }
                </Flex>

            </Flex>
          
        </Flex>

        <TextButton
            style={{ fontWeight: 400 }}
            showBackground
            textColor={accentColor}
            highlightColor={accentColor}
            disabled={!profileForm.computed.isValid}
            onClick={profileForm.actions.submit}
            >
                Save
          </TextButton>

        </Flex>

    </Card>
    <Text opacity={0.7} fontSize={3} fontWeight={500}>
      HOSTING
    </Text>
    <Card
        p="20px"
        width="100%"
        // minHeight="240px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
        mb={2}
      >
        <Text>
          Coming Soon
        </Text>

    </Card>
    </Flex>
  )
})
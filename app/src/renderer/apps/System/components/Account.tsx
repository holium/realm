import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import {
  AvatarInput,
  Button,
  Icon,
  Flex,
  RadioGroup,
  Spinner,
  TextInput,
} from '@holium/design-system';
import { useToggle } from '@holium/shared';
import {
  Text,
  Card,
  TextButton,
  Anchor,
  CopyButton,
} from 'renderer/components';
import { lighten } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ColorPicker } from './ColorPicker';
import { useForm, useField } from 'mobx-easy-form';
import { ShipActions } from 'renderer/logic/actions/ship';
import { DesktopActions } from 'renderer/logic/actions/desktop';
import { ShellActions } from 'renderer/logic/actions/shell';
import { AuthActions } from 'renderer/logic/actions/auth';
import { useTrayApps } from 'renderer/apps/store';

const AccountPanelPresenter = () => {
  const { theme, ship, identity } = useServices();
  const { setActiveApp } = useTrayApps();
  const [avatarImg, setAvatarImg] = useState(ship?.avatar ?? '');
  const showAccessKey = useToggle(false);

  const { windowColor, textColor, accentColor } = theme.currentTheme;

  const cardColor = useMemo(() => lighten(0.03, windowColor), [windowColor]);

  const [isLoading, setIsLoading] = useState(false);

  const url = identity.auth.currentShip?.url;
  const isHostedShip = url?.includes('holium.network');
  const email = identity.auth.email;
  const [code, setCode] = useState('');

  useEffect(() => {
    async function getCode() {
      const code = await AuthActions.getCode();
      setCode(code);
    }
    getCode();
  }, []);

  type avatarOptionType = 'color' | 'image';

  const [avatarOption, setAvatarOption] = useState<avatarOptionType>(
    ship?.avatar ? 'image' : 'color'
  );

  const profileForm = useForm({
    async onSubmit({ values }: any) {
      let profileData = {
        color: values.avatarColor,
        nickname: values.nickname,
        avatar: avatarImg,
      };

      if (avatarOption === 'color') {
        profileData.avatar = '';
      }

      setIsLoading(true);

      await ShipActions.saveMyContact(profileData);
      await DesktopActions.setMouseColor(values.avatarColor);
      await AuthActions.setShipProfile(ship?.patp ?? '', profileData);

      setIsLoading(false);
    },
  });

  const avatarColorField = useField({
    id: 'avatarColor',
    form: profileForm,
    initialValue: ship?.color ?? '#000',
  });

  const nicknameField = useField({
    id: 'nickname',
    form: profileForm,
    initialValue: ship?.nickname ?? '',
    validate: (nickname: string) => {
      if (nickname.length > 40) {
        return { error: 'too long', parsed: undefined };
      }
      // const parsed = tokenizeMessage(message);
      // TODO parse out patp, links, etc here
      return { error: undefined, parsed: nickname };
    },
  });

  if (!ship) return null;

  return (
    <Flex gap={12} flexDirection="column" p={3} width="100%" overflowY="auto">
      <Text fontSize={7} fontWeight={600} mb={6}>
        Account
      </Text>

      <Text opacity={0.7} fontSize={3} fontWeight={500}>
        PROFILE
      </Text>
      <Card
        p="20px"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
        mb={2}
      >
        <Flex gap={20} flexDirection={'column'} mt={2}>
          <Flex
            flexDirection={'row'}
            flex={4}
            justifyContent="flex-start"
            minWidth={100}
          >
            <Text fontWeight={500} flex={1} margin={'auto'}>
              Urbit ID
            </Text>
            <Text flex={3} mx={4}>
              {ship.patp}
            </Text>
          </Flex>

          <Flex flexDirection={'row'} flex={4} justifyContent="flex-start">
            <Text fontWeight={500} flex={1} margin="auto">
              Nickname
            </Text>
            <Flex flex={3}>
              <TextInput
                id="account-nickname"
                name="account-nickname"
                className="realm-cursor-text-cursor"
                width="100%"
                type="text"
                placeholder="(none)"
                value={nicknameField.state.value}
                onChange={(e: any) =>
                  nicknameField.actions.onChange(e.target.value)
                }
              />
            </Flex>
          </Flex>

          <Flex flexDirection={'row'} flex={4} justifyContent="flex-start">
            <Text fontWeight={500} flex={1} mt={2}>
              Avatar
            </Text>

            <Flex
              flex={3}
              flexDirection={'column'}
              justifyContent={'flex-start'}
              gap={8}
            >
              <RadioGroup
                selected={avatarOption}
                options={[
                  { label: 'Color', value: 'color' },
                  { label: 'Image', value: 'image' },
                ]}
                onClick={(value) => setAvatarOption(value as avatarOptionType)}
              />

              <Flex height={30}>
                {avatarOption === 'color' && (
                  <ColorPicker
                    initialColor={ship.color ?? '#000'}
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
                      avatarColorField.actions.onChange(color)
                    }
                  />
                )}
                {avatarOption === 'image' && (
                  <AvatarInput
                    id="system-account-avatar-input"
                    width="100%"
                    initialValue={ship.avatar ?? ''}
                    onSave={(url) => setAvatarImg(url)}
                  />
                )}
              </Flex>
            </Flex>
          </Flex>

          <Flex
            height="24px"
            width="100%"
            alignItems="center"
            justifyContent="flex-end"
          >
            {isLoading ? (
              <Spinner size={1} />
            ) : (
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
            )}
          </Flex>
        </Flex>
      </Card>
      <Text opacity={0.7} fontSize={3} fontWeight={500}>
        HOSTING
      </Text>
      <Card
        p="20px"
        width="100%"
        elevation="none"
        customBg={cardColor}
        flexDirection={'column'}
        mb={2}
      >
        <Flex flexDirection={'row'} flex={4} justifyContent="flex-start">
          <Text fontWeight={500} flex={1} margin={'auto'}>
            Email
          </Text>
          <Flex justifyContent="space-between" flex={3}>
            <Text color={textColor}>{email}</Text>
            <TextButton
              style={{ fontWeight: 400 }}
              showBackground
              textColor={accentColor}
              highlightColor={accentColor}
              onClick={() => {
                ShellActions.setBlur(true);
                ShellActions.openDialog('change-email-dialog');
                setActiveApp(null);
              }}
            >
              Change Email
            </TextButton>
          </Flex>
        </Flex>

        {isHostedShip && (
          <>
            <Flex
              flexDirection={'row'}
              flex={4}
              mt={4}
              justifyContent="flex-start"
            >
              <Text fontWeight={500} flex={1} margin={'auto'}>
                Payment
              </Text>
              <Flex justifyContent="space-between" flex={3}>
                <Text color={textColor}>Credit Card</Text>
                <Anchor
                  href="https://billing.stripe.com/p/login/00g4gz19T9WbfxS4gg"
                  p={0}
                  m={0}
                >
                  <TextButton
                    style={{ fontWeight: 400 }}
                    showBackground
                    textColor={accentColor}
                    highlightColor={accentColor}
                  >
                    Manage billing
                  </TextButton>
                </Anchor>
              </Flex>
            </Flex>
          </>
        )}

        <Flex flexDirection={'row'} flex={4} mt={4} justifyContent="flex-start">
          <Text fontWeight={500} flex={1} margin={'auto'}>
            URL
          </Text>
          <Text color={textColor} flex={3}>
            {url}
          </Text>
        </Flex>

        <Flex flexDirection={'row'} flex={4} mt={4} justifyContent="flex-start">
          <Text fontWeight={500} flex={1} margin={'auto'}>
            Access Code
          </Text>
          {code === '' ? (
            <Flex flex={3}>
              <Spinner size={1} />
            </Flex>
          ) : (
            <Flex flex={3} gap={6} alignItems="center">
              <TextInput
                id="system-account-access-code"
                name="access-code"
                py={2}
                width={285}
                value={code}
                readOnly={true}
                type={showAccessKey.isOn ? 'text' : 'password'}
                rightAdornment={
                  <Button.IconButton onClick={showAccessKey.toggle}>
                    <Icon
                      name={showAccessKey.isOn ? 'EyeOff' : 'EyeOn'}
                      opacity={0.5}
                      size={18}
                    />
                  </Button.IconButton>
                }
              />
              <CopyButton content={code} />
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  );
};

export const AccountPanel = observer(AccountPanelPresenter);

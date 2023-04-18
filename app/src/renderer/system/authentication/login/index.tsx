import { useRef, useEffect, useState, useMemo } from 'react';
import { Fill, Bottom, Centered } from 'react-spaces';
import { observer } from 'mobx-react';
import {
  Avatar,
  Flex,
  Box,
  Spinner,
  TextInput,
  Text,
  Button,
  Icon,
  Menu,
  MenuItemProps,
} from '@holium/design-system';
import { ShipSelector } from './ShipSelector';
import { useAppState } from 'renderer/stores/app.store';

interface LoginProps {
  addShip: () => void;
}

const LoginPresenter = ({ addShip }: LoginProps) => {
  const { setTheme, authStore } = useAppState();
  const { accounts, status: loginStatus } = authStore;

  const [password, setPassword] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  // const wrapperRef = useRef(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  // Setting up options menu
  const [selectedShip, setSelectedShip] = useState(accounts[0]);

  const shipName = selectedShip?.nickname || selectedShip?.patp;

  useEffect(() => {
    selectedShip && setTheme(selectedShip.theme);
    if (passwordRef.current) {
      passwordRef.current?.focus();
    }

    // OSActions.onConnectionStatus((_event: any, status: ConduitState) => {
    //   if (status === ConduitState.Failed) {
    //     AuthActions.cancelLogin();
    //     setHasFailed(true);
    //   }
    //   if (status === ConduitState.Disconnected) {
    //     AuthActions.cancelLogin();
    //     setHasFailed(true);
    //   }
    // });
  }, [passwordRef.current]);

  useEffect(() => {
    loginStatus.reset();
    if (passwordRef.current) {
      const passInput = passwordRef.current as HTMLInputElement;
      passInput.value = '';
      setPassword('');
      passwordRef.current.focus();
    }
  }, [selectedShip]);

  const login = async () => {
    if (!selectedShip) return;

    const status = await authStore.login(
      selectedShip.patp ?? '',
      passwordRef.current?.value ?? ''
    );
    // trackEvent('CLICK_LOG_IN', 'LOGIN_SCREEN');

    // if (status) {
    //   // setAccount(selectedShip);
    // }
    //
    // if (status && status.startsWith('error:')) {
    //   if (submitRef.current) {
    //     // @ts-ignore
    //     submitRef.current.blur();
    //   }
    //   const parts = status.split(':');
    //   // see: https://github.com/orgs/holium/projects/10?pane=issue&itemId=18867662
    //   //  assume 400 means they may have changed ship code. ask them to enter the new one.
    //   if (parts.length > 1 && parseInt(parts[1]) === 400) {
    //     setLoginError('missing');
    //     ShellActions.openDialogWithStringProps('reset-code-dialog', {
    //       ship: selectedShip.patp,
    //       // @ts-ignore
    //       password: passwordRef.current?.value,
    //     });
    //   } else {
    //     // assume all others are incorrect passwords
    //     setLoginError('password');
    //   }
    // }
    // trackEvent('CLICK_LOG_IN', 'LOGIN_SCREEN');
  };
  const clickSubmit = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    login();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === 'Backspace') {
      loginStatus.reset();
    }
    if (event.key === 'Enter') {
      submitPassword();
    }
  };

  const submitPassword = () => {
    passwordRef.current?.blur();
    submitRef.current?.click();
    login();
  };

  const accountMenuId = `${selectedShip.patp}-account-menu`;
  const contextMenuOptions = useMemo(() => {
    const menu: MenuItemProps[] = [];
    menu.push({
      id: `${accountMenuId}-remove`,
      icon: 'Trash',
      label: 'Remove account',
      onClick: (evt) => {
        evt.stopPropagation();
        console.log('remove account');
        authStore.removeAccount(selectedShip.patp);
        // AuthActions.removeShip(selectedShip.patp);
      },
    });

    return menu.filter(Boolean) as MenuItemProps[];
  }, [accountMenuId]);

  const isVertical = true;

  return (
    <Fill>
      <Centered>
        {selectedShip && (
          <Flex
            position="relative"
            mt={20}
            alignItems="center"
            justifyContent="center"
          >
            <Flex
              flexDirection={isVertical ? 'column' : 'row'}
              alignItems="center"
              gap={24}
            >
              <Box>
                <Avatar
                  isLogin
                  size={72}
                  simple={false}
                  borderRadiusOverride="8px"
                  avatar={selectedShip.avatar}
                  patp={selectedShip.patp}
                  sigilColor={[selectedShip.color || '#000000', 'white']}
                />
              </Box>
              <Flex flexDirection="column" gap={10}>
                <Flex
                  gap={8}
                  mb={1}
                  flexDirection={isVertical ? 'column' : 'row'}
                  alignItems="center"
                  justifyContent="flex-start"
                  animate={{ height: 'auto' }}
                >
                  <Text.Custom
                    key={`${selectedShip.patp}`}
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0.75 }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{ opacity: { duration: 1, ease: 'easeOut' } }}
                    fontWeight={500}
                    fontSize={20}
                  >
                    {shipName}
                  </Text.Custom>
                  {selectedShip.nickname && (
                    <Text.Custom
                      initial={{ opacity: 0 }}
                      exit={{ opacity: 0.35 }}
                      animate={{
                        opacity: 0.4,
                      }}
                      transition={{
                        opacity: { duration: 1, ease: 'easeOut' },
                      }}
                      fontWeight={400}
                      fontSize={16}
                      opacity={0.35}
                    >
                      {selectedShip.patp}
                    </Text.Custom>
                  )}
                </Flex>
                <Flex
                  mt={isVertical ? 2 : 0}
                  gap={12}
                  flexDirection="column"
                  alignItems="center"
                >
                  <TextInput
                    id="login"
                    ref={passwordRef}
                    autoFocus
                    autoCorrect="false"
                    bgOpacity={0.3}
                    placeholder="Password"
                    fontSize={16}
                    height={36}
                    borderRadius={9}
                    style={{
                      width: 270,
                      backgroundColor: 'rgba(var(--rlm-input-rgba), 0.5)',
                    }}
                    inputStyle={{
                      backgroundColor: 'transparent',
                    }}
                    name="password"
                    type="password"
                    value={password}
                    error={loginStatus.error}
                    onKeyDown={onKeyDown}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPassword(e.target.value);
                    }}
                    rightAdornment={
                      <Flex
                        gap={4}
                        mr={1}
                        justifyContent="center"
                        alignItems="center"
                        // onClick={(evt) => evt.stopPropagation()}
                        // onKeyDown={(evt) => evt.stopPropagation()}
                      >
                        <Menu
                          id={accountMenuId}
                          orientation="bottom-left"
                          offset={{ x: 2, y: 2 }}
                          triggerEl={
                            <Button.IconButton size={26}>
                              <Icon
                                name="MoreHorizontal"
                                size={22}
                                opacity={0.6}
                              />
                            </Button.IconButton>
                          }
                          options={contextMenuOptions}
                        />
                        {loginStatus.state === 'loading' ? (
                          <Spinner size={0} />
                        ) : (
                          <Button.IconButton
                            ref={submitRef}
                            disabled={password.length < 6}
                            onClick={async (evt: any) => await clickSubmit(evt)}
                          >
                            <Icon
                              name="ArrowRightLine"
                              size={20}
                              opacity={0.6}
                            />
                          </Button.IconButton>
                        )}
                      </Flex>
                    }
                  />
                  <Box height={15}>
                    {loginStatus.error &&
                      [
                        'bad-gateway',
                        'password',
                        'missing',
                        'code',
                        'unknown',
                      ].indexOf(loginStatus.error) !== -1 && (
                        <Text.Hint
                          style={{
                            height: 15,
                            fontSize: 14,
                            textShadow: '0.6px 0.6px #080000',
                          }}
                          color="intent-alert"
                        >
                          {/* {hasFailed &&
                            'Connection to your ship has been refused.'} */}
                          {loginStatus.error === 'missing' &&
                            'Unable to connect to ship - error code 400.'}
                          {loginStatus.error === 'bad-gateway' &&
                            'Ship is unreachable - error code 502.'}
                          {loginStatus.error === 'password' &&
                            'Incorrect password.'}
                          {loginStatus.error === 'missing' &&
                            'Unable to connect to ship.'}
                          {loginStatus.error === 'code' &&
                            'Error saving new ship code'}
                        </Text.Hint>
                      )}
                  </Box>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Centered>
      <Bottom size={70}>
        <Flex
          overflow="visible"
          height={70}
          mr={3}
          ml={3}
          justifyContent="space-between"
          alignItems="center"
        >
          <ShipSelector
            selectedShip={selectedShip}
            onSelect={setSelectedShip}
          />
          <Flex gap={12}>
            <Button.TextButton
              showOnHover
              color="text"
              style={{ padding: '6px 10px', borderRadius: 6 }}
              onClick={() => addShip()}
            >
              <Flex
                gap={8}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Icon
                  size={22}
                  name="AddCircleLine"
                  transition={{ duration: 0.5 }}
                />
                <Text.Custom
                  fontWeight={500}
                  // transition={{ color: { duration: 0.5 } }}
                >
                  Add Urbit ID
                </Text.Custom>
              </Flex>
            </Button.TextButton>
          </Flex>
        </Flex>
      </Bottom>
    </Fill>
  );
};

export const Login = observer(LoginPresenter);

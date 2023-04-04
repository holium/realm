import { useRef, useEffect, useState, useContext } from 'react';
import { Fill, Bottom, Centered } from 'react-spaces';
import { observer } from 'mobx-react';
import { AnimatePresence } from 'framer-motion';
import {
  Avatar,
  Flex,
  Box,
  MenuItem,
  Portal,
  Spinner,
  TextInput,
  Text,
  Button,
  Icon,
  Menu,
} from '@holium/design-system';
import { ShipSelector } from './ShipSelector';
import { trackEvent } from 'renderer/logic/lib/track';
import { useAppState } from 'renderer/stores/app.store';
import { AuthIPC } from 'renderer/stores/ipc';

interface LoginProps {
  addShip: () => void;
}

const LoginPresenter = ({ addShip }: LoginProps) => {
  const { setTheme, authStore } = useAppState();
  const { accounts, status: loginStatus } = authStore;

  const [hasFailed, setHasFailed] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  // const wrapperRef = useRef(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef(null);
  const [loginError, setLoginError] = useState('');

  // Setting up options menu
  const menuWidth = 180;
  // const config = useMenu(optionsRef, {
  //   orientation: 'bottom-left',
  //   padding: 6,
  //   menuWidth,
  // });
  // const { anchorPoint, show, setShow } = config;
  const [selectedShip, setSelectedShip] = useState(accounts[0]);

  const theme = selectedShip.theme;
  const shipName = selectedShip?.nickname || selectedShip?.patp;

  useEffect(() => {
    selectedShip && setTheme(selectedShip.theme);

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
  }, []);

  useEffect(() => {
    setHasFailed(false);
    if (passwordRef.current) {
      const passInput = passwordRef.current as HTMLInputElement;
      passInput.value = '';
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
    // TODO refactor
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
  const clickSubmit = async (event: any) => {
    event.stopPropagation();
    setHasFailed(false);
    login();
  };

  const submitPassword = (event: any) => {
    if (event.keyCode === 13) {
      passwordRef.current?.blur();
      submitRef.current?.click();
    }
  };

  const isVertical = true;

  return (
    <Fill>
      <Centered>
        {selectedShip && (
          <Flex alignItems="center" justifyContent="center">
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
                      transition={{ opacity: { duration: 1, ease: 'easeOut' } }}
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
                    error={hasFailed || loginError !== ''}
                    onKeyDown={submitPassword}
                    rightAdornment={
                      <Flex
                        gap={4}
                        mr={1}
                        justifyContent="center"
                        alignItems="center"
                      >
                        {/* <Button.IconButton
                          size={26}
                          ref={optionsRef}
                          opacity={1}
                          onClick={() => {
                            // setShow(true);
                          }}
                        >
                          <Icon name="MoreHorizontal" />
                        </Button.IconButton>
                        <AnimatePresence>
                          {show && (
                            <Portal>
                              <Menu
                                id={`${selectedShip.patp}-user-menu`}
                                style={{
                                  top: anchorPoint && anchorPoint.y + 9,
                                  left: anchorPoint && anchorPoint.x + 6,
                                  visibility: show ? 'visible' : 'hidden',
                                  width: menuWidth,
                                }}
                                isOpen={show}
                                onClose={() => setShow(false)}
                              >
                                <MenuItem
                                  label="Remove ship"
                                  onClick={() => {
                                    AuthActions.removeShip(selectedShip.patp);
                                  }}
                                />
                              </Menu>
                            </Portal>
                          )}
                        </AnimatePresence> */}
                        {loginStatus === 'loading' && !hasFailed ? (
                          <Spinner size={0} />
                        ) : (
                          <Button.IconButton
                            ref={submitRef}
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

                  {(['password', 'missing', 'code'].indexOf(loginError) !==
                    -1 ||
                    hasFailed) && (
                    <Text.Hint
                      style={{
                        height: 15,
                        fontSize: 14,
                        textShadow: '0.5px 0.5px #080000',
                      }}
                      color="intent-alert"
                    >
                      {hasFailed && 'Connection to your ship has been refused.'}
                      {loginError === 'password' && 'Incorrect password.'}
                      {loginError === 'missing' && 'Unable to connect to ship.'}
                      {loginError === 'code' && 'Error saving new ship code'}
                    </Text.Hint>
                  )}
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

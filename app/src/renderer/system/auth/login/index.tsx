import { useRef, FC, useEffect, useState } from 'react';
import { Fill, Bottom, Centered } from 'react-spaces';
import { observer } from 'mobx-react';
import { AnimatePresence } from 'framer-motion';
import {
  Flex,
  Box,
  Sigil,
  Text,
  Input,
  IconButton,
  Icons,
  TextButton,
  useMenu,
  Menu,
  MenuItem,
  Spinner,
  FormControl,
} from 'renderer/components';
import { ShipSelector } from './ShipSelector';
import { useServices } from 'renderer/logic/store';
import { AuthActions } from 'renderer/logic/actions/auth';
import Portal from 'renderer/system/dialog/Portal';
import { OSActions } from 'renderer/logic/actions/os';
import { ConduitState } from '@holium/conduit/src/types';

interface LoginProps {
  addShip: () => void;
}

export const Login: FC<LoginProps> = observer((props: LoginProps) => {
  const { addShip } = props;
  const { identity, theme } = useServices();
  const { auth } = identity;
  const [hasFailed, setHasFailed] = useState(false);
  const passwordRef = useRef(null);
  const wrapperRef = useRef(null);
  const submitRef = useRef(null);
  const optionsRef = useRef(null);

  const [incorrectPassword, setIncorrectPassword] = useState(false);

  // Setting up options menu
  const menuWidth = 180;
  const config = useMenu(optionsRef, {
    orientation: 'bottom-left',
    padding: 6,
    menuWidth,
  });
  const { anchorPoint, show, setShow } = config;

  const pendingShip = auth.currentShip;
  const shipName = pendingShip?.nickname || pendingShip?.patp;

  useEffect(() => {
    OSActions.onConnectionStatus((_event: any, status: ConduitState) => {
      if (status === ConduitState.Failed) {
        AuthActions.cancelLogin();
        setHasFailed(true);
      }
      if (status === ConduitState.Disconnected) {
        AuthActions.cancelLogin();
        setHasFailed(true);
      }
    });
  }, []);

  useEffect(() => {
    setHasFailed(false);
    if (passwordRef.current) {
      const passInput = passwordRef.current as HTMLInputElement;
      passInput.value = '';
    }
  }, [pendingShip]);

  const submitPassword = (event: any) => {
    if (event.keyCode === 13) {
      // @ts-expect-error typescript...
      submitRef.current.focus();
      // @ts-expect-error typescript...
      passwordRef.current.blur();
      // @ts-expect-error typescript...
      wrapperRef.current.blur();
    }
  };
  const clickSubmit = async (event: any) => {
    event.stopPropagation();
    setHasFailed(false);

    const loggedIn = await AuthActions.login(
      pendingShip!.patp,
      // @ts-expect-error
      passwordRef.current!.value
    );
    if (!loggedIn) {
      // @ts-expect-error
      submitRef.current.blur();
      setIncorrectPassword(true);
    }
  };

  let colorProps = null;
  // if (theme) {
  colorProps = {
    color: theme.currentTheme.textColor,
    textShadow: theme.currentTheme.mode === 'dark' ? '0 1px black' : 'none',
  };
  // }

  const isVertical = true;

  return (
    <Fill>
      <Centered>
        {pendingShip && (
          <Flex alignItems="center" justifyContent="center">
            <Flex
              flexDirection={isVertical ? 'column' : 'row'}
              alignItems="center"
              gap={24}
            >
              <Box>
                <Sigil
                  isLogin
                  size={72}
                  simple={false}
                  borderRadiusOverride="8px"
                  avatar={pendingShip.avatar}
                  patp={pendingShip.patp}
                  color={[pendingShip.color || '#000000', 'white']}
                />
              </Box>
              <Flex flexDirection="column" gap={10}>
                <Flex
                  gap={12}
                  flexDirection={isVertical ? 'column' : 'row'}
                  alignItems="center"
                  justifyContent="flex-start"
                >
                  <Text
                    key={`${pendingShip.patp}`}
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0.75 }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{ opacity: { duration: 1, ease: 'easeOut' } }}
                    {...colorProps}
                    fontWeight={500}
                    fontSize={20}
                  >
                    {shipName}
                  </Text>
                  {pendingShip.nickname && (
                    <Text
                      mt="1px"
                      initial={{ opacity: 0 }}
                      exit={{ opacity: 0.35 }}
                      animate={{
                        opacity: 0.4,
                      }}
                      transition={{ opacity: { duration: 1, ease: 'easeOut' } }}
                      {...colorProps}
                      fontWeight={400}
                      fontSize={16}
                      opacity={0.35}
                    >
                      {pendingShip.patp}
                    </Text>
                  )}
                </Flex>
                <Flex
                  mt={isVertical ? 2 : 0}
                  gap={12}
                  flexDirection="column"
                  alignItems="center"
                >
                  <Input
                    ref={passwordRef}
                    wrapperRef={wrapperRef}
                    bg="bg.blendedBg"
                    autoFocus
                    autoCorrect="false"
                    bgOpacity={0.3}
                    wrapperStyle={{
                      borderRadius: 8,
                      width: isVertical ? 320 : 260,
                    }}
                    placeholder="Password"
                    fontSize={16}
                    name="password"
                    type="password"
                    rightInteractive
                    error={hasFailed || incorrectPassword}
                    onKeyDown={submitPassword}
                    rightIcon={
                      <Flex gap={4} justifyContent="center" alignItems="center">
                        <IconButton
                          size={26}
                          ref={optionsRef}
                          luminosity={theme.currentTheme.mode}
                          opacity={1}
                          onClick={(evt: any) => {
                            setShow(true);
                          }}
                        >
                          <Icons name="MoreHorizontal" />
                        </IconButton>
                        <AnimatePresence>
                          {show && (
                            <Portal>
                              <Menu
                                id={`${pendingShip.patp}-user-menu`}
                                customBg={theme.currentTheme.windowColor}
                                style={{
                                  top: anchorPoint && anchorPoint.y + 9,
                                  left: anchorPoint && anchorPoint.x + 6,
                                  visibility: show ? 'visible' : 'hidden',
                                  width: menuWidth,
                                }}
                                isOpen={show}
                                onClose={(evt) => {
                                  setShow(false);
                                }}
                              >
                                <MenuItem
                                  data-prevent-context-close={false}
                                  label="Reset password"
                                  customBg={theme.currentTheme.windowColor}
                                  onClick={() => {
                                    console.log('do reset form');
                                  }}
                                />
                                <MenuItem
                                  label="Remove ship"
                                  customBg={theme.currentTheme.windowColor}
                                  mt={1}
                                  onClick={(_evt: any) => {
                                    AuthActions.removeShip(pendingShip.patp);
                                  }}
                                />
                              </Menu>
                            </Portal>
                          )}
                        </AnimatePresence>
                        {auth.loader.isLoading && !hasFailed ? (
                          <Flex
                            justifyContent="center"
                            alignItems="center"
                            width={24}
                            height={24}
                          >
                            <Spinner size={0} />
                          </Flex>
                        ) : (
                          <IconButton
                            ref={submitRef}
                            error={hasFailed}
                            luminosity={theme.currentTheme.mode}
                            size={24}
                            canFocus
                            onClick={async (evt: any) => await clickSubmit(evt)}
                          >
                            <Icons name="ArrowRightLine" />
                          </IconButton>
                        )}
                      </Flex>
                    }
                  />

                  <FormControl.Error
                    style={{ height: 15, fontSize: 14 }}
                    textShadow="0.5px 0.5px #080000"
                  >
                    {hasFailed && 'Connection to your ship has been refused.'}
                    {incorrectPassword && 'Incorrect password.'}
                  </FormControl.Error>
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
          mr={5}
          ml={5}
          justifyContent="space-between"
          alignItems="center"
        >
          <ShipSelector />
          <Flex gap={12}>
            <TextButton
              {...colorProps}
              style={{ padding: '6px 10px', borderRadius: 6 }}
              onClick={() => addShip()}
            >
              <Flex
                gap={8}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                Add Ship <Icons size={22} name="AddCircleLine" />
              </Flex>
            </TextButton>
          </Flex>
        </Flex>
      </Bottom>
    </Fill>
  );
});

export default Login;

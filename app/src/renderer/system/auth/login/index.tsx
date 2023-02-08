import { KeyboardEventHandler, useRef, useEffect, useState } from 'react';
import { Fill, Bottom, Centered } from 'react-spaces';
import { observer } from 'mobx-react';
import { useForm, useField } from 'mobx-easy-form';
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
import { useToggle } from 'renderer/logic/lib/useToggle';
import { ShipSelector } from './ShipSelector';
import { useServices } from 'renderer/logic/store';
import { AuthActions } from 'renderer/logic/actions/auth';
import Portal from 'renderer/system/dialog/Portal';
import { OSActions } from 'renderer/logic/actions/os';
import { ConduitState } from '@holium/conduit/src/types';
import { trackEvent } from 'renderer/logic/lib/track';
import { Button, Icon, TextInput } from '@holium/design-system';
import * as yup from 'yup';

interface LoginProps {
  addShip: () => void;
}

const LoginPresenter = ({ addShip }: LoginProps) => {
  const { identity, theme } = useServices();
  const { auth } = identity;
  const [hasFailed, setHasFailed] = useState(false);
  const passwordRef = useRef(null);
  const wrapperRef = useRef(null);
  const submitRef = useRef(null);
  const optionsRef = useRef(null);
  const showAccessKey = useToggle(false);
  const [savingShipCode, setSavingShipCode] = useState(false);
  const [saveShipCodeResult, setSaveShipCodeResult] = useState('');
  const [showShipCode, setShowShipCode] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const login = async () => {
    const status = await AuthActions.login(
      pendingShip!.patp,
      // @ts-ignore
      passwordRef!.current!.value
    );
    if (status && status.startsWith('error:')) {
      if (submitRef.current) {
        // @ts-ignore
        submitRef.current.blur();
      }
      const parts = status.split(':');
      // see: https://github.com/orgs/holium/projects/10?pane=issue&itemId=18867662
      //  assume 400 means they may have changed ship code. ask them to enter the new one.
      if (parts.length > 1 && parseInt(parts[1]) === 400) {
        setLoginError('missing');
        setShowShipCode(true);
      } else {
        // assume all others are incorrect passwords
        setLoginError('password');
      }
    }
    trackEvent('CLICK_LOG_IN', 'LOGIN_SCREEN');
  };

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
    login();
  };

  const shipForm = useForm({
    async onSubmit({ values }: any) {
      try {
        setSavingShipCode(true);
        const result = await AuthActions.updateShipCode(
          pendingShip!.patp,
          // @ts-ignore
          passwordRef.current!.value,
          // @ts-ignore
          values.code
        );
        setSaveShipCodeResult(result);
        if (result === 'success') {
          // @ts-ignore
          if (passwordRef.current) {
            // @ts-ignore
            passwordRef.current.value = '';
          }
          accessKey.state.value = '';
          setLoginError('');
          setSuccessMessage(
            'Successfully changed the ship code. Please try to login again.'
          );
          setSavingShipCode(false);
        } else if (result === 'error') {
          setLoginError('code');
        }
      } catch (reason: any) {
        setLoginError('code');
      } finally {
        setSavingShipCode(false);
      }
    },
  });

  const accessKey = useField({
    id: 'code',
    form: shipForm,
    initialValue: '',
    validationSchema: yup
      .string()
      .matches(
        /[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}$/,
        'Access key not in correct format'
      )
      .required('Please enter access key'),
  });

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      if (shipForm.computed.isValid) shipForm.actions.submit();
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
                    innerRef={passwordRef}
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
                    error={hasFailed || loginError !== ''}
                    onKeyDown={submitPassword}
                    rightIcon={
                      <Flex gap={4} justifyContent="center" alignItems="center">
                        <IconButton
                          size={26}
                          ref={optionsRef}
                          luminosity={theme.currentTheme.mode}
                          opacity={1}
                          onClick={() => {
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
                                onClose={() => setShow(false)}
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
                                  onClick={() => {
                                    AuthActions.removeShip(pendingShip.patp);
                                  }}
                                />
                              </Menu>
                            </Portal>
                          )}
                        </AnimatePresence>
                        {auth.loader.isLoading &&
                        !hasFailed &&
                        !savingShipCode ? (
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

                  {(['password', 'missing', 'code'].indexOf(loginError) !==
                    -1 ||
                    hasFailed) && (
                    <FormControl.Error
                      style={{ height: 15, fontSize: 14 }}
                      textShadow="0.5px 0.5px #080000"
                    >
                      {hasFailed && 'Connection to your ship has been refused.'}
                      {loginError === 'password' && 'Incorrect password.'}
                      {loginError === 'missing' && 'Unable to connect to ship.'}
                      {loginError === 'code' && 'Error saving new ship code'}
                    </FormControl.Error>
                  )}

                  {showShipCode && (
                    <>
                      <Text
                        mt="1px"
                        initial={{ opacity: 0 }}
                        exit={{ opacity: 1 }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          opacity: { duration: 1, ease: 'easeOut' },
                        }}
                        {...colorProps}
                        fontWeight={400}
                        fontSize={14}
                        width={isVertical ? 320 : 260}
                        // opacity={0.35}
                      >
                        Has your ship code changed? If so, enter the new code
                        below and click the Update button.
                      </Text>
                      <TextInput
                        ml={2}
                        mr={2}
                        id="onboarding-access-key"
                        // tabIndex={3}
                        paddingLeft={2}
                        name="code"
                        placeholder="sample-micsev-bacmug-moldex"
                        // defaultValue={accessKey.state.value}
                        value={accessKey.state.value}
                        autoCapitalize="false"
                        autoCorrect="false"
                        spellCheck="false"
                        type={showAccessKey.isOn ? 'text' : 'password'}
                        width={isVertical ? 320 : 260}
                        error={
                          accessKey.computed.ifWasEverBlurredThenError &&
                          accessKey.computed.isDirty &&
                          accessKey.computed.error
                        }
                        onChange={(e: any) => {
                          accessKey.actions.onChange(e.target.value);
                        }}
                        onFocus={() => accessKey.actions.onFocus()}
                        onBlur={() => accessKey.actions.onBlur()}
                        onKeyDown={onKeyDown}
                        rightAdornment={
                          <Flex
                            flexDirection={'row'}
                            height={32}
                            alignItems={'center'}
                          >
                            {saveShipCodeResult === 'success' && (
                              <Icon
                                mr={1}
                                name={'CheckCircle'}
                                opacity={1}
                                size={18}
                                color={'intent-success'}
                              />
                            )}
                            <Button.IconButton onClick={showAccessKey.toggle}>
                              <Icon
                                name={showAccessKey.isOn ? 'EyeOff' : 'EyeOn'}
                                opacity={0.5}
                                size={18}
                              />
                            </Button.IconButton>
                            <Button.TextButton
                              marginLeft={1}
                              onClick={() => {
                                if (shipForm.computed.isValid)
                                  shipForm.actions.submit();
                              }}
                            >
                              {(savingShipCode && (
                                <Flex
                                  justifyContent="center"
                                  alignItems="center"
                                  width={24}
                                  height={24}
                                >
                                  <Spinner size={0} />
                                </Flex>
                              )) ||
                                'Save'}
                            </Button.TextButton>
                          </Flex>
                        }
                      />
                      {successMessage !== '' && (
                        <Text
                          color={'#008000'}
                          textShadow="0.5px 0.5px #000800"
                          fontSize={14}
                        >
                          {successMessage}
                        </Text>
                      )}
                    </>
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
};

export const Login = observer(LoginPresenter);

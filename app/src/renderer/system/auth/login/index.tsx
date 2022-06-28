import { useRef, FC, useEffect } from 'react';
import { Fill, Bottom, Centered } from 'react-spaces';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
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
} from 'renderer/components';
import { ShipSelector } from './ShipSelector';
import { DEFAULT_WALLPAPER } from 'os/services/shell/theme.model';
import { useServices } from 'renderer/logic/store';
import { AuthApi } from 'renderer/logic/actions/auth';

type LoginProps = {
  addShip: () => void;
  continueSignup: (ship: any) => void;
  hasWallpaper?: boolean;
};

export const Login: FC<LoginProps> = observer((props: LoginProps) => {
  const { addShip, hasWallpaper } = props;
  const { identity, shell } = useServices();
  const { auth } = identity;
  const { theme } = shell;
  const passwordRef = useRef(null);
  const wrapperRef = useRef(null);
  const submitRef = useRef(null);
  const optionsRef = useRef(null);

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
    // Set the wallpaper on load
    !theme.theme &&
      pendingShip &&
      theme.setWallpaper(pendingShip?.wallpaper || DEFAULT_WALLPAPER, {
        patp: pendingShip?.patp!,
      });
  }, [pendingShip !== null]);

  const submitPassword = (event: any) => {
    if (event.keyCode === 13) {
      // @ts-expect-error typescript...
      submitRef.current.focus();
      // @ts-expect-error typescript...
      submitRef.current.click();
      // @ts-expect-error typescript...
      passwordRef.current.blur();
      // @ts-expect-error typescript...
      wrapperRef.current.blur();
      window.electron.os.auth.login(pendingShip!.patp, event.target.value);
      // auth.login(pendingShip!.patp, event.target.value);
    }
  };

  let colorProps = null;
  // if (theme) {
  colorProps = {
    color: theme.theme?.textColor,
    textShadow: theme.theme?.textTheme === 'dark' ? '0 1px black' : 'none',
  };
  // }

  return (
    <Fill>
      <Centered>
        {pendingShip && (
          <Flex alignItems="center" justifyContent="center">
            <Flex gap={24} width={460}>
              <Box>
                <Sigil
                  // key={pendingShip.patp}
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
                  flexDirection="row"
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
                <Flex gap={12} alignItems="center">
                  <Input
                    ref={passwordRef}
                    wrapperRef={wrapperRef}
                    {...(hasWallpaper
                      ? { bg: 'bg.blendedBg' }
                      : { bg: 'bg.secondary' })}
                    autoFocus
                    autoCorrect="false"
                    bgOpacity={hasWallpaper ? 0.3 : 1}
                    borderColor={
                      hasWallpaper ? 'inpurt.borderHover' : 'input.borderColor'
                    }
                    wrapperStyle={{
                      borderRadius: 8,
                      width: 260,
                    }}
                    placeholder="Password"
                    fontSize={16}
                    name="password"
                    type="password"
                    rightInteractive
                    onKeyDown={submitPassword}
                    rightIcon={
                      <Flex justifyContent="center" alignItems="center">
                        {auth.loader.isLoading ? (
                          <Spinner size={0} />
                        ) : (
                          <IconButton
                            ref={submitRef}
                            luminosity={theme.theme?.textTheme}
                            size={24}
                            canFocus
                            onKeyDown={submitPassword}
                          >
                            <Icons opacity={0.5} name="ArrowRightLine" />
                          </IconButton>
                        )}
                      </Flex>
                    }
                  />
                  <IconButton
                    size={26}
                    ref={optionsRef}
                    luminosity={theme.theme?.textTheme}
                    opacity={1}
                    onClick={(evt: any) => {
                      evt.preventDefault();
                      evt.currentTarget.blur();
                      !show && setShow && setShow(true);
                    }}
                  >
                    <Icons name="Settings5Line" />
                  </IconButton>
                  <Menu
                    id={`${pendingShip.patp}-user-menu`}
                    customBg={theme.theme.windowColor}
                    style={{
                      top: anchorPoint && anchorPoint.y + 8,
                      left: anchorPoint && anchorPoint.x + 10,
                      visibility: show ? 'visible' : 'hidden',
                      width: menuWidth,
                    }}
                    isOpen={show}
                    onClose={() => {
                      setShow(false);
                    }}
                  >
                    <MenuItem
                      label="Reset password"
                      customBg={theme.theme.windowColor}
                      onClick={() => {
                        console.log('do reset form');
                      }}
                    />
                    <MenuItem
                      label="Remove ship"
                      customBg={theme.theme.windowColor}
                      mt={1}
                      onClick={() => {
                        AuthApi.removeShip(pendingShip.patp);
                        // auth.removeShip(pendingShip.patp);
                        // auth.clearSession();
                      }}
                    />
                  </Menu>
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

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
import { AuthActions } from 'renderer/logic/actions/auth';
import { DesktopActions } from 'renderer/logic/actions/desktop';

type LoginProps = {
  addShip: () => void;
  continueSignup: (ship: any) => void;
  hasWallpaper?: boolean;
};

export const Login: FC<LoginProps> = observer((props: LoginProps) => {
  const { addShip, hasWallpaper } = props;
  const { identity, shell, ship } = useServices();
  const { auth } = identity;
  const { theme } = shell.desktop;
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
    !theme &&
      pendingShip &&
      DesktopActions.changeWallpaper(
        pendingShip?.patp!,
        pendingShip?.wallpaper || DEFAULT_WALLPAPER
      );
  }, [pendingShip !== null]);

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
  const clickSubmit = (event: any) => {
    event.stopPropagation();
    window.electron.os.auth.login(
      pendingShip!.patp,
      // @ts-ignore
      passwordRef!.current!.value
    );
  };

  let colorProps = null;
  // if (theme) {
  colorProps = {
    color: theme?.textColor,
    textShadow: theme?.textTheme === 'dark' ? '0 1px black' : 'none',
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
                <Flex mt={isVertical ? 2 : 0} gap={12} alignItems="center">
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
                      hasWallpaper ? 'input.borderHover' : 'input.borderColor'
                    }
                    wrapperStyle={{
                      borderRadius: 8,
                      minWidth: isVertical ? 300 : 260,
                    }}
                    placeholder="Password"
                    fontSize={16}
                    name="password"
                    type="password"
                    rightInteractive
                    onKeyDown={submitPassword}
                    rightIcon={
                      <Flex gap={4} justifyContent="center" alignItems="center">
                        <IconButton
                          size={26}
                          ref={optionsRef}
                          luminosity={theme?.textTheme}
                          opacity={1}
                          onClick={(evt: any) => {
                            !show && setShow && setShow(true);
                          }}
                        >
                          <Icons name="MoreHorizontal" />
                        </IconButton>
                        <Menu
                          id={`${pendingShip.patp}-user-menu`}
                          customBg={theme.windowColor}
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
                            data-prevent-context-close={false}
                            label="Reset password"
                            customBg={theme.windowColor}
                            onClick={() => {
                              console.log('do reset form');
                            }}
                          />
                          <MenuItem
                            label="Remove ship"
                            customBg={theme.windowColor}
                            mt={1}
                            onClick={() => {
                              AuthActions.removeShip(pendingShip.patp);
                            }}
                          />
                        </Menu>
                        {auth.loader.isLoading ? (
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
                            luminosity={theme?.textTheme}
                            size={24}
                            canFocus
                            onClick={(evt: any) => clickSubmit(evt)}
                          >
                            <Icons name="ArrowRightLine" />
                          </IconButton>
                        )}
                      </Flex>
                    }
                  />
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

import { useRef, FC, useEffect } from 'react';
import { Fill, Bottom, Centered } from 'react-spaces';
import { observer } from 'mobx-react';

import {
  Flex,
  Box,
  Sigil,
  Text,
  Input,
  Button,
  IconButton,
  Icons,
  TextButton,
  useMenu,
  Menu,
  MenuItem,
  Spinner,
} from '../../../../components';
import { useAuth, useMst } from '../../../../logic/store';
import { ShipSelector } from './ShipSelector';
import { AnimatePresence, motion } from 'framer-motion';

type LoginProps = {
  addShip: () => void;
  continueSignup: (ship: any) => void;
  hasWallpaper?: boolean;
};

export const Login: FC<LoginProps> = observer((props: LoginProps) => {
  const { addShip, continueSignup, hasWallpaper } = props;
  const { authStore } = useAuth();
  const { themeStore } = useMst();
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

  const pendingShip = authStore.selected!;
  const theme = pendingShip.theme;
  const shipName = pendingShip?.nickname || pendingShip?.patp;

  useEffect(() => {
    // Set the wallpaper on load
    themeStore.setWallpaper(pendingShip.wallpaper!);
  }, [authStore.selected !== null]);

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
      authStore.login(pendingShip!.patp, event.target.value);
    }
  };

  let colorProps = null;
  // if (theme) {
  colorProps = {
    color: theme.textColor,
    textShadow: theme.textTheme === 'dark' ? '0 1px black' : 'none',
  };
  // }

  const inProgressShips = authStore.inProgressList;
  return (
    <Fill>
      <Centered>
        {pendingShip && (
          <Flex gap={24} alignItems="center" justifyContent="center">
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
                      {authStore.loader.isLoading ? (
                        <Spinner size={0} />
                      ) : (
                        <IconButton
                          ref={submitRef}
                          luminosity={theme.textTheme}
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
                  luminosity={theme.textTheme}
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
                  style={{
                    top: anchorPoint && anchorPoint.y + 8,
                    left: anchorPoint && anchorPoint.x + 10,
                    padding: '8px 4px',
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
                    onClick={() => {
                      console.log('do reset form');
                    }}
                  />
                  <MenuItem
                    label="Remove ship"
                    mt={1}
                    onClick={() => {
                      authStore.removeShip(pendingShip.patp);
                      authStore.clearSession();
                    }}
                  />
                </Menu>
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
            {inProgressShips.map((ship: any, index: number) => (
              <ContinueButton
                onClick={continueSignup}
                key={`continue-${ship.patp}`}
                ship={ship}
                theme={theme}
              />
            ))}
            <TextButton
              {...colorProps}
              style={{ padding: '0 16px' }}
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

const ContinueButton = (props: any) => {
  const { ship, theme, onClick } = props;
  return (
    <Flex
      style={{ cursor: 'pointer' }}
      p={1}
      pr={3}
      onClick={() => props.onClick(ship)}
    >
      <Flex
        display="flex"
        gap={12}
        flexDirection="row"
        alignItems="center"
        style={{ x: 0, cursor: 'pointer' }}
        // whileHover={{ scale: 1.1 }}
        // transition={{ scale: 0.2 }}
        // whileTap={{ scale: 1.0 }}
      >
        <Sigil
          simple
          isLogin
          size={28}
          avatar={ship.avatar}
          patp={ship.patp}
          color={[ship.color || '#000000', 'white']}
        />
        <Flex
          style={{ pointerEvents: 'none' }}
          mt="2px"
          flexDirection="column"
          justifyContent="center"
        >
          <Text color={theme.textColor} fontWeight={500} fontSize={2}>
            Continue setup
          </Text>
          <Text
            style={{ pointerEvents: 'none' }}
            color={theme.textColor}
            fontSize={2}
            fontWeight={400}
          >
            {ship!.nickname || ship!.patp}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

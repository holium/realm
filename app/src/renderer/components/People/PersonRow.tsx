import { useEffect, useRef } from 'react';
import { clan } from 'urbit-ob';
import { Flex, Box, Sigil, Text, MenuItemProps, useMenu, Menu } from '../';
import { Row } from 'renderer/components/NewRow';
import { PassportCard } from './PassportCard';
import { useContextMenu } from 'renderer/components/ContextMenu';
import Portal from 'renderer/system/dialog/Portal';
import { AnimatePresence } from 'framer-motion';
import { ThemeType } from '../../logic/theme';

interface IPersonRow {
  listId: string;
  patp: string;
  sigilColor?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  description?: string | null;
  style?: any;
  rowBg: string;
  theme?: ThemeType;
  contextMenuOptions?: MenuItemProps[];
  children?: any;
}

const MENU_WIDTH = 340;

export const PersonRow = ({
  listId,
  patp,
  sigilColor,
  avatar,
  nickname,
  description,
  style,
  rowBg,
  contextMenuOptions,
  theme,
  children,
}: IPersonRow) => {
  const { windowColor } = theme!;
  const rowRef = useRef<HTMLDivElement>(null);
  const { getOptions, setOptions } = useContextMenu();

  const config = useMenu(rowRef, {
    orientation: 'left',
    padding: 0,
    menuWidth: MENU_WIDTH,
  });

  const { anchorPoint, show, setShow } = config;

  const idClass = clan(patp);
  const id = `${listId}-${patp}`;
  let patpSanitized = patp;
  if (idClass === 'moon') {
    const moonTokens = patpSanitized.split('-');
    patpSanitized = `~${moonTokens[2]}^${moonTokens[3]}`;
  }
  if (idClass === 'comet') {
    // TODO sanitize comet
  }

  useEffect(() => {
    if (contextMenuOptions && contextMenuOptions !== getOptions(id)) {
      setOptions(id, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, id, setOptions]);

  return (
    <Flex key={id} style={{ position: 'relative', ...style }}>
      {/* TODO: Don't use a portal here so it's accesible by the context menu. */}
      <Portal>
        <AnimatePresence>
          {show && (
            <Menu
              id={`${id}-profile`}
              customBg={windowColor}
              style={{
                x: anchorPoint && anchorPoint.x - 6,
                y: anchorPoint && anchorPoint.y,
                visibility: show ? 'visible' : 'hidden',
                width: MENU_WIDTH,
                borderRadius: 9,
                minHeight: 120,
                padding: 12,
              }}
              isOpen={show}
              onClose={() => {
                setShow(false);
              }}
            >
              <PassportCard
                patp={patp}
                sigilColor={sigilColor}
                avatar={avatar}
                nickname={nickname}
                description={description}
                theme={theme}
                onClose={() => {
                  setShow(false);
                }}
              />
            </Menu>
          )}
        </AnimatePresence>
      </Portal>

      <Row
        id={id}
        ref={rowRef}
        onContextMenu={(evt: any) => {
          evt.stopPropagation();
        }}
        style={{ justifyContent: 'space-between' }}
        customBg={rowBg}
        selected={show}
        onClick={(evt: any) => {
          show ? setShow(false) : setShow(true); // todo this doesnt work. fix menu
          evt.stopPropagation();
        }}
      >
        <Flex
          gap={10}
          flexDirection="row"
          alignItems="center"
          flex={1}
          maxWidth="100%"
          style={{ pointerEvents: 'none' }}
        >
          <Box>
            <Sigil
              simple
              size={22}
              avatar={avatar}
              patp={patp}
              color={[sigilColor || '#000000', 'white']}
            />
          </Box>
          <Flex flex={1} height="22px" overflow="hidden" alignItems="center">
            <Text
              fontSize={2}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {nickname ? nickname : patp}
            </Text>
          </Flex>
        </Flex>
        {children}
      </Row>
    </Flex>
  );
};

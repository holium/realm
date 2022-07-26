import { FC, useRef } from 'react';
import { Portal } from 'renderer/system/dialog/Portal';
import {
  ContextMenu,
  Flex,
  Box,
  Sigil,
  Text,
  MenuItemProps,
  useMenu,
  Menu,
} from '../';
import { Row } from 'renderer/components/NewRow';
import { AnimatePresence } from 'framer-motion';
import { PassportCard } from './PassportCard';

interface IPersonRow {
  listId: string;
  patp: string;
  sigilColor?: string;
  avatar?: string;
  nickname?: string;
  description?: string;
  style?: any;
  rowBg: string;
  theme?: {
    textColor: string;
    windowColor: string;
  };
  showPassport?: boolean; // show profile popover
  contextMenuOptions?: MenuItemProps[];
}

export const PersonRow: FC<IPersonRow> = (props: IPersonRow) => {
  const {
    listId,
    patp,
    sigilColor,
    avatar,
    nickname,
    description,
    style,
    rowBg,
    contextMenuOptions,
  } = props;
  const { textColor, windowColor } = props.theme!;
  const rowRef = useRef(null);

  /// Setting up options menu
  const menuWidth = 340;
  const config = useMenu(rowRef, {
    orientation: 'left',
    padding: 0,
    menuWidth,
  });
  const { anchorPoint, show, setShow } = config;

  const id = `${listId}-${patp}`;
  return (
    <Flex key={id} style={{ position: 'relative', ...style }}>
      {contextMenuOptions && (
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
                  width: menuWidth,
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
                  theme={props.theme}
                />
              </Menu>
            )}
          </AnimatePresence>
          <AnimatePresence>
            <ContextMenu
              adaptive
              orientation="bottom-left"
              isComponentContext
              textColor={textColor}
              customBg={windowColor}
              containerId={id}
              parentRef={rowRef}
              style={{ minWidth: 180 }}
              menu={contextMenuOptions}
            />
          </AnimatePresence>
        </Portal>
      )}
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
          {nickname ? (
            <>
              <Text fontSize={2}>
                {nickname.substring(0, 20)} {nickname.length > 21 && '...'}
              </Text>
              <Text fontSize={2} opacity={0.7}>
                {patp}
              </Text>
            </>
          ) : (
            <Text fontSize={2}>{patp}</Text>
          )}
        </Flex>
      </Row>
    </Flex>
  );
};

PersonRow.defaultProps = {
  showPassport: false,
};

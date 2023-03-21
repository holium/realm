import { AnimatePresence } from 'framer-motion';
import { Card, Box, BoxProps } from '../../';
import styled from 'styled-components';
import {
  getAnchorPointByTarget,
  getAnchorPointByElement,
  getMenuHeight,
  Position,
  Orientation,
  Dimensions,
} from '../../util/position';
import { useState, useEffect, useCallback } from 'react';
import { MenuPortal } from './MenuPortal';
import { MenuItem, MenuItemProps } from './MenuItem';

const WIDTH = 180;
const MAX_HEIGHT = 300;
const MENU_ITEM_HEIGHT = 36;
const DIVIDER_HEIGHT = 2;
const PADDING = 4;

const Divider = styled(Box)`
  width: 95%;
  border: 1px solid var(--rlm-border-color);
  opacity: 0.3;
  margin: 1px auto;
`;

type MenuType = 'custom' | 'options';

export type MenuProps = {
  id: string;
  orientation: Orientation;
  anchorRef?: React.RefObject<HTMLElement>;
  triggerEl?: React.ReactNode;
  controlledIsOpen?: boolean;
  clickPreventClass?: string;
  children?: React.ReactNode;
  dimensions?: Dimensions;
  offset?: Position;
  options?: MenuItemProps[];
} & BoxProps;

export const Menu = ({
  id,
  triggerEl,
  children,
  dimensions,
  orientation = 'bottom-left',
  offset = { x: 0, y: 2 },
  options,
  clickPreventClass,
  ...rest
}: MenuProps) => {
  const root = document.getElementById('root');
  let innerContent: React.ReactNode;
  let type: MenuType = 'custom';
  const [isOpen, setIsOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState<Position | null>(null);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const menu = document.getElementById(id);
      const trigger = document.getElementById(`${id}-trigger`);
      const clickEl =
        clickPreventClass &&
        document.getElementsByClassName(clickPreventClass)[0];
      if (
        (menu && menu.contains(e.target as Node)) ||
        (trigger && trigger.contains(e.target as Node)) ||
        (clickEl && clickEl.contains(e.target as Node))
      )
        return;
      setIsOpen(false);
    },
    [id]
  );

  useEffect(() => {
    if (!root) return;
    root.addEventListener('mousedown', handleClick);

    return () => {
      root.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick, root]);

  if (!children && options && options.length > 0) {
    type = 'options';
    innerContent = options.map((option, index) => {
      const divider =
        index > 0 && options[index - 1].section !== option.section;
      return (
        <div key={option.id}>
          {divider && <Divider />}
          <MenuItem
            key={option.id}
            id={option.id}
            icon={option.icon}
            iconColor={option.iconColor}
            label={option.label}
            labelColor={option.labelColor}
            disabled={option.disabled}
            onClick={option.onClick}
          />
        </div>
      );
    });
  } else {
    type = 'custom';
    innerContent = children;
  }

  const onTriggerClick = (
    evt: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!isOpen) {
      setIsOpen(true);
      if (type === 'options' && options) {
        const menuHeight = getMenuHeight(
          options,
          MENU_ITEM_HEIGHT,
          DIVIDER_HEIGHT,
          PADDING
        );

        setAnchorPoint(
          getAnchorPointByTarget(
            evt.nativeEvent,
            { width: WIDTH, height: menuHeight },
            orientation,
            offset
          )
        );
      } else {
        if (!dimensions) {
          throw new Error(
            'You must provide dimensions if you are using a custom menu'
          );
        }

        setAnchorPoint(
          getAnchorPointByTarget(
            evt.nativeEvent,
            dimensions,
            orientation,
            offset
          )
        );
      }
    } else {
      setIsOpen(false);
      setAnchorPoint(null);
    }
  };

  const isCustom = type === 'custom';

  return (
    <>
      {triggerEl && (
        <Box
          id={`${id}-trigger`}
          display="inline"
          position="relative"
          onClick={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            onTriggerClick(evt);
          }}
        >
          {triggerEl}
        </Box>
      )}
      <MenuPortal id={`${id}-portal`} isOpen={isOpen}>
        <AnimatePresence>
          {isOpen && anchorPoint && (
            <Card
              p={type === 'custom' ? 0 : 1}
              elevation={2}
              position="absolute"
              className={rest.className}
              id={id}
              zIndex={100}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.1,
                },
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.1,
                },
              }}
              onClick={(evt) => {
                evt.stopPropagation();
              }}
              gap={type === 'options' ? 2 : 0}
              style={{
                y: anchorPoint.y,
                x: anchorPoint.x,
                border: isCustom ? 'none' : '1px solid var(--rlm-border-color)',
                width: dimensions?.width || WIDTH,
                height: dimensions?.height || 'auto',
                maxHeight: dimensions?.height || MAX_HEIGHT,
                overflowY: isCustom ? 'hidden' : 'auto',
              }}
            >
              {innerContent}
            </Card>
          )}
        </AnimatePresence>
      </MenuPortal>
    </>
  );
};

export type CustomMenuProps = {
  id: string;
  orientation: Orientation;
  anchorRef?: React.RefObject<HTMLElement>;
  children?: React.ReactNode;
  dimensions?: Dimensions;
  offset?: Position;
} & BoxProps;

export const CustomMenu = ({
  anchorRef,
  id,
  children,
  dimensions,
  orientation,
  offset,
}: CustomMenuProps) => {
  const [anchorPoint, setAnchorPoint] = useState<Position | null>(null);
  useEffect(() => {
    const el = anchorRef?.current;
    console.log('CustomMenu', el);
    if (el) {
      const height = el.offsetHeight;
      setAnchorPoint(
        getAnchorPointByElement(
          el,
          {
            width: dimensions?.width || WIDTH,
            height: dimensions?.height || height,
          },
          orientation,
          offset
        )
      );
    }
  }, [anchorRef]);
  console.log('CustomMenu achnor', anchorPoint);
  if (!anchorPoint) return null;
  return (
    <MenuPortal id={`${id}-portal`} isOpen={true}>
      <Card
        p={0}
        id={id}
        position="absolute"
        style={{
          y: anchorPoint.y,
          x: anchorPoint.x,
          height: dimensions?.height,
          width: dimensions?.width,
          overflowY: 'auto',
        }}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.1,
          },
        }}
        exit={{
          opacity: 0,
          transition: {
            duration: 0.1,
          },
        }}
      >
        {children}
      </Card>
    </MenuPortal>
  );
};

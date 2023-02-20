import { AnimatePresence } from 'framer-motion';
import { Card, Box, BoxProps } from '../../';
import styled from 'styled-components';
import {
  getAnchorPointByTarget,
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
  triggerEl: React.ReactNode;
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
      if (
        (menu && menu.contains(e.target as Node)) ||
        (trigger && trigger.contains(e.target as Node))
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

  return (
    <>
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
      <MenuPortal id={`${id}-portal`} isOpen={isOpen}>
        <AnimatePresence>
          {isOpen && anchorPoint && (
            <Card
              p={1}
              elevation={2}
              position="absolute"
              id={id}
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
              gap={type === 'options' ? 2 : 0}
              style={{
                y: anchorPoint.y,
                x: anchorPoint.x,
                width: WIDTH,
                maxHeight: MAX_HEIGHT,
                overflowY: 'auto',
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

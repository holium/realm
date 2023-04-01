import { AnimatePresence } from 'framer-motion';
import { Card, Box, BoxProps, Portal } from '../../general';
import styled from 'styled-components';
import {
  getAnchorPointByElement,
  getMenuHeight,
  Position,
  Orientation,
  Dimensions,
} from '../../util/position';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { MenuItem, MenuItemProps } from './MenuItem';
import { useMenu } from './useMenu';

const WIDTH = 180;
const MAX_HEIGHT = 300;
const MENU_ITEM_HEIGHT = 36;
const DIVIDER_HEIGHT = 2;
const PADDING = 4;

const Divider = styled(Box)`
  width: 95%;
  border: 1px solid rgba(var(--rlm-border-rgba));
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
  closableIds?: string[];
  closableClasses?: string[];
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
  orientation = 'bottom-right',
  offset = { x: 0, y: 2 },
  options,
  className,
  closableIds,
  closableClasses,
}: MenuProps) => {
  let innerContent: React.ReactNode;
  let type: MenuType = 'custom';

  // calculate the height of the menu based on the number of options
  // or use the passed in dimensions
  const menuHeight = useMemo(
    () =>
      dimensions?.height ||
      getMenuHeight(options || [], MENU_ITEM_HEIGHT, DIVIDER_HEIGHT, PADDING),
    [dimensions, options]
  );
  // create dimensions object for the menu
  const menuDimensions = {
    width: dimensions?.width || WIDTH,
    height: menuHeight,
  };
  const { isOpen, menuRef, position, toggleMenu } = useMenu(
    orientation,
    menuDimensions,
    offset,
    closableIds,
    closableClasses
  );

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

  const isCustom = type === 'custom';

  const preventPropagation = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <>
      {triggerEl && (
        <Box
          id={`${id}-trigger`}
          display="inline"
          position="relative"
          onClick={toggleMenu}
        >
          {triggerEl}
        </Box>
      )}
      <Portal>
        <AnimatePresence>
          {isOpen && position && (
            <Card
              ref={menuRef}
              p={type === 'custom' ? 0 : 1}
              elevation={2}
              position="absolute"
              className={className}
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
              onClick={preventPropagation}
              gap={type === 'options' ? 2 : 0}
              style={{
                y: position.y,
                x: position.x,
                border: isCustom
                  ? 'none'
                  : '1px solid rgba(var(--rlm-border-rgba))',
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
      </Portal>
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
    <Portal>
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
    </Portal>
  );
};

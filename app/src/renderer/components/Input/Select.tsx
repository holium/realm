import { useState, useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { motion, Variants } from 'framer-motion';
import { RadioOption, Text, Icons, Flex } from '../';
import { ThemeType } from 'renderer/theme';
import { MenuItemStyle } from '../MenuItem/MenuItem.styles';

type SelectWrapperStyle = {
  theme: ThemeType;
  customBg?: string;
};

const SelectWrapper = styled(Flex)<{ disabled?: boolean }>`
  width: ${(props) => (props.width ? props.width : '100%')};
  position: relative;
  padding: 4px 8px;
  border-radius: var(--rlm-border-radius-6);
  border: 1px solid var(--rlm-border-color);
  background-color: var(--rlm-input-color);
  min-height: 32px;
  select {
    border-radius: var(--rlm-border-radius-4);
    background-color: var(--rlm-input-color);
    color: var(--rlm-text-color);
    pointer-events: all;
    flex: 1;
    height: inherit;
    appearance: none;
    outline: none;
    border: 1px transparent;
    &::placeholder {
      opacity: 0.5;
    }
  }
  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      input {
        pointer-events: none;
      }
      opacity: 0.6; /* correct opacity on iOS */
      &::placeholder {
        color: rgba(var(--rlm-text-color, #333333), 0.3);
        opacity: 1;
      }
      &:hover {
        border-color: transparent;
      }
    `}
`;

const SelectDropdown = styled(motion.ul)<SelectWrapperStyle>`
  z-index: 20;
  top: 32px;
  left: 0px;
  padding: 4px;
  position: absolute;
  border-radius: 6px;
  gap: 2px;
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.ui.borderColor};
  background-color: ${(props) => props.customBg};
  box-shadow: ${(props) => props.theme.elevations.one};
`;

const showMenu: Variants = {
  enter: {
    opacity: 1,
    y: 4,
    display: 'block',
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    y: -5,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
    transitionEnd: {
      display: 'none',
    },
  },
};

type Props = {
  id: string;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: string;
  customBg: string;
  textColor: string;
  iconColor: string;
  options: RadioOption[];
  selected?: string;
  height?: number;
  inputColor?: string;
  onClick: (value: any) => void;
};

export const Select = ({
  id = 'select-input',
  height,
  options,
  placeholder = 'Select one',
  selected,
  customBg,
  textColor,
  iconColor,
  disabled,
  onClick,
}: Props) => {
  const [open, setOpen] = useState(false);

  const handleClickOutside = (event: MouseEvent) => {
    const domNode = document.getElementById(id);
    const dropdownNode = document.getElementById(`${id}-dropdown`);
    const isVisible = dropdownNode
      ? dropdownNode.getAttribute('data-is-open') === 'true'
      : false; // get if the picker is visible currently

    if (!domNode || !domNode.contains(event.target as HTMLElement)) {
      if ((event.target as HTMLElement).id === id) return;

      // You are clicking outside
      if (isVisible) {
        setOpen(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);

    () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const selectedOption = useMemo(
    () => options.find((option: RadioOption) => option.value === selected),
    [options, selected]
  );

  const visibleOptions = useMemo(
    () => options.filter((option: RadioOption) => !option.hidden),
    [options]
  );

  return (
    <SelectWrapper
      id={id}
      disabled={disabled}
      minHeight={30}
      height={height || 'min-content'}
      position="relative"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      gap={8}
      onClick={() => !disabled && (open ? setOpen(false) : setOpen(true))}
    >
      {selected ? (
        <Text fontSize={2} color={textColor}>
          {selectedOption?.label}
        </Text>
      ) : (
        <Text opacity={0.5} fontSize={2} color={textColor}>
          {placeholder}
        </Text>
      )}
      <Icons fill={iconColor} name="ArrowDown" />
      <SelectDropdown
        id={`${id}-dropdown`}
        variants={showMenu}
        data-is-open={open}
        initial="exit"
        animate={open ? 'enter' : 'exit'}
        customBg={customBg}
      >
        {visibleOptions.map((option, index) => (
          <MenuItemStyle
            key={`${option.value}-${index}`}
            color={textColor}
            customBg={customBg}
            disabled={option.disabled}
            onClick={() => !option.disabled && onClick(option.value)}
          >
            {option.label}
          </MenuItemStyle>
        ))}
      </SelectDropdown>
    </SelectWrapper>
  );
};

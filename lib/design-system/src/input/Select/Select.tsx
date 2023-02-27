import { useState, useEffect, useMemo } from 'react';
import { Variants } from 'framer-motion';
import { Icon } from '../../general/Icon/Icon';
import { Text } from '../../general/Text/Text';
import { MenuItemStyle } from '../../general/MenuItem/MenuItem.styles';
import { SelectDropdown, SelectWrapper } from './Select.styles';
import { RadioOption } from '../RadioGroup/RadioGroup';
import { getVar } from '../../util/colors';

const animationVariants: Variants = {
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
  options: RadioOption[];
  selected?: string;
  maxWidth?: number;
  width?: number;
  backgroundColor?: string;
  onClick: (value: string) => void;
};

export const Select = ({
  id = 'select-input',
  maxWidth,
  options,
  selected,
  placeholder = 'Select one',
  disabled,
  backgroundColor,
  width,
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
      if (isVisible) setOpen(false);
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
      width={width}
      disabled={disabled}
      maxWidth={maxWidth}
      onClick={() => !disabled && (open ? setOpen(false) : setOpen(true))}
    >
      {selectedOption ? (
        <Text.Custom fontSize={2} color="text">
          {selectedOption.label}
        </Text.Custom>
      ) : (
        <Text.Custom opacity={0.5} fontSize={2} color="text">
          {placeholder}
        </Text.Custom>
      )}
      <Icon color="icon" name="ArrowDown" />
      <SelectDropdown
        id={`${id}-dropdown`}
        variants={animationVariants}
        data-is-open={open}
        initial="exit"
        animate={open ? 'enter' : 'exit'}
        backgroundColor={backgroundColor}
      >
        {visibleOptions.map((option, index) => (
          <MenuItemStyle
            key={`${option.value}-${index}`}
            customBg={backgroundColor ?? getVar('input')}
            disabled={option.disabled}
            onClick={() =>
              !disabled && !option.disabled && onClick(option.value)
            }
          >
            {option.label}
          </MenuItemStyle>
        ))}
      </SelectDropdown>
    </SelectWrapper>
  );
};

import { FC } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, darken } from 'polished';
import { IconTypes, Flex, Icons } from '..';
import { ThemeType } from 'renderer/theme';

interface IRadioLabel {
  selected?: boolean;
  accentColor?: string;
  highlightColor?: string;
  textColor?: string;
  customBg: string;
  theme: ThemeType;
}

const RadioLabel = styled(motion.label)<IRadioLabel>`
  /* padding: 8px; */
  height: 26px;
  z-index: 14;
  font-size: 14px;
  position: relative;
  font-weight: 500;
  ${(props: IRadioLabel) =>
    props.selected
      ? css`
          color: ${props.highlightColor || props.theme.colors.brand.primary};
          /* background-color: ${rgba(
            props.theme.colors.brand.primary,
            0.12
          )}; */
        `
      : css`
          color: ${props.textColor};
          background-color: ${darken(0.015, props.customBg)};
        `}
`;

const RadioHighlight = styled(motion.label)<IRadioLabel>`
  /* padding: 2px 4px; */
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 13;
  /* padding: 4px; */
  border-radius: 5px;
  position: absolute;
  ${(props: IRadioLabel) =>
    props.selected
      ? css`
          background-color: ${rgba(
            props.highlightColor || props.theme.colors.brand.primary,
            0.12
          )};
        `
      : css`
          background-color: ${darken(0.015, props.customBg)};
        `}
`;

export type RadioOption = {
  label: string;
  value: string;
  sublabel?: string;
  icon?: IconTypes;
  disabled?: boolean;
  hidden?: boolean;
  highlightColor?: string;
};

interface IRadioGroup {
  customBg: string;
  textColor: string;
  options: RadioOption[];
  selected?: string;
  onClick: (value: any) => void;
}

export const RadioGroup: FC<IRadioGroup> = (props: IRadioGroup) => {
  const { options, selected, customBg, textColor, onClick } = props;
  const optionBg = darken(0.025, customBg);
  // TODO get the select transition working with framer
  return (
    <Flex
      p={1}
      flexDirection="row"
      width="fit-content"
      justifyContent="flex-start"
      backgroundColor={optionBg}
      gap={4}
      borderRadius={6}
    >
      {options?.map((option: RadioOption) => {
        const isSelected = option.value === selected;
        return (
          <motion.div
            key={option.value}
            style={{
              position: 'relative',
              padding: option.icon ? '4px 8px 4px 4px' : '4px 4px',
            }}
            onClick={(_evt: any) => onClick(option.value)}
          >
            {isSelected && (
              <RadioHighlight
                // layoutId="selection"
                highlightColor={option.highlightColor}
                customBg={optionBg}
                selected
              />
            )}
            {option.icon && (
              <Icons mr="6px" name={option.icon} pointerEvents="none" />
            )}
            <RadioLabel
              customBg={optionBg}
              highlightColor={option.highlightColor}
              textColor={isSelected ? option.highlightColor : textColor}
              selected={option.value === selected}
            >
              {option.label}
            </RadioLabel>
          </motion.div>
        );
      })}
    </Flex>
  );
};

RadioGroup.defaultProps = {
  options: [],
};

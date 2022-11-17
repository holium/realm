import { FC } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { rgba, darken } from 'polished';
import { Flex } from '..';
import { ThemeType } from 'renderer/theme';

interface IRadioImage {
  selected?: boolean;
  accentColor: string;
  customBg: string;
  theme: ThemeType;
}

const RadioImage = styled(motion.img)<IRadioImage>`
  /* padding: 8px; */
  height: 50px;
  draggable: false;
  -webkit-user-drag: none;
  z-index: 14;
  font-size: 14px;
  position: relative;
  margin-top: 2px;
  font-weight: 500;
  ${(props: IRadioImage) =>
    props.selected
      ? css`
          color: ${props.theme.colors.brand.primary};
          /* background-color: ${rgba(
            props.theme.colors.brand.primary,
            0.12
          )}; */
        `
      : css`
          background-color: ${darken(0.015, props.customBg)};
        `}
`;

const RadioHighlight = styled(motion.label)<IRadioImage>`
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 13;
  border-radius: 4px;
  position: absolute;
  ${(props: IRadioImage) =>
    props.selected
      ? css`
          background-color: ${rgba(props.accentColor, 0.5)};
        `
      : css`
          background-color: ${darken(0.015, props.customBg)};
        `}
`;

interface RadioOption {
  imageSrc: string;
  value: string;
}

interface IRadioImages {
  customBg: string;
  accentColor: string;
  options: RadioOption[];
  selected?: string;
  onClick: (value: any) => void;
}

export const RadioImages: FC<IRadioImages> = (props: IRadioImages) => {
  const { options, selected, customBg, onClick, accentColor } = props;
  const optionBg = darken(0.025, customBg);
  // TODO get the select transition working with framer
  return (
    <Flex
      p={1}
      flexDirection="row"
      width="fit-content"
      maxWidth="100%"
      justifyContent="flex-start"
      overflowX="scroll"
      //   backgroundColor={optionBg}
      mb={10}
      gap={6}
      borderRadius={6}
    >
      {options?.map((option: RadioOption) => {
        const isSelected = option.value === selected;
        return (
          <motion.div
            key={option.value}
            style={{ position: 'relative', padding: '6px 6px' }}
          >
            {isSelected && (
              <RadioHighlight
                // layoutId="selection"
                accentColor={accentColor}
                customBg={optionBg}
                selected
              />
            )}
            <RadioImage
              customBg={optionBg}
              accentColor={accentColor}
              src={option.imageSrc}
              selected={option.value === selected}
              onClick={(_evt: any) => onClick(option.value)}
            ></RadioImage>
          </motion.div>
        );
      })}
    </Flex>
  );
};

RadioImages.defaultProps = {
  options: [],
};

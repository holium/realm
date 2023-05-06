import { useState } from 'react';
import { motion } from 'framer-motion';

import { Flex } from '../../general/Flex/Flex';
import { RadioHighlight, RadioImage } from './RadioImages.style';

type Props = {
  options: string[];
  onClick: (value: string) => void;
};

export const RadioImages = ({ options, onClick }: Props) => {
  const [selected, setSelected] = useState<string>();

  const onClickRadioImage = (value: string) => {
    setSelected(value);
    onClick(value);
  };

  return (
    <Flex
      p={1}
      mb={10}
      gap={6}
      borderRadius={6}
      maxWidth="100%"
      flexDirection="row"
      width="fit-content"
      justifyContent="flex-start"
      overflowX="auto"
      background="rgba(var(--rlm-overlay-hover-rgba))"
    >
      {options?.map((option) => {
        const isSelected = option === selected;

        return (
          <motion.div
            key={option}
            style={{ position: 'relative', padding: '6px 6px' }}
          >
            <RadioHighlight selected={isSelected} />
            <RadioImage
              src={option}
              selected={isSelected}
              onClick={() => onClickRadioImage(option)}
            />
          </motion.div>
        );
      })}
    </Flex>
  );
};

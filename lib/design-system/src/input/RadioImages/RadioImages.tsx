import { motion } from 'framer-motion';
import { Flex } from '../../general/Flex/Flex';
import { RadioHighlight, RadioImage } from './RadioImages.style';

type RadioImageOption = {
  value: string;
  imageSrc: string;
};

type Props = {
  options: RadioImageOption[];
  selected?: string;
  onClick: (value: any) => void;
};

export const RadioImages = ({ options = [], selected, onClick }: Props) => (
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
  >
    {options?.map((option) => {
      const isSelected = option.value === selected;
      return (
        <motion.div
          key={option.value}
          style={{ position: 'relative', padding: '6px 6px' }}
        >
          {isSelected && <RadioHighlight selected />}
          <RadioImage
            src={option.imageSrc}
            selected={isSelected}
            onClick={(_evt: any) => onClick(option.value)}
          ></RadioImage>
        </motion.div>
      );
    })}
  </Flex>
);

import { FC } from 'react';
import styled from 'styled-components';
import { Flex, BoxProps, Text } from '../../general';

type SectionDividerProps = {
  alignment?: 'left' | 'center' | 'right';
  label: string;
} & BoxProps;

const AligmnentMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const HorizontalLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: rgba(var(--rlm-border-rgba));
`;

export const SectionDivider: FC<SectionDividerProps> = (
  props: SectionDividerProps
) => {
  const { id, label, alignment = 'left' } = props;

  return (
    <Flex
      id={id}
      gap={8}
      justifyContent={AligmnentMap[alignment]}
      alignItems="center"
    >
      {(alignment === 'center' || alignment === 'right') && <HorizontalLine />}
      <Text.Custom fontSize={0} opacity={0.5} fontWeight={500}>
        {label}
      </Text.Custom>
      {(alignment === 'center' || alignment === 'left') && <HorizontalLine />}
    </Flex>
  );
};

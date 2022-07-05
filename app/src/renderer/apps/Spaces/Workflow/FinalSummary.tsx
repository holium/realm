import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Grid, Text, Flex } from 'renderer/components';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { SelectRow } from '../components/SelectionRow';

export const SpacesFinalSummary: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { shell } = useServices();
    const { windowColor } = shell.desktop.theme;
    const { workflowState } = props;

    return (
      <Grid.Column noGutter lg={12} xl={12}>
        <Text
          fontSize={5}
          lineHeight="24px"
          fontWeight={500}
          mb={24}
          variant="body"
        >
          Finalize your space
        </Text>
        <Flex flexDirection="column" justifyContent="flex-start">
          <SelectRow
            {...(workflowState && workflowState.title !== 'New Space'
              ? { image: workflowState.image }
              : { icon: 'SpacesColor' })}
            title={workflowState && workflowState.title}
            subtitle={
              workflowState &&
              `${workflowState.subtitle} - ${workflowState.archetypeTitle}`
            }
          />
          <Flex
            pl={4}
            pr={4}
            mt={8}
            flex={1}
            gap={12}
            flexDirection="column"
          ></Flex>
        </Flex>
      </Grid.Column>
    );
  }
);

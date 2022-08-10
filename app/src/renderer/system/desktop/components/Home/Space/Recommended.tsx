import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { Flex } from 'renderer/components';

type RecommendedAppsProps = {
  isOpen?: boolean;
};

export const RecommendedApps: FC<RecommendedAppsProps> = observer(
  (props: RecommendedAppsProps) => {
    const { isOpen } = props;
    const { spaces } = useServices();

    return (
      <Flex flex={1}>
        <Flex></Flex>
        Recommended Apps
      </Flex>
    );
  }
);

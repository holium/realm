import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { Flex } from 'renderer/components';

type RecentActivityProps = {
  isOpen?: boolean;
};

export const RecentActivity: FC<RecentActivityProps> = observer(
  (props: RecentActivityProps) => {
    const { isOpen } = props;
    const { spaces } = useServices();

    return (
      <Flex flex={1}>
        <Flex></Flex>
        Recent Activity
      </Flex>
    );
  }
);

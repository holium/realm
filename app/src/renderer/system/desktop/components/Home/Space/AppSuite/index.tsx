import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { rgba } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { Flex, Text, Box } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { SuiteApp } from './App';
import { AppModelType } from 'os/services/ship/models/docket';

type AppSuiteProps = {
  space: SpaceModelType;
  suite?: AppModelType[];
};
const emptyArr = [1, 2, 3, 4, 5];
export const AppSuite: FC<AppSuiteProps> = (props: AppSuiteProps) => {
  const { space, suite } = props;
  // if()

  return (
    <Flex flexGrow={1} flexDirection="column" position="relative" gap={20}>
      <Flex>
        <Text variant="h3" fontWeight={500}>
          Your App Suite
        </Text>
      </Flex>
      <Flex
        flexGrow={1}
        flex={5}
        height={210}
        position="relative"
        justifyContent="space-between"
      >
        {emptyArr.map((el: number) => (
          <SuiteApp key={el} space={space} app={undefined} />
        ))}
      </Flex>
    </Flex>
  );
};

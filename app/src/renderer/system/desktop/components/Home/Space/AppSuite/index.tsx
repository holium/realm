import { FC, useEffect } from 'react';
import { Flex, Text, Box } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { SuiteApp } from './App';
import { AppModelType } from 'os/services/ship/models/docket';

type AppSuiteProps = {
  space: SpaceModelType;
  suite: any[];
  // suite?: AppModelType[];
};
// const emptyArr = [1, 2, 3, 4, 5];

export const AppSuite: FC<AppSuiteProps> = (props: AppSuiteProps) => {
  const { space, suite } = props;

  const emptyArr = [...Array(5 - suite.length).keys()];

  console.log(suite, emptyArr);
  // if()

  return (
    <Flex flexDirection="column" position="relative" gap={20} mb={60}>
      <Flex>
        <Text variant="h3" fontWeight={500}>
          App Suite
        </Text>
      </Flex>
      <Flex
        flexGrow={1}
        flex={5}
        height={210}
        position="relative"
        justifyContent="space-between"
      >
        {suite.map((app: number, index: number) => (
          <SuiteApp key={index} space={space} app={app} />
        ))}
        {emptyArr.map((el: number, index: number) => (
          <SuiteApp key={index + suite.length} space={space} app={undefined} />
        ))}
      </Flex>
    </Flex>
  );
};

AppSuite.defaultProps = {
  suite: [],
};

import React, { FC } from 'react';
import { Card, Flex, Box, Text } from 'renderer/components';

export const SystemApp: FC<any> = () => {
  return (
    <React.Fragment>
      <Box overflowY="scroll">
        <Flex gap={12} flexDirection="column" p="12px">
          <Card p="12px" width="100%" minHeight="240px" elevation="none">
            <Text opacity={0.7} fontSize={2} fontWeight={500}>
              Desktop
            </Text>
          </Card>
          <Card p="12px" width="100%" minHeight="182px" elevation="none">
            <Text opacity={0.7} fontSize={2} fontWeight={500}>
              Mouse
            </Text>
          </Card>
          <Card p="12px" width="100%" minHeight="300px" elevation="none">
            <Text opacity={0.7} fontSize={2} fontWeight={500}>
              Privacy
            </Text>
          </Card>
        </Flex>
      </Box>
    </React.Fragment>
  );
};

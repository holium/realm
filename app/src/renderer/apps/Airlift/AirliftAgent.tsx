import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Grid, Flex, Text } from 'renderer/components';

export type AirliftProps = {
  isResizing: boolean;
};

export const Airlift: FC<AirliftProps> = observer((props: AirliftProps) => {
  const { isResizing } = props;

  return (
    <Text>Airlift Test</Text>
  )
});

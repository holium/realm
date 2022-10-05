import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Grid, Flex, Text, Icons } from 'renderer/components';

export type AirliftArmProps = {
  isResizing: boolean;
};

export const AirliftArm: FC<AirliftArmProps> = observer((props: AirliftArmProps) => {
  const { isResizing } = props;

  return (
    <div>
      <Icons name="AirliftArm"></Icons>
    </div>
  )
});

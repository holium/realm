import { FC, useState } from 'react';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { useServices } from 'renderer/logic/store';
import styled from 'styled-components';
import { Flex, Input, Icons, CopyButton } from '../components';

const AccessCodeContainer = styled(Flex)`
  input[type='password'] {
    font-family: Verdana;
  }
`;

interface AccessCodeProps {
  code: string;
}

export const AccessCode: FC<AccessCodeProps> = (props: AccessCodeProps) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const [hidden, setHidden] = useState(true);

  return (
    <AccessCodeContainer position="relative">
      <Flex width="285px">
        <Input
          value={props.code}
          type={hidden ? 'password' : 'text'}
          readOnly={true}
          py={2}
        />
      </Flex>
      <Flex
        position="relative"
        top="6px"
        right="35px"
        onClick={() => setHidden(!hidden)}
      >
        <Icons
          name={hidden ? 'EyeOn' : 'EyeOff'}
          size={2}
          color={baseTheme.colors.text.disabled}
        />
      </Flex>
      <Flex position="relative" top="6px" right="10px">
        <CopyButton content={props.code} />
      </Flex>
    </AccessCodeContainer>
  );
};

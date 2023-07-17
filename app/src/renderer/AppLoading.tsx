import { Centered, Fill, ViewPort } from 'react-spaces';

import { Flex, Spinner } from '@holium/design-system/general';

export const AppLoading = () => (
  <ViewPort>
    <Fill>
      <Centered>
        <Flex width="100%" row justify="center">
          <Spinner color="#FFF" size={3} />
        </Flex>
      </Centered>
    </Fill>
  </ViewPort>
);

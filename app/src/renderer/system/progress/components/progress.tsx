import { useEffect } from 'react';
import {
  Button,
  Flex,
  // Icons,
  // Text,
  // Box,
  // LinkPreview,
} from 'renderer/components';

export const UpdateProgressView = () => {
  useEffect(() => console.log('here'));
  return (
    <Flex
      width={'100%'}
      height={'100%'}
      gap={8}
      flex={1}
      justifyContent="center"
      flexDirection="column"
    >
      <Button
        borderRadius={6}
        paddingTop="6px"
        paddingBottom="6px"
        variant={'primary'}
        fontWeight={500}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        Yes
      </Button>
    </Flex>
  );
};

import { Flex } from '../../';

export const TextBlock: any = (props: any) => {
  return (
    <Flex
      flexDirection="row"
      width={800}
      height={600}
      p={1}
      background={'#FFFF'}
    >
      <Flex
        flexDirection="column"
        width={400}
        height={300}
        p={1}
        background={'#FFFF'}
      >
        {props.children}
      </Flex>
    </Flex>
  );
};

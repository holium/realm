import { Text, Flex, Spinner } from '@holium/design-system';

type Props = {
  text?: string;
};

export const Loader = ({ text }: Props) => (
  <Flex justifyContent="center" alignItems="center" height="100vh" gap={24}>
    <Spinner size={3} />
    {text && <Text.H2>{text}</Text.H2>}
  </Flex>
);

import { Flex } from '../Flex/Flex';

export type ShareModalProps = {
  id?: string;
  appName?: string;
};

export const ShareModal = ({ appName }: ShareModalProps) => {
  return <Flex>{appName}</Flex>;
};

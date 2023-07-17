import { Flex, Icon, Spinner } from '@holium/design-system/general';

type Props = {
  loading: boolean;
  isSafe: boolean;
};

export const ToolbarLockIcon = ({ loading, isSafe }: Props) => {
  if (loading) {
    return (
      <Flex flexDirection="row" alignItems="center">
        <Spinner size={0} />
      </Flex>
    );
  } else if (isSafe) {
    return <Icon name="LockedFill" iconColor="#23B164" />;
  } else {
    return <Icon name="UnlockedFill" />;
  }
};

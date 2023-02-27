import { Spinner } from '@holium/design-system';
import { Flex, Icons } from 'renderer/components';

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
    return <Icons name="LockedFill" color="#23B164" />;
  } else {
    return <Icons name="UnlockedFill" />;
  }
};

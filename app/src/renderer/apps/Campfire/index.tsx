import { observer } from 'mobx-react';
import { Flex } from 'renderer/components';
import { useServices } from 'renderer/logic/store';

const CampfirePresenter = () => {
  const { campfire } = useServices();
  return <Flex flex={1} minHeight={0}></Flex>;
};

export const Campfire = observer(CampfirePresenter);

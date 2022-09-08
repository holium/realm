import { observer } from 'mobx-react';
import { FC } from 'react';
import { useServices } from 'renderer/logic/store';

export const Invitations: FC<any> = observer((props: any) => {
  const { spaces } = useServices();
  // spaces.
  return <div>hey</div>;
});

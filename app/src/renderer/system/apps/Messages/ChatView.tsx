import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Grid } from '../../../components';

import { useMst } from '../../../logic/store';

type IProps = {};

export const ChatView: FC<any> = observer((props: any) => {
  const { shipStore } = useMst();

  useEffect(() => {
    // shipStore.session?.chat.getDMs();
  }, []);

  const dms = shipStore.session?.chat.dms;
  return <Grid.Column noGutter></Grid.Column>;
});

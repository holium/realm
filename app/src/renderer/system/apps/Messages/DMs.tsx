import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Grid } from '../../../components';

import { useMst } from '../../../logic/store';
import { toJS } from 'mobx';

type IProps = {};

export const DMs: FC<any> = observer((props: any) => {
  const { shipStore } = useMst();
  // console.log(toJS(shipStore.session));
  useEffect(() => {
    shipStore.session?.chat.getDMs(shipStore.session!.patp);
  }, []);

  const chat = shipStore.session?.chat;
  return (
    <Grid.Column noGutter>
      {chat!.list.map((dm: any) => (
        <Grid.Row key={dm.contact}>{dm.contact}</Grid.Row>
      ))}
    </Grid.Column>
  );
});

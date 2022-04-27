import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Grid } from '../../../components';
import { ContactRow } from './components/ContactRow';
import { useMst } from '../../../logic/store';
import { toJS } from 'mobx';
import { WindowThemeType } from '../../../logic/stores/config';

type IProps = {
  theme: WindowThemeType;
  height: number;
  onSelectDm: (dm: any) => void;
};

export const DMs: FC<IProps> = observer((props: IProps) => {
  const { height, theme, onSelectDm } = props;
  const { shipStore } = useMst();

  const chat = shipStore.session?.chat;
  return (
    <Grid.Column
      gap={2}
      mb={3}
      noGutter
      expand
      height={height}
      overflowY="scroll"
    >
      {chat!.list.map((dm: any) => (
        <Grid.Row noGutter expand key={dm.contact}>
          <ContactRow
            theme={theme}
            dm={dm}
            onClick={(evt: any) => {
              evt.stopPropagation();
              onSelectDm(dm);
            }}
          />
        </Grid.Row>
      ))}
    </Grid.Column>
  );
});

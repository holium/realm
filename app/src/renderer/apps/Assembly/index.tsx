import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { FC } from 'react';
import { useTrayApps } from 'renderer/logic/apps/store';
import { Assemblies, AssemblyListProps } from './List';
import { NewAssembly } from './NewAssembly';
import { Room } from './Room';

export const AssemblyViews: { [key: string]: any } = {
  list: (props: AssemblyListProps) => <Assemblies {...props} />,
  'new-assembly': (props: any) => <NewAssembly {...props} />,
  room: (props: any) => <Room {...props} />,
};

export type AssemblyAppProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const AssemblyApp: FC<AssemblyAppProps> = observer(
  (props: AssemblyAppProps) => {
    const { assemblyApp } = useTrayApps();
    const View = AssemblyViews[assemblyApp.currentView];
    return <View {...props} />;
  }
);

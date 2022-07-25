import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Grid, Text, Flex, Icons, Sigil } from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';
import { AvatarRow } from './AvatarRow';
import { AssemblyModelType } from 'renderer/logic/apps/assembly';

type AssemblyRowProps = AssemblyModelType & {
  onClick: (evt: any) => any;
};

export const AssemblyRow: FC<AssemblyRowProps> = observer(
  (props: AssemblyRowProps) => {
    const { title, host, people, cursors, onClick } = props;
    const { shell, ship } = useServices();

    const { backgroundColor, textColor, windowColor, iconColor } =
      shell.desktop.theme;

    let peopleText = 'people';
    if (people.length === 1) {
      peopleText = 'person';
    }

    return (
      <Row
        className="realm-cursor-hover"
        customBg={windowColor}
        onClick={(evt: any) => onClick(evt)}
      >
        <Flex flex={1} justifyContent="space-between" flexDirection="row">
          <Flex gap={2} flexDirection="column">
            <Text fontWeight={500} fontSize={'15px'}>
              {title}
            </Text>
            <Flex flexDirection="row">
              <Icons mr={1} opacity={0.5} name="Friends" />
              <Text opacity={0.5} fontWeight={400} fontSize={2}>
                {people.length} {peopleText}{' '}
                {host === ship?.patp && `  -  Hosting`}
              </Text>
            </Flex>
          </Flex>
          <AvatarRow people={people} backgroundColor={windowColor} />
        </Flex>
      </Row>
    );
  }
);

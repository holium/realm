import React, { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Grid, Text, Flex, Icons, Sigil } from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Row } from 'renderer/components/NewRow';
import { useServices } from 'renderer/logic/store';
import { AvatarRow } from './AvatarRow';
import { AssemblyModelType } from 'renderer/logic/apps/assembly';
import { rgba } from 'polished';

type AssemblyRowProps = AssemblyModelType & {
  tray?: boolean;
  onClick?: (evt: any) => any;
  rightChildren?: any;
};

export const AssemblyRow: FC<AssemblyRowProps> = observer(
  (props: AssemblyRowProps) => {
    const { tray, title, host, people, cursors, onClick, rightChildren } =
      props;
    const { shell, ship } = useServices();

    const { mode, dockColor, windowColor } = shell.desktop.theme;

    let peopleText = 'people';
    if (people.length === 1) {
      peopleText = 'person';
    }

    let peopleNoHost = people.filter((person: string) => person !== ship?.patp);
    let titleText = title;
    if (titleText.length > 16 && tray) {
      titleText = titleText.substring(0, 16) + '...';
    }

    return (
      <Row
        small={tray}
        className="realm-cursor-hover"
        customBg={windowColor}
        {...(onClick
          ? { onClick: (evt: any) => onClick(evt) }
          : { style: { pointerEvents: 'none' } })}
      >
        <Flex
          flex={1}
          gap={16}
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
        >
          <Flex width="-webkit-fill-available" gap={2} flexDirection="column">
            <Text fontWeight={500} fontSize={tray ? '14px' : '15px'}>
              {titleText}
            </Text>
            {!tray && (
              <Flex flexDirection="row">
                <Icons mr={1} opacity={0.5} name="Friends" />
                <Text opacity={0.5} fontWeight={400} fontSize={2}>
                  {people.length} {peopleText}{' '}
                  {host === ship?.patp && `  -  Hosting`}
                </Text>
              </Flex>
            )}
          </Flex>

          <AvatarRow
            people={peopleNoHost}
            backgroundColor={tray ? dockColor : windowColor}
          />
        </Flex>
        {rightChildren || <div />}
      </Row>
    );
  }
);

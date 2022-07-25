import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/shell/theme.model';
import {
  Flex,
  Grid,
  IconButton,
  Icons,
  Text,
  Input,
  TextButton,
  Checkbox,
  Sigil,
} from 'renderer/components';
import { useTrayApps } from 'renderer/logic/apps/store';
import { useServices } from 'renderer/logic/store';
import { VoiceAnalyzer } from './VoiceVisualizer';

interface ISpeaker {
  person: string;
  audio: any;
}

export const Speaker: FC<ISpeaker> = observer((props: ISpeaker) => {
  const { person, audio } = props;
  const { ship, shell } = useServices();
  const metadata = ship?.contacts.getContactAvatarMetadata(person);
  const hasVoice = audio && person === ship?.patp;
  let name = metadata?.nickname || person;
  if (name.length > 18) name = `${name.substring(0, 18)}...`;
  return (
    <Flex
      key={person}
      gap={12}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width={'100%'}
    >
      <Sigil
        borderRadiusOverride="6px"
        simple
        size={36}
        avatar={metadata && metadata.avatar}
        patp={person}
        color={[(metadata && metadata.color) || '#000000', 'white']}
      />
      <Text alignItems="center" fontSize={3} fontWeight={500}>
        {name}
        {!hasVoice && <Icons ml={1} name="MicOff" size={18} opacity={0.3} />}
      </Text>
      {hasVoice ? (
        <VoiceAnalyzer audio={audio} />
      ) : (
        <Flex height={30}>
          {/* <Icons name="MicOff" size={18} opacity={0.3} /> */}
        </Flex>
      )}
    </Flex>
  );
});

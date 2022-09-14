import { FC, useState } from 'react';
import { Flex, Text } from 'renderer/components';
import { Speaker } from '../components/Speaker';

interface VoiceViewProps {
  present: any[];
  host: string;
  audio: MediaStream | null;
}

export const VoiceView: FC<VoiceViewProps> = ({
  host,
  present,
  audio,
}: VoiceViewProps) => {
  return (
    <Flex flex={2} gap={16} p={2} flexDirection="row" alignItems="center">
      <Speaker type="host" person={host} audio={audio} />
      {present
        .filter((person: string) => person !== host)
        .map((person: string, index: number) => (
          <Speaker key={person} type="speaker" person={person} audio={audio} />
        ))}
    </Flex>
  );
};

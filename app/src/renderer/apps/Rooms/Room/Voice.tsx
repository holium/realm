import { FC, useState } from 'react';
import { Flex } from 'renderer/components';
import { Speaker } from '../components/Speaker';

interface VoiceViewProps {
  present: any[];
  audio: MediaStream | null;
}

export const VoiceView: FC<VoiceViewProps> = ({
  present,
  audio,
}: VoiceViewProps) => {
  return (
    <Flex flex={2} gap={8} flexDirection="row" alignItems="center">
      {present.map((person: string, index: number) => (
        <Speaker key={person} person={person} audio={audio} />
      ))}
    </Flex>
  );
};

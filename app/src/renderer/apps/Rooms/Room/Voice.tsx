import { FC } from 'react';
import { Flex } from 'renderer/components';
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
  const presentPeers = present.filter((person: string) => person !== host);
  return (
    <Flex
      flex={2}
      gap={12}
      py={2}
      display="grid"
      gridTemplateColumns={presentPeers.length ? `repeat(2, 1fr)` : '.5fr'}
      gridAutoColumns="1fr"
      gridAutoRows={'.5fr'}
    >
      <Speaker type="host" person={host} audio={audio} />
      {presentPeers.map((person: string) => (
        <Speaker key={person} type="speaker" person={person} audio={audio} />
      ))}
    </Flex>
  );
};

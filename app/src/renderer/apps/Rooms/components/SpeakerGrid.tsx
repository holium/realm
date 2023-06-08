// props with children
type SpeakerGridProps = {
  children: React.ReactNode;
  peers: string[];
  activeSpeaker: string | null;
};

export const SpeakerGrid = ({
  activeSpeaker,
  peers,
  children,
}: SpeakerGridProps) => {
  console.log('SpeakerGrid', { activeSpeaker, peers, children });
  return <div>Speaker grid</div>;
};

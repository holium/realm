import { useEffect } from 'react';

export type SendCaret = (
  patp: string,
  position: { x: number; y: number }
) => void;

const sendCaret: SendCaret = (patp, position) => {
  window.electron.multiplayer.appToRealmSendCaret(patp, position);
};

type Props = {
  onCaret: (patp: string, position: { x: number; y: number }) => void;
};

export const useCarets = ({ onCaret }: Props) => {
  useEffect(() => {
    window.electron.multiplayer.onRealmToAppSendCaret(onCaret);
  }, [onCaret]);

  return { sendCaret };
};

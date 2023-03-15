import React, { MouseEventHandler, useContext, useEffect, useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { RealmMultiplayerContext } from './Provider';
import {
  CursorClickPayload,
  CursorDownPayload,
  CursorEvent,
  CursorOutPayload,
  CursorOverPayload,
  CursorUpPayload,
} from './types';

interface Props {
  asChild?: boolean;
  id: string;
  onOtherClick?: (patp: string) => void;
  onClick?: (ev: Parameters<MouseEventHandler>[0]) => void;
  onOtherOver?: (patp: string) => void;
  onMouseOver?: (ev: Parameters<MouseEventHandler>[0]) => void;
  onOtherUp?: (patp: string) => void;
  onMouseUp?: (ev: Parameters<MouseEventHandler>[0]) => void;
  onOtherDown?: (patp: string) => void;
  onMouseDown?: (ev: Parameters<MouseEventHandler>[0]) => void;
  onOtherOut?: (patp: string) => void;
  onMouseOut?: (ev: Parameters<MouseEventHandler>[0]) => void;
}

export function Clickable({
  id,
  asChild = true,
  onOtherClick,
  onOtherOver,
  onOtherUp,
  onOtherDown,
  onOtherOut,
  ...props
}: React.PropsWithChildren<Props>) {
  const { api } = useContext(RealmMultiplayerContext);
  const ref = useRef<any>(null);
  const Component =
    asChild && React.isValidElement(props.children) ? Slot : 'button';

  // trigger onOther_ events
  useEffect(() => {
    if (!api) return;
    const unsub = [
      api.subscribe<CursorClickPayload>(CursorEvent.Click, (payload) => {
        if (payload.target !== id) return;
        const ships = api.getPresenceState('ship');
        onOtherClick?.(ships[payload.id].patp);
        // Trigger fake click
        (ref.current as HTMLElement)?.click();
      }),

      api.subscribe<CursorOverPayload>(CursorEvent.Over, (payload) => {
        if (payload.target !== id) return;
        const ships = api.getPresenceState('ship');
        onOtherOver?.(ships[payload.id].patp);
      }),

      api.subscribe<CursorDownPayload>(CursorEvent.Down, (payload) => {
        if (payload.target !== id) return;
        const ships = api.getPresenceState('ship');
        onOtherDown?.(ships[payload.id].patp);
      }),

      api.subscribe<CursorUpPayload>(CursorEvent.Up, (payload) => {
        if (payload.target !== id) return;
        const ships = api.getPresenceState('ship');
        onOtherUp?.(ships[payload.id].patp);
      }),

      api.subscribe<CursorOutPayload>(CursorEvent.Out, (payload) => {
        if (payload.target !== id) return;
        const ships = api.getPresenceState('ship');
        onOtherOut?.(ships[payload.id].patp);
      }),
    ];

    return () => unsub.forEach((u) => u());
  }, [api, onOtherClick, onOtherDown, onOtherOut, onOtherOver]);

  return <Component data-multi-click-id={id} {...props} ref={ref} />;
}

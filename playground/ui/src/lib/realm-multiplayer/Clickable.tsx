import React, {
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { RealmMultiplayerContext } from "./Provider";
import {
  CursorClickPayload,
  CursorEvent,
} from "../../../../../app/src/renderer/system/desktop/components/Multiplayer/types";

interface Props {
  asChild?: boolean;
  id: string;
  onOtherClick?: (id: string) => void;
  onClick?: (ev: Parameters<MouseEventHandler>[0]) => void;
}
export function Clickable({
  id,
  asChild = true,
  onOtherClick,
  ...props
}: React.PropsWithChildren<Props>) {
  const { api } = useContext(RealmMultiplayerContext);
  const ref = useRef<any>(null);
  const Component =
    asChild && React.isValidElement(props.children) ? Slot : "button";

  // trigger onClickWithOthers when another actor clicks
  useEffect(() => {
    if (!api) return;
    const unsub = api.subscribe<CursorClickPayload>(
      CursorEvent.Click,
      (payload) => {
        if (payload.target !== id) return;
        api.getPresenceState("ship");
        onOtherClick?.(payload.id);
        // Trigger fake click
        (ref.current as HTMLElement)?.click();
      }
    );

    return () => unsub();
  }, [api, onOtherClick]);

  return <Component data-multi-click-id={id} {...props} ref={ref} />;
}

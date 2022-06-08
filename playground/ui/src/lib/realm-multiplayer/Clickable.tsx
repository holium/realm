import React from "react";
import { Slot } from "@radix-ui/react-slot";

interface Props {
  asChild?: boolean;
  id: string;
  onClick?: () => void; // triggered when another actor clicks
}
export function Clickable({
  id,
  asChild = true,
  ...props
}: React.PropsWithChildren<Props>) {
  const Component =
    asChild && React.isValidElement(props.children) ? Slot : "button";
  return <Component data-multi-click-id={id} {...props} />;
}

import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { cloneElement, type ReactElement, useState } from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  content: string;
  children: ReactElement<any>;
};

export const Tooltip = ({ content, children }: TooltipProps) => {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom",
    middleware: [offset(2), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const reference = cloneElement(children, {
    ...getReferenceProps(children.props ?? {}),
    ref: refs.setReference,
  });

  return (
    <>
      {reference}
      {open &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-15000 rounded bg-gray-700/75 px-2 py-1 text-xs text-white shadow-lg"
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
};

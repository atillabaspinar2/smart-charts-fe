import { animate, spring } from "animejs";
import type { JSAnimation } from "animejs";

export function cancelSketchContainerMotion(
  anim: JSAnimation | null | undefined,
): void {
  if (!anim) return;
  try {
    anim.revert();
  } catch {
    // ignore
  }
}

const sketchSpringEase = () =>
  spring({
    stiffness: 12,
    damping: 4.3,
    mass: 1,
    velocity: 2,
  });

/**
 * Requires an ancestor with `container-type: size` (e.g. #chart-canvas) so `cqh` resolves.
 * Timeline clip duration is applied via {@link JSAnimation.stretch}.
 */
export function playSketchContainerEnter(
  target: HTMLElement,
  durationMs: number,
): JSAnimation {
  const anim = animate(target, {
    y: { from: "100cqh", to: "0px" },
    ease: sketchSpringEase(),
  });
  anim.stretch(durationMs);
  return anim;
}

export function playSketchContainerExit(
  target: HTMLElement,
  durationMs: number,
  onComplete?: () => void,
): JSAnimation {
  const anim = animate(target, {
    y: { from: "0px", to: "100cqh" },
    ease: sketchSpringEase(),
    onComplete: () => onComplete?.(),
  });
  anim.stretch(durationMs);
  return anim;
}

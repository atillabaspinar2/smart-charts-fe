// @ts-nocheck
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import React from "react";
import { Chart } from "../components/chart";

export const Video: React.FC<{ options: any }> = ({ options }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const rawProgress = durationInFrames > 0 ? frame / durationInFrames : 0;
  const progress = Math.min(1, Math.max(0, rawProgress));

  // slice data based on progress
  const animatedOptions = React.useMemo(() => {
    if (!options) return options;
    const copy = JSON.parse(JSON.stringify(options));
    if (progress >= 0 && progress <= 1 && Array.isArray(copy.series)) {
      copy.series = copy.series.map((s: any) => {
        if (Array.isArray(s.data)) {
          const len = Math.floor(s.data.length * progress);
          return { ...s, data: s.data.slice(0, len) };
        }
        return s;
      });
      copy.animation = false;
    }
    return copy;
  }, [options, progress]);

  const type = options?.series?.[0]?.type || "";

  return (
    <AbsoluteFill className="bg-white">
      <Chart type={type} progress={progress} option={animatedOptions} />
    </AbsoluteFill>
  );
};

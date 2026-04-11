import type { FC } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import normalAnimation from "@/assets/normal_animation.webm";
import sketchyAnimation from "@/assets/sketchy_animation.webm";

type IntroPageProps = {
  onOpenAbout: () => void;
};

export const IntroPage: FC<IntroPageProps> = ({ onOpenAbout }) => {
  return (
    <div className="h-full min-h-0 w-full min-w-0 overflow-y-auto overflow-x-hidden bg-background">
      <div className="mx-auto w-full max-w-3xl px-6 py-10 pb-16 space-y-12">
        <section className="space-y-4 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Chart Studio
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Build, animate, and export charts—no code required
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Arrange line, bar, pie, and map charts on a canvas, choreograph them on
            a visual timeline, then{" "}
            <strong className="text-foreground font-medium">
              download the whole sequence as a video
            </strong>{" "}
            (WebM or MP4—choose in canvas settings)—timing, reveals, and clip
            lengths match your timeline. Also export still images and data.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="text-sm">
              <Link to="/app">Open Chart Studio</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="text-sm text-muted-foreground"
              onClick={onOpenAbout}
            >
              About
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">What you can do</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">Timeline video export</strong> —
              capture the animated workspace as WebM or MP4: each chart appears and
              animates exactly when your timeline says—your marketing clip, ready to
              download.
            </li>
            <li>
              <strong className="text-foreground">Animation timeline</strong> —
              drag clip start and end per chart; preview the full sequence with{" "}
              <strong className="text-foreground">Animate all</strong>.
            </li>
            <li>
              <strong className="text-foreground">Sketch style</strong> — optional
              hand-drawn line, bar, and pie charts with adjustable intensity.
            </li>
            <li>
              <strong className="text-foreground">Multiple chart types</strong> —
              line, bar, pie, and map on one workspace.
            </li>
            <li>
              <strong className="text-foreground">Data</strong> — import CSV or
              Excel, edit in the table, export CSV.
            </li>
            <li>
              <strong className="text-foreground">Still images</strong> — PNG per
              chart. Workspaces persist in your browser.
            </li>
          </ul>
        </section>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pb-16 space-y-14">
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Two ways your charts can move
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Default charts use smooth built-in animation. Sketch mode adds a
              hand-drawn look and a different motion when the timeline runs.
            </p>
          </div>

          {/* Video left, copy right */}
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-10 lg:gap-12">
            <div className="w-full md:w-[58%] lg:w-[60%] md:min-w-0 shrink-0">
              <video
                className="w-full rounded-xl border border-border bg-muted/30 shadow-md"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={normalAnimation} type="video/webm" />
              </video>
            </div>
            <div className="w-full md:flex-1 space-y-3 md:min-w-0 text-left">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Classic smooth animation
              </p>
              <h4 className="text-xl font-semibold text-foreground leading-snug">
                Polished transitions from ECharts
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Lines draw in, bars grow, and pie slices take shape with the familiar
                smooth motion people expect from data charts—ideal when you want a
                clean, professional playback on the timeline.
              </p>
            </div>
          </div>

          {/* Copy left, video right */}
          <div className="flex flex-col md:flex-row-reverse md:items-center gap-8 md:gap-10 lg:gap-12">
            <div className="w-full md:w-[58%] lg:w-[60%] md:min-w-0 shrink-0">
              <video
                className="w-full rounded-xl border border-border bg-muted/30 shadow-md"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={sketchyAnimation} type="video/webm" />
              </video>
            </div>
            <div className="w-full md:flex-1 space-y-3 md:min-w-0 text-left">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Hand-drawn sketch mode
              </p>
              <h4 className="text-xl font-semibold text-foreground leading-snug">
                Rough lines and a storybook slide-in
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Turn on Sketch for line, bar, or pie for hand-drawn strokes, then
                play the timeline: the whole card moves with a springy motion—same
                schedule as classic mode, totally different personality.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-center pt-2">
          <Button asChild size="lg" className="text-sm">
            <Link to="/app">Get started</Link>
          </Button>
        </div>

        <footer className="pt-8 border-t border-border space-y-3 max-w-3xl mx-auto">
          <p className="text-[11px] text-muted-foreground/90 leading-relaxed text-center">
            <span className="font-medium text-muted-foreground">Built with</span>{" "}
            React, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Table, Apache
            ECharts, Rough.js, anime.js, Radix UI, idb-keyval, and more.
          </p>
        </footer>
      </div>
    </div>
  );
};

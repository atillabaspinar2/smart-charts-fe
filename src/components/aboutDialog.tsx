// show about dialog with info about the project and links to github, etc.

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export const AboutDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About SmartCharts</DialogTitle>
          <DialogDescription>
            <div>
              SmartCharts is a project that provides interactive and
              customizable charts for data visualization.
            </div>
            <div>Created by Atilla Baspinar. </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";

// Lucide Icons
import {
  IconArrowUp,
  IconPaperclip,
  IconPlayerStopFilled,
} from "@tabler/icons-react";

import { Loader2 } from "lucide-react";

// Shadcn Tooltips
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// ^ adjust import path based on where your Shadcn components live

import AssistantsListInChatInputBoxBtn from "./assistants-list-dropup-in-chat-input";
import MapToolsDropup from "../map-tools-dropup";
import CurrentSessionAssetsDropup from "./current-session-assets-dropup";
import AssetsModal from "../../external-assets/assets-modal";

interface ChatInputButtonsProps {
  isStreaming: boolean;
  handleSubmit: () => void;
  inputValue: string;
  openFileDialog: () => void;
}

export const ChatInputButtons = ({
  isStreaming,
  handleSubmit,
  inputValue,
  openFileDialog,
}: ChatInputButtonsProps) => {
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);

  const onOpenAssetSrouces = () => {
    setIsAssetsModalOpen(true);
  };
  const onAssetsModalClose = () => {
    setIsAssetsModalOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="z-[1000]">
        {/* Attach Files Button */}
        {/* TODO(Nedyalko): This leaves a gap that I don't know how to fix. */}
        {/*
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={openFileDialog}
              className="absolute pb-1 left-3 bottom-2 transform -translate-y-2"
            >
              <IconPaperclip className="h-6 w-6 rotate-45 scale-x-[-1] text-primary antialiased" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Attach files</TooltipContent>
        </Tooltip>
        */}

        {/* Additional Dropup Buttons */}
        {/* <AssistantsListInChatInputBoxBtn /> */}
        <MapToolsDropup onOpenAssetSrouces={onOpenAssetSrouces} />
        <CurrentSessionAssetsDropup />
        <AssetsModal isOpen={isAssetsModalOpen} onClose={onAssetsModalClose} />

        {/* Send or Stop Button */}
        {isStreaming ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="absolute right-1 bottom-2 transform -translate-y-2 px-2 z-[1000]">
                <Loader2
                  size={35}
                  className="animate-spin text-white 
                             bg-gray-800 dark:bg-background 
                             dark:text-foreground p-[9px] 
                             rounded-full"
                  style={{ animation: "spin 1.5s linear infinite" }}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Stop streaming</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSubmit}
                className="absolute right-1 bottom-2 transform -translate-y-2 px-2 z-[1000]"
                disabled={!inputValue.trim() || isStreaming}
              >
                <IconArrowUp
                  size={31}
                  strokeWidth={3}
                  className={`p-[6px] pb-2 rounded-full ${
                    inputValue.trim()
                      ? "bg-gray-800 dark:bg-gray-100 text-white dark:text-background"
                      : "bg-gray-400 dark:bg-background text-white dark:text-muted-foreground"
                  }`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Send message</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

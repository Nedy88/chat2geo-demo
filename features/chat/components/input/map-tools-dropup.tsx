import React, { useState, useEffect, useRef } from "react";
import { IconBackpack, IconX } from "@tabler/icons-react";
import SelectRoiOnMapBtn from "./chat-input-buttons/select-roi-on-map-btn";
import OpenDatabaseInChatInputBtn from "./chat-input-buttons/open-database-in-chat-input-btn";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MapToolsDropupProps {
  onOpenAssetSrouces: () => void;
}

const MapToolsDropup = ({ onOpenAssetSrouces }: MapToolsDropupProps) => {
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const dropupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropupRef.current &&
        !dropupRef.current.contains(event.target as Node)
      ) {
        setIsDropupOpen(false);
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="z-[1000]" ref={dropupRef}>
        {isDropupOpen && (
          <div className="absolute bottom-full left-0 mb-2 bg-[#f4f4f4] dark:bg-secondary rounded-3xl shadow-lg p-2 w-full border border-stone-300 dark:border-stone-600">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-md font-bold text-primary/80 ml-2">
                Toolbox
              </h2>
              <button
                onClick={() => setIsDropupOpen(false)}
                className="text-primary hover:text-primary/90"
              >
                <IconX size={17} />
              </button>
            </div>
            <Separator className="mb-2" />
            <SelectRoiOnMapBtn setIsDropupOpen={setIsDropupOpen} />
            {/*
            <OpenDatabaseInChatInputBtn
              onOpenAssetSrouces={onOpenAssetSrouces}
            />
            */}
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="absolute left-12 bottom-5 text-forground z-[1000] cursor-pointer"
              onClick={() => setIsDropupOpen(!isDropupOpen)}
            >
              <IconBackpack
                stroke={2}
                className={`h-6 w-6 ${
                  isDropupOpen ? "text-blue-600" : "text-primary"
                }`}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">View your toolbox</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default MapToolsDropup;

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VideoEmbedProps {
  url: string;
  title: string;
  type?: "video" | "tiktok" | "instagram";
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, title, type = "video" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (type === "video") {
      const video = document.createElement("video");
      video.src = url;
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        setVideoDimensions({
          width: video.videoWidth,
          height: video.videoHeight,
        });

        // Seek to first frame
        video.currentTime = 0.1;
      };

      video.onseeked = () => {
        // Capture first frame as thumbnail
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          setThumbnail(canvas.toDataURL("image/jpeg", 0.9));
        }
      };

      return () => {
        video.pause();
        video.src = "";
      };
    }
  }, [url, type]);

  const renderContent = () => {
    if (!isPlaying) {
      return (
        <>
          {thumbnail && (
            <img
              src={thumbnail}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4622A] rounded-full blur-xl opacity-50" />
              <Button
                size="lg"
                className="relative rounded-full w-16 h-16 bg-[#D4622A] hover:bg-[#B84F1E] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
                onClick={() => setIsPlaying(true)}
              >
                <Play className="w-6 h-6 ml-1" />
              </Button>
            </div>
            <p className="text-sm font-medium text-white drop-shadow-lg">{title}</p>
          </div>
        </>
      );
    }

    switch (type) {
      case "video":
        return (
          <video
            ref={videoRef}
            autoPlay
            controls
            className="w-full h-full object-cover"
            src={url}
          />
        );

      case "tiktok":
        return (
          <iframe
            src={url}
            width="100%"
            height="100%"
            style={{
              border: "none",
              borderRadius: "12px",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );

      case "instagram":
        return (
          <iframe
            src={url}
            width="100%"
            height="100%"
            style={{
              border: "none",
              borderRadius: "12px",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );

      default:
        return (
          <video
            ref={videoRef}
            autoPlay
            controls
            className="w-full h-full object-cover"
            src={url}
          />
        );
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white/10 backdrop-blur-lg border-[#D4622A]/30 hover:border-[#D4622A]/60 group w-full max-w-sm mx-auto">
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-br from-[#E8B4A0] via-[#D4A088] to-[#B88A70] shadow-lg" style={{ aspectRatio: "9 / 16" }}>
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoEmbed;

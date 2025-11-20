
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { useEffect, useRef, ChangeEvent } from "react";
import { useVideoState } from "@/lib/state";

export type VideoComponentProps = {};

export default function VideoComponent(props: VideoComponentProps) {
  const { client, connected } = useLiveAPIContext();
  const { playbackRate, videoSource, setVideoSource } = useVideoState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);
  const loopTimeoutRef = useRef<number | null>(null);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (videoSource && videoSource.startsWith('blob:')) {
        URL.revokeObjectURL(videoSource);
      }
      const url = URL.createObjectURL(file);
      setVideoSource(url);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    return () => {
      if (videoSource && videoSource.startsWith('blob:')) {
        URL.revokeObjectURL(videoSource);
      }
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, [videoSource]);

  // Handle video ending for loop delay
  const handleVideoEnded = () => {
    if (videoRef.current) {
      // Wait 15 seconds before replaying
      loopTimeoutRef.current = window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              // Auto-play was prevented
              // This commonly happens if the user has not interacted with the document
              // or if the tab is in the background for video-only content.
              console.log("Video resume prevented:", error);
            });
          }
        }
      }, 15000);
    }
  };

  // Frame streaming logic
  useEffect(() => {
    if (!connected || !videoSource) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const processFrame = () => {
      // Allow streaming even if paused, as long as we have data (readyState >= 2)
      if (!video || video.ended || !ctx || video.readyState < 2) return;

      // Downscale for performance and bandwidth
      const scale = 0.25;
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Data = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

      client.sendRealtimeInput([{ mimeType: "image/jpeg", data: base64Data }]);
    };

    // Stream frames at 5 FPS
    intervalRef.current = window.setInterval(processFrame, 200);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [connected, videoSource, client]);

  return (
    <div className="video-container">
      {!videoSource ? (
        <div 
          className="upload-placeholder" 
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="material-symbols-outlined">upload_file</span>
          <p>Click to upload video</p>
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: "none" }}
          />
        </div>
      ) : (
        <div className="video-wrapper">
          <video
            ref={videoRef}
            src={videoSource}
            className="video-element"
            playsInline
            autoPlay
            muted
            onEnded={handleVideoEnded}
            crossOrigin="anonymous"
          />

          <button 
            className="close-button"
            onClick={() => {
                setVideoSource(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
            }}
            title="Remove video"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

import { useRef, useState } from "react";

export function useWebcam() {
  const videoRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsActive(true);
      setHasPermission(true);
    } catch (err) {
      setError(err.message);
      setHasPermission(false);
      setIsActive(false);
    }
  };

  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();

      tracks.forEach((track) => track.stop());
    }

    setIsActive(false);
  };

  return {
    videoRef,
    isActive,
    error,
    hasPermission,
    startStream,
    stopStream,
  };
}
import { useState, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Study } from "@/types";
import { useStudyContext } from "@/app/context/StudyContext";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { StudyResource } from "@/types";

const VideoViewer = () => {
  const currentStudyContext = useStudyContext();

  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(
    undefined
  );
  const [videos, setVideos] = useState<StudyResource[] | null>(null);
  const [videoIndex, setVideoIndex] = useState<number>(0);

  function filterVideos() {
    if (currentStudyContext?.study) {
      const allResources = currentStudyContext.study.resources;
      const filteredVideos = allResources.filter(
        (resource) => resource.category === "video"
      );

      setVideos(filteredVideos as StudyResource[]);
    }
  }

  useEffect(() => {
    filterVideos();
  }, [currentStudyContext]);

  function createVideoId(url: string) {
    const videoId = new URL(url).searchParams.get("v");
    if (videoId) {
      setCurrentVideoId(videoId);
    }
  }

  useEffect(() => {
    if (videos && videos.length > 0) {
      createVideoId(videos[videoIndex].url);
    }
  }, [videos, videoIndex]);

  if (!currentStudyContext) {
    return null;
  }

  const handleNextVideo = () => {
    if (videos && videoIndex < videos.length - 1) {
      const newIndex = videoIndex + 1;
      setVideoIndex(newIndex);
      createVideoId(videos[newIndex].url);
    }
  };

  const handlePreviousVideo = () => {
    if (videos && videoIndex > 0) {
      const newIndex = videoIndex - 1;
      setVideoIndex(newIndex);
      createVideoId(videos[newIndex].url);
    }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center">
        <p>No video url provided</p>
      </div>
    );
  }

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    event.target.pauseVideo();
  };

  const opts: YouTubeProps["opts"] = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 1,
    },
  };

  return (
    <>
      <div className="video-navigation flex justify-center space-x-4 mt-4">
        <ArrowBackIcon onClick={handlePreviousVideo}>Previous</ArrowBackIcon>
        <ArrowForwardIcon onClick={handleNextVideo}>Next</ArrowForwardIcon>
      </div>
      <div className="flex justify-center items-center mt-4">
        <YouTube videoId={currentVideoId} opts={opts} onReady={onPlayerReady} />
      </div>
    </>
  );
};

export default VideoViewer;

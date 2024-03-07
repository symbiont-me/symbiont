import { useState, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Study } from "@/types";
import { useFetchResources } from "@/hooks/useFetchResources";

type VideoViewerProps = {
  study: Study;
};

type Resource = {
  category: string;
  identifier: string;
  name: string;
  studyId: string;
  url: string;
};

const VideoViewer = ({ study }: VideoViewerProps) => {
  const [currentVideoId, setCurrentVideoId] = useState<string | undefined>(
    undefined
  );
  const [videos, setVideos] = useState<Resource[] | null>(null);
  const [videoIndex, setVideoIndex] = useState<number>(0);
  console.log(study);

  function filterVideos() {
    if (study && study.resources) {
      const filteredVideos = study.resources.filter(
        (resource) => resource.category === "video"
      );

      setVideos(filteredVideos);
    }
  }

  useEffect(() => {
    filterVideos();
  }, [study]);

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

  const handleNextVideo = () => {
    if (videos && videoIndex < videos.length - 1) {
      const newIndex = videoIndex + 1;
      setVideoIndex(newIndex);
      createVideoId(videos[newIndex].url);
    }
  };

  const handlePreviousVideo = () => {
    if (videos && videoIndex < videos.length - 1) {
      const newIndex = videoIndex + 1;
      setVideoIndex(newIndex);
      if (videos) {
        createVideoId(videos[newIndex].url);
      }
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
      <div className="video-navigation">
        <button onClick={handlePreviousVideo}>Previous</button>
        <button onClick={handleNextVideo}>Next</button>
      </div>
      <YouTube videoId={currentVideoId} opts={opts} onReady={onPlayerReady} />
    </>
  );
};

export default VideoViewer;

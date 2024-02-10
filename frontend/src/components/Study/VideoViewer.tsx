import { useState, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

type VideoViewerProps = {
  studyId: string | undefined;
};

// TODO get videos from the studyId and display them
// TODO Keep the video playing in the background
const VideoViewer = ({ studyId }: VideoViewerProps) => {
  const [videoId, setVideoId] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(
    "https://www.youtube.com/watch?v=2U9WMftV40c",
  );

  useEffect(() => {
    // parse video_url to get videoId
    if (videoUrl) {
      const url = new URL(videoUrl);
      const videoId = url.searchParams.get("v");
      if (videoId) {
        setVideoId(videoId);
      }
    }
  }, [videoUrl]);

  if (!videoUrl) {
    return (
      <div className="flex flex-col justify-center items-center">
        <input
          type="text"
          placeholder="Enter Video URL"
          value={videoUrl || ""}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <p>No video url provided</p>
      </div>
    );
  }

  // https://www.youtube.com/watch?v=7lPnLK9z1fI
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  };

  const opts: YouTubeProps["opts"] = {
    height: "390",
    width: "640",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  return (
    <>
      <input
        type="text"
        placeholder="Enter Video URL"
        value={videoUrl || ""}
        onChange={(e) => setVideoId(e.target.value)}
      />
      <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} />
    </>
  );
};

export default VideoViewer;

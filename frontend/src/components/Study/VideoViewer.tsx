// ts
import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

type VideoViewerProps = {
  video_url: string | undefined;
}

function VideoViewer() {
  const [videoId, setVideoId] = React.useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = React.useState<string | undefined>("https://www.youtube.com/watch?v=2U9WMftV40c");

  if (!videoUrl) {
    return (
      <div className='flex flex-col justify-center items-center'>
      <input
      type="text"
      placeholder="Enter Video URL"
      value={videoUrl || ''}
      onChange={(e) => setVideoUrl(e.target.value)}
    />
    <p>No video url provided</p>
    </div>
    )
  }

  React.useEffect(() => {
    // parse video_url to get videoId
    if (videoUrl) {
      const url = new URL(videoUrl);
      const videoId = url.searchParams.get('v');
      if (videoId) {
        setVideoId(videoId);
      }
    }
  }, [videoUrl]);

  // https://www.youtube.com/watch?v=7lPnLK9z1fI
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  }

  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
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
    value={videoUrl || ''}
    onChange={(e) => setVideoId(e.target.value)}
  />
  <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} />
  
  </>);
}

export default VideoViewer;
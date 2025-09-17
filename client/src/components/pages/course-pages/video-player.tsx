<<<<<<< HEAD
import React from "react";
import { Playback } from "../../../utils/media";
import { useNavigate, useParams } from "react-router-dom";

/**
 * VideoPlayer:
 * - youtube/vimeo => <iframe>
 * - s3/local => <video> with <source type="video/mp4">
 * - shows lock overlay when `canPlay = false`
 */
interface Props {
  playback: Playback;
  canPlay: boolean;
}

const VideoPlayer: React.FC<Props> = ({ playback, canPlay }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const goToCourse = () => navigate(`/courses/${courseId}`);

  const Overlay = (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
      <div className="text-center text-white max-w-md">
        <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl">🔒</div>
        <h2 className="text-2xl font-semibold mt-4">This video is locked</h2>
        <p className="text-gray-200 mt-2">Enroll in the course to unlock the content.</p>
        <button onClick={goToCourse} className="mt-4 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-100">
          Go to Course
        </button>
      </div>
    </div>
  );

  // No playable source
  if (!playback?.src) {
    return (
      <div className="relative aspect-video bg-black flex items-center justify-center text-white">
        <div className="text-center px-4">
          <div className="text-3xl mb-2">🎬</div>
          <div className="font-semibold">No playable video was found for this lesson</div>
          <div className="text-gray-300 text-sm mt-1">Ask the instructor to attach a valid media source.</div>
        </div>
      </div>
    );
  }

  // youtube / vimeo
  if (playback.kind === "youtube" || playback.kind === "vimeo") {
    return (
      <div className="relative aspect-video">
        {!canPlay && Overlay}
        <iframe
          className="w-full h-full"
          src={playback.src!}
          title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // s3 / local (mp4)
  return (
    <div className="relative aspect-video bg-black">
      {!canPlay && Overlay}
      <video
        className="w-full h-full"
        controls={true}
        // UI lock only (server-side protection recommended for paid content)
        style={{ pointerEvents: canPlay ? "auto" : "none" }}
      >
        <source src={playback.src!} type={playback.type || "video/mp4"} />
        Your browser does not support the video tag.
      </video>
=======
import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import {useParams,useNavigate} from "react-router-dom";

interface VideoPlayerProps {
  videoKey: string | null;
  isCoursePurchased: boolean|null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoKey,
  isCoursePurchased,                 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>();
  const {courseId} = useParams()
  const navigate = useNavigate()

  const handleClick = ()=>{
    navigate(`/courses/${courseId}`)
  }
 console.log(`https://d2vf4943yf4h7g.cloudfront.net/${videoKey}`)
  useEffect(() => {
    let player: any | undefined;
    const initializePlayer = () => {
      if (videoRef.current) {
        player = videojs(videoRef.current, {
          controls: true,
        });
        playerRef.current = player;

        if (isCoursePurchased) {
          player.src({
            src: `https://d2vf4943yf4h7g.cloudfront.net/${videoKey}`,
            type: "video/mp4", // Update the MIME type to video/mp4
          });
        } else {
          showPurchaseOverlay()
        }
      }
    };

    const showPurchaseOverlay = () => {
      const purchaseOverlay = (
        <div className='purchase-overlay pt-16 flex items-center justify-center'>
          <div className='text-center '>
            <div className='lock-icon w-20 h-20 bg-black bg-center bg-cover mx-auto'></div>
            <h2 className='text-2xl font-semibold mt-4'>
              This video is locked
            </h2>
            <p className='text-lg text-gray-600 mt-2'>
              Please purchase the course to unlock the content
            </p>
            <div className="flex items-center justify-center mt-2 ">
              <div onClick={handleClick} className='bg-gray-500 w-2/6 flex pb-1 items-center justify-center  rounded-md hover:bg-gray-600 text-white '>
              <button  className='mt-2 font-semibold py-2 px-4'>
                Purchase Now
              </button>
            </div>            
            </div>
            
          </div>
        </div>
      );

      // Render the purchase overlay JSX component and append it to the video player container
      const videoContainer = document.querySelector(".video-js");
      if (videoContainer) {
        ReactDOM.render(purchaseOverlay, videoContainer);
      }

      // Hide the video controls for the purchase poster
      player.controls(false);
    };

    const script = document.createElement("script");
    script.src = "https://vjs.zencdn.net/7.15.4/video.js";
    script.async = true;
    script.onload = initializePlayer;

    document.body.appendChild(script);

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = undefined;
      }
      document.body.removeChild(script);
    };
  }, [videoKey, isCoursePurchased]);

  return (
    <div className='relative h-full'>
      <video
        ref={videoRef}
        className='video-js vjs-default-skin h-full w-full'
      />
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    </div>
  );
};

export default VideoPlayer;

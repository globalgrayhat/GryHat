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
    </div>
  );
};

export default VideoPlayer;

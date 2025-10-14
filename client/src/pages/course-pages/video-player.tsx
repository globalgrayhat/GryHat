import React from "react";
import { Playback } from "../../utils/media";
import { useNavigate, useParams } from "react-router-dom";

/**
 * VideoPlayer (classic look)
 * - YouTube/Vimeo: simple <iframe> with params to reduce branding/suggestions.
 * - Native (local/S3): <video controls>.
 * - Lock overlay when `canPlay` is false (UI-only).
 * Clean, minimal, brand-aligned, and responsive.
 */

interface Props {
  playback: Playback;
  canPlay: boolean;
}

type Kind = Playback["kind"];
const isYouTube = (k: Kind) => k === "youtube";
const isVimeo = (k: Kind) => k === "vimeo";

/** Build a clean YouTube embed URL with reduced chrome/suggestions */
function toYouTubeEmbed(src: string): string {
  try {
    const u = new URL(src, window.location.origin);
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;

    if (host.includes("youtube.com")) {
      // /watch?v=ID or /embed/ID
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/").filter(Boolean)[1] || null;
    } else if (host.includes("youtu.be")) {
      id = u.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (!id) return src;

    // rel=0 => related from same channel only
    // modestbranding=1 => smaller branding
    // iv_load_policy=3 => hide annotations
    // playsinline=1 => allow inline on iOS
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      iv_load_policy: "3",
      playsinline: "1",
      // keep default controls for “classic look”
      controls: "1",
      fs: "1",
      // disablekb kept off to allow keyboard in fullscreen player
      // enablejsapi not needed since we’re not customizing
      origin: window.location.origin,
    });

    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  } catch {
    return src;
  }
}

/** Build a clean Vimeo embed URL */
function toVimeoEmbed(src: string): string {
  try {
    const u = new URL(src, window.location.origin);
    // Accept both player.vimeo.com/video/ID or vimeo.com/ID
    let id = "";
    if (u.hostname.includes("vimeo.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      id = parts.pop() || "";
    }
    if (!id) return src;

    const params = new URLSearchParams({
      title: "0",
      byline: "0",
      portrait: "0",
      dnt: "1",
      playsinline: "1",
    });
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  } catch {
    return src;
  }
}

const VideoPlayer: React.FC<Props> = ({ playback, canPlay }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const goToCourse = () => navigate(`/courses/${courseId}`);

  const LockOverlay = (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
      <div className="text-center text-white max-w-md px-4">
        <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl">🔒</div>
        <h2 className="text-xl sm:text-2xl font-semibold mt-3">This video is locked</h2>
        <p className="text-gray-200 mt-2 text-sm sm:text-base">Enroll in the course to unlock the content.</p>
        <button
          onClick={goToCourse}
          className="mt-4 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-100"
        >
          Go to Course
        </button>
      </div>
    </div>
  );

  // No playable source
  if (!playback?.src) {
    return (
      <div className="relative aspect-video bg-black flex items-center justify-center text-white rounded-xl overflow-hidden">
        <div className="text-center px-4">
          <div className="text-3xl mb-2">🎬</div>
          <div className="font-semibold">No playable video was found for this lesson</div>
          <div className="text-gray-300 text-sm mt-1">Ask the instructor to attach a valid media source.</div>
        </div>
      </div>
    );
  }

  // YouTube (classic embed, reduced chrome)
  if (isYouTube(playback.kind)) {
    const embed = toYouTubeEmbed(playback.src!);
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        {!canPlay && LockOverlay}
        <iframe
          className="w-full h-full"
          src={embed}
          title="Lesson video (YouTube)"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          // sandbox keeps it safe without breaking playback
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-pointer-lock allow-popups"
          style={{ pointerEvents: canPlay ? "auto" : "none" }}
        />
      </div>
    );
  }

  // Vimeo (classic embed, minimal chrome)
  if (isVimeo(playback.kind)) {
    const embed = toVimeoEmbed(playback.src!);
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        {!canPlay && LockOverlay}
        <iframe
          className="w-full h-full"
          src={embed}
          title="Lesson video (Vimeo)"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ pointerEvents: canPlay ? "auto" : "none" }}
        />
      </div>
    );
  }

  // Native (local/S3)
  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      {!canPlay && LockOverlay}
      <video
        className="w-full h-full"
        controls
        style={{ pointerEvents: canPlay ? "auto" : "none" }}
        controlsList="nodownload noplaybackrate"
        playsInline
      >
        <source src={playback.src!} type={playback.type || "video/mp4"} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;

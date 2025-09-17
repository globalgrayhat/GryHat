import CONFIG_KEYS from "../config";
import { LessonDto, LessonMedia } from "../types/video";

export type PlaybackKind = "s3" | "local" | "youtube" | "vimeo" | "unknown";

export interface Playback {
  kind: PlaybackKind;
  src: string | null;   // iframe src for youtube/vimeo, .mp4 URL for s3/local
  type?: string | null; // e.g., "video/mp4"
}

/** Build absolute URL from relative API path (/uploads/..). */
export const assetUrl = (u?: string) =>
  !u ? "" : (u.startsWith("http") ? u : `${CONFIG_KEYS.API_BASE_URL}${u.startsWith("/") ? "" : "/"}${u}`);

/** Extract YouTube embed URL (supports watch?v= and embed/). */
export const toYouTubeEmbed = (url: string) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  // Convert typical watch URL to embed
  return url.replace("watch?v=", "embed/");
};

/** Vimeo often already comes embedded; keep flexible. */
export const toVimeoEmbed = (url: string) => url;

/** Robust enrollment check for mixed array of strings/objects. */
export const isUserEnrolled = (
  enrolled: Array<string | { _id?: string; id?: string; studentId?: string }> | undefined | null,
  studentId?: string | null
) => {
  if (!Array.isArray(enrolled) || !studentId) return false;
  return enrolled.some((e: any) =>
    typeof e === "string"
      ? e === studentId
      : e?.studentId === studentId || e?._id === studentId || e?.id === studentId
  );
};

/**
 * Decide final playback based on lesson.media (preferred) and common fallbacks.
 * Priority:
 *  1) youtube/vimeo via iframe URL
 *  2) s3 using CLOUDFRONT + key
 *  3) known "lessonVideo" entry with key (S3)
 *  4) local using server assetUrl
 */
export const buildPlaybackFromLesson = (lesson: LessonDto): Playback => {
  const media = lesson.media || [];

  // YouTube
  const yt = media.find((m: LessonMedia) => (m.name || "").toLowerCase() === "youtube" && m.url);
  if (yt?.url) return { kind: "youtube", src: toYouTubeEmbed(yt.url) };

  // Vimeo
  const vm = media.find((m: LessonMedia) => (m.name || "").toLowerCase() === "vimeo" && m.url);
  if (vm?.url) return { kind: "vimeo", src: toVimeoEmbed(vm.url) };

  // S3 by explicit name
  const s3 = media.find((m: LessonMedia) => (m.name || "").toLowerCase() === "s3" && m.key);
  if (s3?.key && CONFIG_KEYS.CLOUDFRONT_BASE) {
    return { kind: "s3", src: `${CONFIG_KEYS.CLOUDFRONT_BASE}/${s3.key}`, type: "video/mp4" };
  }

  // Fallback: some pipelines emit "lessonVideo" with key
  const lv = media.find((m: LessonMedia) => (m.name || "").toLowerCase() === "lessonvideo" && m.key);
  if (lv?.key && CONFIG_KEYS.CLOUDFRONT_BASE) {
    return { kind: "s3", src: `${CONFIG_KEYS.CLOUDFRONT_BASE}/${lv.key}`, type: "video/mp4" };
  }

  // Local file (relative URL)
  const local = media.find((m: LessonMedia) => (m.name || "").toLowerCase() === "local" && m.url);
  if (local?.url) return { kind: "local", src: assetUrl(local.url), type: "video/mp4" };

  // Unknown
  return { kind: "unknown", src: null };
};

/**
 * YouTube helper for normalizing any accepted YouTube URL to an EMBED URL.
 * Supports https://www.youtube.com/watch?v=VIDEO_ID and https://youtu.be/VIDEO_ID
 */
export const youtubeService = () => {
  const normalizeUrl = (url: string): string => {
    try {
      const parsed = new URL(url);
      let videoId: string | null = null;

      if (parsed.hostname.includes('youtube.com')) {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.hostname === 'youtu.be') {
        videoId = parsed.pathname.replace(/^\/+/, '');
      }

      if (!videoId) throw new Error('Invalid YouTube URL');
      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      throw new Error('Invalid YouTube URL');
    }
  };

  return { normalizeUrl };
};

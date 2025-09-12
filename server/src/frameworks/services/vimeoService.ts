import axios from 'axios';
import configKeys from '../../config';

/**
 * Minimal Vimeo helper. For production, use @vimeo/vimeo and proper
 * upload tickets / TUS endpoints. This shows the general shape and
 * returns an embed URL for display.
 */
export const vimeoService = () => {
  const accessToken = configKeys.VIMEO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Vimeo access token is not configured');
  }

  /**
   * Upload a video buffer to Vimeo (simplified). Large files should be
   * uploaded using Vimeo’s recommended resumable flows.
   */
  const uploadVideo = async (file: Express.Multer.File) => {
    const url = 'https://api.vimeo.com/me/videos';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.mimetype || 'video/mp4',
      'Tus-Resumable': '1.0.0'
    };

    // NOTE: This is illustrative. Real-world Vimeo uploads require creating
    // an upload ticket and streaming to the provided upload link.
    const response = await axios.post(url, file.buffer, { headers });
    const videoData = response.data;
    const videoId = String(videoData?.uri || '').split('/').pop();
    if (!videoId) throw new Error('Unexpected Vimeo response');

    return {
      id: videoId,
      url: `https://vimeo.com/${videoId}`,
      embedUrl: `https://player.vimeo.com/video/${videoId}`
    };
  };

  /** Build a standard embed URL from a Vimeo video id. */
  const getEmbedUrl = (videoId: string) => `https://player.vimeo.com/video/${videoId}`;

  return { uploadVideo, getEmbedUrl };
};

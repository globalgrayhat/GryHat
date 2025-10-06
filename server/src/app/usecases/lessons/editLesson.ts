import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { QuizDbInterface } from '../../repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '../../repositories/lessonDbRepository';
import { parseEditLessonDTO } from '../../dtos/lesson.dto';

// Unified services
import { mediaService, MediaDescriptor } from '../../services/mediaService';
import { youtubeService, vimeoService } from '../../../frameworks/services';
import { CloudServiceImpl } from '../../../frameworks/services';
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import { safeDeleteOld } from '../course/_helpers';

const looksLikeUrl = (s?: string) => !!s && /^https?:\/\//i.test(s || '');
const nonEmpty = (v: unknown) => String(v ?? '').trim().length > 0;

export const editLessonsU = async (
    files: Record<string, Express.Multer.File[]> | undefined,
    lessonId: string,
    lessonInfo: CreateLessonInterface,
    lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
    quizDbRepository: ReturnType<QuizDbInterface>,
    instructorId: string
) => {
  if (!lessonInfo) throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);

  const parsed = parseEditLessonDTO(lessonInfo);
  if (!parsed.ok || !parsed.data) {
    throw new AppError(`Invalid lesson patch: ${JSON.stringify(parsed.errors)}`, HttpStatusCodes.BAD_REQUEST);
  }
  const dto = parsed.data;

  const current = await lessonDbRepository.getLessonById(lessonId);
  if (!current) throw new AppError('Lesson not found', HttpStatusCodes.NOT_FOUND);
  if (current.instructorId.toString() !== instructorId) {
      throw new AppError('You are not authorized to edit this lesson.', HttpStatusCodes.FORBIDDEN);
  }

  const mediaSvc = mediaService();
  const cloud = cloudServiceInterface(CloudServiceImpl());
  const yt = youtubeService();
  const vimeo = vimeoService();

  const patch: any = {};
  
  // Apply direct field updates from DTO
  if (dto.title) patch.title = dto.title;
  if (dto.description) patch.description = dto.description;
  if (dto.contents) patch.contents = dto.contents;
  if (dto.duration !== undefined) patch.duration = dto.duration;
  if (dto.about) patch.about = dto.about;
  if (dto.isPreview !== undefined) patch.isPreview = dto.isPreview;

  // Video update logic
  const hasUrl = nonEmpty(dto.videoUrl);
  const chunkIds = Array.isArray(dto.videoTusKeys) ? dto.videoTusKeys.filter(nonEmpty) : [];
  if (hasUrl && chunkIds.length) {
    throw new AppError('Choose either a video URL OR chunked upload IDs, not both.', HttpStatusCodes.BAD_REQUEST);
  }

  if (chunkIds.length) {
    const finalized = await mediaSvc.finalizeChunkedUpload(chunkIds);
    if (!finalized.length) throw new AppError('Failed to finalize chunked uploads', HttpStatusCodes.BAD_REQUEST);
    
    // Clear old video files before adding new ones
    if (current.media) {
      for (const m of current.media) { await safeDeleteOld({ oldKey: m.key, cloudService: { deleteByKey: cloud.removeFile } }); }
    }

    patch.media = finalized.map(f => ({ name: f.name || 'video', url: f.url, key: f.key }));
    patch.videoTusKeys = finalized.map(f => f.key);
    patch.primaryVideoKey = dto.primaryVideoKey ?? patch.videoTusKeys[0];
    patch.videoUrl = null; // Clear URL if switching to chunked
  } else if (hasUrl) {
    const url = String(dto.videoUrl);
    const isYoutube = /youtu\.be|youtube\.com/i.test(url);
    const isVimeo = /vimeo\.com/i.test(url);
    const src = dto.videoSource || (isYoutube ? 'youtube' : isVimeo ? 'vimeo' : 'direct');

    let newMedia;
    if (src === 'youtube') newMedia = { name: 'youtube', url: yt.normalizeUrl(url) };
    else if (src === 'vimeo') {
        let id = url;
        try {
            const u = new URL(url);
            const parts = u.pathname.split('/').filter(Boolean);
            if (parts.length) id = parts[parts.length - 1];
        } catch { /* if not a URL, treat as id */ }
        newMedia = { name: 'vimeo', url: vimeo.getEmbedUrl(id) };
    }
    else {
      if (!looksLikeUrl(url)) throw new AppError('Invalid videoUrl', HttpStatusCodes.BAD_REQUEST);
      newMedia = { name: 'video', url };
    }

    if (current.media) {
      for (const m of current.media) { await safeDeleteOld({ oldKey: m.key, cloudService: { deleteByKey: cloud.removeFile } }); }
    }

    patch.media = [newMedia];
    patch.videoUrl = url;
    patch.videoSource = src;
    patch.videoTusKeys = []; // Clear chunked keys if switching to URL
    patch.primaryVideoKey = null;
  }

  // Handle resource file uploads
  const resourceFiles = files?.['resources'] ?? [];
  if (resourceFiles.length) {
      const uploadedResources = await Promise.all(
        resourceFiles.map(file => mediaSvc.upload(file, {
            type: 'lessonResource',
            courseId: current.courseId.toString(),
            lessonId: lessonId,
        }))
      );
      // Append new resources to existing ones
      const existingResources = current.resources || [];
      patch.resources = [...existingResources, ...uploadedResources.map((r: MediaDescriptor) => ({ name: r.name, url: r.url, key: r.key }))];
  } else if (dto.resources) {
    // Handle removal of resources if the client sends an updated list
    patch.resources = dto.resources;
    const currentKeys = (current.resources || []).map(r => r.key).filter(Boolean) as string[];
    const newKeys = (dto.resources || []).map(r => r.key).filter(Boolean) as string[];
    const keysToDelete = currentKeys.filter(k => !newKeys.includes(k));
    for (const key of keysToDelete) {
        await safeDeleteOld({ oldKey: key, cloudService: { deleteByKey: cloud.removeFile } });
    }
  }

  // Nothing to update?
  if (Object.keys(patch).length === 0 && !dto.questions) {
    return;
  }

  if (Object.keys(patch).length > 0) {
      await lessonDbRepository.editLesson(lessonId, patch);
  }

  // Update quiz only if questions were provided
  if (dto.questions) {
    await quizDbRepository.editQuiz(lessonId, { questions: dto.questions });
  }
};


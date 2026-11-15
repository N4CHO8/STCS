export const MEDIA_IMAGE_SIDE = 96;
export const MEDIA_IMAGE_BYTES = MEDIA_IMAGE_SIDE * MEDIA_IMAGE_SIDE * 2;
export const MEDIA_UPLOAD_LIMIT = 2 * 1024 * 1024;
export const MEDIA_AUDIO_LIMIT = 320044;
export const MEDIA_VOICE = "piper-es_ES-davefx-medium-d2c9224e1223-v1";
export type AudioStatus =
  | "missing"
  | "pending"
  | "processing"
  | "ready"
  | "error";
export function uploadedImageId(path: string): string | null {
  return (
    /^\/api\/stcs\/images\/([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})$/.exec(
      path,
    )?.[1] ?? null
  );
}

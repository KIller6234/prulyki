import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export interface UploadedFileInput {
  fileName: string;
  contentType: string;
  data: Buffer;
}

export interface StoredFile {
  storagePath: string;
  publicUrl: string;
}

export interface StorageProvider {
  upload(bucket: string, file: UploadedFileInput): Promise<StoredFile>;
}

/**
 * Local-disk storage for development. Files are written under
 * `public/uploads/<bucket>/` so Next.js serves them directly as static
 * assets — no separate file-serving route needed.
 *
 * Only used when Supabase credentials are absent — see `createStorageProvider`
 * below. Does not persist on serverless hosts (Netlify, Vercel).
 */
export class LocalDiskStorageProvider implements StorageProvider {
  private readonly rootDir = join(process.cwd(), "public", "uploads");

  async upload(bucket: string, file: UploadedFileInput): Promise<StoredFile> {
    const bucketDir = join(this.rootDir, bucket);
    await mkdir(bucketDir, { recursive: true });

    const extension = file.fileName.includes(".")
      ? file.fileName.slice(file.fileName.lastIndexOf("."))
      : "";
    const safeName = `${randomUUID()}${extension}`;
    const absolutePath = join(bucketDir, safeName);

    await writeFile(absolutePath, file.data);

    const storagePath = `${bucket}/${safeName}`;
    return {
      storagePath,
      publicUrl: `/uploads/${storagePath}`,
    };
  }
}

/**
 * Supabase Storage — потрібен на serverless-хостингу (Netlify, Vercel),
 * де файлова система функції ефемерна й `public/uploads` не переживає
 * навіть один наступний виклик, не кажучи вже про redeploy.
 */
export class SupabaseStorageProvider implements StorageProvider {
  private readonly client: ReturnType<typeof createClient>;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey);
  }

  async upload(bucket: string, file: UploadedFileInput): Promise<StoredFile> {
    const extension = file.fileName.includes(".")
      ? file.fileName.slice(file.fileName.lastIndexOf("."))
      : "";
    const storagePath = `${randomUUID()}${extension}`;

    const { error } = await this.client.storage
      .from(bucket)
      .upload(storagePath, file.data, {
        contentType: file.contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    const { data } = this.client.storage.from(bucket).getPublicUrl(storagePath);

    return {
      storagePath: `${bucket}/${storagePath}`,
      publicUrl: data.publicUrl,
    };
  }
}

function createStorageProvider(): StorageProvider {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    return new SupabaseStorageProvider(supabaseUrl, serviceRoleKey);
  }

  return new LocalDiskStorageProvider();
}

export const storageProvider: StorageProvider = createStorageProvider();

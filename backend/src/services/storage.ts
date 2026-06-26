import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { env, isR2Configured } from '../config/env';
import { ApiError } from '../utils/ApiError';

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (!isR2Configured()) {
    throw ApiError.badRequest(
      'File storage (Cloudflare R2) is not configured. Set the R2_* environment variables.',
    );
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: 'auto',
      endpoint: env.r2.endpoint,
      credentials: {
        accessKeyId: env.r2.accessKeyId,
        secretAccessKey: env.r2.secretAccessKey,
      },
    });
  }
  return cachedClient;
}

export interface StoredObject {
  key: string;
  bucket: string;
  mimeType: string;
  originalName: string;
}

export async function putObject(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  prefix = 'salary-slips',
): Promise<StoredObject> {
  const client = getClient();
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
  const key = `${prefix}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: env.r2.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  return { key, bucket: env.r2.bucket, mimeType, originalName };
}

/** Short-lived presigned GET URL so private objects can be viewed in the browser. */
export async function getSignedViewUrl(key: string, expiresInSeconds = 300): Promise<string> {
  const client = getClient();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: env.r2.bucket, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

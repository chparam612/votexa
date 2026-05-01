import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
const cache = new Map<string, string>();

/**
 * Fetches a secret from Google Cloud Secret Manager.
 * Caches the result in-memory for subsequent calls.
 */
export async function getSecret(name: string): Promise<string> {
  if (cache.has(name)) {
    return cache.get(name)!;
  }

  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'votexa-production';
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${name}/versions/latest`,
    });

    const payload = version.payload?.data?.toString();
    if (!payload) {
      throw new Error(`Secret ${name} not found or empty`);
    }

    cache.set(name, payload);
    return payload;
  } catch (error) {
    console.error(`Error fetching secret ${name}:`, error);
    throw error;
  }
}

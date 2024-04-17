import { ListObjectsV2Command, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import { env } from './env';
import path from 'path';
import { createReadStream } from 'fs';

const client = new S3({
  region: env.REGION,
  credentials: {
    accessKeyId: env.ACCESS_KEY,
    secretAccessKey: env.SECRET_KEY,
  },
});

const templateExists = async (name: string) => {
  const command = new ListObjectsV2Command({
    Bucket: env.BUCKET,
    Prefix: `${name}/`,
    MaxKeys: 1,
  });

  const result = await client.send(command);
  if (!result.Contents) return false;
  const exists = result.Contents.length > 0;

  return exists;
};

export const seedTemplates = async () => {
  console.log('[seeder]: Starting');
  const templates = await fs.readdir(path.join('templates'));

  for (const template of templates) {
    const exists = await templateExists(template);

    if (exists) {
      console.log(`[seeder]: ${template} already exists in s3`);

      continue;
    }

    // NOTE: Assuming theres no more dirs inside a template
    const files = await fs.readdir(path.join('templates', template));

    for (const file of files) {
      const command = new PutObjectCommand({
        Bucket: env.BUCKET,
        Key: `${template}/${file}`,
        Body: createReadStream(path.resolve('templates', template, file)),
      });

      await client.send(command);
    }

    console.log(`[seeder]: ${template} successfuly seeded to s3`);
  }
};

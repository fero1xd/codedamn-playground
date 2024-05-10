import "dotenv/config";
import { env } from "./env";
import { fsService } from "./fs";
import { glob } from "glob";
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3,
} from "@aws-sdk/client-s3";
import path from "path";
import { createReadStream } from "fs";

class AwsService {
  private _s3: S3;
  private _filesInS3: Set<string>;

  constructor() {
    this._s3 = new S3({
      region: env.REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this._filesInS3 = new Set();
    this._fetchInitialFiles();
  }

  private async _fetchInitialFiles() {
    const res = await this._s3.send(
      new ListObjectsV2Command({
        Bucket: env.BUCKET,
        Prefix: env.PG_ID,
      })
    );

    for (const c of res.Contents || []) {
      if (!c.Key) continue;
      this._filesInS3.add(c.Key.replace(env.PG_ID + "/", ""));
    }
  }

  async saveToS3() {
    try {
      const workDir = await fsService.getWorkDir();
      console.log("[save-to-s3] starting", new Date());

      const allItems = await glob(path.join(workDir, "**/*.*"), {
        ignore: ["/**/node_modules/**"],
        dot: true,
      });

      const toDelete = [];

      for (const prevFile of this._filesInS3) {
        if (!allItems.includes(path.join(env.WORK_DIR, prevFile))) {
          toDelete.push(prevFile);
        }
      }

      if (toDelete.length) {
        await this._s3.send(
          new DeleteObjectsCommand({
            Bucket: env.BUCKET,
            Delete: {
              Objects:
                toDelete.map((item) => ({ Key: `${env.PG_ID}/${item}` })) || [],
              Quiet: false,
            },
          })
        );
      }

      for (const file of allItems) {
        const cmd = new PutObjectCommand({
          Bucket: env.BUCKET,
          Key: `${env.PG_ID}/${file.replace(env.WORK_DIR + "/", "")}`,
          Body: createReadStream(file),
        });

        await this._s3.send(cmd);
      }

      await this._fetchInitialFiles();

      console.log("[save-to-s3] finished");
    } catch (err) {
      console.log("[save-to-s3] error");
      console.log(err);
    }
  }
}

export const awsService = new AwsService();

import "dotenv/config";
import { env } from "./env";
import { fsService } from "./fs";
import { glob } from "glob";
import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import path from "path";
import { createReadStream } from "fs";

export const saveToS3 = async () => {
  const client = new S3({
    region: env.REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_TOKEN,
      secretAccessKey: env.S3_SECRET,
    },
  });
  const workDir = await fsService.getWorkDir();
  console.log("[save-to-s3] starting");

  const allFiles = await glob(path.join(workDir, "**/*.*"), {
    ignore: ["/**/node_modules/**"],
    dot: true,
  });

  for (const file of allFiles) {
    const cmd = new PutObjectCommand({
      Bucket: env.BUCKET,
      Key: `${env.PG_ID}/${file.replace(env.WORK_DIR + "/", "")}`,
      Body: createReadStream(file),
    });

    const res = await client.send(cmd);
    console.log(res.$metadata);
  }
  console.log("[save-to-s3] finished");
};

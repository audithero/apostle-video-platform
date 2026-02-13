import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTRPCRouter, adminProcedure } from "@/lib/trpc/init";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

export const uploadsRouter = createTRPCRouter({
  getPresignedUrl: adminProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        contentType: z.string().min(1),
        folder: z.string().default("uploads"),
      })
    )
    .mutation(async ({ input }) => {
      const key = `${input.folder}/${Date.now()}-${input.fileName}`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: input.contentType,
      });

      const presignedUrl = await getSignedUrl(r2, command, {
        expiresIn: 3600,
      });

      const publicUrl = `${R2_PUBLIC_URL}/${key}`;

      return { presignedUrl, publicUrl, key };
    }),
});

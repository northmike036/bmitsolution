-- CreateEnum
CREATE TYPE "public"."PostType" AS ENUM ('fb', 'cl');

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "postType" "public"."PostType" NOT NULL DEFAULT 'fb';

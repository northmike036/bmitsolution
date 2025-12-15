-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "teamId" TEXT;

-- CreateTable
CREATE TABLE "public"."PosterTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leaderId" TEXT NOT NULL,

    CONSTRAINT "PosterTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PosterTeam_name_key" ON "public"."PosterTeam"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PosterTeam_leaderId_key" ON "public"."PosterTeam"("leaderId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."PosterTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PosterTeam" ADD CONSTRAINT "PosterTeam_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

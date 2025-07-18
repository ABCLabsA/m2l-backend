-- CreateTable
CREATE TABLE "check_point" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "correct_answer" TEXT,
    "options" JSONB,
    "base_code" TEXT,
    "interactive_command" TEXT,
    "expected_output" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_check_point_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "check_point_id" TEXT NOT NULL,
    "answer" TEXT,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_check_point_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_check_point_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "check_point_id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_check_point_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_check_point_progress_user_id_check_point_id_key" ON "user_check_point_progress"("user_id", "check_point_id");

-- AddForeignKey
ALTER TABLE "check_point" ADD CONSTRAINT "check_point_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_check_point_log" ADD CONSTRAINT "user_check_point_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_check_point_log" ADD CONSTRAINT "user_check_point_log_check_point_id_fkey" FOREIGN KEY ("check_point_id") REFERENCES "check_point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_check_point_progress" ADD CONSTRAINT "user_check_point_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_check_point_progress" ADD CONSTRAINT "user_check_point_progress_check_point_id_fkey" FOREIGN KEY ("check_point_id") REFERENCES "check_point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

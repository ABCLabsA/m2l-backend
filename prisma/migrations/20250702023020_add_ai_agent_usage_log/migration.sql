-- CreateTable
CREATE TABLE "ai_agent_usage_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "user_query" JSONB NOT NULL,
    "api_response" JSONB NOT NULL,
    "request_type" TEXT,
    "token_used" INTEGER,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_agent_usage_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ai_agent_usage_log" ADD CONSTRAINT "ai_agent_usage_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

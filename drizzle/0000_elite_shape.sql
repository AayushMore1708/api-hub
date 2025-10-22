CREATE TABLE "api_docs" (
	"id" serial PRIMARY KEY NOT NULL,
	"library" text NOT NULL,
	"source" text,
	"url" text,
	"content" text,
	"vector" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text,
	"email" text NOT NULL,
	"password" text,
	"provider" text NOT NULL,
	"provider_id" text,
	"created_at" timestamp DEFAULT now()
);

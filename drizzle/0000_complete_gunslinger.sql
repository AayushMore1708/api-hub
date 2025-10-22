CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text,
	"email" text NOT NULL,
	"password" text,
	"provider" text NOT NULL,
	"provider_id" text,
	"created_at" timestamp DEFAULT now()
);

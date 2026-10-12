CREATE TABLE "files" (
	"key" text PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"data" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);

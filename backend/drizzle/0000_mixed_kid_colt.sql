DO $$ BEGIN
 CREATE TYPE "template" AS ENUM('nodejs');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "playgrounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"template" "template"
);

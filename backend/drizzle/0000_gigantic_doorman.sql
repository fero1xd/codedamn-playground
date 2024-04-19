DO $$ BEGIN
 CREATE TYPE "template" AS ENUM('typescript');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "playgrounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template" "template" NOT NULL,
	"name" varchar(256) NOT NULL
);

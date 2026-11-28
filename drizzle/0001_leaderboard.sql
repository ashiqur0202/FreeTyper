CREATE TABLE "score" (
	"id" text PRIMARY KEY NOT NULL,
	"typist_id" text NOT NULL,
	"run_id" text NOT NULL,
	"wpm" real NOT NULL,
	"accuracy" real NOT NULL,
	"seconds" integer NOT NULL,
	"text_mode" text NOT NULL,
	"text_level" integer DEFAULT 0 NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_report" (
	"id" text PRIMARY KEY NOT NULL,
	"score_id" text NOT NULL,
	"reporter_typist_id" text,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "typist" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"username" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "typist_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "score" ADD CONSTRAINT "score_typist_id_typist_id_fk" FOREIGN KEY ("typist_id") REFERENCES "public"."typist"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_report" ADD CONSTRAINT "score_report_score_id_score_id_fk" FOREIGN KEY ("score_id") REFERENCES "public"."score"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_report" ADD CONSTRAINT "score_report_reporter_typist_id_typist_id_fk" FOREIGN KEY ("reporter_typist_id") REFERENCES "public"."typist"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "typist" ADD CONSTRAINT "typist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "score_run_idx" ON "score" USING btree ("typist_id","run_id");--> statement-breakpoint
CREATE INDEX "score_created_idx" ON "score" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "score_wpm_idx" ON "score" USING btree ("wpm");--> statement-breakpoint
CREATE UNIQUE INDEX "typist_username_lower_idx" ON "typist" USING btree (lower("username"));
import { z } from "zod";

const serviceAccount = z
  .string()
  .min(1)
  .transform((value, ctx) => {
    try {
      const json = JSON.parse(value);
      return {
        ...json,
        private_key: String(json.private_key ?? "").replace(/\\n/g, "\n"),
      };
    } catch {
      ctx.addIssue({ code: "custom", message: "must be valid JSON" });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .object({
        client_email: z.string().email(),
        private_key: z.string().min(1),
      })
      .passthrough(),
  );

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_SERVICE_ACCOUNT_JSON: serviceAccount,
  SPREADSHEET_ID: z.string().min(1),
  ORDERS_SHEET_NAME: z.string().min(1),
  PO_SHEET_NAME: z.string().min(1),
  SYNC_SECRET: z.string().min(16),
  DASHBOARD_URL: z
    .string()
    .url()
    .transform((v) => v.replace(/\/+$/, "")),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().regex(/^[A-Za-z0-9_-]{16,256}$/),
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional(),
  TELEGRAM_CHANNEL_CHAT_ID: z.string().optional(),
});

const raw = Object.fromEntries(
  Object.entries(process.env).filter(([, v]) => v !== undefined && v !== ""),
);

const parsed = schema.safeParse(raw);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";

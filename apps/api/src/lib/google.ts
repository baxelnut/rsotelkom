import { auth, sheets } from "@googleapis/sheets";
import { env } from "../config/env";

const googleAuth = new auth.GoogleAuth({
  credentials: env.GOOGLE_SERVICE_ACCOUNT_JSON,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const sheetsApi = sheets({ version: "v4", auth: googleAuth });

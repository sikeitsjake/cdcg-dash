import { google } from "googleapis";

export async function getGoogleSheetClient() {
  // 1. Initialize Auth with the credentials from .env
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Replace the escaped newlines to ensure the key is read correctly
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  // 2. Return the authorized sheets instance
  return google.sheets({ version: "v4", auth });
}

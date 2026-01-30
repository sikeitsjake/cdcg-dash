"use server";

import { getGoogleSheetClient } from "@/lib/googleSheets";

// This function ensures every time you call it, you get the CURRENT
// time in Eastern, formatted for your Sheets.
const getGlobalDate = () =>
  new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

// FUNCTION CALLED BY CRAB_INVOICES.TSX
export async function submitInvoicesToSheets(entries: any[]) {
  try {
    const sheets = await getGoogleSheetClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const date = getGlobalDate();

    // Transform our array of objects into a 2D array (Rows and Columns)
    // Column order: Timestamp, Type, Distributor, Ones, Twos, Females, ID
    const rows = entries.map((entry) => [
      date,
      entry.type,
      entry.distributor,
      entry.ones,
      entry.twos,
      entry.females,
      entry.id,
    ]);

    // Append the data to the "Invoices" tab
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Invoices!A1", // This assumes your tab is named "Invoices"
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Google Sheets Error:", error);
    return { success: false, error: "Failed to sync with Google Sheets" };
  }
}

// FUNCTION CALLED BY EOD_BREAKDOWN.TSX
export async function submitEoDBreakdownToSheets(formData: FormData) {
  try {
    const sheets = await getGoogleSheetClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const date = getGlobalDate();

    // 1. Extract values and normalize
    const rawData = Object.fromEntries(formData.entries());
    const data: Record<string, any> = {};

    for (const key in rawData) {
      const lowerKey = key.toLowerCase();
      const value = rawData[key];

      // Check if it's an inventory, sales, or count field
      // These usually start with 'eod', 'num', or end in 'sales'/'sold'
      const isNumericField =
        lowerKey.startsWith("eod") ||
        lowerKey.startsWith("num") ||
        lowerKey.includes("sales") ||
        lowerKey.includes("sold") ||
        lowerKey.includes("val");

      // If it's a numeric field and the value is empty/null, set it to 0
      if (isNumericField && (value === "" || value === null)) {
        data[lowerKey] = 0;
      } else {
        data[lowerKey] = value;
      }
    }

    // 2. Map data (using lowercase keys)
    const row = [
      date,
      data["time-closed"] || "N/A",
      data["weather-val"], // Now defaults to 0
      data["weather-condition"] || "N/A",
      data["specials"] || "None",

      // Male Counts
      data["eod-sm"],
      data["eod-md"],
      data["eod-ml"],
      data["eod-lg"],
      data["eod-xl"],
      data["eod-jumbo"],
      data["eod-super"],

      // Female Counts
      data["eod-fem-regf"],
      data["eod-fem-lgf"],
      data["eod-fem-xlf"],
      data["eod-fem-jumbof"],

      data["eod-bushels"],
      data["dozens-sold"],
      data["bushels-sold"],
      data["total-sales"],
      data["card-sales"],
      data["cash-sales"],

      // Labor
      data["num-employees"],
      data["num-late-employees"],
      data["late-reason"] || "N/A",
      data["num-cut"],
      data["cut-reason"] || "N/A",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "EoD_Data!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("EoD Sheets Error:", error);
    return { success: false, error: "Failed to sync EoD data" };
  }
}

// FUNCTION CALLED BY TUESDAY_BREAKDOWN.TSX
export async function submitTuesdayLogToSheets(formData: FormData) {
  try {
    const sheets = await getGoogleSheetClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const date = getGlobalDate();

    const rawData = Object.fromEntries(formData.entries());

    // Normalize and default to 0 for numbers
    const data: Record<string, any> = {};
    for (const key in rawData) {
      const val = rawData[key];
      data[key.toLowerCase()] = val === "" && key !== "worker-name" ? "0" : val;
    }

    const row = [
      date,
      data["worker-name"],
      // Maryland
      data["md-1s"],
      data["md-2s"],
      data["md-smalls"],
      data["md-mediums"],
      data["md-larges"],
      data["md-xls"],
      data["md-jumbos"],
      data["md-bushels-of-1's"],
      // Louisiana
      data["la-1s"],
      data["la-2s"],
      data["la-smalls"],
      data["la-mediums"],
      data["la-larges"],
      data["la-xls"],
      data["la-jumbos"],
      data["la-bushels-of-1's"],
      // Females
      data["num-fems"],
      data["fem-regular-females"],
      data["fem-large-females"],
      data["fem-xl-females"],
      data["fem-jumbo-females"],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Tues_Breakdown!A1", // Ensure this tab exists
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return { success: true };
  } catch (error) {
    console.error("Tuesday Log Error:", error);
    return { success: false, error: "Submission failed" };
  }
}

// FUNCTION CALLED BY HOME.TSX
export async function getLatestStockData() {
  try {
    const sheets = await getGoogleSheetClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Fetch the range covering Date (A) through Bushels (Q)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "EoD_Data!A:Q",
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;

    const latestRow = rows[rows.length - 1];

    // Helper to sum numeric strings in a range
    const sumRange = (start: number, end: number) => {
      return latestRow.slice(start, end + 1).reduce((acc, val) => {
        return acc + (Number(val) || 0);
      }, 0);
    };

    return {
      totalMales: sumRange(5, 11), // Columns F-L
      totalFemales: sumRange(12, 15), // Columns M-P
      totalBushels: latestRow[16] || "0", // Column Q
      date: latestRow[0],
    };
  } catch (error) {
    console.error("Stock Fetch Error:", error);
    return null;
  }
}

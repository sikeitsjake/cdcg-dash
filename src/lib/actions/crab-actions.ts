"use server";

import { getGoogleSheetClient } from "@/lib/actions/googleSheets";

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

      // Mark numeric fields to default to 0 if empty
      const isNumericField =
        lowerKey.startsWith("eod") ||
        lowerKey.startsWith("num") ||
        lowerKey.startsWith("sold") ||
        lowerKey.includes("sales") ||
        lowerKey.includes("val");

      if (isNumericField && (value === "" || value === null)) {
        data[lowerKey] = 0;
      } else {
        data[lowerKey] = value;
      }
    }

    // 2. Map data exactly to the Sheet's column order
    const row = [
      date, // Date
      data["time-closed"] || "N/A", // closing time
      data["weather-val"], // temp
      data["weather-condition"] || "N/A", // condition
      data["specials"] || "None", // specials

      // Male Counts (Remaining)
      data["eod-sm"],
      data["eod-md"],
      data["eod-ml"],
      data["eod-lg"],
      data["eod-xl"],
      data["eod-jumbo"],
      data["eod-super"],

      // Female Counts (Remaining)
      data["eod-fem-regf"],
      data["eod-fem-lgf"],
      data["eod-fem-xlf"],
      data["eod-fem-jumbof"],

      data["eod-bushels"], // eod bush
      data["eod-ungraded-boxes"], // ungraded boxes
      data["total-dozens-sold"], // total doz sold
      data["total-bushels-sold"], // total bush sold
      data["total-sales"], // total sale
      data["card-sales"], // card sales
      data["cash-sales"], // cash sales

      // Labor
      data["num-employees"], // num workers
      data["num-late-employees"], // num late workers
      data["late-reason"] || "N/A", // late reason
      data["num-cut"], // num cut workers
      data["cut-reason"] || "N/A", // cut reason

      // Volume Sold (Specific Sizes)
      data["sold-male-sm"],
      data["sold-male-md"],
      data["sold-male-ml"],
      data["sold-male-lg"],
      data["sold-male-xl"],
      data["sold-male-jumbo"],
      data["sold-male-super"],
      data["sold-bushel-1's"],
      data["sold-bushel-2's"],
      data["sold-female-regf"],
      data["sold-female-lgf"],
      data["sold-female-xlf"],
      data["sold-female-jumbof"],
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
      // Note: key.toLowerCase() handles case-sensitivity from FormData
      data[key.toLowerCase()] = val === "" && key !== "worker-name" ? "0" : val;
    }

    const row = [
      date, // DATE
      data["worker-name"], // EMPLOYEE

      // --- MARYLAND INVENTORY ---
      data["md-1s"], // # MD 1'S
      data["md-2s"], // # MD 2'S
      data["md-smalls"], // DOZ MD SM
      data["md-mediums"], // DOZ MD MED
      data["md-larges"], // DOZ MD LG
      data["md-xls"], // DOZ MD XL
      data["md-jumbos"], // DOZ MD JUM
      data["md-medium-larges"], // BUSH MD 1'S

      // --- LOUISIANA INVENTORY ---
      data["la-1s"], // # LA 1'S
      data["la-2s"], // # LA 2'S
      data["la-smalls"], // DOZ LA SM
      data["la-mediums"], // DOZ LA MED
      data["la-larges"], // DOZ LA LG
      data["la-xls"], // DOZ LA XL
      data["la-jumbos"], // DOZ LA JUM
      data["la-medium-larges"], // BUSH LA 1'S

      // --- TEXAS INVENTORY (NEW) ---
      data["tx-1s"], // # TX 1'S
      data["tx-2s"], // # TX 2'S
      data["tx-smalls"], // DOZ TX SM
      data["tx-mediums"], // DOZ TX MED
      data["tx-larges"], // DOZ TX LG
      data["tx-xls"], // DOZ TX XL
      data["tx-jumbos"], // DOZ TX JUM
      data["tx-medium-larges"], // BUSH TX 1'S

      // --- FEMALE INVENTORY ---
      data["num-fems"], // # FEMALES
      data["fem-regular-females"], // DOZ REGF
      data["fem-large-females"], // DOZ LGF
      data["fem-xl-females"], // DOZ XLF
      data["fem-jumbo-females"], // DOZ JUMF

      // --- MARYLAND WEIGHTS ---
      data["weight-md-smalls"], // LB MD SM
      data["weight-md-mediums"], // LB MD MD
      data["weight-md-larges"], // LB MD ML
      data["weight-md-xls"], // LB MD LG
      data["weight-md-jumbos"], // LB MD XL
      data["weight-md-medium-larges"], // LB MD JUM

      // --- LOUISIANA WEIGHTS ---
      data["weight-la-smalls"], // LB LA SM
      data["weight-la-mediums"], // LB LA MD
      data["weight-la-larges"], // LB LA ML
      data["weight-la-xls"], // LB LA LG
      data["weight-la-jumbos"], // LB LA XL
      data["weight-la-medium-larges"], // LB LA JUM

      // --- TEXAS WEIGHTS (NEW) ---
      data["weight-tx-smalls"], // LB TX SM
      data["weight-tx-mediums"], // LB TX MD
      data["weight-tx-larges"], // LB TX ML
      data["weight-tx-xls"], // LB TX LG
      data["weight-tx-jumbos"], // LB TX XL
      data["weight-tx-medium-larges"], // LB TX JUM

      // --- FEMALE WEIGHTS ---
      data["weight-fem-regular"], // REGFLB
      data["weight-fem-large"], // LGFLB
      data["weight-fem-xl"], // XLFLB
      data["weight-fem-jumbo"], // JUMF

      // --- DEADLOSS ---
      data["deadloss-dead-1s"],
      data["deadloss-dead-2s"],
      data["deadloss-dead-females"],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Tues_Breakdown!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return { success: true };
  } catch (error) {
    console.error("Tuesday Log Error:", error);
    return { success: false, error: "Submission failed" };
  }
}

export async function submitDeadLoss(formData: FormData) {
  try {
    const sheets = await getGoogleSheetClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const date = getGlobalDate();

    // 1. Convert FormData to a usable object
    const rawData = Object.fromEntries(formData.entries());

    // 2. Normalize inputs: Default empty strings to "0"
    const data: Record<string, string> = {};
    for (const key in rawData) {
      const val = rawData[key] as string;
      data[key.toLowerCase()] = val === "" ? "0" : val;
    }

    // 3. Extract specific values (matching the 'name' attributes in your JSX)
    const mornLoss = parseFloat(data["morn_loss"] || "0");
    const gradeLoss = parseFloat(data["grade_loss"] || "0");
    const totalLoss = mornLoss + gradeLoss;

    // 4. Map to Google Sheet Row Structure
    // Order: Date, Morning Loss, Grading Loss, Total Loss
    const row = [date, mornLoss, gradeLoss, totalLoss];

    // 5. Append to the specific sheet tab
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Daily_Dead_Loss!A1", // Ensure this tab exists in your Google Sheet
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return { success: true };
  } catch (error) {
    console.error("Dead Loss Submission Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Submission failed",
    };
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
      range: "EoD_Data!A:R",
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
      ungraded: latestRow[17] || "0", // Column R
      date: latestRow[0],
    };
  } catch (error) {
    console.error("Stock Fetch Error:", error);
    return null;
  }
}

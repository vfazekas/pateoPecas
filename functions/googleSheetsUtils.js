const { google } = require("googleapis");

async function getGoogleSheetsClient() {
 const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
 });

 // Create client instance for auth
 const client = await auth.getClient();

 // Instance of Google Sheets API
 const googleSheets = google.sheets({ version: "v4", auth: client });

 return googleSheets;
}

module.exports = {
 getGoogleSheetsClient,
};
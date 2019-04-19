function createProfileSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var spreadsheet = ss.insertSheet("Profile", 0);
  

  spreadsheet.setColumnWidth(1, 125);
  spreadsheet.setColumnWidth(2, 250);
  spreadsheet.setColumnWidth(4, 200);
  
  spreadsheet.getRange('A1').activate()
  .setValue('Fitbit Data Exporter');
  spreadsheet.getActiveRangeList().setFontSize(24)
  .setFontWeight('bold');
  
  spreadsheet.getRange('A3').activate()
  .setValue('Client ID');
  spreadsheet.getRange('A4').activate()
  .setValue('Client Secret');
  
  spreadsheet.getRange('A6').activate()
  .setValue('Callback URL');
  spreadsheet.getRange('A7').activate()
  .setValue('Fitbit Login URL');
  
  spreadsheet.getRange('A9').activate()
  .setValue('Login Status');
  
  spreadsheet.getRange('A11').activate()
  .setValue('Trigger Hour');
  spreadsheet.getRange('B11').activate()
  .setHorizontalAlignment("center");
  
  spreadsheet.getRange('A13').activate()
  .setValue('Email address');  
  spreadsheet.getRange('B13').activate().setHorizontalAlignment("center");  
  
  spreadsheet.getRange('C10').activate()
  .setValue('Date Selector');
  spreadsheet.getRange('C11').activate()
  .setValue('Day').setHorizontalAlignment("center");
  spreadsheet.getRange('D11').activate()
  .setHorizontalAlignment("center");
  spreadsheet.getRange('C12').activate()
  .setValue('Month').setHorizontalAlignment("center");
  spreadsheet.getRange('D12').activate()
  .setHorizontalAlignment("center");
  spreadsheet.getRange('C13').activate()
  .setValue('Year').setHorizontalAlignment("center");
  spreadsheet.getRange('D13').activate()
  .setHorizontalAlignment("center");

  
  spreadsheet.deleteColumns(5, 22);
  spreadsheet.getRangeList(['A3:A4', 'A6:A7', 'A9', 'A11', 'A13', 'C10']).activate()
  .setFontWeight('bold');
  spreadsheet.getRange('A1').activate()
}
// add custom menu
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Fitbit Menu')
      .addItem('Initialize Profile Page', 'createProfileSheet')
      .addItem('Get Callback URL','displayRedirectUri')
      .addItem('Get Fitbit Login URL','displayAuthenticationUri')
      .addItem('Check status','checkStatus')
      .addItem('Create trigger', 'createTrigger')
      .addItem('Clear Trigger', 'deleteTrigger')
      .addItem('Clear Profile','reset')
      .addItem('Main function for Yesterday', 'yesterday')
      .addItem('Main function for Custom Date', 'customDate')      
      .addToUi();
}

function createDateSheet(date) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var newSheet = ss.insertSheet();
  newSheet.setName(date);
}

function formatSheet(date) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(date);

  var dataRange = sheet.getDataRange();
  
  // apply orange banding, add header and footer
  dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.GREY, true, false);
}

function deleteAllDataSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  for(var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName();
    if(sheetName !== 'Profile'){
      ss.deleteSheet(sheets[i])
    }
  }
}
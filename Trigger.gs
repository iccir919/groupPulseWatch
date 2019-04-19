function runAuto(){  
  // create trigger to run program automatically
  createTrigger();
}

function createTrigger() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Profile');
  var hour = sheet.getRange(11,2).getValue();
  Logger.log(hour);
  
  ScriptApp.newTrigger('mainFunction')
  .timeBased()
  .atHour(hour)
  .everyDays(1)
  .inTimezone("Asia/Jerusalem")
  .create()
}

function deleteTrigger() {
  
  // Loop over all triggers and delete them
  var allTriggers = ScriptApp.getProjectTriggers();
  
  for (var i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
}

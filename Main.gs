function yesterday(date) {
  var date = date = getYesterdaysDate();
  
  createDateSheet(date);
  getHeartRateData(date);
  getSleepData(date);
  formatSheet(date);
}

function customDate() {
  var date = getDateSelection();
  
  createDateSheet(date);
  getHeartRateData(date);
  getSleepData(date);
  formatSheet(date);  
}

/***************************************/

// Get Fitbit data, general fetch request, with appropiate authorization
function getFitbitData(url) {
  var service = getService();
  
  if (service.hasAccess()) {    
    try {
      var response = UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + service.getAccessToken()
        }
      });
      
      var responseData = response.getContentText();
      var json = JSON.parse(responseData);
      return json;
    }
    catch (e) {
      Logger.log(e);
      return ["Error:", e];
    }
  } else {
    checkStatus();
  }
}


/***************************************/



function formatDate(date){
  if(date < 10){
    return "0" + date;
  } else {
    return date;
  }
}

function getYesterdaysDate(){
  var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  var result = "";
  result += yesterday.getFullYear() + "-" + formatDate(yesterday.getMonth() + 1) + "-" + formatDate(yesterday.getDate());
  return result;
}

function getDateSelection(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Profile');
  
  var day = sheet.getRange(11,4).getValue();
  var month = sheet.getRange(12,4).getValue();
  var year = sheet.getRange(13,4).getValue();
  
  return year + "-" + formatDate(month) + "-" + formatDate(day);
}

/***************************************/

// function to retrieve user heart rate data
function getHeartRateData(date) {
  var url = 'https://api.fitbit.com/1/user/-/activities/heart/date/'+date+'/1d/1sec.json';
  
  var data = getFitbitData(url);
  data = data["activities-heart-intraday"];
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(date);
  
  var dataset = data.dataset;
  
  Logger.log(dataset)
  
  // If no heart rate data, then return
  if(dataset.length === 0) return;
  
  // See if there are any missing data time ranges and send email about them (if any)
  var dataHoles = findHoles(dataset);
  sendEmail(dataHoles);
  
  /*
    Add the heart rate data on to the sheet
  */
  var rows = [],
      curr;
      
  sheet.getRange('A1').setValue('Time').setFontWeight("bold").setFontSize(18);
  sheet.getRange('B1').setValue('bpm Value').setFontWeight("bold").setFontSize(14);

  for (i = 0; i < dataset.length; i++) {
    curr = dataset[i];
    rows.push([curr.time, curr.value]);
  }

  var dataRange = sheet.getRange(2, 1, rows.length, 2);
  dataRange.setValues(rows);
  
  var sheetRange = sheet.getDataRange();
  
}

function findHoles(dataset) {
  var holes = [];
  
  for(var i = 1; i < dataset.length; i++) {
    var t1 = dataset[i].time.split(':');
    var t2 = dataset[i-1].time.split(':');
    
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    var d1 = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), t1[0], t1[1], t1[2]),
        d2 = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), t2[0], t2[1], t2[2]);
    var dif = Math.round((d1.getTime() - d2.getTime()) / 1000);
    if(dif > 300){
      holes.push([d2, d1]);
    }
  } 
  return holes;  
}

// automatically send emails to form respondents
function sendEmail(dataHoles) {
  if(dataHoles.length === 0) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Profile');
  var CLIENT_ID = sheet.getRange(3,2).getValue();
  var email = sheet.getRange(13,2).getValue();
  
  var body = "CLIENT_ID: " + CLIENT_ID + "<br><br>" + 
    "Date: " + getYesterdaysDate() + "<br><br>" +
    "Heart rate data holes: <br><br>"
    
  
  for(var i = 0; i < dataHoles.length; i++){
    body += ("* " + formatDate(dataHoles[i][0].getHours()) + ":" + formatDate(dataHoles[i][0].getMinutes()) + 
      " - " + formatDate(dataHoles[i][1].getHours()) + ":" + formatDate(dataHoles[i][1].getMinutes()));
    body += "<br><br>";
  }
  
  var subject = "Heart Rate Data Holes from " + getYesterdaysDate() + ", App ID: " + CLIENT_ID;
  
  GmailApp.sendEmail(email, subject, "", { htmlBody: body } );
  
}

// Intraday heart rate data
/*
{activities-heart-intraday= {
datasetType=second, 
dataset=[{time=00:00:07, value=86}, {time=00:00:17, value=87} ... ]
*/

/***************************************/

// function to retrieve user sleep data
function getSleepData(date) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(date);
  
  var url = 'https://api.fitbit.com/1.2/user/-/sleep/date/'+date+'.json';
  
  var data = getFitbitData(url);
  
  if(data.sleep[0] === undefined) return;
  
  var dataset = data.sleep[0].levels.data;

  var rows = [],
      curr;
  for (i = 0; i < dataset.length; i++) {
    curr = dataset[i];
    var dateTime = curr.dateTime;
    rows.push([dateTime.split('T')[0], dateTime.split('T')[1], curr.level]);
  }
  
  sheet.getRange('D1').setValue('Date').setFontWeight("bold").setFontSize(18);
  sheet.getRange('E1').setValue('Time').setFontWeight("bold").setFontSize(18);
  sheet.getRange('F1').setValue('Sleep Level').setFontWeight("bold").setFontSize(13); 
  
  var dataRange = sheet.getRange(2, 4, rows.length, 3);
  dataRange.setValues(rows);
  
  sheet.getRange('H1').setValue('Sleep Summary').setFontWeight("bold").setFontSize(24);  
  sheet.getRange('H2').setValue('Time in bed').setFontWeight("bold");
  sheet.getRange('H3').setValue(data.sleep[0].timeInBed);
  sheet.getRange('I2').setValue('To fall asleep').setFontWeight("bold");
  sheet.getRange('I3').setValue(data.sleep[0].minutesToFallAsleep);
  sheet.getRange('J2').setValue('After wakeup').setFontWeight("bold");
  sheet.getRange('J3').setValue(data.sleep[0].minutesAfterWakeup);
  
  sheet.getRange('H4').setValue('Awake').setFontWeight("bold");
  sheet.getRange('H5').setValue(data.sleep[0].minutesAwake);
  sheet.getRange('I4').setValue('Asleep').setFontWeight("bold");
  sheet.getRange('I5').setValue(data.sleep[0].minutesAsleep);
  
  sheet.getRange('H6').setValue('Wake').setFontWeight("bold");
  sheet.getRange('H7').setValue(data.summary.stages.wake);
  sheet.getRange('I6').setValue('Light').setFontWeight("bold");
  sheet.getRange('I7').setValue(data.summary.stages.light);
  sheet.getRange('J6').setValue('Deep').setFontWeight("bold");
  sheet.getRange('J7').setValue(data.summary.stages.deep);
  sheet.getRange('K6').setValue('REM').setFontWeight("bold");
  sheet.getRange('K7').setValue(data.summary.stages.rem);
}

/*
{
  sleep=[
    {
      efficiency=54, 
      minutesAsleep=243, 
      infoCode=0, 
      minutesAwake=48, 
      type=stages, 
      isMainSleep=true, 
      duration=17460000, 
      minutesToFallAsleep=0, 
      minutesAfterWakeup=19, 
      dateOfSleep=2019-03-07, 
      timeInBed=291, 
      logId=2.1480634971E10, 
      startTime=2019-03-07T01:15:00.000, 
      endTime=2019-03-07T06:06:30.000, 
      levels={
        summary={
          deep={minutes=34, count=2, thirtyDayAvgMinutes=52}, 
          wake={minutes=48, count=21, thirtyDayAvgMinutes=62}, 
          light={minutes=169, count=17, thirtyDayAvgMinutes=231}, 
          rem={minutes=40, count=6, thirtyDayAvgMinutes=53}
        }, 
        shortData=[
          {dateTime=2019-03-07T01:38:30.000, seconds=30, level=wake}, 
          {dateTime=2019-03-07T01:47:30.000, seconds=90, level=wake}, 
          {dateTime=2019-03-07T02:10:00.000, seconds=120, level=wake}, 
          {dateTime=2019-03-07T02:14:30.000, seconds=60, level=wake}, 
          {dateTime=2019-03-07T02:19:00.000, seconds=60, level=wake}, 
          {dateTime=2019-03-07T02:27:00.000, seconds=150, level=wake}, 
          {dateTime=2019-03-07T02:31:00.000, seconds=30, level=wake}, 
          {dateTime=2019-03-07T02:34:30.000, seconds=60, level=wake}, 
          {dateTime=2019-03-07T03:35:00.000, seconds=30, level=wake}, 
          {dateTime=2019-03-07T03:40:30.000, seconds=90, level=wake}, 
          {dateTime=2019-03-07T03:44:00.000, seconds=30, level=wake}, 
          {dateTime=2019-03-07T03:47:30.000, seconds=30, level=wake}, 
          {dateTime=2019-03-07T03:55:30.000, seconds=30, level=wake}, 
          {dateTime=2019-03-07T04:19:00.000, seconds=30, level=wake}, 
          {dateTime=2019-03-07T04:21:00.000, seconds=90, level=wake}, 
          {dateTime=2019-03-07T05:02:00.000, seconds=60, level=wake}, 
          {dateTime=2019-03-07T05:07:00.000, seconds=90, level=wake}
        ], 
        data=[
          {dateTime=2019-03-07T01:15:00.000, seconds=30, level=wake}, 
          {dateTime=2019-03-07T01:15:30.000, seconds=2280, level=light}, 
          {dateTime=2019-03-07T01:53:30.000, seconds=1110, level=deep}, 
          {dateTime=2019-03-07T02:12:00.000, seconds=4110, level=light}, 
          {dateTime=2019-03-07T03:20:30.000, seconds=1650, level=rem}, 
          {dateTime=2019-03-07T03:48:00.000, seconds=960, level=light}, 
          {dateTime=2019-03-07T04:04:00.000, seconds=990, level=rem}, 
          {dateTime=2019-03-07T04:20:30.000, seconds=1440, level=light}, 
          {dateTime=2019-03-07T04:44:30.000, seconds=1110, level=deep}, 
          {dateTime=2019-03-07T05:03:00.000, seconds=1710, level=light}, 
          {dateTime=2019-03-07T05:31:30.000, seconds=360, level=wake}, 
          {dateTime=2019-03-07T05:37:30.000, seconds=240, level=light}, 
          {dateTime=2019-03-07T05:41:30.000, seconds=840, level=wake}, 
          {dateTime=2019-03-07T05:55:30.000, seconds=240, level=light}, 
          {dateTime=2019-03-07T05:59:30.000, seconds=420, level=wake}
        ]
      }
    }
  ], 
  summary={
    totalMinutesAsleep=243, 
    totalTimeInBed=291, 
    stages={deep=34, wake=48, light=169, rem=40}, 
    totalSleepRecords=1
  }
}

*/
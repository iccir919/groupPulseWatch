/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  getService().reset();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Profile');
  sheet.getRange('B9').activate();
  sheet.getActiveRangeList().setBackground('#FFFFFF');
  
  // clear out the matches and output sheets
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2,2,lastRow-1,1).clearContent();
  }
}

/**
 * Configures the service.
 */
function getService() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Profile');
  var CLIENT_ID = sheet.getRange(3,2).getValue();
  var CLIENT_SECRET = sheet.getRange(4,2).getValue();
  return OAuth2.createService('FitBit')
      // Set the endpoint URLs.
      .setAuthorizationBaseUrl('https://www.fitbit.com/oauth2/authorize')
      .setTokenUrl('https://api.fitbit.com/oauth2/token')

      // Set the client ID and secret.
      .setClientId(CLIENT_ID)
      .setClientSecret(CLIENT_SECRET)

      // Set the name of the callback function that should be invoked to
      // complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scope and additional headers required by the FitBit API.
      .setScope('profile heartrate sleep')
      .setTokenHeaders({
        'Authorization': 'Basic ' +
            Utilities.base64Encode(CLIENT_ID + ':' + CLIENT_SECRET)
      });
}

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService();
  var isAuthorized = service.handleCallback(request);
  
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function checkStatus() {
  // set up the service
  var service = getService();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Profile');
  
  if (service.hasAccess()) {
    sheet.getRange('B9').activate();
    sheet.getActiveRangeList().setBackground('#6aa84f');
  } else {
    sheet.getRange('B9').activate();
    sheet.getActiveRangeList().setBackground('#cc0000');  
  }
}


/**
 * Displays the redirect URI to register.
 */
function displayRedirectUri() {
  var service = getService();
  var redirectUri = service.getRedirectUri();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Profile');
  sheet.getRange('B6').clearContent().setValue(redirectUri);  
}

/**
 * Displays the URI for authentication
 */
function displayAuthenticationUri() {
  // open this url to gain authorization from fitBit
  var service = getService();
  var authorizationUrl = service.getAuthorizationUrl();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Profile');
  sheet.getRange('B7').clearContent().setValue(authorizationUrl);
}



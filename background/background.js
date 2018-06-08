/*-------------------- GLOBAL VARIABLES ------------------------*/
// settings - global settings
// authTimer - contains a timer for ajax update token function
/*--------------------------------------------------------------*/

/*-------------------- FUNCTIONS INIT ON START ------------------------*/
// initializing functions that need to be started when browser is loaded
/*--------------------------------------------------------------*/

/* -------------------- GET TRANSLATIONS FROM FIREBASE ------------------------- */
// getTranslations() - send request to firebase and when get response save translations to storage (setStoreage())
// setStoreage(data) - save data to chrome extension storage
// ** data = object with translations
/*--------------------------------------------------------------*/
// checkAuth() - set global variable settings.isAuth on start (true/false)
// updateToken() - send request with refreshToken, and save new token when receives response (saveUser())
// checkAuthTimeout() - setTimeout to updateToken() function
// saveUser(info) - save refreshed data from updateToken()
// ** info = received object with new Token, Refresh token, and token expiration time
/* -------------------- AUTHENTIFICATION ------------------------- */

/* ---------------------------- MESSAGING ----------------------------*/
// MESSAGES LISTENER
// ** SETTINGS_REQUEST send settings to extension popup by request or logout if data set to "logout"
// LOGIN
// ** receive message from extension popup when user logged in. Save data to global settings object and start timer to reauth
// WORD_SAVED
// ** receive message from content page when new word saved and update word data with name of firebase
// ** that's needed for easy deletion
/*--------------------------------------------------------------*/


/*-------------------- GLOBAL VARIABLES ------------------------*/
  let settings = {
    isAuth: false
  }
  let authTimer;

/*-------------------- FUNCTIONS INIT ON START ------------------------*/
  checkAuth();
  if (settings.isAuth) {
    getTranslations();
    checkAuthTimeout();
  }

/* -------------------- GET TRANSLATIONS FROM FIREBASE ------------------------- */
  /* GET TRANSLATIONS FUNCTION */
  function getTranslations() {
    const xhr = new XMLHttpRequest();

    const url = 'https://remember-the-word-8fd71.firebaseio.com/translations.json?auth=' + settings.userInfo.idToken + '&orderBy="userId"&equalTo="' + settings.userInfo.localId + '"';

    xhr.open('GET', url, true);
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
        alert(xhr.status + ': ' + xhr.statusText);
      } else {
        setStoreage(JSON.parse(xhr.responseText));
      }
    }
  }

  /* SAVE DATA TO STORAGE AND SEND MESSAGE TO EXTENTION POPUP */
  function setStoreage(data) {
    chrome.storage.local.set({memorizing: data});
    chrome.runtime.sendMessage({
      msg: 'TRANSLATIONS_RECEIVED'
    });
  }

/* -------------------- AUTHENTIFICATION ------------------------- */
  /* SET GLOBAL VARIABLE AUTH ON START */
  function checkAuth() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo) {
      settings.userInfo = {...userInfo}

      if (settings.userInfo.idToken) {
        settings.isAuth = true;
      }
    }
  }

  /* AJAX UPDATE TOKEN FUNCTION */
  function updateToken() {

    const xhr = new XMLHttpRequest();

    let url = 'https://securetoken.googleapis.com/v1/token?key=AIzaSyD3t0fb3r3wPpByekL27K5lgUAnL2NBw6I&grant_type=refresh_token&refresh_token=' + settings.userInfo.refreshToken;

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();

    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;
      if (this.status != 200) {
        console.log(this.status + ': ' + this.statusText);
        return;
      }

      saveUser(JSON.parse(xhr.responseText));
    }
  }

  /* CREATE TIMEOUT TO REAUTH WHEN FIREBASE TOKEN TIME ENDS */
  function checkAuthTimeout() {
    if (!settings.isAuth) return;

    let expTime = (new Date(settings.userInfo.expiresIn).getTime() - new Date().getTime());

    authTimer = setTimeout(() => {
      updateToken();
    }, expTime);
  }

  /* SAVE USER INFO TO LOCALSTORAGE AND GLOBAL OBJECT */
  function saveUser(info) {

    settings.userInfo.expiresIn = new Date(new Date().getTime() + info.expires_in * 1000);
    settings.userInfo.idToken = info.id_token;
    settings.userInfo.refreshToken = info.refresh_token;
    localStorage.setItem('userInfo', JSON.stringify(settings.userInfo));
    checkAuthTimeout();
  }

/* ---------------------------- MESSAGING ----------------------------*/
  /* MESSAGES LISTENER */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.msg === 'SETTINGS_REQUEST') {
      if (request.data && request.data !== 'logout') {
        settings.userInfo = request.data;
        settings.isAuth = true;
        getTranslations();
      } else if (request.data && request.data === 'logout') {
        delete settings.userInfo;
        settings.isAuth = false;
        clearTimeout(authTimer);
      }
      sendResponse(settings);
    }
    if (request.msg === 'LOGIN') {
      settings.userInfo = request.data;
      checkAuthTimeout();
    }
    if (request.msg === 'REQUEST_TRANSLATIONS') {
      getTranslations();
    }
    if (request.msg === 'WORD_SAVED') {
      chrome.storage.local.get(['memorizing'], function(result) {
        const newMemorizing = {...result.memorizing}
        newMemorizing[request.name] = {...request.data};
        console.log(newMemorizing);
        setStoreage(newMemorizing);
      });
    }
  });
$(function() {
/*--------------------SHOW DICTIONARY------------------------*/
// Show/hide dictionary block if present
/*------------------------------------------------------------*/
/*--------------------GET TRANSLATIONS------------------------*/
// Get translations from server and call the createResultTable function on success
/*------------------------------------------------------------*/
/*--------------------CREATE RESULT TABLE------------------------*/
// Create structure of results
/*------------------------------------------------------------*/
  let settings = {
    isAuth: false
  }
  let currentTranslate = {};
  let updateTimer;
  const spinner = $('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');

  // start updating timer
  getSettings(() => {
    updateTimer = setInterval(() => {
      getSettings();
    }, 3000);
    // create nav after getting isAuth
    createNav();
  });

  $('body').on('click', (e) => {
      if ($(e.target).hasClass('show-dictionary')) {
        showDictionary($(e.target));
      }
      if ($(e.target).hasClass('delete-word')) {
        deleteWord($(e.target).parent().attr('id'), );
      }
  });

  getTranslationsOnOpen();
  getTranslations();
  switchAuth();
  logout();


/*--------------------GET TRANSLATIONS------------------------*/
  function getTranslations() {
    $('.result').empty();
    $('.result').append(spinner);

    chrome.storage.local.get(['memorizing'], function(result) {
      createResultTable(result.memorizing);
    });
  }


  function createResultTable(translationsList) {
    $('.result').empty();

    if (!translationsList || !Object.keys(translationsList).length) {
      $('.result').append('<p class="empty">No words!</p>');
      return;
    }

    const table = $('<div class="table"></div>');
    const th = $('<div class="tr">' +
        '<div class="td th">Source</div>' +
        '<div class="td th">Translation</div>' +
      '</div>');
    table.append(th);

    for (key  in translationsList) {
      let tr = $('<div class="tr" id="' + key + '">' +
          '<div class="td">' + translationsList[key].translation.source + '</div>' +
          '<div class="td">' + translationsList[key].translation.translation + '</div>' +
        '</tdivr>');

      tr.append('<button class="delete-word">X</button>');

      if (translationsList[key].translation.variants) {
        tr.append('<button class="show-dictionary"></button>')
        tr.append('<div class="dictionary">' +
            translationsList[key].translation.variants.join(', ') +
          '</div>')
      }

      table.append(tr);
    }

    $('.result').append(table);
  }

/*--------------------CREATE RESULT TABLE------------------------*/
  let sourceToSave = '';
  let translationToSave = '';
  let variantsToSave = '';
  /* TRANSLATE WORD */
  $('body').on('click', '.translate-text-btn', (e) => {
    e.preventDefault();

    if (variantsToSave) {
      variantsToSave = variantsToSave.split(',').map((el) => {
        return el.trim();
      });
    }

    console.log(variantsToSave);

    let newTranslation = {
      translation: {
        source: sourceToSave,
        translation: translationToSave,
        variants: variantsToSave
      }
    }

    // const text = $('#translate-text').val();
    currentTranslate = {...newTranslation};
    saveTranslation(currentTranslate);
  });

  $('#sorce-text, #translation, #other-variants').on('input', function(e) {
    let target =e.target;

    switch(target.id.replace('#', '')) {
      case 'sorce-text':
        sourceToSave = target.value
        break;
      case 'translation':
        translationToSave = target.value;
        break;
      case 'other-variants':
        variantsToSave = target.value;
        break;
      default:
        return;
    }

    if (sourceToSave && translationToSave) {
      $('.translate-text-btn').removeAttr('disabled');
    } else {
      $('.translate-text-btn').attr('disabled', 'disabled');
    }
  });

  /* SAVE TRANSLATE */
  $('body').on('click', '.save-btn', e => {
    e.preventDefault();
    $(e.target).attr('disabled', 'disabled');
  });

  /* CLEAR CURRENT TRANSLATION */
  function clearTranslation() {
    sourceToSave = '';
    translationToSave = '';
    variantsToSave = '';
    $('.translate-text-btn').attr('disabled', 'disabled');
    currentTranslate = {};
  }

/*--------------------SHOW DICTIONARY------------------------*/
  function showDictionary(target) {
    target.parent().toggleClass('showed');
  }

/*--------------------DELETE WORD------------------------*/
  function deleteWord(target) {
    $.ajax({
      type: 'DELETE',
      url: 'https://remember-the-word-8fd71.firebaseio.com/translations/' + target + '.json?auth=' + settings.userInfo.idToken,
      success: result => {
        chrome.storage.local.get(['memorizing'], function(result) {
          delete result.memorizing[target];
          chrome.storage.local.set({memorizing: result.memorizing}, () => {
            $('#' + target).remove();
          });
        });
      }
    })
  }

/*------------------------------- CREATE NAV ---------------------------------*/
  /* CREATE NAVIGATION ITEMS */
  function createNav() {
    const nav = $('.navigation ul');
    nav.html('');

    if (settings.isAuth) {
      nav.append(
        '<li class="nav-link translate" data-target="#translate">Add</li>' +
        '<li class="nav-link words-list" data-target="#results">My Words</li>' +
        '<li class="logout">Logout</li>'
      );
      $('.nav-link.active').removeClass('active');
      $('.active-tab').removeClass('active-tab');
      $('.translate').addClass('active');
      $('#translate').addClass('active-tab');
    } else {
      nav.append('<li class="nav-link auth" data-target="#auth-form">Authentication</li>');
      $('.nav-link.active').removeClass('active');
      $('.active-tab').removeClass('active-tab');
      $('.auth').addClass('active');
      $('#auth-form').addClass('active-tab');
    }
  }

  /* NAVIGATION FUNCTION */
  $('body').on('click', '.nav-link', (e) => {
    const link = $(e.target);
    if (link.hasClass('active')) return;

    const target = $(link.attr('data-target'));
    if (target) {
      $('.nav-link.active').removeClass('active');
      link.addClass('active');
      $('.active-tab').removeClass('active-tab');
      target.addClass('active-tab');
    }
  });

/*------------------------------- AUTH ---------------------------------*/
  $('body').on('click', '.register, .login', (e) => {
    e.preventDefault();

    if ($(e.target).hasClass('register')) {
      sendAuthRequest();
    } else {
      sendAuthRequest('login');
    }
  });

  /* SEND AUTH REQUEST */
  function sendAuthRequest(isLogin) {
    let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyD3t0fb3r3wPpByekL27K5lgUAnL2NBw6I';
    let messageSuccess = 'Authorized!';

    if (isLogin) {
      url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyD3t0fb3r3wPpByekL27K5lgUAnL2NBw6I';
    }

    let data = {
      email: $('#login').val(),
      password: $('#password').val(),
      returnSecureToken: true
    }

    $('.auth-form').append(spinner);
    $('.auth-form input, .auth-form .btn').attr('disabled', 'disabled');
    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(result) {
        $('.auth-form input, .auth-form .btn').removeAttr('disabled');
        $('.auth-form .lds-ring').remove();
        saveUser(result);
        setMessage(messageSuccess);
        clearTranslation();
        $('#login').val('');
      },
      error: (err) => {
        $('.auth-form input, .auth-form .btn').removeAttr('disabled');
        $('.auth-form .lds-ring').remove();
        setMessage(err.responseJSON.error.code + ': ' + err.responseJSON.error.message, 'error');
      }
    });
  }

  /* SET MESSAGE */
  function setMessage(message, type) {
    let messageBox = $('.message');

    if (type === 'error') {
      messageBox.addClass('error');
    } else {
      messageBox.removeClass('error');
    }

    messageBox.text(message);
    messageBox.slideDown();

    setTimeout(() => {
      messageBox.slideUp(300, () => {
        messageBox.removeClass('error')
      });
    }, 3000);
  }

  /* SWITCH REGISTER/LOGIN */
  function switchAuth() {
    $('body').on('click', '.switch', (e) => {
      e.preventDefault();
      const btn = $('.auth-form .btn');
      const header = $('.auth-form h2');

      if (btn.hasClass('register')) {
        btn.removeClass('register').addClass('login');
        btn.text('Login');
        $(e.target).text('Switch to Sign Up');
        header.text('Login');
      } else {
        btn.removeClass('login').addClass('register');
        btn.text('Sign Up');
        $(e.target).text('Switch to Login');
        header.text('Sign Up');
      }
    });
  }

  /* SAVE USER */
  function saveUser(info) {

    let userInfo = {...info}
    userInfo.expiresIn = new Date(new Date().getTime() + info.expiresIn * 1000);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    getSettings(createNav, userInfo);
    sendMessageLogin(userInfo);
  }

  /* LOGOUt */
  function logout() {
    $('body').on('click', '.logout', (e) => {
      localStorage.removeItem('userInfo');
      chrome.storage.local.clear();
      getSettings(createNav, 'logout');
      sendMessageLogin();
      clearTranslation();
    });
  }

/*------------------------- MESSAGING ---------------------------*/
  chrome.runtime.onMessage.addListener(req => {
    if (req.msg === 'TRANSLATIONS_RECEIVED') {
      getTranslations();
    }
  });

  function sendMessageLogin(data) {

    chrome.runtime.sendMessage({
      msg: 'LOGIN',
      data: data
    });
  }

  function getSettings(callback, data) {
    chrome.runtime.sendMessage({
      msg: 'SETTINGS_REQUEST',
      data: data
    }, resp => {
      settings = resp;
      if (callback) {
        callback();
      }
    });
  }

  function getTranslationsOnOpen(callback) {
    chrome.runtime.sendMessage({
      msg: 'REQUEST_TRANSLATIONS'
    }, resp => {
      console.log(resp);
    });
  }

/*------------------------- SAVE TRANSLATION ---------------------------*/
  function saveTranslation() {
    currentTranslate.userId = settings.userInfo.localId;

    console.log(currentTranslate);

    $.ajax({
      type: 'POST',
      url: 'https://remember-the-word-8fd71.firebaseio.com/translations.json?auth=' + settings.userInfo.idToken,
      contentType: "application/json",
      data: JSON.stringify(currentTranslate),
      success: resp => {
        chrome.runtime.sendMessage({
          msg: 'WORD_SAVED',
          name: resp.name,
          data: currentTranslate
        });
        $('#translate-text').val('');
        clearTranslation();
        setMessage('Saved!')
      },
      error: err => {
        console.log(err);
        alert('Not saved! More info in console.');
      }
    });
  }
});
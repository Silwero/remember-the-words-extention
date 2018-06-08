$(function() {
/*---------------------------------------- EVENTS --------------------------------- */
// CLEAR APP UI ON CLICK OUT OFF APP
// DETECT SELECTED TEXT END SHOW BTN
/*----------------------------------------------------------------------------------- */

/*---------------------------------RQUESTS--------------------------------------- */
// GET TRANSLATE FROM GOOGLE
// SAVE TRANSLATE TO FIREBASE
/*----------------------------------------------------------------------------------- */

/*---------------------------------------- CLEAR UI --------------------------------- */
// CREATE SHADOW ROOT TO INCAPSULATE APP
// CREATE BTN
// CREATE POPUP
// CREATE CLOSE POPUP BTN
// DELETE UI
// STYLES
/*----------------------------------------------------------------------------------- */

let settings = {
  isAuth: false
}
let translate = {};
let memorizingApp = document.createElement('div');
createShadowRoot();


/*---------------------------------------- EVENTS --------------------------------- */
  /* CLEAR APP UI ON CLICK OUT OFF APP */
  $('body').on('mousedown', (e) => {
    if ($(e.target).is('#memorizingApp')) {
      return;
    }
    clearMemorizingElements();
  });

  /* DETECT SELECTED TEXT END SHOW BTN */
  $('body').on('mouseup', (e) => {
    if ($(e.target).is('#memorizingApp')) {
      return;
    }

    setTimeout(() => {
      let select = '';
      select = document.getSelection();
      let word = select.toString();

      if (word) {
        let x = 0;
        let y = 0;
        let range = select.getRangeAt(0).cloneRange();
        if (range.getClientRects().length>0){
          rect = range.getClientRects()[0];
          y = rect.bottom + $(window).scrollTop();
          x = rect.right;
        }

        // Create popup btn if needed
        if (!$(e.target).closest('#memorizingApp').length) {
          createBtn(x, y);
        }
      } else {
        clearMemorizingElements();
      }
    }, 1);
  });

/*---------------------------------------- REQUESTS --------------------------------- */

  /* GET TRANSLATE FROM GOOGLE */
  function getTranslate(text) {
    // START SPINNER
    translate.translation = {
      source: text.toLowerCase().trim()
    }
    createPopup();
  }

  /* SAVE TRANSLATE TO FIREBASE */
  function saveTranslate() {

    const xhr = new XMLHttpRequest();

    translate.userId = settings.userInfo.localId;
    xhr.open('POST', 'https://remember-the-word-8fd71.firebaseio.com/translations.json?auth=' + settings.userInfo.idToken, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(translate));

    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;
      if (this.status != 200) {
        console.log(this.status + ': ' + this.statusText);
        return;
      }

      chrome.runtime.sendMessage({
        msg: 'WORD_SAVED',
        name: JSON.parse(xhr.responseText).name,
        data: translate
      });
      alert('saved');
    }
  }

/*---------------------------------------- CREATE UI --------------------------------- */

  /* CREATE SHADOW ROOT TO INCAPSULATE APP */
  function createShadowRoot() {
    memorizingApp.setAttribute('id', 'memorizingApp');
    let shadow = memorizingApp.attachShadow({mode: 'open'});
    shadow.innerHTML = getStyles();

    $('body').append(memorizingApp);
  }

  /* CREATE BTN */
  function createBtn(left, top) {
    // inline svg logo
    let logo = '<svg class="memorizing-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612" width="512" height="512"><path d="M542.3 235.5c-6.6-76.8-52.1-147.6-115.8-190.1 -34.9-23.2-75.3-37.5-116.8-42.9C195.3-12.3 74.8 37.9 31.7 150.3c-37.1 96.6-0.5 192.5 65.9 265.6 24 26.4 27.3 76 27.3 109.4v67.8c0 10.4 8.4 18.8 18.8 18.8h245.3c9.9 0 18.1-7.7 18.8-17.6 0.9-13.3 2.4-25.1 2.4-25.1 5.1-22 23.9-39.6 63.8-33.2 41.8 6.7 68.2-5.8 70.6-33.6 0.8-9.2 1.3-87.7 1.3-87.7 2-1.1 15.1-3.7 34.2-8.1 14.9-3.4 20.1-21.8 9.3-32.6 -43.5-43-49.3-63-50.4-67.4C533.6 285.3 544.3 258 542.3 235.5zM461.3 209.9c-6 7.7-12.9 9.1-16.6 9.3 -1.2 0.1-2 1.2-1.7 2.4 1.9 6.6 3.8 24.7-28.7 31.8 -30.4 6.6-48.8 30.3-60.9 42.3 -9.2 9.2-21.7 13.5-34.2 16.3 -12.7 2.9-25.3 5.4-35.4 14.4 -10.6 9.5-25.5 62-28 71.1 -0.2 0.8-1 1.4-1.8 1.4h-15.6c-0.9 0-1.6-0.6-1.8-1.5l-7.6-35.8c-0.3-1.5-73.7 4.5-79.3-28.2 -0.2-1.1-1.4-1.9-2.5-1.5 -7.1 2.5-29.7 8.8-41.9-10.1 -8.7-13.4-6.4-26-5.2-30.3 0.3-0.9-0.2-1.8-1.1-2.2 -6.2-2.7-28.7-15.3-25.7-56.8 2.5-33.4 25.1-48.3 21.9-53.4 -9.1-14.8-1.2-39.4 17.5-44.9 0.8-0.2 1.3-0.9 1.4-1.7l0.8-8.7c2.6-30.7 43-50.2 70.5-37.4 1.1 0.5 2.3 0 2.7-1.1 3.4-10.9 10.4-13.9 12.2-14.9 8.5-4.8 19.6-4.2 28.4-0.6 0.7 0.3 1.5 0.1 2-0.4 2.5-2.7 12.8-11.2 29.7-11.2 17.4 0 26.3 8.5 29.4 10.8 0.6 0.4 1.3 0.5 2 0.2 3.9-2 18.2-8.4 32.6-3.5 10.8 3.7 17 13.6 18.9 17.2 0.4 0.8 1.3 1.2 2.1 1 5.1-1.2 22.9-4.6 37.8 2.1 15.8 7.1 20.7 17.4 21.9 20.9 0.3 0.7 0.9 1.2 1.7 1.2 3.4 0.1 12.9 1 18.7 5.9 10.3 8.7 9.3 15.5 8.1 18.4 -0.4 0.9 0 1.9 0.9 2.3 4.7 2.3 17.9 9.9 26.1 26.1C472 182.9 467.5 202 461.3 209.9z" fill="#374353"/></svg>';

    let btn = $('<div class="memorizing-popup-btn" pseudo="-memorizing-popup-btn" style="left: ' + left + 'px; top: ' + top + 'px;"><button>' +
      logo + '</button></div>');
    // button event
    btn.on('click', function() {
      let text = document.getSelection().toString();
      getTranslate(text);
    });

    memorizingApp.shadowRoot.appendChild(btn[0]);
  }

  /* CREATE POPUP */
  function createPopup() {
    // remove btn
    const translation = {...translate.translation};
    clearMemorizingElements();
    getSettings(() => {

      const text = {
        header: 'Translation',
        btnText: 'Save translation'
      }

      // popup wrapper
      const popup = $('<div class="memorizing-popup"></div>');
      // popup header
      const header = $('<h1>').text(text.header);
      // popup save btn
      const btn = $('<button class="save-btn">' + text.btnText + '</button>');
      btn.on('click', e => {
        if (translation.source && translation.translation) {
          translate.translation = translation;
          saveTranslate();
        }
      });

      // form
      const form = $('<form></form>');

      // Source text
      const sourceInput = $('<input type="text" value="' + translation.source + '" class="source" />');
      sourceInput.on('input', function(e) {
        translation.source = e.target.value.toLowerCase().trim();
        e.target.value = e.target.value.toLowerCase();
      });

      // translation text
      const translationInput = $('<input type="text" class="translate" />');
      translationInput.on('input', function(e) {
        translation.translation = e.target.value.toLowerCase().trim();
        e.target.value = e.target.value.toLowerCase();
      });

      // variants
      const variantsInput = $('<textarea class="variants"></textarea>');
      variantsInput.on('input', function(e) {
        let variants = e.target.value.split(',').map(function(el) {
          return el.toLowerCase().trim();
        });
        translation.variants = variants;
      });

      const row = $('<div class="row"></div>');

      row.append($('<div class="form-item"><label>Source text</label></div>').append(sourceInput));
      row.append($('<div class="form-item"><label>Translation</label></div>').append(translationInput));
      form.append(row);
      form.append($('<div class="form-item"><label>Other variants separated by commas</label></div>').append(variantsInput));

      if (!settings.isAuth) {
        popup.append('<p>Not logged in!</p>');
      } else {
        // popup close btn
        popup.append(createClosePopupBtn());
        popup.append(header);
        popup.append(form);
        if (settings.isAuth) {
          popup.append(btn);
        }
      }

      // add popup to shadow root
      memorizingApp.shadowRoot.appendChild(popup[0]);
      const height = $(popup[0]).height();
      if (height % 2) {
        $(popup[0]).height(height + 1);
      }
    });

  }

  /* CREATE CLOSE POPUP BTN */
  function createClosePopupBtn() {
    let btn = $('<button class="close">X</button>');
    btn.on('click', () => {
      clearMemorizingElements();
    });
    return btn;
  }

  /* DELETE UI */
  function clearMemorizingElements() {
    const btn = memorizingApp.shadowRoot.querySelector('.memorizing-popup-btn');
    const popup = memorizingApp.shadowRoot.querySelector('.memorizing-popup');
    translate = {};
    if (btn) {
      btn.remove();
    }
    if (popup) {
      popup.remove();
    }
  }

  /* STYLES */
  function getStyles() {
    return '<style>\
      * {box-sizing:border-box;}\
      .memorizing-popup-btn{position:absolute;z-index:999999999999999999999999999;margin-top:5px;transform:translateX(-100%)}\
      .memorizing-popup-btn button{overflow:hidden;width:30px;margin:0;padding:0;border:0;border-radius:7px;outline:0;cursor:pointer; background:#facc43;padding:3px;box-shadow:1px 1px 7px #000;}\
      .memorizing-popup-btn button:disabled{animation-name:spinner;animation-duration:.5s;animation-iteration-count:infinite;animation-direction:alternate}\
      .memorizing-logo{display:block;width:100%;height:100%;background:#facc43;}\
      @keyframes spinner{from{transform:scale(1)}to{transform:scale(.8)}}\
      .memorizing-popup{font-family:Arial;position:fixed;z-index:999999999999999999999999999;top:50%;left:50%;padding:15px;transform:translate(-50%,-50%);border-radius:7px;background:#facc43;box-shadow:0 0 14px 3px rgba(0,0,0,.5);min-width:500px;max-width:500px;max-height:90vh;overflow:auto;color:#374353;}\
      input[type="text"],textarea{width:100%;border:1px solid #374353;background:#facc43;box-shadow:inset 0 0 15px 2px rgba(55,67,83,.3);color:#374353;font-family:inherit;padding:.375rem .75rem;line-height:1.5;border-radius:.25rem;font-size:1rem;outline:none !important;backface-visibility:hidden;}\
      textarea{height: 100px;resize:none;}\
      input[type="text"]:focus,textarea:focus{border-style:dashed;box-shadow:none;}\
      .form-item {margin-bottom:1rem;}\
      .form-item label {display:block;margin-bottom:.5rem;font-size:1rem;line-height:1.5;}\
      .memorizing-popup h1{font-size:20px;text-align:center;margin-top:20px;margin-bottom:30px}\
      .close{position:absolute;right:10px;top:10px;background-color:transparent;color:#000;outline:0;border:0;cursor:pointer}\
      .row {margin:0 -15px;}\
      .row .form-item {float: left;width:50%;padding:0 15px;}\
      .save-btn{border:0;text-align:center;padding:.375rem .75rem;font-size:1rem;background:#374353;color:#fff;border-radius:.25rem;margin:20px auto 20px;display:block;cursor:pointer;width:100%;transition:all .3s;line-height:1.5;}\
      .save-btn:hover{background:#263242;}\
      .memorizing-popup::-webkit-scrollbar{width:5px;}\
      .memorizing-popup::-webkit-scrollbar-track{background:transparent;}\
      .memorizing-popup::-webkit-scrollbar-thumb{background-color:#374353;}\
    </style>'
  }

/*------------------------------- MESSAGING ---------------------------------*/
  function getSettings(callback) {
    chrome.runtime.sendMessage({
      msg: 'SETTINGS_REQUEST'
    }, resp => {
      settings = {...resp};
      if (callback) {
        callback();
      }
    });
  }
});
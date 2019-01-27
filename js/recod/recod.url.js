(function() {
  'use strict';

  // класс для работы с адресной строкой браузера
  var Url = function(){

    // установить адресную строку
    var setUrl = function (curLoc){
      try {
        history.pushState(null, null, curLoc);
        return;
      } catch(e) {}
      // location.hash = '#' + curLoc;
    }

    // считать адресную строку
    var getUrl = function (){
      return window.location.pathname + window.location.search;
    }

    // TODO: fix
    var cleanUrl = function (url){
      if(url[0] == '/'){
        return url.slice(1).split('?')[0].split('#')[0];
      } else {
        return url.split('?')[0].split('#')[0];
      }
    }

    var getURLParameter = function (name){
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }

    /*
    * Функция заменяет все БОЛЬШИЕ буквы на маленькие
    * удаляет все символы которые не допустимы в url (остаются 0-9 a-z)
    * заменяет все пробелы и дубляжи на _
    **/
    var convertStringToURLText = function (text){

      // todo: integration translate
      if(typeof transl === "function"){
        text = transl(text);
      }

      text = text
        .split('&').join(' and ') // .replace("&", "and") - not correct work!!!
        .toLowerCase()
        .replace(/[^0-9a-z\d\-\_\s]/gi,'') // удаляем весь мусор, который нам нахрен не сдался
        .replace(/[\s\-]+/ig, '_') // Удаляем всё дубяжи и пробелы на "_"
        .replace(/^[^0-9a-z\d]+/i, '') // Удаляем всё лишнее в начала
        .replace(/[^0-9a-z\d]+$/i, '') // Удаляем всё лишнее с конца

      return text;
    }


    return {
      get: getUrl,
      set: setUrl,
      cleanUrl: cleanUrl,
      getURLParameter: getURLParameter,
      convertStringToURLText: convertStringToURLText,
    };

  };

  Recod.add('Location', Location, {type: 'static'});

})();

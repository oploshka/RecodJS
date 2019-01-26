(function() {
  'use strict';

  var Cookie = function(){

    // set cookie
    var setCookie = function(name, value, options){

      options = options || {};
      options['path'] = "/";
      // options['domain'] = "";
      var expires = options.expires;

      if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
      }
      if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
      }

      value = encodeURIComponent(value);

      var updatedCookie = name + "=" + value;

      for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
          updatedCookie += "=" + propValue;
        }
      }

      document.cookie = updatedCookie;
    }

    // get cookie
    var getCookie = function (name){
      var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"  ));
      return matches ? decodeURIComponent(matches[1]) : '';
    }

    // delete cookie
    var delCookie = function (name){
      setCookie(name, "", { expires: -1});
    }

    return {get: getCookie, set: setCookie, del: delCookie};
  };

  Recod.add('Cookie', Cookie, {type: 'static'});
})();
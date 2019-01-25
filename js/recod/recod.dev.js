(function() {
  'use strict';

  var Dev = function(){

    function reloadStylesheets() {
      var queryString = '?reload=' + new Date().getTime();
      $('link[rel="stylesheet"]').each(function () {
        this.href = this.href.replace(/\?.*|$/, queryString);
      });
    }

    return {
      reloadStyle: reloadStylesheets,
    };
  };

  Recod.add('Dev', Dev, {type: 'static'});
})();
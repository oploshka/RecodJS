(function() {
  'use strict';

  // TODO: fix
  var Script = function () {
    var scriptInfo = {
      // scriptName: {status: $.Deferred(), loadUrl: '#'}
    };

    return {
      load: function (name) {
        scriptInfo[name].status.resolve(true);
      },
    }
  };

  Recod.add('Script', Script, {type: 'static'});

})();

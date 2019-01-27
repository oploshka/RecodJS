(function() {
  'use strict';

  var Helper = function(){

    var uniqueIdVal = 0;
    var generatorUniqueId = function () {
      uniqueIdVal++;
      return uniqueIdVal;
    }

    return {
      getUniqueId : generatorUniqueId
    };
  };

  // класс для работы с Cookie
  Recod.add('Helper', Helper, {type: 'static'});
})();
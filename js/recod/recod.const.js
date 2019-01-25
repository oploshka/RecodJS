(function() {
  'use strict';

  var Const = function () {
    var data = {};
    var setConst = function (name, value) {
      if(data.hasOwnProperty(name)){
        console.error('ERROR Const::set('+name+')', name);
        throw new Error('ERROR Const::set()');
      }
      data[name] = value;
    };
    var getConst = function (name) {
      if(!data.hasOwnProperty(name)){
        console.error('ERROR Const::get('+name+')', name);
        throw new Error('ERROR Const::get()');
      }
      return data[name];
    };

    return {
      set: setConst,
      get: getConst,
    }
  };

  Recod.add('Const', Const, {type: 'static'});
})();
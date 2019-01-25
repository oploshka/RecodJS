var Recod = (function () {

  'use strict';

  var self = {}
  var modules = {};

  var addModule = function (name, func, opt) {
    modules[name] = {
      function: func,
      option:{
        type: opt.type || 'class', // static | class
      }
    }

    Object.defineProperty(self, name, {
      get: function() {
        return getFunction(name);
      }
    });
  };

  var getFunction = function (name) {
    if(!modules.hasOwnProperty(name)){
      console.error('ERROR App::get('+name+')', name);
      return;
    }

    if(modules[name].option.type === 'static'){
      if(!modules[name].static){
        modules[name].static = modules[name].function();
      }

      return modules[name].static;
    }

    return modules[name].function;
  };

  self.add = addModule;
  self.func = getFunction;

  return self;

})();
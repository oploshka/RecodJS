(function() {
  'use strict';

  /*
   * Класс для реализации подписчиков на какое то событие
   * и запуска этих подписчиков
   **/
  var ListenerManager  = function (list) {

    var manager = {};
    for(var i = 0; i < list.length; i++){
      manager[list[i]] = Recod.Listener();
    }

    var addListener = function(type, _name, _function, _init, priority){

      if(arguments.length < 5){ priority = 100; }
      if(arguments.length < 4){ _init = false; }

      if( !manager[type] ){
        manager[type] = Recod.Listener();
      }
      manager[type].add( _name, _function, _init, priority);
    };

    var runListener = function(type, _data){
      if( !manager[type] ){
        console.error('ListenerManager.runListener not type: ', type);
        return;
      }
      manager[type].run(_data)
    };


    var stopListener = function(type){
      if( !manager[type] ){
        console.error('ListenerManager.stopListener not type: ', type);
        return;
      }
      manager[type].stop();
    };

    return {
      add: addListener,
      run: runListener,
      stop: stopListener,
    }
  }

  Recod.add('ListenerManager', ListenerManager, {type: 'class'});
})();
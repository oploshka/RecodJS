(function() {
  'use strict';

  /*
   * Класс для реализации подписчиков на какое то событие
   * и запуска этих подписчиков
   **/
  var Listener  = function () {

    var listenerStatus = 'WORK';
    var listenerName = {};
    var listenerSequence = [];
    var listenerData = null;

    var addListener = function(_name, _function, _init, priority){
      priority = priority || 100;
      var listenerId = listenerSequence.length;
      listenerSequence[listenerId] = {function: _function, priority: priority};
      listenerName[_name] = listenerId;
      if(_init){
        listenerSequence[listenerId](listenerData);
      }
    };

    var deleteListener = function(_name){
      // todo: ....
    };

    var runListener = function(_data){
      if(listenerStatus !== 'WORK'){ return; }
      if(listenerSequence.length === 0){ return; }
      listenerData = _data;

      // вычисляем минимальный приоритет
      var minPriority = listenerSequence[0].priority;
      for(var i = 1; listenerSequence.length > i; i++){
        if(minPriority > listenerSequence[i].priority){
          minPriority = listenerSequence[i].priority;
        }
      }

      //
      var nextPriority = false;
      do {
        if(nextPriority !== false){ minPriority = nextPriority;}
        nextPriority = false;
        for(var i = 0; i < listenerSequence.length; i++){
          if(listenerStatus !== 'WORK'){ break; }

          if(listenerSequence[i].priority > minPriority){
            if(nextPriority === false || nextPriority > listenerSequence[i].priority){
              nextPriority = listenerSequence[i].priority;
            }
            continue;
          }

          if(minPriority !== listenerSequence[i].priority){continue;}
          listenerSequence[i].function(listenerData);
          if(listenerStatus !== 'WORK'){ break; }
        }
      } while (nextPriority !== false);

      // listenerStatus = 'WORK';
    };


    var stopListener = function(){
      listenerStatus = 'STOP'
    };

    return {
      add: addListener,
      run: runListener,
      stop: stopListener,
    }
  };

  Recod.add('Listener', Listener, {type: 'class'});
})();
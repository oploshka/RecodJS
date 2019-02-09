(function() {
  'use strict';

  var Store = function(_data){

    function isObject(val) {
      if (val === null) { return false;}
      return (
      // (typeof val === 'function') ||
      (typeof val === 'object')
      ) && !(val instanceof Array);
    }

    if(!isObject(_data)){
      throw {
        message: 'Store(_data) -> data not is object.',
        code: 'ERROR_STORE_OBJ_DATA_NOT_OBJECT',
        debug: {data: _data},
      }
    }


    var _init = function(){
      recreateStore(_data);
    }

    var store = {};
    var storeData = {};

    var recreateStore = function(_storeData){
      setStoreData(_storeData);
      store = {
        listener: [],
        listenerNames: {},
      };
    };

    var getStoreData = function(){
      return storeData;
    }
    var setStoreData = function(_storeData){
      for (var key in storeData){
        delete storeData[key];
      }
      $.extend(storeData, _storeData);
    };
    var getStoreField = function (field) {
      if(!storeData.hasOwnProperty(field)){
        console.error('ERROR_STORE_GET_FIELD_UNDEFINED::' + field);
        throw 'ERROR_STORE_GET_FIELD_UNDEFINED';
      }
      return storeData[field];
    };
    var setStoreField = function (field, value) {
      storeData[field] = value;
    };

    var addListener = function(listenerName, hookFunction, hookInit){
      var listenerId = store.listener.length;
      store.listener[listenerId] = hookFunction;
      store.listenerNames[listenerName] = listenerId;
      if(hookInit){
        store.listener[listenerId](storeData);
      }
    };

    var eventStoreUpdate = function(){
      for(var i = 0; store.listener.length > i; i++){
        store.listener[i](storeData);
      }
    };

    _init();

    // TODO: add functional
    var eventUpdateRun = false;

    var eventStoreAutoUpdate = function(){
      if(!eventUpdateRun){ return; }
      eventUpdateRun = false;
      for(var i = 0; store.listener.length > i; i++){
        store.listener[i](storeData);
      }
    };
    var setData = function () {
      if(arguments.length == 1){
        eventUpdateRun = true;
        setStoreData(arguments[0]);
        setTimeout(eventStoreAutoUpdate,1)
      } else if(arguments.length == 2){
        eventUpdateRun = true;
        setStoreField(arguments[0], arguments[1]);
        setTimeout(eventStoreAutoUpdate,1)
      } else {
        console.error('ERROR_STORE_SET_ARGUMENTS_LENGTH');
        throw 'ERROR_STORE_SET_ARGUMENTS_LENGTH';
      }
    }

    var setDataSilent = function () {
      if(arguments.length == 1){
        setStoreData(arguments[0]);
      } else if(arguments.length == 2){
        setStoreField(arguments[0], arguments[1]);
      } else {
        console.error('ERROR_STORE_SET_ARGUMENTS_LENGTH');
        throw 'ERROR_STORE_SET_ARGUMENTS_LENGTH';
      }
    }
    var getData = function () {
      if(arguments.length == 0){
        return getStoreData();
      } else if(arguments.length == 1){
        return getStoreField(arguments[0]);
      } else {
        console.error('ERROR_STORE_GET_ARGUMENTS_LENGTH');
        throw 'ERROR_STORE_GET_ARGUMENTS_LENGTH'
      }
    }

    var issetField = function (name) {
      return storeData.hasOwnProperty(name);
    }

    return {
      // обьединить в одно целое getData и getField
      getData : getStoreData,
      setData : setStoreData,
      getField: getStoreField,
      setField: setStoreField,

      set: setData,
      setSilent: setDataSilent,
      get: getData,
      isset: issetField,

      addListener: addListener,
      eventUpdate: eventStoreUpdate,

      //  TODO: delete debug:
      storeData: storeData,
    };
  };

  Recod.add('Store', Store, {type: 'class'});
})();

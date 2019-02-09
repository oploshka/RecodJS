(function() {
  'use strict';

  /*
   * Функции для чтения обьекта по ключам массива
   **/
  var getObjectChild = function(obj, arr){
    var _arr = arr.slice(0);
    var reqChild = function (obj, arr) {
      if(arr.length === 0) { return obj;}
      if(obj.hasOwnProperty(arr[0])) {
        return reqChild(obj[arr[0]], arr.slice(1));
      } else {
        return {};
      }
    }
    return reqChild(obj, _arr)
  }
  /*
   * Функции для записи в обьект по ключам массива
   **/
  var setObjectChild = function(obj, val, arr){
    var reqChild = function (obj, val, arr) {
      if(arr.length === 1) { obj[arr[0]] = val; return; }
      if(!obj.hasOwnProperty(arr[0])) {
        obj[arr[0]] = {};
      }
      return reqChild(obj[arr[0]], val, arr.slice(1));
    }
    return reqChild(obj, val, arr.slice(0));
  }


  /*
   * BlockCollection содержит информацию по блокам для их обработки
   **/
  var BlockCollectionV4 = function () {

    var data = {};

    var addBlock = function (blockName, blockFunction) {

      // TODO: blockName isset??
      if(issetBlock(blockName)){
        console.error('BlockCollection block re-adding!!!', blockName );
        return;
      }

      data[blockName] = {
        function    : blockFunction,
        defaultView : function () { return {}; }, // гарантирует неизменность данных
        defaultData : function () { return {}; }, // гарантирует неизменность данных
        prepare: false,
      }

      // Доступно только при добавлении блока
      return {
        setDefaultView: function (defaultView) {
          // if(issetBlock(blockName)){
          //   console.error('BlockCollection block re-adding!!!', blockName );
          //   return;
          // }
          // TODO: defaultView is function
          data[blockName].defaultView = defaultView;
        },
        setDefaultData: function (defaultData) {
          // TODO: defaultData is function
          data[blockName].defaultData = defaultData;
        },
        setPrepare: function (prepareFunction) {
          // TODO: defaultData is function
          data[blockName].prepare = prepareFunction;
        }
      }
    }

    var issetBlock = function (blockName) {
      return data.hasOwnProperty(blockName);
    }

    return {
      add: addBlock,
      isset: issetBlock,
      get: function (blockName) {
        // TODO: blockName isset??
        return {
          function    : data[blockName].function,
          defaultView : data[blockName].defaultView,
          defaultData : data[blockName].defaultData,
          prepare     : data[blockName].prepare,
        }
      }
    }
  }

  /*
   * TODO
   **/
  var TemplateV4 = function(){
  }

  /*
   * TODO: rename storeView -> view, storeData -> state,
   **/
  var BlockV4 = function () {

    /*
     * block: {
     *   $block,
     *   blockName,
     *   storeView,
     *   storeData,
     *   listener
     * }
     **/
    var renderChildren = function (parentBlock, parentController, nesting) {
      var childrenRenderStatus = $.Deferred();

      var childrenBlock = parentBlock.$block.find('block');

      // block not children element
      if(childrenBlock.length === 0){
        childrenRenderStatus.resolve(parentBlock);
        return childrenRenderStatus;
      }

      // render block children element
      var childData = parentController.childData && parentController.childData() || {};
      var childView = parentController.childView && parentController.childView() || {};
      var childrenBlockRenderArray = [];
      for (var i = 0; i < childrenBlock.length; i++) {
        childrenBlockRenderArray[i] = $.Deferred();
      }

      var childStoreDataObj = {};
      var childStoreViewObj = {};
      var childListenerObj  = {};

      for(var i = 0; i < childrenBlock.length ; i++){
        (function ($parentBlock, childrenBlockStatus) {
          var blockName     = $parentBlock.attr('name');
          var blockStore    = $parentBlock.attr('store');
          // todo: delete
          if(!blockStore) {
            blockStore = $parentBlock.attr('id');
          }

          var blockStoreIds = blockStore.split('::');

          var info = {
            name: blockName,
            view: getObjectChild(childView, blockStoreIds),
            data: getObjectChild(childData, blockStoreIds),
            // listener: Recod.ListenerManager([]),
            nesting: nesting
          };
          Recod.BlockV4.render($parentBlock, info).then(function(_d){

            setObjectChild(childStoreViewObj, _d.storeView, blockStoreIds);
            setObjectChild(childStoreDataObj, _d.storeData, blockStoreIds);
            setObjectChild(childListenerObj , _d.listenerManager , blockStoreIds);

            childrenBlockStatus.resolve(true);
          });
        })($(childrenBlock[i]), childrenBlockRenderArray[i])
      }

      // Все дочернии блоки отрендерены и добавлены в DOM
      $.when.apply($, childrenBlockRenderArray).then(function () {

        parentController.childStoreViewObj = childStoreViewObj;
        parentController.childStoreDataObj = childStoreDataObj;
        parentController.childListenerObj = childListenerObj;

        parentController.initChildStoreView  && parentController.initChildStoreView(childStoreViewObj);
        parentController.initChildStoreData  && parentController.initChildStoreData(childStoreDataObj);
        parentController.initChildListener   && parentController.initChildListener(childListenerObj, childStoreDataObj);


        // Есть ли необходимость в инициализации  initChildStoreView и initChildStoreData ???
        // TODO: продумать единую инициализацию вложеных элементов
        // // Элементы доступны в self
        // parentController.initChild && parentController.initChild();

        childrenRenderStatus.resolve( parentBlock );
      });

      return childrenRenderStatus;
    }


    var blockInfoValidate = function (info) {
      if(!info || !info.hasOwnProperty('name') || !info.hasOwnProperty('view') || !info.hasOwnProperty('data') ){
        console.log('[BLOCK ERROR] not correct info object');
        console.log('[BLOCK ERROR DEBUG]', info);
        return false;
      }

      if(!Recod.BlockCollectionV4.isset(info.name)){
        console.log('[BLOCK ERROR] not init block template function: '+ info.name);
        console.log('[BLOCK ERROR DEBUG]', info);
        return false;
      }

      if(!Recod.Template.isset(info.name)){
        console.log('[BLOCK ERROR] not init block template: '+ info.name);
        console.log('[BLOCK ERROR DEBUG]', info);
        return false;
      }

      return true;
    };

    var blockFunctionRun = function(blockController, functionName, req){
      // default req = false
      if(req){
        // блок обязателен
        if(!blockController[functionName]){
          console.log('[BLOCK ERROR]  "'+ blockController.name +'" not require function: ' + functionName);
          console.log('[BLOCK ERROR DEBUG]', blockController, functionName);
          return ;
        }
      } else {
        // блок не обязателен
        if(!blockController[functionName]){
          return;
        }
      }

      try {
        blockController[functionName]();
      } catch (err) {
        console.log('[BLOCK ERROR]  "'+ blockController.name +'" not require function: ' + functionName);
        console.log('[BLOCK ERROR DEBUG]', blockController, functionName);
        console.log('[BLOCK ERROR INFO]', err);
      }
    }

    /*
     * $parentElement: jquery element
     * info: {
     *  name: "blockName",
     *  view: {},
     *  data: {},
     *  listener: null || listenerManager class
     * }
     */
    var render = function ($parentElement, info) {

      var nesting;
      if(info.hasOwnProperty('nesting')){
        nesting = Object.assign({}, info.nesting)
        nesting.level++;
      } else {

        nesting = {
          level:0,
          eventDomAdd: $.Deferred(),
        };

        $parentElement.empty();
        $parentElement.html('<div class="t-c th-c loadingBlock"><div>&#9711;</div></div>');
      }

      // var performance;
      // if(!info.hasOwnProperty('nesting')){
      //   performance = Date.now();
      // }

      if(!blockInfoValidate(info)){
        // TODO: fix;
        return;
      }

      // получаем обьект для работы с данным блоком
      var blockInfo = Recod.BlockCollectionV4.get(info.name);

      // Подготовка данных
      var block = {
        name: info.name,
        // view: {},
        // data: {},
      };

      // TODO: use defaultView and defaultData only function
      if (typeof blockInfo.defaultView === "function") {
        var obj = blockInfo.defaultView();
        block.view = $.extend(obj, info.view );
      } else {
        block.view = $.extend({}, blockInfo.defaultView, info.view );
      }

      if (typeof blockInfo.defaultData === "function") {
        var obj = blockInfo.defaultData();
        block.data = $.extend(obj, info.data );
      } else {
        block.data = $.extend({}, blockInfo.defaultData, info.data );
      }

      blockInfo.prepare && blockInfo.prepare(block);
      block.listenerManager = info.listenerManager || Recod.ListenerManager([]);

      //
      var blockDeferred = $.Deferred();



      // deferred error and local version fix
      setTimeout(function () {
        var templateTime = Date.now();
        Recod.Template.render(block.name, block.view).then(function(html){
          templateTime = Date.now() - templateTime;

          block.storeView = Recod.Store(block.view);
          block.storeData = Recod.Store(block.data);

          delete block.view;
          delete block.data;

          block.$block = $(html);

          // инициализируем контроллер для текущего блока передав данные доступные только для блока
          var blockController = blockInfo.function({
            name: block.name,
            storeView: {
              get: block.storeView.get,
              set: block.storeView.set,
              isset: block.storeView.isset,
              setSilent: block.storeView.setSilent,
            },
            storeData: {
              get: block.storeData.get,
              set: block.storeData.set,
              isset: block.storeData.isset,
              setSilent: block.storeData.setSilent,
            },
            eventRun: function (name, data) {
              block.listenerManager.run(name, data)
            },

            listenerManager: block.listenerManager,

            //  TODO: delete debug info:
            __view: block.storeView.storeData,
            __data: block.storeData.storeData,
          });

          // Инициализация элементов (по умолчанию происходит авто инициализация)
          blockController.el = {};
          if(blockController.initElement !== false){
            // TODO: разобраться с дубликатами
            block.$block.find('[data-jsName]').each(function( index ) {
              var $element = $( this )
              blockController.el['$' + $element.attr('data-jsName')] = $element;
            });
          }

          blockFunctionRun(blockController, 'initEvent');
          blockFunctionRun(blockController, 'init');
          blockFunctionRun(blockController, 'paint');

          if(blockController.repaint){
            block.storeData.addListener(block.name, function () { blockFunctionRun(blockController, 'repaint'); }, false);
          } else {
            block.storeData.addListener(block.name, function () { blockFunctionRun(blockController, 'paint'); }, false);
          }

          block.storeView.addListener(block.name, function (data) {
            $parentElement.empty();
            $parentElement.html('<div class="t-c">Loading...</div>');

            Recod.BlockV4.render($parentElement, {
              name: block.name,
              view: block.storeView.get(),
              data: block.storeData.get(),
              listenerManager: block.listenerManager,

              // nesting: nesting,
            });

          }, false);

          // инициализировать события
          if(blockController.initDomAdd){

            nesting.eventDomAdd.then(function () {
              blockController.initDomAdd();
            })
          }



          var childrenRenderStatus = renderChildren(block, blockController, nesting);
          childrenRenderStatus.then(
          function (blockChildrenUpdate) {
            // blockChildrenUpdate - это все тот же block!!!

            // if(nesting.level === 0){
            //   performance = Date.now() - performance;
            //   console.log('BlockV4 render time: ', performance);
            //   performance = Date.now();
            // }

            // TODO: test and fix
            // добавляем элемент в DOM
            $parentElement.empty();
            $parentElement.append(blockChildrenUpdate.$block);

            if(nesting.level === 0){
              nesting.eventDomAdd.resolve(true);
            }

            // Родительский элемент добавлен в DOM
            // if(nesting.level === 0){
            //   performance = Date.now() - performance;
            //   console.log('BlockV4 dom update time: ', performance);
            // }

            // blockDeferred.resolve(blockChildrenUpdate);
            // для манипуляции с элементом возвращаем обрезанный функционал
            blockDeferred.resolve({
              // $block: blockChildrenUpdate.$block, ???
              storeView: {
                get: blockChildrenUpdate.storeView.get,
                set: blockChildrenUpdate.storeView.set,
              },
              storeData: {
                get: blockChildrenUpdate.storeData.get,
                set: blockChildrenUpdate.storeData.set,
                addListener: blockChildrenUpdate.storeData.addListener,
              },
              listenerManager: blockChildrenUpdate.listenerManager,

              //  TODO: delete debug info:
              __view: blockChildrenUpdate.storeView.storeData,
              __data: blockChildrenUpdate.storeData.storeData,
            });

            // TODO add event dom add
          },
          function () {

            console.log('Error children block render!!!', block );
            blockDeferred.reject(block);
          });

        });
      }, 0);

      return blockDeferred;
    }


    return {
      render: render,
    }
  }

  Recod.add('BlockCollectionV4', BlockCollectionV4, {type: 'static'});
  Recod.add('BlockV4', BlockV4, {type: 'static'});


})();
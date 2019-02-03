(function() {
  'use strict';

  var Template = function(){

    var addTwigTemplate = function(templateName, templateHtml){
      twig({
        id: templateName,
        data: templateHtml,
        allowInlineIncludes: true
      });
    }

    var template = {};
    var addTemplateInfo = function (name, option) {
      // 'elementChildSelectCount',      {status: 'loadFromPage', }
      if(template.hasOwnProperty(name)){
        throw "ERROR Template::addTemplate(). Not unique name params. templateName = " + name;
      }
      template[name] = {
        loadType : option.loadType,
        load : 'create',
        html: $.Deferred(),
      }
      template[name].html.then(function (html) {
        addTwigTemplate(name, html);
      });
    };

    var loadTemplateHtml = function (name) {

      if(template[name].load == 'create'){
        template[name].load == 'load'

        switch(template[name].loadType){
          case 'fromPage':
            var $html = $("script[type='text/twig']#" + name);
            if($html.length !== 1){
              throw "TemplateRender::templateLoadFromPage error not template. templateName = " + name;
            }
            var html = $html.html();
            if(!html){
              throw "TemplateRender::templateLoadFromPage error empty template. templateName = " + name;
            }
            template[name].html.resolve(html);
            break;
        // TODO
        // case 'fromAjax':
        //   template[name].html.resolve('');

          default:
            template[name].load == 'create'
            throw "TemplateRender not correct templateInfo. templateName = " + name;
        }
      }

      return template[name].html;
    };



    var renderTwigTemplate = function(templateName, templateData){
      return twig({ ref: templateName }).render( templateData );
    }


    var renderTemplate = function (name, data) {
      if(!issetTemplate(name)){
        throw "ERROR Template::renderTemplate(). Not template. templateName = " + name;
      }
      var deferred = $.Deferred();
      loadTemplateHtml(name).then(function (html) {
        try {
          var res = renderTwigTemplate(name, data);
          deferred.resolve( res);
        } catch (err) {
          console.log(err);
        }
        // deferred.resolve( renderTwigTemplate(name, data) );
      });
      return deferred;
    }

    var issetTemplate = function (name) {
      return template.hasOwnProperty(name)
    }

    return {
      add: addTemplateInfo,
      render: renderTemplate,
      isset: issetTemplate,
    }
  }

  Recod.add('Template', Template, {type: 'static'});
})();
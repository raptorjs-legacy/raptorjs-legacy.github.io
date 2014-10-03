$rset("rhtml", "ui/buttons/Button", function(helpers, templateInfo) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      escapeXml = helpers.x,
      getTagHandler = helpers.t,
      raptor_templating_taglibs_widgets_WidgetTag = getTagHandler("raptor/templating/taglibs/widgets/WidgetTag");

  return function(data, context) {
    var id = data.id,
        tag = data.tag,
        rootAttrs = data.rootAttrs,
        label = data.label,
        href = data.href;

    function body() {
      return context.c(function() {
        if (label) {
          context.w(escapeXml(label));
        }
        else if (tag.invokeBody) {
          context.w(tag.invokeBody());
        }

        if (data.isDropdown) {
          context.w('&nbsp; <span class="caret"></span>');
        }
      });
    }

    if (href) {
      context.t(
        raptor_templating_taglibs_widgets_WidgetTag,
        {
          "jsClass": "ui/buttons/Button/ButtonWidget",
          "elId": id,
          "_cfg": data.widgetConfig
        },
        function(widget) {
          context.w('<a')
            .a("id", id)
            .a("href", href)
            .a(rootAttrs)
            .w('>')
            .w(body())
            .w('</a>');
        });
    }
    else {
      context.t(
        raptor_templating_taglibs_widgets_WidgetTag,
        {
          "jsClass": "ui/buttons/Button/ButtonWidget",
          "elId": id,
          "_cfg": data.widgetConfig
        },
        function(widget) {
          context.w('<button')
            .a("id", id)
            .a(rootAttrs)
            .w('>')
            .w(body())
            .w('</button>');
        });
    }
  }
});
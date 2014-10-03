$rset("rhtml", "ui/containers/Tabs", function(helpers, templateInfo) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      getTagHandler = helpers.t,
      raptor_templating_taglibs_widgets_WidgetTag = getTagHandler("raptor/templating/taglibs/widgets/WidgetTag"),
      forEach = helpers.f,
      escapeXmlAttr = helpers.xa,
      escapeXml = helpers.x;

  return function(data, context) {
    var id = data.id,
        tabs = data.tabs;

    context.t(
      raptor_templating_taglibs_widgets_WidgetTag,
      {
        "jsClass": "ui/containers/Tabs/TabsWidget",
        "elId": id,
        "_cfg": data.widgetConfig
      },
      function(widget) {
        context.w('<div')
          .a("id", id)
          .w(' class="tabs"><ul class="nav nav-tabs">');

        forEach(tabs, function(tab) {
          context.w('<li')
            .a("class", (tab.active ? "active" : ''))
            .w('><a href="#')
            .w(escapeXmlAttr(tab.id))
            .w('" data-toggle="tab">')
            .w(escapeXml(tab.title))
            .w('</a></li>');
        });

        context.w('</ul><div class="tab-content">');

        forEach(tabs, function(tab) {
          context.w('<div')
            .a("id", tab.id)
            .w(' class="tab-pane')
            .w(escapeXmlAttr((tab.active ? " active" : '')))
            .w('">');

          if (tab.content) {
            context.w(escapeXml(tab.content));
          }
          else {
            tab.invokeBody();

          }

          context.w('</div>');
        });

        context.w('</div></div>');
      });
  }
});
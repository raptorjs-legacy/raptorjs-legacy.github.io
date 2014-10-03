$rset("rhtml", "ui/buttons/SimpleButton", function(helpers, templateInfo) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      getTagHandler = helpers.t,
      raptor_templating_taglibs_widgets_WidgetTag = getTagHandler("raptor/templating/taglibs/widgets/WidgetTag"),
      escapeXml = helpers.x;

  return function(data, context) {
    var label = data.label;

    context.t(
      raptor_templating_taglibs_widgets_WidgetTag,
      {
        "jsClass": "ui/buttons/SimpleButton/SimpleButtonWidget",
        "_cfg": data.widgetConfig
      },
      function(widget) {
        context.w('<button type="button" class="simple-button"')
          .a("id", widget.elId())
          .w('>')
          .w(escapeXml(label))
          .w('</button>');
      });
  }
});
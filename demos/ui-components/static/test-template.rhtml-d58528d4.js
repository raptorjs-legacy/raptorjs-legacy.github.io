$rset("rhtml", "ui/demo/ComponentsDemo/test-template", function(helpers, templateInfo) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      raptor_templating_taglibs_widgets_WidgetFunctions = "raptor/templating/taglibs/widgets/WidgetFunctions",
      getTagHandler = helpers.t,
      ui_buttons_Button_ButtonRenderer = getTagHandler("ui/buttons/Button/ButtonRenderer"),
      ui_containers_Tabs_TabsRenderer = getTagHandler("ui/containers/Tabs/TabsRenderer"),
      ui_containers_Tabs_TabTag = getTagHandler("ui/containers/Tabs/TabTag");

  return function(data, context) {
    var _widgetArgs = context.f(raptor_templating_taglibs_widgets_WidgetFunctions,"widgetArgs"),
        _cleanupWidgetArgs = context.f(raptor_templating_taglibs_widgets_WidgetFunctions,"cleanupWidgetArgs");

    context.w('<div class="test-template"><h2>Buttons from template</h2>');
    _widgetArgs(null, null, [["click","sayHello",{"message": 'Hello World'}]])

    context.t(
      ui_buttons_Button_ButtonRenderer,
      {
        "label": "Say 'Hello World'",
        "variant": "primary"
      });
    _cleanupWidgetArgs();
    _widgetArgs(null, null, [["click","sayHello",{"message": 'Hello Universe'}]])

    context.t(
      ui_buttons_Button_ButtonRenderer,
      {
        "label": "Say 'Hello Universe'",
        "variant": "primary"
      });
    _cleanupWidgetArgs();

    context.w(' <h2>Tabs from template</h2>')
      .t(
        ui_containers_Tabs_TabsRenderer,
        {},
        function(_tabs) {
          context.t(
            ui_containers_Tabs_TabTag,
            {
              "title": "Home",
              "_tabs": _tabs
            },
            function() {
              context.w('Content for the Home tab');
            })
            .t(
              ui_containers_Tabs_TabTag,
              {
                "title": "Profile",
                "_tabs": _tabs
              },
              function() {
                context.w('Content for the Profile tab');
              });
        })
      .w('</div>');
  }
});
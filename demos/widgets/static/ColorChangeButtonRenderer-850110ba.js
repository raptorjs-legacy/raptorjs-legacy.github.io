define("ui/demo/ColorChangeButton/ColorChangeButtonRenderer",["raptor"],function(e,t){return{render:function(e,n){var r=e.colors;typeof r=="string"&&(r=r.split(/\s*,\s*/)),t("raptor/templating").render("ui/demo/ColorChangeButton",{label:e.label,widgetConfig:{colors:r}},n)}}});
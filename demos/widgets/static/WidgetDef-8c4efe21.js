define("raptor/widgets/WidgetDef",["raptor"],function(e,t,n,r){"use strict";var i=function(t){this.children=[],e.extend(this,t)};return i.prototype={a:function(){},addChild:function(e){this.children.push(e)},elId:function(e){return arguments.length===0?this.id:this.id+"-"+e}},i});
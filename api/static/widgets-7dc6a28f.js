define("raptor/widgets/WidgetDef",["raptor"],function(e,t,n,r){"use strict";var i=function(t){this.children=[],e.extend(this,t)};return i.prototype={a:function(){},addChild:function(e){this.children.push(e)},elId:function(e){return arguments.length===0?this.id:this.id+"-"+e}},i});
define("raptor/widgets/WidgetsContext",["raptor"],function(e,t,n,r){"use strict";var i=t("raptor/widgets/WidgetDef"),s=function(e){this.context=e,this.widgets=[],this.widgetStack=[]};return s.prototype={getWidgets:function(){return this.widgets},beginWidget:function(t,n){var r=this,s=r.widgetStack,o=s.length,u=o?s[o-1]:null;t.id||(t.id=r._nextWidgetId());if(t.assignedId&&!t.scope)throw e.createError(new Error('Widget with an assigned ID "'+t.assignedId+'" is not scoped within another widget.'));t.parent=u;var a=new i(t);u?u.addChild(a):r.widgets.push(a),s.push(a);try{n(a)}finally{s.splice(o,1)}},hasWidgets:function(){return this.widgets.length!==0},clearWidgets:function(){this.widgets=[],this.widgetStack=[]},_nextWidgetId:function(){return"w"+this.context.uniqueId()}},s});
define("raptor/widgets",function(e,t,n){"use strict";var r=e("raptor/widgets/WidgetsContext"),i="widgets";return{getWidgetsContext:function(e){var t=e.attributes;return t[i]||(t[i]=new r(e))}}});
define("raptor/pubsub",function(e,t,n){"use strict";var r=e("raptor/listeners"),i=define.Class({superclass:r.Message},function(){var e=function(e,t){r.Message.call(this,e,t),this.topic=e};return e.prototype={getTopic:function(){return this.topic}},e}),s=define.Class(function(){return{init:function(e){this.name=e,this.observable=r.createObservable()},publish:function(t,n){var i;return r.isMessage(t)?i=t:i=e("raptor/pubsub").createMessage(t,n),this.observable.publish(i),i},subscribe:function(e,t,n){return this.observable.subscribe(e,t,n)}}}),o={};return{channel:function(e){var t;return e?(t=o[e],t||(t=new s(e),o[e]=t)):t=new s,t},global:function(){return this.channel("global")},publish:function(e,t){var n=this.global();n.publish.apply(n,arguments)},subscribe:function(e,t,n){var r=this.global();return r.subscribe.apply(r,arguments)},createMessage:function(e,t){return new i(e,t)}}});
define("raptor/dom",function(e){"use strict";var t=function(e){if(typeof e=="string"){var t=e;e=document.getElementById(t);if(!e)throw raptor.createError(new Error('Target element not found: "'+t+'"'))}return e},n=function(t){var n=e.find("raptor/pubsub");n&&n.publish("dom/beforeRemove",{el:t})},r={forEachChildEl:function(e,t,n){r.forEachChild(e,t,n,1)},forEachChild:function(e,t,n,r){if(!e)return;var i=0,s=e.childNodes,o=s.length;for(;i<o;i++){var u=s[i];u&&(r==null||r==u.nodeType)&&t.call(n,u)}},detach:function(e){e=t(e),e.parentNode.removeChild(e)},appendTo:function(e,n){t(n).appendChild(t(e))},remove:function(e){e=t(e),n(e),e.parentNode&&e.parentNode.removeChild(e)},removeChildren:function(e){e=t(e),r.forEachChildEl(e,function(e){n(e)}),e.innerHTML=""},replace:function(e,r){r=t(r),n(r),r.parentNode.replaceChild(t(e),r)},replaceChildrenOf:function(e,i){i=t(i),r.forEachChildEl(i,function(e){n(e)}),i.innerHTML="",i.appendChild(t(e))},insertBefore:function(e,n){n=t(n),n.parentNode.insertBefore(t(e),n)},insertAfter:function(e,n){n=t(n),e=t(e);var r=n.nextSibling,i=n.parentNode;r?i.insertBefore(e,r):i.appendChild(e)},prependTo:function(e,n){n=t(n),n.insertBefore(t(e),n.firstChild||null)}};return r});
define.extend("raptor/widgets/WidgetsContext",function(e,t){"use strict";return{initWidgets:function(){var t=this.widgets,n=e("raptor/widgets");t.forEach(function(e){n.initWidget(e)}),this.clearWidgets()}}});
define.extend("raptor/widgets",function(e,t){"use strict";var n=e("raptor/logging").logger("raptor/widgets"),r={},i=e("raptor"),s=Array.isArray,o=i.createError,u=e("raptor/widgets/Widget"),a=function(e){var t={};return i.forEach(e,function(e){t[e[0]]={target:e[1],props:e[2]}},this),t},f=function(){};f.prototype={_remove:function(e,t){var n=this[t];s(n)?this[t]=n.filter(function(t){return t!==e}):delete this[t]},_add:function(e,t,n){var r=this[t];r?s(r)?r.push(e):this[t]=[r,e]:this[t]=n?[e]:e},getWidget:function(e){return this[e]},getWidgets:function(e){var t=this[e];return t?s(t)?t:[t]:[]}};var l=function(i,s,l,c,h,p,d,v){if(!e.exists(i))throw o(new Error('Unable to initialize widget of type "'+i+'". The class for the widget was not found.'));var m,g=e(i);n.debug('Creating widget of type "'+i+'" ('+s+")");if(g.initWidget)c.elId=s,c.events=p,m=g,g.onReady||(g.onReady=t.onReady);else{var y=function(){},b;y.prototype=b=g.prototype,m=new y,u.makeWidget(m,b),m.registerMessages(["beforeDestroy","destroy"],!1);var w=b.events||g.events;w&&m.registerMessages(w,!1),s&&(m._id=s,m.el=m.getEl()),g.getName||(g.getName=function(){return i}),b.constructor=g,u.legacy&&(m._parentWidget=d),p&&(m._events=a(p)),m.widgets=new f,r[s]=m;if(l&&h){var E;l.endsWith("[]")&&(l=l.slice(0,-2),E=!0),m._assignedId=l,m._scope=h;var S=r[h];if(!S)throw o(new Error("Parent scope not found: "+h));S.widgets._add(m,l,E),u.legacy&&(S[l]=m)}}return{widget:m,init:function(){var e=function(){try{m.initWidget?m.initWidget(c):g.call(m,c)}catch(e){var t='Unable to initialize widget of type "'+i+"'. Exception: "+e;if(!v)throw e;n.error(t,e)}};m.initBeforeOnDomReady===!0?e():m.onReady(e)}}};return e("raptor/pubsub").subscribe({"dom/beforeRemove":function(e){var n=e.el,r=t.get(n.id);r&&r.destroy({removeNode:!1,recursive:!0})},"raptor/renderer/renderedToDOM":function(e){var n=e.context,r=t.getWidgetsContext(n);r.initWidgets()}}),{initWidget:function(e){var t=l(e.type,e.id,e.assignedId,e.config,e.scope?e.scope.id:null,e.events);e.widget=t.widget,e.children.length&&e.children.forEach(this.initWidget,this),t.init()},_serverInit:function(e){var t=function(e,n){if(!e)return;var r=0,i=e.length;for(;r<i;r++){var s=e[r],o=s[0],u=s[1],a=s[2]||{},f=s[3],c=s[4],h=s[5]||{},p=s.slice(6);f===0&&(f=undefined),c===0&&(c=undefined),a===0&&(a=undefined);var d=l(o,u,c,a,f,h,n,1);p&&p.length&&t(p,d.widget),d.init()}};t(e)},get:function(e){return r[e]},_remove:function(e){delete r[e]}}}),$rwidgets=function(){require("raptor/widgets")._serverInit(require("raptor").arrayFromArguments(arguments))};
define("raptor/widgets/Widget",["raptor"],function(e,t){"use strict";var n=t("raptor/listeners"),r=t("raptor/dom"),i=function(e,s,o){var u={widget:e},a=e.getEl(),f=t("raptor/widgets"),l=e._assignedId;e.publish("beforeDestroy",u),e.__destroyed=!0;if(a){if(o){var c=function(e){r.forEachChildEl(e,function(e){if(e.id){var t=f.get(e.id);t&&i(t,!1,!1)}c(e)})};c(a)}s&&a.parentNode&&a.parentNode.removeChild(a)}f._remove(e._id);if(l){var h=f.get(e._scope);h&&h.widgets._remove(e,l)}e.publish("destroy",u),n.unsubscribeFromAll(e)},s,o=function(){};return o.makeWidget=function(e,t){if(!e._isWidget)for(var n in s)t.hasOwnProperty(n)||(t[n]=s[n])},o.prototype=s={_isWidget:!0,getObservable:function(){return this._observable||(this._observable=n.createObservable())},registerMessages:function(e,t){this.getObservable().registerMessages.apply(this,arguments)},publish:function(n,r){var i=this.getObservable();i.publish.apply(i,arguments);var s;this._events&&(s=this._events[n])&&(s.props&&(r=e.extend(r||{},s.props)),t("raptor/pubsub").publish(s.target,r))},subscribe:function(e,t,n){var r=this.getObservable();return r.subscribe.apply(r,arguments)},getElId:function(e){return e?this._id+"-"+e:this._id},getEl:function(e){return arguments.length===1?document.getElementById(this.getElId(e)):this.el||document.getElementById(this.getElId())},getWidget:function(e){return this.widgets.getWidget(e)},getWidgets:function(e){return this.widgets.getWidgets(e)},destroy:function(e){e=e||{},i(this,e.removeNode!==!1,e.recursive!==!1)},isDestroyed:function(){return this.__destroyed},_getRootEl:function(){var t=this.getEl();if(!t)throw e.createError(new Error("Root element missing for widget of type "+this.constructor.getName()));return t},rerender:function(n,r){var i=this.renderer,s=this.constructor.getName(),o=t("raptor/renderer"),u=this._getRootEl();i||(this.constructor.render?i=this.constructor:s.endsWith("Widget")&&(i=t.find(s.slice(0,-6)+"Renderer")));if(!i)throw e.createError(new Error("Renderer not found for widget "+s));return o.render(i,n,r).replace(u)},detach:function(){r.detach(this._getRootEl())},appendTo:function(e){r.appendTo(this._getRootEl(),e)},replace:function(e){r.replace(this._getRootEl(),e)},replaceChildrenOf:function(e){r.replaceChildrenOf(this._getRootEl(),e)},insertBefore:function(e){r.insertBefore(this._getRootEl(),e)},insertAfter:function(e){r.insertAfter(this._getRootEl(),e)},prependTo:function(e){r.prependTo(this._getRootEl(),e)}},s.on=s.subscribe,s.elId=s.getElId,o});
define.extend("raptor/widgets",function(e){"use strict";return{onReady:function(e,t){$(function(){e.call(t)})}}});
define.extend("raptor/widgets/Widget",function(e){"use strict";var t=e("raptor"),n=/\#(\w+)( .*)?/g,r=t.global;return{$:function(e){var t=arguments;if(t.length===1){if(typeof e=="function"){var i=this;$(function(){e.apply(i,t)})}else if(typeof e=="string"){var s=n.exec(e);n.lastIndex=0;if(s!=null){var o=s[1];return s[2]==null?$(this.getEl(o)):$("#"+this.getElId(o)+s[2])}var u=this.getEl();if(!u)throw new Error("Root element is not defined for widget");if(u)return $(e,u)}}else if(t.length===2){if(typeof t[1]=="string")return $(e,this.getEl(t[1]))}else if(t.length===0)return $(this.getEl());return $.apply(r,arguments)},onReady:function(e){var t=this,n=function(){e.call(t,t)};if($.isReady)return n();$(n())}}});
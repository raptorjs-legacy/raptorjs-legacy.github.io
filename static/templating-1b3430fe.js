define("raptor/strings/StringBuilder",function(e){"use strict";var t=function(){this.array=[],this.length=0};return t.prototype={append:function(e){return typeof e!="string"&&(e=e.toString()),this.array.push(e),this.length+=e.length,this},toString:function(){return this.array.join("")},clear:function(){return this.array=[],this.length=0,this}},t.prototype.write=t.prototype.append,t});
define("raptor/strings",["raptor"],function(e,t){"use strict";var n="",r=function(e){return e?e.trim():n},i=t("raptor/strings/StringBuilder"),s=/\$\{([A-Za-z0-9_\.]+)\}/g;return{compare:function(e,t){return e<t?-1:e>t?1:0},isEmpty:function(e){return e==null||r(e).length===0},length:function(e){return e==null?0:e.length},isString:function(e){return typeof e=="string"},equals:function(e,t,n){return n!==!1&&(e=r(e),t=r(t)),e==t},notEquals:function(e,t,n){return this.equals(e,t,n)===!1},trim:r,ltrim:function(e){return e?e.replace(/^\s\s*/,""):n},rtrim:function(e){return e?e.replace(/\s\s*$/,""):n},startsWith:function(e,t){return e==null?!1:e.startsWith(t)},endsWith:function(e,t){return e==null?!1:e.endsWith(t)},unicodeEncode:function(e){return"\\u"+("0000"+(+e.charCodeAt(0)).toString(16)).slice(-4)},merge:function(e,t){var n,r,i=[],o=0;s.lastIndex=0;while(n=s.exec(e))i.push(e.substring(o,n.index)),r=t[n[1]],i.push(r!==undefined?r:n[0]),o=s.lastIndex;return i.push(e.substring(o)),i.join("")},StringBuilder:i,createStringBuilder:function(){return new i}}});
define("raptor/xml/utils",function(e,t,n){"use strict";var r=/[&<]/,i=/[&<]/g,s=/[&<>\"\'\n]/,o=/[&<>\"\'\n]/g,u={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;","\n":"&#10;"};return{escapeXml:function(e){return typeof e=="string"&&r.test(e)?e.replace(i,function(e){return u[e]}):e},escapeXmlAttr:function(e){return typeof e=="string"&&s.test(e)?e.replace(o,function(e){return u[e]}):e}}});
define.Class("raptor/render-context/Context",["raptor"],function(e,t){"use strict";var n=e.forEachEntry,r=t("raptor/xml/utils").escapeXmlAttr,i=t("raptor/strings/StringBuilder"),s=e.createError,o=0,u=function(e,n){var r=t(e),i=r[n]||r.prototype&&r.prototype[n];if(!i)throw s(new Error('Helper function not found with name "'+n+'" in class "'+e+'"'));return i},a=function(e){this.writer=e,this.w=this.write,this.listeners={},this.attributes={}};a.classFunc=u;var f={getAttributes:function(){return this.attributes},getAttribute:function(e){return this.attributes[e]},uniqueId:function(){return"c"+o++},write:function(e){return e!==null&&e!==undefined&&(typeof e!="string"&&(e=e.toString()),this.writer.write(e)),this},getOutput:function(){return this.writer.toString()},captureString:function(e,t){var n=new i;return this.swapWriter(n,e,t),n.toString()},swapWriter:function(e,t,n){var r=this.writer;try{this.writer=e,t.call(n)}finally{this.writer=r}},createNestedContext:function(e){var n=t("raptor/render-context").createContext(e);return n.attributes=this.getAttributes(),n},invokeHandler:function(e,n){typeof e=="string"&&(e=t(e));var r=e.process||e.render;r.call(e,n,this)},getFunction:function(e,t){this._helpers||(this._helpers={});var n=e+":"+t,r=this._helpers[n];return r||(r=this._helpers[n]=u(e,t).bind(this)),r},getHelperObject:function(e){this._helpers||(this._helpers={});var n=this._helpers[e]||(this._helpers[e]=t(e));return new n(this)},isTagInput:function(e){return e&&e.hasOwnProperty("_tag")},renderTemplate:function(e,n){return t("raptor/templating").render(e,n,this),this},attr:function(e,t,n){if(t===null||t===!0)t="";else{if(t===undefined||t===!1||typeof t=="string"&&t.trim()==="")return this;t='="'+(n===!1?t:r(t))+'"'}return this.write(" "+e+t),this},attrs:function(e){return arguments.length!==1?this.attr.apply(this,arguments):e&&n(e,this.attr,this),this},t:function(t,n,r,i,s){return n||(n={}),n._tag=!0,r&&(n.invokeBody=r),i&&(n.dynamicAttributes=i),s&&e.extend(n,s),this.invokeHandler(t,n),this},c:function(e){var t=this.captureString(e);return{toString:function(){return t}}}};return f.a=f.attrs,f.f=f.getFunction,f.o=f.getHelperObject,f.i=f.renderTemplate,a.prototype=f,a});
define("raptor/render-context",function(e,t,n){"use strict";var r=e("raptor/strings/StringBuilder"),i=e("raptor/render-context/Context");return{createContext:function(e){return new i(e||new r)},Context:i}});
define("raptor/templating",["raptor"],function(e,t,n,r){"use strict";var i=function(e){return $rget("rhtml",e)},s={},o=Array.isArray,u=e.createError,a=t("raptor/strings/StringBuilder"),f=t("raptor/xml/utils").escapeXml,l=t("raptor/xml/utils").escapeXmlAttr,c=t("raptor/render-context"),h=c.Context,p=h.classFunc,d,v=function(e){var n=t(e),r;return n.process||n.render?r=n:(r=n.instance)||(r=n.instance=new n),r},m=function(e){return Array.isArray(e)===!0?e.length!==0:e},g={h:p,t:v,fv:function(e,t){if(!e)return;e.forEach||(e=[e]);var n=0,r=e.length,i={getLength:function(){return r},isLast:function(){return n===r-1},isFirst:function(){return n===0},getIndex:function(){return n}};for(;n<r;n++){var s=e[n];t(s||"",i)}},f:e.forEach,fl:function(e,t){e!=null&&(o(e)||(e=[e]),t(e,0,e.length))},fp:function(e,t){if(!e)return;for(var n in e)e.hasOwnProperty(n)&&t(n,e[n])},e:function(e){return!m(e)},ne:m,x:f,xa:l,nx:function(e){return{toString:function(){return e}}}};return d={templateFunc:function(e){var t=s[e];if(!t){t=i(e),!t&&this.findTemplate&&(this.findTemplate(e),t=i(e));if(t){var n=this.getTemplateInfo(e);t=t(g,n)}if(!t)throw u(new Error('Template not found with name "'+e+'"'));s[e]=t}return t},getTemplateInfo:function(e){return{name:e}},render:function(e,t,n){if(!n)throw u(new Error("Context is required"));var r=this.templateFunc(e);try{r(t||{},n)}catch(i){throw u(new Error('Unable to render template with name "'+e+'". Exception: '+i),i)}},renderToString:function(e,t,n){var r=new a;if(n===undefined)this.render(e,t,new h(r));else{var i=this;n.swapWriter(r,function(){i.render(e,t,n)})}return r.toString()},unload:function(e){delete s[e],$rset("rhtml",e,undefined)},getFunction:p,createContext:c.createContext,getHandler:v,helpers:g},d});
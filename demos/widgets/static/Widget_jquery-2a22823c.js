define.extend("raptor/widgets/Widget",function(e){"use strict";var t=e("raptor"),n=/\#(\w+)( .*)?/g,r=t.global;return{$:function(e){var t=arguments;if(t.length===1){if(typeof e=="function"){var i=this;$(function(){e.apply(i,t)})}else if(typeof e=="string"){var s=n.exec(e);n.lastIndex=0;if(s!=null){var o=s[1];return s[2]==null?$(this.getEl(o)):$("#"+this.getElId(o)+s[2])}var u=this.getEl();if(!u)throw new Error("Root element is not defined for widget");if(u)return $(e,u)}}else if(t.length===2){if(typeof t[1]=="string")return $(e,this.getEl(t[1]))}else if(t.length===0)return $(this.getEl());return $.apply(r,arguments)},onReady:function(e){var t=this,n=function(){e.call(t,t)};if($.isReady)return n();$(n())}}});
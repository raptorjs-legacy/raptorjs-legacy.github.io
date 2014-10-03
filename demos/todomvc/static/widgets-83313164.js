define('raptor/widgets/WidgetDef', ['raptor'], function(raptor, require, exports, module) {
    "use strict";

    var WidgetDef = function(config) {
        /*
        this.type = null;
        this.id = null;
        this.assignedId = null;
        this.config = null;
        this.scope = null;
        this.events = null;
        this.parent = null;
        */
        
        this.children = [];
        
        raptor.extend(this, config);
    };

    WidgetDef.prototype = {
        a: function() {

        },

        addChild: function(widgetDef) {
            this.children.push(widgetDef);
        },
        
        elId: function(name) {
            if (arguments.length === 0) {
                return this.id;
            }
            else {
                return this.id + "-" + name;
            }
        }
    };
    
    return WidgetDef;
});
define(
    'raptor/widgets/WidgetsContext', 
    ['raptor'],
    function(raptor, require, exports, module) {
        "use strict";
        
        var WidgetDef = require('raptor/widgets/WidgetDef');
        
        var WidgetsContext = function(context) {
            this.context = context;
            this.widgets = [];
            this.widgetStack = [];
        };

        WidgetsContext.prototype = {
            getWidgets: function() {
                return this.widgets;
            },
            
            beginWidget: function(config, callback) {
                
                var _this = this,
                    widgetStack = _this.widgetStack,
                    lastWidgetIndex = widgetStack.length,
                    parent = lastWidgetIndex ? widgetStack[lastWidgetIndex-1] : null;
                
                if (!config.id) {
                    config.id = _this._nextWidgetId();
                }
                
                if (config.assignedId && !config.scope) {
                    throw raptor.createError(new Error('Widget with an assigned ID "' + config.assignedId + '" is not scoped within another widget.'));
                }
                
                config.parent = parent;
                
                var widgetDef = new WidgetDef(config);
                
                if (parent) { //Check if it is a top-level widget
                    parent.addChild(widgetDef);
                }
                else {
                    _this.widgets.push(widgetDef);
                }
                
                widgetStack.push(widgetDef);

                try
                {
                    callback(widgetDef);    
                }
                finally {
                    widgetStack.splice(lastWidgetIndex, 1);
                }
            },
            
            hasWidgets: function() {
                return this.widgets.length !== 0;
            },

            clearWidgets: function() {
                this.widgets = [];
                this.widgetStack = [];
            },
            
            _nextWidgetId: function() {
                return 'w' + this.context.uniqueId();
            }
        };
        
        
        
        return WidgetsContext;
    });
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
* Module to manage the lifecycle of widgets
* 
*/
define('raptor/widgets', function(require, exports, module) {
    "use strict";

    var WidgetsContext = require('raptor/widgets/WidgetsContext'),
        WIDGET_CONTEXT_KEY = "widgets";
    
    return {
        
        getWidgetsContext: function(context) {
            var attributes = context.attributes;
            return attributes[WIDGET_CONTEXT_KEY] || (attributes[WIDGET_CONTEXT_KEY] = new WidgetsContext(context)); 
        }
    };
});
define('raptor/dom', function(require) {
    "use strict";

    var getNode = function(el) {
            if (typeof el === 'string') {
                var elId = el;
                el = document.getElementById(elId);
                if (!el) {
                    throw raptor.createError(new Error('Target element not found: "' + elId + '"'));
                }
            }
            return el;
        },
        _beforeRemove = function(referenceEl) {
            var pubsub = require.find('raptor/pubsub');
            if (pubsub) {
                pubsub.publish('dom/beforeRemove', { // NOTE: Give other modules a chance to gracefully cleanup after removing the old node
                    el: referenceEl
                });
            }
        };

    var dom = {
        forEachChildEl: function(node, callback, scope)
        {
            dom.forEachChild(node, callback, scope, 1);
        },

        /**
         *
         */
        forEachChild: function(node, callback, scope, nodeType)
        {
            if (!node) {
                return;
            }

            var i=0,
                childNodes = node.childNodes,
                len = childNodes.length;

            for (; i<len; i++)
            {
                var childNode = childNodes[i];
                if (childNode && (nodeType == null || nodeType == childNode.nodeType))
                {
                    callback.call(scope, childNode);
                }
            }
        },

        /**
         * This method removes a DOM node from the DOM tree by removing
         * it from its parent node.
         *
         * @param {Node|String} child The DOM node (or the ID of the DOM node) to detach from the DOM tree
         * @return {void}
         */
        detach: function(child) {
            child = getNode(child);
            child.parentNode.removeChild(child);
        },

        /**
         * Appends a DOM node as a child of another DOM node.
         *
         * @param  {Node|String} newChild The DOM node (or the ID of the DOM node) to append as a child
         * @param  {DOMElement|String} referenceParentEl The reference parent element
         * @return {void}
         */
        appendTo: function(newChild, referenceParentEl) {
            getNode(referenceParentEl).appendChild(getNode(newChild));
        },

        /**
         * Removes a node from the DOM
         *
         * @param  {Node|String} el the element to remove
         * @return {void}
         */
        remove: function(el) {
            el = getNode(el);
            _beforeRemove(el);
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        },

        /**
         * Removes a node from the DOM
         *
         * @param  {Node|String} el the element to remove
         * @return {void}
         */
        removeChildren: function(parentEl) {
            parentEl = getNode(parentEl);
            dom.forEachChildEl(parentEl, function(childEl) {
                _beforeRemove(childEl);
            });

            parentEl.innerHTML = "";
        },

        /**
         * Replaces a child DOM node with another DOM node
         *
         * @param  {Node|String} newChild The DOM node (or the ID of the DOM node) to use as a replacement
         * @param  {Node|String} replacedChild The reference child node that will be replaced by the new child
         * @return {void}
         */
        replace: function(newChild, replacedChild) {
            replacedChild = getNode(replacedChild);
            _beforeRemove(replacedChild);
            replacedChild.parentNode.replaceChild(getNode(newChild), replacedChild);
        },
        
        /**
         * Replaces the children of reference element with a new child
         *
         * @param  {Node|String} newChild The DOM node (or the ID of the DOM node) to use as a replacement
         * @param  {DOMElement|String} referenceParentEl The reference parent element
         * @return {void}
         */
        replaceChildrenOf: function(newChild, referenceParentEl) {
            referenceParentEl = getNode(referenceParentEl);
            dom.forEachChildEl(referenceParentEl, function(childEl) {
                _beforeRemove(childEl);
            });

            referenceParentEl.innerHTML = "";
            referenceParentEl.appendChild(getNode(newChild));
        },

        /**
         * Inserts a DOM node before a reference node (as a sibling).
         *
         * @param  {Node|String} newChild The DOM node (or the ID of the DOM node) to insert as a sibling
         * @param  {Node|String} referenceChild The reference child node
         * @return {void}
         */
        insertBefore: function(newChild, referenceChild) {
            referenceChild = getNode(referenceChild);
            referenceChild.parentNode.insertBefore(getNode(newChild), referenceChild);
        },

        /**
         * Inserts a DOM node after a reference node (as a sibling).
         *
         * @param  {Node|String} newChild The DOM node (or the ID of the DOM node) to insert as a sibling
         * @param  {Node|String} referenceChild The reference child node
         * @return {void}
         */
        insertAfter: function(newChild, referenceChild) {
            referenceChild = getNode(referenceChild);
            newChild = getNode(newChild);

            var nextSibling = referenceChild.nextSibling,
                parentNode = referenceChild.parentNode;

            if (nextSibling) {
                parentNode.insertBefore(newChild, nextSibling);
            }
            else {
                parentNode.appendChild(newChild);
            }
        },


        /**
         * Prepends a DOM node as a child of another DOM node.
         *
         * @param  {Node|String} newChild The DOM node (or the ID of the DOM node) to append as a child
         * @param  {DOMElement|String} referenceParentEl The reference parent element
         * @return {void}
         */
        prependTo: function(newChild, referenceParentEl) {
            referenceParentEl = getNode(referenceParentEl);
            referenceParentEl.insertBefore(getNode(newChild), referenceParentEl.firstChild || null);
        }
    };

    return dom;
});
define.extend('raptor/widgets/WidgetsContext', function(require, target) {
    "use strict";
    
    return {
        initWidgets: function() {
            var widgetDefs = this.widgets,
                widgets = require('raptor/widgets');

            widgetDefs.forEach(function(widgetDef) {
                widgets.initWidget(widgetDef);
            });

            this.clearWidgets();
        }
    };
});
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
* @extension Browser
* 
*/
define.extend('raptor/widgets', function(require, widgets) {
    "use strict";
    
    var logger = require('raptor/logging').logger('raptor/widgets'),
        widgetsById = {},
        raptor = require('raptor'),
        isArray = Array.isArray,
        createError = raptor.createError,
        Widget = require('raptor/widgets/Widget'),
        _convertEvents = function(events) {
            var convertedEvents = {};
            raptor.forEach(events, function(event) {
                convertedEvents[event[0]] = {
                    target: event[1],
                    props: event[2]
                };
            }, this);
            return convertedEvents;
        };
    
    /**
     * The Documentation groups up all widgets rendered in the same template documentat.
     * 
     * @class
     * @anonymous
     *  
     */
    var Document = function() {
    };
    
    /**
     * 
     */
    Document.prototype = {
        _remove: function(widget, id) {
            
            var existing = this[id];

            if (isArray(existing)) {
                this[id] = existing.filter(function(cur) {
                    return cur !== widget;
                });   
            }
            else {
                delete this[id];
            }
        },

        /**
         * 
         * @param widget
         * @param id
         */
        _add: function(widget, id, isTargetArray) {
            var existing = this[id];
            
            if (!existing) {
                this[id] = isTargetArray ? [widget] : widget;
            }
            else {
                if (isArray(existing)) {
                    existing.push(widget);    
                }
                else {
                    this[id] = [existing, widget];
                }
            }
        },
        
        /**
         * 
         * @param id
         * @returns
         */
        getWidget: function(id) {
            return this[id];
        },
        
        /**
         * 
         * @param id
         * @returns {Boolean}
         */
        getWidgets: function(id) {
            var widgets = this[id];
            return widgets ? 
                (isArray(widgets) ? widgets : [widgets]) :
                [];
        }
    };

    /**
     * Creates and registers a widget without initializing it.
     * 
     * @param   {String} type       The class type for the module (e.g. "some/namespace/MyWidget")
     * @param   {String} id         The ID for the widget. This should typically be the ID of the widget's root DOM element
     * @param   {String} assignedId The assigned ID by the widget that this widget is scoped within
     * @param   {Object} config     A user-provided configuration object for the widget being initialized
     * @param   {String} scope      The widget ID of the widget that the new widget is scoped within
     * @param   {Object} events     A mapping of widget events to pubsub messages/topics
     * @param   {Boolean} bubbleErrorsDisabled     If true, then each widget initialization error will be caught and 
     *                                             logged and other widgets will continue to be initialized. If false, 
     *                                             then errors will bubble up to the calling code and any subsequent widgets 
     *                                             will not be initialized. 
     * 
     * @return  {Function} A function that can be used to complete the initialization of the widget
     * @private
     */
    var _registerWidget = function(type, id, assignedId, config, scope, events, parent, bubbleErrorsDisabled) {
        if (!require.exists(type)) {
            throw createError(new Error('Unable to initialize widget of type "' + type + '". The class for the widget was not found.'));
        }

        var widget, // This will be the newly created widget instance of the provided type
            OriginalWidgetClass = require(type); // The user-provided constructor function

        logger.debug('Creating widget of type "' + type + '" (' + id + ')');
        
        if (OriginalWidgetClass.initWidget) { //Check if the Widget has an "initWidget" function that will do the initialization
            /*
             * Update the config with the information that 
             * the user "initWidget" function by need:
             */
            config.elId = id;
            config.events = events;

            widget = OriginalWidgetClass; //Use the provided object as the widget

            if (!OriginalWidgetClass.onReady) { //Add an onReady function that can be used to initialize the widget onReady
                OriginalWidgetClass.onReady = widgets.onReady;    
            }
        }
        else {
            /*
             * We have to create a temporary constructor function because we want
             * to delay the invocation of the user's constructor function until
             * we have had a chance to add all of the required special 
             * properties (_id, _assignedId, _events, etc.)
             */ 
            var WidgetClass = function() {}, 
                proto; //This will be a reference to the original prorotype

            WidgetClass.prototype = proto = OriginalWidgetClass.prototype;
            
            widget = new WidgetClass();
            
            Widget.makeWidget(widget, proto); //Will apply Widget mixins if the widget is not already a widget
            
            // Register events that allow widgets support:
            widget.registerMessages(['beforeDestroy', 'destroy'], false);
            
            // Check if the user's widget has an additional events defined
            var allowedEvents = proto.events || OriginalWidgetClass.events;

            if (allowedEvents) {
                widget.registerMessages(allowedEvents, false);
            }
            
            // Add required specified properties required by the Widget mixin methods
            if (id) {
                widget._id = id;
                widget.el = widget.getEl();
            }

            if (!OriginalWidgetClass.getName) {
                OriginalWidgetClass.getName = function() {
                    return type;
                };    
            }
            
            proto.constructor = OriginalWidgetClass;

            if (Widget.legacy) {
                widget._parentWidget = parent;
            }
            
            if (events) {
                widget._events = _convertEvents(events);
            }
            
            widget.widgets = new Document(); //This widget might have other widgets scoped within it 

            widgetsById[id] = widget; // Register the widget in a global lookup
            
            if (assignedId && scope) { // If the widget is scoped within another widget then register the widget in the scope
                var isTargetArray;

                if (assignedId.endsWith('[]')) { // When adding the widgets to a collection, an array can be forced by using a [] suffix for the assigned widget ID
                    assignedId = assignedId.slice(0, -2);
                    isTargetArray = true;
                }

                widget._assignedId = assignedId;
                widget._scope = scope;

                var containingWidget = widgetsById[scope];
                if (!containingWidget) {
                    throw createError(new Error('Parent scope not found: ' + scope));
                }

                containingWidget.widgets._add(
                    widget, 
                    assignedId, 
                    isTargetArray);

                if (Widget.legacy) {
                    containingWidget[assignedId] = widget;
                }
            }
        }

        return {
            widget : widget,
            init : function() {
                var _doInitWidget = function() {
                    try
                    {
                        if (widget.initWidget) {
                            widget.initWidget(config);
                        }
                        else {
                            OriginalWidgetClass.call(widget, config);
                        }
                    }
                    catch(e) {
                        var message = 'Unable to initialize widget of type "' + type + "'. Exception: " + e;
                        
                        // NOTE:
                        // For widgets rendered on the server we disable errors from bubbling to allow the page to possibly function
                        // in a partial state even if some of the widgets fail to initialize.
                        // For widgets rendered on the client we enable bubbling to make sure calling code is aware of the error.
                        if (bubbleErrorsDisabled) {
                            logger.error(message, e);
                        }
                        else {
                            throw e;
                        }
                    }
                };
    
                if (widget.initBeforeOnDomReady === true) {
                    _doInitWidget();
                }
                else {
                    widget.onReady(_doInitWidget);
                }
            }
        };
    };

    require('raptor/pubsub').subscribe({
        'dom/beforeRemove': function(eventArgs) {
            /*jshint strict:false */
            var el = eventArgs.el;
            var widget = widgets.get(el.id);
            if (widget) {
                widget.destroy({
                    removeNode: false,
                    recursive: true
                });
            }
        },

        'raptor/renderer/renderedToDOM': function(eventArgs) {
            /*jshint strict:false */
            var context = eventArgs.context,
                widgetsContext = widgets.getWidgetsContext(context);

            widgetsContext.initWidgets();
        }
    });

    return {

        initWidget: function(widgetDef) {
            var result  = _registerWidget(
                widgetDef.type, 
                widgetDef.id, 
                widgetDef.assignedId, 
                widgetDef.config, 
                widgetDef.scope ? widgetDef.scope.id : null, 
                widgetDef.events);

            widgetDef.widget = result.widget;
            
            if (widgetDef.children.length) {
                widgetDef.children.forEach(this.initWidget, this);
            }

            // Complete the initialization of this widget after all of the children have been initialized
            result.init();
        },

        /**
         * 
         * @param {...widgets} widgets An array of widget definitions
         * @returns {void}
         */
        _serverInit: function(widgetDefs) {
            var _initWidgets = function(widgetDefs, parent) {
                    if (!widgetDefs) {
                        return;
                    }

                    var i=0,
                        len = widgetDefs.length;
                    
                    for (; i<len; i++) {
                        
                        // Each widget def serialized from the server is encoded into a minimal
                        // array object that we need to decipher...
                        var widgetDef = widgetDefs[i], 
                            type = widgetDef[0],
                            id = widgetDef[1],
                            config = widgetDef[2] || {},
                            scope = widgetDef[3],
                            assignedId = widgetDef[4],
                            events = widgetDef[5] || {},
                            children = widgetDef.slice(6);
                        
                        if (scope === 0) {
                            scope = undefined;
                        }
                            
                        if (assignedId === 0) {
                            assignedId = undefined;
                        }
                        
                        if (config === 0) {
                            config = undefined;
                        }

                        
                        // First register the widget and get back a function to complete the initialization.
                        // The widget should not be initialized until all of its children have first been
                        // initialized.
                        var result = _registerWidget(type, id, assignedId, config, scope, events, parent, 1);


                        // Initialize all of the children
                        if (children && children.length) {
                            _initWidgets(children, result.widget);
                        }

                        // Now finish the initialization of the current widget now that the children have been initialized
                        result.init();
                    }

                };
                
            _initWidgets(widgetDefs);
        },
        
        /**
         * Gets a widget by widget ID
         * @param {string} id The ID of the widget
         * @returns {object} The widget instance
         */
        get: function(id) {
            return widgetsById[id];
        },

        _remove: function(id) {
            delete widgetsById[id];
        }
    };
});

$rwidgets = function() {
    /*jshint strict:false */
    require('raptor/widgets')._serverInit(require('raptor').arrayFromArguments(arguments));
};
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Mixins applied to the prototypes of all widget instances
 * @mixin
 *
 * @borrows raptor/listeners/Observable#publish as #publish
 * @borrows raptor/listeners/Observable#subscribe as #subscribe
 */
define(
    'raptor/widgets/Widget',
    ['raptor'],
    function(raptor, require) {
        "use strict";
        
        var listeners = require('raptor/listeners'),
            dom = require('raptor/dom'),
            _destroy = function(widget, removeNode, recursive) {
                var message = {
                        widget: widget
                    },
                    rootEl = widget.getEl(),
                    widgets = require('raptor/widgets'),
                    assignedId = widget._assignedId;
                
                widget.publish('beforeDestroy', message);
                
                widget.__destroyed = true;
                
                
                if (rootEl) {
                    if (recursive) {
                        var walkDOM = function(el) {
                            dom.forEachChildEl(el, function(childEl) {
                                if (childEl.id) {
                                    var descendentWidget = widgets.get(childEl.id);
                                    if (descendentWidget) {
                                        _destroy(descendentWidget, false, false);
                                    }
                                }
                                
                                walkDOM(childEl);
                            });
                        };

                        walkDOM(rootEl);
                    }
                    
                    if (removeNode && rootEl.parentNode) {
                        //Remove the widget's DOM nodes from the DOM tree if the root element is known
                        rootEl.parentNode.removeChild(rootEl);
                    }
                }
                
                widgets._remove(widget._id);

                if (assignedId) {
                    var scopeWidget = widgets.get(widget._scope);
                    if (scopeWidget) {
                        scopeWidget.widgets._remove(widget, assignedId);
                    }
                }

                widget.publish('destroy', message);

                // Have the widget unsubscribe from any messages that is currently subscribed to
                // Unsubscribe all messages after publishing "destroy" otherwise the widget might not get that event
                listeners.unsubscribeFromAll(widget);
            },
            widgetProto;
        
        var Widget = function() {

        };

        Widget.makeWidget = function(widget, proto) {
            if (!widget._isWidget) {
                for (var k in widgetProto) {
                    if (!proto.hasOwnProperty(k)) {
                        proto[k] = widgetProto[k];
                    }
                }
            }
        };

        Widget.prototype = widgetProto = {
            /**
             *
             */
            _isWidget: true,
            
            /**
             *
             * @returns
             */
            getObservable: function() {
                return this._observable || (this._observable = listeners.createObservable());
            },
            
            /**
             *
             * @param allowedMessages
             * @param createFuncs
             * @returns
             */
            registerMessages: function(allowedMessages, createFuncs) {
                this.getObservable().registerMessages.apply(this, arguments);
            },
            
            /**
             *
             * @param message
             * @param props
             * @returns
             */
            publish: function(message, props) {
                var ob = this.getObservable();
                ob.publish.apply(ob, arguments);
                var pubsubEvent;
                
                if (this._events && (pubsubEvent = this._events[message])) {
                    
                    if (pubsubEvent.props) {
                        props = raptor.extend(props || {}, pubsubEvent.props);
                    }
                    require('raptor/pubsub').publish(pubsubEvent.target, props);
                    
                }
            },
            
            /**
             *
             * @param message
             * @param callback
             * @param thisObj
             * @returns
             */
            subscribe: function(message, callback, thisObj) {
                var ob = this.getObservable();
                return ob.subscribe.apply(ob, arguments);
            },
            
            /**
             * Returns the DOM element ID corresponding to the provided
             * widget element ID.
             *
             * @param {string} widgetElId The widget element ID.
             * @returns {string} The DOM element ID corresponding tothe provided widget element ID
             */
            getElId: function(widgetElId) {
                return widgetElId ? this._id + "-" + widgetElId : this._id;
            },
    
            /**
             * Returns a raw DOM element for the given widget element ID. If no
             * widget element ID is provided then the root DOM node that the widget is bound to is returned.
             * @param widgetElId
             * @returns {DOMElement} The DOM element
             */
            getEl: function(widgetElId) {
                if (arguments.length === 1) {
                    return document.getElementById(this.getElId(widgetElId));
                } else {
                    return this.el || document.getElementById(this.getElId());
                }
            },
    
            /**
             *
             * Returns a single nested widget instance with the specified ID.
             *
             * NOTE: If multiple nested widgets exist with the specified ID then
             *       an exception will be thrown.
             *
             * @param nestedWidgetId
             * @returns {object} The child instance widget or null if one is not found.
             */
            getWidget: function(nestedWidgetId) {
                return this.widgets.getWidget(nestedWidgetId);
            },
            
            /**
             * Returns an array of nested widgets with the specified widget ID.
             * @param nestedWidgetId
             * @returns {array} An array of nested widgets (or an empty array if none are found)
             */
            getWidgets: function(nestedWidgetId) {
                return this.widgets.getWidgets(nestedWidgetId);
            },

            /**
             * Destroys a widget.
             *
             * If the root element is specified for the widget then the widget will
             * be removed from the DOM. In addition, all of the descendent widgets
             * will be destroyed as well.
             *
             * The "beforeDestroy" message will be published by the widget before
             * the widget is actually destroyed.
             *
             * The "destroy" message will be published after the widget
             * has been destroyed.
             *
             * NOTE: The widget will automatically be unsubscribed from all messages
             *       that it has subscribed to.
             *
             */
            destroy: function(options) {
                options = options || {};
                _destroy(this, options.removeNode !== false, options.recursive !== false);
            },
            
            /**
             * Returns true if this widget has been destroyed.
             *
             * A widget is considered destroyed if the "destroy" method
             * was invoked on the widget or one of its ancestor widgets.
             *
             * @returns {boolean} True if this widget has been destroyed. False, otherwise.
             */
            isDestroyed: function() {
                return this.__destroyed;
            },
            
            /**
             * This function will return the root element but unlike "getEl()" function, it will throw an error if there
             * is no root element.
             */
            _getRootEl : function() {
                var rootEl = this.getEl();
                if (!rootEl) {
                    throw raptor.createError(new Error("Root element missing for widget of type " + this.constructor.getName()));
                }
                return rootEl;
            },

            /**
             * Re-renders a widget by replacing the widget's existing root element with
             * the newly rendered HTML.
             *
             * <p>The widget instance is required to have a "renderer" property that defines
             * the renderer to use, or, if the name ends in "Widget" then the renderer
             * will be assumed to be of the name with "Widget" replaced with "Renderer"
             * (e.g. "ui/buttons/Button/ButtonWidget" --> "ui/buttons/Button/ButtonRenderer")
             *
             * @param  {Object} data The data to use as input to the renderer
             * @param  {raptor/render-context/Context} The render context (optional)
             *
             * @return {raptor/renderer/RenderResult}   Returns the resulting of re-rendering the component
             */
            rerender: function(data, context) {
                var renderer = this.renderer,
                    type = this.constructor.getName(),
                    componentRenderer = require('raptor/renderer'),
                    rootEl = this._getRootEl();

                if (!renderer) {
                    
                    if (this.constructor.render) {
                        renderer = this.constructor;
                    }
                    else {
                        if (type.endsWith("Widget")) {
                            renderer = require.find(type.slice(0, -6) + "Renderer");
                        }
                    }
                }

                if (!renderer) {
                    throw raptor.createError(new Error("Renderer not found for widget " + type));
                }

                return componentRenderer.render(renderer, data, context).replace(rootEl);
            },

            /**
             * This method removes the widget's root element from the DOM and saves a reference to
             * it so that the widget can be re-attached to the DOM later.
             *
             * After detaching widget from DOM, use one of the following methods to re-attach:
             * - appendTo
             * - replace
             * - replaceChildrenOf
             * - insertBefore
             * - insertAfter
             * - prependTo
             *
             * @throws Error if widget does not have a root element
             */
            detach: function() {
                dom.detach(this._getRootEl());
            },

            /**
             * Appends the widget's root element as a child of the target element.
             *
             * @param  {DOMElement|String} targetEl The target element
             * @return {void}
             */
            appendTo: function(targetEl) {
                dom.appendTo(this._getRootEl(), targetEl);
            },

            /**
             * Replaces the target element with the widget's root element.
             *
             * @param  {DOMElement|String} targetEl The target element
             * @return {void}
             */
            replace: function(targetEl) {
                dom.replace(this._getRootEl(), targetEl);
            },
            
            /**
             * Replaces the children of target element with the widget's root element.
             *
             * @param  {DOMElement|String} targetEl The target element
             * @return {void}
             */
            replaceChildrenOf: function(targetEl) {
                dom.replaceChildrenOf(this._getRootEl(), targetEl);
            },

            /**
             * Inserts the widget's root element before the target element (as a sibling).
             *
             * @param  {DOMElement|String} targetEl The target element
             * @return {void}
             */
            insertBefore: function(targetEl) {
                dom.insertBefore(this._getRootEl(), targetEl);
            },

            /**
             * Inserts the widget's root element after the target element (as a sibling).
             *
             * @param  {DOMElement|String} targetEl The target element
             * @return {void}
             */
            insertAfter: function(targetEl) {
                dom.insertAfter(this._getRootEl(), targetEl);
            },


            /**
             * Prepends the widget's root element as a child of the target element.
             *
             * @param  {DOMElement|String} targetEl The target element
             * @return {void}
             */
            prependTo: function(targetEl) {
                dom.prependTo(this._getRootEl(), targetEl);
            }

            /**
             * Subscribes to one or more events.
             *
             * This method is a synonym for the {@Link raptor/widgets/Widget.subscribe} method
             * to maintain backwards compatibility.
             * <b>This method will be removed in the future.</b>
             *
             * @function
             * @name on
             * @memberOf raptor/widgets/Widget
             */
        };

        widgetProto.on = widgetProto.subscribe;

        widgetProto.elId = widgetProto.getElId;

        return Widget;
    });
/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
* @extension Browser
* 
*/
define.extend('raptor/widgets', function(require) {
    "use strict";
    

    return {
        onReady: function(callback, thisObj) {
            $(function() {
                callback.call(thisObj);
            });
        }
    };
});

/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * jQuery extensions applied to all widgets
 * 
 * @extension jQuery
 */
define.extend('raptor/widgets/Widget', function(require) {
    "use strict";
    
    var raptor = require('raptor'),
        idRegExp = /\#(\w+)( .*)?/g,
        global = raptor.global;
    
    return {
        /**
         * 
         * @param arg Selector args
         * @returns The result of the jQuery invocation
         * @see <a href="http://api.jquery.com/category/selectors/">jQuery Selectors</a>
         */
        $: function(arg) {
            var args = arguments;
            
            if (args.length === 1)
            {
                //Handle an "ondomready" callback function
                if (typeof arg === 'function') {
                    
                    var _this = this;
                    
                    $(function() {
                        arg.apply(_this, args);
                    });
                }
                else if (typeof arg === 'string') {
    
                    var match = idRegExp.exec(arg);
                    idRegExp.lastIndex = 0; //Reset the search to 0 so the next call to exec will start from the beginning for the new string
                    
                    if (match != null) {
                        var widgetElId = match[1];
                        if (match[2] == null) {
                            return $(this.getEl(widgetElId));
                        }
                        else
                        {
                            return $("#" + this.getElId(widgetElId) + match[2]);
                        }
                    }
                    else
                    {
                        var rootEl = this.getEl();
                        if (!rootEl) {
                            throw new Error('Root element is not defined for widget');
                        }
                        if (rootEl) {
                            return $(arg, rootEl);
                        }
                    }
                }
            }
            else if (args.length === 2) {
                if (typeof args[1] === 'string') {
                    return $(arg, this.getEl(args[1]));
                }
            }
            else if (args.length === 0) {
                return $(this.getEl());
            }
            
            return $.apply(global, arguments);
        },
        
        /**
         * 
         * @param callback
         * @returns
         */
        onReady: function(callback) {
            var _this = this;
            var invokeCallback = function() {
                callback.call(_this, _this);
            };

            if ($.isReady) {
                return invokeCallback();
            }

            $(invokeCallback());
        }
    };
});
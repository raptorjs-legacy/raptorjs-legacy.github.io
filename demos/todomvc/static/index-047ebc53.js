define.Class(
    'raptor/templating/taglibs/widgets/WidgetTag',
    ['raptor'],
    function(raptor, require) {
        "use strict";
        
        var widgets = require('raptor/widgets');
        
        var DUMMY_WIDGET_DEF = {
            elId: function() {

            }
        };

        return {
            render: function(input, context) {
                var type = input.jsClass;
                var config = input.config || input._cfg;
                var widgetArgs = context.attributes.widgetArgs;
                var elId = input.elId;
                var scope = input.scope;
                var assignedId = input.assignedId;
                var events;

                if (widgetArgs) {
                    delete context.attributes.widgetArgs;
                    scope = scope || widgetArgs.scope;
                    assignedId = assignedId || widgetArgs.id;
                    events = widgetArgs.events;
                }

                if (!elId && input.hasOwnProperty('elId')) {
                    throw raptor.createError('Invalid widget ID for "' + type + '"');
                }
                
                var widgetsContext = widgets.getWidgetsContext(context);

                if (type) {
                    widgetsContext.beginWidget({
                        type: type,
                        id: elId,
                        assignedId: assignedId,
                        config: config,
                        scope: scope,
                        events: events,
                        createWidget: input.createWidget
                    }, function(widgetDef) {
                        input.invokeBody(widgetDef);
                    });
                } else {
                    input.invokeBody(DUMMY_WIDGET_DEF);
                }
            }
        };
    });
define(
    'raptor/templating/taglibs/widgets/WidgetFunctions',
    function(require) {
        "use strict";
        
        var widgets = require('raptor/widgets');
        
        return {
            widgetArgs: function(assignedId, scope, events) {
                this.attributes.widgetArgs = {
                    id: assignedId,
                    scope: scope,
                    events: events
                };
            },

            cleanupWidgetArgs: function() {
                delete this.attributes.widgetArgs;
            }
        };
    });
define('raptor/renderer/RenderResult', function(require) {
    "use strict";

    var dom = require('raptor/dom');

    var RenderResult = function(html, context) {
        this.html = html;
        this.context = context;
        this._node = undefined;
    };

    RenderResult.prototype = {
            
        getWidget : function() {
            if (!this.widgetDefs) {
                throw new Error('Cannot call getWidget() until after HTML fragment is added to DOM.');
            }
            return this.widgetDefs.length ? this.widgetDefs[0].widget : undefined;
        },

        /**
         * This method used to retrieve all or some of the widgets that were instantiated as a result of rendering.
         *
         * @param {Function} selector an optional function that should accept a widget argument
         *      and return true if the widget should be selected
         * @return {raptor/widgets/Widget[]} the array of widgets that matched the selector or
         *      all widgets if no selector was given
         */
        getWidgets: function(selector) {

            if (!this.widgetDefs) {
                throw new Error('Cannot call getWidgets() until after HTML fragment is added to DOM.');
            }
            
            var widgets,
                i;

            if (selector) {
                // use the selector to find the widgets that the caller wants
                widgets = [];
                for (i = 0; i < this.widgetDefs.length; i++) {
                    var widget = this.widgetDefs[i].widget;
                    if (selector(widget)) {
                        widgets.push(widget);
                    }
                }
            } else {
                // return all widgets
                widgets = new Array(this.widgetDefs.length);
                for (i = 0; i < this.widgetDefs.length; i++) {
                    widgets[i] = this.widgetDefs[i].widget;
                }
            }

            return widgets;
        },
        
        /**
         * Invoked after the rendered document fragment is inserted into the DOM.
         *
         * @return  {void}
         * @private
         */
        _afterInsert: function() {
            
            var widgets = require.find('raptor/widgets');
            if (widgets) {
                var widgetsContext = widgets.getWidgetsContext(this.context);
                this.widgetDefs = widgetsContext.widgets;
            }
            
            var pubsub = require.find('raptor/pubsub');
            if (pubsub) {
                pubsub.publish('raptor/renderer/renderedToDOM', {
                    node: this.getNode(),
                    context: this.context
                }); // NOTE: This will trigger widgets to be initialized if there were any
            }
            
            return this;
        },

        /**
         * Appends the rendered document fragment as a child of the reference element.
         *
         * @param  {DOMElement|String} referenceEl The reference element
         * @return {void}
         */
        appendTo: function(referenceEl) {
            dom.appendTo(this.getNode(), referenceEl);
            return this._afterInsert();
        },

        /**
         * Replaces the reference element with the rendered document fragment.
         *
         * @param  {DOMElement|String} referenceEl The reference element
         * @return {void}
         */
        replace: function(referenceEl) {
            dom.replace(this.getNode(), referenceEl);
            return this._afterInsert();
        },
        
        /**
         * Replaces the children of reference element with the rendered document fragment.
         *
         * @param  {DOMElement|String} referenceEl The reference element
         * @return {void}
         */
        replaceChildrenOf: function(referenceEl) {
            dom.replaceChildrenOf(this.getNode(), referenceEl);
            return this._afterInsert();
        },

        /**
         * Inserts the rendered document fragment before the reference element (as a sibling).
         *
         * @param  {DOMElement|String} referenceEl The reference element
         * @return {void}
         */
        insertBefore: function(referenceEl) {
            dom.insertBefore(this.getNode(), referenceEl);
            return this._afterInsert();
        },

        /**
         * Inserts the rendered document fragment after the reference element (as a sibling).
         *
         * @param  {DOMElement|String} referenceEl The reference element
         * @return {void}
         */
        insertAfter: function(referenceEl) {
            dom.insertAfter(this.getNode(), referenceEl);
            return this._afterInsert();
        },


        /**
         * Prepends the rendered document fragment as a child of the reference element.
         *
         * @param  {DOMElement|String} referenceEl The reference element
         * @return {void}
         */
        prependTo: function(referenceEl) {
            dom.prependTo(this.getNode(), referenceEl);
            return this._afterInsert();
        },

        /**
         * Returns the DOM node for the rendered HTML. If the rendered HTML resulted
         * in multiple top-level DOM nodes then the top-level DOM nodes are wrapped
         * in a single DocumentFragment node.
         *
         * @return {Node|DocumentFragment} The DOM node that can be used to insert the rendered HTML into the DOM.
         */
        getNode: function() {
            var node = this._node,
                curEl,
                newBodyEl;

            if (node === undefined) {
                if (this.html) {
                    newBodyEl = document.createElement('body');
                    newBodyEl.innerHTML = this.html;

                    if (newBodyEl.childNodes.length == 1) { // If the rendered component resulted in a single node then just use that node
                        node = newBodyEl.childNodes[0];
                    }
                    else { // Otherwise, wrap the nodes in a document fragment node
                        node = document.createDocumentFragment();

                        while((curEl=newBodyEl.firstChild)) {
                            node.appendChild(curEl);
                        }
                    }
                } else {
                    // empty HTML so use empty document fragment (so that we're returning a valid DOM node)
                    node = document.createDocumentFragment();
                }

                this._node = node;
            }

            return node;
        }
    };

    return RenderResult;
});
define(
    'raptor/renderer',
    ['raptor'],
    function(raptor, require) {
        "use strict";

        var renderContext = require('raptor/render-context'),
            RenderResult = require('raptor/renderer/RenderResult');


        

        return {
            /**
             * <p>Renders a component to HTML and provides functions to allow the resulting HTML to be injected into
             * the DOM.
             * 
             * <p>
             * Usage:
             * <js>
             * var renderer = require('raptor/renderer');
             * renderer.render('ui/buttons/Button', {label: "Hello World"}).appendChild('myContainer');
             * </js>
             *
             * <p>
             * See {@link raptor/renderer/RenderResult} for supporting DOM insertion methods (including appendChild, prependChild, insertBefore, insertAfter and replace).
             * 
             * @param  {String} renderer The class/module name for the renderer (resulting object must have a "render" method or a "process" method)
             * @param  {Object} data The input data for the renderer
             * @param  {raptor/render-context/Context} context The context to use for rendering the component (optional, a new render context is created if not provided)
             * 
             * @return {raptor/renderer/RenderResult}   Returns the result of rendering the component as an instance of {@Link raptor/renderer/RenderResult}
             */
            render: function(renderer, data, context) {
                if (typeof renderer === 'string') {
                    var rendererObj = raptor.find(renderer);


                    if (!rendererObj) {
                        if (!renderer.endsWith('Renderer')) { //We'll try one naming convention for resolving a renderer name...
                            // Try converting component IDs to renderer names (e.g. 'ui/buttons/Button' --> 'ui/buttons/Button/ButtonRenderer')
                            var lastSlash = renderer.lastIndexOf('/');
                            rendererObj = raptor.find(renderer + '/' + renderer.substring(lastSlash+1) + 'Renderer');    
                        }
                        
                        if (!rendererObj) {
                            throw raptor.createError(new Error('Renderer not found with name "' + renderer + '"'));
                        }
                    }

                    renderer = rendererObj;
                }
                
                var renderFunc = renderer.render || renderer.process || renderer;
                    
                if (typeof renderFunc !== 'function') {
                    throw raptor.createError(new Error('Not a valid renderer: "' + renderer + '". Renderer must be an object with "render" or "process" function or renderer must be a function.'));
                }

                var html,
                    doRender = function() {
                        html = renderFunc.call(renderer, data || {}, context);
                    };

                if (context) {
                    html = context.captureString(doRender) || html;
                }
                else {
                    context = renderContext.createContext();
                    doRender();
                    if (!html) {
                        html = context.getOutput();    
                    }
                }

                return new RenderResult(html, context);
            },

            /**
             * Helper function to support rendering a Raptor template.
             *
             * <p>NOTE: The code for the {@Link raptor/templating} module must already be loaded
             *
             * @since  2.2.6
             * 
             * @param  {String} templateName The name of the Raptor Template to render
             * @param  {Object} templateData The data model to pass to the template
             * @param  {raptor/render-context/Context} context The render context object to use (optional, a new render context is created if not provided)
             * @return {raptor/renderer/RenderResult}   Returns the result of rendering the component as an instance of {@Link raptor/renderer/RenderResult}
             */
            renderTemplate: function(templateName, templateData, context) {
                return this.render(
                    function(input, _context) {
                        require('raptor/templating').render(templateName, 
                                templateData, 
                                _context);
                    }, 
                    {}, 
                    context);
            }
        };
    });
'use strict';

define.Class(
    "ui/CreateTask/CreateTaskWidget",
    ['raptor', 'raptor/pubsub'],
    function(raptor, pubsub, require) {

        var ENTER_KEY = 13,
            componentRenderer = require('raptor/renderer'),
            forEachEntry = raptor.forEachEntry;

        return {
            init: function(){
                var self = this;
                self.$newTodo = $(this.getEl('new-todo'));
                self.$newTodo.on('keypress', self.onKeyPress.bind(self));
                pubsub.subscribe('todomvc/task-added',  self.onTaskAdded.bind(self));
            },

            onKeyPress: function(ev){
                if ( ev.which === ENTER_KEY ) {
                    pubsub.publish('todomvc/add-new-task', {task: this.$newTodo.val()});
                }
            },

            onTaskAdded: function(){
                this.$newTodo.val("");
            }
        }
    }
);
$rset("rhtml", "ui/Task", function(helpers, templateInfo) {
  var empty = helpers.e,
      notEmpty = helpers.ne,
      getTagHandler = helpers.t,
      raptor_templating_taglibs_widgets_WidgetTag = getTagHandler("raptor/templating/taglibs/widgets/WidgetTag"),
      escapeXml = helpers.x;

  return function(data, context) {
    var rowId = data.rowId,
        title = data.title,
        checked = data.checked;

    context.t(
      raptor_templating_taglibs_widgets_WidgetTag,
      {
        "jsClass": "ui/Task/TaskWidget",
        "_cfg": data.widgetConfig
      },
      function(widget) {
        context.w('<li')
          .a("rowId", rowId)
          .a("class", (checked ? "completed" : ''))
          .a("id", widget.elId())
          .w('><div class="view"><input class="toggle" type="checkbox"')
          .a("checked", (checked ? "checked" : ''))
          .w('><label data-title="title">')
          .w(escapeXml(title))
          .w('</label><button class="destroy" data-destroy="close"></button></div><input class="edit"')
          .a("value", title)
          .w(' data-edit="edit"></li>');
      })
      .w(' ');
  }
});
'use strict';

define(
    "ui/Task/TaskRenderer",
    ['raptor/templating'],
    function(templating, require) {

        var store = require('store/TodoStore').getInstance();

        return {
            render: function(input, context) {

                var model = input.model || store.create({title: input.task, completed: false});

                templating.render(
                    'ui/Task',
                    {
                        rowId: model.id, 
                        title: model.title, 
                        checked: model.completed,
                        widgetConfig: {model: model}
                    },
                    context);
            }
        };
    }
);
'use strict';

define.Class(
    "ui/Task/TaskWidget",
    ['raptor', 'raptor/pubsub'],
    function(raptor, pubsub, require) {

        var ENTER_KEY = 13,
            store = require('store/TodoStore').getInstance();

        return {
            model: {},

            init: function(widgetConfig){
                var self = this, c = widgetConfig,
                    list = self.list = self.$();;

                self.model = c.model;

                self.editElem = $('input.edit', list);
                self.taskLabel = $('[data-title]', list);

                list.on('click', 'input.toggle', self.toggle.bind(self));
                list.on('dblclick', '[data-title]', self.edit.bind(self));
                list.on('keypress', 'input.edit', self.update.bind(self));
                list.on('click', '[data-destroy]', self.destroy.bind(self));

                pubsub.subscribe('todomvc/clear-completed-tasks', self.clearCompleted, self);
            },

            /** on click of checkbox, toggle completed/not done**/
            toggle: function(){
                var self = this;
                self.list.toggleClass('completed');
                self.model = store.update({id: self.model.id, title: self.model.title, completed: self.list.hasClass('completed')});
                pubsub.publish('todomvc/task-toggled');
            },

            /** Edit the current task **/
            edit: function(){
                var self = this;
                self.list.addClass('editing');
                return self.editElem.focus();
            },

            /** update the task with new value **/
            update: function(ev){
                if (ev.which === ENTER_KEY){
                    var self = this, newTitle = self.editElem.val();
                    self.taskLabel.html(newTitle);
                    self.list.removeClass('editing');
                    self.model = store.update({id: self.model.id, title: newTitle, completed: self.list.hasClass('completed')});
                }
            },

            /** remove the task on click of close button */
            destroy: function(){
                var self = this, taskId = self.model.id;
                self.model = store.remove(self.model);
                self.list.remove();
                pubsub.publish('todomvc/task-destroyed', {taskId: taskId});
            },

            clearCompleted: function(){
                var self = this;
                if (self.hasCompleted()){
                    self.destroy();
                }
            },

            hasCompleted: function(){
                var self = this;
                return self.model && self.model.completed;
            },

            display: function(visible){
                var self = this;
                visible ? self.list.show() : self.list.hide();
            }            
        }
    }
);
define.Class(
    "ui/Footer/FooterWidget",
    ['raptor', 'raptor/pubsub'],
    function(raptor, pubsub, require) {
        'use strict';

        var componentRenderer = require('raptor/renderer'),
            forEachEntry = raptor.forEachEntry;

        return {
            init: function(){
                var self = this;

                self.$footer = this.$();
                self.$footerLinks = self.$footer.find("a");
                self.$todoCount = $(this.getEl('todo-count-num'));
                self.$completedCount  = $(this.getEl('completed-count'));
                self.$completedBtn = $(this.getEl('clear-completed'));
                
                self.$completedBtn.on('click', function(){
                    pubsub.publish('todomvc/clear-completed-tasks');
                });

                pubsub.subscribe('todomvc/container-refreshed', self.refresh, self);
                pubsub.subscribe('todomvc/filter', self.setActive, self);
                pubsub.publish('todomvc/footer-initialized');
            },

            refresh: function(data){
                var self = this, todo = data.todo, completed = data.completed,
                    show = (todo + completed) > 0;

                if (show){
                    self.$footer.show();
                } else {
                    self.$footer.hide();
                }

                self.$todoCount.html(todo);
                self.$completedCount.html(completed);

                if (completed > 0){
                    self.$completedBtn.show();
                } else {
                    self.$completedBtn.hide();
                }
            },

            setActive: function(input){
                this.$footerLinks
                    .removeClass('selected')
                    .filter( '[href="#/' + (input.view || '') + '"]' )
                    .addClass('selected');
            }
            
        }
    }
);
'use strict';

define.Class(
    'ui/TasksContainer/TasksContainerWidget',
    ['raptor', 'raptor/pubsub'],
    function(raptor, pubsub, require) {

        var componentRenderer = require('raptor/renderer'),
            store = require('store/TodoStore').getInstance(),
            todoTask = require('ui/Task/TaskWidget'),
            tasks = {},
            forEachEntry = raptor.forEachEntry;

        return {
            init: function(){
                var self = this;
                self.$mainContainer = $(self.getEl());
                self.$tasksList = $(this.getEl('todo-list'));

                pubsub.subscribe('todomvc/add-new-task', self.addNewTask, self);
                pubsub.subscribe('todomvc/task-toggled', self.refresh, self);
                pubsub.subscribe('todomvc/task-destroyed', self.removeTask, self);
                pubsub.subscribe('todomvc/filter', self.filter, self);
                pubsub.subscribe('todomvc/footer-initialized', self.setTasksFromStore, self);
            },

            // Set the initial workspace with all the tasks from local store
            setTasksFromStore: function(){
                var self = this;
                forEachEntry(store.findAll(), function(key, model){
                    self.addNewTask({model: model});
                });
            },

            addNewTask: function(eventArgs){
                var self = this;
                
                var taskWidget = componentRenderer.render('ui/Task/TaskRenderer', {
                        task: eventArgs.task,
                        model: eventArgs.model
                    })
                    .appendTo(self.$tasksList[0])
                    .getWidget();

                
                tasks[taskWidget.model.id] = taskWidget;
                
                pubsub.publish('todomvc/task-added');
                self.refresh();
            },

            removeTask: function(obj){
                delete tasks[obj.taskId];
                this.refresh();
            },

            refresh: function(){
                var self = this, status = self.tasksStatusCount(), 
                    todo = status.todo,  completed = status.completed,
                    show = (todo + completed) > 0,
                    main = self.$mainContainer;

                if (show){
                    main.show();
                } else {
                    main.hide();
                }

                pubsub.publish('todomvc/container-refreshed', {todo: todo, completed: completed});
            },

            // return of  count of todo and coompleted tasks
            tasksStatusCount: function(){
                var todo = 0, completed = 0;

                forEachEntry(tasks, function(id, task){
                    if (task.hasCompleted()) completed++;
                    else todo++;    
                });
                
                return {todo: todo, completed: completed};
            },

            /*
            * Filter the tasks for the selected view 
            * view = obj.view - "comompeted", "active" or "all"
            */
            filter: function(obj){
                var view = obj.view;

                forEachEntry(tasks, function(id, task){
                    var completed = task.hasCompleted();
                    switch(view){
                        case 'completed':
                            task.display(completed);
                            break;
                        case 'active':
                            task.display(!completed);
                            break;
                        case 'all':
                        case 'default':
                            task.display(true);
                            break;
                    }

                }, this);
            }
            
        }
    }
);

'use strict';

define.Class(
    'store/Store', 
    function(){
    
        function DataStore(name){
            var self = this;

            self.name = name;
            var store = localStorage.getItem(self.name);
            self.data = (store && JSON.parse(store)) || {};

        };

        DataStore.prototype = {
            save: function(){
                var self = this;
                localStorage.setItem(self.name, JSON.stringify(self.data));
            },

            create: function(model){
                var self = this;
                if (!model.id){
                    model.id = Date.now();
                }
                self.data[model.id] = model;
                self.save();
                return model;
            },

            update: function(model){
                var self = this;

                if (!self.data[model.id]){
                    //model doesn't exist, can't update, craete new model
                    return self.create(model);
                }

                self.data[model.id] = model;
                self.save();
                return model;
            },

            findById: function(id){
                return this.data[id];
            },

            findAll: function(){
                return this.data;
            },

            remove: function(model){
                var self = this;
                delete self.data[model.id];
                self.save();
                return null;
            }
        }

            
        return DataStore;
    }
);

'use strict';

define(
    'store/TodoStore', 
    function(require, exports, module){

        var STORE_KEY = 'raptorjs-todo',
            dataStore = require('store/Store'),
            instance = null;

        return {
            getInstance: function(){
                if (instance == null){
                    instance = new dataStore(STORE_KEY);
                }

                return instance;
            }
        };
    }
);
'use strict';

define.Class(
    'ui/App/AppWidget', 
    ['raptor/pubsub'],
    function(pubsub, require, exports, module){

        return {
            init: function(){
                Router({
                    '/:filter': {
                        on: this.filter
                    },
                    '/': {
                        on: this.filter
                    }
                }).init();
            },

            filter: function(param){
                pubsub.publish('todomvc/filter', {view: param || 'all'});
            }
        };
    }
);

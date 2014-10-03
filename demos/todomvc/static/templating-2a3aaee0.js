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

define("raptor/strings/StringBuilder", function(require) {
    "use strict";
    
    /**
     * Used to build a string by using an array of strings as a buffer.
     * When it is ready to be converted to a string the array elements
     * are joined together with an empty space.
     * 
     * @constructs
     * @constructor Initializes an empty StringBuilder
     * @class
     */
    var StringBuilder = function() {
        /**
         * @type Array
         */
        this.array = [];
        /**
         * The length of the string
         * @type Number
         */
        this.length = 0;

    };

    StringBuilder.prototype = {
            /**
             * Appends a string to the string being constructed.
             * 
             * @param {Object} obj The string or object to append
             * @returns {raptor/strings/StringBuilder} Returns itself
             */
            append: function(obj)
            {
                if (typeof obj !== 'string') {
                    obj = obj.toString();
                }
                this.array.push(obj);
                this.length += obj.length;
                
                return this;
            },
            
            /**
             * Converts the string buffer into a String.
             * 
             * @returns {String} The built String
             */
            toString: function()
            {
                return this.array.join('');
            },
            
            /**
             * Clears the string
             * 
             * @returns {raptor/strings/StringBuilder} Returns itself
             */
            clear: function()
            {
                this.array = [];
                this.length = 0;
                return this;
            }
    };
    
    StringBuilder.prototype.write = StringBuilder.prototype.append;
    
    return StringBuilder;
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

define("raptor/strings", ['raptor'], function(raptor, require) {
    "use strict";
    
    var EMPTY_STRING = '',
        trim = function(s){
            return s ? s.trim() : EMPTY_STRING;
        },
        StringBuilder = require('raptor/strings/StringBuilder'),
        varRegExp = /\$\{([A-Za-z0-9_\.]+)\}/g;

    return {

        compare: function(s1, s2)
        {
            return s1 < s2 ? -1 : (s1 > s2 ? 1 : 0);
        },
        
        /**
         * @param {string} s The string to operate on
         * @return {boolean} Returns true if the string is null or only consists of whitespace
         * 
         * @static
         */
        isEmpty: function(s)
        {
            return s == null || trim(s).length === 0;
        },

        /**
         * @param {string} s The string to operate on
         * @return {integer} Returns the length of the string or 0 if the string is null
         * 
         * @static
         */
        length: function(s)
        {
            return s == null ? 0 : s.length;
        },

        /**
         * @param {object} o The object to test
         * @return {boolean} Returns true if the object is a string, false otherwise.
         * 
         * @static
         */
        isString: function(s) {
            return typeof s === 'string';
        },

        /**
         * Tests if two strings are equal
         * 
         * @param s1 {string} The first string to compare
         * @param s2 {string} The second string to compare
         * @param shouldTrim {boolean} If true the string is trimmed, otherwise the string is not trimmed (optional, defualts to true)
         * @return {boolean} Returns true if the strings are equal, false otherwise
         * 
         * @static
         */
        equals: function(s1, s2, shouldTrim)
        {        
            if (shouldTrim !== false)
            {
                s1 = trim(s1);
                s2 = trim(s2);
            }
            return s1 == s2;
        },

        /**
         * Tests if two strings are not equal
         * 
         * @param s1 {string} The first string to compare
         * @param s2 {string} The second string to compare
         * @param trim {boolean} If true the string is trimmed, otherwise the string is not trimmed (optional, defualts to true)
         * @return {boolean} Returns true if the strings are equal, false otherwise
         * 
         * @see {@link #equals}
         * @static
         */
        notEquals: function(s1, s2, shouldTrim)
        {
            return this.equals(s1, s2, shouldTrim) === false;
        },
        
        trim: trim,

        ltrim: function(s){
            return s ? s.replace(/^\s\s*/,'') : EMPTY_STRING;
        },

        rtrim: function(s){
            return s ? s.replace(/\s\s*$/,'') : EMPTY_STRING;
        },

        startsWith: function(s, prefix) {
            return s == null ? false : s.startsWith(prefix);
        },

        endsWith: function(s, suffix) {
            return s == null ? false : s.endsWith(suffix);
        },
        
        /**
         * 
         * @param c
         * @returns
         */
        unicodeEncode: function(c) {
            return '\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
        },
        
        merge: function(str, data) {
            var varMatches,
                replacement,
                parts = [],
                lastIndex = 0;
                
            varRegExp.lastIndex = 0;

            while ((varMatches = varRegExp.exec(str))) {
                parts.push(str.substring(lastIndex, varMatches.index));
                replacement = data[varMatches[1]];
                parts.push(replacement !== undefined ? replacement : varMatches[0]);
                lastIndex = varRegExp.lastIndex;
            }
            
            parts.push(str.substring(lastIndex));
            return parts.join('');
        },
        
        StringBuilder: StringBuilder,
        
        createStringBuilder: function() {
            return new StringBuilder();
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

define(
    'raptor/xml/utils',
    function(require, exports, module) {
        "use strict";
        
        var elTest = /[&<]/,
            elTestReplace = /[&<]/g,
            attrTest = /[&<>\"\'\n]/,
            attrReplace = /[&<>\"\'\n]/g,
            replacements = {
                '<': "&lt;",
                '>': "&gt;",
                '&': "&amp;",
                '"': "&quot;",
                "'": "&#39;",
                '\n': "&#10;" //Preserve new lines so that they don't get normalized as space
            };
        
        return {
            escapeXml: function(str) {
                if (typeof str === 'string' && elTest.test(str)) {
                    return str.replace(elTestReplace, function(match) {
                        return replacements[match];
                    });
                }
                return str;
            },
            
            escapeXmlAttr: function(str) {
                if (typeof str === 'string' && attrTest.test(str)) {
                    return str.replace(attrReplace, function(match) {
                        return replacements[match];
                    });
                }
                return str;
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
 * The {@link raptor/render-context/Context} class represents a "rendering context"
 * suitable for rendering HTML to a writer. A context object is required when rendering
 * a template and the context object contains a reference to an underlying writer object that is
 * used to capture the rendered output.
 */
define.Class(
    'raptor/render-context/Context',
    ['raptor'],
    function(raptor, require) {
        "use strict";
        
        var forEachEntry = raptor.forEachEntry,
            escapeXmlAttr = require('raptor/xml/utils').escapeXmlAttr,
            StringBuilder = require('raptor/strings/StringBuilder'),
            createError = raptor.createError,
            nextUniqueId = 0,
            _classFunc = function(className, name) {
                var Clazz = require(className),
                    func = Clazz[name] || (Clazz.prototype && Clazz.prototype[name]);
                
                if (!func) {
                    throw createError(new Error('Helper function not found with name "' + name + '" in class "' + className + '"'));
                }
                return func;
            };
        
        /**
         *
         */
        var Context = function(writer) {
            this.writer = writer;
            this.w = this.write;
            this.listeners = {};
            this.attributes = {};
        };
        
        Context.classFunc =  _classFunc;

        var proto = {
            /**
             * Returns the attributes object associated with the context.
             *
             * The attributes object is just a regular JavaScript Object that can be used to store arbitrary data.
             *
             * @returns {Object} The attributes object.
             */
            getAttributes: function() {
                return this.attributes;
            },

            /**
             * Returns the value of an attribute associated with the context
             *
             * @returns {Object} The attribute value.
             */
            getAttribute: function(name) {
                return this.attributes[name];
            },

            /**
             * Returns a auto-incrementing unique ID that remains unique across multiple context objects.
             * @returns {Number} The unique number
             */
            uniqueId: function() {
                return 'c' + nextUniqueId++;
            },
            
            /**
             * Outputs a string to the underlying writer. If the object is null then nothing is written. If the object is not a string then it is converted to a string using the <code>toString</code> method.
             *
             * @param str {String|Object} The String (or Object) to write to the underlying writer.
             */
            write: function(str) {
                if (str !== null && str !== undefined) {
                    if (typeof str !== 'string') {
                        str = str.toString();
                    }
                    this.writer.write(str);
                }
                return this;
            },
            
            /**
             * Returns the string output associated with the underling writer by calling <code>this.writer.toString()</code>
             *
             * @returns {String} The String output
             */
            getOutput: function() {
                return this.writer.toString();
            },
            
            /**
             *
             * Temporarily swaps out the underlying writer with a temporary buffer and invokes the provided function to capture the output and return it.
             *
             * After the function has completed the old writer is swapped back into place. The old writer will remain untouched.
             * Internally, this method uses the {@link raptor/render-context/Context.prototype#swapWriter} method.
             *
             * @param func {Function} The function to invoke while the old writer is swapped out
             * @param thisObj {Object} The "this" object ot use for the provided function
             * @returns {String} The resulting string output.
             */
            captureString: function(func, thisObj) {
                var sb = new StringBuilder();
                this.swapWriter(sb, func, thisObj);
                return sb.toString();
            },
            
            /**
             * Temporarily swaps out the underlying writer with the provided writer and invokes the provided function.
             *
             * After the function has completed the old writer is swapped back into place. The old writer will remain untouched.
             *
             * @param newWriter {Object} The new writer object to use. This object must have a "write" method.
             * @param func {Function} The function to invoke while the old writer is swapped out
             * @param thisObj {Object} The "this" object ot use for the provided function
             *
             * @returns {void}
             */
            swapWriter: function(newWriter, func, thisObj) {
                var oldWriter = this.writer;
                try
                {
                    this.writer = newWriter;
                    func.call(thisObj);
                }
                finally {
                    this.writer = oldWriter;
                }
            },

            createNestedContext: function(writer) {
                var context = require('raptor/render-context').createContext(writer);
                context.attributes = this.getAttributes();
                return context;
            },
            
            /**
             *
             * @param handler
             * @param input
             */
            invokeHandler: function(handler, input) {
                if (typeof handler === 'string') {
                    handler = require(handler);
                }
                var func = handler.process || handler.render;
                func.call(handler, input, this);
            },

            getFunction: function(className, name) {
                if (!this._helpers) {
                    this._helpers = {};
                }
                
                var key = className + ":" + name,
                    helper = this._helpers[key];
                
                if (!helper) {
                    helper = this._helpers[key] = _classFunc(className, name).bind(this);
                }
                
                return helper;
            },

            getHelperObject: function(className) {
                if (!this._helpers) {
                    this._helpers = {};
                }
                
                var Helper = this._helpers[className] || (this._helpers[className] = require(className));
                return new Helper(this);
            },
            
            isTagInput: function(input) {
                return input && input.hasOwnProperty("_tag");
            },
            
            renderTemplate: function(name, data) {
                require("raptor/templating").render(name, data, this);
                return this;
            },
            
            attr: function(name, value, escapeXml) {
                if (value === null || value === true) {
                    value = '';
                }
                else if (value === undefined || value === false || (typeof value === 'string' && value.trim() === '')) {
                    return this;
                }
                else {
                    value = '="' + (escapeXml === false ? value : escapeXmlAttr(value)) + '"';
                }
                
                this.write(' ' + name + value);
                
                return this;
            },
            
            /**
             *
             * @param attrs
             */
            attrs: function(attrs) {
                if (arguments.length !== 1) {
                    this.attr.apply(this, arguments);
                }
                else if (attrs) {
                    forEachEntry(attrs, this.attr, this);
                }
                return this;
            },
            
            /**
             * Helper function invoke a tag handler
             */
            t: function(handler, props, body, dynamicAttributes, namespacedProps) {
                if (!props) {
                    props = {};
                }
                
                props._tag = true;
                
                if (body) {
                    props.invokeBody = body;
                }
                
                if (dynamicAttributes) {
                    props.dynamicAttributes = dynamicAttributes;
                }
                
                if (namespacedProps) {
                    raptor.extend(props, namespacedProps);
                }
                
                this.invokeHandler(handler, props);
                
                return this;
            },
            
            c: function(func) {
                var output = this.captureString(func);
                return {
                    toString: function() { return output; }
                };
            }
        };
        
        // Add short-hand method names that should be used in compiled templates *only*
        proto.a = proto.attrs;
        proto.f = proto.getFunction;
        proto.o = proto.getHelperObject;
        proto.i = proto.renderTemplate;
        
        Context.prototype = proto;

        
        
        return Context;
        
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
 * This module provides the runtime for rendering compiled templates.
 * 
 * 
 * <p>The code for the Raptor Templates compiler is kept separately
 * in the {@link raptor/templating/compiler} module. 
 */
define('raptor/render-context', function(require, exports, module) {
    "use strict";
    
    var StringBuilder = require('raptor/strings/StringBuilder'),
        Context = require('raptor/render-context/Context');
    
    
    return {
        /**
         * Creates a new context object that can be used as the context for
         * template rendering.
         * 
         * @param writer {Object} An object that supports a "write" and a "toString" method.
         * @returns {raptor/render-context/Context} The newly created context object
         */
        createContext: function(writer) {
            return new Context(writer || new StringBuilder()); //Create a new context using the writer provided
        },
        
        Context: Context
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
 * This module provides the runtime for rendering compiled templates.
 *
 *
 * <p>The code for the Raptor Templates compiler is kept separately
 * in the {@link raptor/templating/compiler} module.
 */
define('raptor/templating', ['raptor'], function(raptor, require, exports, module) {
    "use strict";
    
    var getRegisteredTemplate = function(name) {
            return $rget('rhtml', name);
        },
        loadedTemplates = {},
        isArray = Array.isArray,
        createError = raptor.createError,
        StringBuilder = require('raptor/strings/StringBuilder'),
        escapeXml = require('raptor/xml/utils').escapeXml,
        escapeXmlAttr = require('raptor/xml/utils').escapeXmlAttr,
        renderContext = require('raptor/render-context'),
        Context = renderContext.Context,
        _getFunction = Context.classFunc,
        templating,
        /**
         * Helper function to return the singleton instance of a tag handler
         *
         * @param name {String} The class name of the tag handler
         * @returns {Object} The tag handler singleton instance.
         */
        _getHandler = function(name) {
            var Handler = require(name), //Load the handler class
                instance;
            
            if (Handler.process || Handler.render) {
                instance = Handler;
            }
            else if (!(instance = Handler.instance)) { //See if an instance has already been created
                instance = Handler.instance = new Handler(); //If not, create and store a new instance
            }
            
            return instance; //Return the handler instance
        },
        /**
         * Helper function to check if an object is "empty". Different types of objects are handled differently:
         * 1) null/undefined: Null and undefined objects are considered empty
         * 2) String: The string is trimmed (starting and trailing whitespace is removed) and if the resulting string is an empty string then it is considered empty
         * 3) Array: If the length of the array is 0 then the array is considred empty
         *
         */
        notEmpty = function(o) {
            if (Array.isArray(o) === true) {
                return o.length !== 0;
            }
            
            return o;
        },
        helpers = {
            
            /**
             * Helper function to return a static helper function
             *
             * @function
             * @param uri
             * @param name
             * @returns {Function} The corresponding helper function. An exception is thrown if the helper function is not found
             */
            h: _getFunction,
            
            t: _getHandler,
            
            /**
             * forEach helper function
             *
             * @param array {Array} The array to iterate over
             * @param callback {Function} The callback function to invoke for each iteration
             * @returns {void}
             */
            fv: function(array, callback) {
                if (!array) {
                    return;
                }
                
                if (!array.forEach) {
                    array = [array];
                }
                
                var i=0,
                    len=array.length, //Cache the array size
                    loopStatus = { //The "loop status" object is provided as the second argument to the callback function used for each iteration
                        /**
                         * Returns the length of the array that is being iterated over
                         * @returns {int} The length of the array
                         */
                        getLength: function() {
                            return len;
                        },
                        
                        /**
                         * Returns true if the current iteration is the last iteration
                         * @returns {Boolean} True if the current iteration is the last iteration. False, otherwse.
                         */
                        isLast: function() {
                            return i === len-1;
                        },
                        isFirst: function() {
                            return i === 0;
                        },
                        getIndex: function() {
                            return i;
                        }
                    };
                
                for (; i<len; i++) { //Loop over the elements in the array
                    var o = array[i];
                    callback(o || '', loopStatus);
                }
            },
            
            f: raptor.forEach,
            
            fl: function(array, func) {
                if (array != null) {
                    if (!isArray(array)) {
                        array = [array];
                    }
                    func(array, 0, array.length);
                }
            },

            fp: function(o, func) {
                if (!o) {
                    return;
                }
                for (var k in o)
                {
                    if (o.hasOwnProperty(k))
                    {
                        func(k, o[k]);
                    }
                }
            },
            
            e: function(o) {
                return !notEmpty(o);
            },
            
            ne: notEmpty,
            
            /**
             * escapeXml helper function
             *
             * @param str
             * @returns
             */
            x: escapeXml,
            xa: escapeXmlAttr,
            
            nx: function(str) {
                return {
                    toString: function() {
                        return str;
                    }
                };
            }
        };
    
    templating = {

        /**
         * Returns a function that can be used to render the template with the specified name.
         *
         * The template function should always be invoked with two arguments:
         * <ol>
         *  <li><b>data</b> {Object}: The template data object</li>
         *  <li><b>context</b> {@link raptor/templating/Context}: The template context object</li>
         * </ul>
         *
         * @param  {String} templateName The name of the template
         * @return {Function} The function that can be used to render the specified template.
         */
        templateFunc: function(templateName) {

            /*
             * We first need to find the template rendering function. It's possible
             * that the factory function for the template rendering function has been
             * registered but that the template rendering function has not already
             * been created.
             *
             * The template rendering functions are lazily initialized.
             */
            var templateFunc = loadedTemplates[templateName]; //Look for the template function in the loaded templates lookup
            if (!templateFunc) { //See if the template has already been loaded
                /*
                 * If we didn't find the template function in the loaded template lookup
                 * then it means that the template has not been fully loaded and initialized.
                 * Therefore, check if the template has been registerd with the name provided
                 */
                templateFunc = getRegisteredTemplate(templateName);
                
                if (!templateFunc && this.findTemplate) {
                    this.findTemplate(templateName);
                    templateFunc = getRegisteredTemplate(templateName);
                }
                
                if (templateFunc) { //Check the registered templates lookup to see if a factory function has been register
                    /*
                     * We found that template has been registered so we need to fully initialize it.
                     * To create the template rendering function we must invoke the template factory
                     * function which expects a reference to the static helpers object.
                     *
                     * NOTE: The factory function allows static private variables to be created once
                     *       and are then made available to the rendering function as part of the
                     *       closure for the rendering function
                     */
                    var templateInfo = this.getTemplateInfo(templateName);
                    templateFunc = templateFunc(helpers, templateInfo); //Invoke the factory function to get back the rendering function
                }
                
                if (!templateFunc) {
                    throw createError(new Error('Template not found with name "' + templateName + '"'));
                }
                loadedTemplates[templateName] = templateFunc; //Store the template rendering function in the lookup
            }

            return templateFunc;
        },

        getTemplateInfo: function(templateName) {
            return {
                name: templateName
            };
        },

        /**
         * Renders a template to the provided context.
         *
         * <p>
         * The template specified by the templateName parameter must already have been loaded. The data object
         * is passed to the compiled rendering function of the template. All output is written to the provided
         * context using the "writer" associated with the context.
         *
         * @param templateName The name of the template to render. The template must have been previously rendered
         * @param data The data object to pass to the template rendering function
         * @param context The context to use for all rendered output (required)
         */
        render: function(templateName, data, context) {
            if (!context) {
                throw createError(new Error("Context is required"));
            }
            
            var templateFunc = this.templateFunc(templateName);

            try
            {
                templateFunc(data || {}, context); //Invoke the template rendering function with the required arguments
            }
            catch(e) {
                throw createError(new Error('Unable to render template with name "' + templateName + '". Exception: ' + e), e);
            }
        },
        
        /**
         * Renders a template and captures the output as a String
         *
         * @param templateName {String}The name of the template to render. NOTE: The template must have already been loaded.
         * @param data {Object} The data object to provide to the template rendering function
         * @param context {raptor/templating/Context} The context object to use (optional). If a context is provided then the writer will be
         *                                     temporarily swapped with a StringBuilder to capture the output of rendering. If a context
         *                                     is not provided then one will be created using the "createContext" method.
         * @returns {String} The string output of the template
         */
        renderToString: function(templateName, data, context) {
            var sb = new StringBuilder(); //Create a StringBuilder object to serve as a buffer for the output

            
            if (context === undefined) {
                /*
                 * If a context object is not provided then we need to create a new context object and use the StringBuilder as the writer
                 */
                this.render(templateName, data, new Context(sb));
            }
            else {
                var _this = this;
                /*
                 * If a context is provided then we need to temporarily swap out the writer for the StringBuilder
                 */
                context.swapWriter(sb, function() {
                    _this.render(templateName, data, context);
                }); //Swap in the writer, render the template and then restore the original writer
            }
            
            return sb.toString(); //Return the final string associated with the StringBuilder
        },
        
        /**
         * Unloads a template so that it can be reloaded.
         *
         * @param templateName
         */
        unload: function(templateName) {
            delete loadedTemplates[templateName];
            $rset('rhtml', templateName, undefined);
        },
        
        /**
         * Helper function to return a helper function
         *
         * @function
         * @param uri
         * @param name
         * @returns {Function} The corresponding helper function. An exception is thrown if the helper function is not found
         */
        getFunction: _getFunction,
        
        /**
         * Creates a new context object that can be used as the context for
         * template rendering.
         *
         * @param writer {Object} An object that supports a "write" and a "toString" method.
         * @returns {templating$Context} The newly created context object
         */
        createContext: renderContext.createContext,
        
        getHandler: _getHandler,
        
        /**
         * Helper functions (with short names for minification reasons)
         */
        helpers: helpers
    };
    
    return templating;
    
});

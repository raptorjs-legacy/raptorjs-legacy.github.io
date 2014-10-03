define(
    "module-c",
    function(require) {
        return {
            sayHello: function() {
                document.write('<p class="module-c">Hello from "module-c"!</p>');
            }
        };
    });
define(
    "module-d",
    function(require) {
        return {
            sayHello: function() {
                var p = document.createElement('p');
                p.className = 'module-d';
                p.appendChild(document.createTextNode('Hello from "module-d"! (loaded asynchronously)'));
                document.body.appendChild(p);
            }
        };
    });
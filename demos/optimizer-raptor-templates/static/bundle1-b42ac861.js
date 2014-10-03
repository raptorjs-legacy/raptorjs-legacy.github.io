define(
    "module-a",
    function(require) {
        return {
            sayHello: function() {
                document.write('<p class="module-a">Hello from "module-a"!</p>');
            }
        };
    });
define(
    "module-b",
    function(require) {
        return {
            sayHello: function() {
                document.write('<p class="module-b">Hello from "module-b"!</p>');
            }
        };
    });
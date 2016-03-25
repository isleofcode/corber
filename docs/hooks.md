## Hooks:

The following hooks are available:

* beforeBuild
* afterBuild
* beforePrepare
* afterPrepare

Use hooks for any customization, cleanup or warnings.

To create a hook, create a file at ember-cordova/hooks/hookName.js

An example hook:

```js
"use strict";

module.exports = function() {
  //do something
};
```

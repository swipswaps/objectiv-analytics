# Objectiv Core JavaScript module 
[PLACEHOLDER: Objectiv Core module introductory text]

---
# Installing
To install the most recent stable version:

### yarn
```sh
yarn add @objectiv/core
```

### npm
```sh
npm install @objectiv/core
```

# Usage

### ESModule
```javascript
import { Tracker } from '@objectiv/core';
const tracker = new Tracker();
```

### CommonJS
```javascript
const objectivCore = require('@objectiv/core');
const tracker = new objectivCore.Tracker();
```

### IIFE
```html
<script src="dist/index.iife.js"></script>
<script>
  const tracker = new objectivCore.Tracker();
</script>
```

### AMD
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>
<script>
  window.requirejs(['dist/index'], function(objectivCore) {
    const tracker = new objectivCore.Tracker();
  });
</script>
```

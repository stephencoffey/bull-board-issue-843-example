# bull-board-issue-843-example

# Recreate issue https://github.com/felixmosh/bull-board/issues/843

No Redis connection or prereqs needed, just run the following:

1. `npm install`
2. `npm run build`
3. `npm run start`

Displays error:
```
TypeError: Cannot read private member #errorHandler from an object whose class did not declare it
    at file:///home/steve/apps/bull-board-issue-843-example/node_modules/hono/dist/hono-base.js:91:15
    at Array.map (<anonymous>)
    at Hono.route (file:///home/steve/apps/bull-board-issue-843-example/node_modules/hono/dist/hono-base.js:89:16)
    at run (file:///home/steve/apps/bull-board-issue-843-example/dist/index.js:52:9)
```

# Fix

1. Change `hono` to `4.6.8` in `package.json`
1. `npm install`
2. `npm run build`
3. `npm run start`



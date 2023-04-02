# shimadate error


```
/auth/signin

Unhandled Promise Rejection 	{
  "errorType": "Runtime.UnhandledPromiseRejection",
  "errorMessage": "Error: Can't reach database server at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`\n\nPlease make sure your database server is running at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`.",
  "reason": {
    "errorType": "Error",
    "errorMessage": "Can't reach database server at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`\n\nPlease make sure your database server is running at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`.",
    "clientVersion": "4.12.0",
    "errorCode": "P1001",
    "stack": [
      "Error: Can't reach database server at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`",
      "",
      "Please make sure your database server is running at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`.",
      "    at startFn (/var/task/node_modules/.pnpm/@prisma+client@4.12.0_prisma@4.12.0/node_modules/@prisma/client/runtime/library.js:101:2598)"
    ]
  },
  "promise": {},
  "stack": [
    "Runtime.UnhandledPromiseRejection: Error: Can't reach database server at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`",
    "",
    "Please make sure your database server is running at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`.",
    "    at process.<anonymous> (file:///var/runtime/index.mjs:1188:17)",
    "    at process.emit (node:events:525:35)",
    "    at process.emit (/var/task/node_modules/.pnpm/source-map-support@0.5.21/node_modules/source-map-support/source-map-support.js:516:21)",
    "    at emit (node:internal/process/promises:149:20)",
    "    at processPromiseRejections (node:internal/process/promises:283:27)",
    "    at processTicksAndRejections (node:internal/process/task_queues:96:32)"
  ]
}
Unknown application error occurred
Runtime.Unknown
```

```json
{
  "errorType": "Runtime.UnhandledPromiseRejection",
  "errorMessage": "Error: Can't reach database server at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`\n\nPlease make sure your database server is running at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`.",
  "reason": {
    "errorType": "Error",
    "errorMessage": "Can't reach database server at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`\n\nPlease make sure your database server is running at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`.",
    "clientVersion": "4.12.0",
    "errorCode": "P1001",
    "stack": [
      "Error: Can't reach database server at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`",
      "",
      "Please make sure your database server is running at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`.",
      "    at startFn (/var/task/node_modules/.pnpm/@prisma+client@4.12.0_prisma@4.12.0/node_modules/@prisma/client/runtime/library.js:101:2598)"
    ]
  },
  "promise": {},
  "stack": [
    "Runtime.UnhandledPromiseRejection: Error: Can't reach database server at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`",
    "",
    "Please make sure your database server is running at `school-hub-v4-4245.6xw.cockroachlabs.cloud`:`26257`.",
    "    at process.<anonymous> (file:///var/runtime/index.mjs:1188:17)",
    "    at process.emit (node:events:525:35)",
    "    at process.emit (/var/task/node_modules/.pnpm/source-map-support@0.5.21/node_modules/source-map-support/source-map-support.js:516:21)",
    "    at emit (node:internal/process/promises:149:20)",
    "    at processPromiseRejections (node:internal/process/promises:283:27)",
    "    at processTicksAndRejections (node:internal/process/task_queues:96:32)"
  ]
}

```
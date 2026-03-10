8:48:31 PM: Netlify Build                                                 
8:48:31 PM: ────────────────────────────────────────────────────────────────
8:48:31 PM: ​
8:48:31 PM: ❯ Version
8:48:31 PM:   @netlify/build 35.8.7
8:48:31 PM: ​
8:48:31 PM: ❯ Flags
8:48:31 PM:   accountId: 69af8281539bf139ffa0f2b5
8:48:31 PM:   baseRelDir: true
8:48:31 PM:   buildId: 69af94869fa68900086ae983
8:48:31 PM:   deployId: 69af94869fa68900086ae985
8:48:32 PM: ​
8:48:32 PM: ❯ Current directory
8:48:32 PM:   /opt/build/repo
8:48:32 PM: ​
8:48:32 PM: ❯ Config file
8:48:32 PM:   /opt/build/repo/netlify.toml
8:48:32 PM: ​
8:48:32 PM: ❯ Context
8:48:32 PM:   production
8:48:32 PM: ​
8:48:32 PM: build.command from netlify.toml                               
8:48:32 PM: ────────────────────────────────────────────────────────────────
8:48:32 PM: ​
8:48:32 PM: $ npm run build
8:48:32 PM: > bchs-eagles-app@1.0.0 build
8:48:32 PM: > vite build
8:48:32 PM: The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
vite v5.4.21 building for production...
8:48:32 PM: transforming...
8:48:32 PM: ✓ 3 modules transformed.
8:48:32 PM: x Build failed in 77ms
8:48:32 PM: error during build:
8:48:32 PM: [vite:esbuild] Transform failed with 1 error:
8:48:32 PM: /opt/build/repo/src/App.jsx:134:75: ERROR: Expected "}" but found "·"
8:48:32 PM: file: /opt/build/repo/src/App.jsx:134:75
8:48:32 PM: 
8:48:32 PM: Expected "}" but found "·"
8:48:32 PM: 132|    // ── Boys Basketball (22–5, CIF State Regionals) ──
8:48:32 PM: 133|    basketball: [
8:48:32 PM: 134|      {num:"0",  name:"Jereck Reyes",      pos:"SG/SF", yr:"SR", stat:"5'10" · 155 lbs"},
   |                                                                             ^
8:48:32 PM: 135|      {num:"1",  name:"Jeremias Killebrew",pos:"SF/PF", yr:"JR", stat:"6'5" · 160 lbs"},
136|      {num:"2",  name:"Braylen Smith",     pos:"PG",    yr:"SO", stat:""},
8:48:32 PM: 
8:48:32 PM:     at failureErrorWithLog (/opt/build/repo/node_modules/esbuild/lib/main.js:1472:15)
8:48:32 PM:     at /opt/build/repo/node_modules/esbuild/lib/main.js:755:50
8:48:32 PM:     at responseCallbacks.<computed> (/opt/build/repo/node_modules/esbuild/lib/main.js:622:9)
8:48:32 PM:     at handleIncomingPacket (/opt/build/repo/node_modules/esbuild/lib/main.js:677:12)
8:48:32 PM:     at Socket.readFromStdout (/opt/build/repo/node_modules/esbuild/lib/main.js:600:7)
8:48:32 PM:     at Socket.emit (node:events:519:28)
8:48:32 PM:     at addChunk (node:internal/streams/readable:561:12)
8:48:32 PM:     at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
8:48:32 PM:     at Readable.push (node:internal/streams/readable:392:5)
8:48:32 PM:     at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)
8:48:32 PM: ​
8:48:32 PM: "build.command" failed                                        
8:48:32 PM: ────────────────────────────────────────────────────────────────
8:48:32 PM: ​
8:48:32 PM:   Error message
8:48:32 PM:   Command failed with exit code 1: npm run build (https://ntl.fyi/exit-code-1)
8:48:32 PM: ​
8:48:32 PM:   Error location
8:48:32 PM:   In build.command from netlify.toml:
8:48:32 PM:   npm run build
8:48:32 PM: ​
8:48:32 PM:   Resolved config
8:48:32 PM:   build:
8:48:32 PM:     command: npm run build
8:48:32 PM:     commandOrigin: config
8:48:32 PM:     publish: /opt/build/repo/dist
8:48:32 PM:     publishOrigin: config
8:48:32 PM:   redirects:
8:48:33 PM:     - from: /*
      status: 200
      to: /index.html
  redirectsOrigin: config
8:48:33 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
8:48:33 PM: Failing build: Failed to build site
8:48:33 PM: Finished processing build request in 9.544s
8:48:33 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)

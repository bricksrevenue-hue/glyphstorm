# Glyphstorm 1.10.0 — Complete source, one copy-pasteable block

This block contains the complete first-party HTML, CSS, browser JavaScript, Node.js server, tests and pinned package manifests. It preserves the existing multiplayer architecture. A Node.js server is required; it cannot be replaced by opening one HTML file.

For the simplest setup, extract the accompanying Glyphstorm_v1_Source.zip and run `npm ci`, then `npm start` inside its `glyphstorm` folder. Open http://localhost:3000 in two separate tabs and join the same room.

To copy/paste all source at once, run the entire Bash block below from that extracted `glyphstorm` folder (macOS/Linux, or Bash on Windows). It writes the source files shown, using literal heredocs so JavaScript templates and HTML are preserved exactly. Its PNG ship/asteroid assets and third-party license notices are supplied in the ZIP and retained. It does not install dependencies or start the server automatically; run `npm ci`, then `npm start` afterward. Keep a separate copy if you have made your own source edits.

New in 1.10: flexible drag/tap-swap tiles; full tray or contiguous-range words; any-tile discard; three-second Shuffle; live validation; longest/best word assistance; Smart discard and timed vowel recovery; weighted local letter supply and useful-letter magnet; achievable bounties; labeled asteroid vowel/star/shield rewards; compact review, corner score/feed, visible combo meter and clearer Earth damage; action-guided onboarding. This updates the existing game rather than replacing its multiplayer, ships, style or defense. The base scoring formula stays the same; a used star doubles the base once and the bounty remains +20.

All 114 automated tests pass, including two-player tray actions and eight-player synchronization/regression cases. Browser/device visual checks remain pending; the included verification document lists the requested eight cases and what remains to playtest. Smart discard preserves possible words because deleting a tile cannot create an anagram. A full-tray recovery vowel waits for space. Damage feedback follows the existing pink incoming-letter breaches; physical rocks retain their behavior.

The block below includes full files, not snippets, including all modified source, tests, manifests, README and documentation. Every asset and third-party notice remains in the ZIP.

````````bash
#!/usr/bin/env bash
set -euo pipefail
# Run from the glyphstorm folder extracted from the accompanying ZIP.
# Keep its original PNG assets and third-party notices.
if [ ! -f public/assets/ships/01-dart.png ] || [ ! -f public/assets/asteroids/rock-v15.png ]; then
  printf '%s\n' 'Extract Glyphstorm_v1_Source.zip and cd into its glyphstorm folder first.' >&2
  exit 1
fi
mkdir -p public server test docs

# FILE: package.json
cat > 'package.json' <<'GLYPHSTORM_7AE45AD102EAB3B6'
{
  "name": "glyphstorm",
  "version": "1.10.0",
  "private": true,
  "type": "module",
  "description": "A real-time multiplayer crystal-and-word arena for 2\u20138 players.",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "start": "node server/index.mjs",
    "dev": "node --watch server/index.mjs",
    "test": "node --test test/*.test.mjs",
    "check": "node --check server/index.mjs && node --check server/game.mjs && node --check public/app.js && node --check public/arena.js && node --check public/fleet.js && node --check public/ship-sprites.js && node --check public/aim.js && node --check public/match-feedback.js && node --check public/asteroids.js && node --check public/objectives.js && node --check public/defense.js && node --check public/planet.js && node --check public/power-ups.js && node --check public/neon.js && node --check server/word-guide.mjs && node --check public/word-guide.js && node --check public/practice.js && node --check public/signals.js && node --check public/word-energy.js && node --check public/compact-hud.js && node --check server/word-index.mjs && node --check server/letter-supply.mjs && node --check public/tray-controls.js"
  },
  "dependencies": {
    "express": "5.3.0",
    "socket.io": "4.8.4",
    "word-list": "4.1.0",
    "bad-words": "4.1.5"
  },
  "devDependencies": {
    "socket.io-client": "4.8.4"
  }
}
GLYPHSTORM_7AE45AD102EAB3B6

# FILE: package-lock.json
cat > 'package-lock.json' <<'GLYPHSTORM_053150B640A7CE75'
{
  "name": "glyphstorm",
  "version": "1.10.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "glyphstorm",
      "version": "1.10.0",
      "dependencies": {
        "bad-words": "4.1.5",
        "express": "5.3.0",
        "socket.io": "4.8.4",
        "word-list": "4.1.0"
      },
      "devDependencies": {
        "socket.io-client": "4.8.4"
      },
      "engines": {
        "node": ">=22"
      }
    },
    "node_modules/@socket.io/component-emitter": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@socket.io/component-emitter/-/component-emitter-3.1.2.tgz",
      "integrity": "sha512-9BCxFwvbGg/RsZK9tjXd8s4UcwR0MWeFQ1XEKIQVVvAGJyINdrqKMcTRyLoK8Rse1GjzLV9cwjWV1olXRWEXVA==",
      "license": "MIT"
    },
    "node_modules/@types/cors": {
      "version": "2.8.19",
      "resolved": "https://registry.npmjs.org/@types/cors/-/cors-2.8.19.tgz",
      "integrity": "sha512-mFNylyeyqN93lfe/9CSxOGREz8cpzAhH+E93xJ4xWQf62V8sQ/24reV2nyzUWM6H6Xji+GGHpkbLe7pVoUEskg==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/node": {
      "version": "26.6.5",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-26.6.5.tgz",
      "integrity": "sha512-uMzsv9stDdofIZBx4UGh4Z9ZgXnGC9seRDscilBcTHAeOFk67MZg/k9bWVfO+bk4qZmG+l52hRnLwUiH2LnJTg==",
      "license": "MIT",
      "dependencies": {
        "undici-types": "~8.9.0"
      }
    },
    "node_modules/@types/ws": {
      "version": "8.18.2",
      "resolved": "https://registry.npmjs.org/@types/ws/-/ws-8.18.2.tgz",
      "integrity": "sha512-67MQl+fpWKVTT1NYdnmo3U4sc/xPo/zQBncVnI74qmQa0z/b+1g6iYqNmGCPbxO+zz2aklb08a0oHfegiVd0/w==",
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/accepts": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-2.0.0.tgz",
      "integrity": "sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "^3.0.0",
        "negotiator": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/bad-words": {
      "version": "4.1.5",
      "resolved": "https://registry.npmjs.org/bad-words/-/bad-words-4.1.5.tgz",
      "integrity": "sha512-2brqSXEk99CL6vi67cEg8ArEeoFPJBsdfDXon1Ed5XWIgRKn8ZNYA9Gwo8YB3zLlChQXztTTtzwUV3dAyjELfw==",
      "license": "MIT",
      "dependencies": {
        "badwords-list": "^2.0.1-4"
      },
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/badwords-list": {
      "version": "2.0.1-4",
      "resolved": "https://registry.npmjs.org/badwords-list/-/badwords-list-2.0.1-4.tgz",
      "integrity": "sha512-FxfZUp7B9yCnesNtFQS9v6PvZdxTYa14Q60JR6vhjdQdWI4naTjJIyx22JzoER8ooeT8SAAKoHLjKfCV7XgYUQ==",
      "license": "MIT"
    },
    "node_modules/body-parser": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-2.3.0.tgz",
      "integrity": "sha512-2cGmJupaNgg+QUwVLAucDuWuoMZ6EX9iHDRswZ5lsNYEmwPaRknMPCLZz07yTzVq/83p4o/wzbDZbBrTvGGTIw==",
      "license": "MIT",
      "dependencies": {
        "bytes": "^3.1.2",
        "content-type": "^2.0.0",
        "debug": "^4.4.3",
        "http-errors": "^2.0.1",
        "iconv-lite": "^0.7.2",
        "on-finished": "^2.4.1",
        "qs": "^6.15.2",
        "raw-body": "^3.0.2",
        "type-is": "^2.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/bytes": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/content-disposition": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-2.0.1.tgz",
      "integrity": "sha512-e+H0ZXHSWYrENhQzw1LPuP4oF5MzVKmDU6d3hxlvaPEYLLg62MxtQNPRx4SYSuYJSBUgnQIG4HIN2tEtNv7Dog==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/content-type": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-2.1.0.tgz",
      "integrity": "sha512-mj7UPXE0jaqaOsukNZRUEfEi2AcL7C/vwmwcHV0O97eO1E1pxBZuyjlZrx5seTaNBg1U6+o35wpa35Qfcc+7ag==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/cookie": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
      "integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie-signature": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.2.2.tgz",
      "integrity": "sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.6.0"
      }
    },
    "node_modules/cors": {
      "version": "2.8.6",
      "resolved": "https://registry.npmjs.org/cors/-/cors-2.8.6.tgz",
      "integrity": "sha512-tJtZBBHA6vjIAaF6EnIaq6laBBP9aq/Y3ouVJjEfoHbRBcHBAHYcMh/w8LDrk2PvIMMq8gmopa5D4V8RmbrxGw==",
      "license": "MIT",
      "dependencies": {
        "object-assign": "^4",
        "vary": "^1"
      },
      "engines": {
        "node": ">= 0.10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/ee-first": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
      "license": "MIT"
    },
    "node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/engine.io": {
      "version": "6.6.11",
      "resolved": "https://registry.npmjs.org/engine.io/-/engine.io-6.6.11.tgz",
      "integrity": "sha512-z34mGpLoY/82ZbkX1LqGMIaf3wjVMPL6gVC681QDqnmzJ26synI8qAE32P+a7UazmpJZ8UGrFIeAavgRfXzYrg==",
      "license": "MIT",
      "dependencies": {
        "@types/cors": "^2.8.12",
        "@types/node": ">=10.0.0",
        "@types/ws": "^8.5.12",
        "accepts": "~1.3.4",
        "cookie": "~0.7.2",
        "cors": "~2.8.5",
        "debug": "~4.4.1",
        "engine.io-parser": "~5.2.1",
        "ws": "~8.21.0"
      },
      "engines": {
        "node": ">=10.2.0"
      }
    },
    "node_modules/engine.io-client": {
      "version": "6.6.7",
      "resolved": "https://registry.npmjs.org/engine.io-client/-/engine.io-client-6.6.7.tgz",
      "integrity": "sha512-GyAvmPA7gnRCpDQbYACAy79Lg4ewevrmaPzySZz0OVvgyZc3gEfLLqPTYk8wVBScjOEpM9ZO4KryyFpVItjGEA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@socket.io/component-emitter": "~3.1.0",
        "debug": "~4.4.1",
        "engine.io-parser": "~5.2.1",
        "ws": "~8.21.0",
        "xmlhttprequest-ssl": "~2.1.1"
      }
    },
    "node_modules/engine.io-parser": {
      "version": "5.2.3",
      "resolved": "https://registry.npmjs.org/engine.io-parser/-/engine.io-parser-5.2.3.tgz",
      "integrity": "sha512-HqD3yTBfnBxIrbnM1DoD6Pcq8NECnh8d4As1Qgh0z5Gg3jRRIqijury0CL3ghu/edArpUYiYqQiDUQBIs4np3Q==",
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      }
    },
    "node_modules/engine.io/node_modules/accepts": {
      "version": "1.3.8",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-1.3.8.tgz",
      "integrity": "sha512-PYAthTa2m2VKxuvSD3DPC/Gy+U+sOA1LAuT8mkmRuvw+NACSaeXEQ+NHcVF7rONl6qcaxV3Uuemwawk+7+SJLw==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "~2.1.34",
        "negotiator": "0.6.3"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/engine.io/node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/engine.io/node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/engine.io/node_modules/negotiator": {
      "version": "0.6.3",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.3.tgz",
      "integrity": "sha512-+EUsqGPLsM+j/zdChZjsnX51g4XrHFOIXwfnCVPGlQk/k5giakcKsuxCObBRu6DSm9opw/O6slWbJdghQM4bBg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/etag": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/express": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/express/-/express-5.3.0.tgz",
      "integrity": "sha512-qCqy1xSoaugxOD4IVHb1ZWdkvCF2W3aE2okKouWj8VwJ+ztskSiXoBnCSJqfKT+cVPJhuJqe9YLbY425+Zh00g==",
      "license": "MIT",
      "dependencies": {
        "accepts": "^2.0.0",
        "body-parser": "^2.3.0",
        "content-disposition": "^2.0.1",
        "content-type": "^2.0.0",
        "cookie": "^0.7.1",
        "cookie-signature": "^1.2.1",
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "finalhandler": "^2.1.0",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.0",
        "merge-descriptors": "^2.0.0",
        "mime-types": "^3.0.0",
        "on-finished": "^2.4.1",
        "once": "^1.4.0",
        "parseurl": "^1.3.3",
        "proxy-addr": "^2.0.8",
        "qs": "^6.16.0",
        "range-parser": "^1.2.1",
        "router": "^2.2.0",
        "send": "^1.1.0",
        "serve-static": "^2.2.0",
        "statuses": "^2.0.1",
        "type-is": "^2.1.0",
        "vary": "^1.1.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/finalhandler": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-2.1.1.tgz",
      "integrity": "sha512-S8KoZgRZN+a5rNwqTxlZZePjT/4cnm0ROV70LedRHZ0p8u9fRID0hJUZQpkKLzro8LfmC8sx23bY6tVNxv8pQA==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "on-finished": "^2.4.1",
        "parseurl": "^1.3.3",
        "statuses": "^2.0.1"
      },
      "engines": {
        "node": ">= 18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/forwarded": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
      "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fresh": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/fresh/-/fresh-2.0.0.tgz",
      "integrity": "sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/http-errors": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "~2.0.0",
        "inherits": "~2.0.4",
        "setprototypeof": "~1.2.0",
        "statuses": "~2.0.2",
        "toidentifier": "~1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.7.3",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.7.3.tgz",
      "integrity": "sha512-IKXpvIzjnC9XTAUbVBcMfGS0EPaIXtW6v+zr+RRp+hqULEpo0owZax6wyRwPOJbWbzjYspQwusTsfVr0ifh4uQ==",
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/ipaddr.js": {
      "version": "1.9.1",
      "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
      "integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/is-promise": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/is-promise/-/is-promise-4.0.0.tgz",
      "integrity": "sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==",
      "license": "MIT"
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/media-typer": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-1.1.1.tgz",
      "integrity": "sha512-yz3xRaG20c6/BOzvYoDaGtPmGscs7YivItZEEqe6GbwNfHuxu9YNmvnEkMzKldAGY4/80pRcQRZSEnhquk9XuQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/merge-descriptors": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-2.0.0.tgz",
      "integrity": "sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/mime-db": {
      "version": "1.54.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.54.0.tgz",
      "integrity": "sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-3.0.2.tgz",
      "integrity": "sha512-Lbgzdk0h4juoQ9fCKXW4by0UJqj+nOOrI9MJ1sSj4nI8aI2eo1qmvQEie4VD1glsS250n15LsWsYtCugiStS5A==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "^1.54.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/negotiator": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-1.1.0.tgz",
      "integrity": "sha512-NMPBRMJgiQHjbd8phG3Vebdx4kZ1H121rbl5IkMqeOsahptB9BKo/d7oJ3zTXqTgagn2bWlNSXkh0QUGM31RYg==",
      "license": "MIT",
      "dependencies": {
        "content-type": "^2.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/on-finished": {
      "version": "2.4.1",
      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
      "integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
      "license": "MIT",
      "dependencies": {
        "ee-first": "1.1.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/once": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
      "license": "ISC",
      "dependencies": {
        "wrappy": "1"
      }
    },
    "node_modules/parseurl": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
      "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/path-to-regexp": {
      "version": "8.4.2",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-8.4.2.tgz",
      "integrity": "sha512-qRcuIdP69NPm4qbACK+aDogI5CBDMi1jKe0ry5rSQJz8JVLsC7jV8XpiJjGRLLol3N+R5ihGYcrPLTno6pAdBA==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/proxy-addr": {
      "version": "2.0.8",
      "resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.8.tgz",
      "integrity": "sha512-5nnx0yGyVUcY6t9RnWcARWtwT9F1D8O9rt08htPvnd49W1IgZtmLkhu9WfMzQj1cFxjHIO6connUNVW5k7AVyQ==",
      "license": "MIT",
      "dependencies": {
        "forwarded": "0.2.0",
        "ipaddr.js": "1.9.1"
      },
      "engines": {
        "node": ">= 0.10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/qs": {
      "version": "6.16.1",
      "resolved": "https://registry.npmjs.org/qs/-/qs-6.16.1.tgz",
      "integrity": "sha512-5Px6J7rfHBAGUhNQ3es4YzcOdBBw0SDcVtThJml4RdnKw4tKs2epA0kPZ+K8X+WiHktT93RHVcQ/3ym5aTCgtg==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "es-define-property": "^1.0.1",
        "side-channel": "^1.1.1"
      },
      "engines": {
        "node": ">=0.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/range-parser": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.3.0.tgz",
      "integrity": "sha512-hek2mFQpPuI4E1BBKrSto+BU3e3x4xuarsbiwr3+lf7p44juvFMV0XFWQAP3xUyqXA4RrXLIoaSUGbSt056ZMw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/raw-body": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/raw-body/-/raw-body-3.0.2.tgz",
      "integrity": "sha512-K5zQjDllxWkf7Z5xJdV0/B0WTNqx6vxG70zJE4N0kBs4LovmEYWJzQGxC9bS9RAKu3bgM40lrd5zoLJ12MQ5BA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "~3.1.2",
        "http-errors": "~2.0.1",
        "iconv-lite": "~0.7.0",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/router": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/router/-/router-2.2.0.tgz",
      "integrity": "sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "is-promise": "^4.0.0",
        "parseurl": "^1.3.3",
        "path-to-regexp": "^8.0.0"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/safer-buffer": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
      "license": "MIT"
    },
    "node_modules/send": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/send/-/send-1.2.1.tgz",
      "integrity": "sha512-1gnZf7DFcoIcajTjTwjwuDjzuz4PPcY2StKPlsGAQ1+YH20IRVrBaXSWmdjowTJ6u8Rc01PoYOGHXfP1mYcZNQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.3",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.1",
        "mime-types": "^3.0.2",
        "ms": "^2.1.3",
        "on-finished": "^2.4.1",
        "range-parser": "^1.2.1",
        "statuses": "^2.0.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/serve-static": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-2.2.1.tgz",
      "integrity": "sha512-xRXBn0pPqQTVQiC8wyQrKs2MOlX24zQ0POGaj0kultvoOCstBQM5yvOhAVSUwOMjQtTvsPWoNCHfPGwaaQJhTw==",
      "license": "MIT",
      "dependencies": {
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "parseurl": "^1.3.3",
        "send": "^1.2.0"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/setprototypeof": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
      "license": "ISC"
    },
    "node_modules/side-channel": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz",
      "integrity": "sha512-6x6dK6zJdpTzF4sQeNYxwtvBzf6Eg4GtlesS94HOvTudUeyK2WXAaIfmDgsyslYrRBeFIlsi54AYsFGUuhmvrQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4",
        "side-channel-list": "^1.0.1",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz",
      "integrity": "sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/socket.io": {
      "version": "4.8.4",
      "resolved": "https://registry.npmjs.org/socket.io/-/socket.io-4.8.4.tgz",
      "integrity": "sha512-9ZV9zg8vN8hO3Y25DhR7nUkJ1VDnBhq5O/JrXhFT9s6+F0gqytSASTHVfCFc2mJXaTfARroErplXlzFWwETZqQ==",
      "license": "MIT",
      "dependencies": {
        "accepts": "~1.3.4",
        "cors": "~2.8.5",
        "debug": "~4.4.1",
        "engine.io": "~6.6.0",
        "socket.io-adapter": "~2.5.2",
        "socket.io-parser": "~4.2.4"
      },
      "engines": {
        "node": ">=10.2.0"
      }
    },
    "node_modules/socket.io-adapter": {
      "version": "2.5.8",
      "resolved": "https://registry.npmjs.org/socket.io-adapter/-/socket.io-adapter-2.5.8.tgz",
      "integrity": "sha512-6Oy52pbg+kvdCVvjcN+FnY7BvxZ7cIHNScbvztT/It5d0vbwoJoVZmF2gjJmnV0/4WlXRfG15zc45ySk9Ah8bw==",
      "license": "MIT",
      "dependencies": {
        "debug": "~4.4.1",
        "ws": "~8.21.0"
      }
    },
    "node_modules/socket.io-client": {
      "version": "4.8.4",
      "resolved": "https://registry.npmjs.org/socket.io-client/-/socket.io-client-4.8.4.tgz",
      "integrity": "sha512-7wjKAvVXYOJsbmUgkWbnhPD4bFpkqrUR0++XOjpGFmqDqsqV1CI93VTraeExLxpjxEqrWgFoSRZu1ihjLWfkAA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@socket.io/component-emitter": "~3.1.0",
        "debug": "~4.4.1",
        "engine.io-client": "~6.6.1",
        "socket.io-parser": "~4.2.4"
      },
      "engines": {
        "node": ">=10.0.0"
      }
    },
    "node_modules/socket.io-parser": {
      "version": "4.2.7",
      "resolved": "https://registry.npmjs.org/socket.io-parser/-/socket.io-parser-4.2.7.tgz",
      "integrity": "sha512-IH/iSeO9T6gz1KkFleGDWkG9N3dl4jXVYUtMhIqH10Md0ttMer8nUNWiP1DKuNrybD2xBrixLJdCC9J6ECoYkg==",
      "license": "MIT",
      "dependencies": {
        "@socket.io/component-emitter": "~3.1.0",
        "debug": "~4.4.1"
      },
      "engines": {
        "node": ">=10.0.0"
      }
    },
    "node_modules/socket.io/node_modules/accepts": {
      "version": "1.3.8",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-1.3.8.tgz",
      "integrity": "sha512-PYAthTa2m2VKxuvSD3DPC/Gy+U+sOA1LAuT8mkmRuvw+NACSaeXEQ+NHcVF7rONl6qcaxV3Uuemwawk+7+SJLw==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "~2.1.34",
        "negotiator": "0.6.3"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/socket.io/node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/socket.io/node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/socket.io/node_modules/negotiator": {
      "version": "0.6.3",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.3.tgz",
      "integrity": "sha512-+EUsqGPLsM+j/zdChZjsnX51g4XrHFOIXwfnCVPGlQk/k5giakcKsuxCObBRu6DSm9opw/O6slWbJdghQM4bBg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/toidentifier": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/type-is": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/type-is/-/type-is-2.1.0.tgz",
      "integrity": "sha512-faYHw0anBbc/kWF3zFTEnxSFOAGUX9GFbOBthvDdLsIlEoWOFOtS0zgCiQYwIskL9iGXZL3kAXD8OoZ4GmMATA==",
      "license": "MIT",
      "dependencies": {
        "content-type": "^2.0.0",
        "media-typer": "^1.1.0",
        "mime-types": "^3.0.0"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/undici-types": {
      "version": "8.9.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-8.9.0.tgz",
      "integrity": "sha512-KTDyRTYX8sWmKXAikPHHSyc63CRPETMctyjKFupcC6OBLXT3xsN0e9aF7m+mIXutFWpUXuedtowG7iLOzp0kQg==",
      "license": "MIT"
    },
    "node_modules/unpipe": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
      "integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/vary": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
      "integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/word-list": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/word-list/-/word-list-4.1.0.tgz",
      "integrity": "sha512-4vtKyH8lGfaY8DHLTKQDfDxPixdK6BC/2W38TsPE07Wc8uPrMIbEO3quxBFSa2BfsDyG6pW47UEN/9tfYxN6BA==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/wrappy": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
      "license": "ISC"
    },
    "node_modules/ws": {
      "version": "8.21.3",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.21.3.tgz",
      "integrity": "sha512-201TZ/kPWxoPr/OKWjquZR1SWKXcvxdH+e1xrx89b3YbmzLMFCLfnaG1HFIgWzJOEWZ7MvpK++odZufgYR50Rw==",
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/xmlhttprequest-ssl": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/xmlhttprequest-ssl/-/xmlhttprequest-ssl-2.1.2.tgz",
      "integrity": "sha512-TEU+nJVUUnA4CYJFLvK5X9AOeH4KvDvhIfm0vV1GaQRtchnG0hgK5p8hw/xjv8cunWYCsiPCSDzObPyhEwq3KQ==",
      "dev": true,
      "engines": {
        "node": ">=0.4.0"
      }
    }
  }
}
GLYPHSTORM_053150B640A7CE75

# FILE: Dockerfile
cat > 'Dockerfile' <<'GLYPHSTORM_DD2C0EB6EA5CFC6C'
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY public ./public
COPY server ./server
COPY THIRD_PARTY_NOTICES.txt ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "server/index.mjs"]
GLYPHSTORM_DD2C0EB6EA5CFC6C

# FILE: render.yaml
cat > 'render.yaml' <<'GLYPHSTORM_A64CF250B418AB8F'
# Development/staging default. Free services can sleep and are not an always-on
# competition deployment. Select and approve an always-on plan before release.
services:
  - type: web
    name: glyphstorm
    runtime: node
    plan: free
    buildCommand: npm ci --omit=dev
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_VERSION
        value: 22
GLYPHSTORM_A64CF250B418AB8F

# FILE: README.md
cat > 'README.md' <<'GLYPHSTORM_B335630551682C19'
# Glyphstorm 1.10 — Flexible words, clearer recovery

A real-time word arena for 2–8 friends. Open crystals and realistic asteroids with light pulses, collect letters by touch, arrange their tiles, and score words while protecting a shared Earth.

## New in 1.10

- **Flexible tray:** drag to reorder on desktop or tap two tiles to swap on any device. Select range uses start/end tiles; otherwise the entire tray is the word. Unused tiles on either side remain. Delete any chosen tile with Backspace/Delete or its ×; long-press exposes × on touch. With no selected tile, Backspace removes the last tile. Existing discard controls remain. Shuffle / R is free, with a server-enforced three-second cooldown.
- **Actionable spelling help:** live dictionary feedback and disabled invalid submission; one inline error; Shorter word arranges and selects the longest available word; Use all clears the range; Best word reports the highest normal score including a star. Reused words are excluded. A full tray with available words names a suggestion; a dead tray shows the discard/Shuffle hint and low-utility tile markers. Smart discard preserves the most possible words, then favors a useful vowel replacement.
- **Recovery:** after twenty seconds without a pickup or valid submission, offer one vowel, at most once per forty-five seconds. A full tray reserves the vowel until a discard or submission makes space, retaining the ten-slot cap. Automatic delivery waits through review, reset, spawn protection or disconnection. A zero-score pilot gets a short-word nudge after forty-five seconds.
- **Letter supply:** weighted Scrabble-like frequencies target 35–40% vowels across the field. Nearby generation responds to tray vowels. A bounded local supply adds up to two released letters every two seconds toward four within 600px of each pilot. Only these extra local letters disappear when left far behind; distant base density is unchanged. A gentle 72px magnet pulls the nearest useful eligible ordinary tile at 42px/second; incoming threats keep their existing paths. Double bright, normal and dim dashed outlines distinguish useful/neutral/no-immediate-word letters without depending on color alone.
- **Achievable rewards:** bounties prefer common three-to-five-letter words available from the field plus a pilot's own tray; rival inventories are not pooled. The bounty stays +20. Asteroids usually release their normal letters; some add a vowel, a single-use ★ tile doubling that word's base score, or a personal word-shield recharge. Labels show the reward. Multiple stars do not stack or double the bounty.
- **Clearer flight deck:** score and recent human word feed sit in the upper-left corner. Review is a compact non-modal panel inside the board above its tiles, with an explicit shield timer; the board scrolls on compact screens. A visible meter shows progress toward five words. Earth breaches add a brief shake, red ring flash, actual damage number and Integrity pulse; incoming-wave time is drawn near Earth or its offscreen indicator. Reduced motion keeps static warnings.
- **Onboarding:** the lobby brief is four essentials: fly, collect, arrange, submit. Dismissible live tips advance on those actions and remember completion/dismissal in localStorage. Existing solo practice remains available.

All 114 automated tests pass, including two-player tray actions, retry-safe assists and the existing eight-client synchronization, reconnect, ship and room checks. Static markup/layout checks pass; real-browser layout, drag and physical-phone touch checks remain pending. See docs/VERIFICATION.md for the eight requested cases. This is an update to the existing Node/Express/Socket.io game; existing modes, settings, ships, controls, timing and base scoring remain in place. No public deployment is included.

### Small compatibility decisions

Removing a tile cannot create an anagram when any subset is selectable. Smart discard therefore maximizes retained words, then space for a vowel; the UI explains this. Shuffle changes order but cannot create missing letters. A full-board recovery vowel is reserved rather than silently replacing a tile or creating an eleventh slot. Dim letters mean no immediate new spelling opportunity, not that they invalidate a selectable word. Earth damage feedback uses the existing incoming pink-letter breach path; physical asteroid/meteor rocks retain their original behavior. The game has human opponents, so the new feed uses actual scoring events and no bot system was added.

## Retained from 1.9

- **Word energy:** every valid word sends its letters toward Earth's shield along the wrapped arena's shortest route. A cyan ripple marks arrival. The score banner reports the actual repair and shield growth after caps: at 99 HP it says +1 HP, and at maximum it says Earth full / Shield at max. This is visual feedback; the server commits the reward once at submission. Reduced motion replaces travel with a stationary shield highlight. Classic rounds retain scoring without an Earth effect.
- **Quick signals:** tap Signal → choose a letter → Request letter, or tap Defend Earth. Teams see only their own team's calls. Free-for-all pilots can send shared Earth-defense calls; letter requests remain team-only. Signals mark the sender's location or Earth with a gold minimap square and arena marker, last six seconds, and share a server-enforced five-second cooldown. They neither transfer letters nor award points. Spectators cannot send or see team signals.
- **Compact flight deck:** screens up to 900px wide or 600px tall keep Earth health, boost, your score, the minimap, numbered letters and Submit in the main view. Details opens the existing live bounty, meteor, power-up and standings panels plus sound/motion preferences. Phone landscape layouts at least 600px wide and at most 500px high place the collection board beside the arena. On unusually small screens, the board can scroll rather than cover the flight controls.
- **Live overlays:** Details and Signals stop held controls while open; the round continues and ships remain vulnerable. Close the overlay to resume flying. Resizing or leaving a round restores the same live panels and preference buttons to their desktop positions.

The 1.9 signal and reward checks remain in the current regression suite.

## Introduced in 1.8 (historical; tray ordering superseded by 1.10)

- **First flight:** a skippable, isolated solo lesson before a new pilot's first join, also available from the home screen. Pulse a C crystal, collect C then a deliberately unwanted X, discard X, collect A and T, and explicitly submit CAT. Practice never joins a room, adds live points or changes the shared world. Completion is remembered on this browser; skipping is remembered for this page session.
- **Suggested targets:** the server chooses a common, unused word compatible with your current letter order and available released letters/crystals. The board names the target and next letter; up to four nearby matching sources get cyan NEXT markers labeled PULSE or COLLECT. Suggestions are optional goals. Pickup behavior is unchanged. A chosen target stays stable; if another player takes its letters, the board tells you to find more by opening rocks.
- **Smart submission:** outside Review, Submit and Enter use the longest valid, unused leading word shown on the button. CATX offers “Submit CAT · keep X”; CATS offers CATS when valid and unused. It never rearranges, skips or automatically submits letters. Review allows an explicit shorter selection; choosing an invalid selection never silently submits a different word.
- **Feedback before mistakes:** each pilot receives dictionary/word-history feedback for their own tray. Unrecognized, reused or short words are explained before submission. Normal controls disable invalid submissions; the server still independently validates every attempt, deadlines and retry IDs. Previewing letters never changes scores, repairs, shield timing or combos.
- **Quick correction:** Discard last removes the latest pickup with one action. Review → Choose a letter to discard retains individual tile removal. Both use the existing one-second server cooldown and preserve the remaining order.
- **Pickup explanations:** the board explains full capacity, review, temporary protection and another pilot/team's pickup priority. Protected priority expires normally; no extra pickup rights are granted.

Browser/phone visual, touch and first-time-player playtests remain outstanding. See docs/VERIFICATION.md.

## Collection board introduced in 1.7.1

The always-visible **LETTER COLLECTION** board now shows ten large numbered slots, your collected word, a cyan NEXT slot and the current count. A brief highlight identifies new pickups; reduced motion suppresses it. The board gives explicit minimum-length and full-capacity instructions. In review, the preview separates the word being submitted from trailing letters kept for later. The Submit, Review / shorter word and Discard controls stay beside or below the tiles. Phones use two rows of five tiles; wider screens use one row of ten. Slot order always remains 01–10.

Screen readers receive a short collection announcement; interactive review tiles retain keyboard focus. This is a presentation update: ordered pickups, capacity, private trays, scoring and multiplayer authority retain their existing rules. Browser and device layout checks remain outstanding.

## Power-ups introduced in 1.7

- Every fifth consecutive valid word triggers a random eight-second power-up. Teammates share a combo; free-for-all pilots build separate combos. Invalid dictionary words or previously scored words reset that combo. Opening review, discarding and ship resets do not reset it.
- **Violet Guard / INVULNERABILITY:** incoming letters disappear on contact without damaging Earth. The shield becomes thicker and glows violet. Individual ships retain their existing protection rules.
- **EMP Blast / EMP_BLAST:** all incoming letters stop and become safe pickups for everyone. This also neutralizes new waves during the eight seconds. Letters keep their IDs and positions; EMP gives no points.
- **Slow Motion / SLOW_MOTION:** incoming letters travel at 40% of normal speed. Ships, pulses, rocks, scoring and the match clock keep normal timing. Original letter speed resumes on expiry without compounded scaling.
- Earth is shared, so power-ups benefit everyone, including opponents. A new milestone replaces the current effect and starts a fresh eight seconds. Effects do not stack. Classic defense-off rounds have no Earth power-ups.
- The server owns activation, combo counts and expiry independently for each room. The requested `currentPowerUp` and `powerUpTimer` exports mirror this state in the browser's main loop. The timer starts at 480 equivalent 60 Hz frames and derives from the server deadline: the duration remains eight real seconds at 30, 60 or 120 FPS.
- A visible arcade panel shows the combo, active power-up and countdown for pilots and spectators. Mission briefing and help explain how to earn and use them.
- Deep-purple space (`#0a0813`), a moving neon perspective grid, glowing letters and hot-pink / laser-lime / cyan particle bursts give the arena a synthwave palette. Incoming threats are pink; available ordinary pickups are lime. Reduced motion freezes the grid and disables burst particles and letter glow.

90 automated tests pass, including eight real Socket.io clients receiving matching power-ups, retry-safe milestones and reconnects preserving expiry. Browser/phone visual playtesting remains necessary. No public deployment was made.

## Mission briefing

Every pilot sees a lobby briefing with three numbered steps: stop pink incoming letters, collect and arrange tiles, and submit valid words to repair Earth. The shared survival goal, individual/team winner and zero-health failure condition are explicit.

A persistent mission strip stays above the arena for pilots and spectators, including late arrivals. Its Rules button reopens the current briefing. Launch countdowns repeat the objective; word review explains the repair reward; results label Earth saved or mission failed. All briefing text adapts to the host's team, duration and defense settings. Classic mode explicitly says defense is off. Personal word-review protection is distinguished from Earth's shield.

## Planetary defense and arcade features

- Planetary defense is enabled by default and can be switched off by the host in the lobby. All players share one Earth, including opposing teams.
- Earth is fixed at the arena core (1200, 800). The ship-following camera stays intact; a cyan direction marker and minimap ring help pilots find Earth.
- Earth starts at 100 HP. Every incoming pink letter that touches the shield is removed and costs 5 HP unless Violet Guard is active. At zero, the existing results sequence ends the round for everybody, preserves scores and declares no winner. Survive until the timer ends to decide winners by the original word scores.
- Each valid, previously unused word adds word.length × 0.5 to shield thickness, capped at 25, and repairs 2 HP up to 100. Thickness starts at 5. An unprotected breach costs 5 HP; thickness is visual progression, not extra damage absorption.
- Incoming letters arrive after 12 seconds, then every 8 seconds: one per wave with 2 players, two with 3–5, three with 6–8. Speed rises from 38 to a maximum 75 world units/second. No missed-wave catch-up avalanche; at most 16 incoming letters.
- Collect incoming letters in order, or intercept one with an existing light pulse to stop its descent. A stopped letter becomes an ordinary pickup with the usual two-second owner/team priority. Pulses and interceptions grant no points.
- Ordinary crystal, asteroid and ship-drop letters retain their existing stationary behavior. Ships and pulses pass over Earth. Its appearance adds no ship collision or damage rule.
- Cyan ten-particle shield ripples last 300 ms; weapon/word bursts alternate hot pink, laser lime and neon cyan. A brief red impact tint honors reduced motion. All particles share the existing cap of 320.
- Realistic cratered asteroid artwork, rechargeable boost, meteor showers and word bounties from the in-progress 1.5 upgrade are included. Shift/tap BOOST gives a 550 ms burst with a six-second recharge. Showers add four faster, larger rocks for 14 seconds every minute starting at 30 seconds; four hits release six letters. Bounties start at 15 seconds, recur every 45 seconds and award the first valid submission within 30 seconds a 20-point word bonus.

90 automated tests pass, including eight real Socket.io clients, isolated rooms, authoritative damage, retry-safe repairs, power-ups and synchronized early results. Browser/phone visual playtesting remains necessary; the preview browser blocked access during this build. No public deployment was made.

## Complete source in one block

The accompanying Glyphstorm_Complete_Source.md contains all first-party HTML, CSS, JavaScript/Node modules, tests and pinned package manifests in one copy-pasteable Bash block. Run it only from this extracted glyphstorm directory: it preserves the PNG assets and dependency notices supplied in this ZIP. The separate server/client files are essential to multiplayer authority; opening index.html directly is not a game server.

## Arcade feedback introduced in 1.3

- Engine trails, pulse streaks, crystal sparkles and floating letter pickups make actions easier to notice.
- Scoring a word produces a larger celebration; six-letter and eight-letter words get special recognition using the existing score.
- A live score target shows the points needed to take the lead, shared leads, or the current winning margin. Team mode uses combined team scores.
- Lead-change banners and a warmer final-30-second border make close rounds more visible. The final ten seconds have optional countdown sounds.
- Enable Sound in the top bar for pickup notes, scoring melodies and countdown cues. Reduced motion removes particle and trail animations while retaining readable feedback.

This update changes presentation, not gameplay or scoring. Spelling-order collection, the eight ships and full-circle controls remain. The automated checks pass; a browser and phone playtest is still needed to judge readability, performance and how the changes feel.

## Full-circle controls introduced in 1.2.1

Hold Q to rotate counterclockwise or E to rotate clockwise. A full turn takes two seconds at normal frame rates. Release the key to keep that heading. Move the mouse to resume cursor aiming in any direction; the heading now tracks the cursor continuously as the ship/camera moves. The right touch stick aims around the full circle and keeps the last angle when centered or released. WASD/arrows still control movement independently.

## Fleet introduced in 1.2

Eight playable ship designs are now included: Dart, Manta, Comet, Orbit, Kite, Scout, Prism and Aurora. Choose your ship in the lobby, then ready up. The crew roster previews everyone’s choice and the same hull appears on every screen during play. Your ship survives reconnects, resets and rematches. Changing it in the lobby clears your ready status.

All designs have identical movement, stability and letter collection reach. Multiple pilots may choose the same ship. A ring, name and minimap marker identify the pilot in free-for-all or the team in team mode, independently of the hull paint. Spectators choose after claiming a pilot seat in a lobby. Ship changes are locked during a round.

This builds on Version 1.1’s spelling-order collection. Physical pickups and word submissions follow the same existing rules. See docs/CHANGELOG.md.

## Updating an existing local copy

1. Stop the running server with Control+C and extract this ZIP into a fresh folder.
2. In the new glyphstorm folder, run npm ci and npm start.
3. Open http://localhost:3000 and reload all player tabs. The startup banner and /health identify version 1.10.0; the home screen shows GLYPHSTORM / 1.10.0.
4. Create a fresh room, invite another pilot, select ships under Choose your ship, then ready up and launch.


## Run locally

Requires Node.js 22 or newer.

~~~sh
npm ci
npm start
~~~

Open http://localhost:3000. Open a second browser tab to join the same room with another name. The private session token is stored per tab, so separate tabs can represent separate players. For a phone on your local network, use the computer's LAN address and port 3000, subject to your firewall. The production deployment uses HTTPS.

Development with automatic server restarts: npm run dev. Restarts end in-memory rooms.

## Verify

~~~sh
npm run check
npm test
~~~

The tests cover gameplay invariants and real Socket.io connections from eight independent clients. They do not substitute for phone, laptop, visual, or usability testing. Read docs/VERIFICATION.md for completed checks and the remaining release checklist.

## Rules

- 2–8 active players; free-for-all or two equal teams.
- Host-selectable 3/5/7-minute rounds, with 5 minutes the default.
- Ten-letter inventory. Physical contact appends each pickup; rearrange the tray afterward by drag or tap-to-swap.
- Submit the full tray or explicitly select one contiguous range. Shorter word arranges and selects the longest valid unused word; unused tiles on both sides remain.
- Discard any unwanted tile, at most once per second. Shuffle has a three-second cooldown and does not change the inventory.
- English words of 3–10 letters. A word scores once per player per round.
- Base score = the tiles' values plus 2 × (length − 3)². A used star doubles that base once; multiple stars do not stack. An active, unclaimed matching word bounty adds 20 points once globally, after the multiplier.
- Crystal letters have 2 seconds of pickup priority for their opener and teammates.
- Asteroids take three pulse hits and release four letters, with at least one vowel. Labels identify occasional extra vowel, double-score tile or shield recharge rewards. The final pulse's pilot and teammates get the same 2-second priority. Asteroids award no points directly.
- Word review stops the ship and gives up to 8 seconds of protection. Submitting, canceling, or reaching the time limit ends the shield and starts a 15-second cooldown.
- Optional opponent disruption; no friendly fire. Three unprotected pulse contacts cause a 3-second reset and up to 3 dropped letters. Earned points remain.
- Late arrivals spectate. Players return to the same lobby between rounds.
- Shared wins for tied final scores when Earth survives, or when defense is disabled. Zero Earth health ends a defense round with no winner.

Desktop: WASD/arrows to move, Q/E to rotate continuously through 360 degrees, mouse to aim freely, hold left mouse button to pulse, Shift to boost, Enter to submit the full tray or selected range, Space to open shielded word review, Escape to resume flying. Drag tiles to reorder, or tap two to swap. Select range chooses start/end tiles; Use all clears the range. Shorter word arranges the longest possible unused word. Backspace/Delete removes the selected or last tile; R shuffles. On touchscreens: the left stick moves and the right stick aims/pulses. Tap two tiles to swap; long-press reveals ×. Controls retain their existing names.

## Deployment

The application serves its frontend and Socket.io backend from one Express HTTP server. It listens on 0.0.0.0 and the host-provided PORT (default 3000). /health returns service status.

Render is a proposed host, not an already-created deployment. A publisher account and source repository or Docker image are needed. Players need no hosting account. See docs/DEPLOYMENT.md.

The render.yaml configuration uses the Free instance type for development/staging. Render's Free services sleep after inactivity; choose and approve an always-on service before relying on an instant-open competition link. No paid service is provisioned by this source package.

The Dockerfile is included as another deployment option; it has not been built in this workspace.

## Architecture

- server/game.mjs: authoritative room state and gameplay simulation.
- server/index.mjs: Express, Socket.io, sessions, limits, snapshots, and lifecycle.
- server/word-guide.mjs: private full/range validation, anagram advice, common-word suggestions and pickup explanations.
- server/word-index.mjs: cached multiset dictionary index, tile mapping and star-aware word offers.
- server/letter-supply.mjs: weighted letters, vowel balance and bounded nearby supply.
- public/tray-controls.js: drag/swap ordering, range selection and action-guided tip state.
- public/word-guide.js: stale-advice guards and explicit selection presentation.
- public/practice.js: isolated first-flight lesson model and mouse/keyboard/touch controller.
- server/dictionary.mjs: locally loaded dictionary and name filtering.
- public/app.js: lobby, HUD, word builder, controls, reconnect, and results.
- public/aim.js: full-circle keyboard, mouse and touch aiming with stable heading handoff.
- public/match-feedback.js: score-gap display, deduplicated word celebrations, lead alerts and countdown cues.
- public/arena.js: Canvas drawing, camera, interpolation/prediction, effects, minimap.
- public/asteroids.js: cached cratered rock texture, procedural fallback, charge lights and letter-count labels.
- public/defense.js: named browser state mirrors, room-state factory, constants and swept-contact geometry.
- public/planet.js: original cached Earth illustration and power-up-aware shield drawing.
- public/power-ups.js: power-up enum, constants, room state factory, browser mirrors and HUD presentation.
- public/neon.js: shared synthwave palette, moving grid and letter glow.
- public/objectives.js: shared mission briefing plus bounty and meteor timer presentation.
- public/assets/asteroids/rock-v15.png: generated rocky asteroid sprite; prompt/provenance in docs/ASTEROID_ART.md.
- public/rules.js: shared public constants and score values.
- public/fleet.js: shared ship IDs, names, and asset paths.
- public/ship-sprites.js: preloaded, cached Canvas textures with a vector fallback.
- public/assets/ships/: eight original transparent PNG ship sprites.
- test/: rules and eight-client network tests.

The server validates actions and resolves pickups, word consumption, scores, Earth damage/repairs, combo milestones, power-ups and round deadlines. Browser-level earthHealth, barrierThickness and maxBarrierThickness mirror snapshots only; every room owns an independent authoritative defense object. Clients send intentions, not trusted positions or points. Critical actions carry unique IDs for safe retries; movement uses volatile input packets. Rooms are separate.

## Current limits

- One Node.js instance with in-memory rooms. Do not scale to multiple instances without adding shared state and coordinating room ownership.
- Active matches do not survive a server restart or redeployment.
- A temporary client disconnect reserves the player's seat for 30 seconds; the world continues, and disconnection grants no immunity.
- A departed player's earned points remain in the current round's final standings.
- The initial room cap is 60 as a safety bound, not a demonstrated capacity claim. Each room allows 8 active players and 8 spectators.
- The dictionary has 192,308 filtered 3–10-letter entries in this pinned version. It includes uncommon words. Filtering is imperfect.
- The game is implemented and automated tests pass, but it is not yet publicly deployed or verified on real phones and laptops.

## Competition

The contest's official cutoff is October 30, 2026, at 11:59 p.m. Pacific (October 31, 2:59 a.m. in New York). Prepare the final URL, title, cover image, and description and submit personally through the designated Handshake mission. A source ZIP alone is not a completed public-game submission.

The nonviolent visual direction follows the user's decision. Neither source creation nor automated testing constitutes organizer approval or an eligibility guarantee.

See THIRD_PARTY_NOTICES.txt for dependency and dictionary licenses.
GLYPHSTORM_B335630551682C19

# FILE: docs/ASTEROID_ART.md
cat > 'docs/ASTEROID_ART.md' <<'GLYPHSTORM_5C90934291487628'
# Asteroid artwork provenance

Generated for Glyphstorm using the built-in image generation tool (transparent background). Output was copied unchanged to public/assets/asteroids/rock-v15.png. The browser decodes it once into a 384-pixel Canvas cache; no separate image-editing service was used. Earth is drawn in code in public/planet.js.

Final generation prompt:

Use case: stylized-concept. Asset type: transparent game sprite for Glyphstorm, a top-down HTML5 Canvas space arena. Primary request: one highly realistic irregular rocky asteroid, an isolated complete object, three-quarter orthographic view, no perspective background. Pitted charcoal-grey and warm mineral stone, deep impact craters, chipped ridges, layered fractured geology, rough granular regolith, tiny mineral flecks. Physically believable 3D volume with soft neutral sunlight from upper left, readable half shadows and subtle cool fill light. Silhouette roughly round but asymmetrical, compact with no protrusions, fills about 86 percent of a square canvas, perfectly centered and entirely inside the image. Medium dark stone with enough bright edge definition to read on a very dark space arena. This is a single floating rock, not a planet. No fiery effects, glow, rings, typography, symbols, letters, numbers, labels, UI, watermark, cast ground shadow, starfield or additional objects. Actual transparent alpha around the object. High fidelity game-ready material detail.
GLYPHSTORM_5C90934291487628

# FILE: docs/CHANGELOG.md
cat > 'docs/CHANGELOG.md' <<'GLYPHSTORM_2BFAB3DB5CC1BAF4'
# Glyphstorm 1.10 — Flexible word tray and recovery

October 29, 2026.

- Replace the leading-prefix submission restriction with full-tray or selected-contiguous-range submission; retain physical pickup order and server ownership validation. Add desktop drag, tap-to-swap, any-tile deletion, free three-second Shuffle, live validation, longest-word selection and highest-score hints.
- Add cached multiset dictionary analysis, useful-letter outlines, dead-tray guidance, Smart discard, rate-limited recovery vowels and a forty-five-second zero-score nudge. A reserved vowel waits for a full tray to make room; removing tiles cannot create anagrams, so Smart discard preserves words and chooses useful recovery space.
- Weight letter generation, target 35–40% field vowels, bias local supply to tray needs, add bounded nearby pickups and a small eligibility-aware magnet. Keep far-field base density, rare-letter values and incoming threat trajectories.
- Make bounty choices achievable from the field plus an individual pilot's tray. Preserve +20 and once-only claims. Add labeled asteroid bonus vowels, star tiles and personal word-shield recharges; stars double the base word score once without multiplying the bounty.
- Move score/feed to the upper-left corner and review into the tray flow. Add a visible combo meter, shield timer, Earth damage ring/number/shake/Integrity pulse and world-space wave countdown, with reduced-motion alternatives.
- Simplify the lobby flight brief and add dismissible, action-guided live tips saved in localStorage. Preserve solo practice, rooms/invites, all ships, modes, settings, controls, match timing, physics, weapons, defense, disruption, waves, minimap, Boost and existing power-ups.
- Extend the existing authenticated, retry-safe action handler for arrange, shuffle and Smart discard. Add 24 automated cases (114 total) and update earlier tests whose ordered-prefix or always-STAR bounty assumptions were intentionally superseded.

Verification: all 114 tests and JavaScript syntax checks pass. Static HTML/import checks preserve every existing DOM ID and all artwork. Browser visual and physical-phone playtesting remains pending because browser observation was blocked by security policy. This update does not deploy a public service.

---

# Glyphstorm 1.9 — Competition polish

October 28, 2026.

- Add bounded word-to-Earth letter energy and a shield ripple, with a stationary reduced-motion alternative. Report actual capped HP and shield growth in authoritative scoring events/history and the existing score celebration.
- Add preset letter requests for teammates and Earth-defense calls. Derive sender, team, scope and position on the server. Enforce a five-second cooldown, six-second lifetime, spectator restrictions and per-recipient snapshots. Reuse action retry IDs; preserve cooldown on reconnect and clear signals at rematch.
- Move secondary live panels into Details on compact screens, keep essential flight/collection controls visible and use a side board in short landscape layouts. Restore the same DOM nodes on resize and exit; preserve sound/motion access.
- Gate keyboard, mouse and touch input while live dialogs are open. Explain that the round continues. Repair a stray closing tag in the existing game markup.
- Preserve ordered physical pickups, spelling, ship physics, weapons, asteroids, power-ups and word-only scoring.

90 automated tests pass. New checks cover cap-accurate feedback, signal validation/privacy/expiry, reconnect and retry safety with eight Socket.io pilots, torus effect geometry, bounded/reduced motion rendering and responsive panel relocation. An older rendering test creates its arena without the constructor; its fixture now initializes the new effect module. Browser/phone and newcomer playtests remain outstanding; no public deployment was made.

---

# Glyphstorm 1.8 — Guided first flight

October 27, 2026.

- Add optional solo practice before a first join and a replay button on the home screen. Teach pulsing, ordered collection, discarding a mistake and explicit scoring without changing live rooms or scores.
- Add private server dictionary previews and common-word suggestions with cyan PULSE/COLLECT markers. Preserve physical pickups and collection order.
- Label Submit with the longest valid unused leading word and retained letters. Preserve explicit Review selection; never submit automatically or silently substitute for an invalid reviewed word.
- Explain short, unknown and reused words before a normal submission. Retain server validation and existing score, repair, combo and retry behavior.
- Add Discard last and retain individual discard inside Review, using the existing shared cooldown.
- Explain blocked pickup from capacity, review, temporary protection and another pilot's priority. Keep private notices out of public player snapshots.
- Update mission/help copy, cache versions and the complete-source package.

New automated checks cover prefix choice, stale advice, scoring/repair invariants, suggestions, blocked pickup, correction, the isolated lesson and private advice to eight clients plus a spectator. Browser/device visual and onboarding playtests remain outstanding.

---

# Glyphstorm 1.7.1 — Clear letter collection board

October 27, 2026.

- Replace the understated tray presentation with a prominent LETTER COLLECTION board, a live word preview and ten large numbered slots.
- Mark the next available slot in cyan, highlight newly collected tiles briefly and clearly warn when all ten slots are full. Reduced motion suppresses the pickup animation.
- Keep Submit, Review / shorter word and Discard visible. During review, show the selected leading word separately from letters that will be kept.
- Use two rows of five tiles on portrait phones and one row on wider displays, outside the arena's touch controls.
- Add collection announcements for screen readers and preserve focus when review tiles refresh. Server-authoritative private inventories and all gameplay rules stay intact.

Existing gameplay tests, source syntax and static DOM checks are recorded in VERIFICATION.md. Browser and real-device visual playtesting remains necessary.

---

# Glyphstorm 1.7 — Neon arcade power-ups

October 27, 2026.

- Add three modular, server-authoritative power-ups: Violet Guard, EMP Blast and Slow Motion. Every five consecutive valid words triggers a random effect for eight real seconds, represented as 480 equivalent frames.
- Share combo counts within each team; keep separate counts in free-for-all. Invalid/reused words reset only their owning combo. New milestones replace the active effect without stacking. Critical-action retries cannot count a word or activate a power twice.
- Violet Guard consumes incoming letters without Earth damage or red damage feedback and gives the shield a thick violet glow. Ships keep their original protection rules.
- EMP preserves incoming letter identities and positions, converting them into ordinary safe pickups. It continues neutralizing new arrivals for eight seconds and awards no points.
- Slow Motion applies a 0.4 displacement multiplier without mutating base velocity. Server collision paths and client interpolation use the same multiplier. Ship and pulse physics stay unchanged.
- Reset power-ups on finish and rematch, preserve their original expiry on reconnect, and keep rooms isolated. Defense-off mode retains classic scoring without power-ups.
- Add combo/effect/countdown HUD, shared activation announcements, optional sound and explicit rules in the mission briefing/help for players and spectators.
- Add deep-purple space, a moving neon perspective grid, ten-pixel letter glow and high-velocity pink/lime/cyan bursts. Pink letters identify incoming threats. Reduced motion freezes the grid and suppresses letter glow and particles.
- Preserve generated fleet/asteroid art, ordered physical collection, weapons, defense repairs, bounties, boosts and meteor showers.

76 automated tests pass. New checks cover all three random branches, milestones, team scope, reset/replacement/expiry, multiple frame rates, safe EMP pickups, shared snapshots, retry safety and reconnects. Canvas checks use a recording context. Browser and real-device visual/audio playtesting remains outstanding; no public deployment was made.

---

# Glyphstorm 1.6.1 — Make the mission visible

October 27, 2026.

- Add a prominent lobby briefing for every pilot, showing the three actions, shared Earth, word-only scoring and explicit win/fail conditions.
- Keep a mission ribbon and Mission & rules button visible for pilots and spectators throughout play.
- Adapt one shared description to defense on/off, free-for-all/teams and the selected round duration. Use it in lobby, help, launch countdown and HUD.
- Explain personal word-review protection separately from Earth's barrier, show the Earth repair reward during word review, and label Earth saved/mission failed on results.
- Put mission guidance outside the flight/touch surface with responsive layout rules.

65 existing automated tests pass. Fixed/dynamic briefing DOM IDs and module imports resolve; all four defense/team descriptions were inspected. Browser security previously blocked visual testing; a real browser/phone playtest remains required. No gameplay or server mechanics changed.

---

# Glyphstorm 1.6 — Shared planetary defense

October 27, 2026.

- Add 100-HP shared Earth at a fixed world position, a neon shield starting at thickness 5, capped at 25, and a lobby toggle (default on).
- Incoming orange letters join the existing bounded letter array. Waves scale from one to three letters with player count; existing crystal, asteroid and ship-drop spawns stay intact.
- Use swept relative motion for moving-letter pickups, pulse interceptions and shield breaches. Collect before impact to save a tile; a later collection or pulse cannot reverse an earlier breach. Exact simultaneous pickup/breach ties favor the barrier. Nearest solid targets still block pulses.
- Remove a breached incoming tile immediately, deduct 5 HP once, and call the existing finish flow at zero. Preserve scores, distinguish Earth loss from a timed finish, and reset defense on rematch.
- Validated unique words repair 2 HP and grow the shield by half their length with hard caps. Existing critical-action IDs prevent repeated scoring or repairing on retries.
- Add cached Canvas Earth artwork, off-screen direction marker, minimap objective, health meter, shield level and wave status. Keep the camera, ship physics and existing full-circle controls.
- Add 300-ms cyan particle rings, green/orange high-velocity action bursts and a brief red impact tint; retain particle bounds and reduced-motion preferences.
- Include the completed 1.5 arcade upgrade: generated realistic asteroid texture, 550-ms boost/6s recharge, timed meteor showers and globally first-claimed +20-point word bounties.
- Test servers can disable the wall-clock interval while advancing their injected clock explicitly, eliminating duplicate simulated ticks in network fixtures. Production retains its 30-Hz interval.

65 automated tests pass. Eight connected clients agree on boosts, bounty claims, repairs, meteor rocks and fatal defense results. Reconnect restores the final defense state, and other rooms remain unaffected. Visual browser and real-device testing remains outstanding; browser policy prevented the preview. No public hosting changes.

---

# Glyphstorm 1.4 — Letter asteroids

October 20, 2026.

- Add eight drifting, replenishing asteroids alongside the existing 44 crystals.
- Three light-pulse hits release four distinct collectible tiles with at least one vowel. Release positions spread out and seek clearance from nearby solid bodies.
- The final pulse's pilot/team receives two seconds of pickup priority. Existing tray capacity, physical spelling order, letter expiry and word-only scoring remain.
- Resolve the nearest crystal or asteroid along a pulse path, including wrapped edges. Consume each pulse once and release each asteroid's letters once under simultaneous hits.
- Add original Canvas rock/crater artwork with glowing seams, three charge lights, a four-letter label and gold minimap dots.
- Add charge tones, an opening melody, a burst of light and an opener announcement; honor sound and reduced-motion preferences.
- Synchronize asteroid position and remaining hits through server snapshots. Clear asteroids in the lobby and start each round fresh.
- Update the home page, flight manual and launch hint with the new rules.

44 automated tests passed. Tests cover simultaneous hits, final-pulse priority, teammates, four distinct letters and a vowel, physical pickup order, tray/world limits, wrapped collision, harmless nudging, deadlines and rematches. Eight real Socket.io clients agree on progress and the released tiles after actual client pulse input. Canvas call paths run in a recording context; browser/phone visual testing remains outstanding. This is a source download, not a hosted deployment.

---

# Glyphstorm 1.3 — Arcade feedback

October 20, 2026.

- Add short engine trails and light-pulse streaks, bounded crystal/word particles, and floating collected letters.
- Celebrate valid words with their actual points, plus special recognition for longer words. Scores and gameplay rules are unchanged.
- Show a live score target: points needed to take the lead, current lead margin or a shared lead. Team mode combines team scores, including retained departure points.
- Announce lead changes and ties. Emphasize the final 30 seconds with a warm border, notices and optional final-ten-second audio.
- Add optional pickup notes, scoring melodies and lead sounds with rate limits. Sound remains off by default; reduced motion removes trails, particles and arrival animation.
- Timestamp server presentation events so old effects do not replay after a delay. Deduplicate acknowledgement/snapshot word celebrations and preserve reconnect history.
- Cap particles at 320 and each ship trail at 14 samples; avoid rebuilding the scoreboard on every unchanged snapshot.

36 automated tests passed, including all prior gameplay and eight-client network tests. New checks cover score gaps, teams, ties, retained scores, reconnect/deduplication, countdown cues and bounded/reduced-motion effects. Browser, phone and audio playtesting remains necessary. This source package does not update a hosted site.

---

# Glyphstorm 1.2.1 — Full-circle rotation controls

October 20, 2026.

- Added continuous Q/E turning: Q counterclockwise, E clockwise. WASD/arrows remain independent movement controls.
- Releasing the turn keys keeps the current heading; a stationary old mouse position cannot snap it back. Moving the mouse resumes free aiming.
- Recompute cursor aiming each frame as the ship and camera move. Listen across the arena wrapper and capture an active mouse press so dragging beyond the canvas does not lose aim input.
- Retain the prior heading at the cursor center and joystick dead zone. Joystick direction covers all quadrants without up/down snapping.
- Restore the authoritative heading on reconnect and clear held aiming input on blur, help, and word review.
- Add rotation instructions to the flight manual and desktop arena HUD. Refresh entry versions to 1.2.1.

29 automated tests passed. New regression checks cover full rotations at 30/60/120 FPS, pointer/touch vectors throughout the circle, moving-origin aiming, every hull's actual Canvas rotation call path (using a recording context), and server pulse headings across the 0/360 boundary. These are automated code checks, not a visual browser/device playtest.

---

# Glyphstorm 1.2 — Explorer fleet

October 20, 2026.

- Added all eight generated ship sprites to the local game.
- Added an accessible lobby picker with names, previews, selected state, and keyboard/touch buttons.
- Show each pilot’s hull and ship name in the crew roster.
- Server validates hull IDs, limits selection to seated lobby pilots, and resets readiness on a changed choice. Changes during countdown, play or results are rejected.
- Broadcast the selected hull with player snapshots; reconnects, resets and rematches preserve it.
- Cosmetic hulls have the same movement, stability, collection radius, scoring, and disruption rules. The original spelling-order gameplay is retained.
- Pilot/team identity uses a ring, name and minimap marker independent of hull paint. New pilots receive an unused identification color where available.
- Decode graphics once and cache 256px Canvas textures. The original vector craft remains playable if a sprite has not loaded or fails to load.
- Revalidate scripts/styles on reload and version the entry files so the update does not keep the previous renderer in browser cache.
- Correct the health endpoint version and update the startup/home version labels.

25 automated tests passed, including eight independent Socket.io clients agreeing on hull choices, invalid-choice rejection, reconnect/rematch persistence, equal physical collection reach across all hulls, and successful HTTP delivery of every PNG. Visual browser and phone testing still needs a local playtest. This update is a source download; no public deployment was made.

---

# Glyphstorm 1.1 — Steer to spell

Requested after the first local playtest, October 16, 2026.

## Playing

- Open crystals with light pulses as before.
- Touch released letters in the order your word needs them: C → A → T produces CAT.
- Steer around letters you do not want. There is no automatic selection of needed letters.
- Numbered tray slots show the collected sequence. Typing letters or clicking out of order cannot rearrange it.
- Enter, or the Submit word button, submits the collected sequence directly.
- Space, or Review / shield, stops the ship and opens the existing temporary shield. Review shows the word already collected.
- In review, tap the last tile of a shorter word to use the first N letters. Unused trailing letters stay. For CATS, selecting position 3 submits CAT and keeps S.
- Discard a letter removes one mistake, subject to the existing one-second limit. The rest retain their relative order.
- Physical pickups use first contact along the movement path, with wrapped-edge support. A nearby letter outside the contact area is not collected.
- No letters are collected during word review, including after shield expiry.

## Update your local copy

1. End the current test round and stop the old server with Control+C in Terminal.
2. Extract this updated ZIP into a new folder, keeping it separate from the old copy.
3. In Terminal, change into the new glyphstorm folder containing package.json.
4. Run npm ci, then npm start. The startup banner identifies version 1.1.
5. Reload every player browser tab. Create a fresh room and join with at least two pilots.
6. Collect letters in an intentional spelling order, avoid a nearby unwanted tile, and press Enter to score. Test a shorter leading word in review and check that trailing letters remain.
7. Compare the score on the second player screen. Send screenshots and the exact steps for any issue.

23 automated tests passed. The updated browser layout and physical feel still need local device playtesting. This source package does not deploy a public service.
GLYPHSTORM_2BFAB3DB5CC1BAF4

# FILE: docs/DEPLOYMENT.md
cat > 'docs/DEPLOYMENT.md' <<'GLYPHSTORM_EA9864292E6E392D'
# Publishing Glyphstorm

Status: source prepared; no public service created.

## Render setup

1. Put the contents of the glyphstorm directory in a Git repository you control, preserving package-lock.json.
2. Connect the publisher's Render account to that repository. Use a **Web Service**, not a Static Site.
3. Select the Node runtime.
4. Build command: npm ci --omit=dev.
5. Start command: npm start.
6. Set NODE_ENV=production and use Node 22 or newer.
7. Set the health check path to /health. The server reads Render's PORT variable.
8. Choose the hosting plan deliberately. The included Blueprint uses Free for staging. Free services can sleep after 15 minutes without incoming traffic and take approximately a minute to restart; use an approved always-on plan for the competition's instant-access experience.
9. Deploy one instance. Both HTTP and Socket.io use the same public origin and port.
10. Open the assigned HTTPS URL in a signed-out browser, create a room, and join from a different device. Complete the release checklist in VERIFICATION.md.

Render requires a source repository or deployment image and a hosting account. Connecting its ChatGPT integration can enable deployment assistance, but a connection was not available when this package was built.

No custom domain is required. No API keys are needed for word validation or gameplay.

## Operational notes

Do not deploy updates during an organized match: rooms are in memory and are lost on process restart. The server emits a shutdown notice on a graceful stop. Short client reconnection is supported while the server continues running.

Do not enable multiple instances without redesigning room ownership and adding shared state. The existing process is the authority for all rooms it serves.

Keep the production URL available during judging. A successful deploy must be followed by actual multi-device play, not just a successful /health response.

## Hosting documentation

- https://render.com/docs/web-services
- https://render.com/docs/websocket
- https://render.com/docs/free

The official public competition documents reviewed do not name a mandatory hosting provider. Additional signed-in mission requirements, if any, should be checked before entry.
GLYPHSTORM_EA9864292E6E392D

# FILE: docs/VERIFICATION.md
cat > 'docs/VERIFICATION.md' <<'GLYPHSTORM_A62592CF28CA8D06'
# Verification record

## Current build: 1.10.0 · October 29, 2026

`npm run check` passes all JavaScript syntax checks. `npm test` passes 114 tests, including real Socket.io connections. HTML nesting is balanced: 188 unique IDs and 122 fixed app references, with every pre-existing ID retained. Local imports resolve and all ship/asteroid artwork is byte-for-byte unchanged. The review panel is a child of the tray; the score/standings/feed share an upper-left container. These are structural checks, not rendered screenshots.

### Requested cases (a–h)

| Case | Result and evidence | Remaining manual check |
| --- | --- | --- |
| (a) Rearrange and submit | Pass: actual drag-order and two-tap-swap controllers turn XTACY into XCATY. Server accepts selected CAT once and preserves XY. Two live clients agree on score and their private trays. | Desktop native drag/drop and phone taps in a browser. |
| (b) Discard middle | Pass: removing X from CXAT preserves CAT; cooldown and duplicate-network retries cannot discard twice. | Click/long-press × and Backspace/Delete interaction. |
| (c) Full dead tray | Pass: QZXJKQZXJK has no possible words, a Smart discard and highlighted candidates; the non-blocking hint branch is wired. Solvable trays are not falsely labeled dead. | Visual prominence and readability. |
| (d) Recovery vowel | Pass: absent before twenty seconds, delivered at twenty, no second gift before forty-five seconds; progress defers it. Full trays reserve a vowel and receive it once when space opens. Review/reset/disconnection defer automatic delivery. | Gift animation and reserved-vowel text. |
| (e) Invalid Submit | Pass: live full/range validation rejects invalid/reused/stale advice; both Submit controls use validity; server independently rejects invalid payloads. | Gray/disabled appearance and single inline error. |
| (f) Score versus Earth | Structural pass: score moved into the upper-left HUD; review is in the board flow rather than over the arena. | Actual desktop/phone overlap at different camera positions. |
| (g) Two-player room | Pass: two clients join the same room, ready/start, arrange, submit, preserve leftovers, receive scores and retry Shuffle/discard/Smart discard safely. Existing eight-client suites also pass. | Two physical devices on the public host. |
| (h) Mobile layout | Controller/structural pass: tap-swap/range state and compact HUD relocation tests pass; both original sticks remain; board has responsive scroll and landscape placement. | Real phone portrait/landscape, touch targets, safe areas and scrolling. |

### Additional automated checks

- The reported ETANGLEENC inventory has many valid subsets/anagrams in the actual bundled dictionary. ELEGANCE scores 61 base points. Best-word advice never mutates or scores inventory; Shorter word uses server-authorized ordering before normal submission.
- Forged/duplicate/partial/stale reorder inventories fail without changing tiles. Submissions require a real contiguous range and explicit review; unused tiles and unused stars remain. All three new actions use existing phase/role/deadline/rate/retry protections.
- Smart discard ranks words retained and then possible recovery vowels. Weighted frequencies keep J/Q/X/Z/K rare and their existing values. Supply targets the field vowel band, stays local and does not change collected, released or nearby crystal letters during balancing.
- Magnet respects pickup priority, capacity, protection, review, nearest useful selection, torus seams and 42px/second speed; incoming letters are untouched.
- Bounties never combine rivals' private trays. Asteroid rewards preserve normal letter counts except the labeled extra vowel, existing hits and two-second priority. Stars multiply base score by two only once and leave the +20 bounty unchanged. Active word shields bank one recharge without extending the running shield.
- Live tips advance only on matching actions; saved completion suppresses them. Zero-score hints prefer a short available word at forty-five seconds. There is no bot subsystem; human word feed uses deduplicated real events.
- Recording Canvas checks show the Earth impact ring and wave countdown, including static reduced-motion warning. Existing tests cover fatal damage, shielding, EMP, Slow Motion, waves, scoring repair, particle limits, ship rotation, collision ordering, team privacy, invitation rooms, reconnect and rematch.

### Required browser/device playtest

Automatic approval/security review rejected browser observation of the local game in this environment. No alternative browser route was used. No visual, audio, mobile-device or hosted-latency pass is claimed.

1. Run `npm ci`, `npm start`; confirm 1.10.0 on the home screen. Use two independent browser sessions and a phone in one room. Keep existing modes and round settings.
2. Collect at least six letters. Drag, tap-to-swap, Select range in either direction, Use all, Shorter word, and submit. Confirm the preview, score, retained tiles and Earth repair agree. Hit Enter while a tile has focus.
3. Select and discard a middle tile, then use Discard last. Long-press a tile for ×. Shuffle twice rapidly and confirm the three-second cooldown. Fill an unspellable tray and verify guidance; remain without pickups/submits for twenty seconds, then free a slot for its reserved vowel.
4. Open review while incoming letters approach. Check its timer, non-modal position and close action; review stops flight/collection as before, and shield timeout does not pause the round. Invalid words should have gray/disabled Submit with no duplicate toast.
5. Let one incoming pink letter breach: confirm −5, Earth ring flash, Integrity pulse and brief shake. Toggle reduced motion and repeat. Check the near-Earth/offscreen wave countdown and 3/5 progress meter.
6. At 320/375/390px portrait and phone landscape sizes, inspect Earth, corner score, both sticks, ten tiles and all actions. Scroll only the board when needed. Rotate while review is open and make sure it remains usable. Verify original Details, Signals and preferences.
7. Try each labeled asteroid reward, a bounty, teammate collection priority, disruption, Boost, spectators, reconnect, rematch and defense-off rounds. Check no existing feature regressed.

Complete source packaging checks exact file bytes, heredoc round-trips, Bash syntax and ZIP CRC. No public deployment is included.

---

## Previous build: 1.9.0 · October 28, 2026

- `npm run check` passes for all server/client modules; `npm test` passes all 90 tests.
- Eight Socket.io pilots, a spectator and a separate room verify that team letter requests never appear in opponent/spectator/public snapshots. Forged sender/team/scope fields are ignored. Duplicate requests produce one signal, reconnect preserves its cooldown, and spectators cannot signal.
- All nine screens in the room agree on word score events and actual capped rewards. Retried submissions never repair twice; client-supplied reward amounts are ignored.
- Server tests cover five-second cooldown, six-second expiry, invalid presets/letters, classic mode, FFA broadcasts, phase/role restrictions and rematch clearing. Signals leave letters, score and Earth HP unchanged.
- Word energy follows short torus paths, skips old/replayed events, caps active effects at 16 and clears at results. A recording Canvas verifies that reduced motion draws stationary rings without moving letter glyphs. Reward text distinguishes +1 HP at 99, full HP, partial shield growth and a capped shield.
- A DOM fixture verifies that compact panels retain identity and live values, restore desktop order and close on resize/exit. This is a controller test, not a browser layout check.
- Static checks: 173 unique HTML IDs, 110 fixed app DOM references, 32 local browser imports and balanced HTML nesting. The arena, tray and review panel remain inside the game section.
- Complete source and ZIP are checked for exact source equality, Bash syntax, round-trip heredocs and ZIP CRC during packaging.

### Device and first-time-player checks still required

1. Start this version in a fresh extracted folder; join a room from a laptop and phone. Verify the version reads 1.9.0. At 320/375/390px portrait widths and phone landscape sizes, check Earth health, arena, both sticks, all ten slots and Submit. Open Details for power-ups, bounties, meteor timers, standings and preferences. Rotate and close; confirm the controls do not stick.
2. Score a word near Earth and far away, including across the world seam. Observe letter energy and the shield ripple. Compare score and repair text on all screens. At full health/shield, confirm no nonexistent repair is claimed. Enable reduced motion and repeat.
3. With four or eight pilots in teams, request a letter and send Defend Earth. Verify only teammates see the feed and gold minimap marker, requests use the sender's location, and defense points to Earth. Try repeatedly, reconnect, then rematch. In FFA, verify only the shared defense preset appears.
4. Open Details/Signals while moving or holding pulse, including with two fingers on the sticks. The round must continue, controls must stop and resume only after fresh input. Test Escape and keyboard focus. No protection is granted by these dialogs.
5. Give five new players no verbal instructions. Record time to first valid word (target under one minute), whether they can correct an unwanted pickup, and whether they can explain why words repair Earth. Use these observations to adjust the briefing before submission.
6. Test the actual public deployment from separate networks and phones, including joining, reconnecting, the end screen and rematch. This package has not been publicly deployed or verified at a public URL.

The available browser path remains blocked by its security policy; no browser, touch-device or new-player usability pass is claimed.

## Historical verification

Version 1.8.0 guided first-flight update: October 27, 2026. All 84 automated tests pass.

## Guided first-flight checks (1.8)

- All 84 automated tests pass; all JavaScript syntax checks pass.
- 152 unique HTML IDs, 109 fixed JavaScript DOM references and 26 local browser-module imports resolve. Version markers agree on 1.8.0.
- Prefix advice chooses CAT from CATX, CATS from CATS when unused, falls back to an unused shorter prefix and never rearranges CAXT or TAC. Invalid explicit Review selections are not silently replaced; stale advice cannot submit.
- Repeated previews do not score, repair Earth, change a combo or consume tiles. The normal validated submission scores the selected leading word once and preserves its suffix.
- Suggestions use common dictionary words, existing prefixes and eligible letter/crystal supply, remain stable and report missing supply without forcing pickups.
- Blocked pickup notices remain private, expire and respect priority, review, protection and capacity. Existing collision/ordered-collection tests continue to pass.
- Discarding the last letter preserves all earlier tile IDs and order, and respects the shared one-second cooldown.
- The practice model requires a pulse, C then X pickups, explicit X discard, A then T pickups and explicit submission. A new practice run starts with zero points; it has no networking or live-room access.
- Eight Socket.io pilots receive only their own word advice. A spectator sees no private advice. A suggested-prefix submission retains X, ignores forged advice and scores exactly once under request retry. New client modules are available over HTTP.

## First-time-player playtest still required

1. Open a fresh browser profile, enter a pilot name and choose Create or Join. Complete First flight with mouse/keyboard, then separately with both touch sticks. Pulse C, collect C and X, discard X, collect A and T and submit CAT. Confirm live score starts at zero.
2. Try Skip, close, replay from the home screen and returning after completion. Practice must never join a room until Continue/Skip & join is chosen, or pause any existing room.
3. In a match, compare suggestions against cyan NEXT markers. PULSE marks crystals, COLLECT marks released letters. Confirm all physical pickups still occur in contact order, including unwanted letters.
4. Build CATX. Confirm the button explicitly offers CAT and keeps X, on Enter and touch. In Review, choose the whole invalid sequence and confirm submission is disabled with a reason. Check a valid longer word and a reused word.
5. Use Discard last; try it twice within a second. Use Review → Choose a letter to discard and remove a middle mistake. Confirm the remaining letters retain their order.
6. Try collecting with a full board, during review, while temporarily protected and during another pilot's priority. Confirm the explanation is appropriate and disappears when the block ends.
7. Inspect phone portrait/landscape layout, practice controls, button labels, focus, audio and reduced motion. Have five new players try without verbal explanation; record first-word time and whether they can correct a pickup and explain the Earth objective.

The browser path remains blocked by its security policy. These are automated code/network checks, not a claim of browser, touch-device or new-player usability testing.


## Collection board checks (1.7.1)

- All 76 existing automated gameplay/network tests pass after the presentation update; Node syntax checks pass.
- An existing rotation check initially hit a randomly generated asteroid, consuming its test pulse. Its fixture now clears rocks and disables replenishment so heading checks use an unobstructed firing path. Gameplay code was not changed for this test fix.
- All 136 DOM IDs are unique, 96 fixed DOM references resolve, and all 22 local browser imports resolve. Entry and package versions agree on 1.7.1.
- The board reads the local player's authoritative private tray. It does not request or expose another pilot's letters.
- Reviewed empty, partially filled, full, discard and word-review presentation paths. The visible word preserves order; review separates the selected prefix from the retained suffix. No client dictionary validation is implied.
- Newly collected tile IDs receive one brief highlight on a tray change; existing tiles do not flash on snapshots. Reconnect/rematch identity changes suppress spurious pickup highlights. Reduced motion disables animation.
- The board remains outside the arena with responsive grid rows, and spectators retain their existing board-free layout.

Pending browser/device checks: inspect the board at desktop, phone portrait and landscape sizes; collect ten letters in order; check NEXT advances correctly and full-board guidance appears; submit a shorter leading word and verify the retained suffix; discard a tile; verify keyboard focus, screen-reader announcements and reduced motion. Compare two players' screens to ensure each sees only their own letters. The available browser path remains blocked by security policy, so no visual pass is claimed.


## Power-up and neon checks (1.7)

- All 76 tests pass; syntax checks pass. All 130 DOM IDs are unique, 90 fixed DOM references resolve, and all 22 local browser-module imports resolve.
- Every fifth valid word can select each of the three effects. Team counts are shared, free-for-all counts independent. Invalid/reused words reset only that combo; existing scoring and repair still apply once.
- New milestones replace effects, reset duration to eight seconds and never stack. At 30/60/120 FPS the browser mirrors agree on remaining time; 480 frames is a normalized counter, not a rendering-dependent timeout.
- Violet Guard removes a contacting letter once without health loss, red flash timestamp or breach count. Damage resumes at expiry; fatal damage still ends the round once.
- Slow Motion moves incoming letters at 40% speed without modifying their base velocity or affecting ships/pulses. Moving-letter collision paths use the slowed displacement.
- EMP keeps letter identity and position, leaves ordinary pickups untouched and neutralizes fresh incoming waves only while active. It adds no score and makes neutralized pickups immediately available to all.
- Room isolation, defense-off behavior, round finish and rematch resets retain correct power-up state.
- Eight Socket.io clients plus a spectator receive identical effects, combo counts, expiry, letter state and health across all three power-ups. Forged activation actions are rejected; forged power fields are ignored. Retried submissions do not advance milestones, score twice or extend expiry. Reconnect keeps the existing deadline.
- New modules are served over HTTP. Recording Canvas checks verify the moving grid, static reduced-motion grid, shadowBlur 10 with letter color, and the violet shield returning to cyan on expiry. Burst colors are pink/lime/cyan.

## Power-up visual playtest still required

1. Start 1.8.0 in a fresh folder, reload two or more clients, choose teams and leave defense on. Each five combined valid team words should trigger one visible eight-second effect on all screens. Use different words per pilot.
2. Submit an invalid or reused word and verify only that pilot/team combo resets. Opening review and discarding should preserve it. Reach another milestone before expiry and confirm the new effect replaces the old one.
3. Violet Guard: let an incoming pink letter touch the violet shield. The letter should disappear without damage or red flash. Normal cyan shield and damage should return at expiry.
4. EMP: incoming pink letters should stop in place and become safe lime pickups, including waves arriving while the effect is active. Collect in spelling order and confirm there are no duplicates or added points.
5. Slow Motion: compare incoming letter speed before, during and after the effect. Ships, pulses, rocks and the match clock must remain at normal speed.
6. Reconnect and join as a spectator. Confirm matching countdowns and no old activation celebration. Finish/rematch and repeat with defense off.
7. Inspect the neon grid, letter readability, particles, HUD and controls on desktop and phone portrait/landscape. Toggle reduced motion and sound. Check the arena remains usable in an eight-player match.

No browser visual, device, audio or hosted performance pass is claimed. The available browser connection failed and subsequent local observation was blocked by its security policy.

## Mission clarity checks (1.6.1)

- All 65 existing tests pass after the presentation update; Node syntax checks pass.
- All 125 DOM IDs are unique; 89 fixed references and the generated briefing IDs exist; local imports resolve.
- Inspected descriptions for free-for-all/teams with defense enabled and disabled. They state the correct shared survival condition, score winner, round duration and classic-mode behavior.
- The same mission description supplies the lobby briefing, permanent HUD, help and countdown. Both pilots and spectators receive the normal game view containing the HUD.
- Copy-paste source block and ZIP were regenerated from the current project and checked for exact source contents.

Pending visual checks: confirm the briefing is easy to read before readying up; toggle defense/team settings and compare both screens; join late as a spectator and open Mission & rules; verify portrait/landscape controls remain usable with the mission strip visible. Gameplay continues while help is open.

## Defense and new arcade checks completed

- Per-room initialization, exact initial health/shield values, host-only lobby toggle and browser snapshot mirrors.
- Swept boundary/inside/tangent/fast-crossing contacts. Incoming letters are removed before damage; an impact cannot apply twice.
- Moving-letter physical order, collection before impact, rejection of rescue after impact, full trays and review restrictions. Ordinary released letters remain harmless.
- Existing pulse interception with pickup priority and no points; too-late interception cannot undo damage; nearer asteroids still block pulses.
- Invalid/reused words do not repair. Valid words preserve unused suffixes, retain existing score calculation, grow by half their length and cap health/thickness correctly.
- Fatal damage finishes once, preserves score history, rejects new actions, returns no winners and resets for rematch. Timed survival preserves the original score/tie rules.
- Wave schedule, no catch-up avalanche, disabled defense and bounded letter/particle state.
- Ten cyan particles expire at 300 ms; ordinary weapon/word bursts contain hot pink, laser lime and neon cyan with greater initial velocity; reduced motion skips particle spawning.
- Earth renderer uses the authoritative radius/thickness, shadowBlur 15 and shadowColor #00f3ff. Canvas checks use a recording context, not pixel screenshots.
- Boost normalization, speed, cooldown, cancellation, roles, protected states and ordered pickups through wrapped seams.
- Meteor timing, four-hit/six-letter release, vowel guarantee and released-letter lifetime; bounty validation, single global award, expiry, word-history restriction and team scoring.
- Eight real Socket.io clients synchronize all defense fields, boosted ships, simultaneous bounty submissions, repairs, meteor state and early results. Retried submission IDs cannot repair twice or exceed caps. Separate room unaffected; reconnect restores the fatal result.
- HTTP delivery of every new module and asteroid PNG; fixed DOM IDs and local imports resolve.

## Defense playtest still required

1. Start 1.8.0 and join from two tabs or devices. Leave Planetary defense on, ready up and launch. Compare 100/100 HP and shield 5/25.
2. Find Earth using its minimap circle or cyan direction marker. Confirm the planet stays in a shared world position while cameras follow each ship.
3. After 12 seconds, follow a pink letter. Let one breach: both screens should lose exactly 5 HP, see a cyan ripple and brief red tint. Collect another in order and intercept a third with a pulse; neither should damage Earth.
4. Submit a valid word: both screens should gain 2 HP up to 100 and half the word length in shield thickness up to 25. Invalid or repeated words must do neither.
5. Leave incoming letters uncollected until zero health. Confirm both screens enter the same failure result, preserve points and allow a host rematch with fresh defense state.
6. Repeat with defense off, teams, spectators, temporary reconnect, full trays, word review, muted sound and reduced motion.
7. Boost toward a letter, watch the 30-second meteor wave and race the first word bounty. Ensure the defense HUD remains readable on phone portrait and landscape with both touch sticks.



## Completed in the development environment

- Node syntax checks for the server and client JavaScript, including the asteroid renderer, match feedback, aiming controller, fleet catalog and texture loader.
- Three asteroid hits release four unique, spaced tiles with at least one vowel; hits do not award points.
- Final-pulse priority is shared with teammates, expires after two seconds and survives simultaneous competing pulses without duplicate releases.
- Asteroid letters follow physical contact order and respect tray capacity, world limits and round deadlines. Asteroids gently nudge ships without resetting them.
- Nearest-body pulse collision works across a wrapped edge; asteroids wrap, replenish and reset on rematch.
- Eight Socket.io clients agree on each charge step and the same four released tiles after actual pulse input. The asteroid frontend module is served over HTTP with cache revalidation.
- Score targets and lead changes for free-for-all and teams, including ties, spectators and retained departure points.
- Word celebrations occur once regardless of acknowledgement/snapshot order; reconnect history suppresses old words and a new match clears the history.
- Stale presentation events are ignored; repeated timer updates do not repeat the same second's cue and joining late does not replay missed countdown cues.
- Particle effects stay bounded and expire; reduced motion clears trails/particles while keeping score text. These use code-level checks, not visual screenshots or performance measurements.
- Full clockwise/counterclockwise keyboard turns at 30/60/120 FPS; release holds heading and simultaneous Q/E stops turning.
- Mouse and touch angle calculation sampled around the full circle, including diagonal directions, dead zones and a stationary pointer with a moving ship origin.
- All eight hulls exercise the Canvas rotation call path with local and remote headings, including 359-to-1-degree wrap. This test uses a recording Canvas context, not a browser or pixel screenshot.
- Server pulse direction and published heading match arbitrary input angles through the 0/360-degree seam.
- All eight hulls retain the same movement and physical collection reach; ordered pickups and near misses remain correct.
- Eight Socket.io clients agree on the complete selected fleet; spectators see it and reconnects/rematches preserve it.
- Invalid hull IDs, attempts to select for another player, spectator selection, and mid-round changes are handled by the server. Retry acknowledgements do not clear readiness again.
- All eight PNGs are available over HTTP with the correct content type and PNG signature. Sprites retain the original transparent pixels.
- Frontend module imports resolve, entry files are versioned, and all fixed DOM references exist without duplicate IDs.
- 76 automated tests passed, including real Socket.io connections from eight independent clients and two isolated rooms.
- Contested pickup uniqueness, 10-letter capacity, 2-second priority, and teammate collection.
- Swept physical-contact collection and pulse collisions across the arena seam.
- Collection follows contact order rather than letter spawn order; near misses remain uncollected.
- Contested letters go to the first contacting ship, with deterministic resolution of exact ties.
- Submissions reject rearranging and skipping, consume only a leading prefix, and preserve trailing letters.
- Review prevents collection even when its shield is on cooldown.
- Valid, invalid, reused, fabricated, and repeated-letter word submissions; submission requires word review; the direct Enter action enters review before submitting.
- No duplicate scoring when a submission acknowledgement is retried.
- Shield timing, cooldown, movement/pulse/collection restrictions.
- Optional disruption, friendly-fire exclusion, protected ships, letter drops, and reset protection.
- Server deadline rejection and shared wins on tied scores.
- Late spectators, readiness, balanced-team enforcement, host migration, and retained departure scores.
- Reconnection with a private token, recovery after all clients briefly disconnect, spectator action rejection, and rematch clearing.
- HTTP responses for the landing page, health endpoint, dictionary metadata, and Socket.io client script.
- Static validation that all referenced fixed DOM element IDs exist and are unique.

The user reported the preceding game working in a local playtest, but lacking excitement. This arcade power-up update still requires a browser playtest; automated checks did not exercise the visual picker, rendering or audio in a browser. The recording Canvas check now includes an asteroid alongside each rotating ship.

These are test results for code and network behavior, not a claim that eight people have played the game on real devices.

## Not yet verified

- Browser visual rendering and interactions. A browser tool was available, but opening the local preview first failed to connect and subsequent observation was blocked by browser security policy. No browser visual pass is claimed.
- Real phone and laptop usability and simultaneous touch gestures.
- Mobile Safari and Chrome behavior, audio permissions, keyboard focus, reduced motion, and screen-reader usability.
- Frame rate, latency, and bandwidth on actual hosted hardware.
- Public HTTPS/WSS deployment and anonymous access.
- Docker image build.

## Asteroid playtest

1. Start version 1.8.0, reload two player tabs and create a fresh room. Follow gold minimap dots to a larger amber asteroid marked 4 LETTERS.
2. Hit it once and twice. Confirm its charge lights match on both screens and no letters release early.
3. Land the third pulse. Confirm four separate letters appear and at least one is a vowel. Fly a deliberate route through selected letters; confirm their tray order follows that route.
4. Let another pilot land the final hit after you land the first two. Confirm they get collection priority; repeat with teams and test teammate access.
5. Verify the burst and optional sounds, then repeat muted and with reduced motion. Ensure asteroid hits themselves do not change the score.
6. Test near the arena's wrapped edge, with a full tray and near another crystal. Confirm letters remain reachable and other players see the same pickups.
7. Try phone portrait/landscape and a full eight-player round. Check labels, charge lights, frame rate and how quickly players can find asteroids.

## Arcade playtest

1. Start version 1.8.0 in a fresh folder and reload two player tabs. Enable Sound on one tab and keep the other muted.
2. Move and pulse in every direction. Look for short ship trails, pulse streaks and crystal sparkles. Collect letters and check that floating labels match the tray order.
3. Submit a word. Confirm one celebration and one scoring melody, the correct points on both screens, and a score target consistent with the scoreboard.
4. Overtake, tie and lose the lead. Repeat in teams and check that alerts refer to the team rather than just one pilot.
5. Briefly reconnect after scoring. Old celebrations should not replay. Finish and rematch; scoring the same word in the new round should celebrate again.
6. Watch the last 30 seconds and final ten seconds. Confirm notices, warm border and one tick per countdown second when sound is on. Check the final result still agrees on both screens.
7. Enable reduced motion: trails/particles and banner arrival animation should stop, while points and letters remain readable. Mute Sound and confirm all audio stops.
8. Test phone portrait and landscape with both touch sticks. Confirm banners do not obscure important letters or score information and frame rate remains usable during an eight-player round.

## Fleet playtest

1. Start version 1.8.0, reload the browsers, and create a new room.
2. In two separate browser tabs or devices, choose different ships and confirm the crew roster agrees on both screens.
3. Choose the same hull on both pilots and confirm names and pilot markers still identify them.
4. Ready up, change one ship, and verify that pilot must ready up again before launch.
5. Launch. Hold E for two seconds, then Q for two seconds: confirm a full turn in each direction on both players’ screens. Release to keep the heading, then move the mouse around the ship through every quadrant. Confirm the right phone stick also turns through the full circle.
   Move while holding the pointer still and verify the nose keeps pointing toward the cursor. Confirm pulses follow the nose and spelling-order pickups still work.
6. Test teams: the hull paint stays with the design, while rings, labels and minimap markers identify the team.
7. Briefly disconnect/reconnect one pilot, finish the round and return to the lobby. Confirm the choices persist.
8. Repeat on a phone, including tapping all ship cards and using the two sticks. Check small-screen ship readability and frame rate.

## Release playtest

1. Open the public URL while signed out. Create and join a room without any player account.
2. Use separate devices and networks, including a phone and a laptop.
3. Test both modes, all match durations, and disruption on/off.
4. Verify letter readability, accurate aiming, wrapped edges, collection priority, full trays, discards, direct Enter submission, and choosing the final tile of a shorter leading word in review.
5. Verify shield expiry, cooldown, invalid words, resets, and no friendly fire.
6. Compare every screen's score and final result.
7. Temporarily disconnect one device, reconnect within 30 seconds, then try after the reservation expires.
8. Leave as host and verify control transfer. Join mid-round and verify spectator-only access.
9. Play repeated rounds in the same room; verify previous scores and word histories are cleared.
10. Run a full 8-player round and record devices, browsers, network conditions, visible issues, and fixes.

Complete these checks before calling the game competition-ready.
GLYPHSTORM_A62592CF28CA8D06

# FILE: public/aim.js
cat > 'public/aim.js' <<'GLYPHSTORM_872C37A3CBDE9C4B'
const TAU = Math.PI * 2;
export const TURN_SPEED = Math.PI; // 180 degrees per second, independent of frame rate.
export const wrapAngle = angle => ((angle % TAU) + TAU) % TAU;
export function vectorAngle(x,y,previous=0,deadZone=.15) {
  return Number.isFinite(x)&&Number.isFinite(y)&&Math.hypot(x,y)>deadZone
    ? wrapAngle(Math.atan2(y,x)) : previous;
}

// The most recent aiming control takes over. A released turn key holds its
// heading until the mouse moves again; a stale cursor must not snap it back.
export class AimControls {
  constructor(angle=0) { this.angle=wrapAngle(angle);this.pointer=null; }
  hold(angle=this.angle) { this.angle=wrapAngle(angle);this.pointer=null; }
  point(x,y) {
    if(Number.isFinite(x)&&Number.isFinite(y))this.pointer={x,y};
  }
  stick(x,y) {
    if(!Number.isFinite(x)||!Number.isFinite(y)||Math.hypot(x,y)<=.15)return false;
    this.hold(vectorAngle(x,y,this.angle));return true;
  }
  update(dt,left,right,aimAt) {
    if(left||right){
      this.pointer=null;
      this.angle=wrapAngle(this.angle+(Number(right)-Number(left))*TURN_SPEED*Math.max(0,dt));
    }else if(this.pointer){
      const angle=aimAt(this.pointer.x,this.pointer.y);
      if(Number.isFinite(angle))this.angle=wrapAngle(angle);
    }
    return this.angle;
  }
}
GLYPHSTORM_872C37A3CBDE9C4B

# FILE: public/app.js
cat > 'public/app.js' <<'GLYPHSTORM_2E26CFED7509767F'
import { Arena, SpaceBackdrop } from './arena.js?v=1.10.0';
import { VALUES, RULES, TEAMS, TEAM_COLORS } from './rules.js';
import { FLEET, shipFor } from './fleet.js';
import { AimControls } from './aim.js';
import { MatchFeedback, raceStatus } from './match-feedback.js';
import { missionStatus, missionBriefing } from './objectives.js';
import { syncDefenseState, earthHealth, barrierThickness, maxBarrierThickness } from './defense.js';
import { POWER_INFO, comboKey, powerUpStatus, syncPowerUpState } from './power-ups.js';
import { submissionChoice, pickupExplanation } from './word-guide.js';
import { PracticeLesson } from './practice.js';
import { CompactHUD } from './compact-hud.js';
import { SIGNAL_TYPES, signalText } from './signals.js';
import { wordRewardLabel } from './word-energy.js';
import {TraySelection,moveTile,FlightTips} from './tray-controls.js';
const $=id=>document.getElementById(id);
const show=(id,on)=>$(id).classList.toggle('hidden',!on);
const storage={get(key,local=false){try{return (local?localStorage:sessionStorage).getItem(key);}catch{return null;}},
  set(key,value,local=false){try{(local?localStorage:sessionStorage).setItem(key,value);}catch{}},
  remove(key){try{sessionStorage.removeItem(key);}catch{}}};
function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
let state=null,me=null,token=storage.get('glyphstorm.session'),latestSeq=-1;
let movement={x:0,y:0,angle:0,pulse:false},keys=new Set(),inputSeq=0;
const aim=new AimControls();
let lastAimFrame=performance.now();
let touchMove={x:0,y:0};
const traySelection=new TraySelection();
let discardMode=false,submitting=false,view='home',toastTimer,arranging=false,draggingTile=null;
let longPressTimer=null,gestureStamp=0,revealedTile=null;
const flightTips=new FlightTips(storage.get('glyphstorm.guided-tray.v1',true)==='done',()=>storage.set('glyphstorm.guided-tray.v1','done',true));
let wordFeed=[];
let lobbySignature='',traySignature='',resultSignature='',followSignature='';
let collectionMatch=null,collectionTileIds=new Set();
let discardingTile=false,practiceSeen=false;
const practice=new PracticeLesson(()=>storage.set('glyphstorm.practice.v1','complete',true));
$('practiceButton').onclick=()=>{practiceSeen=true;practice.open();};
let choosingShip=false,boosting=false,briefingSignature='';
const shipButtons=new Map();
let matchSeen=null,offset=0,lastUI=0,audioContext=null;
const feedback=new MatchFeedback(),soundTimes=new Map();
let wordBurstTimer,announcementTimer,scoreSignature='';
let muted=storage.get('glyphstorm.sound',true)!=='on';
let reduced=storage.get('glyphstorm.motion',true)==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;
const socket=window.io({autoConnect:false,reconnection:true,reconnectionDelay:500,reconnectionDelayMax:3000,timeout:10000});
const backdrop=new SpaceBackdrop($('space'));
const arena=new Arena($('arena'),$('minimap'),()=>movement);
const compactHUD=new CompactHUD();
let signaling=false;
const liveDialogOpen=()=>['helpDialog','telemetryDialog','signalDialog'].some(id=>$(id).open);
for(const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){
  const option=node('option','',letter);option.value=letter;$('signalLetter').append(option);
}
function openLiveDialog(id){resetControls();$(id).showModal();}
$('telemetryButton').onclick=()=>openLiveDialog('telemetryDialog');
for(const id of ['closeTelemetry','resumeTelemetry'])$(id).onclick=()=>$('telemetryDialog').close();
$('closeSignal').onclick=()=>$('signalDialog').close();
$('signalButton').onclick=()=>{
  if(!state||$('signalButton').disabled)return;
  $('signalLetter').value=state.self.wordGuide?.suggestion?.next||'A';
  renderSignals(serverNow());openLiveDialog('signalDialog');
};
for(const id of ['telemetryDialog','signalDialog'])$(id).addEventListener('close',resetControls);
async function sendSignal(kind){
  if(signaling)return;signaling=true;renderSignals(serverNow());
  try{await action('signal',{kind,letter:$('signalLetter').value});$('signalDialog').close();}
  catch(e){toast(e.message);}
  finally{signaling=false;if(state)renderSignals(serverNow());}
}
$('sendLetterSignal').onclick=()=>sendSignal(SIGNAL_TYPES.NEED_LETTER);
$('sendDefendSignal').onclick=()=>sendSignal(SIGNAL_TYPES.DEFEND_EARTH);
function renderSignals(now){
  if(!state)return;
  const pilot=current(),teams=state.settings.mode==='teams',seconds=Math.max(0,Math.ceil(((state.self.signalReadyAt||0)-now)/1000));
  const available=state.phase==='playing'&&pilot?.role==='player'&&socket.connected&&!pilot.resetUntil;
  const disabled=!available||signaling||seconds>0;
  show('signalButton',pilot?.role==='player'&&(teams||state.defense?.enabled));
  $('signalButton').disabled=!available;
  $('signalScope').textContent=teams?'Only your teammates see these signals.':'Earth defense signals are shared with every pilot.';
  show('letterSignalControls',teams);show('sendDefendSignal',Boolean(state.defense?.enabled));
  $('sendLetterSignal').disabled=disabled||!teams;
  $('sendDefendSignal').disabled=disabled||!state.defense?.enabled;
  const cooldown=seconds?'Ready in '+seconds+'s':signaling?'Sending…':'Ready to signal';
  if($('signalCooldown').textContent!==cooldown)$('signalCooldown').textContent=cooldown;
  const text=(state.self.signals||[]).filter(s=>s.expiresAt>now).slice(-2).map(s=>s.name+': '+signalText(s)).join('\n');
  if($('signalFeed').textContent!==text)$('signalFeed').textContent=text;
}
for(const ship of FLEET){
  const button=node('button','ship-option');button.type='button';
  button.style.setProperty('--ship-color',ship.color);
  button.setAttribute('aria-label',ship.name+' · '+ship.description);
  button.setAttribute('aria-pressed','false');
  const image=node('img','ship-preview');image.src=ship.src;image.alt='';image.decoding='async';image.draggable=false;
  image.onerror=()=>image.classList.add('art-unavailable');
  const check=node('span','ship-selected','✓');check.setAttribute('aria-hidden','true');
  button.append(image,node('strong','',ship.name),check);
  button.onclick=()=>chooseShip(ship.id);
  shipButtons.set(ship.id,button);$('shipChoices').append(button);
}
arena.ships.ready.then(loaded=>{
  if(loaded.some(ok=>!ok))toast('Some ship artwork could not load. Basic ships will appear until you reload.');
});
arena.rocks.ready.then(ok=>{if(!ok)toast('Asteroid textures could not load. Basic rocks will appear until you reload.');});
function preferences(){
  document.body.classList.toggle('reduced',reduced);arena.reduced=reduced;backdrop.reduced=reduced;
  $('soundButton').querySelector('span').textContent=muted?'Off':'On';
  $('soundButton').setAttribute('aria-label',muted?'Enable sound':'Mute sound');
  $('soundButton').title=muted?'Enable arcade sound':'Mute arcade sound';
  $('motionButton').setAttribute('aria-label',reduced?'Enable full motion':'Enable reduced motion');
  $('motionButton').style.color=reduced?'var(--mint)':'';
}
preferences();
function sound(kind){
  if(muted||document.hidden)return;
  const now=performance.now(),gap=kind==='pickup'?45:kind==='open'?110:40;
  if(now-(soundTimes.get(kind)??-Infinity)<gap)return;soundTimes.set(kind,now);
  try{
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
    const tones={word:[523,659,784,1046],longWord:[392,523,659,784,1046],pickup:[660+(state?.self.tray.length||0)*25],open:[240,480],asteroidCharge:[196,294],asteroidOpen:[262,392,523,784],boost:[147,220,440],shower:[196,294,392],bounty:[523,784,1046,1318],start:[330,440,660,880],tick:[440],lead:[659,880],reset:[330,220],barrierImpact:[147,110],intercept:[330,660],powerUp:[220,440,660,880],emp:[110,220,440],barrierBlock:[440,880]}[kind]||[240];
    tones.forEach((f,i)=>{
      const osc=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime+i*.08;
      osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(['tick','open'].includes(kind)?.025:.045,t+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,t+.18);osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.2);
    });
  }catch{}
}
function toast(message){$('toast').textContent=message;show('toast',true);clearTimeout(toastTimer);toastTimer=setTimeout(()=>show('toast',false),4000);}
function clearArcade(){
  clearTimeout(wordBurstTimer);clearTimeout(announcementTimer);
  show('wordBurst',false);show('arenaAnnouncement',false);
  $('arenaWrap').classList.remove('final-push');
}
function celebrateWord(moment){
  if(!moment||view!=='game')return;
  $('burstTitle').textContent=moment.title;$('burstWord').textContent=moment.word;$('burstPoints').textContent='+'+moment.points+' POINTS'+(moment.bonus?' · INCLUDES +'+moment.bonus+' BOUNTY':'');
  $('burstRepair').textContent=wordRewardLabel(moment.defenseReward);
  flightTips.action('submit');
  const banner=$('wordBurst');banner.classList.remove('pop');show('wordBurst',true);
  void banner.offsetWidth;banner.classList.add('pop');
  clearTimeout(wordBurstTimer);wordBurstTimer=setTimeout(()=>show('wordBurst',false),1900);
  sound(moment.bonus?'bounty':moment.word.length>=6?'longWord':'word');
}
function announce(message){
  if(!message||view!=='game')return;
  $('arenaAnnouncement').textContent=message;show('arenaAnnouncement',true);
  clearTimeout(announcementTimer);announcementTimer=setTimeout(()=>show('arenaAnnouncement',false),2400);
}
function connection(online,label){$('connection').classList.toggle('offline',!online);$('connection').lastChild.textContent=label;}
function setView(next){
  if(next===view)return;
  view=next;for(const id of ['home','lobby','game','results'])show(id,id===next);
  backdrop.active=next!=='game';document.body.classList.toggle('in-game',next==='game');
  compactHUD.setActive(next==='game');
  if(next!=='game')for(const id of ['telemetryDialog','signalDialog'])if($(id).open)$(id).close();
  if(next!=='game'){resetControls();clearArcade();}
  if(next==='lobby'){lobbySignature='';traySelection.useAll();}
  if(next==='home')renderBriefing();
  window.scrollTo(0,0);
}
function resetControls(){keys.clear();touchMove={x:0,y:0};movement.x=0;movement.y=0;movement.pulse=false;aim.hold(movement.angle);}
function current(){return state?.players.find(p=>p.id===me);}
function serverNow(){return Date.now()+offset;}
function updateState(next){
  if(next.matchId===state?.matchId && next.seq<latestSeq)return;
  latestSeq=next.seq;offset=next.now-Date.now();
  if(matchSeen!==next.matchId){matchSeen=next.matchId;traySelection.useAll();wordFeed=[];inputSeq=0;discardMode=false;resultSignature='';scoreSignature='';clearArcade();}
  state=next;syncDefenseState(state.defense);renderBriefing();
  traySelection.sync(state.self.tray);
  const cues=feedback.update(state,me);
  arena.update(state,me);
  if(state.phase==='lobby'){setView('lobby');renderLobby();}
  else if(state.phase==='results'){setView('results');renderResults();}
  else{setView('game');renderGame();}
  if(state.phase==='playing'){
    for(const e of cues.events){
      if(e.type==='pickup'&&e.playerId===me)flightTips.action('collect');
      if(e.type==='word'){wordFeed.push(e);wordFeed=wordFeed.slice(-3);}
      if(e.type==='vowelGift'&&e.playerId===me)announce('RECOVERY VOWEL · '+e.letter);
      if(e.type==='shieldRecharge'&&e.playerId===me)announce('WORD SHIELD RECHARGED');
      if(e.playerId===me&&['pickup','open','reset','asteroidCharge','asteroidOpen','boost','intercept'].includes(e.type))sound(e.type);
      if(e.playerId===me&&e.type==='asteroidOpen')announce((e.kind==='meteor'?'METEOR':'ASTEROID')+' OPEN · '+e.count+' LETTERS');
      if(e.type==='showerStart'){announce('METEOR SHOWER · SIX-LETTER ROCKS');sound('shower');}
      if(e.type==='showerEnd')announce('METEOR SHOWER COMPLETE');
      if(e.type==='bountyStart')announce('WORD BOUNTY · '+e.word+' · +'+e.bonus);
      if(e.type==='bountyClaim'&&e.playerId!==me)announce(e.name+' CLAIMED '+e.word+' · +'+e.bonus);
      if(e.type==='powerUpStart'){announce(POWER_INFO[e.kind].name+' · 8 SECONDS · SHARED EARTH');sound('powerUp');}
      if(e.type==='empPulse')sound('emp');
      if(e.type==='barrierBlock')sound('barrierBlock');
      if(e.type==='comboBreak'&&current()?.role==='player'&&e.comboKey===comboKey(current(),state.settings.mode))announce('COMBO RESET · SPELL 5 VALID WORDS');
      if(e.type==='defenseStart')announce('DEFEND EARTH · COLLECT OR PULSE PINK LETTERS');
      if(e.type==='barrierImpact'){sound('barrierImpact');if(e.earthHealth<=25)announce('EARTH CRITICAL · SPELL TO REPAIR');}
      if(e.type==='start')sound('start');
    }
    for(const word of cues.words)celebrateWord(word);
    if(cues.announcement){announce(cues.announcement);if(cues.race.leading)sound('lead');}
  }
}
function acceptJoin(result){
  me=result.playerId;token=result.token;storage.set('glyphstorm.session',token);
  lobbySignature='';
  inputSeq=0;latestSeq=-1;traySelection.useAll();matchSeen=null;resetControls();
  feedback.reset(result.state,me,true);
  movement.angle=result.state.players.find(p=>p.id===me)?.angle||0;aim.hold(movement.angle);
  updateState(result.state);
  const url=new URL(location.href);url.searchParams.set('room',result.code);history.replaceState(null,'',url);
  $('homeError').textContent='';show('connectionOverlay',false);
}
function emitAck(event,data,timeout=5000){
  return new Promise((resolve,reject)=>socket.timeout(timeout).emit(event,data,(error,result)=>{
    if(error)return reject(new Error('The connection is slow. Please try again.'));
    if(!result?.ok)return reject(new Error(result?.error||'Please try again.'));
    resolve(result);
  }));
}
async function join(create,skipPractice=false){
  if(!socket.connected){$('homeError').textContent='Connecting to the game server. Please try again in a moment.';return;}
  const name=$('pilotName').value.trim();if(name.length<2){$('homeError').textContent='Enter a pilot name with at least 2 characters.';$('pilotName').focus();return;}
  if(!skipPractice&&!practiceSeen&&storage.get('glyphstorm.practice.v1',true)!=='complete'){
    practiceSeen=true;practice.open(()=>join(create,true));return;
  }
  $('createButton').disabled=$('joinButton').disabled=true;$('homeError').textContent='';
  try{const result=await emitAck('join',{create,name,code:$('roomCode').value});storage.set('glyphstorm.name',name,true);acceptJoin(result);}
  catch(e){$('homeError').textContent=e.message;}
  finally{$('createButton').disabled=$('joinButton').disabled=false;}
}
async function action(type,payload={}){
  if(!state||!socket.connected)throw new Error('Reconnect before taking an action.');
  const request={requestId:crypto.randomUUID(),type,payload,matchId:state.matchId};
  let result;
  try{result=await emitAck('action',request,3500);}
  catch(e){
    if(!socket.connected || !e.message.startsWith('The connection is slow'))throw e;
    result=await emitAck('action',request,3500);
  }
  if(result.self && state?.matchId===request.matchId)state.self=result.self;
  return result;
}
const act=(type,payload)=>action(type,payload).catch(e=>toast(e.message));
socket.on('connect',async()=>{
  connection(true,'Online');$('createButton').disabled=$('joinButton').disabled=false;
  if(token){
    try{acceptJoin(await emitAck('resume',{token}));toast('Back in your orbit.');}
    catch(e){token=null;storage.remove('glyphstorm.session');state=null;me=null;setView('home');$('homeError').textContent=e.message;show('connectionOverlay',false);}
  }
});
socket.on('disconnect',()=>{
  connection(false,'Reconnecting');resetControls();
  if(state&&view==='lobby')renderLobby();
  if(state){show('connectionOverlay',true);toast('Connection lost. Trying to rejoin your room…');}
});
socket.on('connect_error',()=>{connection(false,'Offline');if(!state)$('homeError').textContent='The game server is not available yet. Waiting to reconnect…';});
socket.on('state',updateState);
socket.on('shutdown',data=>{toast(data.message);token=null;storage.remove('glyphstorm.session');});
socket.connect();
$('pilotName').value=storage.get('glyphstorm.name',true)||'';
$('roomCode').value=new URLSearchParams(location.search).get('room')?.slice(0,6)||'';
$('roomCode').addEventListener('input',()=>{$('roomCode').value=$('roomCode').value.toUpperCase().replace(/[^A-Z2-9]/g,'');});
$('createButton').onclick=()=>join(true);$('joinButton').onclick=()=>join(false);
$('roomCode').addEventListener('keydown',e=>{if(e.key==='Enter')join(false);});
$('pilotName').addEventListener('keydown',e=>{if(e.key==='Enter')join(Boolean(!$('roomCode').value));});
async function leave(){
  if(socket.connected)try{await emitAck('leave',{});}catch{}
  state=null;me=null;token=null;storage.remove('glyphstorm.session');traySelection.useAll();resetControls();setView('home');
  const url=new URL(location.href);url.searchParams.delete('room');history.replaceState(null,'',url);$('homeError').textContent='';
}
document.querySelectorAll('.leave-button').forEach(button=>button.onclick=leave);
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied. Send it to your crew.');}catch{toast('Copy this: '+text);}}
$('copyCode').onclick=()=>copy(state.code);
$('copyLink').onclick=()=>{const url=new URL(location.href);url.searchParams.set('room',state.code);copy(url.href);};
$('readyButton').onclick=()=>act('ready',{ready:!current()?.ready});
$('claimButton').onclick=()=>act('claim');
$('startButton').onclick=()=>act('start');
$('team0').onclick=()=>act('team',{team:0});$('team1').onclick=()=>act('team',{team:1});
$('rematchButton').onclick=()=>act('lobby');
for(const id of ['modeSelect','durationSelect','disruptionToggle','defenseToggle'])$(id).onchange=()=>act('settings',{
  mode:$('modeSelect').value,minutes:Number($('durationSelect').value),disruption:$('disruptionToggle').checked,defense:$('defenseToggle').checked
});
function renderBriefing(){
  const mission=missionBriefing(state),signature=JSON.stringify([mission,Boolean(state)]);
  if(signature===briefingSignature)return;briefingSignature=signature;
  for(const prefix of ['brief','helpMission']){
    $(prefix+'Label').textContent=state?mission.label:'DEFAULT MISSION · YOUR HOST CAN CHANGE THE RULES';
    $(prefix+'Title').textContent=mission.title;$(prefix+'Intro').textContent=mission.intro;
    const steps=mission.steps.map(step=>{const li=node('li');li.append(node('strong','',step.title),node('p','',step.text));return li;});
    $(prefix+'Steps').replaceChildren(...steps);
    $(prefix+'Win').textContent=mission.win;$(prefix+'Loss').textContent=mission.loss;
  }
  $('missionGoal').textContent=mission.ribbon;$('missionReminder').textContent=mission.reminder;
  $('arena').setAttribute('aria-describedby','missionGoal missionReminder');
}
function openMission(){resetControls();renderBriefing();$('helpDialog').showModal();$('helpDialog').scrollTop=0;}
$('helpButton').onclick=openMission;$('missionButton').onclick=openMission;
renderBriefing();
$('closeHelp').onclick=()=>$('helpDialog').close();
$('helpDialog').addEventListener('click',e=>{if(e.target===$('helpDialog')){const r=$('helpDialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('helpDialog').close();}});
$('soundButton').onclick=()=>{muted=!muted;storage.set('glyphstorm.sound',muted?'off':'on',true);preferences();sound('pickup');};
$('motionButton').onclick=()=>{reduced=!reduced;storage.set('glyphstorm.motion',reduced?'reduced':'full',true);preferences();};
function renderLobby(){
  const p=current(),active=state.players.filter(p=>p.role==='player'),host=state.hostId===me;
  const signature=JSON.stringify({host:state.hostId,settings:state.settings,online:socket.connected,choosingShip,players:state.players.map(p=>[p.id,p.name,p.shipId,p.role,p.team,p.connected,p.ready])});
  if(signature===lobbySignature)return;lobbySignature=signature;
  $('lobbyCode').textContent=state.code;$('playerCount').textContent=active.length+' / 8 PILOTS';
  $('roster').replaceChildren();
  for(const pilot of active){
    const ship=shipFor(pilot.shipId);
    const row=node('div','pilot-row'),avatar=node('div','pilot-avatar ship-avatar');avatar.style.color=pilot.color;
    const image=node('img','');image.src=ship.src;image.alt='';image.decoding='async';image.draggable=false;
    image.onerror=()=>{avatar.textContent=pilot.name.slice(0,1).toUpperCase();};avatar.append(image);
    const info=node('div','pilot-info',pilot.name+(pilot.id===me?' (you)':''));
    const description=[ship.name,pilot.id===state.hostId?'Host':'',state.settings.mode==='teams'?TEAMS[pilot.team]:'',!pilot.connected?'Reconnecting':''].filter(Boolean).join(' · ');
    info.append(node('small','',description||'Word pilot'));
    row.append(avatar,info,node('span',pilot.ready?'ready-tag':'waiting-tag',pilot.ready?'READY ✓':'WAITING'));$('roster').append(row);
  }
  if(active.length<2)$('roster').append(node('div','empty-seat','＋ Invite a friend to launch your first round'));
  const spectators=state.players.filter(p=>p.role==='spectator');
  $('spectatorList').textContent=spectators.length?'Watching: '+spectators.map(p=>p.name).join(', '):'';
  $('modeSelect').value=state.settings.mode;$('durationSelect').value=String(state.settings.minutes);$('disruptionToggle').checked=state.settings.disruption;$('defenseToggle').checked=state.settings.defense;
  for(const id of ['modeSelect','durationSelect','disruptionToggle','defenseToggle'])$(id).disabled=!host;
  $('hostBadge').textContent=host?'YOUR CONTROLS':'HOST CONTROLS';
  show('readyButton',p?.role==='player');show('claimButton',p?.role==='spectator');show('startButton',host);
  $('readyButton').textContent=p?.ready?'Ready ✓ · click to undo':'Ready up ✓';
  $('readyButton').disabled=choosingShip||!socket.connected;
  show('shipPicker',p?.role==='player');
  const selected=shipFor(p?.shipId);
  $('selectedShipName').textContent=choosingShip?'Saving…':selected.name;
  $('pilotMarker').style.color=p?.color||'#70f7d1';
  for(const [id,button] of shipButtons){
    button.setAttribute('aria-pressed',String(id===selected.id));
    button.disabled=choosingShip||!socket.connected||p?.role!=='player';
  }
  show('teamActions',state.settings.mode==='teams'&&p?.role==='player');
  for(let i=0;i<2;i++)$('team'+i).style.borderColor=p?.team===i?TEAM_COLORS[i]:'';
  const balanced=state.settings.mode!=='teams'||active.filter(p=>p.team===0).length===active.filter(p=>p.team===1).length;
  const allReady=active.length>=2&&active.every(p=>p.ready&&p.connected)&&balanced;
  $('startButton').disabled=!allReady||choosingShip||!socket.connected;
  $('claimButton').disabled=active.length>=8;
  $('lobbyHint').textContent=active.length<2?'Share the room code or invite link. You need at least two pilots.':
    !balanced?'Balance the two teams before launching.':allReady?(host?'Your crew is ready. Launch when you are.':'Your crew is ready. Waiting for the host to launch.'):'Every pilot needs to ready up.';
}
async function chooseShip(shipId){
  const pilot=current();
  if(choosingShip||state?.phase!=='lobby'||pilot?.role!=='player'||pilot.shipId===shipId)return;
  const playerId=pilot.id;
  choosingShip=true;renderLobby();
  try{
    const result=await action('ship',{shipId});
    const currentPilot=current();
    if(currentPilot?.id===playerId&&state.phase==='lobby'){
      currentPilot.shipId=result.self.shipId;currentPilot.ready=result.self.ready;
      toast(shipFor(result.self.shipId).name+' selected. Ready up when you are.');
    }
  }catch(e){toast(e.message);}
  finally{choosingShip=false;lobbySignature='';if(state&&view==='lobby')renderLobby();}
}
function renderScores(){
  const pilots=state.players.filter(p=>p.role==='player'||p.role==='retired').sort((a,b)=>b.score-a.score);
  const race=raceStatus(state,me);
  for(const [id,text] of [['raceNumber',String(race.score)],['raceLabel',race.label],['raceGap',race.message]])if($(id).textContent!==text)$(id).textContent=text;
  $('raceStatus').classList.toggle('leading',race.leading);
  const signature=JSON.stringify([state.settings.mode,me,pilots.map(p=>[p.id,p.name,p.team,p.color,p.score,p.connected])]);
  if(signature===scoreSignature)return;scoreSignature=signature;
  const fragment=document.createDocumentFragment();
  if(state.settings.mode==='teams'){
    for(let i=0;i<2;i++){
      const total=pilots.filter(p=>p.team===i).reduce((n,p)=>n+p.score,0),row=node('div','team-total',TEAMS[i]+'  '+total+' pts');
      row.style.color=TEAM_COLORS[i];fragment.append(row);
    }
  }
  for(const p of pilots){const row=node('div','score-row'+(p.id===me?' me':'')+(race.leaders.some(e=>e.id===(state.settings.mode==='teams'?String(p.team):p.id))?' front-runner':''));row.style.borderLeftColor=p.color;
    row.append(node('span','',p.name+(p.connected?'':' · away')),node('b','',String(p.score)));fragment.append(row);}
  $('scoreboard').replaceChildren(fragment);
}
function renderGame(){
  const p=current(),spectating=p?.role!=='player';
  $('game').classList.toggle('is-spectator',spectating);$('game').classList.toggle('has-defense',Boolean(state.defense?.enabled));
  show('spectatorBar',spectating);show('trayDock',!spectating);
  $('gameMode').textContent=(state.settings.mode==='teams'?'TEAM ORBIT':'FREE-FOR-ALL')+(state.settings.disruption?' · DISRUPTION ON':'');
  $('gameRoom').textContent='ROOM '+state.code;
  renderScores();renderTray();
  const sig=state.players.filter(p=>p.role==='player').map(p=>p.id).join(',');
  if(sig!==followSignature){
    followSignature=sig;$('followSelect').replaceChildren();
    for(const pilot of state.players.filter(p=>p.role==='player')){const option=node('option','',pilot.name);option.value=pilot.id;$('followSelect').append(option);}
    if(!state.players.some(p=>p.id===arena.follow&&p.role==='player'))arena.follow=null;
  }
  arena.follow=spectating?($('followSelect').value||null):null;
  const building=Boolean(state.self.wordMode)&&!spectating&&state.phase==='playing'&&!p?.resetUntil;
  show('wordPanel',building);

  const choice=submissionChoice(state.self,traySelection.range(state.self.tray));
  $('game').classList.toggle('reviewing',building);
  $('buildButton').disabled=state.phase!=='playing'||Boolean(p?.resetUntil)||!choice.valid||submitting||discardingTile||arranging;
  $('buildButton').textContent=submitting?'Checking…':choice.valid?'Submit '+choice.word+(choice.keep?' · keep '+choice.keep:''):'Submit word';
  $('reviewButton').disabled=state.phase!=='playing'||Boolean(p?.resetUntil)||building||submitting;
  $('discardButton').disabled=state.phase!=='playing'||Boolean(p?.resetUntil)||!state.self.tray.length||submitting;
  $('discardLastButton').disabled=state.phase!=='playing'||Boolean(p?.resetUntil)||!state.self.tray.length||submitting||discardingTile||arranging;
  $('discardButton').textContent=discardMode?'Cancel discard':'Choose a letter to discard';
  if(building)renderWord();
  renderMissions(serverNow());renderDefense(serverNow());renderPowerUp(serverNow());
  renderSignals(serverNow());
}
function renderDefense(now){
  const d=state.defense;show('defenseStatus',d?.enabled);
  if(!d?.enabled)return;
  const hp=$('earthMeter');hp.value=earthHealth;hp.setAttribute('aria-valuetext',earthHealth+' of 100 integrity');
  $('earthHealth').textContent=earthHealth+' / 100';
  $('barrierLevel').textContent=barrierThickness.toFixed(1)+' / '+maxBarrierThickness;
  const incoming=state.letters.filter(l=>l.incoming).length;
  $('defenseHint').textContent=incoming+' incoming · wave '+(d.wave+1)+' in '+Math.max(0,Math.ceil((d.nextWaveAt-now)/1000))+'s';
  $('defenseStatus').classList.toggle('critical',earthHealth<=25);
  const age=now-(d.lastImpactAt||-Infinity);$('defenseStatus').classList.toggle('impact-warning',age>=0&&age<450);
}
function renderPowerUp(now){
  show('powerUpCard',Boolean(state.defense?.enabled));
  if(!state.defense?.enabled)return;
  const power=powerUpStatus(state,me,now);
  $('comboMeter').value=power.progress;$('comboMeter').setAttribute('aria-valuetext',power.progress+' of 5 words toward the next power-up');
  $('comboLabel').textContent=(state.settings.mode==='teams'?'TEAM ':'')+power.progress+' / 5 words';
  const labels={powerUpName:power.title,powerUpTimer:power.timer,powerUpCombo:power.combo,powerUpHint:power.hint};
  for(const [id,text]of Object.entries(labels))if($(id).textContent!==text)$(id).textContent=text;
  $('powerUpCard').classList.toggle('active',Boolean(power.kind));
  $('powerUpCard').style.setProperty('--power-color',power.color);
  $('powerUpCard').title=power.source+'. '+power.hint;
}
function renderMissions(now){
  const m=missionStatus(state,now),p=current(),cooldown=Math.max(0,(state.self.boostReadyAt||0)-now);
  const labels={bountyWord:m.bountyWord,bountyHint:m.bountyHint,meteorTitle:m.meteorTitle,meteorHint:m.meteorHint,
    boostLabel:state.self.boostUntil>now?'BOOSTING':cooldown>0?(cooldown/1000).toFixed(1)+'s':'READY · SHIFT'};
  for(const [id,value] of Object.entries(labels))if($(id).textContent!==value)$(id).textContent=value;
  $('bountyCard').classList.toggle('active',m.bountyActive);$('meteorCard').classList.toggle('active',m.meteorActive);
  $('bountyHint').title=m.bountyHint;
  show('boostButton',p?.role==='player');
  $('boostButton').disabled=boosting||state.phase!=='playing'||!socket.connected||p?.role!=='player'||Boolean(p?.resetUntil)||
    state.self.wordMode||p?.protectionUntil>now||cooldown>0;
  $('boostButton').style.setProperty('--charge',Math.max(0,Math.min(1,1-cooldown/RULES.boostCooldownMs))*100+'%');
  $('boostButton').setAttribute('aria-label',cooldown>0?'Boost recharging: '+Math.ceil(cooldown/1000)+' seconds':'Boost in movement direction, or forward when stationary. Shortcut: Shift.');
}
async function boost(){
  if(boosting||!state||view!=='game'||$('boostButton').disabled||liveDialogOpen())return;
  boosting=true;updateMovement();
  try{await action('boost',{x:movement.x,y:movement.y});}
  catch(e){toast(e.message);}
  finally{boosting=false;if(state&&view==='game')renderMissions(serverNow());}
}
$('boostButton').onclick=boost;
function selectedRange(){return traySelection.range(state?.self.tray||[]);}
function inlineWordError(message=''){
  $('wordError').textContent=message;
  $('trayError').textContent=state?.self.wordMode?'':message;
}
function renderTray(){
  if(draggingTile)return;
  const tray=state.self.tray,p=current(),guide=state.self.wordGuide;
  const sig=JSON.stringify([state.matchId,me,tray,selectedRange(),traySelection.first,traySelection.focus,traySelection.mode,discardMode,state.self.wordMode,guide?.trayKey,revealedTile]);
  if(sig===traySignature){renderCollectionHint();return;}traySignature=sig;
  const boardKey=state.matchId+':'+me,sameBoard=collectionMatch===boardKey;
  const range=selectedRange()||{start:0,end:tray.length},choice=submissionChoice(state.self,selectedRange());
  const selected=tray.slice(Math.max(0,range.start),Math.max(0,range.end));
  const word=selected.map(t=>t.letter).join(''),remaining=[...tray.slice(0,Math.max(0,range.start)),...tray.slice(Math.max(0,range.end))].map(t=>t.letter).join('');
  const full=tray.length===RULES.trayLimit;
  $('trayCount').textContent=tray.length+' / '+RULES.trayLimit;
  $('trayCount').setAttribute('aria-label',tray.length+' of '+RULES.trayLimit+' letters collected');
  $('trayDock').classList.toggle('is-full',full);$('trayDock').classList.toggle('is-discarding',discardMode);
  $('collectionLabel').textContent=traySelection.start?'SELECTED RANGE':'ALL TRAY TILES';
  $('collectionWord').textContent=word||'Fly into letters to begin';$('collectionWord').classList.toggle('is-empty',!word);
  $('collectionRemainder').textContent=remaining?'KEEP '+remaining:'';show('collectionRemainder',Boolean(remaining));
  $('collectionStatus').textContent=choice.valid?'Valid · '+choice.points+' points'+(choice.multiplier===2?' · ★ ×2':''):choice.message;
  $('collectionStatus').classList.toggle('valid',choice.valid);
  $('rangeButton').setAttribute('aria-pressed',String(traySelection.mode==='range'));
  $('swapButton').setAttribute('aria-pressed',String(traySelection.mode==='swap'));
  const announcement=tray.length+' of '+RULES.trayLimit+' letters collected'+(tray.length?': '+tray.map(tile=>tile.letter).join(', '):'. Fly into letters to start.');
  if($('collectionAnnouncement').textContent!==announcement)$('collectionAnnouncement').textContent=announcement;
  const focusedTile=$('tray').contains(document.activeElement)?document.activeElement?.dataset.tileId:null;
  clearTimeout(longPressTimer);$('tray').replaceChildren();
  for(let i=0;i<RULES.trayLimit;i++){
    const tile=tray[i],next=!tile&&i===tray.length,newPickup=tile&&sameBoard&&!collectionTileIds.has(tile.id);
    const isSelected=tile&&traySelection.start&&i>=range.start&&i<range.end;
    const wrap=node('div','tile'+(!tile?' empty':'')+(next?' next-slot':'')+(isSelected?' selected':'')+(discardMode&&tile?' discarding':'')+(newPickup?' just-collected':'')+(tile?.gift?' gifted':'')+(tile&&guide?.leastUseful?.includes(tile.id)&&(full||(!guide.possibleCount&&tray.length>=6))?' low-utility':'')+(tile&&traySelection.first===tile.id?' swap-source':''));
    if(tile&&revealedTile===tile.id)wrap.classList.add('show-remove');
    const button=tile?node('button','tile-select'):wrap;if(tile){button.type='button';button.dataset.tileId=tile.id;button.draggable=true;}
    button.setAttribute('aria-label',tile?'Tile '+(i+1)+': '+tile.letter+(tile.doubleScore?', double word star':'')+(discardMode?'. Discard':traySelection.mode==='range'?'. Select range endpoint':'. Tap two tiles to swap, or drag to reorder'):'Empty slot '+(i+1));
    button.append(node('span','tile-order',String(i+1).padStart(2,'0')),node('span','tile-letter',tile?.letter||'+'));
    if(tile){
      button.append(node('small','tile-value',String(VALUES[tile.letter])+(tile.doubleScore?' ★':'')));wrap.append(button);
      button.onclick=()=>{if(performance.now()-gestureStamp<350)return;selectTile(tile.id);};
      button.ondragstart=e=>{if(arranging||submitting){e.preventDefault();return;}clearTimeout(longPressTimer);draggingTile=tile.id;e.dataTransfer.setData('text/plain',tile.id);e.dataTransfer.effectAllowed='move';};
      wrap.ondragover=e=>{if(draggingTile)e.preventDefault();};
      wrap.ondrop=e=>{e.preventDefault();const from=draggingTile;draggingTile=null;gestureStamp=performance.now();if(from)arrangeTiles(moveTile(state.self.tray.map(t=>t.id),from,tile.id));};
      button.ondragend=()=>{draggingTile=null;gestureStamp=performance.now();traySignature='';renderTray();};
      button.onpointerdown=e=>{if(e.pointerType!=='touch')return;clearTimeout(longPressTimer);longPressTimer=setTimeout(()=>{revealedTile=tile.id;wrap.classList.add('show-remove');traySelection.focus=tile.id;gestureStamp=performance.now();},500);};
      button.onpointermove=()=>clearTimeout(longPressTimer);
      button.onpointerup=()=>{clearTimeout(longPressTimer);if(wrap.classList.contains('show-remove'))gestureStamp=performance.now();};
      button.onpointercancel=()=>clearTimeout(longPressTimer);
      button.oncontextmenu=e=>e.preventDefault();
      const remove=node('button','tile-remove','×');remove.type='button';remove.setAttribute('aria-label','Discard '+tile.letter+' at position '+(i+1));remove.onclick=e=>{e.stopPropagation();discardTile(tile.id);};wrap.append(remove);
    }else if(next)button.append(node('span','tile-next','NEXT'));
    $('tray').append(wrap);if(tile&&focusedTile===tile.id)button.focus({preventScroll:true});
  }
  collectionMatch=boardKey;collectionTileIds=new Set(tray.map(tile=>tile.id));
  $('lastWord').textContent=p?.lastWord?'LAST WORD: '+p.lastWord.word+' +'+p.lastWord.points:'';
  renderCollectionHint();
}
function renderCollectionHint(){
  const notice=pickupExplanation(state,current(),serverNow()),guide=state.self.wordGuide,full=state.self.tray.length===RULES.trayLimit;
  const stuck=(full||state.self.tray.length>=6)&&guide?.possibleCount===0;
  arena.guideLetter=current()?.role==='player'?guide?.suggestion?.next||null:null;
  let text=state.self.pendingVowel?'Free '+state.self.pendingVowel+' waiting — discard one tile to receive it.':
    stuck?'No words from these letters, discard one or Shuffle.':
    full?'Tray full · '+(guide?.best?'Try '+guide.best.word+' using Review → Shorter word.':'Discard one tile to collect again.'):
    discardMode?'Tap any tile to discard.':traySelection.mode==='range'?'Tap a start tile, then an end tile. Use all clears the range.':
    traySelection.first?'Tap a second tile to swap. Backspace/Delete removes the selected tile.':
    guide?.best?'Available: '+guide.best.word+' · arrange it or use Review → Shorter word.':
    guide?.suggestion?'Try '+guide.suggestion.word+' · next '+guide.suggestion.next+' · drag tiles or tap two to swap.':'Fly into letters. Drag to arrange, or tap two tiles to swap.';
  if(notice&&!notice.startsWith('Board full')&&!notice.startsWith('Review'))text=notice;
  if($('trayHint').textContent!==text)$('trayHint').textContent=text;
  $('trayHint').classList.toggle('pickup-blocked',Boolean(notice)||stuck);
  $('smartDiscardButton').disabled=!guide?.smartDiscard||submitting||arranging||discardingTile||state.phase!=='playing'||Boolean(current()?.resetUntil);
  const tile=state.self.tray.find(t=>t.id===guide?.smartDiscard?.tileId);
  $('smartDiscardButton').textContent='Smart discard'+(tile?' · '+tile.letter:'');
  $('smartDiscardButton').title=guide?.smartDiscard?.reason||'Collect a letter first';
  const seconds=Math.max(0,Math.ceil(((state.self.shuffleReadyAt||0)-serverNow())/1000));
  $('shuffleButton').textContent=seconds?'Shuffle · '+seconds+'s':'Shuffle · R';
  $('shuffleButton').disabled=seconds>0||state.self.tray.length<2||submitting||arranging||state.phase!=='playing'||Boolean(current()?.resetUntil);
  const nudge=guide?.nudge||'';if($('stuckNudge').textContent!==nudge)$('stuckNudge').textContent=nudge;
  if(state.self.tray.some(t=>!t.gift))flightTips.action('collect');
  show('guidedTip',Boolean(flightTips.text)&&current()?.role==='player'&&state.phase==='playing');
  $('guidedTipText').textContent=flightTips.text.replace(' and repair Earth',state.defense?.enabled?' and repair Earth':'');
  const feed=wordFeed.filter(e=>serverNow()-e.at<14000).map(e=>e.name+' spelled '+e.word+' +'+e.points).join('\n');
  if($('wordFeed').textContent!==feed)$('wordFeed').textContent=feed;
}
async function arrangeTiles(tileIds,select=null){
  if(arranging||submitting||discardingTile||state?.phase!=='playing')return;
  arranging=true;inlineWordError();
  try{await action('arrange',{tileIds});revealedTile=null;traySelection.useAll();if(select)traySelection.selectWord(select);flightTips.action('arrange');}
  catch(e){inlineWordError(e.message);}
  finally{arranging=false;traySignature='';if(state&&view==='game')renderGame();}
}
async function discardTile(id,smart=false){
  if(submitting||discardingTile||arranging)return;discardingTile=true;inlineWordError();renderGame();
  try{await action(smart?'smartDiscard':'discard',smart?{}:{tileId:id});discardMode=false;revealedTile=null;traySelection.useAll();}
  catch(e){inlineWordError(e.message);}
  finally{discardingTile=false;if(state&&view==='game'){renderGame();renderWord();}}
}
$('discardLastButton').onclick=()=>{const tile=state?.self.tray.at(-1);if(tile)discardTile(tile.id);};
$('smartDiscardButton').onclick=()=>discardTile(null,true);
$('shuffleButton').onclick=async()=>{
  if($('shuffleButton').disabled)return;arranging=true;inlineWordError();
  try{await action('shuffle');traySelection.useAll();flightTips.action('arrange');}
  catch(e){inlineWordError(e.message);}
  finally{arranging=false;if(state&&view==='game')renderGame();}
};
$('rangeButton').onclick=()=>{traySelection.clear();traySelection.mode='range';discardMode=false;renderGame();};
$('swapButton').onclick=()=>{traySelection.useAll();discardMode=false;renderGame();};
$('dismissTip').onclick=()=>{flightTips.dismiss();show('guidedTip',false);};
async function selectTile(id){
  if(submitting||arranging)return;
  if(discardMode){await discardTile(id);return;}
  inlineWordError();const order=traySelection.tap(id,state.self.tray);
  if(order)await arrangeTiles(order);else renderGame();
}
async function build(){
  if(view!=='game'||state?.phase!=='playing'||current()?.role!=='player')return;
  resetControls();await action('wordMode',{enter:true});discardMode=false;
  inlineWordError();show('wordPanel',true);renderGame();$('trayDock').scrollTop=0;
}
async function closeWord(){
  if(submitting)return;
  try{await action('wordMode',{enter:false});discardMode=false;show('wordPanel',false);renderGame();resetControls();}
  catch(e){inlineWordError(e.message);}
}
function renderWord(){
  if(!state)return;
  const range=selectedRange()||{start:0,end:state.self.tray.length},letters=state.self.tray.slice(Math.max(0,range.start),Math.max(0,range.end)).map(t=>t.letter).join('');
  $('wordLetters').textContent=letters||'Arrange your letters';
  const choice=submissionChoice(state.self,selectedRange()),bounty=state.bounty,bonus=bounty&&!bounty.claimedBy&&bounty.word===letters&&serverNow()<bounty.expiresAt?bounty.bonus:0;
  $('wordScore').textContent=choice.valid?'Valid · '+choice.points+' points'+(choice.multiplier===2?' · ★ ×2':'')+(bonus?' · +20 bounty if available':''):choice.message;
  $('wordScore').classList.toggle('valid',choice.valid);
  show('wordMissionReward',Boolean(state.defense?.enabled));
  $('submitButton').disabled=!choice.valid||submitting||discardingTile||arranging;
  $('backspaceButton').disabled=!state.self.wordGuide?.longest||submitting||arranging;
  $('clearWord').disabled=submitting||arranging;
  const best=state.self.wordGuide?.best;
  $('bestWordHint').textContent=best?'Best word: '+best.word+' · '+best.points+' points':'Best word: none yet — collect or discard a tile';
  $('submitButton').firstChild.textContent=submitting?'Checking…':choice.valid?'Submit '+choice.word+' ':'Submit word ';
}
$('buildButton').onclick=submit;$('reviewButton').onclick=()=>build().catch(e=>inlineWordError(e.message));$('closeWord').onclick=closeWord;
$('discardButton').onclick=()=>{discardMode=!discardMode;traySelection.first=null;renderGame();};
$('backspaceButton').onclick=()=>{
  const offer=state?.self.wordGuide?.longest;if(!offer)return;
  const used=new Set(offer.tileIds);arrangeTiles([...offer.tileIds,...state.self.tray.filter(t=>!used.has(t.id)).map(t=>t.id)],offer.tileIds);
};
$('clearWord').onclick=()=>{traySelection.useAll();renderGame();};
async function submit(){
  if(submitting||arranging||discardingTile||view!=='game'||state?.phase!=='playing'||current()?.role!=='player')return;
  const choice=submissionChoice(state.self,selectedRange());
  if(!choice.valid){inlineWordError(choice.message);return;}
  const tileIds=choice.tileIds,submitMatch=state.matchId,submitPilot=me;
  submitting=true;inlineWordError();renderWord();
  try{
    if(!state.self.wordMode)await build();
    if(state?.matchId!==submitMatch||me!==submitPilot)return;
    const result=await action('submit',{tileIds});
    if(state?.matchId!==submitMatch||me!==submitPilot)return;
    traySelection.useAll();show('wordPanel',false);celebrateWord(feedback.word(result.value));renderTray();
  }
  catch(e){inlineWordError(e.message);}
  finally{submitting=false;renderWord();if(view==='game')renderGame();}
}
$('submitButton').onclick=submit;
function renderResults(){
  const r=state.results;if(!r)return;
  const sig=state.matchId+state.hostId;
  if(sig===resultSignature)return;resultSignature=sig;
  const names=r.mode==='teams'?r.winners.map(t=>TEAMS[t]):r.winners.map(id=>r.ranking.find(p=>p.id===id)?.name||'Pilot');
  $('resultsOutcome').textContent=r.reason==='earth-lost'?'MISSION FAILED · EARTH AT 0 HP':r.defense?'MISSION COMPLETE · EARTH SAVED':'ROUND COMPLETE';
  $('winnerTitle').textContent=r.reason==='earth-lost'?'Earth’s defense was breached.':names.length>1?'A shared constellation.':names[0]+' takes the orbit.';
  $('winnerSubtitle').textContent=r.reason==='earth-lost'?'Planet integrity reached zero. The round ends for everyone; scores are preserved below.':r.defense?'Earth survived with '+r.defense.earthHealth+'% integrity. '+names.join(' & ')+' led the word scores.':names.length>1?names.join(' & ')+' tied for the win.':'Every word counted. Ready for another round?';
  $('resultsMode').textContent=(r.mode==='teams'?'TEAMS':'FREE-FOR-ALL')+' · '+state.settings.minutes+' MIN';
  $('resultsTable').replaceChildren();
  if(r.mode==='teams')for(const t of r.teams){const row=node('div','pilot-row');row.style.color=TEAM_COLORS[t.team];row.append(node('strong','pilot-info',TEAMS[t.team]),node('strong','',t.score+' pts'));$('resultsTable').append(row);}
  r.ranking.forEach((p,i)=>{
    const row=node('div','result-row'),name=node('div','',p.name+(p.id===me?' (you)':''));
    name.append(node('small','',p.words+' word'+(p.words===1?'':'s')));name.style.color=p.color;
    row.append(node('span','result-rank',String(i+1).padStart(2,'0')),name,node('span','result-best',p.best?'Best: '+p.best.word:'No word yet'),node('strong','result-score',String(p.score)));
    $('resultsTable').append(row);
  });
  const history=r.ranking.find(p=>p.id===me)?.history||[];
  $('resultWordCount').textContent=history.length+' WORDS';$('resultWords').replaceChildren();
  if(!history.length)$('resultWords').append(node('p','muted',current()?.role==='spectator'?'Claim a pilot seat in the next lobby to join the fun.':'A fresh tray and a new round are waiting.'));
  for(const entry of history){const chip=node('span','word-chip',entry.word);chip.append(node('b','', '+'+entry.points));$('resultWords').append(chip);}
  show('rematchButton',state.hostId===me);
  $('rematchHint').textContent=state.hostId===me?'Your crew stays in the same room.':'Waiting for the host to return to the lobby.';
}
window.addEventListener('keydown',e=>{
  if(liveDialogOpen())return;
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(view!=='game')return;
  if(e.target.tagName==='BUTTON'&&!e.target.classList.contains('tile-select')&&['Enter',' '].includes(e.key))return;
  if(['Backspace','Delete'].includes(e.key)){e.preventDefault();if(!e.repeat){const id=traySelection.focus||state?.self.tray.at(-1)?.id;if(id)discardTile(id);}return;}
  if(e.code==='KeyR'){e.preventDefault();if(!e.repeat&&!$('shuffleButton').disabled)$('shuffleButton').click();return;}
  if(state?.self.wordMode){
    if(e.key==='Escape'){e.preventDefault();closeWord();}
    else if(e.key==='Enter'){e.preventDefault();if(!e.repeat)submit();}
    return;
  }
  if(e.key==='Enter'){e.preventDefault();if(!e.repeat)submit();return;}
  if(e.code==='Space'){e.preventDefault();if(!e.repeat&&!submitting)build().catch(error=>inlineWordError(error.message));return;}
  if(['ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();if(!e.repeat)boost();return;}
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyQ','KeyE'].includes(e.code)){e.preventDefault();keys.add(e.code);updateMovement();}
});
window.addEventListener('keyup',e=>{keys.delete(e.code);updateMovement();});
window.addEventListener('blur',resetControls);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetControls();});
function updateMovement(){
  if(document.hidden||state?.self.wordMode||liveDialogOpen()){movement.x=movement.y=0;movement.pulse=false;return;}
  const x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+touchMove.x;
  const y=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))+touchMove.y;
  const length=Math.max(1,Math.hypot(x,y));movement.x=x/length;movement.y=y/length;
}
function updateAim(dt){
  if(view!=='game'||state?.phase!=='playing'||current()?.role!=='player'||current()?.resetUntil||document.hidden||state.self.wordMode||liveDialogOpen())return;
  movement.angle=aim.update(dt,keys.has('KeyQ'),keys.has('KeyE'),(x,y)=>arena.aimAt(x,y));
}
// Listen on the arena wrapper so HUD overlays do not interrupt a full circle.
$('arenaWrap').addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||e.target.closest?.('.touch-stick')||state?.self.wordMode||liveDialogOpen())return;
  aim.point(e.clientX,e.clientY);updateAim(0);
});
$('arena').addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||state?.self.wordMode||liveDialogOpen())return;
  e.preventDefault();aim.point(e.clientX,e.clientY);updateAim(0);
  if(e.button===0){movement.pulse=true;$('arena').setPointerCapture(e.pointerId);}
});
window.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')movement.pulse=false;});
$('arena').addEventListener('pointercancel',()=>{movement.pulse=false;});
$('arena').addEventListener('lostpointercapture',()=>{movement.pulse=false;});
$('arena').addEventListener('contextmenu',e=>e.preventDefault());
function stick(id,isAim){
  const el=$(id),knob=el.querySelector('span');let pointer=null;
  const move=e=>{
    if(e.pointerId!==pointer||liveDialogOpen())return;
    e.preventDefault();const r=el.getBoundingClientRect(),limit=r.width*.38;
    let x=(e.clientX-r.left-r.width/2)/limit,y=(e.clientY-r.top-r.height/2)/limit;
    const length=Math.max(1,Math.hypot(x,y));x/=length;y/=length;knob.style.transform='translate('+x*limit+'px,'+y*limit+'px)';
    if(isAim){
      if(!state?.self.wordMode&&aim.stick(x,y)){movement.angle=aim.angle;movement.pulse=true;}
      else movement.pulse=false;
    }
    else{touchMove={x,y};updateMovement();}
  };
  const end=e=>{if(e.pointerId!==pointer)return;pointer=null;knob.style.transform='';if(isAim)movement.pulse=false;else{touchMove={x:0,y:0};updateMovement();}};
  el.addEventListener('pointerdown',e=>{if(pointer!==null||liveDialogOpen())return;pointer=e.pointerId;el.setPointerCapture(pointer);move(e);});
  el.addEventListener('pointermove',move);el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end);
}
stick('leftStick',false);stick('rightStick',true);
setInterval(()=>{
  if(!socket.connected||view!=='game'||state?.phase!=='playing'||current()?.role!=='player')return;
  updateMovement();
  socket.volatile.emit('input',{...movement,matchId:state.matchId,seq:++inputSeq});
},1000/30);
function timers(){
  if(!state||view!=='game')return;
  const now=serverNow(),p=current(),remaining=Math.max(0,Math.ceil((state.endAt-now)/1000));
  renderCollectionHint();renderSignals(now);
  renderMissions(now);renderDefense(now);renderPowerUp(now);
  $('clock').textContent=Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0');
  $('clock').classList.toggle('urgent',remaining<=30);
  $('arenaWrap').classList.toggle('final-push',state.phase==='playing'&&remaining>0&&remaining<=30);
  const seconds=state.phase==='countdown'?Math.max(1,Math.ceil((state.startAt-now)/1000)):remaining;
  const cue=feedback.clock(state.phase,seconds);if(cue.tick)sound('tick');if(cue.notice)announce(cue.notice);
  let overlay=false;
  if(state.phase==='countdown'){
    const mission=missionBriefing(state);
    overlay=true;$('overlayLabel').textContent=mission.launch;$('overlayValue').textContent=String(Math.max(1,Math.ceil((state.startAt-now)/1000)));$('overlayHint').textContent=mission.launchHint;
  }else if(p?.resetUntil>now){
    overlay=true;$('overlayLabel').textContent='RECALIBRATING';$('overlayValue').textContent=String(Math.ceil((p.resetUntil-now)/1000));$('overlayHint').textContent='Your points are safe. Returning to orbit…';
  }
  show('phaseOverlay',overlay);
  if(!p)return;
  $('stability').textContent=state.settings.disruption?'◈'.repeat(Math.max(0,p.stability))+'◇'.repeat(Math.max(0,3-p.stability)):'';
  const shield=Math.max(0,Math.ceil((p.shieldUntil-now)/1000)),cooldown=Math.max(0,Math.ceil((state.self.cooldownUntil-now)/1000));
  $('shieldStatus').textContent=shield?'Word shield '+shield+'s':cooldown?'Shield ready in '+cooldown+'s':'Word shield ready';
  $('wordProtection').textContent=shield?'◈ Protected for '+shield+'s · ship stationary':'◇ Unprotected · '+(cooldown?'shield recharges in '+cooldown+'s':'close and reopen to activate your shield');
  $('wordProtection').style.color=shield?'var(--mint)':'#ffbe78';
}
function frame(time){
  const dt=Math.max(0,Math.min((time-lastAimFrame)/1000,.05));lastAimFrame=time;
  updateAim(dt);
  syncPowerUpState(state?.phase==='playing'&&state.defense?.enabled?state.powerUps:null,serverNow());
  backdrop.draw(time);
  if(view==='game')arena.draw(time);
  if(time-lastUI>100){timers();lastUI=time;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
GLYPHSTORM_2E26CFED7509767F

# FILE: public/arena.js
cat > 'public/arena.js' <<'GLYPHSTORM_851FB10865762886'
import { WORLD, RULES, delta, wrap } from './rules.js';
import { ShipSprites } from './ship-sprites.js';
import { vectorAngle } from './aim.js';
import { drawAsteroid, AsteroidSprites } from './asteroids.js';
import { createEarthTexture, drawEarth } from './planet.js';
import { incomingSpeedFactor } from './power-ups.js';
import { NEON, BURST_COLORS, drawNeonGrid, letterGlow } from './neon.js';
import { WordEnergy } from './word-energy.js';
import { signalText } from './signals.js';
const TAU=Math.PI*2;
export const MAX_PARTICLES=320;
function sizeCanvas(canvas) {
  const rect=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
  const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
  return {ctx,w:rect.width,h:rect.height};
}
const stars=Array.from({length:180},(_,i)=>({x:((i*7919)%10007)/10007,y:((i*4447)%10009)/10009,r:i%7===0?1.4:.6,a:.15+(i%8)/18}));
function field(ctx,w,h,time,reduced) {
  ctx.clearRect(0,0,w,h);ctx.fillStyle=NEON.space;ctx.fillRect(0,0,w,h);
  for(const s of stars){ctx.globalAlpha=s.a*(reduced?1:.8+.2*Math.sin(time*.001+s.x*20));ctx.fillStyle='#c3e3f4';ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,TAU);ctx.fill();}
  ctx.globalAlpha=1;drawNeonGrid(ctx,w,h,time,reduced);
}
function crystal(ctx,x,y,r,rotation,letter,color='#70f7d1',scale=1) {
  ctx.save();ctx.translate(x,y);
  const points=[[-.1,-1],[.8,-.45],[.65,.64],[-.28,.95],[-.9,.15],[-.65,-.65]];
  ctx.rotate(rotation);
  ctx.beginPath();points.forEach(([px,py],i)=>i?ctx.lineTo(px*r,py*r):ctx.moveTo(px*r,py*r));ctx.closePath();
  const fill=ctx.createLinearGradient(-r,-r,r,r);fill.addColorStop(0,'#2c756b88');fill.addColorStop(1,'#182c5266');
  ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=color+'80';ctx.lineWidth=1.4;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-.1*r,-r);ctx.lineTo(-.28*r,.95*r);ctx.lineTo(.8*r,-.45*r);ctx.lineTo(-.9*r,.15*r);ctx.strokeStyle=color+'26';ctx.lineWidth=.7;ctx.stroke();
  ctx.rotate(-rotation);
  letterGlow(ctx,{color});ctx.fillStyle='#e7fff9';ctx.font='750 '+Math.max(13,21*scale)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(letter,0,1);
  ctx.restore();
}
export class SpaceBackdrop {
  constructor(canvas){this.canvas=canvas;this.reduced=false;this.active=true;}
  draw(time){
    const {ctx,w,h}=sizeCanvas(this.canvas);field(ctx,w,h,time,this.reduced);
    if(!this.active)return;
    const x=w*.25,y=h*.61,r=Math.min(520,w*.47);
    const g=ctx.createRadialGradient(x-r*.25,y-r*.3,0,x,y,r);g.addColorStop(0,'#163d4538');g.addColorStop(.6,'#112b4226');g.addColorStop(1,'#0b142300');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.clip();ctx.strokeStyle='#53969513';ctx.lineWidth=1;
    for(let i=-4;i<=4;i++){
      ctx.beginPath();ctx.ellipse(x,y,r*Math.max(.08,Math.abs(i)/4),r,.25,0,TAU);ctx.stroke();
      ctx.beginPath();ctx.ellipse(x,y+i*r*.22,r,Math.max(8,r*.19),.25,0,TAU);ctx.stroke();
    }ctx.restore();
    if(w>700){
      const t=this.reduced?0:time*.0001;
      crystal(ctx,w*.45+Math.sin(t)*10,h*.38,28,.2,'A','#70f7d1',1.1);
      crystal(ctx,w*.39+Math.cos(t)*10,h*.72,20,-.1,'R','#b5a0ff',.8);
      crystal(ctx,w*.08,h*.78+Math.sin(t)*7,17,.3,'E','#70f7d1',.7);
    }
  }
}
export class Arena {
  constructor(canvas,map,getInput){
    this.canvas=canvas;this.map=map;this.getInput=getInput;
    this.ships=new ShipSprites();
    this.rocks=new AsteroidSprites();this.earthTexture=createEarthTexture();
    this.state=null;this.me=null;this.follow=null;this.visual=new Map();this.camera={x:1200,y:800};
    this.received=0;this.lastEvent=0;this.effects=[];this.lastFrame=performance.now();this.reduced=false;
    this.particles=[];this.trails=new Map();
    this.wordEnergy=new WordEnergy();
    this.scale=1;this.w=1000;this.h=600;
  }
  update(state,me){
    if(this.state?.matchId!==state.matchId){
      this.visual.clear();this.effects=[];this.particles=[];this.trails.clear();
      this.lastEvent=state.phase==='playing'?Math.max(0,...state.events.map(e=>e.seq)):0;
    }
    this.state=state;this.me=me;this.received=performance.now();
    this.wordEnergy.update(state,this.received);
    for(const ev of state.events){
      if(ev.seq<=this.lastEvent)continue;
      this.lastEvent=ev.seq;
      if(!Number.isFinite(ev.at)||state.now-ev.at>1800)continue;
      if(['open','pickup','ripple','reset','return','word','asteroidCharge','asteroidOpen','barrierImpact','barrierBlock','intercept','powerUpStart','empPulse'].includes(ev.type))
        this.effects.push({...ev,born:this.received});
      if(!this.reduced){
        if(['barrierImpact','barrierBlock'].includes(ev.type))this.createShieldRipple(ev.x,ev.y,this.received);
        else this.burst(ev,this.received);
      }
    }
    this.effects=this.effects.slice(-80);
  }
  createShieldRipple(x,y,born=performance.now()){
    if(this.reduced||![x,y].every(Number.isFinite))return;
    for(let i=0;i<10;i++){
      const angle=i*TAU/10;
      this.particles.push({x,y,vx:Math.cos(angle)*190,vy:Math.sin(angle)*190,
        color:'#00f3ff',size:3,born,life:300,ripple:true});
    }
    if(this.particles.length>MAX_PARTICLES)this.particles.splice(0,this.particles.length-MAX_PARTICLES);
  }
  burst(event,born){
    if(!Number.isFinite(event.x)||!Number.isFinite(event.y))return;
    const count=event.type==='asteroidOpen'?36:event.type==='asteroidCharge'?5:event.type==='word'?24:event.type==='open'?14:event.type==='pickup'?5:event.type==='return'?14:8;
    for(let i=0;i<count;i++){
      const energetic=['open','asteroidOpen','word','intercept','powerUpStart','empPulse'].includes(event.type);
      const seed=((event.seq*97+i*53)%101)/101,angle=i*TAU/count+seed*.5,speed=energetic?200+seed*230:35+seed*115;
      this.particles.push({x:event.x,y:event.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
        color:BURST_COLORS[i%BURST_COLORS.length],size:1+seed*2,born,life:500+seed*450});
    }
    if(this.particles.length>MAX_PARTICLES)this.particles.splice(0,this.particles.length-MAX_PARTICLES);
  }
  drawTrails(ctx,time,now){
    if(this.reduced){this.trails.clear();return;}
    const ids=new Set(this.state.players.filter(p=>p.role==='player').map(p=>p.id));
    for(const id of this.trails.keys())if(!ids.has(id))this.trails.delete(id);
    for(const pilot of this.state.players){
      if(pilot.role!=='player')continue;
      let trail=this.trails.get(pilot.id)||[];
      trail=trail.filter(point=>time-point.at<340);
      const moving=!pilot.wordMode&&pilot.resetUntil<=now&&Math.hypot(pilot.vx,pilot.vy)>35;
      const v=this.visual.get(pilot.id)||pilot;
      if(moving&&(!trail.length||time-trail.at(-1).at>=28))trail.push({
        x:wrap(v.x-Math.cos(v.angle)*14,WORLD.width),y:wrap(v.y-Math.sin(v.angle)*14,WORLD.height),at:time
      });
      this.trails.set(pilot.id,trail.slice(-14));
      ctx.save();ctx.strokeStyle=pilot.boostUntil>now?'#b6f1ff':pilot.color;ctx.lineCap='round';
      for(let i=1;i<trail.length;i++){
        const a=this.project(trail[i-1].x,trail[i-1].y),b=this.project(trail[i].x,trail[i].y);
        if(Math.hypot(a.x-b.x,a.y-b.y)>100*this.scale)continue;
        const strength=1-(time-trail[i].at)/340;
        ctx.globalAlpha=strength*(pilot.boostUntil>now?.8:.48);ctx.lineWidth=(1+strength*(pilot.boostUntil>now?6:3))*this.scale;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      ctx.restore();
    }
  }
  drawParticles(ctx,time){
    if(this.reduced){this.particles=[];return;}
    this.particles=this.particles.filter(p=>time-p.born<p.life);
    ctx.save();
    for(const p of this.particles){
      const age=(time-p.born)/1000,travel=p.ripple?age:(1-Math.exp(-3*age))/3;
      const s=this.project(wrap(p.x+p.vx*travel,WORLD.width),wrap(p.y+p.vy*travel,WORLD.height));
      if(s.x<0||s.y<0||s.x>this.w||s.y>this.h)continue;
      const fade=1-(time-p.born)/p.life;
      ctx.globalAlpha=fade*fade;ctx.fillStyle=p.color;
      const size=p.size*this.scale;
      if(p.ripple){ctx.beginPath();ctx.arc(s.x,s.y,size,0,TAU);ctx.fill();}
      else ctx.fillRect(s.x-size/2,s.y-size/2,size,size);
    }
    ctx.restore();
  }
  targetPlayer(){
    return this.state?.players.find(p=>p.id===(this.follow||this.me)&&p.role==='player') ||
      this.state?.players.find(p=>p.role==='player');
  }
  project(x,y){return {x:this.w/2+delta(x,this.camera.x,WORLD.width)*this.scale,y:this.h/2+delta(y,this.camera.y,WORLD.height)*this.scale};}
  aimAt(clientX,clientY){
    const p=this.state?.players.find(p=>p.id===this.me);if(!p)return 0;
    const v=this.visual.get(p.id)||p,screen=this.project(v.x,v.y),rect=this.canvas.getBoundingClientRect();
    return vectorAngle(clientX-rect.left-screen.x,clientY-rect.top-screen.y,this.getInput().angle,2);
  }
  drawUsefulness(ctx,x,y,r,kind,guide=false,incoming=false){
    ctx.save();
    if(kind==='useful'||guide){ctx.strokeStyle='#b6ff00';ctx.lineWidth=1.5;ctx.shadowColor='#b6ff00';ctx.shadowBlur=this.reduced?0:15;for(const extra of [0,4]){ctx.beginPath();ctx.arc(x,y,r+extra,0,TAU);ctx.stroke();}}
    else if(kind==='dim'){
      if(!incoming){ctx.fillStyle='#0a081366';ctx.beginPath();ctx.arc(x,y,r-2,0,TAU);ctx.fill();}
      ctx.strokeStyle='#9b8da9';ctx.setLineDash([2,4]);ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
    }
    ctx.restore();
  }
  drawGuide(ctx,x,y,r,label){
    ctx.save();ctx.strokeStyle='#00f3ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
    ctx.fillStyle='#071321';ctx.fillRect(x-35,y-r-18,70,15);ctx.fillStyle='#b6faff';ctx.font='700 9px system-ui';ctx.textAlign='center';ctx.fillText('NEXT · '+label,x,y-r-7);ctx.restore();
  }
  draw(time){
    const dt=Math.min((time-this.lastFrame)/1000,.05);this.lastFrame=time;
    if(!this.state || this.canvas.clientHeight===0)return;
    const {ctx,w,h}=sizeCanvas(this.canvas);this.w=w;this.h=h;
    this.scale=Math.min(w/1100,h/620);this.scale=Math.max(.4,Math.min(1.5,this.scale));
    field(ctx,w,h,time,this.reduced);
    const state=this.state,age=Math.min((time-this.received)/1000,.12),now=state.now+time-this.received;
    const hitAge=now-(state.defense?.lastImpactAt||-Infinity);
    ctx.save();
    if(!this.reduced&&hitAge>=0&&hitAge<200){const amplitude=3*(1-hitAge/200);ctx.translate(Math.sin(hitAge*.15)*amplitude,Math.cos(hitAge*.19)*amplitude);}
    const input=this.getInput();
    for(const p of state.players){
      if(p.role!=='player')continue;
      let v=this.visual.get(p.id);
      if(!v){v={x:p.x,y:p.y,angle:p.angle};this.visual.set(p.id,v);}
      if(p.id===this.me && !p.resetUntil && !p.wordMode && state.phase==='playing'){
        const boosting=p.boostUntil>now;
        v.x=wrap(v.x+(boosting?p.boostX*RULES.boostSpeed:input.x*RULES.speed)*dt,WORLD.width);
        v.y=wrap(v.y+(boosting?p.boostY*RULES.boostSpeed:input.y*RULES.speed)*dt,WORLD.height);
      }
      const k=1-Math.exp(-14*dt);
      const tx=wrap(p.x+p.vx*age,WORLD.width),ty=wrap(p.y+p.vy*age,WORLD.height);
      if(Math.hypot(delta(tx,v.x,WORLD.width),delta(ty,v.y,WORLD.height))>250){v.x=tx;v.y=ty;}
      else{v.x=wrap(v.x+delta(tx,v.x,WORLD.width)*k,WORLD.width);v.y=wrap(v.y+delta(ty,v.y,WORLD.height)*k,WORLD.height);}
      v.angle=p.id===this.me?input.angle:p.angle;
    }
    const target=this.targetPlayer(),cv=target&&(this.visual.get(target.id)||target);
    if(cv){const k=this.reduced?1:1-Math.exp(-10*dt);this.camera.x=wrap(this.camera.x+delta(cv.x,this.camera.x,WORLD.width)*k,WORLD.width);this.camera.y=wrap(this.camera.y+delta(cv.y,this.camera.y,WORLD.height)*k,WORLD.height);}
    const glow=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.max(w,h)*.65);
    glow.addColorStop(0,'#1d4b5423');glow.addColorStop(.6,'#15274920');glow.addColorStop(1,'#02071360');
    ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    // Neon perspective is decorative; all world entities retain linear aiming.
    if(state.defense?.enabled){
      const d=state.defense,s=this.project(d.x,d.y);
      drawEarth(ctx,s.x,s.y,this.scale,d,this.earthTexture,state.powerUps,now,this.reduced);
      // A fixed world objective cannot follow every pilot's camera. Point to it.
      if(s.x<0||s.x>w||s.y<0||s.y>h){
        const dx=s.x-w/2,dy=s.y-h/2,k=Math.min((w/2-38)/Math.max(1,Math.abs(dx)),(h/2-38)/Math.max(1,Math.abs(dy)));
        const x=w/2+dx*k,y=h/2+dy*k;
        ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.fillStyle='#00f3ff';
        ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-5,-5);ctx.lineTo(-5,5);ctx.closePath();ctx.fill();ctx.restore();
        ctx.fillStyle='#b6f1ff';ctx.font='600 9px system-ui';ctx.textAlign='center';ctx.fillText('EARTH · WAVE '+Math.max(0,Math.ceil((d.nextWaveAt-now)/1000))+'s',x,y+18);
      }
    }
    this.drawTrails(ctx,time,now);
    const visible=(s,margin=80)=>s.x>-margin&&s.x<w+margin&&s.y>-margin&&s.y<h+margin;
    const local=state.players.find(p=>p.id===this.me),guideDistance=t=>Math.hypot(delta(t.x,this.camera.x,WORLD.width),delta(t.y,this.camera.y,WORLD.height));
    const guideIds=new Set(this.guideLetter?[...state.crystals,...state.letters].filter(t=>t.letter===this.guideLetter&&
      (!t.priorityUntil||t.priorityUntil<=now||t.ownerId===this.me||(state.settings.mode==='teams'&&t.team===local?.team)))
      .sort((a,b)=>guideDistance(a)-guideDistance(b)).slice(0,4).map(t=>t.id):[]);
    const usefulness=state.self?.wordGuide?.usefulness||{};
    for(const c of state.crystals){
      const s=this.project(c.x,c.y);if(!visible(s))continue;
      const rotation=c.rotation+(this.reduced?0:time*.00006);
      crystal(ctx,s.x,s.y,Math.max(18,c.r*this.scale),rotation,c.letter,c.letter==='Q'||c.letter==='Z'||c.letter==='X'?NEON.pink:NEON.cyan,this.scale);
      this.drawUsefulness(ctx,s.x,s.y,Math.max(18,c.r*this.scale)+3,usefulness[c.letter],guideIds.has(c.id));
      if(guideIds.has(c.id))this.drawGuide(ctx,s.x,s.y,Math.max(18,c.r*this.scale)+7,'PULSE '+c.letter);
    }
    for(const a of state.asteroids||[]){
      const s=this.project(wrap(a.x+a.vx*age,WORLD.width),wrap(a.y+a.vy*age,WORLD.height));if(!visible(s))continue;
      if(a.kind==='meteor'&&!this.reduced){
        ctx.save();ctx.strokeStyle='#a0e7f435';ctx.lineWidth=3*this.scale;
        const length=Math.hypot(a.vx,a.vy)||1;ctx.beginPath();ctx.moveTo(s.x,s.y);
        ctx.lineTo(s.x-a.vx/length*110*this.scale,s.y-a.vy/length*110*this.scale);ctx.stroke();ctx.restore();
      }
      const flash=!this.reduced&&this.effects.some(e=>e.type==='asteroidCharge'&&e.asteroidId===a.id&&time-e.born<150);
      drawAsteroid(ctx,s.x,s.y,a.r*this.scale,a.rotation+(this.reduced?0:(now-(state.startAt||0))*(a.spin??.08)/1000),a.hitsRemaining,
        {...a,texture:this.rocks.texture,flash});
    }
    const fallingFactor=incomingSpeedFactor(state.powerUps,now);
    for(const l of state.letters){
      const s=this.project(wrap(l.x+(l.incoming?l.vx*age*fallingFactor:0),WORLD.width),wrap(l.y+(l.incoming?l.vy*age*fallingFactor:0),WORLD.height));if(!visible(s))continue;
      if(l.incoming){
        ctx.save();ctx.strokeStyle=NEON.pink+'80';ctx.lineWidth=2*this.scale;ctx.beginPath();ctx.moveTo(s.x,s.y);
        const speed=Math.hypot(l.vx,l.vy)||1;ctx.lineTo(s.x-l.vx/speed*38*this.scale,s.y-l.vy/speed*38*this.scale);ctx.stroke();ctx.restore();
      }
      const protectedPickup=l.priorityUntil>now;
      const mine=state.players.find(p=>p.id===this.me);
      const eligible=!protectedPickup||l.ownerId===this.me||(state.settings.mode==='teams'&&mine?.team===l.team);
      const letter={...l,color:l.incoming?NEON.pink:eligible?NEON.lime:'#c399ff'};
      const color=letter.color,r=Math.max(13,RULES.letterRadius*this.scale);
      ctx.save();ctx.translate(s.x,s.y);ctx.globalAlpha=l.expiresAt-now<3000?.55:1;
      letterGlow(ctx,letter,this.reduced);
      ctx.fillStyle='#153143';ctx.strokeStyle=color;ctx.lineWidth=1.3;
      ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle=color;ctx.font='750 '+Math.max(14,20*this.scale)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(l.letter,0,1);ctx.shadowBlur=0;
      if(protectedPickup){ctx.beginPath();ctx.arc(0,0,r+6,-Math.PI/2,-Math.PI/2+TAU*Math.max(0,(l.priorityUntil-now)/2000));ctx.strokeStyle=color+'70';ctx.lineWidth=1;ctx.stroke();}
      if(l.doubleScore){ctx.fillStyle='#ffdc9e';ctx.font='800 11px system-ui';ctx.fillText('★',r-1,-r+1);}
      ctx.restore();
      this.drawUsefulness(ctx,s.x,s.y,r+3,usefulness[l.letter],guideIds.has(l.id),l.incoming);
      if(l.magnetized){ctx.save();ctx.strokeStyle='#b6ff00';ctx.setLineDash([2,4]);ctx.beginPath();ctx.arc(s.x,s.y,r+10,0,TAU);ctx.stroke();ctx.restore();}
      if(eligible&&guideIds.has(l.id))this.drawGuide(ctx,s.x,s.y,r+9,'COLLECT '+l.letter);
    }
    for(const pulse of state.pulses){
      const s=this.project(wrap(pulse.x+pulse.vx*age,WORLD.width),wrap(pulse.y+pulse.vy*age,WORLD.height));if(!visible(s))continue;
      ctx.save();ctx.translate(s.x,s.y);ctx.rotate(Math.atan2(pulse.vy,pulse.vx));ctx.strokeStyle=pulse.color;ctx.lineWidth=2;
      if(!this.reduced){ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(-30*this.scale,0);ctx.lineTo(-8*this.scale,0);ctx.stroke();ctx.globalAlpha=1;}
      ctx.shadowBlur=this.reduced?0:8;ctx.shadowColor=pulse.color;ctx.beginPath();ctx.ellipse(0,0,8*this.scale,4*this.scale,0,0,TAU);ctx.stroke();ctx.restore();
    }
    for(const p of state.players){
      if(p.role!=='player')continue;
      const v=this.visual.get(p.id)||p,s=this.project(v.x,v.y);if(!visible(s))continue;
      const r=Math.max(11,16*this.scale);
      ctx.save();ctx.translate(s.x,s.y);
      if(p.resetUntil>now){
        ctx.strokeStyle=p.color+'80';ctx.lineWidth=1;
        for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,0,r*(1+i*.5),r*(.5+i*.25),0,0,TAU);ctx.stroke();}
        ctx.restore();continue;
      }
      if(p.shieldUntil>now||p.protectionUntil>now){
        ctx.strokeStyle=p.color+'b0';ctx.fillStyle=p.color+'10';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(0,0,r+14+(this.reduced?0:Math.sin(time*.004)*2),0,TAU);ctx.fill();ctx.stroke();
      }
      if(p.boostUntil>now){
        ctx.strokeStyle='#b6f1ff';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(0,0,r+9,Math.atan2(p.boostY,p.boostX)-1,Math.atan2(p.boostY,p.boostX)+1);ctx.stroke();
      }
      // Paint is cosmetic. This marker always uses the server's pilot/team color.
      ctx.strokeStyle=p.color;ctx.lineWidth=p.id===this.me?1.7:1.2;
      ctx.beginPath();ctx.arc(0,0,r+5,0,TAU);ctx.stroke();
      ctx.save();ctx.rotate(v.angle);
      if(!this.ships.draw(ctx,p.shipId,r*2.5)){
        if(Math.hypot(p.vx,p.vy)>20){ctx.fillStyle=p.color+'55';ctx.beginPath();ctx.moveTo(-r*.7,-r*.3);ctx.lineTo(-r*(this.reduced?1.4:1.5+Math.sin(time*.03)*.25),0);ctx.lineTo(-r*.7,r*.3);ctx.fill();}
        ctx.fillStyle=p.color+'35';ctx.strokeStyle=p.color;ctx.lineWidth=1.7;
        ctx.beginPath();ctx.moveTo(r*1.15,0);ctx.lineTo(-r*.8,r*.75);ctx.lineTo(-r*.45,0);ctx.lineTo(-r*.8,-r*.75);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#eafffa';ctx.beginPath();ctx.arc(0,0,2.5,0,TAU);ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle=p.id===this.me?'#edfff9':'#bbcfdf';ctx.font='600 10px system-ui';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(p.name+(p.connected?'':' · away'),0,r+16);
      if(state.settings.disruption){for(let i=0;i<3;i++){ctx.fillStyle=i<p.stability?p.color:'#26374e';ctx.fillRect(-13+i*10,r+30,7,2);}}
      ctx.restore();
    }
    this.drawParticles(ctx,time);
    this.wordEnergy.draw(ctx,(x,y)=>this.project(x,y),this.scale,time,this.reduced);
    for(const signal of (state.self?.signals||[]).filter(s=>s.expiresAt>now).slice(-3)){
      const s=this.project(signal.x,signal.y);if(!visible(s))continue;
      ctx.save();ctx.strokeStyle='#ffdc9e';ctx.fillStyle='#ffdc9e';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(s.x,s.y,34*this.scale,0,TAU);ctx.stroke();
      ctx.textAlign='center';ctx.font='700 11px system-ui';ctx.fillText(signalText(signal),s.x,s.y-40*this.scale);ctx.restore();
    }
    this.effects=this.effects.filter(e=>time-e.born<(e.type==='barrierImpact'?850:e.type==='barrierBlock'?300:e.type==='word'?1400:800));
    for(const e of this.effects){
      if(e.x===undefined)continue;
      const s=this.project(e.x,e.y),t=(time-e.born)/(e.type==='barrierImpact'?850:e.type==='barrierBlock'?300:e.type==='word'?1400:800);
      ctx.save();ctx.globalAlpha=1-t;ctx.strokeStyle=e.color||'#a3ffe0';ctx.fillStyle=e.color||'#a3ffe0';
      if(e.type==='empPulse'){
        ctx.strokeStyle=NEON.cyan;ctx.lineWidth=3;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?190:40+t*620)*this.scale,0,TAU);ctx.stroke();
        ctx.textAlign='center';ctx.font='700 13px system-ui';ctx.fillStyle=NEON.lime;ctx.fillText(e.count+' LETTERS SECURED',s.x,s.y-32);
      }else if(['barrierImpact','barrierBlock'].includes(e.type)){
        ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?18:8+t*52)*this.scale,0,TAU);ctx.stroke();
        if(e.type==='barrierImpact'&&e.damage){ctx.fillStyle='#ff8d9b';ctx.font='800 23px system-ui';ctx.textAlign='center';ctx.fillText('−'+e.damage,s.x,s.y-24-(this.reduced?0:t*34));}
      }else if(e.type==='word'){
        const mine=e.playerId===this.me;
        ctx.font='800 '+(mine?23:16)+'px system-ui';ctx.textAlign='center';ctx.fillText(e.word+' +'+e.points,s.x,s.y-40-(this.reduced?0:t*42));
        if(!this.reduced){ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,(15+t*65)*this.scale,0,TAU);ctx.stroke();}
      }else if(e.type==='asteroidOpen'){
        ctx.textAlign='center';ctx.font='800 18px system-ui';ctx.fillText('+'+e.count+' LETTERS',s.x,s.y-54-(this.reduced?0:t*28));
        ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?55:35+t*95)*this.scale,0,TAU);ctx.stroke();
      }else if(e.type==='asteroidCharge'){
        ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?50:40+t*20)*this.scale,0,TAU);ctx.stroke();
      }else if(e.type==='pickup'){
        ctx.font='800 17px system-ui';ctx.textAlign='center';ctx.fillText('+'+e.letter,s.x,s.y-15-(this.reduced?0:t*24));
      }else{
        ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(s.x,s.y,(this.reduced?20:8+t*48)*this.scale,0,TAU);ctx.stroke();
      }ctx.restore();
    }
    const vignette=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.7);
    vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#050b20b0');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
    if(state.phase==='playing'&&state.endAt>now&&state.endAt-now<=30000){
      ctx.strokeStyle=state.endAt-now<=10000?'#ffbe7870':'#ffbe7830';ctx.lineWidth=3;ctx.strokeRect(1.5,1.5,w-3,h-3);
    }
    if(!this.reduced&&hitAge>=0&&hitAge<180){
      ctx.save();ctx.fillStyle='#ff3758';ctx.globalAlpha=.12*(1-hitAge/180);ctx.fillRect(0,0,w,h);ctx.restore();
    }
    ctx.restore();this.drawMap();
  }
  drawMap(){
    const ctx=this.map.getContext('2d'),w=this.map.width,h=this.map.height;ctx.clearRect(0,0,w,h);
    ctx.strokeStyle='#2e486040';ctx.lineWidth=1;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(w*i/4,0);ctx.lineTo(w*i/4,h);ctx.stroke();}
    ctx.fillStyle='#577485';for(const c of this.state.crystals)ctx.fillRect(c.x/WORLD.width*w,c.y/WORLD.height*h,2,2);
    for(const a of this.state.asteroids||[]){ctx.fillStyle=a.kind==='meteor'?'#a0e7f4':'#ffcf92';ctx.beginPath();ctx.arc(a.x/WORLD.width*w,a.y/WORLD.height*h,a.kind==='meteor'?3.5:2.5,0,TAU);ctx.fill();}
    for(const p of this.state.players){if(p.role!=='player'||p.resetUntil)continue;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x/WORLD.width*w,p.y/WORLD.height*h,p.id===this.me?3.5:2,0,TAU);ctx.fill();}
    const d=this.state.defense;
    if(d?.enabled){
      ctx.strokeStyle='#00f3ff';ctx.fillStyle='#137c99';ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(d.x/WORLD.width*w,d.y/WORLD.height*h,d.barrierRadius/WORLD.width*w,d.barrierRadius/WORLD.height*h,0,0,TAU);ctx.stroke();
      ctx.beginPath();ctx.arc(d.x/WORLD.width*w,d.y/WORLD.height*h,4,0,TAU);ctx.fill();
      ctx.fillStyle=NEON.pink;for(const letter of this.state.letters)if(letter.incoming)ctx.fillRect(letter.x/WORLD.width*w-1.5,letter.y/WORLD.height*h-1.5,3,3);
    }
    const p=this.targetPlayer();if(p){ctx.strokeStyle=p.color+'60';ctx.beginPath();ctx.arc(p.x/WORLD.width*w,p.y/WORLD.height*h,8,0,TAU);ctx.stroke();}
    const now=this.state.now+performance.now()-this.received;
    ctx.strokeStyle='#ffdc9e';ctx.lineWidth=2;
    for(const s of (this.state.self?.signals||[]).filter(s=>s.expiresAt>now)){
      ctx.strokeRect(s.x/WORLD.width*w-4,s.y/WORLD.height*h-4,8,8);
    }
  }
}
GLYPHSTORM_851FB10865762886

# FILE: public/asteroids.js
cat > 'public/asteroids.js' <<'GLYPHSTORM_198D7811E6762E3C'
import { RULES } from './rules.js';

export class AsteroidSprites {
  constructor(){this.texture=null;this.ready=this.load();}
  async load(){
    try{
      const image=new Image();image.src='/assets/asteroids/rock-v15.png';await image.decode();
      const texture=document.createElement('canvas');texture.width=texture.height=384;
      const ctx=texture.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.drawImage(image,0,0,384,384);this.texture=texture;return true;
    }catch{return false;}
  }
}

// Generated rocky texture with a code-drawn fallback and separate HUD markers.
export function drawAsteroid(ctx,x,y,r,rotation,hitsRemaining,options={}) {
  const maxHits=options.maxHits||RULES.asteroidHits,charged=maxHits-hitsRemaining;
  const meteor=options.kind==='meteor',accent=meteor?'#a0e7f4':'#ffcf92';
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
  if(options.texture){
    ctx.drawImage(options.texture,-r*1.08,-r*1.08,r*2.16,r*2.16);
  }else{
  const radii=[.93,.81,.97,.88,1,.83,.95,.86,.98,.8,.95,.87];
  ctx.beginPath();
  radii.forEach((radius,i)=>{
    const a=i*Math.PI*2/radii.length,px=Math.cos(a)*r*radius,py=Math.sin(a)*r*radius;
    if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);
  });ctx.closePath();
  const rock=ctx.createLinearGradient(-r,-r,r,r);
  rock.addColorStop(0,'#6b6573');rock.addColorStop(.5,'#393c50');rock.addColorStop(1,'#202537');
  ctx.fillStyle=rock;ctx.fill();ctx.strokeStyle=charged?'#ffd491':'#b49a79';ctx.lineWidth=1.6;ctx.stroke();
  for(const [cx,cy,cr] of [[-.36,-.27,.2],[.38,.07,.15],[-.12,.4,.13]]){
    ctx.fillStyle='#131e2e66';ctx.strokeStyle='#e2d3b024';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(cx*r,cy*r,cr*r,cr*r*.72,.4,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  ctx.strokeStyle=charged===2?'#fff0b6':charged?'#fbc47b':'#b79777';ctx.lineWidth=charged===2?2.4:1.5;
  ctx.beginPath();ctx.moveTo(-r*.52,r*.52);ctx.lineTo(-r*.16,r*.1);ctx.lineTo(-r*.22,-r*.32);ctx.lineTo(r*.2,-r*.72);
  ctx.moveTo(-r*.16,r*.1);ctx.lineTo(r*.3,-r*.04);ctx.lineTo(r*.62,-r*.38);ctx.stroke();
  }
  ctx.rotate(-rotation);
  if(meteor||options.flash){
    ctx.strokeStyle=options.flash?'#ffffffb0':'#a0e7f470';ctx.lineWidth=options.flash?2:1;
    ctx.beginPath();ctx.arc(0,0,r+3,0,Math.PI*2);ctx.stroke();
  }
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=0;i<maxHits;i++){
    ctx.fillStyle=i<charged?accent:'#162131';ctx.strokeStyle=accent;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc((i-(maxHits-1)/2)*9,r+8,2.5,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  const reward={vowel:' + VOWEL',double:' · ★ ×2',shield:' + SHIELD'}[options.rewardType]||'';
  const label=(meteor?'METEOR · ':'')+(options.letterCount||RULES.asteroidLetters)+' LETTERS'+reward;
  ctx.fillStyle='#081320dd';ctx.fillRect(-label.length*2.9-5,r+15,label.length*5.8+10,16);
  ctx.fillStyle=accent;ctx.font='650 9px system-ui';ctx.fillText(label,0,r+23);
  ctx.restore();
}
GLYPHSTORM_198D7811E6762E3C

# FILE: public/compact-hud.js
cat > 'public/compact-hud.js' <<'GLYPHSTORM_C577E8C63AF10947'
// Move the same live nodes rather than maintaining a second, stale mobile HUD.
export class CompactHUD {
  constructor(doc=document,media=matchMedia('(max-width:900px), (max-height:600px)')){
    this.doc=doc;this.media=media;this.active=false;this.compact=false;
    this.dialog=doc.getElementById('telemetryDialog');
    this.destinations={powerUpCard:'telemetryObjectives',bountyCard:'telemetryObjectives',meteorCard:'telemetryObjectives',
      scoreboard:'telemetryScores',soundButton:'telemetryPreferences',motionButton:'telemetryPreferences'};
    this.slots=Object.keys(this.destinations).map(id=>{
      const element=doc.getElementById(id),marker=doc.createComment('desktop '+id);element.before(marker);return {id,element,marker};
    });
    media.addEventListener('change',()=>this.sync());
  }
  setActive(active){this.active=active;this.sync();}
  sync(){
    const compact=this.active&&this.media.matches;if(compact===this.compact)return;
    this.compact=compact;
    if(this.dialog.open)this.dialog.close();
    for(const {id,element,marker}of this.slots){
      if(compact)this.doc.getElementById(this.destinations[id]).append(element);
      else marker.after(element);
    }
  }
}
GLYPHSTORM_C577E8C63AF10947

# FILE: public/credits.html
cat > 'public/credits.html' <<'GLYPHSTORM_A9FEFE0C59562143'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Glyphstorm — Credits & dictionary</title><link rel="stylesheet" href="/style.css"><link rel="icon" href="/icon.svg"></head><body><main class="lobby"><a href="/">← Return to Glyphstorm</a><h1 style="margin-top:36px">Credits & dictionary</h1><div class="panel" style="padding:30px"><h2>Original orbit. Open-source foundations.</h2><p>Glyphstorm's interface, ship art, generated rocky asteroid texture and crystal drawings, light effects, and synthesized sounds were created for this game. It uses HTML5 Canvas, vanilla JavaScript, Node.js, Express, and Socket.io.</p><h2>Which words count?</h2><p>The server checks a bundled English word list rather than asking an AI or a live dictionary API during play. Words must contain 3–10 alphabetic letters and use a consecutive sequence starting at the first tray tile in collected order. Tiles cannot be rearranged or skipped. A word may score once per player per round. Proper names and abbreviations are not intended; dictionary coverage is imperfect, and some uncommon words may be accepted.</p><p>The dictionary is provided by <a href="https://github.com/sindresorhus/word-list" target="_blank" rel="noreferrer">word-list</a>, based on <a href="https://github.com/atebits/Words" target="_blank" rel="noreferrer">atebits/Words</a>, with an additional exact-word filter using <a href="https://github.com/nyvorin/badwords" target="_blank" rel="noreferrer">bad-words</a>. No automated filter catches every inappropriate term.</p><p>Libraries: Express, Socket.io, word-list, bad-words, and their dependencies. Their license notices are available in <a href="/third-party-notices.txt">Third-party notices</a>.</p><h2>Privacy & sessions</h2><p>No account is required to play. Your guest name, tray, and round state are held in server memory while the room is active. Your browser stores a private session token to reconnect, plus optional name, sound, and motion preferences. Room data is temporary; a server restart ends existing rooms. Hosting providers may retain ordinary access logs.</p><p>Use a nickname rather than a full name. Share room codes only with people you want to play with.</p></div></main></body></html>
GLYPHSTORM_A9FEFE0C59562143

# FILE: public/defense.js
cat > 'public/defense.js' <<'GLYPHSTORM_D958CE9804D0D399'
import { WORLD } from './rules.js';

// Browser-wide snapshot mirrors, never trusted as multiplayer authority.
export let earthHealth = 100;
export let barrierThickness = 5;
export let maxBarrierThickness = 25;

export const DEFENSE = Object.freeze({
  maxHealth:100, initialThickness:5, maxThickness:25, damage:5, repair:2,
  x:WORLD.width/2, y:WORLD.height/2, earthRadius:150, barrierRadius:190,
  firstWaveMs:12000, waveMs:8000, maxIncoming:16
});

// Each GameRoom receives its own object. Rooms never share mutable health.
export function createDefenseState(enabled=true){
  return {enabled,earthHealth:100,barrierThickness:5,maxBarrierThickness:25,
    x:DEFENSE.x,y:DEFENSE.y,earthRadius:DEFENSE.earthRadius,barrierRadius:DEFENSE.barrierRadius,
    wave:0,nextWaveAt:0,lastImpactAt:0,breaches:0};
}
export function syncDefenseState(defense){
  earthHealth=defense?.earthHealth??100;
  barrierThickness=defense?.barrierThickness??5;
  maxBarrierThickness=defense?.maxBarrierThickness??25;
}

// First segment/circle contact, including a tangent or a start inside it.
export function sweepCircle(x,y,dx,dy,radius){
  const c=x*x+y*y-radius*radius;
  if(c<=0)return 0;
  const a=dx*dx+dy*dy;if(a===0)return null;
  const b=x*dx+y*dy,discriminant=b*b-a*c;
  if(discriminant<0)return null;
  const t=(-b-Math.sqrt(discriminant))/a;
  return t>=0&&t<=1?t:null;
}
GLYPHSTORM_D958CE9804D0D399

# FILE: public/fleet.js
cat > 'public/fleet.js' <<'GLYPHSTORM_920BD91DC09A6468'
// Shared cosmetic catalog. These IDs are validated by the authoritative server.
export const FLEET = Object.freeze([
  ['01-dart', 'Dart', '#70f7d1', 'Swept wings'],
  ['02-manta', 'Manta', '#b5a0ff', 'Curved wings'],
  ['03-comet', 'Comet', '#ffbe78', 'Twin engines'],
  ['04-orbit', 'Orbit', '#ff8caf', 'Ring drive'],
  ['05-kite', 'Kite', '#93c6ff', 'Faceted hull'],
  ['06-scout', 'Scout', '#e5ed80', 'Compact cabin'],
  ['07-prism', 'Prism', '#efb0ff', 'Three pods'],
  ['08-aurora', 'Aurora', '#a0e7f4', 'Four fins']
].map(([id,name,color,description]) => Object.freeze({
  id,name,color,description,src:'/assets/ships/'+id+'.png'
})));
export const findShip = id => FLEET.find(ship => ship.id === id);
export const shipFor = id => findShip(id) || FLEET[0];
GLYPHSTORM_920BD91DC09A6468

# FILE: public/icon.svg
cat > 'public/icon.svg' <<'GLYPHSTORM_4CC3C7155DD5DA1E'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#0b1423"/><path d="M42 19a18 18 0 1 0 5 23V31H32v8h7a10 10 0 1 1-3-14z" fill="#70f7d1"/><path d="m49 5 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#b5a0ff"/></svg>
GLYPHSTORM_4CC3C7155DD5DA1E

# FILE: public/index.html
cat > 'public/index.html' <<'GLYPHSTORM_C2CC24BC9001B11B'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#080d19">
  <meta name="description" content="Open crystals and bonus asteroids. Collect letters, then arrange their tiles. Outspell the galaxy. A multiplayer word arena for 2–8 friends.">
  <title>Glyphstorm — Outspell the galaxy</title>
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/style.css?v=1.10.0">
  <script src="/socket.io/socket.io.js" defer></script>
  <script src="/app.js?v=1.10.0" type="module"></script>
</head>
<body>
  <canvas id="space" aria-hidden="true"></canvas>
  <header class="topbar">
    <a class="brand" href="/" aria-label="Glyphstorm home"><span class="brand-mark">G</span><span>GLYPHSTORM<span class="brand-sub">THE WORD ARENA</span></span></a>
    <div class="top-actions">
      <span id="connection" class="status"><i></i>Connecting</span>
      <button id="helpButton" class="text-button">How to play</button>
      <button id="soundButton" class="icon-button" aria-label="Enable sound" title="Enable sound">♪ <span>Off</span></button>
      <button id="motionButton" class="icon-button" aria-label="Enable reduced motion" title="Reduce motion">◌</button>
    </div>
  </header>
  <main>
    <section id="home" class="home view">
      <div class="hero-copy">
        <div class="eyebrow"><span class="spark"></span> 2–8 PLAYERS · ONE SHARED UNIVERSE</div>
        <h1>OUTSPELL<br>THE <em>GALAXY.</em></h1>
        <p class="hero-description">A little cosmic chaos.<br>A lot of clever words.</p>
        <p class="hero-detail">Boost through the asteroid field. Chase meteor showers.<br>Protect Earth together. Spell words to repair it.<br>Keep it alive until time runs out—then the highest word score wins.</p>
        <div class="hero-tags"><span>✦ Live multiplayer</span><span>⌁ Phones & laptops</span><span>↗ No sign-up</span></div>
        <button id="practiceButton" class="button secondary practice-launch" type="button">First flight · learn to spell ↗</button>
        <p class="practice-intro">A short solo practice. Learn one word and fix a mistake before joining.</p>
      </div>
      <div class="entry-card panel">
        <div class="card-kicker">YOUR NEXT ROUND STARTS HERE</div>
        <h2>Ready, word pilot?</h2>
        <label for="pilotName">PILOT NAME</label>
        <input id="pilotName" maxlength="18" autocomplete="nickname" placeholder="What should we call you?" aria-describedby="nameHint">
        <small id="nameHint">A friendly name. No account needed.</small>
        <button id="createButton" class="button primary">Create a room <span>↗</span></button>
        <div class="divider"><span>or join your crew</span></div>
        <label for="roomCode">ROOM CODE</label>
        <div class="join-row"><input id="roomCode" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC123"><button id="joinButton" class="button secondary">Join →</button></div>
        <p id="homeError" class="error" role="alert"></p>
        <div class="entry-footer"><span class="tiny-orbit"></span> Your friends. Your room. Your rules.</div>
      </div>
      <div class="loop-strip">
        <div><b>01</b><span><strong>OPEN</strong>Crystals & asteroids</span></div>
        <div><b>02</b><span><strong>STEER</strong>Touch letters in order</span></div>
        <div><b>03</b><span><strong>OUTSPELL</strong>Submit words. Earn points.</span></div>
      </div>
      <p class="home-bottom">STEER TO SPELL <span>✦</span> GLYPHSTORM / 1.10.0</p>
    </section>

    <section id="lobby" class="view lobby hidden">
      <div class="section-heading"><div><div class="eyebrow">FLIGHT DECK</div><h1>Your crew is assembling.</h1><p>Invite a friend, choose your rules, and ready up.</p></div><button class="text-button leave-button">Leave room ↗</button></div>
      <section class="mission-brief panel" aria-labelledby="briefTitle">
        <div id="briefLabel" class="eyebrow">YOUR MISSION</div>
        <h2 id="briefTitle">Protect Earth together. Compete with words.</h2>
        <p id="briefIntro"></p>
        <ol id="briefSteps" class="mission-steps"></ol>
        <p id="briefWin" class="mission-win"></p>
        <p id="briefLoss" class="mission-loss"></p>
      </section>
      <div class="lobby-grid">
        <div class="panel crew-panel">
          <div class="room-banner"><div><span class="label">ROOM CODE</span><strong id="lobbyCode"></strong></div><div><button id="copyCode" class="button small secondary">Copy code</button><button id="copyLink" class="text-button">Copy invite link ↗</button></div></div>
          <div class="panel-title"><h2>The crew</h2><span id="playerCount" class="badge"></span></div>
          <div id="roster"></div>
          <div id="spectatorList" class="muted"></div>
          <section id="shipPicker" class="ship-picker hidden" aria-labelledby="shipPickerTitle" aria-describedby="shipHelp">
            <div class="ship-heading"><h3 id="shipPickerTitle">Choose your ship</h3><span id="selectedShipName" class="mint" aria-live="polite">Dart</span></div>
            <div id="shipChoices" class="ship-choices" role="group" aria-label="Spaceship designs"></div>
            <p id="shipHelp" class="ship-help">All ships fly and collect alike. Your <span id="pilotMarker" aria-hidden="true">◉</span> marker shows your pilot or team color. Choose before readying up.</p>
          </section>
          <div id="teamActions" class="team-actions hidden"><span>YOUR TEAM</span><button id="team0" class="button small secondary">Aurora</button><button id="team1" class="button small secondary">Nebula</button></div>
          <div class="lobby-bottom"><button id="readyButton" class="button primary">Ready up ✓</button><button id="claimButton" class="button primary hidden">Claim a pilot seat</button><button id="startButton" class="button secondary hidden">Launch round →</button></div>
          <p id="lobbyHint" class="muted"></p>
        </div>
        <div class="lobby-side">
          <div class="panel settings-panel"><div class="panel-title"><h2>Round settings</h2><span id="hostBadge" class="badge">HOST CONTROLS</span></div>
            <label for="modeSelect">GAME MODE</label><select id="modeSelect"><option value="ffa">Free-for-all</option><option value="teams">Two teams</option></select>
            <label for="durationSelect">ROUND LENGTH</label><select id="durationSelect"><option value="3">3 minutes · quick orbit</option><option value="5" selected>5 minutes · classic</option><option value="7">7 minutes · deep space</option></select>
            <label class="toggle-line" for="defenseToggle"><span><strong>Planetary defense</strong><small>Protect Earth together. Words repair it.<br>Zero integrity ends the round for everyone.</small></span><input type="checkbox" id="defenseToggle" checked></label>
            <label class="toggle-line" for="disruptionToggle"><span><strong>Player disruption</strong><small>Rival pulses can reset your ship.<br>Friendly fire is always off.</small></span><input type="checkbox" id="disruptionToggle"></label>
          </div>
          <div class="panel flight-manual"><div class="eyebrow">A 20-SECOND FLIGHT BRIEF</div><ol class="flight-essentials"><li><strong>Fly.</strong> WASD / arrows or the left stick. Aim and pulse with mouse or right stick.</li><li><strong>Collect.</strong> Fly into letters. Pulse crystals and asteroids to release more.</li><li><strong>Arrange.</strong> Drag tiles, or tap two to swap. Select range chooses part of your tray.</li><li><strong>Submit.</strong> Green means valid. Press Enter or Submit to score and repair Earth.</li></ol></div>
        </div>
      </div>
    </section>

    <section id="game" class="view game hidden">
      <div class="game-top"><div><span id="gameMode" class="badge"></span><span id="gameRoom" class="muted"></span></div><div id="clock" class="clock">5:00</div><button class="text-button leave-button">Leave ↗</button></div>
      <div class="mission-ribbon" role="group" aria-label="Your mission">
        <div><strong id="missionGoal">DEFEND EARTH · COLLECT → SPELL → REPAIR</strong><span id="missionReminder">Keep Earth alive until the timer ends.</span></div>
        <div class="mission-actions"><button id="signalButton" class="button small secondary" type="button" aria-haspopup="dialog">Signal</button><button id="telemetryButton" class="button small secondary compact-only" type="button" aria-haspopup="dialog">Details</button><button id="missionButton" class="button small secondary" type="button">Rules</button></div>
      </div>
      <div id="missionStrip" class="mission-strip" aria-label="Live objectives and boost">
        <div id="defenseStatus" class="defense-status hidden" role="group" aria-label="Planetary defense status">
          <div><span>EARTH INTEGRITY</span><strong id="earthHealth">100 / 100</strong></div>
          <meter id="earthMeter" min="0" max="100" low="26" optimum="100" value="100" aria-label="Earth integrity"></meter>
          <div><span>EARTH SHIELD</span><b id="barrierLevel">5.0 / 25</b></div><small id="defenseHint">Watch the pink letters</small><div id="comboProgress" class="combo-progress"><strong id="comboLabel">0 / 5 words</strong><progress id="comboMeter" max="5" value="0" aria-label="Words toward next arcade power-up"></progress></div>
        </div>
        <div id="powerUpCard" class="mission-card power-card hidden" role="group" aria-label="Shared Earth power-up and combo">
          <span class="mission-label">ARCADE POWER-UP</span><strong id="powerUpName">SPELL 5 WORDS</strong>
          <b id="powerUpTimer">8-SECOND BONUS</b><small id="powerUpCombo">YOUR COMBO 0 · 5 TO BONUS</small><small id="powerUpHint">Invalid or reused words reset the combo</small>
        </div>
        <div id="bountyCard" class="mission-card bounty-card"><span class="mission-label">WORD BOUNTY</span><strong id="bountyWord">GET READY</strong><small id="bountyHint">First to spell wins the bonus</small></div>
        <div id="meteorCard" class="mission-card meteor-card"><span id="meteorTitle" class="mission-label">METEOR WATCH</span><strong>MORE LETTERS</strong><small id="meteorHint">Watch for incoming waves</small></div>
        <button id="boostButton" class="boost-button" type="button" aria-label="Boost. Shortcut: Shift."><strong>↗ BOOST</strong><small id="boostLabel">READY · SHIFT</small></button>
      </div>
      <div id="arenaWrap" class="arena-wrap">

        <canvas id="arena" aria-label="Shared space arena. Fly using WASD or arrow keys. Aim all around the ship with the mouse, or hold Q and E to rotate left and right. Collect letters, then drag tiles or tap two to swap. Select a range or use the whole tray. Press Enter to submit or Space to review."></canvas>
        <div id="pilotHud" class="pilot-hud"><div id="scoreboard" class="scoreboard"></div>
        <div id="raceStatus" class="race-status"><span id="raceLabel">YOUR SCORE</span><strong id="raceNumber">0</strong><small id="raceGap">Score the opening word</small></div><div id="wordFeed" class="word-feed" aria-label="Recent words"></div></div>
        <div id="arenaAnnouncement" class="arena-announcement hidden" role="status" aria-live="polite"></div>
        <div id="wordBurst" class="word-burst hidden" role="status" aria-live="polite" aria-atomic="true"><span id="burstTitle"></span><strong id="burstWord"></strong><b id="burstPoints"></b><small id="burstRepair"></small></div>
        <div id="signalFeed" class="signal-feed" role="status" aria-live="polite" aria-atomic="true"></div>
        
        <canvas id="minimap" width="180" height="120" aria-label="Arena minimap"></canvas>
        <div class="arena-caption"><span class="live-dot"></span> SHARED ORBIT <span class="rotation-hint">Q / E · ROTATE 360°</span> <span id="latency"></span></div>
        <div id="phaseOverlay" class="phase-overlay hidden"><span id="overlayLabel"></span><strong id="overlayValue"></strong><p id="overlayHint"></p></div>
        <div id="spectatorBar" class="spectator-bar hidden"><span>WATCHING THIS ROUND</span><select id="followSelect" aria-label="Choose pilot to follow"></select><small>A pilot seat can be claimed in the next lobby.</small></div>
        <div id="leftStick" class="touch-stick left" aria-label="Movement control"><span></span><b>MOVE</b></div>
        <div id="rightStick" class="touch-stick right" aria-label="Aim and pulse control"><span></span><b>360° AIM / PULSE</b></div>
        <div id="connectionOverlay" class="connection-overlay hidden"><strong>Reconnecting to your orbit…</strong><span>Your seat is reserved for up to 30 seconds. The round continues.</span></div>
      </div>
      <section id="trayDock" class="tray-dock collection-board" aria-labelledby="collectionTitle" aria-describedby="trayHint">
      <div id="wordPanel" class="word-panel panel hidden" aria-label="Review collected word">
        <div class="panel-title"><div><div class="eyebrow">MAKE YOUR NEXT MOVE</div><h2>Arrange. Select. Submit.</h2></div><button id="closeWord" class="icon-button" aria-label="Resume flying">×</button></div>
        <p id="wordProtection" class="word-shield-timer"></p>
        <div id="wordLetters" class="word-letters" aria-live="polite"></div>
        <div class="word-tools"><span id="wordScore">3–10 letters</span><button id="backspaceButton" class="text-button">Shorter word</button><button id="clearWord" class="text-button">Use all</button></div>
        <span id="bestWordHint" class="best-word-hint"></span><button id="discardButton" class="text-button" type="button">Choose a letter to discard</button>
        <p id="wordMissionReward" class="word-mission-reward hidden">A valid new word repairs Earth by 2 HP (up to 100) and grows its shield.</p>
        <button id="submitButton" class="button primary">Submit word <kbd>Enter</kbd></button>
        <p id="wordError" class="error" role="alert"></p>
        <small>Drag tiles or tap two to swap. Select range → tap its start and end. Use all submits the whole tray. Unused tiles stay. Shorter word arranges and selects the longest available word.</small>
      </div>
        <div class="tray-header"><div><h2 id="collectionTitle">LETTER COLLECTION</h2><span id="trayCount" class="badge">0 / 10</span></div><div class="collection-protection"><span id="stability" class="stability"></span><span id="shieldStatus" class="muted"></span></div></div>
        <div class="collection-readout">
          <div class="collection-word-line"><span id="collectionLabel" class="collection-caption">YOUR COLLECTED WORD</span><strong id="collectionWord" class="is-empty">Fly into letters to begin</strong><span id="collectionRemainder" class="collection-remainder hidden"></span></div>
          <span id="collectionStatus" class="collection-status">Collect 3 more letters</span>
        </div>
        <div class="tray-arrange-tools"><button id="swapButton" class="text-button" type="button" aria-pressed="true">Swap tiles</button><button id="rangeButton" class="text-button" type="button" aria-pressed="false">Select range</button><button id="shuffleButton" class="text-button" type="button">Shuffle · R</button><button id="smartDiscardButton" class="text-button" type="button">Smart discard</button></div>
        <div class="tray-main"><div id="tray" class="tray" role="group" aria-label="Ten rearrangeable letter slots"></div><div class="tray-actions"><button id="buildButton" class="button primary" type="button">Submit word</button><button id="reviewButton" class="text-button" type="button">Review / shorter word</button><button id="discardLastButton" class="text-button" type="button">Discard last</button></div></div>
        <div class="tray-footer"><span id="trayHint">Drag tiles to arrange. On phones, tap two tiles to swap.</span><span id="lastWord"></span></div>
        <p id="trayError" class="error" role="alert"></p><p id="stuckNudge" class="stuck-nudge" role="status"></p><div id="guidedTip" class="guided-tip hidden"><span id="guidedTipText"></span><button id="dismissTip" class="text-button" type="button" aria-label="Dismiss first-round tips">Got it ×</button></div>
        <p id="collectionAnnouncement" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></p>
      </section>

    </section>

    <section id="results" class="view results hidden">
      <div id="resultsOutcome" class="eyebrow">ORBIT COMPLETE</div><h1 id="winnerTitle">A stellar round.</h1><p id="winnerSubtitle" class="muted"></p>
      <div class="panel results-panel"><div class="panel-title"><h2>Final standings</h2><span id="resultsMode" class="badge"></span></div><div id="resultsTable"></div></div>
      <div class="panel result-words"><div class="panel-title"><h2>Your word constellation</h2><span id="resultWordCount" class="badge"></span></div><div id="resultWords"></div></div>
      <div class="result-actions"><button id="rematchButton" class="button primary">Back to lobby ↗</button><span id="rematchHint" class="muted"></span><button class="text-button leave-button">Leave room</button></div>
    </section>
  </main>
  <div id="toast" class="toast hidden" role="status" aria-live="polite"></div>
  <dialog id="telemetryDialog" class="telemetry-dialog" aria-labelledby="telemetryTitle">
    <button id="closeTelemetry" class="icon-button close-dialog" type="button" aria-label="Close round details">×</button>
    <h2 id="telemetryTitle">Round details</h2><p class="dialog-live-note">The round keeps moving. Close to resume flying.</p>
    <div id="telemetryObjectives" class="telemetry-objectives"></div>
    <h3>Live standings</h3><div id="telemetryScores"></div>
    <div id="telemetryPreferences" class="telemetry-preferences" aria-label="Sound and motion preferences"></div>
    <button id="resumeTelemetry" class="button primary" type="button">Resume flying</button>
  </dialog>
  <dialog id="signalDialog" class="signal-dialog" aria-labelledby="signalTitle" aria-describedby="signalScope">
    <button id="closeSignal" class="icon-button close-dialog" type="button" aria-label="Close signals">×</button>
    <h2 id="signalTitle">Quick signals</h2><p id="signalScope"></p>
    <div id="letterSignalControls"><label for="signalLetter">Which letter do you need?</label><div class="signal-letter-row"><select id="signalLetter" aria-label="Requested letter"></select><button id="sendLetterSignal" class="button primary" type="button">Request letter</button></div></div>
    <button id="sendDefendSignal" class="button secondary" type="button">Defend Earth!</button>
    <p id="signalCooldown" role="status"></p><p class="dialog-live-note">The round keeps moving. Signals last 6 seconds and recharge in 5 seconds. Letter requests mark your current position.</p>
  </dialog>
  <dialog id="practiceDialog" class="practice-dialog" aria-labelledby="practiceTitle" aria-describedby="practiceHint">
    <button id="practiceClose" class="icon-button close-dialog" type="button" aria-label="Close practice">×</button>
    <div class="eyebrow">SOLO PRACTICE · NO LIVE SCORE</div><h2 id="practiceTitle">Your first flight: spell CAT.</h2>
    <div class="practice-instructions" role="status" aria-live="polite" aria-atomic="true"><strong id="practiceStep"></strong><p id="practiceHint"></p></div>
    <p class="practice-controls">WASD / arrows to fly · mouse to aim and hold to pulse. On touchscreens: left stick moves, right stick aims and pulses.</p>
    <div class="practice-stage"><canvas id="practiceCanvas" width="720" height="320" tabindex="0" aria-label="Safe practice arena. Pulse the C crystal, then follow the letter targets."></canvas>
      <div id="practiceMove" class="touch-stick left practice-stick" aria-label="Practice movement"><span></span><b>MOVE</b></div>
      <div id="practiceAim" class="touch-stick right practice-stick" aria-label="Practice aim and pulse"><span></span><b>AIM / PULSE</b></div>
    </div>
    <div id="practiceTray" class="practice-tray" role="status" aria-live="polite"></div>
    <div class="practice-actions"><button id="practiceDiscard" class="button secondary" type="button">Discard last</button><button id="practiceSubmit" class="button primary" type="button">Submit CAT</button></div>
    <p id="practiceResult" class="practice-result" role="status"></p>
    <div class="practice-exit"><button id="practiceSkip" class="text-button" type="button">Skip practice</button><button id="practiceContinue" class="button primary hidden" type="button">Join the game →</button></div>
  </dialog>
  <dialog id="helpDialog"><button id="closeHelp" class="icon-button close-dialog" aria-label="Close help">×</button><div class="eyebrow">FLIGHT MANUAL</div><section class="mission-brief mission-help" aria-labelledby="helpMissionTitle">
        <div id="helpMissionLabel" class="eyebrow">YOUR MISSION</div>
        <h2 id="helpMissionTitle">Protect Earth together. Compete with words.</h2>
        <p id="helpMissionIntro"></p>
        <ol id="helpMissionSteps" class="mission-steps"></ol>
        <p id="helpMissionWin" class="mission-win"></p>
        <p id="helpMissionLoss" class="mission-loss"></p>
      </section>
    <div class="help-note"><strong>Quick signals & compact screens</strong><p>Tap Signal to ask teammates for a letter or call for Earth defense. Team signals are visible only to your team. In free-for-all, Defend Earth is shared with all pilots; letter requests are disabled. Gold squares on the minimap mark the signal location. Signals expire after 6 seconds and have a 5-second cooldown. They do not transfer letters.</p><p>On compact screens, tap Details for bounties, meteor timers, power-ups, standings, sound and motion preferences. Earth health, boost, your score and the collection board stay on the main screen. Opening Details or Signals stops your controls, but the live round continues and your ship remains vulnerable.</p><p>Scoring a word sends decorative letter energy toward Earth. Your score banner reports the actual HP repaired and shield growth after their caps. Reduced motion replaces the flight with a stationary shield highlight.</p></div>
    <div class="help-note"><strong>New pilot? Start with one word.</strong><p>First flight on the home screen teaches pulsing, physical pickups, correcting CX to C, and spelling CAT. You can skip it. During a match, optional guided tips explain collection, rearranging and submission. Suggested words and cyan NEXT markers help you find a letter; you can always spell your own word. PULSE markers identify unopened crystals; COLLECT markers identify released letters. Guidance never changes collision pickups.</p><p>The collection board explains when pickup is blocked by a full tray, review, temporary protection or another pilot’s brief priority. Tap × or press Esc to leave review; the world keeps moving while you review.</p></div><ol><li><strong>Open & steer.</strong> Aim light pulses at crystals for one letter, or hit an amber asteroid three times to release four letters (including at least one vowel). Gold dots on the minimap mark asteroids. Touch released letters with your ship, then arrange the tray to spell a word. The pilot landing the final pulse and their teammates get 2-second collection priority. Asteroids gently push ships aside without resetting them; only words earn points.</li><li><strong>Spell & score.</strong> Carry up to 10 letters. Drag tiles on desktop, or tap two tiles to swap on any device. Select range lets you tap a start and end tile; Use all clears the range. The current full tray or selected contiguous range is the submitted word. Unused tiles stay. Green Valid shows the word's points; invalid submissions are disabled. Review shows the highest-scoring Best word. Shorter word arranges and selects the longest unused valid word from your tiles. Every word must have 3–10 letters and scores once per pilot per match. Discard any tile with its ×, or select it and press Backspace/Delete. With no tile selected, Backspace discards the last tile. Long-press reveals × on touchscreens. Discard last and Choose a letter to discard remain available. Discards share a one-second cooldown. Shuffle / R is free with a three-second cooldown.</li><li><strong>Find your moment.</strong> Word review stops your ship and gives up to 8 seconds of protection. Submitting, canceling, or timing out ends it; the cooldown is 15 seconds. You cannot collect or pulse while protected.</li><li><strong>Outspell your crew.</strong> Highest score when the clock ends wins, provided Earth survives when Planetary defense is enabled. A word scores once per player per match. Teams add their players' points. Ties share the win.</li></ol>
    <div class="help-note"><strong>Planetary defense · survive together, compete in words</strong><p>Earth sits at the center of the shared arena. Follow the cyan arrow or minimap ring to find it. Pink incoming letters approach in waves from 12 seconds into the round, then every 8 seconds. Fly into them to collect, then arrange their tiles, or hit them with one pulse to halt their descent and turn them into regular letters. Pulse-stopped letters use the usual 2-second pickup priority.</p><p>Each incoming letter touching the shield is removed and costs Earth 5 HP unless Violet Guard is active. Every valid word repairs 2 HP (maximum 100) and adds half its letter count to shield thickness (maximum 25). Thickness grows the visible shield; ordinary breaches still cost 5 HP. Ordinary crystal, asteroid and dropped letters stay harmless and keep their existing behavior. Ships and pulses can pass over Earth.</p><p>If Earth reaches zero, the round ends for everyone with no winner; earned scores remain visible. Keep it alive until the timer ends to decide the winner by word score. Host can turn Planetary defense off in the lobby for the original timed rules.</p></div>
    <div class="help-note"><strong>Arcade power-ups · spell five valid words in a row</strong><p>In Planetary defense, every fifth consecutive valid word activates a random power-up for 8 seconds. Teammates share a combo; free-for-all pilots build their own. An invalid or already-used word resets that combo. Review, discarding and ship resets do not break it. Power-ups benefit the shared Earth for everyone, including opposing teams. A new milestone replaces the current effect and starts a fresh 8 seconds.</p><p><strong>Violet Guard:</strong> Earth’s shield glows violet. Incoming letters touching it disappear without damaging Earth. This protects Earth, not individual ships.</p><p><strong>EMP Blast:</strong> all incoming letters stop and become safe pickups, including new waves arriving during the 8 seconds. They keep their positions and are immediately available to everyone. No points are awarded.</p><p><strong>Slow Motion:</strong> incoming letters move at 40% of normal speed. Ships, pulses, crystals, asteroids and the match clock keep their normal speed. The original letter speed returns when the effect ends.</p><p>The visible progress meter shows words toward the next power-up. The arcade panel shows your active effect and countdown. Defense-off rounds keep classic scoring without Earth power-ups. Reduced motion stops the moving grid and particles.</p></div>
    <div class="help-note"><strong>Letter assistance & asteroid rewards</strong><p><span class="legend-letter useful">A</span> Bright double outline: adds a new available word or matches your next suggestion. <span class="legend-letter neutral">B</span> Single outline: neutral. <span class="legend-letter dim">Z</span> Dim dashed outline: no immediate valid word with the current letters. Extra tiles never invalidate words you can select from a subset. A small dotted ring marks the gentle magnet: within 72px, the nearest useful released letter drifts toward an eligible ship at 42px/second. Incoming threats retain their normal paths.</p><p>Letters use weighted tile frequencies with a 35–40% vowel target across crystals and released letters. Nearby supply favors vowels below two tray vowels and consonants above four. Only distant unopened crystals may be adjusted to restore the field balance; your collected letters never change.</p><p>When stuck, Smart discard suggests the tile that preserves the most words, then makes the best room for a recovery vowel. Removing a tile cannot create an anagram by itself. After 20 seconds without a pickup or valid submission, a recovery vowel is offered, at most once per 45 seconds. If your tray is full it waits until you discard or submit; no collected tile is silently deleted. Review, resets and disconnection defer automatic delivery.</p><p>Asteroid labels reveal their reward: mostly letters; sometimes an extra vowel, a ★ double-score tile, or a word-shield recharge. A used ★ doubles the word's normal score once; multiple stars do not stack. The +20 bounty remains +20. Stars left outside the submitted range stay in your tray. Shield recharge makes your personal word shield ready, or banks one recharge if it is already active. Rock hits and letter pickup priority are unchanged.</p></div>
    <div class="help-note"><strong>Boost, meteor showers & word bounties</strong><p>Press Shift or tap BOOST for a short dash in your movement direction; when stationary, it follows your ship’s heading. Boost recharges in 6 seconds and gives no protection. It is unavailable during word review, resets or spawn protection.</p><p>Starting 30 seconds into the round, a 14-second meteor shower arrives every minute. Four faster cyan-marked rocks take 4 hits and release 6 letters. Unopened meteors leave at the end of the shower; released letters stay for their normal lifetime.</p><p>Starting 15 seconds into the round, a word bounty appears every 45 seconds. The first pilot to submit that exact word within its 30-second window earns the normal score plus 20 points. Only one pilot can claim each bounty, including in teams. Your once-per-match word rule still applies. Watch the strip above the arena for timers.</p></div><div class="help-note"><strong>Disruption, when enabled</strong><p>Three rival pulse contacts reset your ship for 3 seconds and drop up to 3 letters. Points stay. Dropped letters are immediately shared. Your ship returns with brief protection. Friendly fire is off.</p></div>
    <p><strong>Your ship:</strong> Choose one of eight designs in the lobby, then ready up. Designs are cosmetic: speed, stability and letter collection reach are equal. The ring around each ship shows its pilot color in free-for-all or its team color in team mode. Your choice carries through reconnects and rematches.</p>
    <p><strong>Controls:</strong> WASD/arrows to move. Hold Q to rotate counterclockwise or E to rotate clockwise through a full 360°. Move the mouse around your ship to aim freely; hold the left mouse button to pulse. On phones, the left stick moves and the right stick rotates/aims in any direction and pulses. Movement and aiming are independent. Shift or the BOOST button activates a dash. Enter submits the full tray or selected range; R shuffles; Backspace/Delete discards the selected or last tile; Space opens shielded review; Escape resumes flying. Drag tiles or tap two to swap. Use Select range for endpoints.</p>
    <p class="muted">The game uses a bundled English dictionary with an offensive-word filter. Proper names and abbreviations are not intended; dictionary coverage may be imperfect. New players arriving mid-round watch until the next lobby.</p>
    <p class="muted">Score = letter values + 2 × (word length − 3)². <a href="/credits.html">Dictionary & software credits ↗</a></p>
  </dialog>
</body>
</html>
GLYPHSTORM_C2CC24BC9001B11B

# FILE: public/match-feedback.js
cat > 'public/match-feedback.js' <<'GLYPHSTORM_E77393EB99E3E58B'
import { TEAMS } from './rules.js';

export function raceStatus(state,me) {
  const pilots=state.players.filter(p=>p.role==='player'||p.role==='retired');
  const teams=state.settings.mode==='teams',player=pilots.find(p=>p.id===me);
  const entries=teams?[0,1].map(team=>({id:String(team),name:TEAMS[team],score:pilots.filter(p=>p.team===team).reduce((n,p)=>n+p.score,0)}))
    :pilots.map(p=>({id:p.id,name:p.name,score:p.score}));
  entries.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const best=entries[0]?.score||0,leaders=best>0?entries.filter(e=>e.score===best):[];
  const own=player?.role==='player'?entries.find(e=>e.id===(teams?String(player.team):player.id)):null;
  const leading=own&&leaders.some(e=>e.id===own.id);
  let message;
  if(!own)message=best===0?'Who will score first?':leaders.length>1?'Tied for the lead':entries[0].name+' leads';
  else if(!best)message='Score the opening word';
  else if(leading&&leaders.length>1)message='Shared lead · break the tie';
  else if(leading)message='Leading by '+(best-(entries.find(e=>e.id!==own.id)?.score||0))+' points';
  else message=(best-own.score+1)+' points to take the lead';
  return {score:own?.score??best,label:own?(teams?'YOUR TEAM':'YOUR SCORE'):'LEADING SCORE',message,
    leading:Boolean(leading),leaders,leaderKey:leaders.map(e=>e.id).sort().join(','),ownId:own?.id||null};
}

// Presentation only: actual scores and winners always come from the server.
export class MatchFeedback {
  constructor(){this.matchId=null;this.lastEvent=0;this.words=new Set();this.leaderKey=null;this.clockKey=null;}
  reset(state,me,restore=false){
    this.matchId=state.matchId;this.lastEvent=restore?Math.max(0,...state.events.map(e=>e.seq)):0;
    this.words=new Set(restore?(state.self?.history||[]).map(e=>e.word):[]);
    this.leaderKey=restore?raceStatus(state,me).leaderKey:null;this.clockKey=null;
  }
  word(entry){
    if(!entry?.word||this.words.has(entry.word))return null;
    this.words.add(entry.word);
    return {word:entry.word,points:entry.points,bonus:entry.bonus||0,defenseReward:entry.defenseReward||null,title:entry.bonus?'BOUNTY CAPTURED':entry.word.length>=8?'COSMIC WORD':entry.word.length>=6?'STELLAR WORD':entry.points>=25?'BRILLIANT WORD':'WORD SCORED'};
  }
  update(state,me){
    if(this.matchId!==state.matchId)this.reset(state,me);
    const events=[],words=[];
    for(const event of state.events){
      if(event.seq<=this.lastEvent)continue;this.lastEvent=event.seq;
      if(!Number.isFinite(event.at)||state.now-event.at>1800)continue;
      events.push(event);
      if(state.phase==='playing'&&event.type==='word'&&event.playerId===me){const word=this.word(event);if(word)words.push(word);}
    }
    const race=raceStatus(state,me);
    let announcement=null;
    if(state.phase==='playing'&&this.leaderKey!==null&&race.leaderKey&&race.leaderKey!==this.leaderKey){
      announcement=race.leaders.length>1?'NECK AND NECK · TIED LEAD':
        race.leaders[0].id===race.ownId?(state.settings.mode==='teams'?'YOUR TEAM TAKES THE LEAD':'YOU TAKE THE LEAD'):race.leaders[0].name+' TAKES THE LEAD';
    }
    this.leaderKey=race.leaderKey;
    return {events,words,race,announcement};
  }
  clock(phase,seconds){
    const key=phase+':'+seconds,previous=this.clockKey;this.clockKey=key;
    if(key===previous||seconds<=0||!['playing','countdown'].includes(phase))return {tick:false,notice:null};
    const prior=previous?.startsWith(phase+':')?Number(previous.split(':')[1]):null;
    const tick=phase==='countdown'||(seconds<=10&&prior!==null);
    const crossed=prior!==null&&((prior>10&&seconds<=10)||(prior>30&&seconds<=30));
    return {tick,notice:phase==='playing'&&crossed?seconds+' SECONDS · EVERY WORD COUNTS':null};
  }
}
GLYPHSTORM_E77393EB99E3E58B

# FILE: public/neon.js
cat > 'public/neon.js' <<'GLYPHSTORM_7AE7129CD4ACB767'
export const NEON=Object.freeze({space:'#0a0813',pink:'#ff2bd6',lime:'#b6ff00',cyan:'#00f3ff',violet:'#bd00ff'});
export const BURST_COLORS=Object.freeze([NEON.pink,NEON.lime,NEON.cyan]);

// Decorative screen-space grid; never used for aiming or collision geometry.
export function drawNeonGrid(ctx,w,h,time,reduced=false){
  ctx.save();ctx.lineWidth=.75;ctx.shadowBlur=reduced?0:5;ctx.shadowColor=NEON.pink;
  const horizon=h*.33,depth=h-horizon,phase=reduced?0:(time*.00012)%1;
  ctx.strokeStyle='#ff2bd633';ctx.beginPath();ctx.moveTo(0,horizon);ctx.lineTo(w,horizon);ctx.stroke();
  for(let i=0;i<15;i++){
    const t=(i+phase)/15,y=horizon+t*t*depth;
    ctx.globalAlpha=.2+t*.55;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
  }
  ctx.globalAlpha=.28;ctx.strokeStyle=NEON.cyan;ctx.shadowColor=NEON.cyan;
  for(let i=-7;i<=7;i++){
    ctx.beginPath();ctx.moveTo(w/2+i*w*.025,horizon);ctx.lineTo(w/2+i*w*.18,h);ctx.stroke();
  }
  ctx.restore();
}
export function letterGlow(ctx,letter,reduced=false){
  ctx.shadowBlur=reduced?0:10;
  ctx.shadowColor=letter.color;
}
GLYPHSTORM_7AE7129CD4ACB767

# FILE: public/objectives.js
cat > 'public/objectives.js' <<'GLYPHSTORM_9071D709525FAAF4'
import { RULES } from './rules.js';

// One description powers the lobby, launch countdown, HUD and help dialog.
export function missionBriefing(state){
  const defense=state?.defense?.enabled??state?.settings?.defense??true;
  const teams=state?.settings?.mode==='teams',minutes=state?.settings?.minutes??5;
  const winner=teams?'The team with the highest combined word score wins.':'The pilot with the highest word score wins.';
  const powerNote=' Every 5 valid words in a row earns an 8-second Earth power-up. '+(teams?'Teammates share a combo.':'Each pilot builds a separate combo.')+' An invalid or reused word resets that combo. New milestones replace the active effect; Earth’s power-ups benefit everyone.';
  const collect={title:'Collect and arrange letters',text:'Open a crystal with 1 pulse for 1 letter, or an amber asteroid with 3 pulses for 4 letters. Fly into letters, then drag tiles or tap two to swap. Select range chooses its start and end. Discard mistakes. Carry up to 10 letters. Follow the suggested word and cyan NEXT markers, or spell your own word.'};
  return defense?{
    label:'PLANETARY DEFENSE · EVERYONE SHARES ONE EARTH',
    title:'Protect Earth together. Compete with words.',
    intro:'Earth starts with 100 health points (HP). Keep it alive for the full '+minutes+'-minute round. Every pilot protects the same planet, even when playing on opposing teams. Follow the cyan arrow or minimap ring to find Earth.'+powerNote,
    steps:[
      {title:'Stop the pink incoming letters',text:'Collect a pink letter or hit it with 1 pulse before it reaches Earth’s blue shield. A pulse stops its descent so you can collect it later. Every breach costs Earth 5 HP unless Violet Guard is active. Ordinary released letters are harmless to Earth.'},
      collect,
      {title:'Submit words to repair Earth',text:'Submit uses the full tray or your selected contiguous range, in the current arranged order. Press Enter or tap it to score. Each valid new word earns points, repairs 2 HP (up to 100), and grows Earth’s shield by half the word length (up to 25). Use 3–10 letters; each word scores once per pilot.'}
    ],
    win:'SURVIVE: keep Earth above 0 HP until the timer ends. '+winner+' Tied scores share the win.',
    loss:'FAIL: Earth reaches 0 HP → the round ends for everyone with no winner. Only words earn points. Your personal word-review shield does not protect Earth.',
    ribbon:'DEFEND EARTH · COLLECT → SPELL → REPAIR',
    reminder:'Earth at 0 HP = everyone loses. Survive the timer; '+(teams?'highest team word score wins.':'highest word score wins.'),
    launch:'DEFEND EARTH',
    launchHint:'Collect or pulse pink letters. Spell valid words to repair Earth. Zero Earth HP ends the round for everyone.'
  }:{
    label:'CLASSIC WORD ARENA · PLANETARY DEFENSE OFF',
    title:teams?'Outspell the other team.':'Outspell the other pilots.',
    intro:'You have '+minutes+' minutes to earn the highest word score. '+winner+' Tied scores share the win.',
    steps:[collect,
      {title:'Submit your collected word',text:'Submit scores the whole tray or a selected contiguous range; unused tiles stay. Arrange 3–10 letters. Review → Shorter word finds and arranges your longest valid word; Discard last corrects your latest pickup. Each word scores once per pilot.'},
      {title:'Build the highest word score',text:'Rare letters and longer words earn more. Chase the word bounty for bonus points, use Boost to reach letters, and open cyan meteor rocks for 6 letters. Only words earn points.'}
    ],
    win:'WIN: '+winner+' The timer ends this '+minutes+'-minute round.',
    loss:'Planetary defense is off: no Earth damage, incoming-letter waves or repair objective. Watch the score and collect letters for your next word.',
    ribbon:'COLLECT → ARRANGE → SUBMIT → SCORE',
    reminder:(teams?'Highest combined team score':'Highest word score')+' when the timer ends wins. Planetary defense is off.',
    launch:teams?'OUTSPELL THE OTHER TEAM':'OUTSPELL YOUR CREW',
    launchHint:'Pulse rocks for letters. Arrange your collected tiles. Enter or Submit word to score. Highest score wins.'
  };
}

export function missionStatus(state,now){
  const bounty=state.bounty,first=state.startAt+RULES.bountyFirstMs;
  const nextBounty=now<first?first:first+(Math.floor((now-first)/RULES.bountyCycleMs)+1)*RULES.bountyCycleMs;
  const active=bounty&&now>=bounty.startsAt&&now<bounty.expiresAt;
  const used=state.self?.history?.some(entry=>entry.word===bounty?.word);
  const bountyWord=active?bounty.word:'GET READY';
  const bountyHint=active?(bounty.claimedBy?bounty.claimedName+' claimed +'+bounty.bonus:
    used?'Already in your word history':'First to spell: +'+bounty.bonus+' · '+Math.ceil((bounty.expiresAt-now)/1000)+'s'):
    'Next bounty in '+Math.max(0,Math.ceil((nextBounty-now)/1000))+'s';
  const shower=state.shower,meteorActive=shower&&now>=shower.startsAt&&now<shower.endsAt;
  const nextShower=shower?.nextAt??state.startAt+RULES.showerFirstMs;
  const meteorHint=meteorActive?'4 hits → 6 letters · '+Math.max(0,Math.ceil((shower.endsAt-now)/1000))+'s':
    'Next wave in '+Math.max(0,Math.ceil((nextShower-now)/1000))+'s';
  return {bountyWord,bountyHint,bountyActive:Boolean(active&&!bounty.claimedBy),
    meteorActive:Boolean(meteorActive),meteorTitle:meteorActive?'METEOR SHOWER':'METEOR WATCH',meteorHint};
}
GLYPHSTORM_9071D709525FAAF4

# FILE: public/planet.js
cat > 'public/planet.js' <<'GLYPHSTORM_0D389BDADB2E2334'
import { POWER_UPS, activePowerUp } from './power-ups.js';
const TAU=Math.PI*2;

export function createEarthTexture(){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d'),r=240;
  ctx.translate(256,256);ctx.save();ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.clip();
  const ocean=ctx.createRadialGradient(-90,-100,8,0,0,260);
  ocean.addColorStop(0,'#2b95ca');ocean.addColorStop(.55,'#125b93');ocean.addColorStop(1,'#041a32');
  ctx.fillStyle=ocean;ctx.fillRect(-256,-256,512,512);
  // Hand-drawn stylized land masses; no network artwork dependency.
  const land=[
    [[-210,-130],[-160,-170],[-100,-155],[-85,-125],[-30,-110],[-60,-65],[-95,-62],[-115,-15],[-150,-40],[-170,-95]],
    [[-95,-15],[-50,0],[-25,55],[-45,95],[-60,160],[-95,197],[-110,130],[-100,85],[-130,40]],
    [[25,-170],[75,-190],[120,-158],[205,-160],[238,-105],[170,-75],[130,-40],[105,-75],[68,-54],[30,-95]],
    [[25,-65],[80,-50],[115,0],[88,50],[64,107],[30,65],[15,18],[-8,-15]],
    [[160,88],[205,76],[236,109],[210,145],[158,140],[140,117]]
  ];
  ctx.fillStyle='#5bb9a2';ctx.strokeStyle='#90d7b5';ctx.lineWidth=2;
  for(const points of land){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.strokeStyle='#e7ffff7a';ctx.lineCap='round';ctx.lineWidth=9;
  for(const [x,y,rx,ry,rotation] of [[-100,-130,90,20,-.3],[80,40,115,20,.3],[-130,95,70,16,.1],[150,-90,90,20,-.4]]){
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*1.4);ctx.stroke();
  }
  ctx.fillStyle='#e3f5ffbb';ctx.beginPath();ctx.ellipse(0,-235,100,25,0,0,TAU);ctx.fill();
  const shade=ctx.createLinearGradient(-160,-140,220,160);
  shade.addColorStop(0,'#000b1900');shade.addColorStop(.5,'#000b1900');shade.addColorStop(1,'#000917e8');
  ctx.fillStyle=shade;ctx.fillRect(-256,-256,512,512);ctx.restore();
  ctx.strokeStyle='#8cddff99';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();
  return canvas;
}

export function drawEarth(ctx,x,y,scale,defense,texture,powerUps=null,now=0,reduced=false){
  const {earthRadius,barrierRadius,earthHealth,barrierThickness}=defense;
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  const aura=ctx.createRadialGradient(0,0,earthRadius*.9,0,0,barrierRadius+30);
  aura.addColorStop(0,'#00baff1a');aura.addColorStop(1,'#00baff00');
  ctx.fillStyle=aura;ctx.beginPath();ctx.arc(0,0,barrierRadius+30,0,TAU);ctx.fill();
  if(texture)ctx.drawImage(texture,-earthRadius*256/240,-earthRadius*256/240,earthRadius*512/240,earthRadius*512/240);
  else {ctx.fillStyle='#125b93';ctx.beginPath();ctx.arc(0,0,earthRadius,0,TAU);ctx.fill();}
  // Match the server's shield circle exactly; only the camera scales it.
  const invulnerable=activePowerUp(powerUps,now)===POWER_UPS.INVULNERABILITY;
  ctx.lineWidth=invulnerable?Math.max(12,barrierThickness+6):barrierThickness;
  ctx.shadowBlur=invulnerable?28:15;ctx.shadowColor=invulnerable?'#bd00ff':'#00f3ff';
  ctx.strokeStyle=earthHealth>0?(invulnerable?'#bd00ff':'#00f3ff99'):'#ff677077';
  ctx.beginPath();ctx.arc(0,0,barrierRadius,0,TAU);ctx.stroke();ctx.shadowBlur=0;
  const hitAge=now-(defense.lastImpactAt||-Infinity);
  if(hitAge>=0&&hitAge<450){
    ctx.save();ctx.globalAlpha=reduced?.7:1-hitAge/450;ctx.strokeStyle='#ff5269';ctx.lineWidth=barrierThickness+5;
    ctx.beginPath();ctx.arc(0,0,barrierRadius,0,TAU);ctx.stroke();ctx.restore();
  }
  ctx.fillStyle='#d0f9ff';ctx.textAlign='center';ctx.font='700 12px system-ui';
  ctx.fillText('EARTH · '+earthHealth+'%',0,earthRadius+26);
  ctx.font='700 11px system-ui';ctx.fillStyle='#ffcf92';
  ctx.fillText('INCOMING WAVE · '+Math.max(0,Math.ceil((defense.nextWaveAt-now)/1000))+'s',0,earthRadius+43);ctx.restore();
}
GLYPHSTORM_0D389BDADB2E2334

# FILE: public/power-ups.js
cat > 'public/power-ups.js' <<'GLYPHSTORM_7B01185F4008C9AA'
import { TEAMS } from './rules.js';

export const POWER_UPS=Object.freeze({
  INVULNERABILITY:'INVULNERABILITY',EMP_BLAST:'EMP_BLAST',SLOW_MOTION:'SLOW_MOTION'
});
export const POWER_RULES=Object.freeze({milestone:5,durationMs:8000,frames:480,slowFactor:.4});
export const POWER_INFO=Object.freeze({
  INVULNERABILITY:{name:'VIOLET GUARD',color:'#bd00ff',hint:'Earth takes no breach damage'},
  EMP_BLAST:{name:'EMP BLAST',color:'#b6ff00',hint:'Incoming letters become safe pickups'},
  SLOW_MOTION:{name:'SLOW MOTION',color:'#00f3ff',hint:'Incoming letters move at 40% speed'}
});

// Presentation mirrors. Server-owned room state determines effects and expiry.
export let currentPowerUp = null;
export let powerUpTimer = 0;
export function createPowerUpState(){
  return {currentPowerUp:null,powerUpTimer:0,startedAt:0,endsAt:0,activatedBy:null,
    activatedName:null,comboKey:null,comboWords:{}};
}
export const comboKey=(player,mode)=>mode==='teams'?'team-'+player.team:player.id;
export function activePowerUp(powerUps,now){
  return powerUps&&POWER_INFO[powerUps.currentPowerUp]&&now>=powerUps.startedAt&&now<powerUps.endsAt
    ?powerUps.currentPowerUp:null;
}
export function remainingPowerFrames(powerUps,now){
  return activePowerUp(powerUps,now)?Math.min(POWER_RULES.frames,Math.max(0,Math.ceil((powerUps.endsAt-now)*60/1000))):0;
}
export function syncPowerUpState(powerUps,now){
  currentPowerUp=activePowerUp(powerUps,now);powerUpTimer=remainingPowerFrames(powerUps,now);
}
export const incomingSpeedFactor=(powerUps,now)=>activePowerUp(powerUps,now)===POWER_UPS.SLOW_MOTION?POWER_RULES.slowFactor:1;
export function powerUpStatus(state,me,now){
  const enabled=Boolean(state.defense?.enabled),pilot=state.players.find(p=>p.id===me&&p.role==='player');
  const power=state.powerUps,kind=enabled&&state.phase==='playing'?activePowerUp(power,now):null;
  const words=pilot?(power?.comboWords?.[comboKey(pilot,state.settings.mode)]||0):0;
  const progress=words%POWER_RULES.milestone,info=kind?POWER_INFO[kind]:null;
  const source=power?.comboKey?.startsWith('team-')?TEAMS[Number(power.comboKey.slice(5))]:power?.activatedName;
  return {kind,progress,words,color:info?.color||'#ff2bd6',title:info?.name||'SPELL 5 WORDS',
    timer:kind?((power.endsAt-now)/1000).toFixed(1)+'s':'8-SECOND BONUS',
    combo:pilot?(state.settings.mode==='teams'?'TEAM':'YOUR')+' COMBO '+words+' · '+(POWER_RULES.milestone-progress)+' TO BONUS':'Every 5 valid words earns a power-up',
    hint:info?info.hint:'Invalid or reused words reset the combo',
    source:kind?'Activated by '+source+' · shared Earth effect':'Power-ups help everyone defend Earth'};
}
GLYPHSTORM_7B01185F4008C9AA

# FILE: public/practice.js
cat > 'public/practice.js' <<'GLYPHSTORM_139408944A76F768'
import { RULES, scoreWord } from './rules.js';

const lessons={
  pulse:['1 / 7 · OPEN','Aim at the C crystal and hold pulse to release its letter.'],
  collectC:['2 / 7 · COLLECT','Fly into C. Your ship collects the letter on contact.'],
  collectX:['3 / 7 · TRY A MISTAKE','Fly into X to learn how to correct an unwanted pickup.'],
  discard:['4 / 7 · CORRECT','You have CX. Tap Discard last to remove X and keep C.'],
  collectA:['5 / 7 · COLLECT MORE','Collect A. In live play you can rearrange every tile.'],
  collectT:['6 / 7 · FINISH THE WORD','Collect T to make CAT. In live play, drag or tap two tiles to swap.'],
  submit:['7 / 7 · SCORE','Tap Submit CAT or press Enter. Live play can submit the whole tray or a selected range.'],
  done:['FIRST WORD COMPLETE','CAT scored! In a live match, words repair Earth. Pulse pink threats to stop them without adding unwanted letters. Keep Earth alive; highest word score wins.']
};

// An isolated lesson: no socket, room, score, inventory or shared-world mutation.
export class PracticeRun{
  constructor(){this.ship={x:90,y:160,angle:0,vx:0,vy:0};this.step='pulse';this.tray=[];this.letters=[];this.crystal={x:280,y:160};this.pulses=[];this.time=0;this.lastShot=-1000;this.points=0;}
  get lesson(){return lessons[this.step];}
  spawn(letter,x,y,step){this.letters=[{letter,x,y}];this.step=step;}
  update(input,dt){
    if(this.step==='done')return;
    dt=Math.max(0,Math.min(dt,.05));this.time+=dt*1000;
    const s=this.ship,n=Math.max(1,Math.hypot(input.x,input.y)),blend=1-Math.exp(-RULES.acceleration*dt);
    s.vx+=(input.x/n*RULES.speed-s.vx)*blend;s.vy+=(input.y/n*RULES.speed-s.vy)*blend;
    s.x=Math.max(18,Math.min(702,s.x+s.vx*dt));s.y=Math.max(18,Math.min(302,s.y+s.vy*dt));
    if(Number.isFinite(input.angle))s.angle=input.angle;
    if(input.pulse&&this.time-this.lastShot>=RULES.pulseInterval){this.lastShot=this.time;this.pulses.push({x:s.x,y:s.y,vx:Math.cos(s.angle)*RULES.pulseSpeed,vy:Math.sin(s.angle)*RULES.pulseSpeed,life:.9});}
    for(const pulse of this.pulses){pulse.x+=pulse.vx*dt;pulse.y+=pulse.vy*dt;pulse.life-=dt;
      if(this.crystal&&Math.hypot(pulse.x-this.crystal.x,pulse.y-this.crystal.y)<29){this.crystal=null;pulse.life=0;this.spawn('C',280,160,'collectC');}}
    this.pulses=this.pulses.filter(p=>p.life>0);
    const tile=this.letters[0];
    if(tile&&Math.hypot(s.x-tile.x,s.y-tile.y)<RULES.shipRadius+RULES.letterRadius){
      this.tray.push(tile.letter);this.letters=[];
      if(this.step==='collectC')this.spawn('X',380,160,'collectX');
      else if(this.step==='collectX')this.step='discard';
      else if(this.step==='collectA')this.spawn('T',560,220,'collectT');
      else if(this.step==='collectT')this.step='submit';
    }
  }
  discardLast(){if(this.step!=='discard')return false;this.tray.pop();this.spawn('A',460,100,'collectA');return true;}
  submit(){if(this.step!=='submit'||this.tray.join('')!=='CAT')return false;this.points=scoreWord('CAT');this.step='done';return true;}
}

export class PracticeLesson{
  constructor(onComplete){
    this.$=id=>document.getElementById(id);this.dialog=this.$('practiceDialog');this.canvas=this.$('practiceCanvas');this.ctx=this.canvas.getContext('2d');this.onComplete=onComplete;
    this.active=false;this.keys=new Set();this.move={x:0,y:0};this.aim=null;this.firing=false;this.stickResetters=[];
    this.$('practiceDiscard').onclick=()=>{this.run.discardLast();this.renderText();this.canvas.focus({preventScroll:true});};
    this.$('practiceSubmit').onclick=()=>{if(this.run.submit()){this.onComplete();this.renderText();}};
    this.$('practiceContinue').onclick=()=>this.finish(true);
    this.$('practiceSkip').onclick=()=>this.finish(true);
    this.$('practiceClose').onclick=()=>this.finish(false);
    this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.finish(false);});
    window.addEventListener('blur',()=>this.clearInput());
    window.addEventListener('keydown',e=>{if(!this.active)return;if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();this.keys.add(e.key.toLowerCase());}if(e.key==='Enter'&&!e.repeat&&e.target.tagName!=='BUTTON'){e.preventDefault();if(this.run.submit()){this.onComplete();this.renderText();}}});
    window.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    const point=e=>{const r=this.canvas.getBoundingClientRect();this.pointer={x:(e.clientX-r.left)*720/r.width,y:(e.clientY-r.top)*320/r.height};};
    this.canvas.addEventListener('pointermove',e=>{if(this.active&&e.pointerType!=='touch')point(e);});
    this.canvas.addEventListener('pointerdown',e=>{if(!this.active||e.button!==0)return;e.preventDefault();point(e);this.firing=true;this.canvas.setPointerCapture(e.pointerId);});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.canvas.addEventListener(name,()=>this.firing=false);
    this.stick('practiceMove',false);this.stick('practiceAim',true);
  }
  clearInput(){this.keys.clear();this.move={x:0,y:0};this.aim=null;this.pointer=null;this.firing=false;for(const reset of this.stickResetters)reset();}
  stick(id,aim){
    const el=this.$(id),knob=el.querySelector('span');let pointer=null;
    this.stickResetters.push(()=>{const old=pointer;pointer=null;knob.style.transform='';if(old!==null&&el.hasPointerCapture(old))el.releasePointerCapture(old);});
    const move=e=>{if(pointer!==e.pointerId)return;e.preventDefault();const r=el.getBoundingClientRect(),limit=r.width*.38;let x=(e.clientX-r.left-r.width/2)/limit,y=(e.clientY-r.top-r.height/2)/limit;const n=Math.max(1,Math.hypot(x,y));x/=n;y/=n;knob.style.transform='translate('+x*limit+'px,'+y*limit+'px)';if(aim){this.aim=Math.hypot(x,y)>.15?Math.atan2(y,x):null;this.firing=this.aim!==null;this.pointer=null;}else this.move={x,y};};
    el.addEventListener('pointerdown',e=>{if(pointer!==null)return;pointer=e.pointerId;el.setPointerCapture(pointer);move(e);});el.addEventListener('pointermove',move);
    for(const name of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(name,e=>{if(pointer!==e.pointerId)return;pointer=null;knob.style.transform='';if(aim){this.aim=null;this.firing=false;}else this.move={x:0,y:0};});
  }
  open(continueAction=null){
    if(this.active)return;this.run=new PracticeRun();this.continueAction=continueAction;this.active=true;this.clearInput();this.signature='';this.last=performance.now();
    this.$('practiceSkip').textContent=continueAction?'Skip practice & join':'Skip practice';
    this.$('practiceContinue').textContent=continueAction?'Join the game →':'Back to flight deck →';
    this.dialog.showModal();this.renderText();this.canvas.focus({preventScroll:true});this.frame(this.last);
  }
  finish(proceed){if(!this.active)return;this.active=false;cancelAnimationFrame(this.raf);this.clearInput();this.dialog.close();const fn=this.continueAction;this.continueAction=null;if(proceed&&fn)fn();}
  renderText(){
    const key=this.run.step+this.run.tray.join('');if(key===this.signature)return;this.signature=key;
    const [title,hint]=this.run.lesson;this.$('practiceStep').textContent=title;this.$('practiceHint').textContent=hint;
    this.$('practiceTray').textContent=this.run.tray.length?this.run.tray.map((l,i)=>String(i+1).padStart(2,'0')+' '+l).join('   →   '):'01 —   →   02 —   →   03 —';
    this.$('practiceDiscard').disabled=this.run.step!=='discard';this.$('practiceSubmit').disabled=this.run.step!=='submit';
    this.$('practiceContinue').classList.toggle('hidden',this.run.step!=='done');
    this.$('practiceSkip').classList.toggle('hidden',this.run.step==='done');
    this.$('practiceResult').textContent=this.run.step==='done'?'+'+this.run.points+' practice points · live scores start at zero':'';
    if(this.run.step==='submit')this.$('practiceSubmit').focus({preventScroll:true});
    if(this.run.step==='discard')this.$('practiceDiscard').focus({preventScroll:true});
    if(this.run.step==='done')this.$('practiceContinue').focus({preventScroll:true});
  }
  frame(now){
    if(!this.active)return;const s=this.run.ship;
    const x=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0)+this.move.x;
    const y=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0)+this.move.y;
    this.run.update({x,y,angle:this.pointer?Math.atan2(this.pointer.y-s.y,this.pointer.x-s.x):this.aim??s.angle,pulse:this.firing},(now-this.last)/1000);this.last=now;this.renderText();this.draw();this.raf=requestAnimationFrame(t=>this.frame(t));
  }
  draw(){
    const c=this.ctx,r=this.run;c.fillStyle='#0a0813';c.fillRect(0,0,720,320);c.strokeStyle='#302044';c.lineWidth=1;
    for(let x=0;x<=720;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,320);c.stroke();}for(let y=0;y<=320;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(720,y);c.stroke();}
    const target=r.crystal||r.letters[0];
    if(target){c.setLineDash([5,7]);c.strokeStyle='#00f3ff66';c.beginPath();c.moveTo(r.ship.x,r.ship.y);c.lineTo(target.x,target.y);c.stroke();c.setLineDash([]);}
    if(r.crystal){c.save();c.translate(r.crystal.x,r.crystal.y);c.rotate(Math.PI/4);c.fillStyle='#174451';c.strokeStyle='#00f3ff';c.lineWidth=3;c.fillRect(-21,-21,42,42);c.strokeRect(-21,-21,42,42);c.restore();c.fillStyle='#d8fcff';c.font='bold 23px monospace';c.textAlign='center';c.fillText('C',r.crystal.x,r.crystal.y+8);}
    for(const t of r.letters){c.fillStyle=t.letter==='X'?'#ff90d9':'#b6ff00';c.beginPath();c.arc(t.x,t.y,21,0,Math.PI*2);c.fill();c.fillStyle='#0a0813';c.font='bold 25px monospace';c.textAlign='center';c.fillText(t.letter,t.x,t.y+8);}
    c.fillStyle='#00f3ff';for(const p of r.pulses){c.beginPath();c.arc(p.x,p.y,3,0,Math.PI*2);c.fill();}
    c.save();c.translate(r.ship.x,r.ship.y);c.rotate(r.ship.angle);c.fillStyle='#f3faff';c.strokeStyle='#00f3ff';c.lineWidth=2;c.beginPath();c.moveTo(18,0);c.lineTo(-12,-11);c.lineTo(-7,0);c.lineTo(-12,11);c.closePath();c.fill();c.stroke();c.restore();
  }
}
GLYPHSTORM_139408944A76F768

# FILE: public/rules.js
cat > 'public/rules.js' <<'GLYPHSTORM_7DA977204179F8C4'
export const VERSION = '1.10.0';
export const WORLD = { width: 2400, height: 1600 };
export const RULES = Object.freeze({
  trayLimit: 10, minWord: 3, maxWord: 10, shieldMs: 8000, cooldownMs: 15000,
  resetMs: 3000, protectionMs: 2000, priorityMs: 2000, reconnectMs: 30000,
  speed: 245, acceleration: 11, pulseSpeed: 730, pulseInterval: 180,
  shipRadius: 17, letterRadius: 17, stability: 3, maxPlayers: 8, maxSpectators: 8,
  letterLifeMs: 30000, maxLetters: 100, crystalCount: 44,
  asteroidCount: 8, asteroidHits: 3, asteroidLetters: 4,
  boostMs: 550, boostCooldownMs: 6000, boostSpeed: 620,
  showerFirstMs: 30000, showerCycleMs: 60000, showerDurationMs: 14000, showerCount: 4,
  bountyFirstMs: 15000, bountyCycleMs: 45000, bountyDurationMs: 30000, bountyBonus: 20
});
export const VALUES = Object.fromEntries(
  [[1,'AEILNORSTU'],[2,'DG'],[3,'BCMP'],[4,'FHVWY'],[5,'K'],[8,'JX'],[10,'QZ']]
    .flatMap(([n, letters]) => [...letters].map(l => [l,n]))
);
export const COLORS = ['#70f7d1','#b5a0ff','#ffbe78','#ff8caf','#93c6ff','#e5ed80','#efb0ff','#a0e7f4'];
export const TEAMS = ['Aurora','Nebula'];
export const TEAM_COLORS = ['#70f7d1','#b5a0ff'];
export const wrap = (n, size) => ((n % size) + size) % size;
export const delta = (to, from, size) => wrap(to - from + size / 2, size) - size / 2;
export const distance = (a,b) => Math.hypot(delta(a.x,b.x,WORLD.width),delta(a.y,b.y,WORLD.height));
export const scoreWord = word => [...word.toUpperCase()].reduce((n,l) => n + (VALUES[l] || 0),0) + 2 * (word.length - 3) ** 2;
GLYPHSTORM_7DA977204179F8C4

# FILE: public/ship-sprites.js
cat > 'public/ship-sprites.js' <<'GLYPHSTORM_2AB714CEFC8C6F8E'
import { FLEET, shipFor } from './fleet.js';

// Decode once, then cache a small Canvas texture for the animation loop.
// Failed images keep the original vector ship playable, without blocking a room.
export class ShipSprites {
  constructor() {
    this.textures = new Map();
    this.ready = Promise.all(FLEET.map(ship => this.load(ship)));
  }
  async load(ship) {
    try {
      const image = new Image();
      image.src = ship.src;
      await image.decode();
      const texture = document.createElement('canvas');
      texture.width = texture.height = 256;
      const ctx = texture.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image,0,0,256,256);
      this.textures.set(ship.id,texture);
      return true;
    } catch { return false; }
  }
  // Called after translating to the pilot and rotating by the synchronized aim.
  draw(ctx, shipId, size) {
    const texture = this.textures.get(shipFor(shipId).id);
    if (!texture) return false;
    ctx.drawImage(texture,-size/2,-size/2,size,size);
    return true;
  }
}
GLYPHSTORM_2AB714CEFC8C6F8E

# FILE: public/signals.js
cat > 'public/signals.js' <<'GLYPHSTORM_8EBE76960C969D8F'
export const SIGNAL_RULES=Object.freeze({cooldownMs:5000,lifetimeMs:6000,maxSignals:24});
export const SIGNAL_TYPES=Object.freeze({NEED_LETTER:'need-letter',DEFEND_EARTH:'defend-earth'});
export function signalText(signal){
  return signal.kind===SIGNAL_TYPES.NEED_LETTER?'Need '+signal.letter:'Defend Earth!';
}
// Recipient filtering happens on the server, before any snapshot leaves the room.
export function visibleSignals(signals,player,mode,now){
  if(player.role!=='player')return [];
  return signals.filter(s=>s.expiresAt>now&&(s.scope==='all'||(mode==='teams'&&s.team===player.team)));
}
GLYPHSTORM_8EBE76960C969D8F

# FILE: public/style.css
cat > 'public/style.css' <<'GLYPHSTORM_46467272678C3DA6'
:root{color-scheme:dark;--bg:#080d19;--panel:rgba(16,25,41,.88);--line:#263348;--text:#eff4f8;--muted:#99a9be;--mint:#70f7d1;--violet:#b5a0ff;--danger:#ffb1ba;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}body{overflow-x:hidden}button,input,select{font:inherit}button,a,input,select{-webkit-tap-highlight-color:transparent}button{cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid var(--mint);outline-offset:4px}button{color:inherit}a{color:inherit}h1,h2,h3,p{margin-top:0}h2{font-size:24px;letter-spacing:-.8px}p{line-height:1.6}small{color:var(--muted);font-size:12px;line-height:1.6}.hidden{display:none!important}#space{position:fixed;inset:0;width:100%;height:100%;pointer-events:none}main,.topbar{position:relative;z-index:1}.topbar{height:84px;padding:0 5vw;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #ffffff0b}.brand{display:flex;gap:12px;align-items:center;text-decoration:none;font-size:15px;font-weight:800;letter-spacing:2.5px}.brand-mark{width:38px;height:38px;border:1px solid #70f7d180;display:grid;place-items:center;color:var(--mint);border-radius:12px;transform:rotate(-10deg);font-size:25px;box-shadow:0 0 30px #70f7d114}.brand-sub{display:block;font-size:8px;letter-spacing:2.8px;color:var(--muted);margin-top:4px}.top-actions{display:flex;align-items:center;gap:20px}.text-button,.icon-button{border:0;background:none;padding:8px 0;color:var(--muted);font-size:13px}.text-button:hover,.icon-button:hover{color:var(--mint)}.icon-button{padding:8px;font-size:18px}.icon-button span{font-size:11px}.status{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:6px}.status i,.live-dot{width:5px;height:5px;border-radius:50%;background:var(--mint);display:inline-block}.status.offline i{background:var(--danger)}.home{max-width:1280px;margin:auto;padding:75px 44px 24px;display:grid;grid-template-columns:1.25fr 1fr;gap:40px 65px;min-height:calc(100svh - 84px)}.eyebrow{font-size:10px;letter-spacing:2.3px;font-weight:700;color:var(--mint);display:flex;gap:9px;align-items:center}.spark{height:5px;width:5px;background:var(--mint);box-shadow:0 0 12px var(--mint)}.hero-copy{padding-top:22px}.hero-copy h1{font-size:clamp(52px,6.8vw,90px);line-height:1.02;font-weight:900;letter-spacing:-5px;margin:30px 0 20px}.hero-copy em{font-style:normal;background:linear-gradient(100deg,#70f7d1,#a6c3fa 80%);color:transparent;background-clip:text}.hero-description{font-size:23px;letter-spacing:-.5px;color:#d7dfec;line-height:1.45;margin-bottom:20px}.hero-detail{font-size:14px;color:var(--muted);line-height:1.8}.hero-tags{display:flex;gap:18px;margin-top:34px;font-size:10px;color:#b2c6c5;flex-wrap:wrap}.panel{background:linear-gradient(135deg,#142035ed,#0c1423f2);border:1px solid #2b3b54;border-radius:22px;box-shadow:0 15px 60px #00000026}.entry-card{align-self:center;padding:34px 36px}.card-kicker{font-size:9px;font-weight:700;letter-spacing:2px;color:var(--muted);margin-bottom:14px}.entry-card h2{font-size:27px;margin-bottom:30px}.entry-card label,.settings-panel label:not(.toggle-line){display:block;font-size:9px;font-weight:800;letter-spacing:1.8px;color:#c7d2df;margin-bottom:10px}input,select{background:#090f1d;border:1px solid #2c3a50;border-radius:10px;padding:15px 16px;color:var(--text);width:100%;font-size:14px;min-height:48px}input::placeholder{color:#64758e}.entry-card small{display:block;margin-top:9px}.button{display:inline-flex;justify-content:center;align-items:center;gap:15px;min-height:48px;padding:13px 20px;border-radius:10px;border:1px solid transparent;font-weight:750;font-size:13px;transition:background .15s,transform .15s}.button:hover:not(:disabled){transform:translateY(-1px)}.primary{background:var(--mint);color:#09291f;box-shadow:0 4px 24px #70f7d11b}.primary:hover:not(:disabled){background:#9affdf}.secondary{background:#19283b;border-color:#35465b;color:#e2edf5}.small{min-height:36px;padding:8px 13px;font-size:11px}#createButton{width:100%;justify-content:space-between;margin-top:24px}.divider{height:45px;display:flex;align-items:center;gap:15px;color:#6c7f98;font-size:10px}.divider:before,.divider:after{content:"";height:1px;background:#273449;flex:1}.join-row{display:flex;gap:10px}.join-row input{min-width:0;letter-spacing:4px;font-size:16px;text-transform:uppercase}.error{font-size:12px;color:var(--danger);min-height:0;margin:12px 0 0}.error:empty{display:none}.entry-footer{border-top:1px solid #263348;margin-top:25px;padding-top:20px;text-align:center;font-size:10px;color:#8394aa}.tiny-orbit{display:inline-block;width:8px;height:8px;border:1px solid var(--mint);border-radius:50%;margin-right:6px}.loop-strip{grid-column:1/-1;display:flex;border-top:1px solid #253248;border-bottom:1px solid #253248;padding:24px 0;justify-content:space-between;gap:20px}.loop-strip>div{display:flex;gap:18px;align-items:center}.loop-strip b{color:#617d89;font-weight:500;font-size:27px}.loop-strip span{font-size:11px;color:var(--muted)}.loop-strip strong{display:block;font-size:10px;letter-spacing:2px;color:#dfebf4;margin-bottom:4px}.home-bottom{grid-column:1/-1;font-size:8px;letter-spacing:1.9px;color:#63768e;display:flex;justify-content:space-between;margin:0}.home-bottom span{color:var(--mint)}.lobby,.results{max-width:1180px;margin:auto;padding:48px 32px}.section-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px}.section-heading h1{font-size:36px;letter-spacing:-1.5px;margin:14px 0 10px}.section-heading p{color:var(--muted);font-size:13px}.lobby-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:24px}.crew-panel{padding:28px}.room-banner{display:flex;justify-content:space-between;align-items:center;padding-bottom:26px;border-bottom:1px solid var(--line)}.room-banner .label{display:block;margin-bottom:8px}.room-banner strong{font-size:36px;letter-spacing:7px;font-weight:650}.room-banner>div:last-child{display:flex;flex-direction:column;gap:6px}.label{font-size:9px;color:var(--muted);letter-spacing:1.8px;font-weight:700}.panel-title{display:flex;justify-content:space-between;align-items:center;margin:22px 0 18px;gap:12px}.panel-title h2{margin:0;font-size:18px;letter-spacing:-.4px}.badge{font-size:9px;letter-spacing:1px;border:1px solid #35465a;border-radius:6px;padding:5px 8px;color:#b5c5d7;white-space:nowrap}.pilot-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #202d40;font-size:13px}.pilot-avatar{width:35px;height:35px;display:grid;place-items:center;border:1px solid currentColor;border-radius:10px;font-weight:800}.pilot-info{flex:1}.pilot-info small{display:block;font-size:10px}.ready-tag{color:var(--mint);font-size:10px}.waiting-tag{color:#8294ac;font-size:10px}.empty-seat{color:#4e617b;padding:17px 0;border-bottom:1px dashed #253248;font-size:12px}.lobby-side{display:flex;flex-direction:column;gap:20px}.settings-panel{padding:4px 25px 24px}.settings-panel select{margin-bottom:20px}.toggle-line{display:flex;justify-content:space-between;align-items:center;gap:15px;font-size:13px}.toggle-line small{display:block;margin-top:7px;font-size:10px}.toggle-line input{width:20px;min-height:20px;accent-color:var(--mint)}.flight-manual{padding:25px;font-size:12px}.flight-manual p{margin:18px 0 0;line-height:1.9;color:var(--muted)}.mint{color:var(--mint)!important}kbd{font:inherit;background:#ffffff12;padding:3px 6px;border-radius:4px;font-size:10px;white-space:nowrap}.primary kbd{background:#07352615}.lobby-bottom{display:flex;gap:12px;margin-top:24px}.lobby-bottom .button{flex:1}.team-actions{display:flex;gap:8px;align-items:center;margin-top:20px;font-size:10px;color:var(--muted)}.muted{color:var(--muted);font-size:12px}#spectatorList{margin-top:18px}#lobbyHint{font-size:11px;margin:15px 0 0;min-height:16px}.game{height:calc(100dvh - 84px);display:grid;grid-template-rows:59px 1fr 158px;position:relative;min-height:500px}.game-top{display:flex;align-items:center;justify-content:space-between;padding:0 30px;background:#0a1121b0;border-bottom:1px solid #2b3a4d}.game-top>div:first-child{display:flex;gap:16px;align-items:center}.clock{font-size:27px;font-variant-numeric:tabular-nums;font-weight:750;letter-spacing:2px}.clock.urgent{color:#ffbd85}.arena-wrap{position:relative;overflow:hidden;min-height:180px;background:radial-gradient(ellipse at center,#12223a77,transparent 70%)}#arena{width:100%;height:100%;display:block;touch-action:none;cursor:crosshair}.scoreboard{position:absolute;left:22px;top:18px;width:180px;pointer-events:none;font-size:11px}.scoreboard .score-row{display:flex;justify-content:space-between;gap:12px;padding:7px 10px;background:#07101db3;margin-bottom:3px;border-left:2px solid transparent;border-radius:0 5px 5px 0}.score-row.me{background:#1a3c3bd9;border-color:var(--mint)}.score-row span{max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.scoreboard .team-total{color:var(--mint);font-size:10px;margin-bottom:7px}.arena-caption{position:absolute;bottom:14px;left:22px;color:#637f96;font-size:8px;letter-spacing:2px;display:flex;gap:8px;align-items:center;pointer-events:none}#minimap{position:absolute;right:22px;top:18px;border:1px solid #344b626e;border-radius:9px;background:#070e1db0;width:144px;height:96px;pointer-events:none}.phase-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#050c194d;pointer-events:none}.phase-overlay span{font-size:11px;letter-spacing:4px;color:var(--mint)}.phase-overlay strong{font-size:90px;font-weight:800;letter-spacing:-3px}.phase-overlay p{font-size:12px;color:#a5b9cb}.tray-dock{padding:13px 28px 10px;border-top:1px solid #35465b;background:#0b1322f5}.tray-header{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px}.tray-header>div{display:flex;align-items:center;gap:12px}.tray-header .badge{padding:3px 7px}.tray-main{display:flex;gap:20px;justify-content:space-between;align-items:center}.tray{display:flex;gap:7px;flex:1;min-width:0}.tile{height:54px;flex:1;max-width:61px;min-width:0;border:1px solid #3e6470;border-radius:8px;background:linear-gradient(145deg,#1c3a44,#14252f);font-weight:750;color:#d7fff2;font-size:25px;position:relative;display:grid;place-items:center}.tile small{position:absolute;right:6px;bottom:3px;font-size:9px;color:#96b5b6}.tile.empty{border:1px dashed #2c3d52;background:#111d2b;color:#344a61;cursor:default}.tile.selected{transform:translateY(-5px);background:#31594f;border-color:var(--mint);box-shadow:0 0 18px #70f7d11f}.tile.discarding{border-color:#d4a272}.tray-actions{display:flex;flex-direction:column;align-items:center;min-width:190px}.tray-actions .button{min-height:42px;font-size:12px;width:100%}.tray-actions .text-button{font-size:10px;padding:6px}.tray-footer{display:flex;justify-content:space-between;gap:14px;font-size:9px;color:#8094a9;margin-top:8px;line-height:1.5}.stability{color:var(--mint);letter-spacing:3px;font-size:11px}.word-panel{position:absolute;left:50%;top:calc(50% - 80px);transform:translate(-50%,-50%);width:min(430px,calc(100% - 30px));padding:22px 25px;z-index:5;background:#111d31f5;box-shadow:0 15px 100px #000a}.word-panel .panel-title{margin:0 0 12px}.word-panel .eyebrow{font-size:8px;margin-bottom:9px}.word-panel h2{font-size:24px}.word-panel p{font-size:11px;color:var(--mint);margin-bottom:14px}.word-letters{min-height:64px;background:#091120;border:1px solid #35475d;border-radius:10px;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px;font-size:29px;letter-spacing:3px;font-weight:800}.word-letters .placeholder{font-size:11px;font-weight:500;letter-spacing:0;color:#758ba5}.word-tools{display:flex;align-items:center;gap:16px;margin:9px 0 12px;font-size:12px;color:var(--mint)}.word-tools>span{flex:1}.word-tools button{font-size:10px}.word-panel .button{width:100%;justify-content:space-between}.word-panel small{font-size:10px;display:block;margin-top:12px}.word-panel .error{color:var(--danger);margin-bottom:0}.touch-stick{display:none;position:absolute;bottom:22px;width:92px;height:92px;border:1px solid #a8d4e22e;background:#a0d3f00b;border-radius:50%;touch-action:none;user-select:none;-webkit-user-select:none}.touch-stick.left{left:24px}.touch-stick.right{right:24px}.touch-stick span{width:38px;height:38px;border-radius:50%;background:#90d5e733;border:1px solid #a2dee766;position:absolute;left:26px;top:26px;pointer-events:none}.touch-stick b{position:absolute;font-size:8px;font-weight:500;letter-spacing:2px;bottom:-17px;width:100%;text-align:center;color:#738fa3;pointer-events:none}.spectator-bar{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:#0c1628ed;padding:15px 22px;border:1px solid #334966;border-radius:12px;display:flex;align-items:center;gap:14px;max-width:90%}.spectator-bar>span{font-size:9px;letter-spacing:1px;color:var(--violet)}.spectator-bar select{width:150px;min-height:35px;padding:8px;font-size:12px}.spectator-bar small{font-size:10px}.connection-overlay{position:absolute;inset:0;background:#070f20dc;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;text-align:center;z-index:10;padding:20px}.connection-overlay strong{font-size:20px}.connection-overlay span{color:var(--muted);font-size:12px}.results{text-align:center;padding-top:55px;max-width:900px}.results>.eyebrow{justify-content:center}.results>h1{font-size:44px;letter-spacing:-2px;margin:20px 0 12px}.results-panel,.result-words{padding:5px 26px 25px;text-align:left;margin-top:28px}.result-row{display:grid;grid-template-columns:35px 1fr 90px 100px;align-items:center;gap:12px;padding:17px 0;border-bottom:1px solid #263449;font-size:13px}.result-rank{color:#738ba6;font-size:18px}.result-score{text-align:right;color:var(--mint);font-weight:700;font-size:22px}.result-best{font-size:10px;color:var(--muted)}.word-chip{display:inline-flex;gap:9px;align-items:center;background:#1b2e40;border:1px solid #30465c;border-radius:7px;padding:10px 13px;font-size:11px;margin:4px}.word-chip b{color:var(--mint);font-size:10px}.result-actions{display:flex;gap:22px;align-items:center;justify-content:center;margin-top:28px}.toast{position:fixed;left:50%;bottom:25px;transform:translateX(-50%);z-index:30;background:#213848;border:1px solid #568579;color:#d8fff0;border-radius:10px;padding:13px 20px;font-size:12px;box-shadow:0 10px 35px #0007;max-width:90%;text-align:center}dialog{background:#101c30;color:var(--text);border:1px solid #3b516e;border-radius:22px;max-width:580px;width:calc(100% - 30px);padding:32px;max-height:85dvh;overflow:auto}dialog::backdrop{background:#02060bd9;backdrop-filter:blur(8px)}dialog h2{font-size:30px;margin:16px 0 24px}dialog p,dialog li{font-size:12px;line-height:1.8;color:#b5c6d8}dialog ol{padding-left:20px}dialog li{padding-left:5px;margin-bottom:15px}dialog strong{color:#e2edf7}.help-note{border:1px solid #32475a;background:#182a3c;padding:16px;border-radius:12px;font-size:12px}.help-note p{margin:8px 0 0}.close-dialog{position:absolute;right:18px;top:12px;font-size:28px}.reduced *{transition:none!important;scroll-behavior:auto!important}
@media(pointer:coarse){.touch-stick{display:block}.game.is-spectator .touch-stick{display:none}.game-top .muted{display:none}}
@media(max-width:900px){.home{gap:35px;padding:50px 28px 20px}.hero-copy h1{letter-spacing:-3px;font-size:62px}.hero-tags{gap:10px}.entry-card{padding:26px}.topbar{padding:0 25px}.status{display:none}.top-actions{gap:14px}.lobby-grid{grid-template-columns:1.2fr 1fr}.tray-dock{padding:12px 15px}.tray{gap:5px}.tile{font-size:21px;height:48px}.tray-actions{min-width:155px}.tray-actions kbd{display:none}.scoreboard{width:150px}.word-panel{padding:18px 22px}}
@media(max-width:700px){.topbar{height:64px;padding:0 18px}.brand{font-size:12px;letter-spacing:1.4px}.brand-mark{width:30px;height:30px;font-size:20px}.brand-sub{font-size:7px}.top-actions{gap:8px}#helpButton{font-size:11px}#soundButton span{display:none}.home{grid-template-columns:1fr;padding:35px 22px 20px;gap:30px}.hero-copy{padding-top:5px}.hero-copy h1{font-size:60px;letter-spacing:-3.5px;margin:23px 0 18px}.hero-description{font-size:20px}.hero-detail{font-size:13px}.hero-tags{margin-top:22px}.entry-card{padding:26px}.loop-strip{gap:12px}.loop-strip>div{gap:8px}.loop-strip b{font-size:21px}.loop-strip span{font-size:9px}.loop-strip strong{font-size:8px;letter-spacing:1px}.home-bottom{font-size:7px}.lobby,.results{padding:30px 18px}.section-heading h1{font-size:29px}.section-heading{align-items:flex-start}.section-heading>.text-button{font-size:10px;white-space:nowrap}.lobby-grid{grid-template-columns:1fr}.crew-panel{padding:20px}.room-banner strong{font-size:31px;letter-spacing:5px}.lobby-side{display:grid;grid-template-columns:1fr}.flight-manual{display:none}.game{height:calc(100dvh - 64px);grid-template-rows:47px 1fr 168px;min-height:550px}.game-top{padding:0 15px}.game-top .badge{font-size:7px;letter-spacing:.6px}.game-top>div:first-child{gap:5px}.clock{font-size:23px}.tray-main{flex-wrap:wrap;gap:9px}.tray{flex-basis:100%}.tile{height:40px;font-size:21px;max-width:none}.tile small{right:3px;bottom:1px;font-size:8px}.tray-actions{flex-direction:row;width:100%;gap:10px}.tray-actions .button{width:auto;flex:1;min-height:34px;font-size:11px;padding:8px 12px}.tray-actions .text-button{font-size:10px;min-width:105px}.tray-header{margin-bottom:8px;gap:5px}.tray-header>div{gap:7px}.tray-header .muted{font-size:9px}.tray-footer{font-size:8px;margin-top:6px}.tray-footer #lastWord{display:none}.scoreboard{top:10px;left:10px;width:129px}.scoreboard .score-row{font-size:9px;padding:5px 7px}.scoreboard .team-total{font-size:9px}#minimap{right:10px;top:10px;width:105px;height:70px}.arena-caption{left:12px;bottom:7px;font-size:7px}.touch-stick{bottom:30px;width:80px;height:80px}.touch-stick.left{left:18px}.touch-stick.right{right:18px}.touch-stick span{left:20px;top:20px}.word-panel{top:calc(50% - 62px);padding:16px 19px;width:calc(100% - 24px);max-width:380px}.word-panel .eyebrow{font-size:7px}.word-panel h2{font-size:21px}.word-panel small{font-size:9px}.word-letters{min-height:51px;font-size:26px}.word-panel p{margin-bottom:10px}.word-panel .button{min-height:39px}.word-tools{margin:8px 0}.word-panel .panel-title{margin-bottom:9px}.phase-overlay strong{font-size:68px}.spectator-bar{flex-wrap:wrap;padding:10px 14px;justify-content:center;width:90%;gap:8px;bottom:30px}.spectator-bar small{width:100%;text-align:center}.results>h1{font-size:34px}.result-row{grid-template-columns:22px 1fr 70px;gap:8px}.result-best{display:none}.results-panel,.result-words{padding:5px 17px 20px}.result-actions{flex-wrap:wrap;gap:15px}.result-score{font-size:20px}}
@media(max-height:600px) and (min-width:600px){.topbar{height:47px}.brand-sub{display:none}.game{height:calc(100dvh - 47px);min-height:330px;grid-template-rows:38px 1fr 101px}.game-top{padding:0 18px}.clock{font-size:22px}.tray-dock{padding:6px 15px}.tray-header{margin-bottom:5px}.tray-main{flex-wrap:nowrap}.tray{flex-basis:auto}.tile{height:40px}.tray-actions{width:auto;min-width:155px;flex-direction:column;gap:0}.tray-actions .button{min-height:32px;padding:7px 12px}.tray-actions .text-button{padding:3px}.tray-footer{margin-top:2px;font-size:8px}.word-panel{top:45%;padding:12px 18px;width:380px}.word-panel .panel-title{margin-bottom:8px}.word-panel small{display:none}.word-panel h2{font-size:18px}.word-panel .eyebrow{display:none}.word-letters{min-height:40px;font-size:25px}.word-panel p{margin-bottom:7px}.word-panel .button{min-height:34px;padding:8px 12px}.touch-stick{width:70px;height:70px;bottom:24px}.touch-stick span{left:15px;top:15px}.scoreboard{top:8px}.scoreboard .score-row{padding:3px 6px;font-size:9px}#minimap{width:105px;height:70px;top:8px}.tray-header .label{font-size:8px}.lobby{padding-top:25px}.home{padding-top:35px}}

/* Ordered collection: numbered slots and compact review controls. */
.tile-order{position:absolute;left:5px;top:2px;font-size:8px;line-height:1;color:#8eabb7;font-weight:500}.tile:not(button){cursor:default}.tray-actions .text-button{padding:4px 0;line-height:1.3}.word-panel h2{font-size:21px}.word-tools{gap:10px}
@media(max-width:700px){.tray-actions .text-button{min-width:0;flex:1;font-size:9px}.tile-order{font-size:7px;left:3px}.word-panel h2{font-size:19px}}

/* Explorer fleet: cosmetic selection and pilot identification. */
.ship-picker{border-top:1px solid #2b3b54;margin-top:22px;padding-top:20px}
.ship-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.ship-heading h3{font-size:14px;margin:0}.ship-heading>span{font-size:12px;font-weight:650}
.ship-choices{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.ship-option{position:relative;min-width:0;min-height:108px;padding:8px 5px;border:1px solid #2b4055;border-radius:12px;background:radial-gradient(ellipse at 50% 30%,#22364a,#101c2c 80%);color:#bed0df;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;transition:border-color .15s,background .15s}
.ship-option:hover:not(:disabled){border-color:var(--ship-color);background:#213448}
.ship-option[aria-pressed=true]{border-color:var(--ship-color);box-shadow:inset 0 0 0 1px var(--ship-color);color:#effcff}
.ship-preview{display:block;width:100%;height:68px;object-fit:contain;pointer-events:none}
.ship-preview.art-unavailable{visibility:hidden}.ship-option strong{font-size:11px;font-weight:650}
.ship-selected{opacity:0;position:absolute;top:5px;right:7px;color:var(--ship-color);font-size:11px;font-weight:800}.ship-option[aria-pressed=true] .ship-selected{opacity:1}
.ship-help{margin:12px 0 0;font-size:10px;line-height:1.7;color:#91a6b9}.ship-help span{font-size:13px}
.ship-avatar{width:44px;height:44px;flex:none;border-radius:50%;background:#0a1525}.ship-avatar img{width:42px;height:42px;object-fit:contain}.pilot-info{min-width:0;overflow-wrap:anywhere}
@media(max-width:700px){.ship-picker{margin-top:18px;padding-top:16px}.ship-choices{gap:6px}.ship-option{min-height:88px;padding:6px 3px}.ship-preview{height:52px}.ship-option strong{font-size:10px}.ship-heading h3{font-size:13px}.ship-help{font-size:10px}}
@media(max-width:360px){.ship-choices{grid-template-columns:repeat(2,minmax(0,1fr))}.ship-preview{height:62px}}

@media(pointer:coarse){.rotation-hint{display:none}}

/* Arcade feedback stays clear of pointer and touch input. */
.race-status{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);width:240px;max-width:calc(100% - 230px);padding:9px 12px;text-align:center;background:linear-gradient(135deg,#102638e8,#091624e8);border:1px solid #315364;border-radius:12px;pointer-events:none;display:grid;grid-template-columns:1fr auto;align-items:center;gap:2px 12px}
.race-status>span{font-size:8px;letter-spacing:1.6px;text-align:left;color:#99b5c6}.race-status>strong{font-size:24px;font-weight:800;color:#effff9;font-variant-numeric:tabular-nums}.race-status>small{grid-column:1/-1;font-size:10px;color:#b4cbda;line-height:1.4}.race-status.leading{border-color:#70f7d1}.race-status.leading>small{color:#a2ffe0}
.arena-announcement{position:absolute;top:17px;left:50%;transform:translateX(-50%);width:min(310px,calc(100% - 420px));padding:9px 12px;border:1px solid #ac98e075;border-radius:30px;background:#171e36ee;text-align:center;color:#dfd6ff;font-size:10px;letter-spacing:1px;line-height:1.4;pointer-events:none;z-index:2;overflow-wrap:anywhere}
.word-burst{position:absolute;left:50%;top:23%;transform:translateX(-50%);width:min(320px,80%);pointer-events:none;text-align:center;z-index:2;display:flex;flex-direction:column;gap:4px;text-shadow:0 2px 14px #020713,0 0 30px #071321}
.word-burst>span{font-size:10px;letter-spacing:3px;color:#a2ffe0;font-weight:700}.word-burst>strong{font-size:clamp(25px,3.5vw,43px);letter-spacing:4px;line-height:1.1;color:#fff;font-weight:850}.word-burst>b{font-size:17px;color:#ffcf92;letter-spacing:1.5px}.word-burst.pop{animation:word-arrival .4s cubic-bezier(.2,.8,.2,1) both}
@keyframes word-arrival{from{opacity:0;transform:translateX(-50%) translateY(12px) scale(.88)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
.scoreboard .front-runner{background:#1a353ee8}.scoreboard .front-runner b{color:#a2ffe0}.final-push{box-shadow:inset 0 0 65px #ffb86614}.clock.urgent{font-weight:850;text-shadow:0 0 18px #ffbe782b}.reduced *{animation:none!important}
.game.is-spectator .race-status{bottom:90px}
@media(max-width:700px){.race-status{bottom:19px;width:180px;max-width:calc(100% - 210px);padding:6px 8px;gap:1px 5px}.race-status>span{font-size:7px;letter-spacing:.5px}.race-status>strong{font-size:21px}.race-status>small{font-size:9px}.arena-announcement{top:auto;bottom:91px;width:calc(100% - 210px);padding:6px 7px;font-size:8px;letter-spacing:.3px;border-radius:10px}.word-burst{top:auto;bottom:145px;width:240px;max-width:90%;gap:3px}.word-burst>strong{font-size:26px;letter-spacing:2px}.word-burst>b{font-size:14px}.word-burst>span{font-size:8px;letter-spacing:2px}.game.is-spectator .race-status{bottom:108px}.game.is-spectator .arena-announcement{bottom:180px}}
@media(max-height:600px) and (min-width:700px){.word-burst{top:22%}.word-burst>strong{font-size:28px}.race-status{bottom:12px;padding:5px 10px}.race-status>strong{font-size:18px}}

/* Live objectives occupy their own row, leaving the flight surface clear. */
.game{grid-template-rows:59px 60px minmax(180px,1fr) 158px;min-height:558px}
.game.is-spectator{grid-template-rows:59px 60px minmax(180px,1fr)}
.mission-strip{display:grid;grid-template-columns:1fr 1fr 135px;gap:10px;align-items:center;padding:5px 24px;background:#0c1728;border-block:1px solid #263b50}
.mission-card{min-width:0;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:3px 12px;border-left:2px solid #35465b;padding-left:12px}
.mission-label{font-size:8px;color:#9bb4ca;letter-spacing:1.6px;white-space:nowrap}.mission-card strong{font-size:16px;letter-spacing:1.5px;color:#c9d5e3}.mission-card small{grid-column:1/-1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;color:#94adc2}
.bounty-card.active{border-color:#ffcf92}.bounty-card.active strong{color:#ffdc9e}.meteor-card.active{border-color:#a0e7f4}.meteor-card.active strong,.meteor-card.active .mission-label{color:#b6f1ff}
.boost-button{--charge:100%;position:relative;overflow:hidden;min-height:43px;padding:7px 10px;border:1px solid #63b9d4;border-radius:9px;background:#123047;color:#d6f7ff;display:flex;flex-direction:column;align-items:center;gap:3px;touch-action:manipulation}
.boost-button::after{content:'';position:absolute;bottom:0;left:0;width:var(--charge);height:3px;background:#9ae9ff}.boost-button strong{font-size:12px;letter-spacing:1px}.boost-button small{font-size:8px;letter-spacing:1px}.boost-button:disabled{opacity:.55}.boost-button:not(:disabled):hover{background:#1b475e}.game.is-spectator .mission-strip{grid-template-columns:1fr 1fr}
@media(max-width:900px){.mission-strip{padding:5px 12px;gap:8px;grid-template-columns:1fr 1fr 110px}.mission-card{grid-template-columns:1fr;gap:1px;padding-left:8px}.mission-label{font-size:7px;letter-spacing:1px}.mission-card strong{font-size:13px}.mission-card small{font-size:9px}}
@media(max-width:700px){.game{grid-template-rows:47px 62px minmax(180px,1fr) 168px;min-height:570px}.game.is-spectator{grid-template-rows:47px 62px minmax(180px,1fr)}.mission-strip{padding:4px 10px;grid-template-columns:1.1fr 1fr 78px;gap:6px}.mission-card{padding-left:6px}.mission-card strong{font-size:12px;letter-spacing:.6px}.mission-card small{font-size:8px}.mission-label{font-size:6px;letter-spacing:.8px}.boost-button{min-height:46px;padding:6px 3px}.boost-button strong{font-size:10px}.boost-button small{font-size:6px;letter-spacing:.4px}.word-burst>b{font-size:11px}}
@media(max-height:600px) and (min-width:600px){.game{grid-template-rows:32px 44px minmax(120px,1fr) 101px;min-height:297px}.game.is-spectator{grid-template-rows:32px 44px minmax(120px,1fr)}.arena-wrap{min-height:120px}.mission-strip{padding-block:2px}.mission-card{grid-template-columns:auto 1fr;gap:1px 8px}.mission-card strong{font-size:11px}.mission-card small{font-size:8px}.boost-button{min-height:36px}.word-burst{top:12%;bottom:auto}}

/* Defense is a shared objective, with health outside the flight/touch surface. */
.defense-status{min-width:0;border-left:2px solid #00f3ff;padding-left:10px;display:grid;gap:2px;color:#bbf7ff}
.defense-status>div{display:flex;align-items:center;justify-content:space-between;gap:8px}
.defense-status span{font-size:8px;letter-spacing:1px;color:#91bed0}.defense-status strong{font-size:13px;font-variant-numeric:tabular-nums}
.defense-status b{font-size:9px;font-weight:600}.defense-status small{font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2}
.defense-status meter{width:100%;height:5px;display:block;border:0;background:#183447;border-radius:4px}
.defense-status meter::-webkit-meter-bar{background:#183447;border:0;border-radius:4px}.defense-status meter::-webkit-meter-optimum-value{background:#00d9e7}.defense-status meter::-webkit-meter-suboptimum-value{background:#ff697c}.defense-status meter::-moz-meter-bar{background:#00d9e7}
.defense-status.critical{border-color:#ff697c;color:#ffb0bc}.defense-status.critical strong{color:#ffb0bc}
.has-defense .mission-strip{grid-template-columns:1.2fr 1fr 1fr 115px}
.game.has-defense{grid-template-rows:59px 76px minmax(180px,1fr) 158px;min-height:574px}.game.has-defense.is-spectator{grid-template-rows:59px 76px minmax(180px,1fr)}
.has-defense.is-spectator .mission-strip{grid-template-columns:1.2fr 1fr 1fr}
.has-defense .mission-card{grid-template-columns:1fr;gap:1px}.has-defense .mission-card strong{font-size:13px}
@media(max-width:700px){.has-defense .mission-strip{grid-template-columns:1fr 1fr 78px;gap:5px 7px}.defense-status{grid-column:1/-1;grid-template-columns:1.2fr 1fr 1fr;align-items:center;gap:2px 12px}.defense-status meter{grid-column:2;grid-row:1}.defense-status small{grid-column:1/-1}.defense-status span{font-size:7px}.defense-status strong{font-size:12px}.game.has-defense{grid-template-rows:47px 105px minmax(180px,1fr) 168px;min-height:600px}.game.has-defense.is-spectator{grid-template-rows:47px 105px minmax(180px,1fr)}.has-defense.is-spectator .mission-strip{grid-template-columns:1fr 1fr}.has-defense .mission-card strong{font-size:11px}}
@media(max-height:600px) and (min-width:600px){.game.has-defense{grid-template-rows:32px 68px minmax(120px,1fr) 101px;min-height:321px}.game.has-defense.is-spectator{grid-template-rows:32px 68px minmax(120px,1fr)}.has-defense .mission-strip{grid-template-columns:1.2fr 1fr 1fr 88px}.defense-status{grid-column:auto;grid-template-columns:1fr;gap:1px}.defense-status meter{grid-column:auto;grid-row:auto}.defense-status small{grid-column:auto;font-size:7px}.defense-status span{font-size:7px}.defense-status strong{font-size:11px}}

/* Every pilot and spectator sees the same primary objective before and during play. */
.mission-brief{margin:0 0 24px;padding:24px;border-color:#35758a}
.mission-brief h2{margin:12px 0 8px;font-size:26px}.mission-brief>p{font-size:13px;color:#b9cedd;margin:8px 0}
.mission-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;list-style:none;counter-reset:mission;padding:0;margin:20px 0}
.mission-steps li{counter-increment:mission;min-width:0;border-top:1px solid #315062;padding-top:14px}
.mission-steps li::before{content:'0' counter(mission);display:block;color:#70f7d1;font-size:12px;letter-spacing:2px;margin-bottom:9px}
.mission-steps strong{font-size:14px;color:#effcff}.mission-steps p{font-size:12px;line-height:1.7;color:#a9c1d3;margin:7px 0 0}
.mission-brief .mission-win{color:#a2ffe0;font-weight:650}.mission-brief .mission-loss{color:#ffcdad;font-size:12px}
.mission-ribbon{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 24px;background:#102738;border-left:3px solid #00d9e7}
.mission-ribbon>div{min-width:0;display:grid;gap:4px}.mission-ribbon strong{font-size:11px;letter-spacing:1px;color:#b5f5ff}.mission-ribbon span{font-size:11px;line-height:1.4;color:#b7cddd}
.mission-ribbon .button{flex:none;font-size:10px;min-height:34px;padding:7px 10px}
.mission-help{padding:0;margin:18px 0 20px}.mission-help .mission-steps{grid-template-columns:1fr;gap:10px}.mission-help .eyebrow{line-height:1.5}.mission-help .mission-steps li{padding-left:0;padding-top:9px;margin:0}.mission-help .mission-steps li::before{float:left;margin:2px 10px 0 0}
.word-panel .word-mission-reward{font-size:10px;line-height:1.5;margin:0 0 10px;color:#a2ffe0}
.phase-overlay p{max-width:560px;text-align:center;padding:0 18px;line-height:1.6;text-wrap:balance}
/* Grid variables keep the mission row outside the flight controls in every mode. */
.game{--top-row:59px;--objectives-row:60px;--dock-row:158px;--arena-min:180px;--brief-min:58px}
.game.has-defense{--objectives-row:76px}
.game,.game.has-defense{grid-template-rows:var(--top-row) auto var(--objectives-row) minmax(var(--arena-min),1fr) var(--dock-row);min-height:calc(var(--top-row) + var(--brief-min) + var(--objectives-row) + var(--arena-min) + var(--dock-row))}
.game.is-spectator,.game.has-defense.is-spectator{grid-template-rows:var(--top-row) auto var(--objectives-row) minmax(var(--arena-min),1fr);min-height:calc(var(--top-row) + var(--brief-min) + var(--objectives-row) + var(--arena-min))}
@media(max-width:700px){.mission-brief{padding:19px;margin-bottom:20px}.mission-brief .eyebrow{font-size:8px;letter-spacing:1px;line-height:1.6}.mission-brief h2{font-size:23px}.mission-steps{grid-template-columns:1fr;gap:12px;margin:16px 0}.mission-steps li{padding-top:10px}.mission-steps li::before{float:left;margin:2px 9px 0 0}.mission-ribbon{padding:8px 10px;gap:8px}.mission-ribbon strong{font-size:9px;letter-spacing:.4px}.mission-ribbon span{font-size:10px}.mission-ribbon .button{font-size:9px;max-width:74px;padding:6px 8px;line-height:1.4}.game{--top-row:47px;--objectives-row:62px;--dock-row:168px;--brief-min:72px}.game.has-defense{--objectives-row:105px}.phase-overlay p{font-size:11px}.mission-help{padding:0}}
@media(max-height:600px) and (min-width:600px){.game{--top-row:32px;--objectives-row:44px;--dock-row:101px;--arena-min:120px;--brief-min:46px}.game.has-defense{--objectives-row:68px}.mission-ribbon{padding:5px 12px}.mission-ribbon strong{font-size:9px}.mission-ribbon span{font-size:9px}.phase-overlay strong{font-size:45px}.phase-overlay p{margin-bottom:0;font-size:10px}}

/* Retro neon arcade: crisp text over deep purple, with restrained luminous edges. */
:root{--bg:#0a0813;--panel:#151023;--line:#39274d;--mint:#b6ff00;--violet:#cf8fff;--muted:#b0a6c5;--text:#f6f0ff;--danger:#ff90d9}
body{background:#0a0813}.topbar{border-color:#ff2bd62b;background:#0a08138a}.brand-mark{color:#00f3ff;border-color:#00f3ff99;box-shadow:0 0 24px #00f3ff22}.brand{color:#f6f0ff}
h1,h2,h3,.clock,.mission-ribbon strong{font-family:ui-monospace,"SFMono-Regular",Consolas,monospace}.hero-copy em{background-image:linear-gradient(100deg,#00f3ff,#ff2bd6)}
.panel{background:linear-gradient(135deg,#1a102bf5,#100c1ef5);border-color:#55316b;box-shadow:0 12px 45px #0006,inset 0 1px #ff2bd618}
.button.primary{color:#142000;background:#b6ff00;box-shadow:0 0 24px #b6ff001a}.button.primary:hover:not(:disabled){background:#d3ff67}.secondary{background:#251433;border-color:#78448e}
input,select{background:#100c1c;border-color:#49315d}.game-top{background:#110c1de6;border-color:#57316a}.mission-strip{background:#120e22;border-color:#4b2b67}.mission-ribbon{background:linear-gradient(100deg,#1f0f34,#101d2e);border-color:#ff2bd6}.mission-ribbon strong{color:#9af7ff}.arena-wrap{background:#0a0813}
.tray-dock{background:#100c1ff5;border-color:#573268}.tile{background:linear-gradient(145deg,#203519,#151b22);border-color:#778e47;color:#e5ffb5}.tile.selected{background:#304b18;border-color:#b6ff00;box-shadow:0 0 16px #b6ff0033}.tile.empty{background:#120d21;border-color:#49315b}.word-panel{background:#180f2bf5}.word-letters{background:#0a0813;border-color:#75458f}
.touch-stick{border-color:#00f3ff55;background:#00f3ff0b}.touch-stick span{border-color:#00f3ff99;background:#00f3ff22}.race-status{background:linear-gradient(135deg,#261237ee,#101b2cee);border-color:#8d399d}.race-status.leading{border-color:#b6ff00}.word-burst>b{color:#b6ff00}.word-burst>span{color:#00f3ff}.arena-announcement{border-color:#ff2bd688;background:#210d32ee;color:#ffbaf2}dialog{background:#140e24;border-color:#75458f}.help-note{background:#21112e;border-color:#573267;margin-bottom:12px}
.power-card{--power-color:#ff2bd6;gap:1px!important}.power-card strong{font-size:12px!important;letter-spacing:.5px!important;color:#f3c4ff}.power-card>b{font:700 10px ui-monospace,monospace;color:#d3c4e4}.power-card small{font-size:8px!important;line-height:1.4}.power-card.active{border-color:var(--power-color);box-shadow:-6px 0 20px -15px var(--power-color)}.power-card.active strong{color:#fff;text-shadow:0 0 12px var(--power-color)}
.has-defense .mission-strip{grid-template-columns:1.1fr 1.2fr 1fr 1fr 110px}.has-defense.is-spectator .mission-strip{grid-template-columns:1.1fr 1.2fr 1fr 1fr}.game.has-defense{--objectives-row:84px}
@media(max-width:900px){.has-defense .mission-strip{grid-template-columns:1fr 1.2fr .9fr .9fr 78px;gap:6px}.power-card strong{font-size:10px!important}.power-card small{font-size:7px!important}}
@media(max-width:700px){.has-defense .mission-strip{grid-template-columns:1fr 1fr 78px}.power-card{grid-column:1/-1;display:grid;grid-template-columns:1fr auto!important;gap:1px 9px!important}.power-card .mission-label{grid-column:1}.power-card strong{grid-column:1;grid-row:2;font-size:12px!important}.power-card>b{grid-column:2;grid-row:1/3;align-self:center;text-align:right}.power-card #powerUpCombo{grid-column:1;font-size:8px!important}.power-card #powerUpHint{grid-column:2;font-size:7px!important;text-align:right;max-width:165px}.game.has-defense{--objectives-row:145px}.has-defense.is-spectator .mission-strip{grid-template-columns:1fr 1fr}}
@media(max-height:600px) and (min-width:600px){.has-defense .mission-strip{grid-template-columns:1.1fr 1.2fr .9fr .9fr 75px}.has-defense.is-spectator .mission-strip{grid-template-columns:1.1fr 1.2fr 1fr 1fr}.power-card{grid-column:auto;grid-template-columns:1fr!important;gap:1px!important}.power-card .mission-label,.power-card strong,.power-card>b,.power-card #powerUpCombo,.power-card #powerUpHint{grid-column:auto;grid-row:auto;text-align:left}.power-card strong{font-size:10px!important}.power-card>b{font-size:9px}.power-card #powerUpHint{font-size:6px!important}.game.has-defense{--objectives-row:78px}}

/* Collection board: private, ordered inventory outside the flight controls. */
.game{--dock-row:214px}
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.collection-board{padding:12px 24px 10px;background:linear-gradient(115deg,#12182b,#160e26);border-top:2px solid #00f3ff;box-shadow:0 -8px 28px #00f3ff0d;min-width:0}
.collection-board .tray-header{margin-bottom:8px;min-height:22px;gap:10px}
.collection-board .tray-header>div{gap:10px;min-width:0}
.collection-board h2{margin:0;color:#ecfdff;font:800 12px ui-monospace,monospace;letter-spacing:1.3px;white-space:nowrap}
.collection-board #trayCount{border-color:#00f3ff70;color:#b8faff;font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums}
.collection-protection{font-size:10px}
.collection-protection .muted{font-size:10px;white-space:nowrap}
.collection-readout{min-height:37px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;padding:5px 10px;border-radius:6px;background:#070b16;border:1px solid #2b405b}
.collection-word-line{display:flex;align-items:center;gap:12px;min-width:0;flex-wrap:wrap}
.collection-caption{font-size:8px;font-weight:700;letter-spacing:1px;color:#b4c1d5;white-space:nowrap}
#collectionWord{font:800 23px/1.1 ui-monospace,monospace;letter-spacing:2px;color:#d7ff8c;overflow-wrap:anywhere}
#collectionWord.is-empty{font:500 12px/1.3 system-ui;letter-spacing:0;color:#c0d0df}
.collection-remainder{font:700 10px ui-monospace,monospace;letter-spacing:1px;color:#c7b7df;border-left:1px solid #5b4975;padding-left:10px;overflow-wrap:anywhere}
.collection-status{font-size:10px;color:#b8cbdc;text-align:right;flex-shrink:0}
.collection-board .tray-main{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:18px;align-items:center}
.collection-board .tray{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:7px;width:100%}
.collection-board .tile{height:72px;max-width:none;min-width:0;width:100%;padding:0;position:relative;border:1px solid #9acb58;border-radius:8px;background:linear-gradient(155deg,#2a411c,#182421);color:#edffd3;box-shadow:inset 0 1px #d7ff8c26}
.collection-board .tile-letter{font:800 32px/1 ui-monospace,monospace}
.collection-board .tile-order{font:600 10px/1 ui-monospace,monospace;top:6px;left:6px;color:#c1d8a9}
.collection-board .tile-value{font:500 10px/1 ui-monospace,monospace;right:6px;bottom:5px;color:#c1d8a9}
.collection-board .tile.empty{background:#0c1220;border:1px dashed #42536b;box-shadow:none;color:#405670}
.collection-board .tile.empty .tile-order{color:#8199b5}
.collection-board .tile.empty .tile-letter{font-size:22px;font-weight:400}
.collection-board .tile.next-slot{border:2px solid #00f3ff;background:#102a36;color:#a3faff;box-shadow:inset 0 0 18px #00f3ff0b}
.collection-board .tile.next-slot .tile-order{color:#b6f7ff}
.tile-next{position:absolute;bottom:5px;left:0;right:0;text-align:center;font:700 8px/1 ui-monospace,monospace;letter-spacing:1px;color:#b6f7ff}
.collection-board .tile.selected{transform:none;background:#354e1a;border:2px solid #b6ff00;box-shadow:inset 0 -3px #b6ff00}
.collection-board button.tile:hover{filter:brightness(1.18)}
.collection-board .tile.discarding{border-color:#ff90d9;background:#3a1732;color:#ffe4f6}
.collection-board .tile.discarding .tile-order,.collection-board .tile.discarding .tile-value{color:#ffbfe8}
.collection-board .tray-actions{min-width:0;width:100%;gap:1px;align-items:stretch}
.collection-board .tray-actions .button{width:100%;min-height:40px;justify-content:center;gap:8px;white-space:nowrap}
.collection-board .tray-actions .text-button{font-size:11px;padding:5px 2px;color:#d0c4e3;min-width:0}
.collection-board .tray-footer{margin-top:7px;font-size:10px;color:#b1c4d7;gap:8px;line-height:1.4}
.collection-board #lastWord{display:block;color:#cffb8a;white-space:nowrap;font-weight:700}
.collection-board.is-full{border-top-color:#ff90d9}
.collection-board.is-full #trayCount,.collection-board.is-full .collection-status,.collection-board.is-discarding .collection-status{color:#ffbfe8;border-color:#ff90d9}
.tile.just-collected{animation:letter-collected .42s ease-out}
@keyframes letter-collected{from{box-shadow:0 0 22px #b6ff00,inset 0 0 18px #b6ff0055;border-color:#e8ffbd}to{box-shadow:inset 0 1px #d7ff8c26}}
@media(max-width:900px){.collection-board{padding-inline:14px}.collection-board .tray-main{grid-template-columns:minmax(0,1fr) 145px;gap:12px}.collection-board .tray{gap:5px}.collection-caption{font-size:7px}.collection-status{font-size:9px}.collection-word-line{gap:8px}.collection-board .tile-letter{font-size:28px}.collection-board .tray-footer{font-size:9px}}
@media(max-width:700px){
  .game{--dock-row:282px}
  .collection-board{padding:9px 12px 8px}
  .collection-board h2{font-size:10px;letter-spacing:.7px}
  .collection-board .tray-header{margin-bottom:6px;min-height:19px;gap:6px}
  .collection-board .tray-header>div{gap:6px}.collection-board #trayCount{font-size:10px;padding:3px 5px}
  .collection-protection .muted{font-size:8px}.collection-protection .stability{font-size:9px}
  .collection-readout{padding:5px 7px;min-height:34px;margin-bottom:7px;gap:5px}
  .collection-word-line{gap:3px 7px;flex:1}.collection-caption{font-size:7px;letter-spacing:.5px;flex-basis:100%}
  #collectionWord{font-size:20px;letter-spacing:1px}#collectionWord.is-empty{font-size:11px}
  .collection-remainder{font-size:8px;padding-left:6px}.collection-status{font-size:9px;max-width:96px;line-height:1.4}
  .collection-board .tray-main{grid-template-columns:1fr;gap:8px}
  .collection-board .tray{grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
  .collection-board .tile{height:48px}.collection-board .tile-letter{font-size:26px}
  .collection-board .tile-order{font-size:9px;top:5px;left:5px}.collection-board .tile-value{font-size:9px;right:5px;bottom:4px}
  .tile-next{font-size:7px;bottom:3px}.collection-board .tile.next-slot .tile-letter{transform:translateY(-3px)}
  .collection-board .tray-actions{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:6px;align-items:stretch}
  .collection-board .tray-actions .button{min-height:42px;font-size:11px;padding:7px 5px}
  .collection-board .tray-actions .text-button{min-height:42px;font-size:10px;padding:5px;border:1px solid #5c456e;border-radius:7px;background:#20162d;line-height:1.3}
  .collection-board .tray-footer{font-size:9px;flex-wrap:wrap;gap:1px 8px;margin-top:5px}.collection-board #lastWord{margin-left:auto}
}
@media(max-height:600px) and (min-width:600px){
  .game{--dock-row:143px}
  .collection-board{padding:5px 12px}.collection-board .tray-header{min-height:17px;margin-bottom:4px}
  .collection-board h2{font-size:10px}.collection-board #trayCount{font-size:9px;padding:2px 5px}
  .collection-readout{min-height:27px;margin-bottom:4px;padding:3px 8px}.collection-word-line{flex-wrap:nowrap;gap:8px}.collection-caption{flex-basis:auto;font-size:7px}
  #collectionWord{font-size:20px}#collectionWord.is-empty{font-size:10px}.collection-status{max-width:none;font-size:9px}
  .collection-board .tray-main{grid-template-columns:minmax(0,1fr) 135px;gap:12px}.collection-board .tray{grid-template-columns:repeat(10,minmax(0,1fr));gap:4px}
  .collection-board .tile{height:48px}.collection-board .tile-letter{font-size:24px}.collection-board .tile-order{font-size:8px;left:4px;top:4px}.collection-board .tile-value{font-size:8px;right:4px;bottom:3px}
  .collection-board .tray-actions{display:flex;flex-direction:column;gap:0}.collection-board .tray-actions .button{min-height:28px;padding:5px;font-size:10px}.collection-board .tray-actions .text-button{min-height:18px;padding:2px;font-size:9px;border:0;background:none;line-height:1.3}
  .collection-board .tray-footer{font-size:8px;margin-top:4px;flex-wrap:nowrap}
}
@media(prefers-reduced-motion:reduce){.tile.just-collected{animation:none}}

/* First-flight teaching and explicit live word guidance. */
.practice-launch{margin-top:24px}.practice-intro{font-size:12px;color:#c6b9d8;margin:10px 0 0;max-width:390px}
.practice-dialog{width:min(790px,calc(100vw - 24px));max-height:calc(100dvh - 24px);padding:25px;overflow-y:auto}
.practice-dialog h2{font-size:25px;margin:12px 32px 14px 0}.practice-dialog .eyebrow{font-size:9px}
.practice-instructions{padding:12px 15px;background:#0e2031;border-left:3px solid #00f3ff;border-radius:5px;min-height:82px}
.practice-instructions strong{font:700 12px ui-monospace,monospace;color:#b6ff00}.practice-instructions p{font-size:13px;line-height:1.5;margin:6px 0 0;color:#e8f7ff}
.practice-controls{font-size:11px;color:#c7bdd9;margin:10px 0}.practice-stage{position:relative;border:1px solid #5e3d79;border-radius:9px;overflow:hidden}
#practiceCanvas{display:block;width:100%;height:clamp(200px,37vh,320px);touch-action:none}
.practice-tray{border:1px solid #00f3ff66;border-radius:7px;background:#091523;padding:12px;margin:12px 0;text-align:center;font:800 20px ui-monospace,monospace;color:#d7ff8c;white-space:pre-wrap}
.practice-actions{display:flex;gap:10px}.practice-actions .button{flex:1}.practice-exit{display:flex;justify-content:flex-end;margin-top:8px}
.practice-result{color:#b6ff00;font-size:12px;margin:10px 0 0}.practice-result:empty{display:none}
.practice-stage .practice-stick{position:absolute;width:68px;height:68px;bottom:12px;top:auto;touch-action:none}
.practice-stage .practice-stick.left{left:12px}.practice-stage .practice-stick.right{right:12px}.practice-stage .practice-stick span{width:26px;height:26px}.practice-stage .practice-stick b{font-size:7px;bottom:-10px}
.collection-board .collection-caption{color:#a6f7ff}.collection-board .collection-status{max-width:250px;white-space:normal;line-height:1.4}
.collection-board .tray-actions .button{white-space:normal;line-height:1.3;overflow-wrap:anywhere;padding-inline:6px}
.collection-board .pickup-blocked{color:#ffbfe8;font-weight:600}
#discardButton{color:#ffbfe8;border:1px solid #67465c;border-radius:5px;padding:7px 10px;margin-bottom:8px;font-size:11px}
@media(pointer:coarse){.practice-stage .practice-stick{display:flex}}
@media(max-width:700px){.practice-dialog{padding:17px}.practice-dialog h2{font-size:20px}.practice-instructions{min-height:100px;padding:10px}.practice-instructions p{font-size:12px}.practice-tray{font-size:17px}.practice-controls{font-size:10px}.collection-board .collection-status{max-width:108px;font-size:9px}.collection-board .collection-caption{white-space:normal;line-height:1.3}.game{--dock-row:295px}}
@media(max-height:600px) and (min-width:600px){.practice-dialog{padding:16px}.practice-instructions{min-height:0}.practice-dialog h2{font-size:19px;margin-block:8px}.practice-stage .practice-stick{width:60px;height:60px}.game{--dock-row:150px}}

.practice-stage .practice-stick span{left:calc(50% - 13px);top:calc(50% - 13px)}

/* Competition polish: keep the arena and essential actions in view. */
.compact-only{display:none}
.mission-ribbon .mission-actions{display:flex;align-items:center;gap:7px;flex-shrink:0}
.mission-actions .button{min-height:44px;padding:7px 12px}
.word-burst #burstRepair{font:700 11px/1.5 ui-monospace,monospace;color:#9ff7ff;letter-spacing:.3px}
.signal-feed{position:absolute;top:12px;left:50%;transform:translateX(-50%);max-width:38%;padding:6px 10px;border:1px solid #ffdc9e70;border-radius:8px;background:#17101ee6;color:#ffe2b7;white-space:pre-line;font-size:11px;line-height:1.5;pointer-events:none;overflow-wrap:anywhere}
.signal-feed:empty{display:none}
.telemetry-dialog,.signal-dialog{max-width:520px;padding:24px;max-height:calc(100dvh - 24px)}
.telemetry-dialog h2,.signal-dialog h2{font-size:24px;margin:12px 32px 10px 0}
.dialog-live-note{font-size:11px;line-height:1.5;color:#c8b8d9}
.telemetry-objectives{display:grid;gap:14px;margin:20px 0}
.telemetry-dialog .mission-card{display:grid;grid-column:auto;grid-template-columns:1fr!important;padding:12px;border:1px solid #65467d;border-radius:8px;gap:5px!important}
.telemetry-dialog .mission-card>*{grid-column:auto!important;grid-row:auto!important;text-align:left!important}
.telemetry-dialog .mission-card strong{font-size:16px!important}
.telemetry-dialog .mission-card small{font-size:11px!important;white-space:normal;max-width:none!important}
.telemetry-dialog .mission-label{font-size:10px}
.telemetry-dialog .scoreboard{position:static;width:100%;font-size:13px}
.telemetry-dialog .score-row{font-size:12px;padding:9px 12px}
.telemetry-dialog .score-row span{max-width:none}
.telemetry-dialog h3{font-size:14px;letter-spacing:.4px}
.telemetry-preferences{display:flex;align-items:center;gap:22px;margin:14px 0}
.telemetry-preferences button{min-height:44px;min-width:44px}
.telemetry-preferences #soundButton span{display:inline}
.telemetry-dialog #resumeTelemetry{width:100%}
.signal-dialog label{font-size:12px;color:#c5e5f4}
.signal-letter-row{display:flex;align-items:center;gap:12px;margin:10px 0 18px}
.signal-letter-row select{width:85px;min-height:48px}
.signal-letter-row button{flex:1}
#sendDefendSignal{width:100%}
#signalCooldown{color:#b6ff00;margin:14px 0;font-size:12px}
.word-panel{max-height:calc(100dvh - 28px);overflow-y:auto}
@media(max-width:900px),(max-height:600px){
  body.in-game .topbar{display:none}
  .compact-only{display:inline-flex}
  .game,.game.has-defense{height:100dvh;min-height:0;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);grid-template-rows:44px 46px 58px minmax(140px,1fr) auto}
  .game.is-spectator,.game.has-defense.is-spectator{height:100dvh;min-height:0;grid-template-rows:44px 46px 58px minmax(140px,1fr)}
  .game-top{padding:0 max(10px,env(safe-area-inset-right)) 0 max(10px,env(safe-area-inset-left));gap:8px}
  .game-top .badge{font-size:8px;letter-spacing:.2px;white-space:normal;max-width:145px}
  .game-top #gameRoom{display:none}
  .game-top .leave-button{min-height:44px;padding-inline:5px}
  .clock{font-size:24px}
  .mission-ribbon{padding:0 8px;gap:4px;min-width:0}
  .mission-ribbon>div:first-child{min-width:0;flex:1}
  .mission-ribbon strong{font-size:8px;line-height:1.4;letter-spacing:0;overflow-wrap:normal}
  .mission-ribbon #missionReminder{display:none}
  .mission-ribbon .mission-actions{gap:4px}
  .mission-ribbon .button{max-width:none;min-height:44px;min-width:44px;font-size:10px;padding:6px}
  .game .mission-strip,.game.has-defense .mission-strip,.game.is-spectator .mission-strip,.game.has-defense.is-spectator .mission-strip{display:flex;justify-content:space-between;gap:10px;padding:5px 10px;min-width:0}
  .game .defense-status{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:3px 8px;flex:1;padding-left:7px}
  .game .defense-status>div:first-child{grid-column:1;grid-row:1;gap:5px}
  .game .defense-status meter{grid-column:1;grid-row:2}
  .game .defense-status>div:nth-of-type(2){grid-column:2;grid-row:1;gap:5px}
  .game .defense-status small{grid-column:2;grid-row:2;font-size:8px}
  .game .defense-status span{font-size:7px;letter-spacing:.2px}
  .game .defense-status strong{font-size:12px;white-space:nowrap}
  .game .defense-status b{font-size:9px;white-space:nowrap}
  .boost-button{min-height:44px;width:70px;flex:none;padding:5px}
  .boost-button strong{font-size:10px}.boost-button small{font-size:7px;letter-spacing:0}
  .arena-wrap{min-height:140px}
  .collection-board{padding:6px 10px;min-height:0}
  .collection-board .tray-header{min-height:20px;margin-bottom:4px;gap:4px}
  .collection-board h2{font-size:9px;letter-spacing:.4px}
  .collection-board .tray-header>div{gap:5px}
  .collection-board #trayCount{font-size:9px;padding:3px 5px}
  .collection-protection .muted{font-size:8px}
  .collection-readout{min-height:35px;margin-bottom:5px;padding:4px 6px;gap:6px}
  .collection-word-line{flex-wrap:wrap;gap:2px 6px;flex:1}
  .collection-board .collection-caption{font-size:8px;letter-spacing:0;flex-basis:100%;white-space:normal}
  #collectionWord{font-size:20px;letter-spacing:1px}#collectionWord.is-empty{font-size:10px}
  .collection-board .collection-status{font-size:9px;max-width:104px}
  .collection-board .collection-remainder{font-size:8px}
  .collection-board .tray-main{display:grid;grid-template-columns:1fr;gap:5px}
  .collection-board .tray{grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
  .collection-board .tile{height:44px;border-radius:6px}
  .collection-board .tile-letter{font-size:24px}
  .collection-board .tile-order{font-size:8px;left:4px;top:4px}
  .collection-board .tile-value{font-size:8px;right:4px;bottom:4px}
  .tile-next{font-size:7px;bottom:3px}
  .collection-board .tray-actions{display:grid;grid-template-columns:1.4fr 1fr .9fr;gap:5px}
  .collection-board .tray-actions .button,.collection-board .tray-actions .text-button{min-height:44px;font-size:10px;padding:5px;border-radius:7px;line-height:1.25}
  .collection-board .tray-actions .text-button{border:1px solid #5c456e;background:#20162d}
  .collection-board .tray-footer{font-size:9px;margin-top:4px;line-height:1.3;min-height:24px;flex-wrap:wrap}
  .collection-board #lastWord{display:none}
  .race-status,.game.is-spectator .race-status{top:9px;bottom:auto;left:10px;transform:none;width:140px;max-width:calc(100% - 120px);padding:4px 7px;gap:0 7px}
  .race-status>strong{font-size:18px}.race-status>span{font-size:7px}.race-status>small{font-size:8px}
  #minimap{width:90px;height:60px;top:9px;right:10px}
  .signal-feed{top:62px;left:10px;transform:none;max-width:calc(100% - 120px);font-size:9px;padding:4px 6px}
  .word-burst{top:34%;bottom:auto;width:270px;max-width:85%;gap:2px}
  .word-burst>span{font-size:8px}.word-burst>strong{font-size:26px}.word-burst>b{font-size:12px}.word-burst #burstRepair{font-size:9px}
  .arena-announcement,.game.is-spectator .arena-announcement{top:10px;bottom:auto;left:50%;width:calc(100% - 250px);min-width:0;max-width:300px;padding:4px;font-size:8px}
  .touch-stick{width:76px;height:76px;bottom:21px}
  .touch-stick.left{left:max(14px,env(safe-area-inset-left))}.touch-stick.right{right:max(14px,env(safe-area-inset-right))}
  .touch-stick span{left:calc(50% - 19px);top:calc(50% - 19px)}
  .touch-stick b{font-size:7px;letter-spacing:.6px;bottom:-13px}
  .arena-caption{bottom:4px;font-size:6px;letter-spacing:.5px}.rotation-hint{display:none}
  .word-panel{position:fixed;top:50%;max-width:400px}
  .phase-overlay p{font-size:10px;line-height:1.4;margin-bottom:4px}.phase-overlay strong{font-size:45px}
}
@media(max-width:500px){
  .arena-announcement,.game.is-spectator .arena-announcement{top:71px;left:auto;right:10px;transform:none;width:95px;font-size:8px}
}
@media(max-height:500px) and (min-width:600px){
  .game,.game.has-defense,.game.is-spectator,.game.has-defense.is-spectator{grid-template-columns:minmax(0,1fr) 280px;grid-template-rows:44px 46px minmax(140px,1fr)}
  .game-top{grid-column:1/-1;grid-row:1}
  .mission-ribbon{grid-column:1;grid-row:2}
  .game .mission-strip{grid-column:2;grid-row:2}
  .arena-wrap{grid-column:1;grid-row:3}
  .collection-board{grid-column:2;grid-row:3;overflow-y:auto;border-left:1px solid #00f3ff55}
  .game.is-spectator .arena-wrap{grid-column:1/-1}
  .game .defense-status{grid-template-columns:1fr}
  .game .defense-status>div:nth-of-type(2),.game .defense-status small{display:none}
  .collection-protection #shieldStatus{max-width:90px;white-space:normal;text-align:right;line-height:1.3}
}

/* Flexible tray additions retain the established neon palette and ship arena. */
.flight-essentials{padding-left:18px;margin:16px 0 0;color:#c7bed8;font-size:12px;line-height:1.7}
.flight-essentials li{margin-bottom:12px}.flight-essentials strong{color:#e7faff}
.tray-arrange-tools{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-bottom:7px}
.tray-arrange-tools .text-button{border:1px solid #5c456e;border-radius:7px;min-height:36px;padding:4px 7px;font-size:11px;background:#20162d;color:#d8cce8;line-height:1.25}
.tray-arrange-tools button[aria-pressed=true]{border-color:#00f3ff;color:#c3fbff;background:#12303d}
.collection-board .tile-select{display:grid;place-items:center;position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;color:inherit;border-radius:inherit;padding:0;cursor:grab;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.collection-board .tile-select:active{cursor:grabbing}
.collection-board .tile-order{position:absolute;pointer-events:none}
.tile-remove{position:absolute;z-index:2;top:-6px;right:-6px;width:25px;height:25px;border-radius:50%;border:1px solid #ff90d9;background:#321426;color:#ffd5ef;font-size:18px;line-height:1;padding:0;opacity:0;pointer-events:none}
.tile:hover .tile-remove,.tile:focus-within .tile-remove,.tile.show-remove .tile-remove{opacity:1;pointer-events:auto}
.collection-board .tile.swap-source{outline:2px solid #00f3ff;outline-offset:2px;background:#164557}
.collection-board .tile.low-utility{border-style:dashed;border-color:#e7b886}
.collection-board .tile.low-utility:after{content:'?';position:absolute;bottom:4px;left:5px;font:700 9px monospace;color:#ffdc9e;pointer-events:none}
.collection-board .tile.gifted.just-collected{animation:vowel-arrival .6s ease-out}
@keyframes vowel-arrival{from{box-shadow:0 0 22px #00f3ff;transform:scale(.85)}to{box-shadow:none;transform:none}}
.collection-status.valid,#wordScore.valid{color:#b6ff00;font-weight:700}
.collection-board .error{margin:4px 0 0;font-size:11px}
.stuck-nudge{font-size:11px;color:#ffdc9e;margin:5px 0 0;line-height:1.4}.stuck-nudge:empty{display:none}
.guided-tip{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:6px;padding:6px 9px;border-left:2px solid #00f3ff;background:#122332;font-size:11px;color:#c8faff;line-height:1.4}
.guided-tip button{flex:none;min-height:36px;padding:4px;color:#b6ff00;font-size:10px}
.pilot-hud{position:absolute;top:12px;left:14px;width:180px;display:grid;gap:5px;pointer-events:none}
.pilot-hud .scoreboard{position:static;width:100%}
.pilot-hud .race-status,.game.is-spectator .pilot-hud .race-status{position:static;transform:none;width:100%;max-width:none;padding:6px 9px}
.pilot-hud .race-status>strong{font-size:20px}
.word-feed{white-space:pre-line;font-size:10px;line-height:1.55;padding:5px 7px;background:#100c1dd9;border-left:2px solid #b6ff00;color:#dcfbc3;border-radius:4px;overflow-wrap:anywhere}
.word-feed:empty{display:none}
.combo-progress{grid-column:1/-1;display:flex!important;gap:7px;align-items:center;min-height:16px}
.defense-status .combo-progress strong{color:#b6ff00;font:700 11px ui-monospace,monospace;white-space:nowrap}
.combo-progress progress{appearance:none;width:100%;min-width:35px;flex:1;height:7px;border:1px solid #688335;border-radius:4px;background:#1c2b13}
.combo-progress progress::-webkit-progress-bar{background:#1c2b13;border-radius:4px}.combo-progress progress::-webkit-progress-value{background:#b6ff00;border-radius:4px}.combo-progress progress::-moz-progress-bar{background:#b6ff00;border-radius:4px}
.defense-status.impact-warning{animation:integrity-warning .45s ease-out}
@keyframes integrity-warning{0%,50%{background:#ff385938;box-shadow:0 0 12px #ff385960}100%{background:transparent;box-shadow:none}}
.legend-letter{display:inline-grid;place-items:center;width:24px;height:24px;border:1px solid #b6ff00;border-radius:50%;margin-inline:5px;font-weight:800}
.legend-letter.useful{outline:1px solid #b6ff00;outline-offset:3px;box-shadow:0 0 8px #b6ff0088}.legend-letter.dim{opacity:.6;border-style:dashed}
.game,.game.has-defense{grid-template-rows:var(--top-row) auto var(--objectives-row) minmax(180px,1fr) auto;min-height:0}
.game.is-spectator,.game.has-defense.is-spectator{grid-template-rows:var(--top-row) auto var(--objectives-row) minmax(180px,1fr)}
.collection-board{max-height:min(48dvh,calc(100dvh - 470px));overflow-y:auto;overscroll-behavior:contain}
.collection-board .word-panel{position:static;transform:none;left:auto;top:auto;width:100%;max-width:none;max-height:none;overflow:visible;border-radius:9px;padding:9px 12px;margin:0 0 9px;box-shadow:none;display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,1fr);gap:4px 12px;text-align:left}
.collection-board .word-panel .panel-title{grid-column:1/-1;margin:0;justify-content:flex-end}
.collection-board .word-panel .panel-title>div{display:none}
.collection-board .word-panel #closeWord{padding:0;width:28px;height:26px}
.collection-board .word-shield-timer{grid-column:1;grid-row:1;margin:0;align-self:center;font:700 12px ui-monospace,monospace;line-height:1.4}
.collection-board .word-letters{min-height:36px;font-size:23px;padding:4px;letter-spacing:1px;overflow-wrap:anywhere}
.collection-board .word-tools{margin:0;gap:10px;flex-wrap:wrap;font-size:11px;align-self:center}
.collection-board .word-panel .text-button{min-height:32px;padding:4px;font-size:10px}
.collection-board .word-panel #discardButton{margin:0;font-size:10px}
.collection-board .word-panel #submitButton{min-height:36px;padding:5px 10px;justify-content:center}
.collection-board .word-panel #wordMissionReward,.collection-board .word-panel>small{display:none}
.collection-board .word-panel #wordError{grid-column:1/-1;margin:0}
.best-word-hint{font-size:11px;color:#ffdc9e;align-self:center;line-height:1.3}
.reduced .defense-status.impact-warning,.reduced .tile.gifted.just-collected{animation:none}
@media(max-width:900px),(max-height:600px){
  .game,.game.has-defense{grid-template-rows:44px 46px 58px minmax(140px,1fr) auto}
  .game.is-spectator,.game.has-defense.is-spectator{grid-template-rows:44px 46px 58px minmax(140px,1fr)}
  .collection-board{max-height:calc(100dvh - 288px - env(safe-area-inset-top) - env(safe-area-inset-bottom));padding-bottom:7px}
  .tray-arrange-tools{gap:4px;margin-bottom:5px}.tray-arrange-tools .text-button{min-height:44px;padding:4px;font-size:9px}
  .pilot-hud{width:140px;max-width:calc(100% - 120px);top:8px;left:10px;gap:3px}
  .pilot-hud .race-status{padding:3px 6px}.pilot-hud .race-status>strong{font-size:17px}
  .word-feed{font-size:8px;line-height:1.4;padding:3px 5px}
  .signal-feed{top:108px;font-size:8px}
  .game .defense-status{gap:1px 8px}.game .defense-status .combo-progress{grid-column:1/-1;grid-row:3;gap:5px;display:flex;min-height:13px}
  .game .defense-status .combo-progress strong{font-size:10px}
  .combo-progress progress{height:5px}
  .collection-board .word-panel{grid-template-columns:minmax(0,1fr) minmax(0,1fr);padding:6px 8px;gap:4px 7px}
  .collection-board .word-shield-timer{font-size:10px;grid-column:1/-1;padding-right:30px}
  .collection-board .word-letters{font-size:19px;min-height:32px}
  .collection-board .word-tools{font-size:10px;gap:4px 9px}
  .collection-board .word-panel .text-button{font-size:9px;min-height:36px}
  .collection-board .word-panel #submitButton{min-height:40px;font-size:11px}
  .best-word-hint{font-size:10px}
  .guided-tip{font-size:10px;padding:4px 7px;margin-top:4px}.guided-tip button{min-height:36px;font-size:9px}
  .stuck-nudge{font-size:10px}
}
@media(pointer:coarse){.tile-remove{width:32px;height:32px;top:-7px;right:-5px}.tile:hover .tile-remove{opacity:0;pointer-events:none}.tile.show-remove .tile-remove,.tile:focus-within .tile-remove{opacity:1;pointer-events:auto}}
@media(max-height:500px) and (min-width:600px){
  .game,.game.has-defense,.game.is-spectator,.game.has-defense.is-spectator{grid-template-columns:minmax(0,1fr) 280px;grid-template-rows:44px 46px minmax(140px,1fr)}
  .collection-board{max-height:100%}.game .defense-status .combo-progress{grid-row:3}
}
@media(prefers-reduced-motion:reduce){.defense-status.impact-warning,.tile.gifted.just-collected{animation:none}}
GLYPHSTORM_46467272678C3DA6

# FILE: public/tray-controls.js
cat > 'public/tray-controls.js' <<'GLYPHSTORM_FF343BB0A9EED510'
export function moveTile(ids,from,to){
  const next=[...ids],start=next.indexOf(from),end=next.indexOf(to);if(start<0||end<0)return next;
  next.splice(start,1);next.splice(end,0,from);return next;
}
export function swapTiles(ids,a,b){
  const next=[...ids],i=next.indexOf(a),j=next.indexOf(b);if(i>=0&&j>=0)[next[i],next[j]]=[next[j],next[i]];return next;
}
export class TraySelection{
  constructor(){this.clear();this.mode='swap';}
  clear(){this.start=null;this.end=null;this.focus=null;this.first=null;}
  useAll(){this.clear();this.mode='swap';}
  range(tray){
    if(this.start===null)return null;
    const a=tray.findIndex(t=>t.id===this.start),b=tray.findIndex(t=>t.id===(this.end??this.start));
    return a<0||b<0?{start:-1,end:-1}:{start:Math.min(a,b),end:Math.max(a,b)+1};
  }
  tap(id,tray){
    this.focus=id;
    if(this.mode==='range'){
      if(this.start===null||this.end!==null){this.start=id;this.end=null;}else this.end=id;
      return null;
    }
    if(this.first===null){this.first=id;return null;}
    const first=this.first;this.first=null;if(first===id)return null;
    this.start=this.end=null;return swapTiles(tray.map(t=>t.id),first,id);
  }
  selectWord(tileIds){this.first=null;this.start=tileIds[0]??null;this.end=tileIds.at(-1)??null;this.mode='range';}
  sync(tray){
    const ids=new Set(tray.map(t=>t.id));
    if(this.focus&&!ids.has(this.focus))this.focus=null;
    if(this.first&&!ids.has(this.first))this.first=null;
    if((this.start&&!ids.has(this.start))||(this.end&&!ids.has(this.end)))this.start=this.end=null;
  }
}
export class FlightTips{
  constructor(done=false,onDone=()=>{}){this.step=done?3:0;this.onDone=onDone;}
  action(action){if(['collect','arrange','submit'][this.step]!==action)return;this.step++;if(this.step===3)this.onDone();}
  dismiss(){this.step=3;this.onDone();}
  get text(){return ['Fly into letters to collect them.','Rearrange your tiles to make a word.','Press Enter to submit and repair Earth.'][this.step]||'';}
}
GLYPHSTORM_FF343BB0A9EED510

# FILE: public/word-energy.js
cat > 'public/word-energy.js' <<'GLYPHSTORM_817E96F63F127FEC'
import {WORLD,delta,wrap} from './rules.js';
export const ENERGY_RULES=Object.freeze({travelMs:760,staggerMs:35,rippleMs:500,maxEffects:16});
export function wordRewardLabel(reward){
  if(!reward)return '';
  return (reward.hp?'EARTH +'+reward.hp+' HP':'EARTH FULL')+' · '+
    (reward.shield?'SHIELD +'+reward.shield.toFixed(1):'SHIELD AT MAX');
}
export function energyPath(event){
  const d=event.defenseReward,dx=delta(event.x,d.x,WORLD.width),dy=delta(event.y,d.y,WORLD.height);
  const angle=Math.atan2(dy,dx),x=wrap(d.x+Math.cos(angle)*d.barrierRadius,WORLD.width),y=wrap(d.y+Math.sin(angle)*d.barrierRadius,WORLD.height);
  return {x:event.x,y:event.y,dx:delta(x,event.x,WORLD.width),dy:delta(y,event.y,WORLD.height)};
}
// Decorative only: damage, repair and scoring are already committed by the server.
export class WordEnergy {
  constructor(){this.matchId=null;this.lastEvent=0;this.effects=[];}
  update(state,time){
    if(state.matchId!==this.matchId){
      this.matchId=state.matchId;this.effects=[];
      this.lastEvent=state.phase==='playing'?Math.max(0,...state.events.map(e=>e.seq)):0;
    }
    if(state.phase!=='playing'||!state.defense?.enabled){this.effects=[];return;}
    for(const event of state.events){
      if(event.seq<=this.lastEvent)continue;this.lastEvent=event.seq;
      if(event.type!=='word'||!event.defenseReward||!Number.isFinite(event.at)||state.now-event.at>1800)continue;
      this.effects.push({...event,path:energyPath(event),born:time});
    }
    this.effects=this.effects.slice(-ENERGY_RULES.maxEffects);
  }
  draw(ctx,project,scale,time,reduced=false){
    const {travelMs,staggerMs,rippleMs}=ENERGY_RULES;
    this.effects=this.effects.filter(e=>time-e.born<travelMs+(e.word.length-1)*staggerMs+rippleMs);
    for(const e of this.effects){
      const age=time-e.born,d=e.defenseReward,end=travelMs+(e.word.length-1)*staggerMs;
      ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#b6ff00';ctx.strokeStyle='#00f3ff';
      ctx.font='800 '+Math.max(14,22*scale)+'px ui-monospace,monospace';ctx.shadowColor='#00f3ff';ctx.shadowBlur=reduced?0:10;
      if(!reduced)for(let i=0;i<e.word.length;i++){
        const t=(age-i*staggerMs)/travelMs;if(t<0||t>1)continue;
        const eased=1-(1-t)**2,s=project(wrap(e.path.x+e.path.dx*eased,WORLD.width),wrap(e.path.y+e.path.dy*eased,WORLD.height));
        ctx.globalAlpha=.9;ctx.fillText(e.word[i],s.x,s.y);
      }
      if(reduced||age>=end){
        const t=reduced?0:(age-end)/rippleMs,s=project(d.x,d.y);
        ctx.globalAlpha=reduced?.5:(1-t)*.7;ctx.lineWidth=reduced?2:3;
        ctx.beginPath();ctx.arc(s.x,s.y,(d.barrierRadius+(reduced?4:t*30))*scale,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }
}
GLYPHSTORM_817E96F63F127FEC

# FILE: public/word-guide.js
cat > 'public/word-guide.js' <<'GLYPHSTORM_D348CDDA5809050C'
import { RULES } from './rules.js';

// Advice is private, server-validated and valid only for this exact tray.
export function submissionChoice(self,range=null){
  const tray=self?.tray||[],guide=self?.wordGuide;
  if(!guide||guide.trayKey!==tray.map(t=>t.id).join('|'))return {valid:false,message:'Checking your letters…'};
  const start=range?.start??0,end=typeof range==='number'?range:range?.end??tray.length;
  const entry=guide.entries.find(e=>e.start===start&&e.end===end);
  if(entry?.status==='valid')return {...entry,valid:true,tileIds:tray.slice(start,end).map(t=>t.id),keep:[...tray.slice(0,start),...tray.slice(end)].map(t=>t.letter).join('')};
  return {valid:false,message:entry?.status==='used'?'Already used this round — try another word.':
    end-start<RULES.minWord?'Not a word yet · use at least 3 letters':'Not a word yet'};
}

export function pickupExplanation(state,player,now){
  if(!player||player.role!=='player')return '';
  if(player.resetUntil>now)return 'Ship resetting — collection resumes when you return.';
  if(state.self.wordMode)return 'Review open — tap × or press Esc to resume collecting.';
  if(player.protectionUntil>now||player.shieldUntil>now)return 'Temporary protection — collect when the ship shield ends.';
  if(state.self.tray.length>=RULES.trayLimit)return 'Board full — submit a word or discard a letter.';
  return state.self.pickupNotice?.until>now&&state.self.pickupNotice.message.startsWith('Reserved')?state.self.pickupNotice.message:'';
}
GLYPHSTORM_D348CDDA5809050C

# FILE: server/dictionary.mjs
cat > 'server/dictionary.mjs' <<'GLYPHSTORM_AD3B12BBB1ACD6CE'
import { readFileSync } from 'node:fs';
import wordListPath from 'word-list';
import { Filter } from 'bad-words';
const filter = new Filter();
export const isClean = value => !filter.isProfane(value);
// Dictionary tokens are single alphabetic words; a Set avoids compiling
// hundreds of profanity regexes for every entry during server startup.
const blocked = new Set(filter.list.map(word=>word.toLowerCase()));
export const WORDS = new Set(readFileSync(wordListPath,'utf8').split(/\r?\n/)
  .filter(word => /^[a-z]{3,10}$/.test(word) && !blocked.has(word)).map(word => word.toUpperCase()));
export function cleanName(value) {
  const name = String(value ?? '').replace(/[^\p{L}\p{N} _-]/gu,'').replace(/\s+/g,' ').trim().slice(0,18);
  if (name.length < 2 || !isClean(name)) throw new Error('Choose a friendly name with 2–18 letters or numbers.');
  return name;
}
GLYPHSTORM_AD3B12BBB1ACD6CE

# FILE: server/game.mjs
cat > 'server/game.mjs' <<'GLYPHSTORM_2AF90BAAA57F6BC1'
import { randomUUID } from 'node:crypto';
import { WORLD, RULES, COLORS, TEAM_COLORS, wrap, delta, distance, scoreWord } from '../public/rules.js';
import { FLEET, findShip } from '../public/fleet.js';
import { DEFENSE, createDefenseState, sweepCircle } from '../public/defense.js';
import { inspectTray, pickupReason, suggestWord, starters } from './word-guide.mjs';
import {wordIndex,letterCounts,canMake} from './word-index.mjs';
import {drawLetter,VOWELS,replenishNearbyLetters,balanceDistantCrystals} from './letter-supply.mjs';
import { SIGNAL_RULES, SIGNAL_TYPES, visibleSignals } from '../public/signals.js';
import { POWER_UPS, POWER_RULES, POWER_INFO, createPowerUpState, comboKey, activePowerUp, remainingPowerFrames, incomingSpeedFactor } from '../public/power-ups.js';

export class GameError extends Error {}
const fail = message => { throw new GameError(message); };
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

export class GameRoom {
  constructor(code, { words = new Set(), random = Math.random, now = Date.now() } = {}) {
    this.code = code;
    this.words = words;
    this.wordIndex=wordIndex(words);this.nextSupplyAt=Infinity;
    this.simulationNow=now;
    this.random = random;
    this.players = new Map();
    this.hostId = null;
    this.phase = 'lobby';
    this.settings = { mode:'ffa', minutes:5, disruption:false, defense:true };
    this.defense=createDefenseState();this.powerUps=createPowerUpState();
    this.matchId = randomUUID();
    this.startAt = 0;
    this.endAt = 0;
    this.lastActivity = now;
    this.crystals = [];
    this.asteroids = [];
    this.letters = [];
    this.pulses = [];
    this.events = [];
    this.eventSeq = 0;
    this.signals=[];this.signalSeq=0;
    this.entitySeq = 0;
    this.snapshotSeq = 0;
    this.results = null;
    this.bounty=null;this.bountyCycle=-1;this.shower=null;this.showerCycle=-1;
  }
  active() { return [...this.players.values()].filter(p => p.role === 'player'); }
  id() { return String(++this.entitySeq); }
  randomLetter(near=null,force=null) { return drawLetter(this,near,force); }
  event(type, details = {}) {
    this.events.push({ seq:++this.eventSeq, type, ...details });
    this.events = this.events.slice(-32);
  }
  color(p) { return this.settings.mode === 'teams' ? TEAM_COLORS[p.team] : p.color; }
  addPlayer(name, now) {
    if ([...this.players.values()].some(p => p.name.toLowerCase() === name.toLowerCase()))
      fail('That pilot name is taken in this room.');
    const role = this.phase === 'lobby' && this.active().length < RULES.maxPlayers ? 'player' : 'spectator';
    if (role === 'spectator' && [...this.players.values()].filter(p => p.role === 'spectator').length >= RULES.maxSpectators)
      fail('This room is full, including spectator seats.');
    const teamCounts = [0,0];
    this.active().forEach(p => teamCounts[p.team]++);
    const occupiedShips = new Set(this.active().map(p => p.shipId));
    const defaultShip = FLEET.find(ship => !occupiedShips.has(ship.id)) || FLEET[0];
    const p = {
      id:randomUUID(), name, role, team:teamCounts[0] <= teamCounts[1] ? 0 : 1,
      shipId:defaultShip.id,
      color:COLORS.find(color=>this.active().every(p=>p.color!==color))||COLORS[0], joinedAt:now, connected:true,
      disconnectedAt:null, socketId:null, ready:false, x:0, y:0, vx:0, vy:0, angle:0,
      score:0, tray:[], history:[], used:new Set(), stability:RULES.stability,
      shieldUntil:0, cooldownUntil:0, resetUntil:0, protectionUntil:0, lastHitAt:0,
      regenAt:0, lastPulseAt:0, wordMode:false, lastDiscardAt:0,
      boostUntil:0,boostReadyAt:0,boostX:0,boostY:0,
      signalReadyAt:0,
      shuffleReadyAt:0,lastProgressAt:now,lastGiftAt:-Infinity,pendingVowel:null,analysisCache:null,rechargeCredit:false,
      input:{ x:0,y:0,angle:0,pulse:false }, inputAt:now, inputSeq:-1, requests:new Map()
    };
    this.players.set(p.id,p);
    if (!this.hostId) this.hostId = p.id;
    this.position(p);
    this.lastActivity = now;
    return p;
  }
  position(p) {
    let spot = {x:WORLD.width/2,y:WORLD.height/2};
    for (let i = 0; i < 40; i++) {
      spot = {x:80 + this.random() * (WORLD.width-160), y:80 + this.random() * (WORLD.height-160)};
      if (this.active().every(other => other.id === p.id || distance(spot,other) > 140) &&
          [...this.crystals,...this.asteroids].every(c => distance(spot,c) > c.r + 50)) break;
    }
    p.x = spot.x; p.y = spot.y; p.vx = 0; p.vy = 0;
  }
  needHost(id) { if (id !== this.hostId) fail('Only the host can change this.'); }
  needLobby() { if (this.phase !== 'lobby') fail('This action is available in the lobby.'); }
  player(id) { const p = this.players.get(id); if (!p) fail('Your seat is no longer in this room.'); return p; }
  needPlaying(p, now) {
    if (this.phase !== 'playing' || now >= this.endAt) fail('The round is not accepting actions.');
    if (p.role !== 'player') fail('Spectators can watch but cannot play this round.');
    if (p.resetUntil > now) fail('Your ship is resetting.');
  }
  disconnect(id, now) {
    const p = this.players.get(id); if (!p) return;
    this.lastActivity = now;
    p.connected = false; p.disconnectedAt = now; p.socketId = null;
    p.input = {x:0,y:0,angle:p.angle,pulse:false};
    p.boostUntil=0;
    p.ready = false;
  }
  remove(id, now) {
    const p=this.players.get(id);
    // Preserve points already earned by a departing pilot for final standings.
    if(p && p.role==='player' && ['playing','countdown','results'].includes(this.phase)){
      p.role='retired';p.connected=false;p.socketId=null;p.disconnectedAt=null;p.ready=false;
    }else this.players.delete(id);
    this.lastActivity = now;
    if (this.hostId === id) this.transferHost();
  }
  transferHost() {
    const connected = [...this.players.values()].filter(p => p.connected).sort((a,b) =>
      Number(a.role === 'spectator') - Number(b.role === 'spectator') || a.joinedAt-b.joinedAt);
    this.hostId = connected[0]?.id ?? null;
  }
  configure(id, settings) {
    this.needHost(id); this.needLobby();
    if (!['ffa','teams'].includes(settings.mode) || ![3,5,7].includes(settings.minutes) || typeof settings.disruption !== 'boolean' ||
        (settings.defense!==undefined&&typeof settings.defense!=='boolean'))
      fail('Choose one of the available room settings.');
    const changedMode = settings.mode !== this.settings.mode;
    this.settings = {mode:settings.mode, minutes:settings.minutes, disruption:settings.disruption,defense:settings.defense??this.settings.defense};
    this.defense=createDefenseState(this.settings.defense);this.powerUps=createPowerUpState();
    this.active().forEach((p,i) => { p.ready = false; if (changedMode) p.team = i%2; });
  }
  team(id, team) {
    this.needLobby();
    const p = this.player(id);
    if (p.role !== 'player' || ![0,1].includes(team)) fail('Choose Aurora or Nebula.');
    p.team = team; p.ready = false;
  }
  claimSeat(id) {
    this.needLobby();
    const p = this.player(id);
    if (p.role === 'player') return;
    if (this.active().length >= 8) fail('All 8 pilot seats are occupied.');
    const counts = [0,0]; this.active().forEach(other => counts[other.team]++);
    p.role = 'player'; p.team = counts[0] <= counts[1] ? 0 : 1;
    const usedColors = new Set(this.active().filter(other=>other.id!==id).map(other=>other.color));
    p.color = COLORS.find(c=>!usedColors.has(c)) || COLORS[0];
    p.ready = false;
  }
  chooseShip(id, shipId) {
    this.needLobby();
    const p = this.player(id);
    if (p.role !== 'player') fail('Claim a pilot seat before choosing a ship.');
    if (!findShip(shipId)) fail('Choose one of the eight available ships.');
    if (p.shipId !== shipId) { p.shipId = shipId; p.ready = false; }
  }
  start(id, now) {
    this.needHost(id); this.needLobby();
    const players = this.active();
    if (players.length < 2) fail('At least 2 pilots are needed.');
    if (!players.every(p => p.connected && p.ready)) fail('Every pilot must be connected and ready.');
    if (this.settings.mode === 'teams' && players.filter(p=>p.team===0).length !== players.filter(p=>p.team===1).length)
      fail('Teams must be equal. Switch a team or choose free-for-all.');
    this.matchId = randomUUID();
    this.phase = 'countdown'; this.startAt = now+3000;
    this.endAt = this.startAt+this.settings.minutes*60000;
    this.nextSupplyAt=this.startAt+5000;
    this.defense=createDefenseState(this.settings.defense);this.powerUps=createPowerUpState();this.defense.nextWaveAt=this.startAt+DEFENSE.firstWaveMs;
    this.results = null; this.events = []; this.crystals = []; this.asteroids = []; this.letters = []; this.pulses = [];
    this.signals=[];
    this.bounty=null;this.bountyCycle=-1;this.shower=null;this.showerCycle=-1;
    for (const p of this.players.values()) {
      p.score=0; p.tray=[]; p.history=[]; p.used.clear(); p.requests.clear();
      p.guideTarget=null;p.guideCache=null;p.pickupNotice=null;
      p.signalReadyAt=0;
      p.shuffleReadyAt=0;p.lastProgressAt=this.startAt;p.lastGiftAt=-Infinity;p.pendingVowel=null;p.analysisCache=null;p.rechargeCredit=false;
      p.stability=3; p.resetUntil=0; p.shieldUntil=0; p.cooldownUntil=0; p.wordMode=false;
      p.boostUntil=0;p.boostReadyAt=0;p.boostX=0;p.boostY=0;
      p.protectionUntil=this.startAt+2000; p.regenAt=this.startAt+4000; p.lastPulseAt=0;
      p.input={x:0,y:0,angle:p.angle,pulse:false}; p.inputSeq=-1; this.position(p);
    }
    this.replenishFields();
  }
  lobby(id, now) {
    this.needHost(id);
    if (this.phase !== 'results') fail('Finish the current round first.');
    this.phase='lobby'; this.results=null; this.pulses=[]; this.letters=[]; this.crystals=[]; this.asteroids=[];
    this.signals=[];
    this.nextSupplyAt=Infinity;
    this.bounty=null;this.shower=null;this.defense=createDefenseState(this.settings.defense);this.powerUps=createPowerUpState();
    this.lastActivity=now;
    for(const p of this.players.values())if(p.role==='retired')this.players.delete(p.id);
    for (const p of this.players.values()) {
      p.ready=false; p.wordMode=false; p.shieldUntil=0; p.score=0; p.tray=[]; p.history=[]; p.used.clear();
      p.guideTarget=null;p.guideCache=null;p.pickupNotice=null;
      p.signalReadyAt=0;
      p.shuffleReadyAt=0;p.pendingVowel=null;p.analysisCache=null;p.rechargeCredit=false;
      p.boostUntil=0;p.boostReadyAt=0;
    }
  }
  replenishFields() {
    while(this.crystals.length<RULES.crystalCount)this.spawnCrystal();
    while(this.asteroids.filter(a=>a.kind!=='meteor').length<RULES.asteroidCount)this.spawnAsteroid();
    replenishNearbyLetters(this,this.simulationNow);
  }
  spawnCrystal() {
    let c;
    for (let i=0; i<25; i++) {
      c={id:this.id(),x:this.random()*WORLD.width,y:this.random()*WORLD.height,r:24+this.random()*10,
        vx:(this.random()-.5)*24,vy:(this.random()-.5)*24,rotation:this.random()*6.28};
      if (this.active().every(p=>distance(p,c)>100) && this.crystals.every(other=>distance(c,other)>90) &&
          this.asteroids.every(other=>distance(c,other)>other.r+c.r+48) &&
          this.letters.every(tile=>distance(c,tile)>c.r+RULES.shipRadius+RULES.letterRadius)) break;
    }
    c.letter=this.randomLetter(c);this.crystals.push(c);balanceDistantCrystals(this);
  }
  spawnAsteroid(kind='ordinary',expiresAt=0) {
    let asteroid;
    const meteor=kind==='meteor';
    for(let i=0;i<40;i++){
      asteroid={id:this.id(),x:this.random()*WORLD.width,y:this.random()*WORLD.height,r:(meteor?54:44)+this.random()*10,
        vx:meteor?60+this.random()*30:(this.random()-.5)*36,vy:meteor?25+this.random()*25:(this.random()-.5)*36,
        rotation:this.random()*Math.PI*2,spin:(this.random()-.5)*.35,kind,expiresAt,
        maxHits:meteor?4:RULES.asteroidHits,hitsRemaining:meteor?4:RULES.asteroidHits,letterCount:meteor?6:RULES.asteroidLetters};
      if(this.active().every(p=>distance(p,asteroid)>asteroid.r+120) &&
          [...this.crystals,...this.asteroids].every(other=>distance(asteroid,other)>asteroid.r+other.r+48) &&
          this.letters.every(tile=>distance(asteroid,tile)>asteroid.r+RULES.shipRadius+RULES.letterRadius))break;
    }
    const roll=this.random();asteroid.rewardType=roll<.7?'letters':roll<.85?'vowel':roll<.95?'double':'shield';
    this.asteroids.push(asteroid);
  }
  openAsteroid(asteroid,pulse,now) {
    if(asteroid.opened)return;
    asteroid.opened=true;
    const letters=Array.from({length:asteroid.letterCount||RULES.asteroidLetters},()=>this.randomLetter(asteroid));
    if(!letters.some(letter=>'AEIOU'.includes(letter)))letters[0]='AEIOU'[Math.floor(this.random()*5)];
    if(asteroid.rewardType==='vowel')letters.push(this.randomLetter(asteroid,true));
    if(asteroid.rewardType==='shield'){
      const p=this.players.get(pulse.ownerId);
      if(p?.role==='player'){p.cooldownUntil=now;if(p.shieldUntil>now)p.rechargeCredit=true;
        this.event('shieldRecharge',{playerId:p.id,x:asteroid.x,y:asteroid.y,at:now});}
    }
    const obstacles=[...this.crystals,...this.asteroids].filter(body=>!body.opened);
    const released=[];
    for(let i=0;i<letters.length;i++){
      const angle=asteroid.rotation+i*Math.PI*2/letters.length;
      let spot;
      // Separate the tiles and seek clear space around nearby solid bodies.
      for(let attempt=0;attempt<16;attempt++){
        const a=angle+(attempt%4)*.24,r=asteroid.r+48+(letters.length>4?18:0)+Math.floor(attempt/4)*28;
        spot={x:wrap(asteroid.x+Math.cos(a)*r,WORLD.width),y:wrap(asteroid.y+Math.sin(a)*r,WORLD.height)};
        if(obstacles.every(body=>distance(spot,body)>body.r+RULES.shipRadius+RULES.letterRadius) &&
            released.every(tile=>distance(spot,tile)>2*(RULES.shipRadius+RULES.letterRadius)))break;
      }
      const tile={id:this.id(),letter:letters[i],...spot,ownerId:pulse.ownerId,team:pulse.team,
        priorityUntil:now+RULES.priorityMs,expiresAt:now+RULES.letterLifeMs};
      if(asteroid.rewardType==='double'&&i===0)tile.doubleScore=true;
      released.push(tile);this.letters.push(tile);
    }
    this.event('asteroidOpen',{asteroidId:asteroid.id,x:asteroid.x,y:asteroid.y,playerId:pulse.ownerId,
      color:asteroid.kind==='meteor'?'#a0e7f4':'#ffcf92',kind:asteroid.kind||'ordinary',rewardType:asteroid.rewardType||'letters',count:released.length,at:now});
  }
  updateObjectives(now) {
    if(this.phase!=='playing'||now>=this.endAt)return;
    this.asteroids=this.asteroids.filter(a=>!a.expiresAt||a.expiresAt>now);
    const first=this.startAt+RULES.showerFirstMs;
    const cycle=Math.max(0,Math.floor((now-first)/RULES.showerCycleMs)),startsAt=first+cycle*RULES.showerCycleMs;
    const endsAt=startsAt+RULES.showerDurationMs,active=now>=startsAt&&now<endsAt;
    if(active&&cycle!==this.showerCycle){
      this.showerCycle=cycle;
      for(let i=0;i<RULES.showerCount;i++)this.spawnAsteroid('meteor',endsAt);
      this.event('showerStart',{at:now});
    }else if(this.shower?.active&&!active)this.event('showerEnd',{at:now});
    this.shower={active,startsAt,endsAt,nextAt:now<first?first:startsAt+RULES.showerCycleMs};
    const bountyFirst=this.startAt+RULES.bountyFirstMs;
    const round=Math.floor((now-bountyFirst)/RULES.bountyCycleMs),bountyStart=bountyFirst+round*RULES.bountyCycleMs;
    if(round>=0&&round!==this.bountyCycle&&now<bountyStart+RULES.bountyDurationMs){
      this.bountyCycle=round;
      const field=[...this.crystals,...this.letters].filter(t=>!t.opened&&(!t.expiresAt||t.expiresAt>now)).map(t=>t.letter).join('');
      const supplies=this.active().map(p=>({p,counts:letterCounts(field+p.tray.map(t=>t.letter).join(''))}));
      const achievable=w=>supplies.some(({p,counts})=>!p.used.has(w)&&canMake(w,counts));
      const common=starters.filter(w=>w.length<=5&&this.words.has(w)&&achievable(w));
      const available=common.length?common:this.wordIndex.shortWords.filter(achievable);
      const choices=available.filter(word=>word!==this.bounty?.word);
      const pool=choices.length?choices:available;
      const word=pool[Math.floor(this.random()*pool.length)];
      this.bounty=word?{id:this.matchId+':'+round,word,bonus:RULES.bountyBonus,startsAt:bountyStart,
        expiresAt:bountyStart+RULES.bountyDurationMs,claimedBy:null,claimedName:null}:null;
      if(this.bounty)this.event('bountyStart',{word,bonus:RULES.bountyBonus,at:now});
    }
  }
  updatePowerUps(now) {
    const power=this.powerUps;
    power.powerUpTimer=remainingPowerFrames(power,now);
    if(power.currentPowerUp&&!power.powerUpTimer){
      const kind=power.currentPowerUp;
      power.currentPowerUp=null;power.startedAt=0;power.endsAt=0;
      this.event('powerUpEnd',{kind,at:now});
    }
  }
  breakCombo(p,now) {
    if(!this.defense.enabled)return;
    const key=comboKey(p,this.settings.mode);
    if(!this.powerUps.comboWords[key])return;
    this.powerUps.comboWords[key]=0;
    this.event('comboBreak',{playerId:p.id,comboKey:key,at:now});
  }
  recordCombo(p,now) {
    if(!this.defense.enabled)return;
    const key=comboKey(p,this.settings.mode),power=this.powerUps;
    power.comboWords[key]=(power.comboWords[key]||0)+1;
    if(power.comboWords[key]%POWER_RULES.milestone!==0)return;
    const kinds=Object.values(POWER_UPS),kind=kinds[Math.floor(this.random()*kinds.length)];
    this.activatePowerUp(kind,p,now);
  }
  activatePowerUp(kind,p,now) {
    if(!this.defense.enabled||this.phase!=='playing'||now>=this.endAt||!POWER_INFO[kind])return;
    const power=this.powerUps;
    // A milestone replaces the current effect; no stacking or duration multiplication.
    Object.assign(power,{currentPowerUp:kind,powerUpTimer:POWER_RULES.frames,startedAt:now,
      endsAt:now+POWER_RULES.durationMs,activatedBy:p.id,activatedName:p.name,comboKey:comboKey(p,this.settings.mode)});
    this.event('powerUpStart',{kind,playerId:p.id,name:p.name,comboKey:power.comboKey,endsAt:power.endsAt,
      x:this.defense.x,y:this.defense.y,color:POWER_INFO[kind].color,at:now});
    if(kind===POWER_UPS.EMP_BLAST)this.empBlast(now);
  }
  empBlast(now) {
    if(activePowerUp(this.powerUps,now)!==POWER_UPS.EMP_BLAST)return;
    let count=0;
    for(const letter of this.letters){
      if(!letter.incoming||letter.expiresAt<=now)continue;
      // Preserve identity and position so safe pickups never jump or duplicate.
      Object.assign(letter,{incoming:false,vx:0,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:now+RULES.letterLifeMs});
      count++;
    }
    if(count)this.event('empPulse',{x:this.defense.x,y:this.defense.y,count,color:'#00f3ff',at:now});
  }
  updateDefense(now) {
    const d=this.defense;
    if(!d.enabled||this.phase!=='playing'||now>=this.endAt||now<d.nextWaveAt)return;
    // Skip missed waves after suspension; never unleash a catch-up avalanche.
    const wave=Math.floor((now-this.startAt-DEFENSE.firstWaveMs)/DEFENSE.waveMs);
    d.wave=wave+1;d.nextWaveAt=this.startAt+DEFENSE.firstWaveMs+(wave+1)*DEFENSE.waveMs;
    const count=Math.min(3,1+Math.floor(this.active().length/3)),speed=Math.min(75,38+wave*1.5);
    for(let i=0;i<count&&this.letters.length<RULES.maxLetters&&this.letters.filter(l=>l.incoming).length<DEFENSE.maxIncoming;i++){
      const angle=-Math.PI/2+(this.random()-.5)*2.5,radius=530+this.random()*90;
      this.letters.push({id:this.id(),letter:this.randomLetter(),incoming:true,
        x:d.x+Math.cos(angle)*radius,y:d.y+Math.sin(angle)*radius,
        vx:-Math.cos(angle)*speed,vy:-Math.sin(angle)*speed,
        ownerId:null,team:null,priorityUntil:0,expiresAt:now+RULES.letterLifeMs});
    }
    if(d.wave===1)this.event('defenseStart',{at:now});
  }
  moveIncomingLetters(dt,now) {
    const paths=new Map(),d=this.defense;
    if(!d.enabled)return paths;
    for(const letter of this.letters){
      if(!letter.incoming)continue;
      const factor=incomingSpeedFactor(this.powerUps,now);
      const path={x:letter.x,y:letter.y,dx:letter.vx*dt*factor,dy:letter.vy*dt*factor,stopAt:1};
      path.breachTime=sweepCircle(delta(letter.x,d.x,WORLD.width),delta(letter.y,d.y,WORLD.height),
        path.dx,path.dy,d.barrierRadius+d.barrierThickness/2+RULES.letterRadius);
      paths.set(letter.id,path);
      letter.x=wrap(letter.x+path.dx,WORLD.width);letter.y=wrap(letter.y+path.dy,WORLD.height);
    }
    return paths;
  }
  handleBarrierCollision(letter,now) {
    const d=this.defense,index=this.letters.findIndex(l=>l.id===letter.id);
    if(!d.enabled||this.phase!=='playing'||!letter.incoming||index<0||now>=this.endAt)return false;
    this.letters.splice(index,1); // Remove before emitting/finishing; a breach can apply only once.
    const invulnerable=activePowerUp(this.powerUps,now)===POWER_UPS.INVULNERABILITY,oldHealth=d.earthHealth;
    if(!invulnerable){d.earthHealth=Math.max(0,d.earthHealth-DEFENSE.damage);d.lastImpactAt=now;d.breaches++;}
    const angle=Math.atan2(delta(letter.y,d.y,WORLD.height),delta(letter.x,d.x,WORLD.width));
    this.event(invulnerable?'barrierBlock':'barrierImpact',{x:wrap(d.x+Math.cos(angle)*d.barrierRadius,WORLD.width),
      y:wrap(d.y+Math.sin(angle)*d.barrierRadius,WORLD.height),letterId:letter.id,damage:oldHealth-d.earthHealth,earthHealth:d.earthHealth,color:invulnerable?'#bd00ff':'#ff6770',at:now});
    if(d.earthHealth<=0)this.finish(now,'earth-lost');
    return true;
  }
  movingLetterContact(start,end,letter,motion) {
    if(!motion)return this.contactTime(start,end,letter);
    const dx=delta(end.x,start.x,WORLD.width),dy=delta(end.y,start.y,WORLD.height);
    const x=delta(motion.x,start.x,WORLD.width),y=delta(motion.y,start.y,WORLD.height),stop=motion.stopAt;
    const first=sweepCircle(x,y,(motion.dx-dx)*stop,(motion.dy-dy)*stop,RULES.shipRadius+RULES.letterRadius);
    if(first!==null)return first*stop;
    if(stop>=1)return null;
    const second=sweepCircle(x+(motion.dx-dx)*stop,y+(motion.dy-dy)*stop,
      -dx*(1-stop),-dy*(1-stop),RULES.shipRadius+RULES.letterRadius);
    return second===null?null:stop+second*(1-stop);
  }
  boost(id,direction,now) {
    const p=this.player(id);this.needPlaying(p,now);
    if(!p.connected)fail('Reconnect before boosting.');
    if(p.wordMode||p.shieldUntil>now||p.protectionUntil>now)fail('Boost is available after protection or word review ends.');
    if(now<p.boostReadyAt)fail('Boost is recharging.');
    if(!direction||![direction.x,direction.y].every(Number.isFinite))fail('Invalid boost direction.');
    let x=clamp(direction.x,-1,1),y=clamp(direction.y,-1,1),length=Math.hypot(x,y);
    if(length<.15){x=Math.cos(p.angle);y=Math.sin(p.angle);length=1;}
    p.boostX=x/length;p.boostY=y/length;p.boostUntil=now+RULES.boostMs;p.boostReadyAt=now+RULES.boostCooldownMs;
    this.event('boost',{playerId:p.id,x:p.x,y:p.y,color:this.color(p),at:now});
  }
  input(id, data, now) {
    const p=this.player(id);
    if (this.phase!=='playing' || p.role!=='player' || now>=this.endAt) return;
    if (data.matchId!==this.matchId || !Number.isSafeInteger(data.seq) || data.seq<=p.inputSeq) return;
    if (![data.x,data.y,data.angle].every(Number.isFinite)) return;
    p.inputSeq=data.seq;
    const x=clamp(data.x,-1,1), y=clamp(data.y,-1,1), length=Math.max(1,Math.hypot(x,y));
    p.input={x:x/length,y:y/length,angle:wrap(data.angle,Math.PI*2),pulse:data.pulse===true};
    p.inputAt=now;
  }
  endShield(p, now) {
    if (p.shieldUntil) {
      p.cooldownUntil=Math.min(now,p.shieldUntil)+RULES.cooldownMs;
      if(p.rechargeCredit){p.cooldownUntil=now;p.rechargeCredit=false;}
      p.shieldUntil=0;
    }
  }
  wordMode(id, enter, now) {
    const p=this.player(id); this.needPlaying(p,now);
    if (!enter) { this.endShield(p,now); p.wordMode=false; return; }
    if (p.wordMode) return;
    p.wordMode=true; p.vx=0; p.vy=0; p.input.pulse=false;p.boostUntil=0;
    if (now>=p.cooldownUntil) p.shieldUntil=now+RULES.shieldMs;
  }
  signal(id,payload,now){
    const p=this.player(id);this.needPlaying(p,now);
    if(now<p.signalReadyAt)fail('Signals recharge in 5 seconds.');
    const kind=payload.kind,letter=payload.letter;
    if(!Object.values(SIGNAL_TYPES).includes(kind))fail('Choose a preset signal.');
    if(kind===SIGNAL_TYPES.NEED_LETTER&&(this.settings.mode!=='teams'||typeof letter!=='string'||!/^[A-Z]$/.test(letter)))
      fail('Choose one letter to request from your team.');
    if(kind===SIGNAL_TYPES.DEFEND_EARTH&&!this.defense.enabled)fail('Earth defense is off this round.');
    const target=kind===SIGNAL_TYPES.DEFEND_EARTH?this.defense:p;
    this.signals=this.signals.filter(s=>s.expiresAt>now);
    this.signals.push({id:++this.signalSeq,playerId:p.id,name:p.name,team:p.team,
      scope:this.settings.mode==='teams'?'team':'all',kind,letter:kind===SIGNAL_TYPES.NEED_LETTER?letter:null,
      x:target.x,y:target.y,at:now,expiresAt:now+SIGNAL_RULES.lifetimeMs});
    this.signals=this.signals.slice(-SIGNAL_RULES.maxSignals);p.signalReadyAt=now+SIGNAL_RULES.cooldownMs;
  }
  submit(id, tileIds, now) {
    const p=this.player(id); this.needPlaying(p,now);
    if(!p.wordMode)fail('Enter word review first.');
    this.endShield(p,now);
    if (!Array.isArray(tileIds) || tileIds.length<3 || tileIds.length>10 || new Set(tileIds).size!==tileIds.length)
      fail('Use 3–10 different tiles from your tray.');
    const start=p.tray.findIndex(t=>t.id===tileIds[0]),tiles=p.tray.slice(start,start+tileIds.length);
    if (tiles.length!==tileIds.length || tiles.some((tile,index)=>tile.id!==tileIds[index]))
      fail('The tray changed. Arrange tiles first, then choose one contiguous range.');
    const word=tiles.map(t=>t.letter).join('');
    if (!this.words.has(word)) {this.breakCombo(p,now);fail('That word is not in the game dictionary.');}
    if (p.used.has(word)) {this.breakCombo(p,now);fail('You already scored '+word+' this round.');}
    this.updatePowerUps(now);this.updateObjectives(now);
    const basePoints=scoreWord(word),bounty=this.bounty;
    const bonus=bounty&&bounty.word===word&&!bounty.claimedBy&&now>=bounty.startsAt&&now<bounty.expiresAt?bounty.bonus:0;
    if(bonus){bounty.claimedBy=p.id;bounty.claimedName=p.name;this.event('bountyClaim',{playerId:p.id,name:p.name,word,bonus,at:now});}
    const multiplier=tiles.some(t=>t.doubleScore)?2:1,points=basePoints*multiplier+bonus;
    let defenseReward=null;
    if(this.defense.enabled){
      const d=this.defense,oldHealth=d.earthHealth,oldThickness=d.barrierThickness;
      d.barrierThickness=Math.min(d.barrierThickness+word.length*.5,d.maxBarrierThickness);
      d.earthHealth=Math.min(DEFENSE.maxHealth,d.earthHealth+DEFENSE.repair);
      defenseReward={hp:d.earthHealth-oldHealth,shield:d.barrierThickness-oldThickness,
        earthHealth:d.earthHealth,barrierThickness:d.barrierThickness,x:d.x,y:d.y,barrierRadius:d.barrierRadius};
      this.event('repair',{playerId:p.id,word,earthHealth:d.earthHealth,barrierThickness:d.barrierThickness,at:now});
    }
    p.tray.splice(start,tileIds.length);p.lastProgressAt=now;
    p.score+=points; p.used.add(word); p.wordMode=false;
    const entry={word,points,basePoints,multiplier,bonus,defenseReward,at:now};
    p.history.push(entry);
    this.event('word',{playerId:p.id,name:p.name,word,points,basePoints,multiplier,bonus,defenseReward,x:p.x,y:p.y,color:this.color(p),at:now});
    this.recordCombo(p,now);
    this.deliverVowel(p,now);
    return entry;
  }
  discard(id, tileId, now) {
    const p=this.player(id); this.needPlaying(p,now);
    if (now-p.lastDiscardAt<1000) fail('Wait a moment before discarding another tile.');
    if (!p.tray.some(t=>t.id===tileId)) fail('That letter is no longer in your tray.');
    p.tray=p.tray.filter(t=>t.id!==tileId); p.lastDiscardAt=now;
    this.deliverVowel(p,now);
  }
  trayAdvice(p){
    const key=p.tray.map(t=>t.id+':'+t.letter+':'+Boolean(t.doubleScore)).join('|')+':'+p.used.size;
    if(p.analysisCache?.key!==key)p.analysisCache={key,value:inspectTray(p.tray,p.used,this.words)};
    return p.analysisCache.value;
  }
  arrange(id,tileIds,now){
    const p=this.player(id);this.needPlaying(p,now);
    if(!Array.isArray(tileIds)||tileIds.length!==p.tray.length||new Set(tileIds).size!==p.tray.length||
      tileIds.some(id=>!p.tray.some(t=>t.id===id)))fail('The tray changed. Try arranging again.');
    const byId=new Map(p.tray.map(t=>[t.id,t]));p.tray=tileIds.map(id=>byId.get(id));
  }
  shuffle(id,now){
    const p=this.player(id);this.needPlaying(p,now);
    if(now<p.shuffleReadyAt)fail('Shuffle recharges in 3 seconds.');
    if(p.tray.length<2)fail('Collect at least two letters to shuffle.');
    for(let i=p.tray.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[p.tray[i],p.tray[j]]=[p.tray[j],p.tray[i]];}
    p.shuffleReadyAt=now+3000;
  }
  smartDiscard(id,now){
    const p=this.player(id);this.needPlaying(p,now);
    const suggestion=this.trayAdvice(p).smartDiscard;
    if(!suggestion)fail('Collect a letter first.');this.discard(id,suggestion.tileId,now);
  }
  deliverVowel(p,now){
    if(!p.pendingVowel||p.tray.length>=RULES.trayLimit)return;
    const tile={id:this.id(),letter:p.pendingVowel,gift:true};p.tray.push(tile);p.pendingVowel=null;p.lastGiftAt=now;p.lastProgressAt=now;
    this.event('vowelGift',{playerId:p.id,letter:tile.letter,x:p.x,y:p.y,at:now});
  }
  updateStuckPlayers(now){
    for(const p of this.active()){
      if(!p.connected||p.resetUntil>now||p.wordMode||p.protectionUntil>now)continue;
      if(!p.pendingVowel&&now-p.lastProgressAt>=20000&&now-p.lastGiftAt>=45000){
        const text=p.tray.map(t=>t.letter).join('');
        // Prefer the vowel that unlocks the most dictionary words after making room.
        const candidates=p.tray.length>=RULES.trayLimit?p.tray.map((_,i)=>text.slice(0,i)+text.slice(i+1)):[text];
        const ranked=[...VOWELS].map(letter=>({letter,count:Math.max(...candidates.map(t=>this.wordIndex.find(t+letter).filter(w=>!p.used.has(w)).length))}));
        ranked.sort((a,b)=>b.count-a.count||'EAIOU'.indexOf(a.letter)-'EAIOU'.indexOf(b.letter));
        p.pendingVowel=ranked[0].letter;
      }
      this.deliverVowel(p,now);
    }
  }
  moveMagnetLetters(dt,now,paths){
    const targets=new Map();
    for(const p of this.active()){
      if(!p.connected||pickupReason(p,null,this.settings.mode,now))continue;
      const advice=this.trayAdvice(p);
      const letter=this.letters.filter(l=>!l.incoming&&!pickupReason(p,l,this.settings.mode,now)&&
        advice.usefulness[l.letter]==='useful'&&distance(p,l)>RULES.shipRadius+RULES.letterRadius&&distance(p,l)<=72)
        .sort((a,b)=>distance(p,a)-distance(p,b)||a.id.localeCompare(b.id))[0];
      if(letter&&(!targets.has(letter.id)||distance(p,letter)<distance(targets.get(letter.id),letter)))targets.set(letter.id,p);
    }
    for(const letter of this.letters){
      letter.magnetized=false;const p=targets.get(letter.id);if(!p)continue;
      const d=distance(p,letter),step=Math.min(d,42*dt),dx=delta(p.x,letter.x,WORLD.width)/d*step,dy=delta(p.y,letter.y,WORLD.height)/d*step;
      paths.set(letter.id,{x:letter.x,y:letter.y,dx,dy,stopAt:1,breachTime:null});
      letter.x=wrap(letter.x+dx,WORLD.width);letter.y=wrap(letter.y+dy,WORLD.height);letter.magnetized=true;
    }
  }
  reset(p, now) {
    const dropped=[];
    while (dropped.length<3 && p.tray.length) {
      const index=Math.floor(this.random()*p.tray.length);
      const [tile]=p.tray.splice(index,1), angle=this.random()*Math.PI*2;
      const letter={...tile,x:wrap(p.x+Math.cos(angle)*32,WORLD.width),y:wrap(p.y+Math.sin(angle)*32,WORLD.height),
        ownerId:null,team:null,priorityUntil:0,expiresAt:now+RULES.letterLifeMs};
      this.letters.push(letter); dropped.push(tile.letter);
    }
    this.letters=this.letters.slice(-RULES.maxLetters);
    this.endShield(p,now); p.wordMode=false; p.resetUntil=now+RULES.resetMs;
    p.vx=0; p.vy=0; p.input.pulse=false;p.boostUntil=0;
    this.event('reset',{playerId:p.id,x:p.x,y:p.y,dropped:dropped.length,color:this.color(p),at:now});
  }
  // Segment-circle intersection in wrapped coordinates avoids tunneling at arena seams.
  touches(pulse, target, radius, dt) {
    return this.pulseContactTime(pulse,target,radius,dt)!==null;
  }
  pulseContactTime(pulse,target,radius,dt) {
    const x=delta(target.x,pulse.oldX,WORLD.width), y=delta(target.y,pulse.oldY,WORLD.height);
    const dx=pulse.vx*dt,dy=pulse.vy*dt;
    const c=x*x+y*y-radius*radius;if(c<0)return 0;
    const a=dx*dx+dy*dy;if(!a)return null;
    const b=x*dx+y*dy,d=b*b-a*c;if(d<=0)return null;
    const t=(b-Math.sqrt(d))/a;return t>=0&&t<=1?t:null;
  }
  // First physical contact along a ship's movement, including a wrapped edge.
  contactTime(start, end, letter) {
    const dx=delta(end.x,start.x,WORLD.width),dy=delta(end.y,start.y,WORLD.height);
    const x=delta(letter.x,start.x,WORLD.width),y=delta(letter.y,start.y,WORLD.height);
    const radius=RULES.shipRadius+RULES.letterRadius;
    const c=x*x+y*y-radius*radius;
    if(c<=0)return 0;
    const a=dx*dx+dy*dy;
    if(!a)return null;
    const b=x*dx+y*dy,discriminant=b*b-a*c;
    if(discriminant<0)return null;
    const t=(b-Math.sqrt(discriminant))/a;
    return t>=0&&t<=1?t:null;
  }
  collectLetters(paths, existingIds, now, letterPaths=new Map()) {
    const contacts=[];
    for(const letter of this.letters){
      const motion=letterPaths.get(letter.id);
      if(letter.incoming&&motion?.breachTime!==null&&motion?.breachTime!==undefined)
        contacts.push({letter,time:motion.breachTime,breach:true,distance:0});
      for(const p of this.active()){
        // A letter released this tick can only be touched at the current position.
        const start=existingIds.has(letter.id)?(paths.get(p.id)||p):p;
        const contact=this.movingLetterContact(start,p,letter,motion);
        const blocked=pickupReason(p,letter,this.settings.mode,now);
        if(blocked){
          if(contact!==null)p.pickupNotice={message:blocked,until:Math.min(now+1400,letter.priorityUntil>now?letter.priorityUntil:now+1400)};
          continue;
        }
        if(contact!==null)contacts.push({p,letter,time:existingIds.has(letter.id)?contact:1,distance:distance(start,motion||letter)});
      }
    }
    contacts.sort((a,b)=>a.time-b.time||Number(Boolean(b.breach))-Number(Boolean(a.breach))||a.distance-b.distance||
      (a.p?.id||'').localeCompare(b.p?.id||'')||a.letter.id.localeCompare(b.letter.id));
    const collected=new Set();
    for(const {p,letter,breach} of contacts){
      if(this.phase!=='playing')break;
      if(collected.has(letter.id))continue;
      if(breach){this.handleBarrierCollision(letter,now);collected.add(letter.id);continue;}
      if(p.tray.length>=RULES.trayLimit)continue;
      p.tray.push({id:letter.id,letter:letter.letter,...(letter.doubleScore?{doubleScore:true}:{})});p.lastProgressAt=now;
      p.pickupNotice=null;
      collected.add(letter.id);
      this.event('pickup',{playerId:p.id,letter:letter.letter,x:letter.x,y:letter.y,color:this.color(p),at:now});
    }
    this.letters=this.letters.filter(letter=>!collected.has(letter.id));
  }
  finish(now,reason='time') {
    if (this.phase==='results') return;
    const ranking=[...this.players.values()].filter(p=>p.role==='player'||p.role==='retired').map(p=>({id:p.id,name:p.name,team:p.team,color:this.color(p),score:p.score,
      words:p.history.length,best:[...p.history].sort((a,b)=>b.points-a.points)[0]||null,history:p.history}))
      .sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
    const teams=[0,1].map(team=>({team,score:ranking.filter(p=>p.team===team).reduce((n,p)=>n+p.score,0)}));
    const best=this.settings.mode==='teams' ? Math.max(...teams.map(t=>t.score)) : ranking[0]?.score ?? 0;
    const winners=this.settings.mode==='teams' ? teams.filter(t=>t.score===best).map(t=>t.team) : ranking.filter(p=>p.score===best).map(p=>p.id);
    this.results={ranking,teams,winners:reason==='earth-lost'?[]:winners,mode:this.settings.mode,endedAt:Math.min(now,this.endAt),
      reason,defense:this.defense.enabled?{...this.defense}:null};
    this.phase='results'; this.pulses=[];
    this.powerUps.currentPowerUp=null;this.powerUps.powerUpTimer=0;this.powerUps.startedAt=0;this.powerUps.endsAt=0;
    for (const p of this.players.values()) { this.endShield(p,now); p.wordMode=false; p.vx=0;p.vy=0;p.boostUntil=0; }
    this.event('finish',{at:now});
  }
  tick(dt, now) {
    this.simulationNow=now;
    for (const p of this.players.values()) {
      if (!p.connected && p.disconnectedAt!==null && now-p.disconnectedAt>RULES.reconnectMs) this.remove(p.id,now);
    }
    const host=this.players.get(this.hostId);
    if (!host || (!host.connected && now-host.disconnectedAt>=10000)) this.transferHost();
    if (this.phase==='countdown' && now>=this.startAt) { this.phase='playing'; this.event('start',{at:now}); }
    if (this.phase!=='playing') return;
    if (now>=this.endAt) { this.finish(now); return; }
    this.updatePowerUps(now);this.updateObjectives(now);this.updateDefense(now);this.empBlast(now);
    this.updateStuckPlayers(now);
    const paths=new Map(),existingIds=new Set(this.letters.map(letter=>letter.id));
    for (const p of this.active()) {
      if (p.shieldUntil && now>=p.shieldUntil) this.endShield(p,now);
      if (p.resetUntil) {
        if (now<p.resetUntil) continue;
        p.resetUntil=0; p.stability=3; p.regenAt=now+4000; p.protectionUntil=now+RULES.protectionMs;
        this.position(p); this.event('return',{playerId:p.id,x:p.x,y:p.y,color:this.color(p),at:now});
      }
      paths.set(p.id,{x:p.x,y:p.y});
      if (now-p.inputAt>350 || !p.connected) p.input={x:0,y:0,angle:p.angle,pulse:false};
      p.angle=p.input.angle;
      if (!p.wordMode) {
        const blend=1-Math.exp(-RULES.acceleration*dt);
        if(p.boostUntil>now){p.vx=p.boostX*RULES.boostSpeed;p.vy=p.boostY*RULES.boostSpeed;}
        else {p.vx+=(p.input.x*RULES.speed-p.vx)*blend; p.vy+=(p.input.y*RULES.speed-p.vy)*blend;}
        p.x=wrap(p.x+p.vx*dt,WORLD.width); p.y=wrap(p.y+p.vy*dt,WORLD.height);
      } else { p.vx=0; p.vy=0; }
      if (p.stability<3 && now>=p.regenAt) { p.stability++; p.regenAt=now+4000; }
      if (p.input.pulse && !p.wordMode && now>=p.protectionUntil && now-p.lastPulseAt>=RULES.pulseInterval && this.pulses.length<180) {
        p.lastPulseAt=now;
        this.pulses.push({id:this.id(),ownerId:p.id,team:p.team,color:this.color(p),
          x:wrap(p.x+Math.cos(p.angle)*22,WORLD.width),y:wrap(p.y+Math.sin(p.angle)*22,WORLD.height),
          vx:Math.cos(p.angle)*RULES.pulseSpeed,vy:Math.sin(p.angle)*RULES.pulseSpeed,expiresAt:now+1250});
      }
    }
    for (const c of [...this.crystals,...this.asteroids]) {
      c.x=wrap(c.x+c.vx*dt,WORLD.width); c.y=wrap(c.y+c.vy*dt,WORLD.height);
      for (const p of this.active()) {
        if (p.resetUntil || p.wordMode) continue;
        const d=distance(p,c), min=c.r+RULES.shipRadius;
        if (d<min) {
          const a=Math.atan2(delta(p.y,c.y,WORLD.height),delta(p.x,c.x,WORLD.width));
          p.x=wrap(c.x+Math.cos(a)*(min+1),WORLD.width); p.y=wrap(c.y+Math.sin(a)*(min+1),WORLD.height);
        }
      }
    }
    this.letters=this.letters.filter(l=>l.expiresAt>now);
    const letterPaths=this.moveIncomingLetters(dt,now);
    this.moveMagnetLetters(dt,now,letterPaths);
    for (const pulse of this.pulses) {
      if(pulse.expiresAt<=now)continue;
      pulse.oldX=pulse.x; pulse.oldY=pulse.y;
      pulse.x=wrap(pulse.x+pulse.vx*dt,WORLD.width); pulse.y=wrap(pulse.y+pulse.vy*dt,WORLD.height);
      let target=null,nearest=Infinity;
      for(const body of [...this.crystals,...this.asteroids]){
        if(body.opened)continue;
        const contact=this.pulseContactTime(pulse,body,body.r+4,dt);
        if(contact!==null&&contact<nearest){target=body;nearest=contact;}
      }
      for(const letter of this.letters){
        if(!letter.incoming)continue;
        const motion=letterPaths.get(letter.id);if(!motion)continue;
        const contact=sweepCircle(delta(motion.x,pulse.oldX,WORLD.width),delta(motion.y,pulse.oldY,WORLD.height),
          motion.dx-pulse.vx*dt,motion.dy-pulse.vy*dt,RULES.letterRadius+4);
        if(contact!==null&&contact<nearest&&(motion.breachTime===null||contact<motion.breachTime)){
          target=letter;nearest=contact;
        }
      }
      if(target?.incoming){
        const motion=letterPaths.get(target.id);
        target.x=wrap(motion.x+motion.dx*nearest,WORLD.width);target.y=wrap(motion.y+motion.dy*nearest,WORLD.height);
        target.incoming=false;target.vx=0;target.vy=0;motion.stopAt=nearest;
        target.ownerId=pulse.ownerId;target.team=pulse.team;target.priorityUntil=now+RULES.priorityMs;
        target.expiresAt=now+RULES.letterLifeMs;pulse.expiresAt=0;
        this.event('intercept',{x:target.x,y:target.y,playerId:pulse.ownerId,color:'#85ff6e',at:now});
        continue;
      }
      if(target?.hitsRemaining!==undefined){
        pulse.expiresAt=0;target.hitsRemaining--;
        if(target.hitsRemaining<=0)this.openAsteroid(target,pulse,now);
        else this.event('asteroidCharge',{asteroidId:target.id,x:target.x,y:target.y,playerId:pulse.ownerId,
          color:'#ffcf92',hitsRemaining:target.hitsRemaining,at:now});
        continue;
      }
      const crystal=target;
      if (crystal) {
        crystal.opened=true; pulse.expiresAt=0;
        this.letters.push({id:this.id(),letter:crystal.letter,x:crystal.x,y:crystal.y,ownerId:pulse.ownerId,team:pulse.team,
          priorityUntil:now+RULES.priorityMs,expiresAt:now+RULES.letterLifeMs});
        this.event('open',{x:crystal.x,y:crystal.y,color:pulse.color,playerId:pulse.ownerId,at:now});
        continue;
      }
      if (this.settings.disruption) {
        const hit=this.active().find(p=>p.id!==pulse.ownerId && !p.resetUntil &&
          !(this.settings.mode==='teams' && p.team===pulse.team) && this.touches(pulse,p,RULES.shipRadius+5,dt));
        if (hit) {
          pulse.expiresAt=0;
          this.event('ripple',{playerId:hit.id,x:hit.x,y:hit.y,color:this.color(hit),at:now});
          if (hit.shieldUntil>now || hit.protectionUntil>now) continue;
          hit.stability--; hit.lastHitAt=now; hit.regenAt=now+4000;
          if (hit.stability<=0) this.reset(hit,now);
        }
      }
    }
    this.pulses=this.pulses.filter(p=>p.expiresAt>now);
    this.crystals=this.crystals.filter(c=>!c.opened);
    this.asteroids=this.asteroids.filter(a=>!a.opened);
    this.replenishFields();
    const incoming=this.letters.filter(l=>l.incoming),ordinary=this.letters.filter(l=>!l.incoming);
    this.letters=[...incoming,...ordinary.slice(-Math.max(1,RULES.maxLetters-incoming.length))];
    this.collectLetters(paths,existingIds,now,letterPaths);
  }
  publicState(now) {
    return {
      code:this.code,phase:this.phase,hostId:this.hostId,settings:this.settings,matchId:this.matchId,
      now,startAt:this.startAt,endAt:this.endAt,seq:++this.snapshotSeq,world:WORLD,results:this.results,bounty:this.bounty,shower:this.shower,defense:{...this.defense},
      powerUps:{...this.powerUps,powerUpTimer:remainingPowerFrames(this.powerUps,now),comboWords:{...this.powerUps.comboWords}},
      players:[...this.players.values()].map(p=>({
        id:p.id,name:p.name,shipId:p.shipId,role:p.role,team:p.team,color:this.color(p),connected:p.connected,ready:p.ready,
        x:p.x,y:p.y,vx:p.vx,vy:p.vy,angle:p.angle,score:p.score,tileCount:p.tray.length,wordCount:p.history.length,
        stability:p.stability,shieldUntil:p.shieldUntil,resetUntil:p.resetUntil,protectionUntil:p.protectionUntil,
        boostUntil:p.boostUntil,boostX:p.boostX,boostY:p.boostY,
        wordMode:p.wordMode,lastWord:p.history.at(-1)||null
      })),
      crystals:this.crystals.map(({id,x,y,r,letter,rotation})=>({id,x,y,r,letter,rotation})),
      asteroids:this.asteroids.map(({id,x,y,r,vx,vy,rotation,spin,hitsRemaining,maxHits,letterCount,kind,rewardType})=>({id,x,y,r,vx,vy,rotation,spin,hitsRemaining,maxHits,letterCount,kind,rewardType})),
      letters:this.letters,pulses:this.pulses.map(({id,x,y,vx,vy,color})=>({id,x,y,vx,vy,color})),events:this.events
    };
  }
  privateState(id,now=this.simulationNow) {
    const p=this.player(id);
    const wordGuide=p.role==='player'?{...this.trayAdvice(p)}:null;
    if(wordGuide){
      const key=wordGuide.trayKey+':'+p.used.size+':'+this.phase+':'+this.settings.mode+':'+p.team+':'+Math.floor(now/1000);
      if(p.guideCache?.key!==key){
        const suggestion=this.phase==='playing'&&!wordGuide.best?suggestWord(p,this,now):null;
        p.guideCache={key,suggestion};p.guideTarget=suggestion?.word||null;
      }
      wordGuide.suggestion=p.guideCache.suggestion;
      wordGuide.nudge=this.phase==='playing'&&p.score===0&&now-this.startAt>=45000?
        wordGuide.shortWord?'Try '+wordGuide.shortWord.word+' — arrange those tiles, select them and submit.':
          wordGuide.suggestion?.available?'Try '+wordGuide.suggestion.word+' — look for '+wordGuide.suggestion.next+' nearby.':'Try Smart discard; a recovery vowel helps you restart.':null;
    }
    return {id:p.id,shipId:p.shipId,ready:p.ready,tray:p.tray,history:p.history,cooldownUntil:p.cooldownUntil,wordMode:p.wordMode,
      boostUntil:p.boostUntil,boostReadyAt:p.boostReadyAt,wordGuide,pickupNotice:p.pickupNotice||null,
      shuffleReadyAt:p.shuffleReadyAt,pendingVowel:p.pendingVowel,signalReadyAt:p.signalReadyAt,signals:this.phase==='playing'?visibleSignals(this.signals,p,this.settings.mode,now):[]};
  }
}
GLYPHSTORM_2AF90BAAA57F6BC1

# FILE: server/index.mjs
cat > 'server/index.mjs' <<'GLYPHSTORM_7E88B3F3AEC82C3C'
import express from 'express';
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Server } from 'socket.io';
import { GameRoom, GameError } from './game.mjs';
import { WORDS, cleanName } from './dictionary.mjs';
import { RULES, VERSION } from '../public/rules.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function createGameServer({ words=WORDS, clock=Date.now, random=Math.random, testMode=false, autoTick=true }={}) {
  const app=express(), http=createServer(app);
  const rooms=new Map(), sessions=new Map(), connectionRates=new Map(), createRates=new Map();
  app.disable('x-powered-by');
  app.use((req,res,next)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','same-origin');
    res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; media-src 'self' blob:; object-src 'none'; frame-ancestors 'self'; base-uri 'self'");
    next();
  });
  app.get('/health',(_,res)=>res.json({status:'ok',version:VERSION,rooms:rooms.size}));
  app.get('/api/dictionary',(_,res)=>res.json({language:'English',minLength:3,maxLength:10,entries:words.size,
    policy:'Bundled word-list dictionary with an offensive-word filter. No live AI word judging. Proper names and abbreviations are not intended; dictionary coverage is imperfect.'}));
  app.use(express.static(path.join(root,'public'),{maxAge:'1h',setHeaders(res,p){if(/\.(html|js|css)$/.test(p))res.setHeader('Cache-Control','no-cache');}}));
  const io=new Server(http,{maxHttpBufferSize:8192,pingInterval:15000,pingTimeout:10000,
    // Same-origin browser deployment. Engine.IO handles the polling/WebSocket upgrade.
    allowRequest:(req,cb)=>{
      const origin=req.headers.origin;
      if (!origin) return cb(null,true);
      try { cb(null,new URL(origin).host===req.headers.host); } catch { cb(null,false); }
    }
  });
  const limited=(map,key,max,windowMs,now)=>{
    let record=map.get(key);
    if (!record || now-record.at>=windowMs) { record={at:now,n:0}; map.set(key,record); }
    record.n++; return record.n>max;
  };
  io.use((socket,next)=>{
    const ip=socket.handshake.address || 'unknown';
    if (!testMode && limited(connectionRates,ip,80,60000,clock())) return next(new Error('Too many connections. Please wait a minute.'));
    next();
  });
  function credentials(socket,room,p) {
    const token=randomBytes(32).toString('hex');
    sessions.set(token,{roomCode:room.code,playerId:p.id});
    socket.data={roomCode:room.code,playerId:p.id,token,rates:{input:[],action:[],join:[]}};
    p.socketId=socket.id;
    return {token,playerId:p.id,code:room.code,state:{...room.publicState(clock()),self:room.privateState(p.id,clock())}};
  }
  function resolve(socket) {
    const room=rooms.get(socket.data.roomCode), p=room?.players.get(socket.data.playerId);
    if (!room || !p || p.socketId!==socket.id) throw new GameError('Your room is no longer available. Join again.');
    return {room,p};
  }
  function rate(socket,name,max,windowMs=1000) {
    socket.data.rates ||= {input:[],action:[],join:[]};
    const now=clock(), values=(socket.data.rates[name] || []).filter(t=>now-t<windowMs);
    if (values.length>=max) return false;
    values.push(now); socket.data.rates[name]=values; return true;
  }
  function replyError(ack,e) {
    if (!(e instanceof GameError)) console.error('Action error:',e.message);
    if (typeof ack==='function') ack({ok:false,error:e instanceof GameError ? e.message : 'Something went wrong. Please try again.'});
  }
  io.on('connection',socket=>{
    socket.data.rates={input:[],action:[],join:[]};
    socket.on('join',(data={},ack)=>{
      try {
        if (!rate(socket,'join',6,10000)) throw new GameError('Please wait before trying to join again.');
        if (socket.data.roomCode) throw new GameError('Leave your current room first.');
        let name;
        try { name=cleanName(data.name); } catch(e) { throw new GameError(e.message); }
        let room;
        if (data.create===true) {
          const ip=socket.handshake.address || 'unknown';
          if (rooms.size>=60 || (!testMode && limited(createRates,ip,6,60000,clock())))
            throw new GameError('Room creation is busy. Please try again shortly.');
          let code;
          do { code=[...randomBytes(6)].map(n=>alphabet[n%alphabet.length]).join(''); } while(rooms.has(code));
          room=new GameRoom(code,{words,random,now:clock()});
          rooms.set(code,room);
        } else {
          const code=String(data.code||'').trim().toUpperCase();
          if (!/^[A-Z2-9]{6}$/.test(code) || !rooms.has(code)) throw new GameError('Room not found. Check the 6-character code.');
          room=rooms.get(code);
        }
        const p=room.addPlayer(name,clock()), info=credentials(socket,room,p);
        if (typeof ack==='function') ack({ok:true,...info});
      } catch(e) { replyError(ack,e); }
    });
    socket.on('resume',(data={},ack)=>{
      try {
        if (!rate(socket,'join',6,10000)) throw new GameError('Please wait before reconnecting.');
        if (socket.data.roomCode) throw new GameError('Already connected to a room.');
        const session=typeof data.token==='string' && sessions.get(data.token);
        const room=session && rooms.get(session.roomCode), p=room?.players.get(session.playerId);
        if (!p || p.role==='retired' || (!p.connected && clock()-p.disconnectedAt>RULES.reconnectMs))
          throw new GameError('Your reserved seat expired. Join the room again to watch or play the next round.');
        if (p.connected) throw new GameError('This pilot is already connected on another screen.');
        sessions.delete(data.token);
        p.connected=true;p.disconnectedAt=null;p.inputSeq=-1;
        const info=credentials(socket,room,p);
        if (!room.hostId) room.hostId=p.id;
        if (typeof ack==='function') ack({ok:true,...info});
      } catch(e) { replyError(ack,e); }
    });
    socket.on('input',data=>{
      try { if (rate(socket,'input',60) && data && typeof data==='object') { const {room,p}=resolve(socket); room.input(p.id,data,clock()); } }
      catch { /* Ignore unauthenticated/stale volatile input. */ }
    });
    socket.on('action',(data={},ack)=>{
      try {
        if (!rate(socket,'action',20)) throw new GameError('Slow down for a moment.');
        const {room,p}=resolve(socket);
        if (!data || typeof data!=='object' || typeof data.requestId!=='string' || data.requestId.length>80)
          throw new GameError('Invalid action.');
        if (p.requests.has(data.requestId)) { if(typeof ack==='function')ack(p.requests.get(data.requestId)); return; }
        if (data.matchId!==room.matchId) throw new GameError('The round changed. Please try again.');
        const payload=data.payload || {};
        let value;
        try {
          switch(data.type) {
            case 'settings': room.configure(p.id,payload); break;
            case 'ready': room.needLobby(); if(p.role!=='player')throw new GameError('Claim a pilot seat first.'); p.ready=payload.ready===true; break;
            case 'team': room.team(p.id,payload.team); break;
            case 'ship': room.chooseShip(p.id,payload.shipId); break;
            case 'claim': room.claimSeat(p.id); break;
            case 'start': room.start(p.id,clock()); break;
            case 'lobby': room.lobby(p.id,clock()); break;
            case 'wordMode': room.wordMode(p.id,payload.enter===true,clock()); break;
            case 'boost': room.boost(p.id,payload,clock()); break;
            case 'signal': room.signal(p.id,payload,clock()); break;
            case 'submit': value=room.submit(p.id,payload.tileIds,clock()); break;
            case 'discard': room.discard(p.id,payload.tileId,clock()); break;
            case 'arrange': room.arrange(p.id,payload.tileIds,clock()); break;
            case 'shuffle': room.shuffle(p.id,clock()); break;
            case 'smartDiscard': room.smartDiscard(p.id,clock()); break;
            default: throw new GameError('Unknown action.');
          }
          const result={ok:true,value,self:room.privateState(p.id,clock())};
          p.requests.set(data.requestId,result);
          if(p.requests.size>250)p.requests.delete(p.requests.keys().next().value);
          if(typeof ack==='function')ack(result);
        } catch(e) {
          if(e instanceof GameError)p.requests.set(data.requestId,{ok:false,error:e.message});
          if(p.requests.size>250)p.requests.delete(p.requests.keys().next().value);
          replyError(ack,e);
        }
      } catch(e) { replyError(ack,e); }
    });
    socket.on('leave',(_,ack)=>{
      try {
        const {room,p}=resolve(socket); room.remove(p.id,clock()); sessions.delete(socket.data.token);
        socket.data={rates:{input:[],action:[],join:[]}};
        if(typeof ack==='function')ack({ok:true});
      } catch(e) { replyError(ack,e); }
    });
    socket.on('disconnect',()=>{
      const room=rooms.get(socket.data.roomCode),p=room?.players.get(socket.data.playerId);
      if(p && p.socketId===socket.id) room.disconnect(p.id,clock());
    });
  });
  let last=clock(),snapshotAt=0,cleanAt=0;
  const tick=()=>{
    const now=clock(),dt=Math.min((now-last)/1000,.1);last=now;
    for(const room of rooms.values()) room.tick(dt,now);
    if(now-snapshotAt>=50) {
      snapshotAt=now;
      for(const room of rooms.values()) {
        const state=room.publicState(now);
        for(const p of room.players.values()) if(p.connected && p.socketId)
          io.to(p.socketId).volatile.emit('state',{...state,self:room.privateState(p.id,clock())});
      }
    }
    if(now-cleanAt>=10000) {
      cleanAt=now;
      for(const [code,room] of rooms) if(![...room.players.values()].some(p=>p.connected) && now-room.lastActivity>60000) rooms.delete(code);
      for(const [token,s] of sessions) {
        const p=rooms.get(s.roomCode)?.players.get(s.playerId);
        if(!p || p.role==='retired')sessions.delete(token);
      }
      for(const map of [connectionRates,createRates])for(const [key,r]of map)if(now-r.at>120000)map.delete(key);
    }
  };
  const interval=autoTick?setInterval(tick,1000/30):null;
  return {app,http,io,rooms,sessions,tick,
    listen:(port=0,host='127.0.0.1')=>new Promise(resolve=>http.listen(port,host,()=>resolve(http.address()))),
    close:()=>new Promise(resolve=>{clearInterval(interval);io.close(()=>resolve());})
  };
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const server=createGameServer();
  const port=Number(process.env.PORT||3000);
  server.listen(port,'0.0.0.0').then(()=>console.log('Glyphstorm v'+VERSION+' listening on port '+port+'; '+WORDS.size+' dictionary entries.'));
  const shutdown=()=>{
    server.io.emit('shutdown',{message:'The server is restarting. Please create a new room when it returns.'});
    server.close().then(()=>process.exit(0));
    setTimeout(()=>process.exit(0),5000).unref();
  };
  process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown);
}
GLYPHSTORM_7E88B3F3AEC82C3C

# FILE: server/letter-supply.mjs
cat > 'server/letter-supply.mjs' <<'GLYPHSTORM_FBDBF2F02E18BBA4'
import {WORLD,RULES,distance,wrap} from '../public/rules.js';
export const VOWELS='AEIOU';
export const TILE_FREQUENCIES=Object.freeze({A:9,B:2,C:2,D:4,E:12,F:2,G:3,H:2,I:9,J:1,K:1,L:4,M:2,N:6,O:8,P:2,Q:1,R:6,S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1});
const vowelBag=Object.entries(TILE_FREQUENCIES).filter(([l])=>VOWELS.includes(l)).map(([l,n])=>l.repeat(n)).join('');
const consonantBag=Object.entries(TILE_FREQUENCIES).filter(([l])=>!VOWELS.includes(l)).map(([l,n])=>l.repeat(n)).join('');
export function vowelShare(room){const tiles=[...room.crystals,...room.letters].filter(t=>!t.opened&&(!t.expiresAt||t.expiresAt>room.simulationNow));return {tiles,share:tiles.length?tiles.filter(t=>VOWELS.includes(t.letter)).length/tiles.length:0};}
export function drawLetter(room,near=null,force=null){
  const {tiles,share}=vowelShare(room);let chance=.375;
  const pilot=near&&room.active().filter(p=>p.connected&&distance(p,near)<600).sort((a,b)=>distance(a,near)-distance(b,near))[0];
  if(pilot){const vowels=pilot.tray.filter(t=>VOWELS.includes(t.letter)).length;chance=vowels<2?.72:vowels>4?.18:.375;}
  if(tiles.length>8)chance=share<.35?1:share>.4?0:chance;
  const vowels=force===null?room.random()<chance:force;
  const bag=vowels?vowelBag:consonantBag;return bag[Math.min(bag.length-1,Math.floor(room.random()*bag.length))];
}
export function balanceDistantCrystals(room){
  // Correct the field ratio without changing any released/collected tile or nearby target.
  const {tiles}=vowelShare(room);if(!tiles.length)return;
  let count=tiles.filter(t=>VOWELS.includes(t.letter)).length;
  const target=Math.round(tiles.length*.375);
  for(const c of room.crystals){
    if(count/tiles.length>=.35&&count/tiles.length<=.4)break;
    if(c.opened||room.active().some(p=>p.connected&&distance(p,c)<=600))continue;
    const want=count<target;if(VOWELS.includes(c.letter)===want)continue;
    c.letter=drawLetter(room,null,want);count+=want?1:-1;
  }
}
export function replenishNearbyLetters(room,now){
  if(room.phase!=='playing'||now<room.nextSupplyAt)return;
  room.nextSupplyAt=now+2000;
  const pilots=room.active().filter(p=>p.connected&&!p.resetUntil);
  room.letters=room.letters.filter(l=>!l.localSupply||pilots.some(p=>distance(p,l)<=650));
  for(const p of pilots){
    let count=room.letters.filter(l=>!l.incoming&&distance(l,p)<=600).length;
    for(let i=0;i<2&&count<4&&room.letters.length<RULES.maxLetters&&room.letters.filter(l=>l.localSupply).length<24;i++){
      let spot=null;
      for(let attempt=0;attempt<20;attempt++){
        const angle=room.random()*Math.PI*2,r=180+room.random()*300;
        const candidate={x:wrap(p.x+Math.cos(angle)*r,WORLD.width),y:wrap(p.y+Math.sin(angle)*r,WORLD.height)};
        if([...room.crystals,...room.asteroids].every(b=>distance(b,candidate)>b.r+55)&&room.letters.every(l=>distance(l,candidate)>70)){spot=candidate;break;}
      }
      if(!spot)break;
      room.letters.push({id:room.id(),letter:drawLetter(room,spot),...spot,localSupply:true,
        ownerId:null,team:null,priorityUntil:0,expiresAt:now+18000});count++;
    }
  }
  balanceDistantCrystals(room);
}
GLYPHSTORM_FBDBF2F02E18BBA4

# FILE: server/word-guide.mjs
cat > 'server/word-guide.mjs' <<'GLYPHSTORM_FE1B149A075F6242'
import { RULES, VALUES, scoreWord, distance } from '../public/rules.js';

import {wordIndex,letterCounts,canMake,wordOffer} from './word-index.mjs';

export const starters='CAT DOG SUN STAR MOON MAP CAR HAT BAT RAT CUP TOP PEN PET NET RED BED BOX FOX ANT ART SEA EAR TEA EAT ATE AIR RAIN SNOW WIND TREE LEAF ROCK DUST COMET RING GLOW FLY SKY SHIP FISH BIRD LION BEAR BOOK HOME GAME PLAY TIME FIRE LIGHT WATER STONE SPACE ORBIT'.split(' ');

// A bounded multiset index finds anagrams without trying every permutation.
export function inspectTray(tray,used,words){
  const entries=[];
  for(let start=0;start<tray.length;start++)for(let end=start+RULES.minWord;end<=tray.length;end++){
    const tiles=tray.slice(start,end),word=tiles.map(t=>t.letter).join('');
    const status=!words.has(word)?'unknown':used.has(word)?'used':'valid',multiplier=tiles.some(t=>t.doubleScore)?2:1;
    entries.push({start,end,length:end-start,word,status,points:status==='valid'?scoreWord(word)*multiplier:0,multiplier});
  }
  const text=tray.map(t=>t.letter).join(''),index=wordIndex(words),counts=letterCounts(text);
  const possible=index.find(text).filter(w=>!used.has(w)),offers=possible.map(w=>wordOffer(w,tray));
  const best=[...offers].sort((a,b)=>b.points-a.points||b.length-a.length||a.word.localeCompare(b.word))[0]||null;
  const longest=[...offers].sort((a,b)=>b.length-a.length||b.points-a.points||a.word.localeCompare(b.word))[0]||null;
  const shortWord=[...offers].sort((a,b)=>Number(!starters.includes(a.word))-Number(!starters.includes(b.word))||a.length-b.length||b.points-a.points)[0]||null;
  const useful={};
  for(const l of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){
    const after=index.find(text+l).filter(w=>!used.has(w));
    useful[l]=after.some(w=>(letterCounts(w)[l]||0)>(counts[l]||0))?'useful':
      text.length>=2&&!after.length?'dim':'neutral';
  }
  const utility=tray.map((t,i)=>{
    const remaining=text.slice(0,i)+text.slice(i+1),c=letterCounts(remaining);
    const retained=possible.filter(w=>canMake(w,c)).length;
    const usage=possible.filter(w=>(letterCounts(w)[t.letter]||0)>=(counts[t.letter]||0)).length;
    // Removing a tile never creates an anagram; rank retained words, then room for a vowel.
    const recovery=possible.length?0:Math.max(...'AEIOU'.split('').map(v=>index.find(remaining+v).filter(w=>!used.has(w)).length));
    return {id:t.id,retained,usage,recovery,rare:VALUES[t.letter],star:Boolean(t.doubleScore)};
  }).sort((a,b)=>b.retained-a.retained||b.recovery-a.recovery||Number(a.star)-Number(b.star)||a.usage-b.usage||b.rare-a.rare);
  const smart=utility[0];
  const leastUseful=smart?utility.filter(t=>t.retained===smart.retained&&t.recovery===smart.recovery&&!t.star).map(t=>t.id):[];
  return {trayKey:tray.map(t=>t.id).join('|'),entries,best,longest,shortWord,possibleCount:possible.length,
    usefulness:useful,leastUseful,smartDiscard:smart?{tileId:smart.id,retainedWords:smart.retained,
      recoveryWords:smart.recovery,reason:possible.length?'Keeps the most available words.':'Makes room for a useful vowel.'}:null};
}

export function pickupReason(player,letter,mode,now){
  if(player.resetUntil>now)return 'Ship resetting — collection resumes when you return.';
  if(player.wordMode)return 'Review open — resume flying to collect letters.';
  if(player.shieldUntil>now||player.protectionUntil>now)return 'Temporary protection — collect when the ship shield ends.';
  if(player.tray.length>=RULES.trayLimit)return 'Board full — submit a word or discard a letter.';
  if(letter?.priorityUntil>now&&letter.ownerId!==player.id&&!(mode==='teams'&&letter.team===player.team))return 'Reserved for another pilot or team — wait for the pickup ring to fade.';
  return '';
}

export function suggestWord(player,room,now){
  const text=player.tray.map(t=>t.letter).join(''),counts=letterCounts(text);
  const supply={...counts};
  for(const item of [...room.letters,...room.crystals]){
    if(item.opened||item.expiresAt<=now)continue;
    if(Number.isFinite(item.x)&&distance(item,player)>600)continue;
    if(item.priorityUntil>now&&item.ownerId!==player.id&&!(room.settings.mode==='teams'&&item.team===player.team))continue;
    supply[item.letter]=(supply[item.letter]||0)+1;
  }
  const candidates=starters.filter(w=>room.words.has(w)&&!player.used.has(w));
  const missing=w=>{const c=letterCounts(w);return Object.entries(c).reduce((n,[l,k])=>n+Math.max(0,k-(counts[l]||0)),0);};
  const possible=candidates.filter(w=>canMake(w,supply));
  let word=possible.sort((a,b)=>missing(a)-missing(b)||a.length-b.length)[0];
  if(!word){
    const partial=candidates.filter(w=>[...text].some(l=>w.includes(l))||!text.length);
    word=partial.includes(player.guideTarget)?player.guideTarget:partial.sort((a,b)=>missing(a)-missing(b)||a.length-b.length)[0];
  }
  if(!word)return null;
  const remaining={...counts};let next=null,progress=0;
  for(const l of word){if(remaining[l]>0){remaining[l]--;progress++;}else if(!next)next=l;}
  return {word,next,progress,available:next?(supply[next]||0)>(counts[next]||0):true};
}
GLYPHSTORM_FE1B149A075F6242

# FILE: server/word-index.mjs
cat > 'server/word-index.mjs' <<'GLYPHSTORM_331F5D5D7EAD151B'
import {scoreWord, RULES} from '../public/rules.js';
const indexes=new WeakMap();
export const letterCounts=text=>{const counts={};for(const letter of text)counts[letter]=(counts[letter]||0)+1;return counts;};
export const canMake=(word,counts)=>{const needed=letterCounts(word);return Object.keys(needed).every(l=>needed[l]<=(counts[l]||0));};
const signature=text=>[...text].sort().join('');
export function wordIndex(words){
  if(indexes.has(words))return indexes.get(words);
  const byLetters=new Map(),shortWords=[];
  for(const word of words){
    if(!/^[A-Z]{3,10}$/.test(word))continue;
    const key=signature(word);if(!byLetters.has(key))byLetters.set(key,[]);byLetters.get(key).push(word);
    if(word.length<=5)shortWords.push(word);
  }
  const cache=new Map();
  const index={shortWords,find(text){
    const key=signature(text);if(cache.has(key))return cache.get(key);
    const groups=Object.entries(letterCounts(key)),found=[];
    function visit(i,letters){
      if(i===groups.length){if(letters.length>=RULES.minWord)found.push(...(byLetters.get(letters)||[]));return;}
      const [letter,count]=groups[i];
      for(let n=0;n<=count&&letters.length+n<=RULES.maxWord;n++)visit(i+1,letters+letter.repeat(n));
    }
    visit(0,'');cache.set(key,found);if(cache.size>512)cache.delete(cache.keys().next().value);return found;
  }};
  indexes.set(words,index);return index;
}
export function wordTiles(word,tray){
  // Prefer a star when duplicate letters exist; one or more stars still mean x2 once.
  const remaining=[...tray].sort((a,b)=>Number(Boolean(b.doubleScore))-Number(Boolean(a.doubleScore)));
  const tiles=[];
  for(const letter of word){const i=remaining.findIndex(t=>t.letter===letter);if(i<0)return null;tiles.push(remaining.splice(i,1)[0]);}
  return tiles;
}
export function wordOffer(word,tray){
  const tiles=wordTiles(word,tray);if(!tiles)return null;
  const multiplier=tiles.some(t=>t.doubleScore)?2:1;
  return {word,length:word.length,tileIds:tiles.map(t=>t.id),points:scoreWord(word)*multiplier,multiplier};
}
GLYPHSTORM_331F5D5D7EAD151B

# FILE: test/asteroids.test.mjs
cat > 'test/asteroids.test.mjs' <<'GLYPHSTORM_2DA55DA083C148B5'
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/game.mjs';
import { RULES, WORLD, distance, wrap } from '../public/rules.js';

function setup(mode='ffa',count=2){
  let seed=76;
  const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const room=new GameRoom('ABCDEF',{random,now:1000});
  const players=Array.from({length:count},(_,i)=>room.addPlayer('Pilot '+i,1000+i));
  room.configure(players[0].id,{mode,minutes:3,disruption:false});
  players.forEach(p=>p.ready=true);room.start(players[0].id,1000);room.tick(0,4000);
  players.forEach((p,i)=>Object.assign(p,{x:100+i*300,y:100,vx:0,vy:0,protectionUntil:0}));
  room.crystals=[];room.asteroids=[];
  room.replenishFields=()=>{};
  return {room,players};
}
function asteroid(room,overrides={}){
  const body={id:room.id(),x:1200,y:800,r:48,vx:0,vy:0,rotation:0,hitsRemaining:RULES.asteroidHits,...overrides};
  room.asteroids.push(body);return body;
}
function pulse(room,p,body,now){
  room.pulses.push({id:room.id(),ownerId:p.id,team:p.team,color:p.color,
    x:wrap(body.x-80,WORLD.width),y:body.y,vx:400,vy:0,expiresAt:now+1000});
}
function hit(room,p,body,now){pulse(room,p,body,now);room.tick(.1,now);}

test('three pulse hits release four distinct, spaced letters including a vowel; only words score',()=>{
  const {room,players:[a]}=setup(),body=asteroid(room);
  // Force a consonant-only draw to exercise the guaranteed vowel.
  room.randomLetter=()=>'T';
  hit(room,a,body,7000);assert.equal(body.hitsRemaining,2);assert.equal(room.letters.length,0);
  hit(room,a,body,7200);assert.equal(body.hitsRemaining,1);assert.equal(room.letters.length,0);
  hit(room,a,body,7400);
  assert.equal(room.asteroids.length,0);assert.equal(room.letters.length,4);
  assert.equal(new Set(room.letters.map(l=>l.id)).size,4);
  assert.ok(room.letters.some(l=>'AEIOU'.includes(l.letter)));
  for(const tile of room.letters){
    assert.equal(tile.ownerId,a.id);assert.equal(tile.priorityUntil,9400);assert.equal(tile.expiresAt,37400);
    for(const other of room.letters)if(tile!==other)assert.ok(distance(tile,other)>68);
  }
  assert.equal(a.score,0);assert.equal(a.tray.length,0);
  assert.equal(room.events.filter(e=>e.type==='asteroidOpen').length,1);
});

test('the final pulse earns pickup priority shared with teammates, then all pilots can collect',()=>{
  const {room,players:[a,b,c,d]}=setup('teams',4),body=asteroid(room);
  hit(room,a,body,7000);hit(room,a,body,7200);hit(room,b,body,7400);
  assert.ok(room.letters.every(tile=>tile.ownerId===b.id&&tile.team===b.team));
  const [first,second]=room.letters;
  a.x=first.x;a.y=first.y;room.tick(0,7401);assert.equal(a.tray.length,0);
  assert.equal(d.team,b.team);d.x=second.x;d.y=second.y;
  room.tick(0,7402);assert.deepEqual(d.tray.map(t=>t.id),[second.id]);
  room.tick(0,9400);assert.deepEqual(a.tray.map(t=>t.id),[first.id]);
  assert.equal(b.score+c.score+d.score+a.score,0);
});

test('simultaneous extra hits cannot duplicate an asteroid bundle and the letter cap holds',()=>{
  const {room,players:[a,b]}=setup(),body=asteroid(room);
  room.letters=Array.from({length:99},()=>({id:room.id(),letter:'E',x:300,y:1400,ownerId:null,team:null,priorityUntil:0,expiresAt:50000}));
  const before=new Set(room.letters.map(t=>t.id));
  [a,a,b,a,b].forEach(p=>pulse(room,p,body,7000));room.tick(.1,7000);
  const released=room.letters.filter(t=>!before.has(t.id));
  assert.equal(released.length,4);assert.equal(room.letters.length,RULES.maxLetters);
  assert.ok(released.every(tile=>tile.ownerId===b.id));
  assert.equal(room.events.filter(e=>e.type==='asteroidOpen').length,1);
  room.openAsteroid(body,{ownerId:a.id,team:a.team},7100);
  assert.equal(room.letters.length,RULES.maxLetters);
});

test('pulses hit the nearest solid body across a wrapped edge regardless of entity type',()=>{
  for(const nearest of ['asteroid','crystal']){
    const {room,players:[a]}=setup();
    const body=asteroid(room,{x:nearest==='asteroid'?20:100});
    const crystal={id:room.id(),x:nearest==='crystal'?20:120,y:800,r:24,vx:0,vy:0,letter:'E',rotation:0};
    room.crystals.push(crystal);
    room.pulses.push({id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:2370,y:800,vx:2000,vy:0,expiresAt:8000});
    room.tick(.1,7000);
    if(nearest==='asteroid'){assert.equal(body.hitsRemaining,2);assert.equal(crystal.opened,undefined);}
    else {assert.equal(crystal.opened,true);assert.equal(body.hitsRemaining,3);}
  }
});

test('asteroid letters remain physical pickups in the chosen flight order and obey tray capacity',()=>{
  const {room,players:[a]}=setup(),body=asteroid(room,{x:10,y:10});
  [7000,7200,7400].forEach(now=>hit(room,a,body,now));
  const tiles=[...room.letters],order=[2,0,3,1];
  assert.ok(tiles.every(t=>t.x>=0&&t.x<WORLD.width&&t.y>=0&&t.y<WORLD.height));
  for(const index of order){a.x=tiles[index].x;a.y=tiles[index].y;room.tick(0,7500);}
  assert.deepEqual(a.tray.map(t=>t.id),order.map(i=>tiles[i].id));
  const next=asteroid(room,{x:1800,y:1000});[8000,8200,8400].forEach(now=>hit(room,a,next,now));
  a.tray=Array.from({length:10},(_,i)=>({id:'full-'+i,letter:'A'}));
  a.x=room.letters[0].x;a.y=room.letters[0].y;room.tick(0,8500);
  assert.equal(a.tray.length,10);assert.equal(room.letters.length,4);
});

test('asteroids nudge ships without resetting them and cannot release letters after the deadline',()=>{
  const {room,players:[a]}=setup(),body=asteroid(room);
  a.x=body.x;a.y=body.y;a.score=17;room.tick(0,7000);
  assert.ok(distance(a,body)>body.r+RULES.shipRadius);
  assert.equal(a.stability,3);assert.equal(a.resetUntil,0);assert.equal(a.score,17);
  [a,a,a].forEach(p=>pulse(room,p,body,room.endAt));room.tick(.1,room.endAt);
  assert.equal(room.phase,'results');assert.equal(body.hitsRemaining,3);assert.equal(room.letters.length,0);
});

test('asteroid population replenishes, wraps, and starts fresh on rematch',()=>{
  const {room,players:[a]}=setup();
  room.replenishFields=GameRoom.prototype.replenishFields;
  room.tick(0,7000);assert.equal(room.asteroids.length,RULES.asteroidCount);
  const body=room.asteroids[0];body.x=WORLD.width-1;body.y=WORLD.height-1;body.vx=20;body.vy=20;
  room.tick(.1,7100);assert.ok(body.x<2&&body.y<2);
  body.hitsRemaining=1;
  const publicBody=room.publicState(7100).asteroids.find(p=>p.id===body.id);
  assert.equal(publicBody.hitsRemaining,1);assert.equal(publicBody.vx,20);
  room.openAsteroid(body,{ownerId:a.id,team:a.team},7200);room.tick(0,7200);
  assert.equal(room.asteroids.length,RULES.asteroidCount);assert.ok(!room.asteroids.includes(body));
  const ids=new Set(room.asteroids.map(p=>p.id));
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);assert.equal(room.asteroids.length,0);
  room.active().forEach(p=>p.ready=true);
  room.start(a.id,room.endAt+1000);
  assert.equal(room.asteroids.length,RULES.asteroidCount);
  assert.ok(room.asteroids.every(p=>p.hitsRemaining===3&&!ids.has(p.id)));
});
GLYPHSTORM_2DA55DA083C148B5

# FILE: test/defense.test.mjs
cat > 'test/defense.test.mjs' <<'GLYPHSTORM_79A5F9CB3469B228'
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/game.mjs';
import { DEFENSE, sweepCircle, syncDefenseState, earthHealth, barrierThickness, maxBarrierThickness } from '../public/defense.js';
import { RULES } from '../public/rules.js';
import { Arena, MAX_PARTICLES } from '../public/arena.js';
import { drawEarth } from '../public/planet.js';

function setup(enabled=true){
  let seed=515;
  const room=new GameRoom('DEFEND',{words:new Set(['CAT','STAR','PLANET','DOG']),random:()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296)});
  const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1001);
  room.configure(a.id,{mode:'ffa',minutes:3,disruption:false,defense:enabled});a.ready=b.ready=true;
  room.start(a.id,1000);room.tick(0,4000);
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  for(const [i,p] of [a,b].entries())Object.assign(p,{x:100+i*300,y:100,protectionUntil:0});
  return {room,a,b};
}
const boundary=room=>room.defense.barrierRadius+room.defense.barrierThickness/2+RULES.letterRadius;
function incoming(room,offset=0,overrides={}){
  const letter={id:room.id(),letter:'A',incoming:true,x:DEFENSE.x+boundary(room)+offset,y:DEFENSE.y,
    vx:-100,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:50000,...overrides};
  room.letters.push(letter);return letter;
}
function spell(room,p,word,now=7000){
  p.tray=[...word].map(letter=>({id:room.id(),letter}));room.wordMode(p.id,true,now);
  return room.submit(p.id,p.tray.map(l=>l.id),now);
}

test('defense initializes per room, snapshots sync named globals, and only the host can toggle in lobby',()=>{
  const {room,a,b}=setup(),other=setup().room;
  assert.equal(room.defense.earthHealth,100);assert.equal(room.defense.barrierThickness,5);assert.equal(room.defense.maxBarrierThickness,25);
  room.defense.earthHealth=40;syncDefenseState(room.publicState(7000).defense);
  assert.equal(earthHealth,40);assert.equal(barrierThickness,5);assert.equal(maxBarrierThickness,25);assert.equal(other.defense.earthHealth,100);
  assert.throws(()=>room.configure(a.id,{mode:'ffa',minutes:3,disruption:false,defense:false}),/lobby/);
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);
  assert.throws(()=>room.configure(b.id,{mode:'ffa',minutes:3,disruption:false,defense:false}),/host/);
  assert.throws(()=>room.configure(a.id,{mode:'ffa',minutes:3,disruption:false,defense:'false'}),/settings/);
  room.configure(a.id,{mode:'ffa',minutes:3,disruption:false,defense:false});assert.equal(room.defense.enabled,false);
});

test('swept breaches handle boundary, inside, tangent, and fast crossings, applying damage once',()=>{
  for(const offset of [0,-20,10]){
    const {room}=setup(),letter=incoming(room,offset,{vx:-10000});
    room.tick(.1,7000);assert.equal(room.defense.earthHealth,95);assert.equal(room.letters.length,0);
    assert.equal(room.handleBarrierCollision(letter,7001),false);assert.equal(room.defense.earthHealth,95);
    assert.equal(room.events.filter(e=>e.type==='barrierImpact').length,1);
  }
  assert.equal(sweepCircle(-10,5,20,0,5),.5);assert.equal(sweepCircle(-10,6,20,0,5),null);
});

test('letter contacts before a breach collect in physical order; contacts after a breach cannot rescue it',()=>{
  const {room,a}=setup();a.x=DEFENSE.x+boundary(room)+35;a.y=DEFENSE.y;
  const first=incoming(room,80,{letter:'C'}),second=incoming(room,85,{letter:'A'}),third=incoming(room,90,{letter:'T'});
  room.letters=[third,second,first];room.tick(.6,7000);
  assert.equal(a.tray.map(l=>l.letter).join(''),'CAT');assert.equal(room.defense.earthHealth,100);assert.equal(room.letters.length,0);
  a.tray=[];a.x=DEFENSE.x+boundary(room)-80;incoming(room,30,{vx:-1000});room.tick(.2,7100);
  assert.equal(a.tray.length,0);assert.equal(room.defense.earthHealth,95);
});

test('full trays and word review cannot prevent a breach; ordinary released letters remain harmless',()=>{
  for(const review of [false,true]){
    const {room,a}=setup();a.x=DEFENSE.x+boundary(room);a.y=DEFENSE.y;
    if(review)room.wordMode(a.id,true,7000);else a.tray=Array.from({length:10},()=>({id:room.id(),letter:'A'}));
    incoming(room);const harmless=incoming(room,-100,{incoming:false,vx:0});
    room.tick(0,7000);assert.equal(room.defense.earthHealth,95);assert.deepEqual(room.letters,[harmless]);
  }
});

test('existing pulses stop incoming letters before impact, retain pickup priority, and grant no score',()=>{
  const {room,a,b}=setup();const letter=incoming(room,100);
  room.pulses=[{id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:letter.x+50,y:letter.y,vx:-730,vy:0,expiresAt:8000}];
  room.tick(.1,7000);assert.equal(letter.incoming,false);assert.equal(letter.vx,0);assert.equal(letter.ownerId,a.id);
  assert.equal(letter.priorityUntil,9000);assert.equal(room.defense.earthHealth,100);assert.equal(a.score,0);
  b.x=letter.x;b.y=letter.y;room.tick(0,7100);assert.equal(b.tray.length,0);
  room.tick(0,9000);assert.equal(b.tray.length,1);assert.equal(room.letters.length,0);
});

test('late pulse contacts cannot cancel an earlier breach and nearer rocks still block pulses',()=>{
  const {room,a}=setup();let letter=incoming(room,1);
  room.pulses=[{id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:letter.x+60,y:letter.y,vx:-730,vy:0,expiresAt:8000}];
  room.tick(.1,7000);assert.equal(room.defense.earthHealth,95);assert.equal(room.letters.length,0);
  letter=incoming(room,150,{vx:0});
  room.asteroids=[{id:room.id(),x:letter.x+60,y:letter.y,r:24,vx:0,vy:0,hitsRemaining:3}];
  room.pulses=[{id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:letter.x+140,y:letter.y,vx:-1000,vy:0,expiresAt:9000}];
  room.tick(.2,7100);assert.equal(letter.incoming,true);assert.equal(room.asteroids[0].hitsRemaining,2);
});

test('only successful words grow and repair, caps hold, trailing tiles and scoring remain intact',()=>{
  const {room,a,b}=setup();room.defense.earthHealth=95;
  assert.throws(()=>spell(room,a,'ZZZ'),/dictionary/);assert.equal(room.defense.earthHealth,95);assert.equal(room.defense.barrierThickness,5);
  a.tray=[...'CATS'].map(letter=>({id:room.id(),letter}));room.wordMode(a.id,true,7000);
  const entry=room.submit(a.id,a.tray.slice(0,3).map(l=>l.id),7000);
  assert.equal(entry.points,5);assert.equal(a.tray[0].letter,'S');assert.equal(room.defense.earthHealth,97);assert.equal(room.defense.barrierThickness,6.5);
  assert.throws(()=>spell(room,a,'CAT',7100),/already scored/);assert.equal(room.defense.earthHealth,97);
  room.defense.earthHealth=99;room.defense.barrierThickness=24.5;spell(room,b,'PLANET',7200);
  assert.equal(room.defense.earthHealth,100);assert.equal(room.defense.barrierThickness,25);
});

test('fatal damage ends the whole round exactly once, preserves scores, and rematch resets defense',()=>{
  const {room,a}=setup();room.defense.earthHealth=5;a.score=37;
  incoming(room);incoming(room);room.tick(0,7000);
  assert.equal(room.phase,'results');assert.equal(room.defense.earthHealth,0);assert.equal(room.results.reason,'earth-lost');
  assert.deepEqual(room.results.winners,[]);assert.equal(room.results.ranking[0].score,37);assert.equal(room.results.endedAt,7000);
  room.tick(.1,7100);room.finish(7100);assert.equal(room.events.filter(e=>e.type==='finish').length,1);
  assert.throws(()=>spell(room,a,'CAT',7200),/not accepting/);assert.equal(room.defense.earthHealth,0);
  room.lobby(a.id,8000);room.active().forEach(p=>p.ready=true);room.start(a.id,9000);
  assert.equal(room.defense.earthHealth,100);assert.equal(room.defense.barrierThickness,5);assert.equal(room.defense.wave,0);assert.equal(room.letters.length,0);
});

test('wave timing is bounded without catch-up spawns; disabled defense keeps the classic match',()=>{
  const {room}=setup(),first=room.startAt+DEFENSE.firstWaveMs;
  room.tick(0,first-1);assert.equal(room.letters.length,0);
  room.tick(0,first);assert.equal(room.letters.length,1);assert.equal(room.defense.wave,1);
  room.tick(0,first+1);assert.equal(room.letters.length,1);
  room.tick(0,first+60000);assert.equal(room.letters.length,1); // Old tile expired; only current wave is spawned.
  assert.equal(room.defense.wave,8);assert.ok(room.defense.nextWaveAt>first+60000);
  room.tick(0,room.endAt);assert.equal(room.results.reason,'time');assert.equal(room.results.winners.length,2);
  const classic=setup(false).room;classic.tick(0,first+60000);
  assert.equal(classic.letters.length,0);assert.equal(classic.defense.earthHealth,100);
});

test('shield ripples are ten cyan particles over 300ms, normal bursts contrast, and effects stay bounded',()=>{
  const arena=Object.create(Arena.prototype);Object.assign(arena,{particles:[],reduced:false});
  arena.createShieldRipple(100,100,0);assert.equal(arena.particles.length,10);
  assert.ok(arena.particles.every(p=>p.color==='#00f3ff'&&p.life===300&&p.ripple));
  arena.drawParticles({save(){},restore(){}},300);assert.equal(arena.particles.length,0);
  arena.burst({type:'word',x:100,y:100,seq:1},0);assert.deepEqual(new Set(arena.particles.map(p=>p.color)),new Set(['#ff2bd6','#b6ff00','#00f3ff']));
  assert.ok(arena.particles.every(p=>Math.hypot(p.vx,p.vy)>=200));
  for(let i=0;i<100;i++)arena.createShieldRipple(1,1,1);assert.equal(arena.particles.length,MAX_PARTICLES);
  arena.reduced=true;arena.particles=[];arena.createShieldRipple(1,1);assert.equal(arena.particles.length,0);
});

test('Earth uses the authoritative shield radius and thickness with the requested neon aura',()=>{
  const seen=[];const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},
    {get:(o,k)=>k in o?o[k]:(...args)=>seen.push([k,...args]),set:(o,k,v)=>{seen.push([k,v]);o[k]=v;return true;}});
  const d=setup().room.defense;d.barrierThickness=17;
  drawEarth(ctx,300,250,.7,d,null);
  assert.ok(seen.some(([k,v])=>k==='lineWidth'&&v===17));assert.ok(seen.some(([k,v])=>k==='shadowBlur'&&v===15));
  assert.ok(seen.some(([k,v])=>k==='shadowColor'&&v==='#00f3ff'));assert.ok(seen.some(([k,x,y,r])=>k==='arc'&&r===d.barrierRadius));
});
GLYPHSTORM_79A5F9CB3469B228

# FILE: test/dynamics.test.mjs
cat > 'test/dynamics.test.mjs' <<'GLYPHSTORM_23CD334A37D715ED'
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/game.mjs';
import { RULES, WORLD, scoreWord } from '../public/rules.js';
import { missionStatus } from '../public/objectives.js';
import { MatchFeedback } from '../public/match-feedback.js';
import { AsteroidSprites, drawAsteroid } from '../public/asteroids.js';

function setup(words=['STAR','MOON'],mode='ffa'){
  let seed=101;
  const room=new GameRoom('ABCDEF',{words:new Set(words),random:()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296),now:1000});
  const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1001);
  room.configure(a.id,{mode,minutes:3,disruption:false,defense:false}); // Test arcade objectives independently of defense waves.
  a.ready=b.ready=true;
  room.start(a.id,1000);room.tick(0,4000);room.nextSupplyAt=Infinity;
  Object.assign(a,{x:100,y:100,protectionUntil:0});Object.assign(b,{x:2100,y:1300,protectionUntil:0});
  return {room,a,b};
}
function word(room,p,text,now){
  p.tray=[...text].map(letter=>({id:room.id(),letter}));
  room.wordMode(p.id,true,now);return room.submit(p.id,p.tray.map(t=>t.id),now);
}

test('boost normalizes direction, obeys server speed and cooldown, and preserves ordered pickups',()=>{
  const {room,a}=setup();room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  a.x=WORLD.width-40;a.y=400;
  room.letters=[['C',WORLD.width-25],['A',WORLD.width-5],['T',15]].map(([letter,x])=>({id:room.id(),letter,x,y:400,ownerId:null,team:null,priorityUntil:0,expiresAt:50000}));
  room.boost(a.id,{x:999,y:0,speed:99999,boostUntil:99999},7000);
  assert.equal(a.boostUntil,7550);assert.equal(a.boostReadyAt,13000);
  room.tick(.1,7100);assert.equal(a.vx,RULES.boostSpeed);assert.equal(a.x,22);
  assert.equal(a.tray.map(t=>t.letter).join(''),'CAT');assert.equal(a.score,0);assert.equal(a.protectionUntil,0);
  assert.throws(()=>room.boost(a.id,{x:1,y:0},12999),/recharging/);
  room.boost(a.id,{x:1,y:1},13000);assert.ok(Math.abs(Math.hypot(a.boostX,a.boostY)-1)<1e-9);
  room.tick(.1,13100);assert.ok(Math.hypot(a.vx,a.vy)<=RULES.boostSpeed+.001);
});

test('boost rejects invalid roles, malformed input and protected states; zero movement uses heading',()=>{
  const {room,a}=setup();
  const watcher=room.addPlayer('Watcher',7000);
  assert.throws(()=>room.boost(watcher.id,{x:1,y:0},7000),/Spectators/);
  for(const input of [null,{}, {x:NaN,y:0},{x:Infinity,y:0},{x:'1',y:0}])assert.throws(()=>room.boost(a.id,input,7000),/Invalid/);
  assert.equal(a.boostReadyAt,0);
  a.protectionUntil=8000;assert.throws(()=>room.boost(a.id,{x:1,y:0},7000),/protection/);a.protectionUntil=0;
  room.wordMode(a.id,true,7000);assert.throws(()=>room.boost(a.id,{x:1,y:0},7000),/review/);
  room.wordMode(a.id,false,7000);a.angle=Math.PI/2;room.boost(a.id,{x:0,y:0},7100);
  assert.ok(Math.abs(a.boostX)<1e-9);assert.equal(a.boostY,1);
  room.finish(room.endAt);assert.throws(()=>room.boost(a.id,{x:1,y:0},room.endAt),/not accepting/);
});

test('review, reset and disconnect cancel a boost while cooldown survives until the next round',()=>{
  const {room,a}=setup();
  room.boost(a.id,{x:1,y:0},7000);room.wordMode(a.id,true,7100);assert.equal(a.boostUntil,0);
  room.wordMode(a.id,false,7200);assert.equal(a.boostReadyAt,13000);
  room.boost(a.id,{x:1,y:0},13000);room.disconnect(a.id,13100);
  assert.equal(a.boostUntil,0);assert.equal(room.privateState(a.id).boostReadyAt,19000);
  a.connected=true;a.disconnectedAt=null;room.boost(a.id,{x:1,y:0},19000);room.reset(a,19100);
  assert.equal(a.boostUntil,0);assert.throws(()=>room.boost(a.id,{x:1,y:0},19200),/resetting/);
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);room.active().forEach(p=>p.ready=true);
  room.start(a.id,room.endAt+1000);assert.equal(a.boostUntil,0);assert.equal(a.boostReadyAt,0);
});

test('meteor showers have fixed windows, bounded extra rocks and no replay of skipped waves',()=>{
  const {room}=setup(),start=room.startAt+RULES.showerFirstMs;
  room.tick(0,start-1);assert.equal(room.asteroids.filter(a=>a.kind==='meteor').length,0);
  room.tick(0,start);assert.equal(room.shower.active,true);
  assert.equal(room.asteroids.length,RULES.asteroidCount+RULES.showerCount);
  const meteors=room.asteroids.filter(a=>a.kind==='meteor');
  assert.ok(meteors.every(a=>a.maxHits===4&&a.letterCount===6&&a.expiresAt===start+RULES.showerDurationMs));
  room.tick(0,start+1);assert.equal(room.asteroids.length,12);
  room.tick(0,start+RULES.showerDurationMs);assert.equal(room.shower.active,false);assert.equal(room.asteroids.length,8);
  room.tick(0,start+RULES.showerCycleMs*2+1000);
  assert.equal(room.asteroids.length,12);assert.equal(room.events.filter(e=>e.type==='showerStart').length,2);
  room.tick(0,room.endAt);assert.equal(room.phase,'results');
  const count=room.asteroids.length;room.tick(0,room.endAt+60000);assert.equal(room.asteroids.length,count);
});

test('four hits open a meteor into six letters; released letters outlive the shower',()=>{
  const {room,a}=setup(),start=room.startAt+RULES.showerFirstMs;
  room.tick(0,start);const meteor=room.asteroids.find(a=>a.kind==='meteor');
  Object.assign(meteor,{x:1200,y:800,vx:0,vy:0,rewardType:'letters'});room.asteroids=[meteor];room.crystals=[];room.replenishFields=()=>{};
  for(let hit=1;hit<=4;hit++){
    const now=start+hit*200;
    room.pulses.push({id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:1100,y:800,vx:1000,vy:0,expiresAt:now+1000});
    room.tick(.1,now);assert.equal(room.letters.length,hit<4?0:6);
  }
  assert.equal(new Set(room.letters.map(l=>l.id)).size,6);assert.ok(room.letters.some(l=>'AEIOU'.includes(l.letter)));
  assert.equal(a.score,0);room.tick(0,start+RULES.showerDurationMs);assert.equal(room.letters.length,6);
});

test('a bounty awards one bonus globally and team totals retain it as word points',()=>{
  const {room,a,b}=setup(['STAR'],'teams'),start=room.startAt+RULES.bountyFirstMs;
  b.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
  room.tick(0,start-1);assert.equal(room.bounty,null);room.tick(0,start);assert.equal(room.bounty.word,'STAR');
  const first=word(room,a,'STAR',start+100),second=word(room,b,'STAR',start+100);
  assert.equal(first.points,scoreWord('STAR')+20);assert.equal(first.bonus,20);assert.equal(first.basePoints,scoreWord('STAR'));
  assert.equal(second.points,scoreWord('STAR'));assert.equal(second.bonus,0);
  assert.equal(room.bounty.claimedBy,a.id);assert.equal(room.events.filter(e=>e.type==='bountyClaim').length,1);
  room.finish(room.endAt);assert.equal(room.results.teams[a.team].score,first.points);
});

test('invalid, reused and expired words cannot earn bounty bonuses; new rounds reset objectives',()=>{
  const {room,a,b}=setup(['STAR']),start=room.startAt+RULES.bountyFirstMs;
  b.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
  word(room,a,'STAR',7000);room.tick(0,start);
  assert.throws(()=>word(room,a,'STAR',start+100),/already scored/);assert.equal(room.bounty.claimedBy,null);
  assert.throws(()=>word(room,b,'ZZZ',start+100),/dictionary/);assert.equal(room.bounty.claimedBy,null);
  const late=word(room,b,'STAR',room.bounty.expiresAt);assert.equal(late.bonus,0);assert.equal(room.bounty.claimedBy,null);
  room.tick(0,start+RULES.bountyCycleMs);assert.equal(room.bounty,null); // Everyone already used STAR.
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);room.active().forEach(p=>p.ready=true);
  room.start(a.id,room.endAt+1000);a.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));room.tick(0,room.startAt+RULES.bountyFirstMs);
  assert.equal(room.bounty.word,'STAR');assert.equal(room.bounty.claimedBy,null);
});

test('mission display expires stale snapshots and word celebration identifies a bounty once',()=>{
  const {room,a}=setup(['STAR']),now=room.startAt+RULES.bountyFirstMs;
  a.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
  room.tick(0,now);let state={...room.publicState(now),self:room.privateState(a.id)};
  assert.equal(missionStatus(state,now).bountyActive,true);assert.match(missionStatus(state,now).bountyHint,/\+20/);
  assert.equal(missionStatus(state,room.bounty.expiresAt).bountyActive,false);
  const entry=word(room,a,'STAR',now+100),feedback=new MatchFeedback();
  assert.equal(feedback.word(entry).title,'BOUNTY CAPTURED');assert.equal(feedback.word(entry),null);
  state={...room.publicState(now+100),self:room.privateState(a.id)};
  assert.match(missionStatus(state,now+100).bountyHint,/Alpha claimed \+20/);
  assert.equal(missionStatus(state,now+100).bountyActive,false);
});

test('asteroid image decodes once into a cached texture; both texture and fallback render safely',async t=>{
  const oldImage=globalThis.Image,oldDocument=globalThis.document;let decoded=0,draws=0;
  t.after(()=>{if(oldImage===undefined)delete globalThis.Image;else globalThis.Image=oldImage;
    if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;});
  const ctx=new Proxy({drawImage(){draws++;},createLinearGradient(){return {addColorStop(){}};}},
    {get:(o,k)=>k in o?o[k]:(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a));}});
  globalThis.Image=class{async decode(){decoded++;}};
  globalThis.document={createElement:()=>({getContext:()=>ctx})};
  const sprites=new AsteroidSprites();assert.equal(await sprites.ready,true);assert.equal(decoded,1);
  for(let i=0;i<12;i++)drawAsteroid(ctx,100,100,48,i/3,2,{texture:sprites.texture,maxHits:4,kind:'meteor',letterCount:6});
  assert.equal(decoded,1);assert.equal(draws,13);
  globalThis.Image=class{async decode(){throw new Error('Offline');}};
  const failed=new AsteroidSprites();assert.equal(await failed.ready,false);
  drawAsteroid(ctx,100,100,48,0,3,{texture:failed.texture});
});
GLYPHSTORM_23CD334A37D715ED

# FILE: test/feedback.test.mjs
cat > 'test/feedback.test.mjs' <<'GLYPHSTORM_7AAF572590017F70'
import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchFeedback, raceStatus } from '../public/match-feedback.js';
import { Arena, MAX_PARTICLES } from '../public/arena.js';
import { WordEnergy } from '../public/word-energy.js';

const pilot=(id,score=0,team=0,role='player')=>({id,name:id.toUpperCase(),score,team,role});
const state=(overrides={})=>({matchId:'round-1',phase:'playing',now:10000,
  settings:{mode:'ffa'},players:[pilot('a'),pilot('b')],events:[],self:{history:[]},...overrides});
const word=(seq,word='STAR',at=10000)=>({seq,type:'word',playerId:'a',word,points:6,at,x:1200,y:800,color:'#70f7d1'});

test('race targets handle opening scores, ties, retired pilots and spectators',()=>{
  const s=state();
  assert.equal(raceStatus(s,'a').message,'Score the opening word');
  assert.deepEqual(raceStatus(s,'a').leaders,[]);
  s.players=[pilot('a',20),pilot('b',28),pilot('c',30,0,'retired'),pilot('watcher',999,0,'spectator')];
  assert.equal(raceStatus(s,'a').message,'11 points to take the lead');
  assert.equal(raceStatus(s,'watcher').score,30);
  assert.equal(raceStatus(s,'watcher').label,'LEADING SCORE');
  s.players[0].score=30;
  assert.equal(raceStatus(s,'a').message,'Shared lead · break the tie');
  s.players[0].score=36;
  assert.equal(raceStatus(s,'a').message,'Leading by 6 points');
  assert.equal(raceStatus(s,'a').leading,true);
});

test('team race totals include retained points and team lead changes use team wording',()=>{
  const s=state({settings:{mode:'teams'},players:[pilot('a',10),pilot('c',15,0,'retired'),pilot('b',30,1)]});
  const feedback=new MatchFeedback();feedback.reset(s,'a',true);
  assert.equal(raceStatus(s,'a').score,25);
  assert.equal(raceStatus(s,'a').label,'YOUR TEAM');
  assert.equal(raceStatus(s,'a').message,'6 points to take the lead');
  s.players[0].score=20;
  assert.equal(feedback.update(s,'a').announcement,'YOUR TEAM TAKES THE LEAD');
  assert.equal(raceStatus(s,'a').message,'Leading by 5 points');
});

test('acknowledgements and snapshots celebrate a word once in either delivery order',()=>{
  for(const ackFirst of [true,false]){
    const feedback=new MatchFeedback(),s=state(),entry=word(1);
    feedback.reset(s,'a',true);s.events=[entry];s.players[0].score=6;
    const first=ackFirst?feedback.word(entry):feedback.update(s,'a').words[0];
    assert.equal(first.word,'STAR');assert.equal(first.points,6);
    if(ackFirst)assert.deepEqual(feedback.update(s,'a').words,[]);
    else assert.equal(feedback.word(entry),null);
    assert.deepEqual(feedback.update(s,'a').words,[]);
    const next=state({matchId:'round-2',events:[word(1)]});
    assert.equal(feedback.update(next,'a').words[0].word,'STAR');
  }
});

test('reconnect and delayed snapshots do not replay old scoring celebrations',()=>{
  const feedback=new MatchFeedback(),s=state({events:[word(1)],self:{history:[{word:'STAR',points:6}]}});
  feedback.reset(s,'a',true);
  assert.deepEqual(feedback.update(s,'a').words,[]);
  assert.equal(feedback.word({word:'STAR',points:6}),null);
  s.events.push(word(2,'MOON',7000),word(3,'COMET',9900),{...word(4,'ORBIT'),at:undefined});
  const cues=feedback.update(s,'a');
  assert.deepEqual(cues.events.map(e=>e.word),['COMET']);
  assert.deepEqual(cues.words.map(e=>e.word),['COMET']);
  assert.deepEqual(feedback.update(s,'a').events,[]);
});

test('lead alerts announce real changes once and recognize shared leads',()=>{
  const feedback=new MatchFeedback(),s=state();
  assert.equal(feedback.update(s,'a').announcement,null);
  s.players[0].score=10;
  assert.equal(feedback.update(s,'a').announcement,'YOU TAKE THE LEAD');
  assert.equal(feedback.update(s,'a').announcement,null);
  s.players[1].score=10;
  assert.equal(feedback.update(s,'a').announcement,'NECK AND NECK · TIED LEAD');
  s.players[1].score=11;
  assert.equal(feedback.update(s,'a').announcement,'B TAKES THE LEAD');
  feedback.reset(s,'a',true);
  assert.equal(feedback.update(s,'a').announcement,null);
});

test('countdown cues tick once per observed second without a late-join catch-up',()=>{
  const feedback=new MatchFeedback();
  assert.equal(feedback.clock('countdown',3).tick,true);
  assert.equal(feedback.clock('countdown',3).tick,false);
  assert.equal(feedback.clock('countdown',2).tick,true);
  assert.deepEqual(feedback.clock('playing',300),{tick:false,notice:null});
  assert.match(feedback.clock('playing',30).notice,/30 SECONDS/);
  assert.deepEqual(feedback.clock('playing',30),{tick:false,notice:null});
  assert.deepEqual(feedback.clock('playing',10),{tick:true,notice:'10 SECONDS · EVERY WORD COUNTS'});
  assert.equal(feedback.clock('playing',9).tick,true);
  assert.deepEqual(feedback.clock('results',0),{tick:false,notice:null});
  const late=new MatchFeedback();
  assert.deepEqual(late.clock('playing',8),{tick:false,notice:null});
  assert.equal(late.clock('playing',7).tick,true);
});

test('arena effects stay bounded, skip old events and respect reduced motion',()=>{
  const arena=Object.create(Arena.prototype);
  Object.assign(arena,{state:null,visual:new Map(),effects:[],particles:[],trails:new Map(),lastEvent:0,reduced:false,wordEnergy:new WordEnergy()});
  const s=state({events:[word(1)]});
  arena.update(s,'a');assert.equal(arena.particles.length,0); // Joining a live round.
  s.events=[word(2,'MOON',7000),word(3,'COMET')];
  arena.update(s,'a');assert.equal(arena.effects.length,1);assert.ok(arena.particles.length>0);
  const count=arena.particles.length;arena.update(s,'a');assert.equal(arena.particles.length,count);
  for(let seq=4;seq<100;seq++)arena.burst(word(seq),0);
  assert.equal(arena.particles.length,MAX_PARTICLES);
  arena.drawParticles({save(){},restore(){}},1000);assert.equal(arena.particles.length,0);
  arena.burst(word(100),1000);arena.trails.set('a',[{x:1,y:1,at:1000}]);arena.reduced=true;
  arena.drawParticles(null,1000);arena.drawTrails(null,1000,10000);
  assert.equal(arena.particles.length,0);assert.equal(arena.trails.size,0);
  s.events=[word(101,'ORBIT')];arena.update(s,'a');assert.equal(arena.particles.length,0);
  assert.equal(arena.effects.at(-1).word,'ORBIT'); // Readable score feedback remains.
});
GLYPHSTORM_7AAF572590017F70

# FILE: test/fleet.test.mjs
cat > 'test/fleet.test.mjs' <<'GLYPHSTORM_19B5F4D3C449A94E'
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/game.mjs';
import { FLEET } from '../public/fleet.js';
import { RULES } from '../public/rules.js';

test('ship choice is validated, clears readiness only on a change, and is locked during rounds',()=>{
  const room=new GameRoom('ABCDEF');
  const players=FLEET.map((_,i)=>room.addPlayer('Pilot '+i,1000+i));
  const a=players[0],b=players[1];
  assert.equal(new Set(players.map(p=>p.shipId)).size,8);
  const spectator=room.addPlayer('Watcher',1010);
  assert.throws(()=>room.chooseShip(spectator.id,FLEET[2].id),/Claim a pilot seat/);
  a.ready=true;
  for(const bad of ['../icon.svg','constructor','toString',null,{},0])
    assert.throws(()=>room.chooseShip(a.id,bad),/eight available/);
  assert.equal(a.ready,true);
  room.chooseShip(a.id,a.shipId);assert.equal(a.ready,true);
  room.chooseShip(a.id,b.shipId); // Shared cosmetic choices are allowed.
  assert.equal(a.shipId,b.shipId);assert.equal(a.ready,false);
  assert.notEqual(a.color,b.color);
  assert.equal(room.publicState(1100).players.find(p=>p.id===a.id).shipId,b.shipId);
  players.forEach(p=>p.ready=true);room.start(a.id,2000);
  assert.throws(()=>room.chooseShip(a.id,FLEET[3].id),/lobby/);
  room.tick(0,5000);
  assert.throws(()=>room.chooseShip(a.id,FLEET[3].id),/lobby/);
  const chosen=a.shipId;
  room.reset(a,6000);assert.equal(a.shipId,chosen);
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1);
  assert.equal(a.shipId,chosen);
  room.remove(players[3].id,room.endAt+2);
  const replacement=room.addPlayer('New pilot',room.endAt+3);
  assert.ok(FLEET.some(s=>s.id===replacement.shipId));
  assert.equal(new Set(room.active().map(p=>p.color)).size,8);
});

test('every hull has identical movement and physical letter collection reach',()=>{
  const flights=[];
  for(const ship of FLEET){
    const room=new GameRoom('ABCDEF',{words:new Set(['CAT']),random:()=>.5});
    const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1001);
    room.chooseShip(a.id,ship.id);a.ready=b.ready=true;room.start(a.id,1000);room.tick(0,4000);
    a.x=500;a.y=500;a.vx=RULES.speed;a.protectionUntil=0;b.x=1500;b.y=1000;
    room.crystals=[];
    room.letters=[['T',555,500],['C',535,500],['A',545,500],['X',520,535]].map(([letter,x,y],i)=>({
      id:String(i),letter,x,y,ownerId:null,team:null,priorityUntil:0,expiresAt:50000
    }));
    room.input(a.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:false},7000);
    room.tick(.1,7100);
    const tray=a.tray.map(t=>t.letter).join('');
    assert.equal(tray,'CAT',ship.name+' must collect in physical order and miss X');
    flights.push({x:a.x,y:a.y,vx:a.vx,vy:a.vy,stability:a.stability,tray,remaining:room.letters.map(l=>l.letter)});
  }
  flights.forEach(f=>assert.deepEqual(f,flights[0]));
});
GLYPHSTORM_19B5F4D3C449A94E

# FILE: test/flexible-tray.test.mjs
cat > 'test/flexible-tray.test.mjs' <<'GLYPHSTORM_7CB27DC243E1FE96'
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GameRoom} from '../server/game.mjs';
import {inspectTray} from '../server/word-guide.mjs';
import {wordIndex} from '../server/word-index.mjs';
import {submissionChoice} from '../public/word-guide.js';
import {TraySelection,FlightTips,moveTile} from '../public/tray-controls.js';
import {RULES,scoreWord,VALUES,distance} from '../public/rules.js';
import {TILE_FREQUENCIES,VOWELS,drawLetter,vowelShare,replenishNearbyLetters,balanceDistantCrystals} from '../server/letter-supply.mjs';
import {drawEarth} from '../public/planet.js';
import wordListPath from 'word-list';

const words=new Set(['CAT','CATS','CAST','DOG','STAR','TEA','EAT','ATE','TEN','NET','TANGLE','ELEGANCE']);
const tiles=text=>[...text].map((letter,i)=>({id:'t'+i,letter}));
const text=p=>p.tray.map(t=>t.letter).join('');
function setup(dictionary=words){
  const room=new GameRoom('TRAYQA',{words:dictionary,now:1000});
  const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1000);a.ready=b.ready=true;
  room.start(a.id,1000);room.tick(0,4000);room.crystals=[];room.asteroids=[];room.letters=[];
  room.nextSupplyAt=Infinity;room.replenishFields=()=>{};
  for(const [i,p]of [a,b].entries())Object.assign(p,{x:100+1000*i,y:100,protectionUntil:0});
  return {room,a,b};
}
function submit(room,p,ids,now=7000){room.wordMode(p.id,true,now);return room.submit(p.id,ids,now);}
function seeded(seed=17){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};}

test('desktop drag and mobile two-tap swap rearrange owned tiles; selected middle word keeps both sides',()=>{
  for(const input of ['drag','touch']){
    const {room,a}=setup();a.tray=tiles('XTACY');const selection=new TraySelection();
    let ids;
    if(input==='drag'){ids=moveTile(a.tray.map(t=>t.id),'t3','t1');ids=moveTile(ids,'t2','t1');}
    else {assert.equal(selection.tap('t1',a.tray),null);ids=selection.tap('t3',a.tray);}
    room.arrange(a.id,ids,7000);assert.equal(text(a),'XCATY');
    selection.mode='range';selection.tap('t1',a.tray);selection.tap('t3',a.tray);
    const choice=submissionChoice(room.privateState(a.id,7000),selection.range(a.tray));
    assert.equal(choice.word,'CAT');assert.equal(choice.keep,'XY');
    const result=submit(room,a,choice.tileIds);assert.equal(result.points,scoreWord('CAT'));assert.equal(text(a),'XY');
    selection.useAll();assert.equal(selection.range(a.tray),null);
  }
});
test('rearrange rejects forged, duplicate, partial or stale inventories without losing tiles',()=>{
  const {room,a}=setup();a.tray=tiles('CAT');const before=structuredClone(a.tray);
  for(const ids of [['t0','t0','t2'],['t0','t1','fake'],['t0','t1'],null]){
    assert.throws(()=>room.arrange(a.id,ids,7000),/tray changed/);assert.deepEqual(a.tray,before);
  }
  a.tray.push({id:'new',letter:'S'});assert.throws(()=>room.arrange(a.id,before.map(t=>t.id),7000),/tray changed/);
});
test('middle discard and default last discard preserve every other tile and cooldown',()=>{
  const {room,a}=setup();a.tray=tiles('CXAT');room.discard(a.id,'t1',7000);assert.equal(text(a),'CAT');
  assert.throws(()=>room.discard(a.id,'t2',7500),/Wait/);room.discard(a.id,a.tray.at(-1).id,8000);assert.equal(text(a),'CA');
});
test('shuffle is free, preserves inventory and star flags, and enforces three seconds',()=>{
  const {room,a}=setup();a.tray=tiles('CATS');a.tray[0].doubleScore=true;room.random=()=>0;
  const original=structuredClone(a.tray);room.shuffle(a.id,7000);assert.notEqual(text(a),'CATS');
  assert.deepEqual([...a.tray].sort((x,y)=>x.id.localeCompare(y.id)),original);assert.equal(a.score,0);
  assert.throws(()=>room.shuffle(a.id,9999),/3 seconds/);room.shuffle(a.id,10000);assert.equal(a.shuffleReadyAt,13000);
});
test('full dead tray has no offers and useful discard guidance; a full solvable tray is not declared dead',()=>{
  const dead=inspectTray(tiles('QZXJKQZXJK'),new Set(),words);
  assert.equal(dead.possibleCount,0);assert.equal(dead.best,null);assert.ok(dead.leastUseful.length);assert.ok(dead.smartDiscard);
  const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  assert.match(source,/const stuck=\(full\|\|state.self.tray.length>=6\)&&guide\?\.possibleCount===0/);
  assert.ok(source.includes('No words from these letters, discard one or Shuffle.'));
  const solvable=inspectTray(tiles('ETANGLEENC'),new Set(),words);assert.ok(solvable.possibleCount>0);assert.equal(solvable.best.word,'ELEGANCE');
});
test('reported ETANGLEENC works with the real bundled dictionary, including ELEGANCE for 61 points',()=>{
  const dictionary=new Set(readFileSync(wordListPath,'utf8').split('\n').map(w=>w.toUpperCase()).filter(w=>/^[A-Z]{3,10}$/.test(w)));
  const guide=inspectTray(tiles('ETANGLEENC'),new Set(),dictionary);
  assert.equal(guide.longest.word,'ELEGANCE');assert.equal(guide.best.points,61);assert.ok(guide.possibleCount>100);
  const index=wordIndex(dictionary);assert.deepEqual(index.find('ETANGLEENC'),index.find('CNEELGNATE'));
});
test('smart discard keeps most possible words and otherwise chooses the best vowel recovery slot',()=>{
  const {room,a}=setup();a.tray=tiles('CATX');let advice=room.trayAdvice(a);assert.equal(advice.smartDiscard.tileId,'t3');
  room.smartDiscard(a.id,7000);assert.equal(text(a),'CAT');assert.equal(a.score,0);
  a.tray=tiles('CTQ');advice=room.trayAdvice(a);assert.equal(advice.smartDiscard.tileId,'t2');assert.equal(advice.smartDiscard.recoveryWords,1);
  room.smartDiscard(a.id,8000);assert.equal(text(a),'CT');
});
test('live full/range validation, unused words, best versus longest, stars and duplicate letters agree',()=>{
  const dictionary=new Set(['CAT','CATS','JAZZ']);const tray=tiles('CATSJAZZ');tray[0].doubleScore=true;
  let guide=inspectTray(tray,new Set(),dictionary),self={tray,wordGuide:guide};
  assert.equal(submissionChoice(self).valid,false);assert.equal(submissionChoice(self,{start:0,end:3}).points,scoreWord('CAT')*2);
  assert.equal(guide.best.word,'JAZZ');assert.equal(guide.longest.length,4);
  guide=inspectTray(tiles('JAZ'),new Set(),dictionary);assert.equal(guide.possibleCount,0);
  guide=inspectTray(tiles('CAT'),new Set(['CAT']),dictionary);assert.equal(submissionChoice({tray:tiles('CAT'),wordGuide:guide}).valid,false);
  assert.equal(inspectTray(tiles('CAT'),new Set(),words).usefulness.S,'useful');
  assert.equal(inspectTray(tiles('QZ'),new Set(),words).usefulness.X,'dim');
});
test('Shorter word offer arranges and selects the longest word without consuming leftovers',()=>{
  const {room,a}=setup();a.tray=tiles('TACXS');const offer=room.trayAdvice(a).longest,used=new Set(offer.tileIds);
  room.arrange(a.id,[...offer.tileIds,...a.tray.filter(t=>!used.has(t.id)).map(t=>t.id)],7000);
  const selection=new TraySelection();selection.selectWord(offer.tileIds);
  const choice=submissionChoice(room.privateState(a.id,7000),selection.range(a.tray));assert.equal(choice.word,offer.word);
  assert.equal(choice.length,4);assert.equal(choice.keep,'X');assert.equal(a.score,0);
});
test('stuck vowel is gifted after twenty seconds, does not recur within forty-five, and respects progress',()=>{
  const {room,a,b}=setup();b.connected=false;a.tray=tiles('CT');a.lastProgressAt=7000;
  room.updateStuckPlayers(26999);assert.equal(text(a),'CT');room.updateStuckPlayers(27000);
  assert.equal(text(a),'CTA');assert.equal(a.tray.at(-1).gift,true);assert.equal(a.lastGiftAt,27000);
  room.updateStuckPlayers(71999);assert.equal(a.tray.length,3);room.updateStuckPlayers(72000);assert.equal(a.tray.length,4);
  a.lastProgressAt=116999;room.updateStuckPlayers(117000);assert.equal(a.tray.length,4);
});
test('full tray reserves its vowel without replacing a tile; middle discard delivers it exactly once',()=>{
  const {room,a}=setup();a.tray=tiles('QZXJKQZXJK');const before=structuredClone(a.tray);a.lastProgressAt=7000;
  room.updateStuckPlayers(27000);assert.deepEqual(a.tray,before);assert.ok(VOWELS.includes(a.pendingVowel));
  const gift=a.pendingVowel;room.discard(a.id,'t4',28000);assert.equal(a.tray.length,10);assert.equal(a.tray.at(-1).letter,gift);
  assert.deepEqual(a.tray.slice(0,9),before.filter(t=>t.id!=='t4'));assert.equal(a.pendingVowel,null);
  room.updateStuckPlayers(50000);assert.equal(a.pendingVowel,null);assert.equal(a.tray.length,10);
  assert.equal(room.events.filter(e=>e.type==='vowelGift'&&e.playerId===a.id).length,1);
});
test('review, reset and disconnection defer automatic vowel delivery',()=>{
  for(const modifier of [{wordMode:true},{resetUntil:40000},{connected:false},{protectionUntil:40000}]){
    const {room,a}=setup();a.tray=tiles('CT');a.lastProgressAt=7000;Object.assign(a,modifier);
    room.updateStuckPlayers(27000);assert.equal(text(a),'CT');assert.equal(a.pendingVowel,null);
  }
});
test('weighted supply keeps rare values/frequencies, nudges local vowels and stays near its field target',()=>{
  assert.equal(TILE_FREQUENCIES.E,12);for(const l of 'JQXZK')assert.equal(TILE_FREQUENCIES[l],1);
  assert.equal(VALUES.Q,10);assert.equal(VALUES.J,8);assert.equal(VALUES.K,5);
  const {room,a}=setup();room.random=seeded();
  for(let i=0;i<200;i++)room.letters.push({letter:drawLetter(room),expiresAt:100000});
  assert.ok(vowelShare(room).share>=.35&&vowelShare(room).share<=.4);
  room.letters=[];room.random=()=>.5;a.tray=tiles('CT');assert.ok(VOWELS.includes(drawLetter(room,a)));
  a.tray=tiles('AEIOUA');assert.ok(!VOWELS.includes(drawLetter(room,a)));
});
test('nearby supply adds accessible letters within six hundred pixels and removes only its own far extras',()=>{
  const {room,a,b}=setup();room.random=seeded(93);room.nextSupplyAt=7000;b.connected=false;
  const far={id:'old',letter:'Q',x:1600,y:800,expiresAt:99999};room.letters=[far];
  replenishNearbyLetters(room,7000);const local=room.letters.filter(t=>t.localSupply);assert.equal(local.length,2);
  assert.ok(local.every(t=>distance(t,a)<=600&&distance(t,a)>=180));assert.ok(room.letters.includes(far));
  a.x=1500;a.y=1000;room.nextSupplyAt=0;replenishNearbyLetters(room,9000);
  assert.ok(local.every(t=>!room.letters.includes(t)));assert.ok(room.letters.includes(far));
});
test('vowel balancing never relabels collected, released, or nearby crystal letters',()=>{
  const {room,a,b}=setup();a.tray=tiles('CT');b.connected=false;room.simulationNow=7000;
  const near={id:'near',letter:'Q',x:110,y:100},released={id:'released',letter:'Z',x:1500,y:900,expiresAt:20000};
  room.crystals=[near,...Array.from({length:30},(_,i)=>({id:String(i),letter:'X',x:1500,y:900}))];room.letters=[released];
  balanceDistantCrystals(room);assert.equal(near.letter,'Q');assert.equal(released.letter,'Z');assert.equal(text(a),'CT');
  assert.ok(vowelShare(room).share>=.35&&vowelShare(room).share<=.4);
});
test('magnet pulls one nearest useful eligible pickup gently, including seams, without changing incoming threats',()=>{
  const {room,a,b}=setup();a.tray=tiles('CT');b.connected=false;a.x=2390;
  const letter=(id,letter,x,extra={})=>({id,letter,x,y:100,expiresAt:20000,priorityUntil:0,...extra});
  const close=letter('a','A',40),far=letter('b','A',55),neutral=letter('z','Z',32),threat=letter('incoming','A',35,{incoming:true,vx:-40});
  room.letters=[close,far,neutral,threat];const paths=new Map();room.moveMagnetLetters(.1,7000,paths);
  assert.ok(Math.abs(close.x-35.8)<1e-8);assert.equal(paths.size,1);assert.equal(far.x,55);assert.equal(neutral.x,32);assert.equal(threat.x,35);
  close.ownerId=b.id;close.priorityUntil=10000;far.incoming=true;room.moveMagnetLetters(.1,7000,new Map());assert.ok(Math.abs(close.x-35.8)<1e-8);
});
test('bounties use available field plus a single pilot tray, never pool rival private inventories',()=>{
  const {room,a,b}=setup(new Set(['CAT']));a.tray=tiles('C');b.tray=tiles('AT');
  room.updateObjectives(room.startAt+RULES.bountyFirstMs);assert.equal(room.bounty,null);
  room.bountyCycle=-1;room.letters=[{letter:'A',expiresAt:99999},{letter:'T',expiresAt:99999}];
  room.updateObjectives(room.startAt+RULES.bountyFirstMs);assert.equal(room.bounty.word,'CAT');assert.equal(room.bounty.bonus,20);
});
test('asteroid labels correspond to preserved letter rewards, extra vowel, star, or personal shield recharge',()=>{
  for(const rewardType of ['letters','vowel','double','shield']){
    const {room,a}=setup();a.cooldownUntil=30000;
    const rock={id:'rock',x:600,y:600,r:48,rotation:0,letterCount:4,rewardType};
    room.openAsteroid(rock,{ownerId:a.id,team:a.team},7000);
    assert.equal(room.letters.length,rewardType==='vowel'?5:4);assert.ok(room.letters.some(t=>VOWELS.includes(t.letter)));
    assert.equal(room.letters.filter(t=>t.doubleScore).length,rewardType==='double'?1:0);
    assert.ok(room.letters.every(t=>t.ownerId===a.id&&t.priorityUntil===9000));
    if(rewardType==='shield')assert.equal(a.cooldownUntil,7000);
    room.openAsteroid(rock,{ownerId:a.id},7100);assert.equal(room.letters.length,rewardType==='vowel'?5:4);
  }
});
test('star doubles the normal word score only once; bounty stays twenty and unused stars remain',()=>{
  const {room,a}=setup();a.tray=tiles('XCATZ');for(const t of a.tray)t.doubleScore=true;
  room.bounty={word:'CAT',startsAt:6000,expiresAt:12000,bonus:20,claimedBy:null};
  const result=submit(room,a,a.tray.slice(1,4).map(t=>t.id));
  assert.equal(result.points,scoreWord('CAT')*2+20);assert.equal(result.multiplier,2);assert.equal(result.bonus,20);
  assert.equal(text(a),'XZ');assert.ok(a.tray.every(t=>t.doubleScore));assert.equal(room.defense.earthHealth,100);
});
test('active word shield banks only one asteroid recharge and keeps its original expiry',()=>{
  const {room,a}=setup();room.wordMode(a.id,true,7000);const expires=a.shieldUntil;
  for(let i=0;i<2;i++)room.openAsteroid({id:'r'+i,x:600,y:600,r:48,rotation:0,rewardType:'shield'},{ownerId:a.id},7100+i);
  assert.equal(a.shieldUntil,expires);assert.equal(a.rechargeCredit,true);room.endShield(a,8000);assert.equal(a.cooldownUntil,8000);assert.equal(a.rechargeCredit,false);
  room.wordMode(a.id,false,8000);room.wordMode(a.id,true,8100);room.endShield(a,8200);assert.equal(a.cooldownUntil,8200+RULES.cooldownMs);
});
test('guided tips advance only on the matching action, persist completion and allow dismissal',()=>{
  let saved=0;const tips=new FlightTips(false,()=>saved++);
  tips.action('submit');assert.equal(tips.step,0);tips.action('collect');assert.match(tips.text,/Rearrange/);
  tips.action('collect');assert.equal(tips.step,1);tips.action('arrange');assert.match(tips.text,/Enter/);tips.action('submit');assert.equal(tips.text,'');assert.equal(saved,1);
  const returning=new FlightTips(true);assert.equal(returning.text,'');const skipped=new FlightTips(false,()=>saved++);skipped.dismiss();assert.equal(saved,2);
});
test('zero score after forty-five seconds suggests a short available word, not the largest scoring anagram',()=>{
  const {room,a}=setup();a.tray=tiles('CATSTEA');assert.equal(room.privateState(a.id,room.startAt+44999).wordGuide.nudge,null);
  const advice=room.privateState(a.id,room.startAt+45000).wordGuide;assert.equal(advice.shortWord.length,3);assert.ok(advice.nudge.includes(advice.shortWord.word));
  a.score=1;assert.equal(room.privateState(a.id,room.startAt+45001).wordGuide.nudge,null);
});
test('Earth renderer adds a red impact ring and world-space wave countdown; reduced motion retains static warning',()=>{
  const {room}=setup();room.defense.lastImpactAt=7000;room.defense.nextWaveAt=16000;
  for(const reduced of [false,true]){
    const strokes=[],labels=[];const ctx=new Proxy({stroke(){strokes.push(this.strokeStyle);},fillText(s){labels.push(s);},createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:(()=>{})});
    drawEarth(ctx,100,100,1,room.defense,null,null,7100,reduced);
    assert.ok(strokes.includes('#ff5269'));assert.ok(labels.includes('INCOMING WAVE · 9s'));
  }
});
GLYPHSTORM_7CB27DC243E1FE96

# FILE: test/game.test.mjs
cat > 'test/game.test.mjs' <<'GLYPHSTORM_7215228165B87058'
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from '../server/game.mjs';
import { WORLD, RULES, distance, scoreWord } from '../public/rules.js';
let tileSeq=0;
const tiles=word=>[...word].map(letter=>({id:'t'+ ++tileSeq,letter}));
function setup(mode='ffa',disruption=false){
  let seed=41;
  const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const room=new GameRoom('ABCDEF',{words:new Set(['CAT','STAR','PLANET','LETTER','DOG']),random,now:1000});
  const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1001);
  room.configure(a.id,{mode,minutes:3,disruption});
  a.ready=b.ready=true;room.start(a.id,1000);room.tick(0,4000);
  for(const [i,p]of [a,b].entries()){p.protectionUntil=0;p.x=500+i*500;p.y=500;p.inputAt=7000;}
  room.crystals=[];room.nextSupplyAt=Infinity;
  return {room,a,b};
}
function letter(room,letter,x,y,ownerId=null,team=null,priorityUntil=0){
  const tile={id:room.id(),letter,x,y,ownerId,team,priorityUntil,expiresAt:50000};room.letters.push(tile);return tile;
}
function pulse(room,a,b,now=7000){
  room.pulses.push({id:room.id(),ownerId:a.id,team:a.team,color:a.color,x:b.x-20,y:b.y,vx:1000,vy:0,expiresAt:now+1000});
  room.tick(.03,now);
}
function submit(room,p,ids,now){room.wordMode(p.id,true,now);return room.submit(p.id,ids,now);}
test('ordered words consume a leading prefix, preserve trailing letters, and enforce per-player history',()=>{
  const {room,a,b}=setup();a.tray=tiles('CATS');const ids=a.tray.slice(0,3).map(t=>t.id);
  assert.equal(submit(room,a,ids,7000).points,5);assert.equal(a.tray.map(t=>t.letter).join(''),'S');
  a.tray=tiles('CAT');assert.throws(()=>submit(room,a,a.tray.map(t=>t.id),7100),/already scored/);
  b.tray=tiles('CAT');assert.equal(submit(room,b,b.tray.map(t=>t.id),7200).word,'CAT');
  assert.equal(a.score,5);assert.equal(b.score,5);assert.equal(scoreWord('PLANET'),26);
});
test('invalid words, fabricated tiles, and duplicate tile IDs never consume or score inventory',()=>{
  const {room,a}=setup();a.tray=tiles('QZXC');const original=structuredClone(a.tray);
  room.wordMode(a.id,true,7000);assert.throws(()=>room.submit(a.id,a.tray.slice(0,3).map(t=>t.id),7100),/dictionary/);
  assert.equal(a.shieldUntil,0);assert.equal(a.cooldownUntil,22100);
  assert.deepEqual(a.tray,original);assert.equal(a.score,0);
  assert.throws(()=>room.submit(a.id,['fake','tiles','here'],7200),/contiguous range/);
  assert.throws(()=>room.submit(a.id,[a.tray[0].id,a.tray[0].id,a.tray[1].id],7200),/different tiles/);
});
test('repeated letters require distinct inventory tiles',()=>{
  const {room,a}=setup();a.tray=tiles('LETTERA');
  submit(room,a,a.tray.slice(0,6).map(t=>t.id),7000);
  assert.equal(a.tray.map(t=>t.letter).join(''),'A');assert.equal(a.score,24);
});
test('word shields stop movement, pulsing, and collection and cannot be refreshed during cooldown',()=>{
  const {room,a}=setup();a.x=100;a.y=100;
  letter(room,'A',100,100);
  room.wordMode(a.id,true,7000);
  room.input(a.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:true},7100);room.tick(.03,7100);
  assert.equal(a.x,100);assert.equal(a.tray.length,0);assert.equal(room.pulses.length,0);
  room.wordMode(a.id,false,7200);assert.equal(a.cooldownUntil,22200);
  room.wordMode(a.id,true,7300);assert.equal(a.shieldUntil,0);
  room.wordMode(a.id,false,7400);room.wordMode(a.id,true,22201);assert.equal(a.shieldUntil,30201);
  room.tick(.03,30202);assert.equal(a.shieldUntil,0);assert.equal(a.cooldownUntil,45201);
});
test('pickup priority expires and a full tray leaves letters available',()=>{
  const {room,a,b}=setup();a.x=600;a.y=600;b.x=100;b.y=100;
  const l=letter(room,'A',100,100,a.id,a.team,9000);
  room.tick(.01,7000);assert.equal(b.tray.length,0);assert.ok(room.letters.includes(l));
  room.tick(.01,9001);assert.equal(b.tray.length,1);
  b.tray=tiles('AAAAAAAAAA');letter(room,'E',100,100);
  room.tick(.01,9100);assert.equal(b.tray.length,10);assert.equal(room.letters.length,1);
});
test('teammates share priority but opponents do not',()=>{
  const {room,a,b}=setup('teams');b.team=a.team;b.x=100;b.y=100;a.x=500;
  letter(room,'E',100,100,a.id,a.team,9000);room.tick(.01,7000);assert.equal(b.tray.length,1);
});
test('two simultaneous pickups produce one owner and never duplicate a tile',()=>{
  const {room,a,b}=setup();a.x=b.x=100;a.y=b.y=100;letter(room,'A',100,100);
  room.tick(.01,7000);assert.equal(a.tray.length+b.tray.length,1);assert.equal(room.letters.length,0);
});
test('collection and pulse collision use shortest distances across the wrapped seam',()=>{
  const {room,a,b}=setup();a.x=2;a.y=100;b.x=1000;
  letter(room,'A',WORLD.width-3,100);room.tick(.01,7000);assert.equal(a.tray.length,1);
  assert.equal(distance({x:1,y:1},{x:WORLD.width-1,y:1}),2);
  room.crystals=[{id:'crystal',x:3,y:300,r:20,vx:0,vy:0,letter:'Z',rotation:0}];
  room.asteroids=[]; // This test isolates the crystal at the seam from random rocks.
  room.pulses=[{id:'pulse',ownerId:a.id,team:a.team,color:a.color,x:WORLD.width-30,y:300,vx:1000,vy:0,expiresAt:9000}];
  room.tick(.04,7100);assert.ok(room.letters.some(l=>l.letter==='Z'));assert.ok(!room.crystals.some(c=>c.id==='crystal'));
});
test('a reset drops at most three distinct letters, keeps score, and returns with protection',()=>{
  const {room,a}=setup();a.tray=tiles('PLANET');a.score=26;const ids=new Set(a.tray.map(t=>t.id));
  room.reset(a,7000);assert.equal(a.tray.length,3);assert.equal(room.letters.length,3);assert.equal(a.score,26);
  assert.equal(new Set([...a.tray,...room.letters].map(t=>t.id)).size,6);assert.ok(room.letters.every(l=>ids.has(l.id)&&l.priorityUntil===0));
  room.tick(.03,9999);assert.equal(a.resetUntil,10000);
  room.tick(.03,10000);assert.equal(a.resetUntil,0);assert.equal(a.protectionUntil,12000);assert.equal(a.stability,3);
  const short=tiles('AT');a.tray=short;room.reset(a,13000);assert.equal(a.tray.length,0);
});
test('disruption is optional, friendly fire is off, and protected ships ignore pulse contacts',()=>{
  const {room,a,b}=setup('teams',false);
  pulse(room,a,b);assert.equal(b.stability,3);
  room.settings.disruption=true;b.team=a.team;pulse(room,a,b,7100);assert.equal(b.stability,3);
  b.team=1-a.team;b.shieldUntil=9000;pulse(room,a,b,7200);assert.equal(b.stability,3);
  b.shieldUntil=0;
  pulse(room,a,b,7300);pulse(room,a,b,7500);pulse(room,a,b,7700);
  assert.equal(b.resetUntil,10700);assert.equal(a.score,0);assert.equal(b.score,0);
});
test('movement and action payloads cannot override server speed, tray, or timer',()=>{
  const {room,a}=setup();a.x=100;a.y=100;
  room.input(a.id,{seq:1,matchId:room.matchId,x:1e12,y:1e12,angle:NaN,pulse:true},7000);
  assert.equal(a.inputSeq,-1);
  room.input(a.id,{seq:2,matchId:room.matchId,x:1e12,y:1e12,angle:0,pulse:true},7000);
  assert.ok(Math.hypot(a.input.x,a.input.y)<=1);
  room.input(a.id,{seq:1,matchId:room.matchId,x:-1,y:0,angle:0,pulse:true},7001);
  assert.ok(a.input.x>0);
  room.tick(.1,7001);assert.ok(Math.hypot(a.vx,a.vy)<=RULES.speed);
});
test('the deadline is authoritative and tied scores share the win',()=>{
  const {room,a,b}=setup();room.updateObjectives=()=>{};a.tray=tiles('CAT');submit(room,a,a.tray.map(t=>t.id),room.endAt-1);
  b.tray=tiles('CAT');assert.throws(()=>room.submit(b.id,b.tray.map(t=>t.id),room.endAt),/not accepting/);
  b.score=5;room.tick(.03,room.endAt);assert.equal(room.phase,'results');assert.equal(room.results.winners.length,2);
});
test('late arrivals spectate, and equal teams and readiness are enforced in the lobby',()=>{
  const {room,a}=setup('teams');const watcher=room.addPlayer('Watcher',7000);assert.equal(watcher.role,'spectator');
  assert.throws(()=>room.wordMode(watcher.id,true,7100),/Spectators/);
  room.finish(room.endAt);room.lobby(a.id,room.endAt+1000);room.claimSeat(watcher.id);
  room.active().forEach(p=>p.ready=true);assert.throws(()=>room.start(a.id,200000),/equal/);
});
test('host migration and departure preserve earned team points',()=>{
  const {room,a,b}=setup('teams');a.score=100;room.disconnect(a.id,7000);room.tick(.03,17001);assert.equal(room.hostId,b.id);
  room.tick(.03,37001);assert.equal(a.role,'retired');assert.equal(room.active().length,1);
  room.finish(room.endAt);assert.equal(room.results.teams[a.team].score,100);
  room.lobby(b.id,room.endAt+100);assert.ok(!room.players.has(a.id));
});
test('public snapshots omit private trays, used-word sets, request history, and session credentials',()=>{
  const {room,a}=setup();a.tray=tiles('SECRET');const snapshot=room.publicState(7000),serialized=JSON.stringify(snapshot);
  assert.ok(!serialized.includes('"tray"'));assert.ok(!serialized.includes('"requests"'));assert.ok(!serialized.includes('"token"'));
  assert.equal(snapshot.players.find(p=>p.id===a.id).tileCount,6);assert.equal(room.privateState(a.id).tray.length,6);
});
test('submission requires word review even when the client crafts a valid payload',()=>{
  const {room,a}=setup();a.tray=tiles('CAT');
  assert.throws(()=>room.submit(a.id,a.tray.map(t=>t.id),7000),/word review/);
  assert.equal(a.score,0);assert.equal(a.tray.length,3);
});
test('a submit cannot secretly reorder tiles; a contiguous range may skip leading tiles',()=>{
  const {room,a}=setup();a.tray=tiles('TAC');const original=structuredClone(a.tray);
  assert.throws(()=>submit(room,a,[a.tray[2].id,a.tray[1].id,a.tray[0].id],7000),/contiguous range/);
  assert.deepEqual(a.tray,original);assert.equal(a.score,0);
  a.tray=tiles('XCAT');
  assert.equal(submit(room,a,a.tray.slice(1).map(tile=>tile.id),7100).word,'CAT');
  assert.equal(a.tray.map(tile=>tile.letter).join(''),'X');assert.equal(a.score,scoreWord('CAT'));
  room.discard(a.id,a.tray[0].id,7200);
  assert.equal(a.tray.length,0);
});
test('physical contacts append in travel order rather than letter spawn order, and near misses stay uncollected',()=>{
  const {room,a}=setup();a.x=100;a.y=500;a.vx=RULES.speed;
  letter(room,'T',140,500);letter(room,'C',136,500);letter(room,'A',138,500);
  const unwanted=letter(room,'X',118,500+RULES.shipRadius+RULES.letterRadius+1);
  room.input(a.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:false},7000);
  room.tick(.1,7000);
  assert.equal(a.tray.map(tile=>tile.letter).join(''),'CAT');
  assert.ok(room.letters.includes(unwanted));
  assert.equal(submit(room,a,a.tray.map(tile=>tile.id),7100).word,'CAT');
});
test('wrapped movement preserves first-contact order at the seam',()=>{
  const {room,a}=setup();a.x=WORLD.width-10;a.y=500;a.vx=RULES.speed;
  letter(room,'T',32,500);letter(room,'A',29,500);letter(room,'C',25,500);
  room.input(a.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:false},7000);
  room.tick(.1,7000);
  assert.ok(a.x<30);assert.equal(a.tray.map(tile=>tile.letter).join(''),'CAT');
});
test('the first ship to touch a contested letter wins even if another ends the tick closer',()=>{
  const {room,a,b}=setup();a.x=100;b.x=200;a.y=b.y=500;a.vx=RULES.speed;b.vx=-RULES.speed;
  letter(room,'C',140,500);
  for(const [p,x]of [[a,1],[b,-1]])room.input(p.id,{seq:1,matchId:room.matchId,x,y:0,angle:0,pulse:false},7000);
  room.tick(.3,7000);
  assert.ok(Math.abs(b.x-140)<Math.abs(a.x-140));
  assert.equal(a.tray[0].letter,'C');assert.equal(b.tray.length,0);assert.equal(room.letters.length,0);
});
test('ordered pickup respects the last free slot and does not collect during unshielded review',()=>{
  const {room,a}=setup();a.x=100;a.y=500;a.vx=RULES.speed;a.tray=tiles('ABCDEFGHI');
  letter(room,'T',140,500);letter(room,'C',136,500);
  room.input(a.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:false},7000);room.tick(.1,7000);
  assert.equal(a.tray.map(tile=>tile.letter).join(''),'ABCDEFGHIC');
  assert.equal(room.letters[0].letter,'T');
  a.tray=[];a.cooldownUntil=30000;room.wordMode(a.id,true,7100);
  assert.equal(a.shieldUntil,0);room.tick(0,7101);assert.equal(a.tray.length,0);
});
GLYPHSTORM_7215228165B87058

# FILE: test/network.test.mjs
cat > 'test/network.test.mjs' <<'GLYPHSTORM_079D35626EBB80EA'
import test from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';
import { createGameServer } from '../server/index.mjs';
import { RULES, VERSION } from '../public/rules.js';
import { FLEET } from '../public/fleet.js';
const connect=url=>new Promise((resolve,reject)=>{
  const client=io(url,{transports:['websocket'],reconnection:false,forceNew:true});
  client.once('connect',()=>resolve(client));client.once('connect_error',reject);
});
const call=(client,event,payload)=>new Promise((resolve,reject)=>client.timeout(3000).emit(event,payload,(err,res)=>err?reject(err):resolve(res)));
const nextState=(client,predicate)=>new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{client.off('state',listen);reject(new Error('Matching snapshot timed out'));},3000);
  function listen(state){if(predicate(state)){clearTimeout(timer);client.off('state',listen);resolve(state);}}
  client.on('state',listen);
});
test('two pilots keep rooms, private flexible trays, range scores and retry-safe assists synchronized',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT','DOG'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<3;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Alpha'});
  const guest=await call(clients[1],'join',{code:host.code,name:'Beta'});
  const room=server.rooms.get(host.code),send=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  await send(0,'ready',{ready:true});await send(1,'ready',{ready:true});await send(0,'start');now+=3100;server.tick();
  assert.equal((await call(clients[2],'join',{code:host.code,name:'Watcher'})).ok,true);
  room.replenishFields=()=>{};room.crystals=[];room.asteroids=[];room.letters=[];
  const a=room.players.get(host.playerId),b=room.players.get(guest.playerId);
  for(const [p,text]of [[a,'XTACY'],[b,'DOG']]){p.tray=[...text].map(letter=>({id:room.id(),letter}));p.protectionUntil=0;}
  const original=a.tray.map(t=>t.id),reordered=[original[0],original[3],original[2],original[1],original[4]],arrangeId=crypto.randomUUID();
  assert.equal((await send(0,'arrange',{tileIds:reordered},arrangeId)).ok,true);
  assert.equal((await send(0,'arrange',{tileIds:reordered},arrangeId)).ok,true);
  assert.equal(a.tray.map(t=>t.letter).join(''),'XCATY');
  assert.equal((await send(0,'arrange',{tileIds:[...reordered.slice(0,4),b.tray[0].id]})).ok,false);
  assert.equal((await send(2,'arrange',{tileIds:[]})).ok,false);
  const tileIds=a.tray.slice(1,4).map(t=>t.id);await send(0,'wordMode',{enter:true});
  const submitId=crypto.randomUUID(),result=await send(0,'submit',{tileIds},submitId);assert.equal(result.ok,true);assert.equal(result.value.word,'CAT');
  assert.deepEqual((await send(0,'submit',{tileIds},submitId)).value,result.value);assert.equal(a.tray.map(t=>t.letter).join(''),'XY');
  assert.equal(b.tray.map(t=>t.letter).join(''),'DOG');assert.equal(a.history.length,1);
  let at=now+100;let pending=clients.map(c=>nextState(c,s=>s.now===at));now=at;server.tick();
  const snapshots=await Promise.all(pending);
  for(const s of snapshots){assert.equal(s.players.find(p=>p.id===a.id).score,result.value.points);assert.equal(s.events.filter(e=>e.type==='word'&&e.playerId===a.id).length,1);assert.equal(s.players.some(p=>'tray'in p),false);}
  assert.equal(snapshots[0].self.tray.map(t=>t.letter).join(''),'XY');assert.equal(snapshots[1].self.tray.map(t=>t.letter).join(''),'DOG');
  const shuffleId=crypto.randomUUID();assert.equal((await send(1,'shuffle',{},shuffleId)).ok,true);const shuffled=b.tray.map(t=>t.id);
  assert.equal((await send(1,'shuffle',{},shuffleId)).ok,true);assert.deepEqual(b.tray.map(t=>t.id),shuffled);assert.equal((await send(1,'shuffle')).ok,false);
  a.tray=[...'QZXJKQZXJK'].map(letter=>({id:room.id(),letter}));a.pendingVowel='A';
  const discardId=crypto.randomUUID(),removed=a.tray[4].id;
  assert.equal((await send(0,'discard',{tileId:removed},discardId)).ok,true);const after=a.tray.map(t=>t.id);
  assert.equal((await send(0,'discard',{tileId:removed},discardId)).ok,true);assert.deepEqual(a.tray.map(t=>t.id),after);assert.equal(a.tray.length,10);assert.equal(a.tray.at(-1).letter,'A');
  assert.equal(room.events.filter(e=>e.type==='vowelGift'&&e.playerId===a.id).length,1);
  now+=1100;a.tray=[...'CATX'].map(letter=>({id:room.id(),letter}));const smartId=crypto.randomUUID();
  assert.equal((await send(0,'smartDiscard',{},smartId)).ok,true);assert.equal((await send(0,'smartDiscard',{},smartId)).ok,true);assert.equal(a.tray.map(t=>t.letter).join(''),'CAT');
  for(const module of ['tray-controls.js','word-guide.js'])assert.equal((await fetch(url+'/'+module)).status,200);
});
test('eight-client team signals stay private through retries/reconnects; word rewards agree on every screen',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<10;i++)clients.push(await connect(url));
  const joins=[await call(clients[0],'join',{create:true,name:'Pilot 0'})];
  for(let i=1;i<8;i++)joins.push(await call(clients[i],'join',{code:joins[0].code,name:'Pilot '+i}));
  const other=await call(clients[9],'join',{create:true,name:'Other orbit'});
  const room=server.rooms.get(joins[0].code),send=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  assert.equal((await send(0,'settings',{mode:'teams',minutes:3,defense:true,disruption:false})).ok,true);
  for(let i=0;i<8;i++)await send(i,'ready',{ready:true});await send(0,'start');now+=3100;server.tick();
  assert.equal((await call(clients[8],'join',{code:room.code,name:'Watcher'})).ok,true);
  const requestId=crypto.randomUUID(),payload={kind:'need-letter',letter:'A',scope:'all',team:1,playerId:joins[1].playerId};
  const first=await send(0,'signal',payload,requestId);assert.equal(first.ok,true);
  assert.equal((await send(0,'signal',payload,requestId)).ok,true);assert.equal(room.signals.length,1);
  assert.equal((await send(0,'signal',{kind:'defend-earth'})).ok,false);
  assert.equal((await send(8,'signal',{kind:'defend-earth'})).ok,false);
  let snapshotAt=now+100;
  const snapshots=clients.map(c=>nextState(c,s=>s.now===snapshotAt));now=snapshotAt;server.tick();
  const states=await Promise.all(snapshots);
  states.forEach((s,i)=>{
    const allowed=i<8&&i%2===0;
    assert.equal(s.self.signals.length,allowed?1:0);assert.equal(s.signals,undefined);
    assert.ok(s.players.every(p=>p.signals===undefined));assert.ok(s.events.every(e=>e.kind!=='need-letter'));
  });
  assert.equal(states[9].code,other.code);
  // Disconnect delivery barrier before resuming the same team seat.
  const disconnected=new Promise(resolve=>server.io.sockets.sockets.get(clients[0].id).once('disconnect',resolve));
  clients[0].disconnect();await disconnected;clients[0]=await connect(url);
  const resumed=await call(clients[0],'resume',{token:joins[0].token});assert.equal(resumed.ok,true);
  assert.equal(resumed.state.self.signalReadyAt,first.self.signalReadyAt);
  assert.equal(resumed.state.self.signals.length,1);
  const p=room.players.get(joins[0].playerId);room.defense.earthHealth=99;room.defense.barrierThickness=24.5;
  p.tray=['C','A','T'].map(letter=>({id:room.id(),letter}));await send(0,'wordMode',{enter:true});
  const submitId=crypto.randomUUID(),tiles=p.tray.map(t=>t.id);
  const scored=await send(0,'submit',{tileIds:tiles,defenseReward:{hp:1000,shield:1000}},submitId);assert.equal(scored.ok,true);
  assert.equal(scored.value.defenseReward.hp,1);assert.equal(scored.value.defenseReward.shield,.5);
  const retry=await send(0,'submit',{tileIds:tiles},submitId);assert.deepEqual(retry.value,scored.value);
  snapshotAt=now+100;const rewardSnapshots=clients.slice(0,9).map(c=>nextState(c,s=>s.now===snapshotAt));now=snapshotAt;server.tick();
  for(const s of await Promise.all(rewardSnapshots)){
    assert.equal(s.defense.earthHealth,100);assert.equal(s.defense.barrierThickness,25);
    const events=s.events.filter(e=>e.type==='word');assert.equal(events.length,1);
    assert.deepEqual(events[0].defenseReward,scored.value.defenseReward);
  }
  for(const module of ['signals.js','word-energy.js','compact-hud.js'])assert.equal((await fetch(url+'/'+module)).status,200);
});
test('eight clients agree on asteroid charge and the same four letters from actual pulse input',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<8;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Pilot 0'});
  for(let i=1;i<8;i++)assert.equal((await call(clients[i],'join',{code:host.code,name:'Pilot '+i})).ok,true);
  const room=server.rooms.get(host.code);
  const action=(i,type,payload={})=>call(clients[i],'action',{requestId:crypto.randomUUID(),matchId:room.matchId,type,payload});
  for(let i=0;i<8;i++)await action(i,'ready',{ready:true});
  await action(0,'start');now+=3100;server.tick();
  room.active().forEach((p,i)=>Object.assign(p,{x:100+i*200,y:100,vx:0,vy:0,protectionUntil:0}));
  const pilot=room.players.get(host.playerId);pilot.x=900;pilot.y=800;
  const rock={id:room.id(),x:1000,y:800,r:48,vx:0,vy:0,rotation:Math.PI/4,hitsRemaining:3};
  // A controlled arena isolates the network interaction from unrelated targets.
  room.crystals=[];room.asteroids=[rock];room.replenishFields=()=>{};
  for(let hit=1;hit<=3;hit++){
    const expectedTime=now+200;
    const snapshots=Promise.all(clients.map(c=>nextState(c,s=>s.now===expectedTime)));
    clients[0].emit('input',{matchId:room.matchId,seq:hit,x:0,y:0,angle:0,pulse:true});
    // A following acknowledged action is a delivery barrier on the same socket.
    assert.equal((await action(0,'wordMode',{enter:false})).ok,true);
    assert.equal(pilot.input.pulse,true);
    now=expectedTime;server.tick();
    const states=await snapshots;
    for(const state of states){
      assert.deepEqual(state.asteroids,states[0].asteroids);assert.deepEqual(state.letters,states[0].letters);
      assert.ok(state.players.every(p=>p.score===0));
      if(hit<3){assert.equal(state.asteroids[0].hitsRemaining,3-hit);assert.equal(state.letters.length,0);}
      else {
        assert.equal(state.asteroids.length,0);assert.equal(state.letters.length,4);
        assert.equal(new Set(state.letters.map(l=>l.id)).size,4);
        assert.ok(state.letters.every(l=>l.ownerId===host.playerId&&l.priorityUntil===now+RULES.priorityMs));
        assert.equal(state.events.filter(e=>e.type==='asteroidOpen').length,1);
      }
    }
  }
  const module=await fetch(url+'/asteroids.js');assert.equal(module.status,200);assert.equal(module.headers.get('cache-control'),'no-cache');
});
test('eight independent clients share a match; room isolation, roles, retry safety, and reconnect hold',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT','STAR','PLANET'])});
  const address=await server.listen();
  const url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<10;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Pilot 1'});assert.equal(host.ok,true);
  const joins=[host];for(let i=1;i<8;i++)joins.push(await call(clients[i],'join',{code:host.code,name:'Pilot '+(i+1)}));
  assert.ok(joins.every(r=>r.ok));
  const other=await call(clients[8],'join',{create:true,name:'Other room'});assert.notEqual(other.code,host.code);
  const room=server.rooms.get(host.code),send=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  const forbidden=await send(1,'settings',{mode:'teams',minutes:5,disruption:true});assert.equal(forbidden.ok,false);
  const chosenShips=joins.map((_,i)=>FLEET[(i+3)%8].id);
  const selectionRequests=joins.map(()=>crypto.randomUUID());
  for(let i=0;i<8;i++){
    // A supplied playerId cannot change someone else's ship.
    const choice=await send(i,'ship',{shipId:chosenShips[i],playerId:host.playerId},selectionRequests[i]);
    assert.equal(choice.ok,true);assert.equal(choice.self.shipId,chosenShips[i]);
    assert.equal(room.players.get(host.playerId).shipId,chosenShips[0]);
  }
  assert.equal((await send(1,'ship',{shipId:'../../icon.svg'})).ok,false);
  for(let i=0;i<8;i++)assert.equal((await send(i,'ready',{ready:true})).ok,true);
  assert.equal((await send(1,'ship',{shipId:chosenShips[1]},selectionRequests[1])).ok,true);
  assert.equal(room.players.get(joins[1].playerId).ready,true); // Retry must not undo ready.
  assert.equal((await send(0,'start')).ok,true);now+=3100;server.tick();
  assert.equal((await send(1,'ship',{shipId:FLEET[0].id})).ok,false);
  const spectator=await call(clients[9],'join',{code:host.code,name:'Spectator'});assert.equal(spectator.ok,true);
  assert.equal(room.players.get(spectator.playerId).role,'spectator');
  assert.deepEqual(spectator.state.players.filter(p=>p.role==='player').map(p=>p.shipId),chosenShips);
  assert.equal((await send(9,'wordMode',{enter:true})).ok,false);
  const observations=Array(8).fill(null);
  for(let i=0;i<8;i++)clients[i].on('state',s=>observations[i]=s);
  const p=room.players.get(host.playerId);
  p.x=100;p.y=100;p.vx=RULES.speed;p.protectionUntil=0;
  room.crystals=[];
  room.letters=[['c','T',140],['a','C',136],['b','A',138]].map(([id,letter,x])=>({
    id,letter,x,y:100,ownerId:p.id,team:p.team,priorityUntil:now+2000,expiresAt:now+30000
  }));
  room.input(p.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:false},now);
  now+=100;server.tick();
  assert.equal(p.tray.map(tile=>tile.letter).join(''),'CAT');
  await new Promise(resolve=>setTimeout(resolve,60));
  assert.equal(observations[0].self.tray.map(tile=>tile.letter).join(''),'CAT');
  const requestId=crypto.randomUUID();
  assert.equal((await send(0,'wordMode',{enter:true})).ok,true);
  const rearranged=await send(0,'submit',{tileIds:['c','b','a']});
  assert.equal(rearranged.ok,false);assert.match(rearranged.error,/contiguous range/);
  assert.equal(p.score,0);assert.equal(p.tray.length,3);
  const scored=await send(0,'submit',{tileIds:['a','b','c']},requestId);assert.equal(scored.value.points,5);
  assert.equal((await send(0,'submit',{tileIds:['a','b','c']},requestId)).value.points,5);assert.equal(p.score,5);
  now+=100;server.tick();
  await new Promise(resolve=>setTimeout(resolve,100));
  for(let i=0;i<8;i++){
    assert.deepEqual(observations[i].players.filter(p=>p.role==='player').map(p=>p.shipId),chosenShips);
    assert.equal(observations[i].players.find(p=>p.id===host.playerId).score,5);
    assert.equal(observations[i].code,host.code);assert.equal(observations[i].endAt,room.endAt);
    assert.equal(observations[i].self.id,joins[i].playerId);
  }
  assert.equal(server.rooms.get(other.code).phase,'lobby');
  const oldToken=joins[1].token,id=joins[1].playerId;clients[1].disconnect();
  await new Promise(resolve=>setTimeout(resolve,30));assert.equal(room.players.get(id).connected,false);
  const replacement=await connect(url);clients.push(replacement);
  const resumed=await call(replacement,'resume',{token:oldToken});assert.equal(resumed.ok,true);assert.equal(resumed.playerId,id);
  assert.equal(resumed.state.players.find(p=>p.id===id).shipId,chosenShips[1]);
  assert.equal((await call(clients[9],'action',{requestId:crypto.randomUUID(),matchId:room.matchId,type:'submit',payload:{tileIds:['a','b','c']}})).ok,false);
  now=room.endAt;server.tick();
  assert.equal(room.phase,'results');assert.deepEqual(room.results.winners,[host.playerId]);
  assert.equal((await send(0,'submit',{tileIds:[]})).ok,false);
  assert.equal((await send(0,'lobby')).ok,true);
  assert.equal(room.phase,'lobby');assert.equal(p.score,0);assert.equal(p.used.size,0);
  assert.deepEqual(room.active().map(p=>p.shipId),chosenShips);
  assert.equal((await send(9,'ship',{shipId:FLEET[0].id})).ok,false);
  assert.equal((await send(9,'claim')).ok,false); // all eight active seats are retained
  const health=await fetch(url+'/health');assert.equal(health.status,200);assert.equal((await health.json()).version,VERSION);
  const html=await fetch(url);assert.equal(html.status,200);assert.match(await html.text(),/OUTSPELL/);
  const dict=await fetch(url+'/api/dictionary');assert.equal((await dict.json()).entries,3);
  const script=await fetch(url+'/socket.io/socket.io.js');assert.equal(script.status,200);
  for(const ship of FLEET){
    const sprite=await fetch(url+ship.src);assert.equal(sprite.status,200);assert.match(sprite.headers.get('content-type'),/image\/png/);
    const png=new Uint8Array(await sprite.arrayBuffer());assert.deepEqual([...png.slice(0,8)],[137,80,78,71,13,10,26,10]);
  }
  const app=await fetch(url+'/app.js?v='+VERSION);assert.equal(app.status,200);assert.equal(app.headers.get('cache-control'),'no-cache');
});
test('a long-running room survives a simultaneous brief disconnect',{timeout:8000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  const a=await connect(url),b=await connect(url);clients.push(a,b);
  const join=await call(a,'join',{create:true,name:'Alpha'});
  await call(b,'join',{code:join.code,name:'Beta'});
  now+=120000;a.disconnect();b.disconnect();
  await new Promise(resolve=>setTimeout(resolve,30));server.tick();
  assert.ok(server.rooms.has(join.code));
  now+=1000;const replacement=await connect(url);clients.push(replacement);
  const resumed=await call(replacement,'resume',{token:join.token});
  assert.equal(resumed.ok,true);
});

test('eight clients synchronize defense, boost, bounties and meteors; retries repair only once and Earth loss ends all screens',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['STAR'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<9;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Alpha'});
  for(let i=1;i<8;i++)assert.equal((await call(clients[i],'join',{code:host.code,name:'Pilot '+i})).ok,true);
  const separate=await call(clients[8],'join',{create:true,name:'Separate'});
  const room=server.rooms.get(host.code),other=server.rooms.get(separate.code);
  const action=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  for(let i=0;i<8;i++)assert.equal((await action(i,'ready',{ready:true})).ok,true);
  assert.equal((await action(0,'start')).ok,true);now=room.startAt+2100;server.tick();
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  room.active().forEach((p,i)=>Object.assign(p,{x:100+i*250,y:100,protectionUntil:0}));
  const boostId=crypto.randomUUID();assert.equal((await action(0,'boost',{x:1,y:0,earthHealth:999},boostId)).ok,true);
  const pilot=room.players.get(host.playerId),readyAt=pilot.boostReadyAt;
  assert.equal((await action(0,'boost',{x:1,y:0},boostId)).ok,true);assert.equal(pilot.boostReadyAt,readyAt);
  assert.equal((await action(0,'boost',{x:1,y:0})).ok,false);
  async function snapshot(time){
    const pending=Promise.all(clients.slice(0,8).map(c=>nextState(c,s=>s.now===time)));
    now=time;server.tick();return pending;
  }
  let states=await snapshot(now+100);
  for(const s of states){
    assert.equal(s.players.find(p=>p.id===host.playerId).boostUntil,pilot.boostUntil);
    assert.equal(s.defense.earthHealth,100);
  }
  assert.equal(states[0].self.boostReadyAt,readyAt);assert.equal(states[1].self.boostReadyAt,0);
  pilot.tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
  now=room.startAt+RULES.bountyFirstMs;server.tick();assert.equal(room.bounty.word,'STAR');
  room.defense.earthHealth=90;
  const firstTwo=room.active().slice(0,2),requests=[crypto.randomUUID(),crypto.randomUUID()];
  for(let i=0;i<2;i++){
    firstTwo[i].tray=[...'STAR'].map(letter=>({id:room.id(),letter}));
    assert.equal((await action(i,'wordMode',{enter:true})).ok,true);
  }
  const submissions=await Promise.all(firstTwo.map((p,i)=>action(i,'submit',{tileIds:p.tray.map(l=>l.id),earthHealth:1000,barrierThickness:1000},requests[i])));
  assert.ok(submissions.every(s=>s.ok));assert.deepEqual(submissions.map(s=>s.value.bonus).sort((a,b)=>a-b),[0,20]);
  assert.equal(room.defense.earthHealth,94);assert.equal(room.defense.barrierThickness,9);
  const priorScore=firstTwo[0].score;
  assert.equal((await action(0,'submit',{tileIds:[]},requests[0])).ok,true);
  assert.equal(room.defense.earthHealth,94);assert.equal(room.defense.barrierThickness,9);assert.equal(firstTwo[0].score,priorScore);
  states=await snapshot(now+100);
  for(const s of states){assert.deepEqual(s.defense,states[0].defense);assert.equal(s.bounty.claimedBy,room.bounty.claimedBy);}
  assert.equal(other.defense.earthHealth,100);assert.equal(other.defense.barrierThickness,5);
  states=await snapshot(room.startAt+RULES.showerFirstMs);
  for(const s of states){assert.equal(s.asteroids.filter(a=>a.kind==='meteor').length,4);assert.deepEqual(s.asteroids,states[0].asteroids);}
  // Fatal damage: synchronized early results, no stale submit can revive Earth.
  room.defense.earthHealth=5;
  room.letters=[{id:room.id(),letter:'Z',incoming:true,x:room.defense.x+room.defense.barrierRadius,y:room.defense.y,
    vx:-40,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:now+30000}];
  states=await snapshot(now+100);
  for(const s of states){assert.equal(s.phase,'results');assert.equal(s.defense.earthHealth,0);assert.equal(s.results.reason,'earth-lost');assert.deepEqual(s.results.winners,[]);}
  assert.equal((await action(1,'submit',{tileIds:[]})).ok,false);assert.equal(room.defense.earthHealth,0);
  const restore=await connect(url);clients.push(restore);
  clients[0].disconnect();await new Promise(resolve=>setTimeout(resolve,30));
  const resumed=await call(restore,'resume',{token:host.token});assert.equal(resumed.ok,true);
  assert.equal(resumed.state.defense.earthHealth,0);assert.equal(resumed.state.results.reason,'earth-lost');
  for(const asset of ['/defense.js','/planet.js','/objectives.js','/assets/asteroids/rock-v15.png'])assert.equal((await fetch(url+asset)).status,200);
});

test('eight clients agree on all milestone powers, damage immunity, EMP tiles and slow motion; retries and reconnect preserve expiry',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT','DOG','STAR','MOON'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<10;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Alpha'});
  for(let i=1;i<8;i++)assert.equal((await call(clients[i],'join',{code:host.code,name:'Pilot '+i})).ok,true);
  const separate=await call(clients[8],'join',{create:true,name:'Separate'}),room=server.rooms.get(host.code);
  const action=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  assert.equal((await action(0,'settings',{mode:'teams',minutes:3,disruption:false,defense:true})).ok,true);
  for(let i=0;i<8;i++)await action(i,'ready',{ready:true});
  await action(0,'start');now=room.startAt+2100;server.tick();
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  room.active().forEach((p,i)=>Object.assign(p,{x:100+i*250,y:100,protectionUntil:0}));
  const watcher=await call(clients[9],'join',{code:host.code,name:'Watcher'});assert.equal(watcher.state.players.find(p=>p.id===watcher.playerId).role,'spectator');
  assert.equal((await action(9,'activatePowerUp',{kind:'INVULNERABILITY',powerUpTimer:99999})).ok,false);
  const pilots=room.active(),catalog=['CAT','DOG','STAR','MOON'];
  const tile=x=>({id:room.id(),letter:'A',incoming:true,x,y:room.defense.y,vx:-100,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:now+30000});
  async function snapshots(time){const pending=Promise.all([...clients.slice(0,8),clients[9]].map(c=>nextState(c,s=>s.now===time)));now=time;server.tick();return pending;}
  for(const [cycle,kind]of ['INVULNERABILITY','EMP_BLAST','SLOW_MOTION'].entries()){
    room.random=()=>[0,.5,.99][cycle];
    const empTile=tile(1800);if(kind==='EMP_BLAST')room.letters=[empTile];
    let requestId,lastPilotIndex;
    for(let j=0;j<5;j++){
      const n=cycle*5+j,i=2*(n%4),p=pilots[i],word=catalog[Math.floor(n/4)];lastPilotIndex=i;
      now+=250;p.tray=[...word].map(letter=>({id:room.id(),letter}));
      assert.equal((await action(i,'wordMode',{enter:true})).ok,true);
      requestId=crypto.randomUUID();
      const result=await action(i,'submit',{tileIds:p.tray.map(l=>l.id),currentPowerUp:'HACK',powerUpTimer:99999},requestId);
      assert.equal(result.ok,true);
    }
    const expiry=room.powerUps.endsAt;assert.equal(expiry,now+8000);assert.equal(room.powerUps.powerUpTimer,480);
    const combo=(cycle+1)*5,score=pilots[lastPilotIndex].score;
    assert.equal((await action(lastPilotIndex,'submit',{tileIds:[]},requestId)).ok,true);
    assert.equal(pilots[lastPilotIndex].score,score);assert.equal(room.powerUps.comboWords['team-0'],combo);assert.equal(room.powerUps.endsAt,expiry);
    if(kind==='INVULNERABILITY')room.letters=[tile(room.defense.x+room.defense.barrierRadius)];
    const slowTile=tile(1800);if(kind==='SLOW_MOTION')room.letters=[slowTile];
    const states=await snapshots(now+100);
    for(const state of states){
      assert.deepEqual(state.powerUps,states[0].powerUps);assert.equal(state.powerUps.currentPowerUp,kind);
      assert.equal(state.powerUps.powerUpTimer,474);assert.equal(state.powerUps.endsAt,expiry);assert.equal(state.powerUps.comboWords['team-0'],combo);
      assert.equal(state.defense.earthHealth,100);assert.deepEqual(state.letters,states[0].letters);
      if(kind==='EMP_BLAST'){assert.equal(state.letters[0].id,empTile.id);assert.equal(state.letters[0].incoming,false);assert.equal(state.letters[0].x,1800);}
      if(kind==='SLOW_MOTION')assert.equal(state.letters[0].x,1796);
    }
  }
  assert.equal(server.rooms.get(separate.code).powerUps.currentPowerUp,null);
  const expiresAt=room.powerUps.endsAt;
  clients[0].disconnect();await new Promise(resolve=>setTimeout(resolve,30));
  const resumedClient=await connect(url);clients.push(resumedClient);
  const resumed=await call(resumedClient,'resume',{token:host.token});assert.equal(resumed.ok,true);
  assert.equal(resumed.state.powerUps.currentPowerUp,'SLOW_MOTION');assert.equal(resumed.state.powerUps.endsAt,expiresAt);
  const pending=nextState(resumedClient,s=>s.now===expiresAt);now=expiresAt;server.tick();
  const ended=await pending;assert.equal(ended.powerUps.currentPowerUp,null);assert.equal(ended.powerUps.powerUpTimer,0);
  assert.equal((await fetch(url+'/power-ups.js')).status,200);assert.equal((await fetch(url+'/neon.js')).status,200);
});

test('eight clients receive only their own word advice and retrying a suggested-prefix submission keeps leftovers and scores once',{timeout:15000},async t=>{
  let now=100000;
  const server=createGameServer({clock:()=>now,testMode:true,autoTick:false,words:new Set(['CAT','DOG'])});
  const address=await server.listen(),url='http://127.0.0.1:'+address.port,clients=[];
  t.after(async()=>{clients.forEach(c=>c.disconnect());await server.close();});
  for(let i=0;i<9;i++)clients.push(await connect(url));
  const host=await call(clients[0],'join',{create:true,name:'Alpha'}),room=server.rooms.get(host.code);
  for(let i=1;i<8;i++)await call(clients[i],'join',{code:host.code,name:'Pilot '+i});
  const act=(i,type,payload={},requestId=crypto.randomUUID())=>call(clients[i],'action',{requestId,matchId:room.matchId,type,payload});
  for(let i=0;i<8;i++)await act(i,'ready',{ready:true});await act(0,'start');now=room.startAt+2100;server.tick();
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  const watcher=await call(clients[8],'join',{code:host.code,name:'Watcher'});assert.equal(watcher.state.self.wordGuide,null);
  const pilots=room.active();pilots.forEach((p,i)=>{p.tray=[...(i%2?'DOGX':'CATX')].map(letter=>({id:room.id(),letter}));p.x=100+i*200;p.y=100;p.protectionUntil=0;});
  const nextAt=now+100,pending=Promise.all(clients.map(c=>nextState(c,s=>s.now===nextAt)));now=nextAt;server.tick();const states=await pending;
  for(let i=0;i<8;i++){
    assert.equal(states[i].self.wordGuide.best.word,i%2?'DOG':'CAT');
    assert.deepEqual(states[i].self.tray,pilots[i].tray);
    assert.ok(states[i].players.every(p=>!('wordGuide'in p)&&!('tray'in p)));
  }
  assert.equal(states[8].self.wordGuide,null);assert.deepEqual(states[8].self.tray,[]);
  await act(0,'wordMode',{enter:true});const prefix=pilots[0].tray.slice(0,3).map(t=>t.id),requestId=crypto.randomUUID();
  const result=await act(0,'submit',{tileIds:prefix,wordGuide:{best:{word:'HACK',points:9999}}},requestId);
  assert.equal(result.ok,true);assert.equal(result.value.word,'CAT');assert.equal(result.value.points,5);assert.equal(result.self.tray.map(t=>t.letter).join(''),'X');
  const retry=await act(0,'submit',{tileIds:prefix},requestId);assert.equal(retry.ok,true);assert.equal(pilots[0].score,5);assert.equal(pilots[0].tray.length,1);
  const savedState=room.privateState(pilots[1].id,now);assert.equal(savedState.wordGuide.best.word,'DOG');assert.equal(pilots[1].score,0);
  assert.equal((await fetch(url+'/practice.js')).status,200);assert.equal((await fetch(url+'/word-guide.js')).status,200);
});
GLYPHSTORM_079D35626EBB80EA

# FILE: test/polish.test.mjs
cat > 'test/polish.test.mjs' <<'GLYPHSTORM_30BE0660AA0AB957'
import test from 'node:test';
import assert from 'node:assert/strict';
import {GameRoom} from '../server/game.mjs';
import {scoreWord,WORLD} from '../public/rules.js';
import {WordEnergy,energyPath,wordRewardLabel,ENERGY_RULES} from '../public/word-energy.js';
import {CompactHUD} from '../public/compact-hud.js';
import {SIGNAL_TYPES,signalText} from '../public/signals.js';
import {MatchFeedback} from '../public/match-feedback.js';
function setup(mode='teams',defense=true){
  const room=new GameRoom('POLISH',{words:new Set(['CAT','STAR','DOG']),now:1000});
  const players=Array.from({length:4},(_,i)=>room.addPlayer('Pilot '+i,1000+i));
  room.configure(players[0].id,{mode,minutes:3,defense,disruption:false});players.forEach(p=>p.ready=true);
  room.start(players[0].id,1000);room.tick(0,4000);room.replenishFields=()=>{};room.asteroids=[];room.crystals=[];
  return {room,players};
}
function spell(room,p,word,now=7000){
  p.tray=[...word].map(letter=>({id:room.id(),letter}));room.wordMode(p.id,true,now);
  return room.submit(p.id,p.tray.map(t=>t.id),now);
}
test('word feedback reports actual capped repair and growth without changing scoring',()=>{
  const {room,players:[p]}=setup();room.defense.earthHealth=99;room.defense.barrierThickness=24.5;
  const entry=spell(room,p,'CAT');assert.equal(entry.points,scoreWord('CAT'));
  assert.equal(entry.defenseReward.hp,1);assert.equal(entry.defenseReward.shield,.5);
  assert.equal(wordRewardLabel(entry.defenseReward),'EARTH +1 HP · SHIELD +0.5');
  const event=room.events.find(e=>e.type==='word');assert.deepEqual(event.defenseReward,entry.defenseReward);
  const feedback=new MatchFeedback();assert.deepEqual(feedback.word(entry).defenseReward,entry.defenseReward);
  assert.equal(feedback.word(event),null);
  const second=spell(room,p,'STAR');assert.equal(wordRewardLabel(second.defenseReward),'EARTH FULL · SHIELD AT MAX');
  assert.throws(()=>spell(room,p,'STAR'),/already scored/);
  assert.equal(p.score,scoreWord('CAT')+scoreWord('STAR'));
  const classic=setup('ffa',false);assert.equal(spell(classic.room,classic.players[0],'CAT').defenseReward,null);
  assert.equal(wordRewardLabel(null),'');
});
test('team signals disclose only to teammates, reject unsupported requests and respect cooldown/expiry/rematch',()=>{
  const {room,players:[a,b,c]}=setup();const spectator=room.addPlayer('Watcher',7000);
  const score=a.score,tray=structuredClone(a.tray),health=room.defense.earthHealth;
  room.signal(a.id,{kind:SIGNAL_TYPES.NEED_LETTER,letter:'A',team:b.team,scope:'all',playerId:b.id,x:99,y:99},7000);
  const signal=room.privateState(c.id,7000).signals[0];assert.equal(signalText(signal),'Need A');
  assert.equal(signal.playerId,a.id);assert.equal(signal.team,a.team);assert.equal(signal.x,a.x);
  assert.equal(room.privateState(b.id,7000).signals.length,0);assert.equal(room.privateState(spectator.id,7000).signals.length,0);
  assert.equal(room.publicState(7000).signals,undefined);assert.ok(room.events.every(e=>!e.kind?.includes('letter')));
  assert.throws(()=>room.signal(a.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},11999),/recharge/);
  assert.throws(()=>room.signal(spectator.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},7000),/Spectators/);
  assert.throws(()=>room.signal(b.id,{kind:SIGNAL_TYPES.NEED_LETTER,letter:'<script>'},7000),/one letter/);
  assert.throws(()=>room.signal(b.id,{kind:'free-chat',text:'hello'},7000),/preset/);
  assert.equal(room.privateState(c.id,13000).signals.length,0);
  room.signal(a.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},13000);
  assert.equal(room.privateState(c.id,13000).signals[0].x,room.defense.x);
  assert.equal(room.privateState(b.id,13000).signals.length,0);
  assert.equal(a.score,score);assert.deepEqual(a.tray,tray);assert.equal(room.defense.earthHealth,health);
  room.finish(room.endAt);assert.deepEqual(room.privateState(a.id,room.endAt).signals,[]);
  room.lobby(a.id,room.endAt+1);assert.equal(a.signalReadyAt,0);assert.deepEqual(room.signals,[]);
});
test('FFA shares only defense presets with pilots, while classic teams can still request letters',()=>{
  const {room,players:[a,b]}=setup('ffa');
  assert.throws(()=>room.signal(a.id,{kind:SIGNAL_TYPES.NEED_LETTER,letter:'A'},7000),/team/);
  room.signal(a.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},7000);
  assert.equal(room.privateState(b.id,7000).signals.length,1);assert.equal(room.signals[0].scope,'all');
  const classic=setup('teams',false),p=classic.players[0];
  assert.throws(()=>classic.room.signal(p.id,{kind:SIGNAL_TYPES.DEFEND_EARTH},7000),/off/);
  classic.room.signal(p.id,{kind:SIGNAL_TYPES.NEED_LETTER,letter:'Z'},7000);
  assert.equal(classic.room.signals.length,1);
});
test('word energy takes a short torus path and is bounded, deduplicated, expired and reset',()=>{
  const reward={x:20,y:800,barrierRadius:10,hp:2,shield:1.5};
  const event={seq:1,type:'word',word:'CAT',x:WORLD.width-20,y:800,at:7000,defenseReward:reward};
  const path=energyPath(event);assert.equal(path.dx,30);assert.equal(path.dy,0);
  const state={matchId:'one',phase:'countdown',now:7000,defense:{enabled:true},events:[]},energy=new WordEnergy();
  energy.update(state,0);state.phase='playing';state.events=[event];energy.update(state,10);energy.update(state,20);
  assert.equal(energy.effects.length,1);
  state.events=Array.from({length:40},(_,i)=>({...event,seq:i+2}));energy.update(state,100);
  assert.equal(energy.effects.length,ENERGY_RULES.maxEffects);
  const calls=[],ctx={save(){},restore(){},beginPath(){},arc(...a){calls.push(['arc',...a]);},stroke(){},fillText(...a){calls.push(['text',...a]);}};
  const project=(x,y)=>({x,y});energy.draw(ctx,project,1,200,true);
  assert.ok(calls.some(c=>c[0]==='arc'));assert.ok(calls.every(c=>c[0]!=='text'));
  energy.draw(ctx,project,1,250,false);assert.ok(calls.some(c=>c[0]==='text'));
  energy.draw(ctx,project,1,3000);assert.equal(energy.effects.length,0);
  state.events=[{...event,seq:60,at:0}];energy.update(state,3100);assert.equal(energy.effects.length,0);
  state.matchId='two';state.events=[{...event,seq:61}];energy.update(state,3200);assert.equal(energy.effects.length,0); // late join never replays
  state.events.push({...event,seq:62});energy.update(state,3300);assert.equal(energy.effects.length,1);
  state.phase='results';energy.update(state,3400);assert.equal(energy.effects.length,0);
});
test('compact HUD moves the same live nodes, restores their order and closes on resize/exit',()=>{
  class Element{
    constructor(id){this.id=id;this.children=[];this.parent=null;this.open=false;}
    append(el){if(el.parent)el.parent.children.splice(el.parent.children.indexOf(el),1);el.parent=this;this.children.push(el);}
    before(el){this.parent.append(el);this.parent.children.pop();this.parent.children.splice(this.parent.children.indexOf(this),0,el);}
    after(el){if(el.parent)el.parent.children.splice(el.parent.children.indexOf(el),1);el.parent=this.parent;this.parent.children.splice(this.parent.children.indexOf(this)+1,0,el);}
    close(){this.open=false;}
  }
  const ids=['powerUpCard','bountyCard','meteorCard','scoreboard','soundButton','motionButton','telemetryDialog','telemetryObjectives','telemetryScores','telemetryPreferences'];
  const elements=new Map(ids.map(id=>[id,new Element(id)])),parent=new Element('desktop');ids.slice(0,6).forEach(id=>parent.append(elements.get(id)));
  const media={matches:true,addEventListener(type,fn){this.change=fn;}},doc={getElementById:id=>elements.get(id),createComment:()=>new Element(null)};
  const hud=new CompactHUD(doc,media),same=elements.get('powerUpCard');hud.setActive(true);
  assert.equal(same.parent.id,'telemetryObjectives');assert.equal(elements.get('scoreboard').parent.id,'telemetryScores');
  same.liveValue='VIOLET GUARD';elements.get('telemetryDialog').open=true;media.matches=false;media.change();
  assert.equal(elements.get('telemetryDialog').open,false);assert.equal(same.parent,parent);assert.equal(same.liveValue,'VIOLET GUARD');
  assert.deepEqual(parent.children.filter(n=>n.id).map(n=>n.id),ids.slice(0,6));
  media.matches=true;media.change();elements.get('telemetryDialog').open=true;hud.setActive(false);
  assert.equal(elements.get('telemetryDialog').open,false);assert.equal(elements.get('soundButton').parent,parent);
});
GLYPHSTORM_30BE0660AA0AB957

# FILE: test/power-ups.test.mjs
cat > 'test/power-ups.test.mjs' <<'GLYPHSTORM_6F8D0E0B230AD0A2'
import test from 'node:test';
import assert from 'node:assert/strict';
import {GameRoom} from '../server/game.mjs';
import {RULES,scoreWord} from '../public/rules.js';
import {POWER_UPS,POWER_RULES,comboKey,activePowerUp,syncPowerUpState,currentPowerUp,powerUpTimer,powerUpStatus,incomingSpeedFactor} from '../public/power-ups.js';
import {drawEarth} from '../public/planet.js';
import {drawNeonGrid,letterGlow} from '../public/neon.js';
const words=['CAT','DOG','STAR','MOON','SUN','PLANET','COMET','NOVA','DUST','GLOW'];
function setup(mode='ffa',defense=true,count=2){
  let seed=81;
  const room=new GameRoom('POWERX',{words:new Set(words),now:1000,random:()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296)});
  const players=Array.from({length:count},(_,i)=>room.addPlayer('Pilot '+i,1000+i));
  room.configure(players[0].id,{mode,minutes:3,defense,disruption:false});players.forEach(p=>p.ready=true);
  room.start(players[0].id,1000);room.tick(0,4000);room.replenishFields=()=>{};room.crystals=[];room.asteroids=[];
  players.forEach((p,i)=>Object.assign(p,{x:100+i*250,y:100,protectionUntil:0}));
  return {room,players};
}
function spell(room,p,text,now=7000){p.tray=[...text].map(letter=>({id:room.id(),letter}));room.wordMode(p.id,true,now);return room.submit(p.id,p.tray.map(l=>l.id),now);}
function incoming(room,x=1800){const l={id:room.id(),letter:'A',incoming:true,x,y:800,vx:-100,vy:0,ownerId:null,team:null,priorityUntil:0,expiresAt:50000};room.letters.push(l);return l;}

test('fifth valid word triggers each random power once with 480 frames and unchanged word points',()=>{
  for(const [index,kind]of Object.values(POWER_UPS).entries()){
    const {room,players:[p]}=setup();room.random=()=>(index+.1)/3;
    words.slice(0,4).forEach((w,i)=>spell(room,p,w,7000+i*100));assert.equal(room.powerUps.currentPowerUp,null);
    const entry=spell(room,p,words[4],7400);
    assert.equal(entry.points,scoreWord(words[4]));assert.equal(room.powerUps.currentPowerUp,kind);
    assert.equal(room.powerUps.powerUpTimer,480);assert.equal(room.powerUps.endsAt,15400);
    assert.equal(room.powerUps.comboWords[p.id],5);assert.equal(room.events.filter(e=>e.type==='powerUpStart').length,1);
  }
});

test('team combos combine teammates but not rivals; free-for-all keeps separate pilot combos',()=>{
  const {room,players:[a,b,c]}=setup('teams',true,4);
  assert.equal(a.team,c.team);assert.notEqual(a.team,b.team);
  spell(room,a,'CAT');spell(room,c,'CAT');spell(room,a,'DOG');spell(room,c,'DOG');spell(room,b,'CAT');
  assert.equal(room.powerUps.currentPowerUp,null);spell(room,c,'STAR');
  assert.equal(room.powerUps.comboWords['team-'+a.team],5);assert.equal(room.powerUps.comboWords['team-'+b.team],1);
  const ffa=setup(),[x,y]=ffa.players;words.slice(0,4).forEach(w=>spell(ffa.room,x,w));spell(ffa.room,y,'CAT');
  assert.equal(ffa.room.powerUps.currentPowerUp,null);assert.equal(ffa.room.powerUps.comboWords[x.id],4);
});

test('invalid or reused words reset only the owning combo and do not undo an active effect',()=>{
  const {room,players:[a,b]}=setup();words.slice(0,5).forEach(w=>spell(room,a,w));spell(room,b,'CAT');
  const ends=room.powerUps.endsAt,kind=room.powerUps.currentPowerUp;
  assert.throws(()=>spell(room,a,'ZZZ'),/dictionary/);assert.equal(room.powerUps.comboWords[a.id],0);assert.equal(room.powerUps.comboWords[b.id],1);
  assert.equal(room.powerUps.currentPowerUp,kind);assert.equal(room.powerUps.endsAt,ends);
  spell(room,a,'PLANET');assert.throws(()=>spell(room,a,'PLANET'),/already scored/);assert.equal(room.powerUps.comboWords[a.id],0);
});

test('each milestone replaces one effect, expires at eight seconds, and frame mirrors work at 30/60/120 FPS',()=>{
  const {room,players:[p]}=setup();room.random=()=>0;
  words.slice(0,5).forEach(w=>spell(room,p,w,7000));room.random=()=>.99;
  words.slice(5).forEach(w=>spell(room,p,w,10000));assert.equal(room.powerUps.currentPowerUp,POWER_UPS.SLOW_MOTION);
  assert.equal(room.powerUps.endsAt,18000);assert.equal(room.events.filter(e=>e.type==='powerUpStart').length,2);
  for(const fps of [30,60,120]){
    for(let frame=0;frame<=fps*8;frame++)syncPowerUpState(room.powerUps,10000+frame*1000/fps);
    assert.equal(currentPowerUp,null);assert.equal(powerUpTimer,0);
  }
  room.updatePowerUps(14000);assert.equal(room.powerUps.powerUpTimer,240);
  room.updatePowerUps(17999);assert.equal(room.powerUps.powerUpTimer,1);
  room.updatePowerUps(18000);room.updatePowerUps(19000);assert.equal(room.powerUps.currentPowerUp,null);
  assert.equal(room.events.filter(e=>e.type==='powerUpEnd').length,1);
});

test('invulnerability removes breaches without damage or red-flash state; expiry restores damage exactly once',()=>{
  const {room,players:[p]}=setup();room.defense.earthHealth=5;
  room.activatePowerUp(POWER_UPS.INVULNERABILITY,p,7000);let l=incoming(room,room.defense.x+190);
  room.tick(0,14999);assert.equal(room.defense.earthHealth,5);assert.equal(room.defense.lastImpactAt,0);assert.equal(room.defense.breaches,0);
  assert.ok(!room.letters.includes(l));assert.equal(room.phase,'playing');assert.equal(room.handleBarrierCollision(l,14999),false);
  l=incoming(room,room.defense.x+190);room.tick(0,15000);assert.equal(room.defense.earthHealth,0);assert.equal(room.phase,'results');
  assert.equal(room.events.filter(e=>e.type==='barrierBlock').length,1);assert.equal(room.events.filter(e=>e.type==='barrierImpact').length,1);
});

test('slow motion uses 0.4 displacement without compounding or changing ships, pulses, or base letter velocity',()=>{
  const {room,players:[p]}=setup();const l=incoming(room);p.vx=RULES.speed;
  room.activatePowerUp(POWER_UPS.SLOW_MOTION,p,7000);
  room.input(p.id,{seq:1,matchId:room.matchId,x:1,y:0,angle:0,pulse:true},7000);
  room.tick(.1,7100);assert.equal(l.x,1796);assert.equal(l.vx,-100);
  assert.equal(p.vx,RULES.speed);assert.equal(room.pulses[0].vx,RULES.pulseSpeed);
  room.tick(.1,7200);assert.equal(l.x,1792);assert.equal(l.vx,-100);
  room.tick(.1,15000);assert.equal(l.x,1782);assert.equal(l.vx,-100);assert.equal(incomingSpeedFactor(room.powerUps,15000),1);
});

test('EMP preserves safe letter identities and positions, neutralizes new waves only while active, and awards no points',()=>{
  const {room,players:[p]}=setup();const first=incoming(room),ordinary={...incoming(room,1900),incoming:false};room.letters[1]=ordinary;
  const original=structuredClone(ordinary);room.activatePowerUp(POWER_UPS.EMP_BLAST,p,7000);
  assert.equal(room.letters[0],first);assert.equal(first.x,1800);assert.equal(first.incoming,false);assert.equal(first.priorityUntil,0);assert.equal(first.vx,0);
  assert.deepEqual(ordinary,original);assert.equal(p.score,0);
  const later=incoming(room,1750);room.tick(.1,7100);assert.equal(later.incoming,false);assert.equal(later.x,1750);
  const after=incoming(room,1700);room.tick(.1,15000);assert.equal(after.incoming,true);assert.equal(after.x,1690);
  assert.equal(room.letters.length,4);assert.equal(p.score,0);
});

test('power-ups are per-room, disabled in classic, cleared at finish and reset on rematch',()=>{
  const {room,players:[p]}=setup(),other=setup().room;room.activatePowerUp(POWER_UPS.INVULNERABILITY,p,7000);
  assert.equal(other.powerUps.currentPowerUp,null);assert.notEqual(room.powerUps.comboWords,other.powerUps.comboWords);
  room.finish(room.endAt);assert.equal(room.powerUps.currentPowerUp,null);assert.equal(room.powerUps.powerUpTimer,0);
  room.lobby(p.id,room.endAt+1);room.active().forEach(p=>p.ready=true);room.start(p.id,room.endAt+1000);
  assert.deepEqual(room.powerUps.comboWords,{});assert.equal(room.powerUps.currentPowerUp,null);
  const classic=setup('ffa',false);words.slice(0,5).forEach(w=>spell(classic.room,classic.players[0],w));
  assert.equal(classic.room.powerUps.currentPowerUp,null);assert.deepEqual(classic.room.powerUps.comboWords,{});
});

test('shared countdown displays the owning team and spectators see the same effect with stale expiry handled',()=>{
  const {room,players:[p]}=setup('teams');room.activatePowerUp(POWER_UPS.SLOW_MOTION,p,7000);
  room.powerUps.comboWords[comboKey(p,'teams')]=5;
  const state=room.publicState(7000),view=powerUpStatus(state,p.id,9000),watch=powerUpStatus(state,'watcher',9000);
  assert.equal(view.kind,POWER_UPS.SLOW_MOTION);assert.equal(view.timer,'6.0s');assert.match(view.source,/Aurora/);
  assert.equal(watch.timer,view.timer);assert.match(watch.combo,/Every 5/);assert.equal(powerUpStatus(state,p.id,15000).kind,null);
});

test('neon grid animates and freezes for reduced motion; letters glow and violet shield returns to cyan on expiry',()=>{
  function context(){const calls=[];const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},
    {get:(o,k)=>k in o?o[k]:(...args)=>calls.push([k,...args]),set:(o,k,v)=>{calls.push([k,v]);o[k]=v;return true;}});return {ctx,calls};}
  const a=context(),b=context(),c=context(),d=context();
  drawNeonGrid(a.ctx,800,600,0);drawNeonGrid(b.ctx,800,600,1000);assert.notDeepEqual(a.calls,b.calls);
  drawNeonGrid(c.ctx,800,600,0,true);drawNeonGrid(d.ctx,800,600,1000,true);assert.deepEqual(c.calls,d.calls);
  letterGlow(a.ctx,{color:'#ff2bd6'});assert.equal(a.ctx.shadowBlur,10);assert.equal(a.ctx.shadowColor,'#ff2bd6');
  const {room,players:[p]}=setup();room.activatePowerUp(POWER_UPS.INVULNERABILITY,p,7000);
  drawEarth(a.ctx,300,300,1,room.defense,null,room.powerUps,7000);
  assert.ok(a.calls.some(([k,v])=>k==='shadowColor'&&v==='#bd00ff'));assert.ok(a.calls.some(([k,v])=>k==='lineWidth'&&v>=12));
  drawEarth(b.ctx,300,300,1,room.defense,null,room.powerUps,15000);
  assert.ok(b.calls.some(([k,v])=>k==='shadowColor'&&v==='#00f3ff'));assert.ok(b.calls.some(([k,v])=>k==='lineWidth'&&v===5));
});
GLYPHSTORM_6F8D0E0B230AD0A2

# FILE: test/rotation.test.mjs
cat > 'test/rotation.test.mjs' <<'GLYPHSTORM_0466FDB0F43BE503'
import test from 'node:test';
import assert from 'node:assert/strict';
import { AimControls, vectorAngle, wrapAngle } from '../public/aim.js';
import { Arena } from '../public/arena.js';
import { FLEET } from '../public/fleet.js';
import { GameRoom } from '../server/game.mjs';
import { RULES } from '../public/rules.js';
const TAU=Math.PI*2;
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);

test('held turn keys sweep the full circle at the same speed across frame rates and hold on release',()=>{
  for(const fps of [30,60,120])for(const direction of [-1,1]){
    const aim=new AimControls(.31);
    aim.point(99,99); // A stale mouse position must not override keyboard turning.
    for(let frame=1;frame<=fps*2;frame++){
      const angle=aim.update(1/fps,direction<0,direction>0,()=>1.2);
      const expected=.31+direction*Math.PI*frame/fps;
      near(Math.cos(angle),Math.cos(expected));near(Math.sin(angle),Math.sin(expected));
    }
    near(aim.update(.5,false,false,()=>2.4),wrapAngle(.31));
    const held=aim.angle;aim.update(.5,true,true,()=>1);near(aim.angle,held);
  }
});

test('mouse and touch aiming cover every quadrant, retain dead-zone headings, and follow a moving origin',()=>{
  const aim=new AimControls();
  let origin={x:30,y:70};
  const aimAt=(x,y)=>vectorAngle(x-origin.x,y-origin.y,aim.angle,2);
  for(let degrees=0;degrees<360;degrees+=7.5){
    const angle=degrees*Math.PI/180,x=Math.cos(angle),y=Math.sin(angle);
    aim.point(origin.x+x*100,origin.y+y*100);
    aim.update(0,false,false,aimAt);
    near(Math.cos(aim.angle),x);near(Math.sin(aim.angle),y);
    assert.equal(aim.stick(x,y),true);
    near(Math.cos(aim.angle),x);near(Math.sin(aim.angle),y);
    const held=aim.angle;assert.equal(aim.stick(.05,.05),false);near(aim.angle,held);
  }
  aim.point(130,70);aim.update(0,false,false,aimAt);near(aim.angle,0);
  origin={x:130,y:170};aim.update(0,false,false,aimAt);near(aim.angle,Math.PI*1.5);
  aim.point(origin.x,origin.y);aim.update(0,false,false,aimAt);near(aim.angle,Math.PI*1.5);
  aim.hold();assert.equal(aim.pointer,null);
});

test('every ship renderer applies full-circle mouse and synchronized player headings',t=>{
  const previousDpr=globalThis.devicePixelRatio;globalThis.devicePixelRatio=1;
  t.after(()=>{if(previousDpr===undefined)delete globalThis.devicePixelRatio;else globalThis.devicePixelRatio=previousDpr;});
  let heading=0;const stack=[],seen=[];
  const ctx=new Proxy({
    save(){stack.push(heading);},restore(){heading=stack.pop();},rotate(a){heading+=a;},
    setTransform(){heading=0;},createRadialGradient(){return {addColorStop(){}};},createLinearGradient(){return {addColorStop(){}};}
  },{get:(object,key)=>key in object?object[key]:(()=>{})});
  const canvas={width:1000,height:600,clientHeight:600,getContext:()=>ctx,
    getBoundingClientRect:()=>({left:23,top:47,width:1000,height:600})};
  const input={x:0,y:0,angle:0,pulse:false};
  const arena=new Arena(canvas,canvas,()=>input);
  const pilot={id:'pilot',shipId:FLEET[0].id,role:'player',x:1200,y:800,vx:0,vy:0,angle:0,
    color:'#70f7d1',name:'Pilot',connected:true,stability:3,resetUntil:0,shieldUntil:0,protectionUntil:0};
  arena.ships.draw=(_,shipId)=>{seen.push({shipId,x:Math.cos(heading),y:Math.sin(heading)});return true;};
  arena.state={matchId:'round',phase:'playing',now:0,players:[pilot],crystals:[],
    asteroids:[{id:'rock',x:1300,y:850,r:48,vx:10,vy:0,rotation:.3,hitsRemaining:2}],
    letters:[],pulses:[],events:[],settings:{disruption:false}};
  let time=performance.now();arena.received=time;arena.lastFrame=time;
  for(const ship of FLEET)for(const degrees of [0,17.5,45,90,135,180,225,270,315,359,1]){
    const angle=degrees*Math.PI/180;pilot.shipId=ship.id;
    arena.me=pilot.id;
    input.angle=arena.aimAt(523+Math.cos(angle)*100,347+Math.sin(angle)*100);
    near(Math.cos(input.angle),Math.cos(angle));near(Math.sin(input.angle),Math.sin(angle));
    for(const local of [true,false]){
      arena.me=local?pilot.id:null;pilot.angle=wrapAngle(angle);
      arena.draw(time+=16);
      const rendered=seen.at(-1);assert.equal(rendered.shipId,ship.id);
      near(rendered.x,Math.cos(angle));near(rendered.y,Math.sin(angle));
    }
  }
});

test('server headings and emitted pulses retain arbitrary angles across the 360-degree seam',()=>{
  const room=new GameRoom('ABCDEF');const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1001);
  a.ready=b.ready=true;room.start(a.id,1000);room.tick(0,4000);
  // Angle checks need a clear firing path; a random asteroid can consume a pulse.
  room.asteroids=[];room.replenishFields=()=>{};
  a.protectionUntil=0;a.x=1200;a.y=800;b.x=2200;b.y=1400;
  let now=7000,seq=0;
  for(const angle of [0,.29,Math.PI/2,Math.PI,Math.PI*1.5,TAU-.01,TAU+.01,-.17,TAU*3+.73]){
    room.crystals=[];room.pulses=[];
    room.input(a.id,{matchId:room.matchId,seq:++seq,x:0,y:0,angle,pulse:true},now);
    room.tick(0,now);
    const pulse=room.pulses.find(p=>p.ownerId===a.id);assert.ok(pulse);
    near(pulse.vx/RULES.pulseSpeed,Math.cos(angle));near(pulse.vy/RULES.pulseSpeed,Math.sin(angle));
    near(room.publicState(now).players.find(p=>p.id===a.id).angle,wrapAngle(angle));
    now+=200;
  }
});
GLYPHSTORM_0466FDB0F43BE503

# FILE: test/word-guide.test.mjs
cat > 'test/word-guide.test.mjs' <<'GLYPHSTORM_42FA06ACB7AC6D97'
import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectTray, suggestWord, pickupReason } from '../server/word-guide.mjs';
import { submissionChoice, pickupExplanation } from '../public/word-guide.js';
import { PracticeRun } from '../public/practice.js';
import { GameRoom } from '../server/game.mjs';
import { scoreWord } from '../public/rules.js';
const words=new Set(['CAT','CATS','DOG','SUN','STAR','MOON','TEA','EAT','ATE']);
const tray=word=>[...word].map((letter,i)=>({id:'tile-'+i,letter}));
function setup(){
  const room=new GameRoom('GUIDED',{words,random:()=>.25,now:1000});
  const a=room.addPlayer('Alpha',1000),b=room.addPlayer('Beta',1000);a.ready=b.ready=true;room.start(a.id,1000);room.tick(0,4000);
  room.crystals=[];room.asteroids=[];room.replenishFields=()=>{};
  for(const [i,p] of [a,b].entries())Object.assign(p,{x:100+i*500,y:100,protectionUntil:0});
  return {room,a,b};
}
test('anagram advice is separate from explicit full-tray or range submission',()=>{
  const used=new Set();
  for(const [letters,expected] of [['CATX','CAT'],['CATS','CATS'],['CATSX','CATS'],['CAXT','CAT'],['TAC','CAT'],['CA',null]]){
    const tiles=tray(letters),guide=inspectTray(tiles,used,words),before=JSON.stringify(tiles);
    assert.equal(guide.best?.word||null,expected);
    const full=submissionChoice({tray:tiles,wordGuide:guide});assert.equal(full.valid,words.has(letters));
    assert.equal(JSON.stringify(tiles),before);
  }
  used.add('CATS');assert.equal(inspectTray(tray('CATS'),used,words).best.word,'CAT');
  used.add('CAT');const guide=inspectTray(tray('CAT'),used,words);assert.equal(guide.best,null);assert.match(submissionChoice({tray:tray('CAT'),wordGuide:guide}).message,/Already used/);
});
test('manual review never silently replaces an invalid selection; stale advice cannot submit',()=>{
  const tiles=tray('CATX'),self={tray:tiles,wordGuide:inspectTray(tiles,new Set(),words)};
  assert.equal(submissionChoice(self,3).word,'CAT');assert.equal(submissionChoice(self,4).valid,false);
  assert.match(submissionChoice(self,2).message,/at least 3 letters/);
  self.tray=[...tiles,{id:'new',letter:'S'}];assert.match(submissionChoice(self).message,/Checking/);
});
test('private advice does not score, repair or reset combos; chosen prefix scores once through normal validation',()=>{
  const {room,a,b}=setup();a.tray=tray('CATX');b.tray=tray('DOG');room.powerUps.comboWords[a.id]=4;room.defense.earthHealth=90;
  for(let i=0;i<10;i++){const state=room.privateState(a.id,7000);assert.equal(state.wordGuide.best.word,'CAT');assert.equal(state.wordGuide.entries.some(e=>e.word==='DOG'),false);}
  assert.equal(a.score,0);assert.equal(room.defense.earthHealth,90);assert.equal(room.powerUps.comboWords[a.id],4);
  const publicState=room.publicState(7000);assert.ok(publicState.players.every(p=>!('wordGuide'in p)&&!('tray'in p)));
  const choice=submissionChoice(room.privateState(a.id,7000),{start:0,end:3}),ids=a.tray.slice(0,choice.length).map(t=>t.id);
  room.wordMode(a.id,true,7000);room.submit(a.id,ids,7000);
  assert.equal(a.score,scoreWord('CAT'));assert.equal(a.tray.map(t=>t.letter).join(''),'X');assert.equal(room.defense.earthHealth,92);assert.equal(room.powerUps.comboWords[a.id],5);
  assert.throws(()=>room.submit(a.id,ids,7001));assert.equal(a.score,scoreWord('CAT'));
});
test('suggestions use available letters and dictionary, remain stable and do not force a word',()=>{
  const {room,a}=setup();room.crystals=[...'SUN'].map(letter=>({letter}));
  let suggestion=suggestWord(a,room,7000);assert.equal(suggestion.word,'SUN');assert.equal(suggestion.next,'S');assert.equal(suggestion.available,true);
  a.guideTarget='SUN';room.crystals=[];a.tray=tray('S');suggestion=suggestWord(a,room,7000);assert.equal(suggestion.word,'SUN');assert.equal(suggestion.next,'U');assert.equal(suggestion.available,false);
  a.used.add('SUN');assert.notEqual(suggestWord(a,room,7000)?.word,'SUN');a.tray=tray('QXZ');assert.equal(suggestWord(a,room,7000),null);
  assert.deepEqual(a.tray,tray('QXZ'));assert.equal(a.score,0);
});
test('private pickup explanation honors priority, protection, review, capacity and expiry without changing collection',()=>{
  const {room,a,b}=setup();room.letters=[{id:'reserved',letter:'A',x:100,y:100,ownerId:b.id,team:b.team,priorityUntil:9000,expiresAt:20000}];
  room.collectLetters(new Map([[a.id,{x:100,y:100}]]),new Set(['reserved']),7000);
  assert.equal(a.tray.length,0);assert.match(room.privateState(a.id,7000).pickupNotice.message,/Reserved/);assert.equal(room.privateState(b.id,7000).pickupNotice,null);
  assert.match(pickupExplanation({self:room.privateState(a.id,7000)},a,7000),/Reserved/);
  assert.equal(pickupExplanation({self:room.privateState(a.id,9001)},a,9001),'');
  room.collectLetters(new Map(),new Set(['reserved']),9001);assert.equal(a.tray.length,1);assert.equal(room.letters.length,0);
  a.wordMode=true;assert.match(pickupReason(a,null,'ffa',9002),/Review/);a.wordMode=false;a.protectionUntil=10000;assert.match(pickupReason(a,null,'ffa',9002),/protection/);
  a.protectionUntil=0;a.tray=tray('ABCDEFGHIJ');assert.match(pickupReason(a,null,'ffa',9002),/Board full/);
});
test('discard last corrects an unwanted suffix, respects cooldown and preserves remaining order',()=>{
  const {room,a}=setup();a.tray=tray('CAX');const ids=a.tray.map(t=>t.id);
  room.discard(a.id,ids.at(-1),7000);assert.deepEqual(a.tray.map(t=>t.id),ids.slice(0,2));
  assert.throws(()=>room.discard(a.id,ids[1],7100),/Wait/);assert.equal(a.tray.map(t=>t.letter).join(''),'CA');
  a.tray.push({id:'t',letter:'T'});assert.equal(room.privateState(a.id,8000).wordGuide.best.word,'CAT');
});
test('practice requires a real pulse, ordered pickups, correction and explicit submission; restarting is isolated',()=>{
  const run=new PracticeRun(),idle={x:0,y:0,angle:0,pulse:false};
  assert.equal(run.submit(),false);assert.equal(run.discardLast(),false);
  for(let i=0;i<30;i++)run.update({...idle,pulse:true},1/60);
  assert.equal(run.step,'collectC');assert.equal(run.crystal,null);
  const collect=()=>{const tile=run.letters[0];Object.assign(run.ship,{x:tile.x,y:tile.y,vx:0,vy:0});run.update(idle,0);};
  collect();assert.deepEqual(run.tray,['C']);collect();assert.deepEqual(run.tray,['C','X']);assert.equal(run.step,'discard');assert.equal(run.submit(),false);
  assert.equal(run.discardLast(),true);assert.deepEqual(run.tray,['C']);collect();collect();assert.equal(run.step,'submit');assert.equal(run.points,0);
  assert.equal(run.submit(),true);assert.equal(run.points,scoreWord('CAT'));assert.equal(run.submit(),false);
  const other=new PracticeRun();assert.equal(other.points,0);assert.deepEqual(other.tray,[]);
});
GLYPHSTORM_42FA06ACB7AC6D97

printf '%s\n' 'Glyphstorm 1.10.0 source restored. Run npm ci, then npm start.'
````````

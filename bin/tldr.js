#!/usr/bin/env node
// suppress ExperimentalWarning of JSON importing https://github.com/nodejs/node/issues/10802
process.removeAllListeners('warning');
import('../dist/cli.js');

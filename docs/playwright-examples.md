
================================================
FILE: examples/github-api/package.json
================================================
{
  "name": "github-api",
  "version": "0.0.1",
  "scripts": {
    "test": "playwright test"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.17.1"
  }
}



================================================
FILE: examples/github-api/playwright.config.ts
================================================
/* eslint-disable notice/notice */

import { defineConfig } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({

  testDir: './tests',

  /* Maximum time one test can run for. */
  timeout: 30 * 1000,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
});



================================================
FILE: examples/github-api/tests/test-api.spec.ts
================================================
/* eslint-disable notice/notice */

/**
 * In this script, we will login and run a few tests that use GitHub API.
 *
 * Steps summary
 * 1. Create a new repo.
 * 2. Run tests that programmatically create new issues.
 * 3. Delete the repo.
 */

import { test, expect } from '@playwright/test';

const user = process.env.GITHUB_USER;
const repo = 'Test-Repo-1';

test.use({
  baseURL: 'https://api.github.com',
  extraHTTPHeaders: {
    'Accept': 'application/vnd.github.v3+json',
    // Add authorization token to all requests.
    'Authorization': `token ${process.env.API_TOKEN}`,
  }
});

test.beforeAll(async ({ request }) => {
  // Create repo
  const response = await request.post('/user/repos', {
    data: {
      name: repo
    }
  });
  expect(response.ok()).toBeTruthy();
});

test.afterAll(async ({ request }) => {
  // Delete repo
  const response = await request.delete(`/repos/${user}/${repo}`);
  expect(response.ok()).toBeTruthy();
});

test('should create bug report', async ({ request }) => {
  const newIssue = await request.post(`/repos/${user}/${repo}/issues`, {
    data: {
      title: '[Bug] report 1',
      body: 'Bug description',
    }
  });
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${user}/${repo}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: '[Bug] report 1',
    body: 'Bug description'
  }));
});

test('should create feature request', async ({ request }) => {
  const newIssue = await request.post(`/repos/${user}/${repo}/issues`, {
    data: {
      title: '[Feature] request 1',
      body: 'Feature description',
    }
  });
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${user}/${repo}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: '[Feature] request 1',
    body: 'Feature description'
  }));
});



================================================
FILE: examples/mock-battery/package.json
================================================
{
  "name": "mock-battery",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "playwright test",
    "start": "http-server -c-1 -p 9900 demo-battery-api"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.19.1",
    "http-server": "^14.1.0"
  }
}



================================================
FILE: examples/mock-battery/playwright.config.js
================================================
// @ts-check
const path = require('path')

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  webServer: {
    port: 9900,
    command: 'npm run start',
  },
  // Test directory
  testDir: path.join(__dirname, 'tests'),
});



================================================
FILE: examples/mock-battery/demo-battery-api/README.md
================================================
# Battery Status API

> Battery Status API Demo

## Demo
http://pazguille.github.io/demo-battery-api/

## Support
- Chrome 38+
- Chrome for Android
- Firefox 31+

## Specs
http://www.w3.org/TR/battery-status

## Maintained by
- Guille Paz (Frontender & Web standards lover)
- E-mail: [guille87paz@gmail.com](mailto:guille87paz@gmail.com)
- Twitter: [@pazguille](http://twitter.com/pazguille)
- Web: [http://pazguille.me](http://pazguille.me)

## License
Licensed under the MIT license.

Copyright (c) 2014 [@pazguille](http://twitter.com/pazguille).



================================================
FILE: examples/mock-battery/demo-battery-api/index.html
================================================
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Battery Status API - Demo</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta http-equiv="cleartype" content="on">
    <meta name="HandheldFriendly" content="True">
    <link rel="stylesheet" href="src/styles.css">
  </head>
  <body>

    <header class="demo-header">
      <h1 class="demo-title">Battery Status API</h1>
      <p class="not-support" hidden>Your browser doesn't support the Battery Status API :(</p>
    </header>

    <article class="battery-card">
      <h1 class="battery-title">Battery Status</h1>

      <div class="battery-box">
        <strong class="battery-percentage"></strong>
        <i class="battery"></i>
      </div>

      <dl class="battery-info">
        <dt>Power Source</dt>
        <dd class="battery-status">---</dd>

        <dt>Level percentage</dt>
        <dd class="battery-level">---</dd>

        <dt>Fully charged in</dt>
        <dd class="battery-fully">---</dd>

        <dt>Remaining time</dt>
        <dd class="battery-remaining">---</dd>
      </dl>

    </article>

    <footer>
      <a href="https://github.com/pazguille/demo-battery-api" id="github-ribbon"><img width="149" height="149" src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png" alt="Fork me on GitHub"></a>
      by <a href="http://pazguille.me/">Guille Paz</a> with <span class="heart">❤</span>
      <iframe id="github-button" src="https://ghbtns.com/github-btn.html?user=pazguille&amp;repo=demo-battery-api&amp;type=watch&amp;count=true" allowtransparency="true" frameborder="0" scrolling="0" width="152" height="30"></iframe>
    </footer>

    <script src="src/index.js" async></script>
  </body>
</html>



================================================
FILE: examples/mock-battery/demo-battery-api/LICENSE
================================================
The MIT License (MIT)

Copyright (c) 2014 Guille Paz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.




================================================
FILE: examples/mock-battery/demo-battery-api/src/index.js
================================================
(function() {
  'use strict';

  var battery;

  function toTime(sec) {
    sec = parseInt(sec, 10);

    var hours = Math.floor(sec / 3600),
        minutes = Math.floor((sec - (hours * 3600)) / 60),
        seconds = sec - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours   = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }

    return hours + ':' + minutes;
  }

  function readBattery(b) {
    battery = b || battery;

    var percentage = parseFloat((battery.level * 100).toFixed(2)) + '%',
        fully,
        remaining;

    if (battery.charging && battery.chargingTime === Infinity) {
      fully = 'Calculating...';
    } else if (battery.chargingTime !== Infinity) {
      fully = toTime(battery.chargingTime);
    } else {
      fully = '---';
    }

    if (!battery.charging && battery.dischargingTime === Infinity) {
      remaining = 'Calculating...';
    } else if (battery.dischargingTime !== Infinity) {
      remaining = toTime(battery.dischargingTime);
    } else {
      remaining = '---';
    }

    document.styleSheets[0].insertRule('.battery:before{width:' + percentage + '}', 0);
    document.querySelector('.battery-percentage').innerHTML = percentage;
    document.querySelector('.battery-status').innerHTML = battery.charging ? 'Adapter' : 'Battery';
    document.querySelector('.battery-level').innerHTML = percentage;
    document.querySelector('.battery-fully').innerHTML = fully;
    document.querySelector('.battery-remaining').innerHTML = remaining;

  }

  if (navigator.battery) {
    readBattery(navigator.battery);

  } else if (navigator.getBattery) {
    navigator.getBattery().then(readBattery);

  } else {
    document.querySelector('.not-support').removeAttribute('hidden');
  }

  window.onload = function () {
    battery.addEventListener('chargingchange', function() {
      readBattery();
    });

    battery.addEventListener("levelchange", function() {
      readBattery();
    });
  };
}());



================================================
FILE: examples/mock-battery/demo-battery-api/src/styles.css
================================================
/*! normalize.css v3.0.2 | MIT License | git.io/normalize */html{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block;vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{background-color:transparent}a:active,a:hover{outline:0}abbr[title]{border-bottom:1px dotted}b,strong{font-weight:700}dfn{font-style:italic}h1{font-size:2em;margin:.67em 0}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}img{border:0}svg:not(:root){overflow:hidden}figure{margin:1em 40px}hr{-moz-box-sizing:content-box;box-sizing:content-box;height:0}pre{overflow:auto}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}button{overflow:visible}button,select{text-transform:none}button,html input[type=button],input[type=reset],input[type=submit]{-webkit-appearance:button;cursor:pointer}button[disabled],html input[disabled]{cursor:default}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}input{line-height:normal}input[type=checkbox],input[type=radio]{box-sizing:border-box;padding:0}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}input[type=search]{-webkit-appearance:textfield;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}input[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0}textarea{overflow:auto}optgroup{font-weight:700}table{border-collapse:collapse;border-spacing:0}td,th{padding:0}
/**
 * Mobile First
 */
body {
    font: 100%/1.4em "Helvetica Neue", "Helvetica", "Arial", sans-serif;
    margin: 0 auto;
    padding: 0 0.625em;
    color: #444;
    -webkit-text-size-adjust: none;
}

/**
 * Small Screens
 */

.demo-header {
  margin-bottom: 80px;
  text-align: center;
}

.demo-title {
  font-size: 4em;
  line-height: 1em;
  text-align: center;
}

.battery-card {
  font-family: "Helvetica", Arial, sans-serif;
  display: block;
  width: 300px;
  overflow: hidden;
  border: 1px solid #D5D5D5;
  border-radius: 6px;
  font-weight: 100;
  margin: 0 auto;
}

.battery-title {
  background: #4c4c4c url('bolt.png') no-repeat 95% 15px;
  color: #fff;
  font-size: .9em;
  line-height: 50px;
  padding: 0 15px;
  font-weight: 100;
  margin: 0;
}

.battery-percentage {
  font-size: 2.5em;
  line-height: 50px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.battery-box {
  margin: 0 auto;
  padding: 50px 0;
  text-align: center;
  border-bottom: 1px solid #D5D5D5;
}

.battery {
  display: inline-block;
  position: relative;
  border: 4px solid #000;
  width: 85px;
  height: 40px;
  border-radius: 4px;
  vertical-align: middle;
}

.battery:before {
  content: '';
  display: block;
  box-sizing: border-box;
  background: #000;
  height: 40px;
  position: absolute;
  border: 1px solid #fff;
}

.battery:after {
  content: '';
  display: block;
  background: #000;
  width: 6px;
  height: 16px;
  position: absolute;
  top: 50%;
  right: -11px;
  margin-top: -8px;
  border-radius: 0 4px 4px 0;
}

.battery-info {
  font-size: 12px;
  margin: 0 auto;
  padding: 15px 45px;
  overflow: hidden;
}

.battery-info dd {
  float: right;
  margin-top: -22px;
  text-align: left;
  width: 35%;
}

footer {
  margin: 70px auto 0;
  text-align: center;
}

.heart {
  font-style: normal;
  font-weight: 500;
  color: #c0392b;
  text-decoration: none;
}

#github-button {
  display: block;
  margin: 30px auto 0;
  position: relative;
  left: 40px;
}

#github-ribbon {
  display: inline-block;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 100;
  border: 0;
  width: 149px;
  height: 149px;
}

.github-buttons {
  text-align: center;
  margin: 1em 0;
}



/**
 * Medium Screens
 */
@media all and (min-width:40em) {}

/**
 * Large Screens
 */
@media all and (min-width: 54em) {}


================================================
FILE: examples/mock-battery/tests/show-battery-status.spec.js
================================================
// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const mockBattery = {
      level: 0.90,
      charging: true,
      chargingTime: 1800, // seconds
      dischargingTime: Infinity,
      addEventListener: () => { }
    };
    // application tries navigator.battery first
    // so we delete this method
    delete window.navigator.battery;
    // Override the method to always return mock battery info.
    window.navigator.getBattery = async () => mockBattery;
  });
});

test('show battery status', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.battery-percentage')).toHaveText('90%');
  await expect(page.locator('.battery-status')).toHaveText('Adapter');
  await expect(page.locator('.battery-fully')).toHaveText('00:30');
})



================================================
FILE: examples/mock-battery/tests/update-battery-status.spec.js
================================================
// @ts-check
const { test, expect } = require('@playwright/test');

let log = [];

test.beforeEach(async ({page}) => {
  log = [];
  // Expose function for pushing messages to the Node.js script.
  await page.exposeFunction('logCall', msg => log.push(msg));

  await page.addInitScript(() => {
    // for these tests, return the same mock battery status
    class BatteryMock {
      level = 0.10;
      charging = false;
      chargingTime = 1800;
      dischargingTime = Infinity;
      _chargingListeners = [];
      _levelListeners = [];
      addEventListener(eventName, listener) {
        logCall(`addEventListener:${eventName}`);
        if (eventName === 'chargingchange')
          this._chargingListeners.push(listener);
        if (eventName === 'levelchange')
          this._levelListeners.push(listener);
      }
      _setLevel(value) {
        this.level = value;
        this._levelListeners.forEach(cb => cb());
      }
      _setCharging(value) {
        this.charging = value;
        this._chargingListeners.forEach(cb => cb());
      }
    };
    const mockBattery = new BatteryMock();
    // Override the method to always return mock battery info.
    window.navigator.getBattery = async () => {
      logCall('getBattery');
      return mockBattery;
    };
    // Save the mock object on window for easier access.
    window.mockBattery = mockBattery;

    // application tries navigator.battery first
    // so we delete this method
    delete window.navigator.battery;
  });
});

test('should update UI when battery status changes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.battery-percentage')).toHaveText('10%');

  // Update level to 27.5%
  await page.evaluate(() => window.mockBattery._setLevel(0.275));
  await expect(page.locator('.battery-percentage')).toHaveText('27.5%');
  await expect(page.locator('.battery-status')).toHaveText('Battery');

  // Emulate connected adapter
  await page.evaluate(() => window.mockBattery._setCharging(true));
  await expect(page.locator('.battery-status')).toHaveText('Adapter');
  await expect(page.locator('.battery-fully')).toHaveText('00:30');
});


test('verify API calls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.battery-percentage')).toHaveText('10%');

  // Ensure expected method calls were made.
  expect(log).toEqual([
    'getBattery',
    'addEventListener:chargingchange',
    'addEventListener:levelchange'
  ]);
  log = []; // reset the log

  await page.evaluate(() => window.mockBattery._setLevel(0.275));
  expect(log).toEqual([]); // getBattery is not called, cached version is used.
});



================================================
FILE: examples/mock-battery/tests/verify-calls.spec.js
================================================
// @ts-check
const { test, expect } = require('@playwright/test');

let log = [];

test.beforeEach(async ({page}) => {
  log = [];
  // Expose function for pushing messages to the Node.js script.
  await page.exposeFunction('logCall', msg => log.push(msg));
  await page.addInitScript(() => {
    const mockBattery = {
      level: 0.75,
      charging: true,
      chargingTime: 1800, // seconds
      dischargingTime: Infinity,
      addEventListener: (name, cb) => logCall(`addEventListener:${name}`)
    };
    // Override the method to always return mock battery info.
    window.navigator.getBattery = async () => {
      logCall('getBattery');
      return mockBattery;
    };
    // application tries navigator.battery first
    // so we delete this method
    delete window.navigator.battery;
  });
})

test('verify battery calls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.battery-percentage')).toHaveText('75%');

  // Ensure expected method calls were made.
  expect(log).toEqual([
    'getBattery',
    'addEventListener:chargingchange',
    'addEventListener:levelchange'
  ]);
});



================================================
FILE: examples/mock-filesystem/package.json
================================================
{
  "name": "mock-filesystem",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "playwright test",
    "start": "http-server -c-1 -p 9900 src/"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.19.1",
    "http-server": "^14.1.0"
  }
}



================================================
FILE: examples/mock-filesystem/playwright.config.js
================================================
// @ts-check
const path = require('path')

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  webServer: {
    port: 9900,
    command: 'npm run start',
  },
  // Test directory
  testDir: path.join(__dirname, 'tests'),
});



================================================
FILE: examples/mock-filesystem/src/file-picker.html
================================================
<head>
<script>
async function loadFile() {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    document.getElementById('contents').textContent = contents
}
</script>
</head>
<body>
    <button onclick="loadFile()">Open File</button>
    <p>Pick a text file and its contents will be shown below</p>
    <textarea id="contents" placeholder="File contents"></textarea>
</body>


================================================
FILE: examples/mock-filesystem/src/ls-dir.html
================================================
<head>
<style>
div.directory::before {
  content: '📁';
}
</style>
<script>
async function loadDir() {
    const handle = await window.showDirectoryPicker();
    for await (const entry of handle.values())
        await listEntry(entry, 0);
}
// List filesystem entry recursively
async function listEntry(e, offset) {
    offset += 2;
    printEntry(e.name, offset, e.kind);
    if (e.kind !== 'directory')
        return;
    for await (const entry of e.values())
        await listEntry(entry, offset);
}
function printEntry(text, offset, kind) {
    const div = document.createElement('div');
    div.style.paddingLeft = offset * 10;
    div.classList.add(kind);
    div.textContent = text;
    document.getElementById('dir').appendChild(div);
}
</script>
</head>
<body>
    <button id="ls-directory" onclick="loadDir()">Open directory</button>
    <p>Directory contents:</p>
    <div id="dir"></div>
</body>


================================================
FILE: examples/mock-filesystem/tests/directory-reader.spec.js
================================================
// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({page}) => {
  await page.addInitScript(() => {
    class FileSystemHandleMock {
      constructor({name, children}) {
        this.name = name;
        children ??= [];
        this.kind = children.length ? 'directory' : 'file';
        this._children = children;
      }

      values() {
        // Wrap children data in the same mock.
        return this._children.map(c => new FileSystemHandleMock(c));
      }
    }
    // Create mock directory
    const mockDir = new FileSystemHandleMock({
      name: 'root',
      children: [
        {
          name: 'file1',
        },
        {
          name: 'dir1',
          children: [
            {
              name: 'file2',
            },
            {
              name: 'file3',
            }
          ]
        },
        {
          name: 'dir2',
          children: [
            {
              name: 'file4',
            },
            {
              name: 'file5',
            }
          ]
        }
      ]
    });
    // Make the picker return mock directory
    window.showDirectoryPicker = async () => mockDir;
  });
});

test('should display directory tree', async ({ page }) => {
  await page.goto('/ls-dir.html');
  await page.locator('button', { hasText: 'Open directory' }).click();
  // Check that the displayed entries match mock directory.
  await expect(page.locator('#dir')).toContainText([
    'file1',
    'dir1', 'file2', 'file3',
    'dir2', 'file4', 'file5'
  ]);
});



================================================
FILE: examples/mock-filesystem/tests/file-reader.spec.js
================================================
// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({page}) => {
  await page.addInitScript(() => {
    class FileSystemFileHandleMock {
      constructor(file) {
        this._file = file;
      }

      async getFile() {
        return this._file;
      }
    }
    window.showOpenFilePicker = async () => [new FileSystemFileHandleMock(new File(['Test content.'], "foo.txt"))];
  });
});

test('show file picker with mock class', async ({ page }) => {
  await page.goto('/file-picker.html');
  await page.locator('button', { hasText: 'Open File' }).click();
  // Check that the content of the mock file has been loaded.
  await expect(page.locator('textarea')).toHaveValue('Test content.');
});



================================================
FILE: examples/svgomg/package.json
================================================
{
  "name": "svgomg-tests",
  "version": "0.0.1",
  "scripts": {
    "test": "playwright test",
    "ctest": "playwright test --project=chromium",
    "ftest": "playwright test --project=firefox",
    "wtest": "playwright test --project=webkit"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.17.1"
  }
}



================================================
FILE: examples/svgomg/playwright.config.ts
================================================
/* eslint-disable notice/notice */

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({

  testDir: './tests',

  /* Maximum time one test can run for. */
  timeout: 30 * 1000,

  expect: {

    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {

    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    acceptDownloads: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',

      /* Project-specific settings. */
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
});



================================================
FILE: examples/svgomg/tests/example.spec.ts
================================================
/* eslint-disable notice/notice */

import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/svgomg');
});

test('verify menu items', async ({ page }) => {
  await expect(page.locator('.menu li')).toHaveText([
    'Open SVG',
    'Paste markup',
    'Demo',
    'Contribute'
  ]);
});

test.describe('demo tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.locator('.menu-item >> text=Demo').click();
  });

  test('verify default global settings', async ({ page }) => {
    const menuItems = page.locator('.settings-scroller .global .setting-item-toggle');
    await expect(menuItems).toHaveText([
      'Show original',
      'Compare gzipped',
      'Prettify markup',
      'Multipass',
    ]);

    const toggle = page.locator('.setting-item-toggle');
    await expect(toggle.locator('text=Show original')).not.toBeChecked();
    await expect(toggle.locator('text=Compare gzipped')).toBeChecked();
    await expect(toggle.locator('text=Prettify markup')).not.toBeChecked();
    await expect(toggle.locator('text=Multipass')).not.toBeChecked();
  });

  test('verify default features', async ({ page }) => {
    const enabledOptions = [
      'Clean up attribute whitespace',
      'Clean up IDs',
      'Collapse useless groups',
      'Convert non-eccentric <ellipse> to <circle>',
      'Inline styles',
    ];

    const disabledOptions = [
      'Prefer viewBox to width/height',
      'Remove raster images',
      'Remove script elements',
      'Remove style elements',
    ];

    for (const option of enabledOptions) {
      const locator = page.locator(`.setting-item-toggle >> text=${option}`);
      await expect(locator).toBeChecked();
    }

    for (const option of disabledOptions) {
      const locator = page.locator(`.setting-item-toggle >> text=${option}`);
      await expect(locator).not.toBeChecked();
    }
  });

  test('reset settings', async ({ page }) => {
    const showOriginalSetting = page.locator('.setting-item-toggle >> text=Show original');
    await showOriginalSetting.click();
    await expect(showOriginalSetting).toBeChecked();
    await page.locator('button >> text=Reset all').click();
    await expect(showOriginalSetting).not.toBeChecked();
  });

  test('download result', async ({ page }) => {
    const downloadButton = page.locator('a[title=Download]');
    await expect(downloadButton).toHaveAttribute('href', /blob/);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadButton.click()
    ]);
    expect(download.suggestedFilename()).toBe('car-lite.svg');
    const result = fs.readFileSync(await download.path(), 'utf-8');
    expect(result).toContain('<svg');
  });
});

test('open svg', async ({ page }) => {
  // Start waiting for the file chooser, then click the button.
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('text=Open SVG'),
  ]);

  // Set file to the chooser.
  await fileChooser.setFiles({
    name: 'file.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>`)
  });

  // Verify provided svg was rendered.
  const markup = await page.frameLocator('.svg-frame').locator('svg').evaluate(svg => svg.outerHTML);
  expect(markup).toMatch(/<svg.*<\/svg>/);
});



================================================
FILE: examples/todomvc/package.json
================================================
{
  "name": "todomvc-test",
  "version": "0.0.1",
  "scripts": {
    "test": "playwright test",
    "ctest": "playwright test --project=chromium",
    "ftest": "playwright test --project=firefox",
    "wtest": "playwright test --project=webkit"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.38.0"
  }
}



================================================
FILE: examples/todomvc/playwright.config.ts
================================================
/* eslint-disable notice/notice */

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({

  testDir: './tests',

  /* Maximum time one test can run for. */
  timeout: 15_000,

  captureGitInfo: { commit: true, diff: true },

  expect: {

    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5_000
  },

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list']],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {

    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',

      /* Project-specific settings. */
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
});



================================================
FILE: examples/todomvc/tests/integration.spec.ts
================================================
/* eslint-disable notice/notice */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
});

const TODO_ITEMS = [
  'buy some cheese',
  'feed the cat',
  'book a doctors appointment'
];

test.describe('New Todo', () => {
  test('should allow me to add todo items', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');
    // Create 1st todo.
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    // Make sure the list only has one todo item.
    await expect(page.getByTestId('todo-title')).toHaveText([
      TODO_ITEMS[0]
    ]);

    // Create 2nd todo.
    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');

    // Make sure the list now has two todo items.
    await expect(page.getByTestId('todo-title')).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[1],
    ]);

    await checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('should clear text input field when an item is added', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    // Create one todo item.
    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    // Check that input is empty.
    await expect(newTodo).toBeEmpty();
    await checkNumberOfTodosInLocalStorage(page, 1);
  });

  test('should append new items to the bottom of the list', async ({ page }) => {
    // Create 3 items.
    await createDefaultTodos(page);

    // Check test using different methods.
    await expect(page.getByText('3 items left')).toBeVisible();
    await expect(page.getByTestId('todo-count')).toHaveText('3 items left');
    await expect(page.getByTestId('todo-count')).toContainText('3');
    await expect(page.getByTestId('todo-count')).toHaveText(/3/);

    // Check all items in one call.
    await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should show #main and #footer when items added', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');

    await expect(page.locator('.main')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
    await checkNumberOfTodosInLocalStorage(page, 1);
  });
});

test.describe('Mark all as completed', () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test.afterEach(async ({ page }) => {
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should allow me to mark all items as completed', async ({ page }) => {
    // Complete all todos.
    await page.getByLabel('Mark all as complete').check();

    // Ensure all todos have 'completed' class.
    await expect(page.getByTestId('todo-item')).toHaveClass(['completed', 'completed', 'completed']);
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);
  });

  test('should allow me to clear the complete state of all items', async ({ page }) => {
    const toggleAll = page.getByLabel('Mark all as complete');
    // Check and then immediately uncheck.
    await toggleAll.check();
    await toggleAll.uncheck();

    // Should be no completed classes.
    await expect(page.getByTestId('todo-item')).toHaveClass(['', '', '']);
  });

  test('complete all checkbox should update state when items are completed / cleared', async ({ page }) => {
    const toggleAll = page.getByLabel('Mark all as complete');
    await toggleAll.check();
    await expect(toggleAll).toBeChecked();
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Uncheck first todo.
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').uncheck();

    // Reuse toggleAll locator and make sure its not checked.
    await expect(toggleAll).not.toBeChecked();

    await firstTodo.getByRole('checkbox').check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Assert the toggle all is checked again.
    await expect(toggleAll).toBeChecked();
  });
});

test.describe('Item', () => {

  test('should allow me to mark items as complete', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    // Create two items.
    for (const item of TODO_ITEMS.slice(0, 2)) {
      await newTodo.fill(item);
      await newTodo.press('Enter');
    }

    // Check first item.
    const firstTodo = page.getByTestId('todo-item').nth(0);
    await firstTodo.getByRole('checkbox').check();
    await expect(firstTodo).toHaveClass('completed');

    // Check second item.
    const secondTodo = page.getByTestId('todo-item').nth(1);
    await expect(secondTodo).not.toHaveClass('completed');
    await secondTodo.getByRole('checkbox').check();

    // Assert completed class.
    await expect(firstTodo).toHaveClass('completed');
    await expect(secondTodo).toHaveClass('completed');
  });

  test('should allow me to un-mark items as complete', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    // Create two items.
    for (const item of TODO_ITEMS.slice(0, 2)) {
      await newTodo.fill(item);
      await newTodo.press('Enter');
    }

    const firstTodo = page.getByTestId('todo-item').nth(0);
    const secondTodo = page.getByTestId('todo-item').nth(1);
    await firstTodo.getByRole('checkbox').check();
    await expect(firstTodo).toHaveClass('completed');
    await expect(secondTodo).not.toHaveClass('completed');
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    await firstTodo.getByRole('checkbox').uncheck();
    await expect(firstTodo).not.toHaveClass('completed');
    await expect(secondTodo).not.toHaveClass('completed');
    await checkNumberOfCompletedTodosInLocalStorage(page, 0);
  });

  test('should allow me to edit an item', async ({ page }) => {
    await createDefaultTodos(page);

    const todoItems = page.getByTestId('todo-item');
    const secondTodo = todoItems.nth(1);
    await secondTodo.dblclick();
    await expect(secondTodo.getByRole('textbox', { name: 'Edit' })).toHaveValue(TODO_ITEMS[1]);
    await secondTodo.getByRole('textbox', { name: 'Edit' }).fill('buy some sausages');
    await secondTodo.getByRole('textbox', { name: 'Edit' }).press('Enter');

    // Explicitly assert the new text value.
    await expect(todoItems).toHaveText([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2]
    ]);
    await checkTodosInLocalStorage(page, 'buy some sausages');
  });
});

test.describe('Editing', () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should hide other controls when editing', async ({ page }) => {
    const todoItem = page.getByTestId('todo-item').nth(1);
    await todoItem.dblclick();
    await expect(todoItem.getByRole('checkbox')).not.toBeVisible();
    await expect(todoItem.locator('label', {
      hasText: TODO_ITEMS[1],
    })).not.toBeVisible();
    await checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should save edits on blur', async ({ page }) => {
    const todoItems = page.getByTestId('todo-item');
    await todoItems.nth(1).dblclick();
    await todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).fill('buy some sausages');
    await todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).dispatchEvent('blur');

    await expect(todoItems).toHaveText([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2],
    ]);
    await checkTodosInLocalStorage(page, 'buy some sausages');
  });

  test('should trim entered text', async ({ page }) => {
    const todoItems = page.getByTestId('todo-item');
    await todoItems.nth(1).dblclick();
    await todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).fill('    buy some sausages    ');
    await todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).press('Enter');

    await expect(todoItems).toHaveText([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2],
    ]);
    await checkTodosInLocalStorage(page, 'buy some sausages');
  });

  test('should remove the item if an empty text string was entered', async ({ page }) => {
    const todoItems = page.getByTestId('todo-item');
    await todoItems.nth(1).dblclick();
    await todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).fill('');
    await todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).press('Enter');

    await expect(todoItems).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[2],
    ]);
  });

  test('should cancel edits on escape', async ({ page }) => {
    const todoItems = page.getByTestId('todo-item');
    await todoItems.nth(1).dblclick();
    await todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).fill('buy some sausages');
    await todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).press('Escape');
    await expect(todoItems).toHaveText(TODO_ITEMS);
  });
});

test.describe('Counter', () => {
  test('should display the current number of todo items', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    await newTodo.fill(TODO_ITEMS[0]);
    await newTodo.press('Enter');
    await expect(page.getByTestId('todo-count')).toContainText('1');

    await newTodo.fill(TODO_ITEMS[1]);
    await newTodo.press('Enter');
    await expect(page.getByTestId('todo-count')).toContainText('2');

    await checkNumberOfTodosInLocalStorage(page, 2);
  });
});

test.describe('Clear completed button', () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
  });

  test('should display the correct text', async ({ page }) => {
    await page.locator('.todo-list li .toggle').first().check();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
  });

  test('should remove completed items when clicked', async ({ page }) => {
    const todoItems = page.getByTestId('todo-item');
    await todoItems.nth(1).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(todoItems).toHaveCount(2);
    await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('should be hidden when there are no items that are completed', async ({ page }) => {
    await page.locator('.todo-list li .toggle').first().check();
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeHidden();
  });
});

test.describe('Persistence', () => {
  test('should persist its data', async ({ page }) => {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');

    for (const item of TODO_ITEMS.slice(0, 2)) {
      await newTodo.fill(item);
      await newTodo.press('Enter');
    }

    const todoItems = page.getByTestId('todo-item');
    await todoItems.nth(0).getByRole('checkbox').check();
    await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    await expect(todoItems).toHaveClass(['completed', '']);

    // Ensure there is 1 completed item.
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    // Now reload.
    await page.reload();
    await expect(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    await expect(todoItems).toHaveClass(['completed', '']);
  });
});

test.describe('Routing', () => {
  test.beforeEach(async ({ page }) => {
    await createDefaultTodos(page);
    // make sure the app had a chance to save updated todos in storage
    // before navigating to a new view, otherwise the items can get lost :(
    // in some frameworks like Durandal
    await checkTodosInLocalStorage(page, TODO_ITEMS[0]);
  });

  test('should allow me to display active items', async ({ page }) => {
    await page.locator('.todo-list li .toggle').nth(1).check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(2);
    await expect(page.getByTestId('todo-item')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('should respect the back button', async ({ page }) => {
    await page.locator('.todo-list li .toggle').nth(1).check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);

    await test.step('Showing all items', async () => {
      await page.getByRole('link', { name: 'All' }).click();
      await expect(page.getByTestId('todo-item')).toHaveCount(3);
    });

    await test.step('Showing active items', async () => {
      await page.getByRole('link', { name: 'Active' }).click();
    });

    await test.step('Showing completed items', async () => {
      await page.getByRole('link', { name: 'Completed' }).click();
    });

    await expect(page.getByTestId('todo-item')).toHaveCount(1);
    await page.goBack();
    await expect(page.getByTestId('todo-item')).toHaveCount(2);
    await page.goBack();
    await expect(page.getByTestId('todo-item')).toHaveCount(3);
  });

  test('should allow me to display completed items', async ({ page }) => {
    await page.locator('.todo-list li .toggle').nth(1).check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(1);
  });

  test('should allow me to display all items', async ({ page }) => {
    await page.locator('.todo-list li .toggle').nth(1).check();
    await checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await page.getByRole('link', { name: 'Active' }).click();
    await page.getByRole('link', { name: 'Completed' }).click();
    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(3);
  });

  test('should highlight the currently applied filter', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'All' })).toHaveClass('selected');
    await page.getByRole('link', { name: 'Active' }).click();
    // Page change - active items.
    await expect(page.getByRole('link', { name: 'Active' })).toHaveClass('selected');
    await page.getByRole('link', { name: 'Completed' }).click();
    // Page change - completed items.
    await expect(page.getByRole('link', { name: 'Completed' })).toHaveClass('selected');
  });
});

async function createDefaultTodos(page) {
  // create a new todo locator
  const newTodo = page.getByPlaceholder('What needs to be done?');

  for (const item of TODO_ITEMS) {
    await newTodo.fill(item);
    await newTodo.press('Enter');
  }
}

async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
  return await page.waitForFunction(e => {
    return JSON.parse(localStorage['react-todos']).length === e;
  }, expected);
}

async function checkNumberOfCompletedTodosInLocalStorage(page: Page, expected: number) {
  return await page.waitForFunction(e => {
    return JSON.parse(localStorage['react-todos']).filter((todo: any) => todo.completed).length === e;
  }, expected);
}

async function checkTodosInLocalStorage(page: Page, title: string) {
  return await page.waitForFunction(t => {
    return JSON.parse(localStorage['react-todos']).map((todo: any) => todo.title).includes(t);
  }, title);
}



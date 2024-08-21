+++
title = "Playwright on NixOS for webdev"
date = 2024-08-21
slug ="playwright-nixos-webdev"

[extra]
banner = "banner-haumea-cheatsheet.png"
bannerAlt = "todo"

[taxonomies]
tags = ["nixos","webdev"]
+++

In this post I explain how to run playwright test on NixOS. Playwright is a
framework for running automated tests of web pages in real browser. The
recommeded way of installing the browsers doesn't work due to NixOS nature. This
post provides an example how to setup flake on vite project to be able to run
Playwright version of your choosing.

<!-- more -->
<!-- TOC -->

## Introduction

Nixpkgs also provides
[playwright-driver](https://search.nixos.org/packages?channel=24.05&from=0&size=50&sort=relevance&type=packages&query=playwright-driver).
This package is building and installing playwright executable. In my case, I
don't need it because I install and run the playwright via npm. Only thing that
I need is a playwright browser, because recommended `npx playwright install`
fails on NixOS.

Also the playwright is quite fast releasing new versions, and until the PR wiht
version update en nixpkgs gets merged, there are usually already another new
Playwright versions out. Sometimes I also require not only the latest version,
but some project are stuck on older ones.

So I need solution with freedom to choose any playwright version. And I was not
able to figure out how to somehow to just override nixpkgs package and make just
install the version I want.

What playwright basically needs a chromium in some specific directory with a
version in the name. So this is how the playwright driver provides the browser -

first it downloads `browser.json` from playwright repo on the specific veriosn
where it is recorded which browser version are used. It parses the browser
version, creates derivation with such structure that matches playwright's
expectations, and places nixpkgs chromium into it. Then
`PLAYWRIGHT_BROWSERS_PATH` env variable is set to make playwright to look to nix
store instead of default directory in home.

This is bit of cheating because the version of the chromium is not exactly as
the version that playwright specifies. But it usually works, so better that
nothing.

What I did is that I copied only that chunk of code that deals only with the
browser for linux from nixpkgs and created around it local package that allows
me to change the version.

The usage is demonstrated in the following tutorial. The sources you can find
also on
[github:PrimaMateria/blog-playwright-nixos-webdev](https://github.com/PrimaMateria/blog-playwright-nixos-webdev).

## Init flake and direnv

k am using playwright in web development for functional tests in projects
written in typescript. To simulate this conditions lets generate new vite
project.

Start with project's `flake.nix`.

```nix
#flake.nix

{
  description = "Blog Playwright NixOS webdev";

  outputs = inputs @ {
    self,
    nixpkgs,
    utils,
    devToolkit,
    haumea,
    ...
  }:
    utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
        };

        # not used yet
        src = haumea.lib.load {
          src = ./.nix;
          inputs = {inherit pkgs;};
        };
      in {
        devShell = devToolkit.lib.${system}.buildDevShell {
          name = "blog.playwright-nixos-webdev";
          profiles = [
            "node"
          ];
        };
      }
    );

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";

    devToolkit = {
      url = "github:primamateria/dev-toolkit-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    haumea = {
      url = "github:nix-community/haumea/v0.2.2";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

I will be using my own dev toolkit to prepare node and npm. I prepared Hamuea
and flake utils for good practice.

```
#.envrc
use flake
```

Create direnv's config and enable it with `direnv allow`. Add `.direnv` to
`.gitignore`. Try if node is ready.

```
 ~/dev/blog-playwright-nixos-webdev$ node --version
v18.20.4
```

## Generate vite project

Create typescript react vite project.

```
 ~/dev/blog-playwright-nixos-webdev$ npm create vite@latest
Need to install the following packages:
create-vite@5.5.2
Ok to proceed? (y) y


> npx
> create-vite

✔ Project name: … foo
✔ Select a framework: › React
✔ Select a variant: › TypeScript

Scaffolding project in /home/primamateria/dev/blog-playwright-nixos-webdev/foo...

Done. Now run:

  cd foo
  npm install
  npm run dev
```

Merge `foo/.gitignore` with root `.gitignore` and move all content from `/foo`
to root. Current file tree looks like this:

```
.
├── .direnv
├── .envrc
├── .git
├── .gitignore
├── .nix
├── eslint.config.js
├── flake.lock
├── flake.nix
├── index.html
├── package.json
├── public
├── README.md
├── src
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

Now run `npm install` and `npm run dev` and verify that vite dev server is
running.

## Install Playwright

Initialize Playwright without browsers and without system dependencies.

```
 ~/dev/blog-playwright-nixos-webdev$ npm init playwright@latest
Need to install the following packages:
create-playwright@1.17.133
Ok to proceed? (y) y


> foo@0.0.0 npx
> create-playwright

Getting started with writing end-to-end tests with Playwright:
Initializing project in '.'
✔ Where to put your end-to-end tests? · tests
✔ Add a GitHub Actions workflow? (y/N) · false
✔ Install Playwright browsers (can be done manually via 'npx playwright install')? (Y/n) · false
✔ Install Playwright operating system dependencies (requires sudo / root - can be done manually via 'sudo npx playwright install-deps')? (y/N) · false
Installing Playwright Test (npm install --save-dev @playwright/test)…

...

Happy hacking! 🎭
```

{{ nerdy(text="

If you would try install browsers and system deps it would fail with following
error:

```
Downloading browsers (npx playwright install --with-deps)…
BEWARE: your OS is not officially supported by Playwright; installing dependencies for ubuntu20.04-x64 as a fallback.
Installing dependencies...
Switching to root user to install dependencies...
sh: line 1: apt-get: command not found
Failed to install browsers
Error: Installation process exited with code: 127
Error: Command failed: npx playwright install --with-deps
    at genericNodeError (node:internal/errors:984:15)
    at wrappedFn (node:internal/errors:538:14)
    at checkExecSyncError (node:child_process:890:11)
    at execSync (node:child_process:962:15)
    at executeCommands (/home/primamateria/.npm/_npx/d352e76cc6b4974c/node_modules/create-playwright/lib/index.js:4730:39)
    at Generator.run (/home/primamateria/.npm/_npx/d352e76cc6b4974c/node_modules/create-playwright/lib/index.js:4910:5)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async /home/primamateria/.npm/_npx/d352e76cc6b4974c/node_modules/create-playwright/lib/index.js:5205:3 {
  status: 1,
  signal: null,
  output: [ null, null, null ],
  pid: 124425,
  stdout: null,
  stderr: null
}
```

") }}

## Installing chromium browser

Create version agnostic base package:

```nix
#.nix/_playwright-browsers-base.nix
{pkgs}: {
  version,
  sha256,
}: let
  fontconfig = pkgs.makeFontsConf {fontDirectories = [];};

  playwright-browsers-json = pkgs.stdenv.mkDerivation rec {
    name = "playwright-${version}-browsers";
    src = pkgs.fetchFromGitHub {
      owner = "Microsoft";
      repo = "playwright";
      rev = "v${version}";
      sha256 = sha256;
    };
    installPhase = ''
      mkdir -p $out
      cp packages/playwright-core/browsers.json $out/browsers.json
    '';
  };
in
  pkgs.runCommand "playwright-browsers-chromium"
  {
    nativeBuildInputs = [
      pkgs.makeWrapper
      pkgs.jq
    ];
  }
  ''
    BROWSERS_JSON=${playwright-browsers-json}/browsers.json
    CHROMIUM_REVISION=$(jq -r '.browsers[] | select(.name == "chromium").revision' $BROWSERS_JSON)
    mkdir -p $out/chromium-$CHROMIUM_REVISION/chrome-linux

    # See here for the Chrome options:
    # https://github.com/NixOS/nixpkgs/issues/136207#issuecomment-908637738
    makeWrapper ${pkgs.chromium}/bin/chromium $out/chromium-$CHROMIUM_REVISION/chrome-linux/chrome \
      --set SSL_CERT_FILE /etc/ssl/certs/ca-bundle.crt \
      --set FONTCONFIG_FILE ${fontconfig}

    FFMPEG_REVISION=$(jq -r '.browsers[] | select(.name == "ffmpeg").revision' $BROWSERS_JSON)
    mkdir -p $out/ffmpeg-$FFMPEG_REVISION
    ln -s ${pkgs.ffmpeg}/bin/ffmpeg $out/ffmpeg-$FFMPEG_REVISION/ffmpeg-linux
  ''
```

I have extracted it from
[github:kalekseev PR](https://github.com/NixOS/nixpkgs/pull/302759).

Create version specific package:

```
#.nix/playwright-browsers-1_46_1.nix
{
  pkgs,
  super,
}: (super.playwright-browsers-base {
  version = "1.46.1";
  sha256 = "sha256-HEDBaUqszemnWseKHjPJqivPlYq7jSuhQL1MQa47264=";
})
```

{{ nerdy(text="

If you will need diferent version, just change the version to match a tag on
Playwrights' repository and change `sha256` to empty string. Running it first
time will trigger error about not matching hashes. Take the expected hash from
the error message and paste it instead of the empty string.

") }}

Extend the dev shell with extra package and extra shell hook. Use Haumea to get
the newly create package with specified version.

```nix
#flake.nix
{
  description = "Blog Playwright NixOS webdev";

  outputs = inputs @ {
    self,
    nixpkgs,
    utils,
    devToolkit,
    haumea,
    ...
  }:
    utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
        };

        src = haumea.lib.load {
          src = ./.nix;
          inputs = {inherit pkgs;};
        };
      in {
        devShell = devToolkit.lib.${system}.buildDevShell {
          name = "blog.playwright-nixos-webdev";
          profiles = [
            "node"
          ];
          extraPackages = [
            src.playwright-browsers-1_46_1
          ];
          extraShellHook = ''
            # Prepare playwright
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
            export PLAYWRIGHT_BROWSERS_PATH=${src.playwright-browsers-1_46_1}
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
          '';
        };
      }
    );

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";

    devToolkit = {
      url = "github:primamateria/dev-toolkit-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    haumea = {
      url = "github:nix-community/haumea/v0.2.2";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

Disable firefox and webkit that are enabled by default after Playwright init.
Keep only chromium in the `projects` lis:

```ts
//playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // ...
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // ...
});
```

Verify that tests are running:

```
 ~/dev/blog-playwright-nixos-webdev$ npx playwright test

Running 2 tests using 2 workers
[chromium] › example.spec.ts:10:1 › get started link
Skipping host requirements validation logic because `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS` env variable is set.
[chromium] › example.spec.ts:3:1 › has title
Skipping host requirements validation logic because `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS` env variable is set.
  2 passed (2.1s)

To open last HTML report run:

  npx playwright show-report
```

{{ curious(text="

The same way playwright is defined also in my dev toolkit in the profile
`'playwright'`. Maybe it was better to not mix here the dev toolkit at all,
because it is not some generic nix tool, but a personal toolkit I use and break
not considering if others might use it. But I realized it at the end and I was
lazy to redo it the tutorial. I bet you will be able to replace it by yourself
with your own packages and shell hook for node installation. Node profile
[definition](https://github.com/PrimaMateria/dev-toolkit-nix/blob/main/src/profileDefinitions/node.nix)
is simple.

") }}

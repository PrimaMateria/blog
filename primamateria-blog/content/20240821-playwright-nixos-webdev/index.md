+++
title = "Playwright on NixOS for webdev"
date = 2024-08-21
slug ="playwright-nixos-webdev"

[extra]
banner = "banner-playwright-nixos-webdev.png"
bannerAlt = "Mobius comic book style. Playwright walking in the futuristic sci-fi city looking around on tall high-tech buildings."

[taxonomies]
tags = ["nixos","webdev"]
+++

In this post, I will explain how to run Playwright tests on NixOS. Playwright is
a framework for running automated tests on web pages in real browsers. However,
the recommended method of installing browsers doesn't work on NixOS due to its
unique nature. This post will demonstrate how to set up a flake for a Vite
project to run the Playwright version of your choice.

<!-- more -->
<!-- TOC -->

## Introduction

Nixpkgs also provides the
[playwright-driver](https://search.nixos.org/packages?channel=24.05&from=0&size=50&sort=relevance&type=packages&query=playwright-driver)
package. This package builds and installs the Playwright executable. However, in
my case, I don't need it because I install and run Playwright via npm. The only
thing I need is a Playwright browser since the recommended
`npx playwright install` fails on NixOS.

Playwright releases new versions frequently, and often by the time a pull
request (PR) to update the version in Nixpkgs is merged, a newer Playwright
version has already been released. Sometimes, I also need specific older
versions for certain projects.

I needed a solution that allows me the flexibility to choose any Playwright
version. However, I couldn't figure out how to override the Nixpkgs package to
install the specific version I wanted.

What Playwright essentially needs is a Chromium browser in a specific directory
with a versioned name. Here’s how the Playwright driver provides the browser:

First, it downloads `browser.json` from the Playwright repository for the
specified version, which records the required browser versions. It then parses
the browser version, creates a derivation with a structure that matches
Playwright's expectations, and places Nixpkgs Chromium into it. Finally, the
`PLAYWRIGHT_BROWSERS_PATH` environment variable is set so that Playwright looks
in the Nix store instead of the default directory in the home folder.

This approach is a bit of a workaround because the Chromium version isn't
exactly the one specified by Playwright. But it usually works, which is better
than nothing.

What I did was copy the relevant code from Nixpkgs that handles only the browser
for Linux, and I created a local package that allows me to change the version as
needed.

The usage is demonstrated in the following tutorial. The sources can also be
found on
[GitHub: PrimaMateria/blog-playwright-nixos-webdev](https://github.com/PrimaMateria/blog-playwright-nixos-webdev).

## Init flake and direnv

I use Playwright in web development for functional tests in TypeScript projects.
To simulate these conditions, let's generate a new Vite project.

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

I'll be using my own development toolkit to set up Node and npm. I've prepared
Hamuea and flake-utils for best practices.

```
#.envrc
use flake
```

Create direnv's config and enable it with `direnv allow`. Add `.direnv` to
`.gitignore`. Try if node is ready.

```
~/dev/blog-playwright-nixos-webdev$ node --version
v18.20.4
```

## Generate vite project

Create typescript react vite project.

```
~/dev/blog-playwright-nixos-webdev$ npm create vite@latest
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
~/dev/blog-playwright-nixos-webdev$ npm init playwright@latest
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

Create paramterized base package:

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

This part I have extracted from
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

If you need a different version, simply change the version to match a tag in the
Playwright repository and set sha256 to an empty string. When you run it for the
first time, an error will occur due to the mismatched hashes. Copy the expected
hash from the error message and replace the empty string with it.

") }}

Extend the dev shell with an extra package and an additional shell hook. Use
Haumea to include the newly created package.

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

Disable Firefox and WebKit, which are enabled by default after running
Playwright init. Keep only Chromium in the projects list.

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
~/dev/blog-playwright-nixos-webdev$ npx playwright test

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

Playwright is defined in my development toolkit under the profile
`'playwright'`. In hindsight, it might have been better not to include the dev
toolkit here, as it's a personal tool that I often modify without considering
others who might use it. However, I realized this late and didn't want to redo
the tutorial. I'm confident you can replace it with your own packages and shell
hook for Node installation. The Node profile
[definition](https://github.com/PrimaMateria/dev-toolkit-nix/blob/main/src/profileDefinitions/node.nix)
is straightforward.

") }}

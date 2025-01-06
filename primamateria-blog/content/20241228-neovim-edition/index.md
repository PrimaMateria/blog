+++
title = "Neovim Editions"
date = 2025-01-03
slug = "neovim-editions"

[extra]
banner = "banner-neovim-flake.png"
bannerAlt = "todo"
reddithref = ""

[taxonomies]
tags = ["nixos","neovim"]
+++

Introduction to a neovim flake to host multilple neovim editions with
inheritance. Instead of having one big configuration for multiple 
tasks, we can create multiple editions focused on one specific task.
With the inheritance we can reusue configurations of one edition in another.
In this article I will provide a step by step guidance with beginner friendly
explanations on how create your own flake.


<!-- more -->
<!-- TOC -->

## Personal story

Here on my blog, I wrote a post about creating your own Neovim flake. It wasn't
anything extraordinary, but it had been working for me for several years. Adding
plugins and tweaking configurations was easy and problem-free (most of the
time).

I use neovim as daily driver for web development. Apart of that I use it for
side projects often programmed with different languages. For that are necessary
different language servers and different plugins. I didn't like that my
configuration is becoming a mix of everything.

Therefore recently I have reworked my neovim flake. Instead of providing one
editor for everything the flake provides now multiple editions of neovim
configured for a specific task.

Also my skills with nix have slightly improved. Especially, getting familiar
with Haumea granted me access to neatly organized modules. 

After using these editions for a few weeks, I'm sure it was the right choice.

## Before we start

The previous articles is called [How to create your own Neovim flake](@/20230318-neovim-nix/index.md).

This article stands alone. You do not need to read the previous one. Although I
may not delve deeply into analyzing every line like before, you may still find
it useful to read through it.

All the code you can find in
[github:PrimaMateria/blog-example-neovim-editions](todo).

I assume that you are familiar with the basics of Nix and know what a Nix flake is.

## What will we create - neovim edition

<!-- prettier-ignore-start -->
{% mermaid() %}
graph TD;
    neovim --> dependencies
    neovim --> plugins
    neovim --> config
    neovim --> treesitterPlugins
    neovim --> envVars
    config --> lua
    config --> vim
    config --> luanix
    config --> vimnix
{% end %}
<!-- prettier-ignore-end -->

This is how a single edition will look like. In the dependencies we can specify
packages that will be available during the runtime to the neovim. For example in
the web edition there will be typescript language server, eslint_d daemon
providing engine for linting, or prettier tool allowing us to format the code.

The plugins will be a list of Vim or Neovim plugins either from the nixpkgs, or
from plugins that we packaged ourselves if they are not yet included in nixpkgs.

Config will hold 4 types: lua and vim, are raw config files in their respective
formats. luanix and vimnix are nix files that return the lua or vim script as a
string. 

{{ nerdy(text="

In the past, I needed to configure a plugin with a path to a binary of a
dependency package. The path to the package in the nix store is not static, as
the hash is generated based on the content of the current version. Therefore, I
couldn't hardcode it into the raw lua config, but had to pass it as a nix
variable. This led to the creation of luanix and vimnix. Although I no longer
use it, I will include it in the tutorial in case you find yourself in need of
it.

") }}

{{ curious(text="

I also noticed that some similar changes are recently being included into the
main neovim wrapper function. I just had a brief look on it, and if I understand
it right then it there will be a mechanism that will pass lua scripts and if
expand some placeholders with computed full nix store path.

") }}

{{ nerdy(text="

We should keep eye on it!

") }}

## What will we create - neovim editions hierarchy

<!-- prettier-ignore-start -->
{% mermaid() %}
graph TD;
    light --> base
    base --> web
    base --> blog
    base --> puml
{% end %}
<!-- prettier-ignore-end -->

In this tutorial, we will create a few editions. Light neovim will be a very
basic configuration acting as a pure text editor, for example, when you need to
use it remotely and you don't want to waste time on a big Nix build.

The base edition will inherit configuration from the light edition and also
provide generic IDE capabilities such as enhanced navigation, basic refactoring
tools, git support, and AI tools.

The final layer of task-oriented editions will inherit configuration from the
base IDE. This will include a web edition for web development, a blog edition
with support for writing blog posts, and a Puml edition for writing and
generating PlantUML diagrams.

## What will we create - neovim editions flake

<!-- prettier-ignore-start -->
{% mermaid() %}
graph LR;

    systems@{ shape: procs, label: "systems" }
    editions@{ shape: procs, label: "neovim editions" }
    vimPlugins@{ shape: procs, label: "vim plugins" }
    otherPackages@{ shape: procs, label: "other packages" }

    flake --> outputs
    outputs --> packages
    packages --> systems
    systems --> editions
    systems --> vimPlugins
    systems --> otherPackages

{% end %}
<!-- prettier-ignore-end -->

This is how the flake's outputs will look. It offers packages that are
compatible with different systems, allowing you to run it on systems such as
Linux or WSL on x86_64, as well as on Mac on aarch64-darwin.

The packages will include the Neovim editions, Vim plugins that we did not find
in the nixpkgs and had to package ourselves. Additionally, we will have an
adjusted LazyGit package in the other packages.

Afterwards, you will be able to run any edition with a command like this:

```sh
# TODO: change to repo of example when ready
nix run github:PrimaMateria/neovim-nix#neovim.web
```

Go ahead, try it now.

## Step 1: Prepare the flake

```nix
# /flake.nix
{
  description = "neovim editions - PrimaMateria blog tutorial";

  outputs = {
    self,
    nixpkgs,
    utils,
    haumea,
    ...
  }:
    utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          config = {allowUnfree = true;};
        };
      in (haumea.lib.load {
        src = ./src;
        inputs = {
          inherit pkgs;
        };
        transformer = haumea.lib.transformers.liftDefault;
      })
    );

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/master";
    utils.url = "github:numtide/flake-utils";
    haumea = {
      url = "github:nix-community/haumea";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

The inputs are nixpkgs, flake-utils, and Haumea. Nixpkgs is the primary package
repository for the Nix ecosystem. Flake-utils is a library that simplifies the
definition of flakes. [Haumea](@/20231022-haumea-cheatsheet/index.md) is a filesystem-based module system for Nix.

And the outputs are build using flake-utils and Haumea. Haumea constructs nix
set from the filesystem with root in the `./src` folder. The nix files under src
contain a function. This function is invoked with default Huamea parameters plus
with parameters specified in the `inputs` - so the system bound `pkgs` and, for
convenient debugging, `debug` util from nixpkgs library.

Additionally we use Haumea transformer `liftDefault`. This tells Haumea that
`./src/foo/default.nix` will be resolved to `{ foo:  "I am foo" }` instead of `{
    foo: { default: "I am foo" }}`.

## Step 2: Add neovim nightly overlay

The Neovim nightly overlay offers a Nix package of the Neovim nightly build. By
using this, you can access the latest updates and features. While this can be
beneficial, there is also a risk of encountering issues. Alternatively, you can
continue using Neovim from the nixpkgs repository, either from the unstable
channel (as shown in this example) or from the stable channel. If so, skip this
step.

```nix
#/flake.nix
{
  description = "neovim editions - PrimaMateria blog tutorial";

  outputs = {
    self,
    nixpkgs,
    utils,
    haumea,
    neovimNightlyOverlay,
    ...
  }:
    utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          config = {allowUnfree = true;};
          overlays = [neovimNightlyOverlay.overlays.default];
        };
      in (haumea.lib.load {
        src = ./src;
        inputs = {
          inherit pkgs;
          inherit (pkgs.lib) debug;
        };
        transformer = haumea.lib.transformers.liftDefault;
      })
    );

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/master";
    utils.url = "github:numtide/flake-utils";
    haumea = {
      url = "github:nix-community/haumea";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    neovimNightlyOverlay = {
      url = "github:nix-community/neovim-nightly-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

We add the `neovim-nightly-overlay` flake to the inputs and include the default
overlay in the list of overlays when configuring nix packages. From now on, the
package `pkgs.neovim` will refer to the nightly build.

## Step 3: Add neovim nix utils

[github:PrimaMateria/neovim-nix-utils](https://github.com/PrimaMateria/neovim-nix-utils)
is a flake that I have written to provide a library with functions that
assembles neovim editions.

```nix
# /flake.nix
{
  description = "neovim editions - PrimaMateria blog tutorial";

  outputs = {
    self,
    nixpkgs,
    utils,
    haumea,
    neovimNightlyOverlay,
    neovim-nix-utils,
    ...
  }:
    utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          config = {allowUnfree = true;};
          overlays = [neovimNightlyOverlay.overlays.default];
        };
        neovimNixLib = neovim-nix-utils.lib.${system};
      in (haumea.lib.load {
        src = ./src;
        inputs = {
          inherit pkgs;
          inherit neovimNixLib;
        };
        transformer = haumea.lib.transformers.liftDefault;
      })
    );

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/master";
    utils.url = "github:numtide/flake-utils";
    haumea = {
      url = "github:nix-community/haumea";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    neovimNightlyOverlay = {
      url = "github:nix-community/neovim-nightly-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    neovim-nix-utils = {
      url = "github:PrimaMateria/neovim-nix-utils";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

Add flake to inputs, and list it in the outputs function parameter. In the `let`
clause, select the system-specific library and add it to the Haumea`s inputs so
that we can access it in the file modules.

```nix
#/src/_lib.nix
{
  pkgs,
  root,
  neovimNixLib,
}: let
  initializedNeovimNixLib = neovimNixLib.init {
    neovimPackage = pkgs.neovim;
    editionsDir = ./packages/neovim;
    editionsSet = root.packages.neovim;
  };
in {
  assembleNeovim = {name}:
    initializedNeovimNixLib.assembleNeovim {inherit name;};
}
```

Create new local lib module. It will initialize the utils' lib. We need to
provide te neovim package. 

{{ nerdy(text="

Here you can see that the Haumea file module starts with an underscore. This
means that the file module will not be included in the attribute set, but it
will still be accessible through Haumea's `root` and `super` parameters. You can
investigate more in [Haumea Cheatsheet](@/20231022-haumea-cheatsheet/index.md#self-super-root)

") }}

## Interlude - about running neovim editions

Here start examples of neovim configuration. I will keep it minimal just enough
to be able to present different aspects. It's up to how will you decide to
organize your editions. If you want to have a real life example you can have a
look on my repo [github:PrimaMateria/neovim-nix](https://github.com/PrimaMateria/neovim-nix).

{{ nerdy(text="

By the way, do not attempt to run neovim editions from that repository because
it is using `git-crypt` to encode secrets. Without unlocking it with a secret
key, the file content will be encrypted gibberish and the nix build will fail.

") }}

{{ curious(text="

What a boomer. Now we can't use the neovim editions without first cloning the
repo and unlocking it locally. It would be nicer just to be able to run `nix run
github:PrimaMateria/neovim-nix#neovim.web`. 

") }}

{{ nerdy(text="

I have a few well-configured environments that I use regularly. I never SSH to
some remote servers where I would need to edit configuration files. If I did,
then it would make sense to deal with the hindrance of `git-crypt`. By the way,
running Neovim from a local path like `nix run
/home/primamateria/dev/neovim-nix#neovim.web` has one more advantage: edits are
applied right after saving, so I don't need to push them to the GitHub
repository or reload the home manager if I were to use the package there.

") }}

## Step 4: Create neovim light edition

Create new folder `/src/packages/neovim/light/`.

#### Default module

```nix
#/src/packages/neovim/light/default.nix
{root}: root.lib.assembleNeovim {name = "light";}
```

This is default nix file that will be lifted by Haumea to the attribute with the
name of the folder - so,  in the flake outputs after ran through the flake utils
this will be `packages.neovim.light`.

Through the root reference we call the local library and pass the name of the
edition we want to assemble into nix pakcage.

#### Edition manifest

```nix
#/src/packages/neovim/light/_manifest.nix
{}: {name = "light";}
```

It declares `name` and `basedOn`. Since the light edition is the first,
`basedOn` is not defined here.

#### Edition list of plugins

```nix
#/src/packages/neovim/light/_plugins.nix
{pkgs}: with pkgs.vimPlugins; [nvim-tree-lua]
```
Here we simply add nvim-tree from the nixpkgs repository.

{{ nerdy(text="

By the way, there is a repository [github:zachcoyle/neovim-plugins-nightly-overlay](https://github.com/zachcoyle/neovim-plugins-nightly-overlay) if you want to have really fresh plugins.

") }}

#### Edition config

Lua config: 

```lua
--/src/packages/neovim/light/__config/lua/nvim-tree.lua
require("nvim-tree").setup({})
vim.api.nvim_set_keymap("n", "<C-n>", ":NvimTreeFindFileToggle<CR>", { noremap = true })
```

Vim config:

```vim
"/src/packages/neovim/light/__config/vim/setters.vim
set number
```

That is enough for the light edition. You can now give it a try.

```sh
nix run .#neovim.light
```

You should see numbered lines in the buffer window, and when you press `<C-n>`,
the Neovim tree should show.

<div style="margin-top: 24px">
{{ resize_image_w(path="20241228-neovim-edition/lightEdition.png", width=450) }}
</div>

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

## What will we create - neovim edition configuration

<!-- prettier-ignore-start -->
{% mermaid() %}
graph TD;
    neovim --> dependencies
    neovim --> plugins
    neovim --> config
    neovim --> treesitterPlugins
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

## What will we create - nix flake

<!-- prettier-ignore-start -->
{% mermaid() %}
graph LR;

    systems@{ shape: procs, label: "systems" }
    editions@{ shape: procs, label: "neovim editions" }
    vimPlugins@{ shape: procs, label: "vim plugins" }
    otherPackages@{ shape: procs, label: "other packages" }

    flake --> packages
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

## Step 2: Prepare the file structure

```
.
├── flake.nix
└── src
    ├── _lib
    └── packages
        ├── neovim
        └── vimPlugins
```

Create a `src` folder with `packages` and `_lib`. In the `_lib` folder, we will
place our internal library utilities, and the `packages` folder will be included
in the flake's outputs.

{{ nerdy(text="

When a folder name starts with an underscore, Haumea will not include it in the
set of packages (`{ packages: {...}; #_lib not here }`). However, this module
will still be accessible through Haumea's `root` parameter. There is a
difference between a single underscore and two underscores. One underscore is
like `protected`, while two underscores are like `private`.


") }}


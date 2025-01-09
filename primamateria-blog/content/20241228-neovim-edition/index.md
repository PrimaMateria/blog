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

```
.
└── flake.nix
```

```nix
#flake.nix
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
#flake.nix
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

```
.
└── src
    ├── _lib.nix
    └── packages
```

```nix
#flake.nix
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
#src/_lib.nix
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

In the light edition, I will demonstrate how to add plugins and configure them
easily. We will add the nvim-tree plugin and enable line numbers.

```
.
└── src
    └── packages
        ├── neovim
        │   └── light
        │       ├── __config
        │       │   ├── lua
        │       │   │   └── nvim-tree.lua
        │       │   └── vim
        │       │       └── setters.vim
        │       ├── _manifest.nix
        │       ├── _plugins.nix
        │       └── default.nix
        └── vimPlugins
```
```nix
#src/packages/neovim/light/_manifest.nix
{}: {name = "light";}
```

Manifest is suppose to list metadata of the edition. In this case we have only
the name.

```nix
#src/packages/neovim/light/default.nix
{root}: root.lib.assembleNeovim {name = "light";}
```

This is default file that becomes the edition package in the flake output. We
call our library to assemnbe neovim and pass the name.

{{ nerdy(text="

The name is duplicated in both the manifest and the default. I attempted to
reference it using `super.manifest.name`, but this resulted in infinite
recursion errors, so I have accepted this little duplication.

") }}

```nix
#src/packages/neovim/light/_plugins.nix
{pkgs}: with pkgs.vimPlugins; [nvim-tree-lua]
```
Plugins module returns list of plugins. 

```lua
--src/packages/neovim/light/__config/lua/nvim-tree.lua
require("nvim-tree").setup({})
```

```vim
"src/packages/neovim/light/__config/vim/setters.vim
set number
```

Lua and vim scripts are simply placed in the `__config` folder. The
`neovim-nix-utils` then iterates through the files, stores them in a nix store
derivation, and adds a source command for each to neovim RC.

<div style="margin: 24px">
{{ resize_image_w(path="20241228-neovim-edition/lightEdition.png", width=450) }}
</div>

Test it by running in the root directory where the `flake.nix` is stored: `nix
run .#neovim.light`.

{{ nerdy(text="

For my [real-life light
edition](https://github.com/PrimaMateria/neovim-nix/tree/main/src/packages/neovim/light),
I set up basic navigation using nvim-tree and telescope, and also configured the
editor's appearance with colorscheme, lualine, and noice notifications.

") }}

## Step 5: Create neovim base edition

In the basic edition, we will include the lazygit plugin. However, the lazygit
program will be wrapped with our own configuration. Let's begin with this.

```
.
└── src
    └── packages
        ├── lazygit.nix
        ├── neovim
        │   ├── base
        │   │   ├── __config
        │   │   │   └── lua
        │   │   │       └── lazygit-nvim.lua
        │   │   ├── _dependencies.nix
        │   │   ├── _manifest.nix
        │   │   ├── _plugins.nix
        │   │   └── default.nix
        │   └── light
        └── vimPlugins
```

```nix
#src/packages/lazygit.nix
{pkgs}: let
  lazygitConfig = (pkgs.formats.yaml {}).generate "lazygit-config.yaml" {
    os = {
      edit = ''$NVIM_SELF --server "$NVIM" --remote-tab {{filename}}'';
      editAtLine = ''$NVIM_SELF --server "$NVIM" --remote-tab {{filename}}; [ -z "$NVIM" ] || $NVIM_SELF --server "$NVIM" --remote-send ":{{line}}<CR>"'';
      editAtLineAndWait = ''$NVIM_SELF +{{line}} {{filename}}'';
      openDirInEditor = ''$NVIM_SELF --server "$NVIM" --remote-tab {{dir}}'';
      suspend = false;
    };
  };
in
  pkgs.writeShellApplication {
    name = "lazygit";
    text = ''
      ${pkgs.lazygit}/bin/lazygit --use-config-file ${lazygitConfig} "$@"
    '';
  }
```

The package lazygit is a shell application that uses the original lazygit from
the nixpkgs, but also sets the config file to point to the nix store. The config
can be written in nix and converted to yaml.

By default, lazygit will open a new neovim instance inside a floating window
where the nvim plugin runs it inside the terminal. This configuration makes
lazygit to open selected files in the current neovim session instead.  This is
achieved using the environment variable `$NVIM_SELF`, which points to the
executable of the edition and is automatically set up by the utilities when
calling `assembleNeovim`.

{{ curious(text="

Opening files in the same session can be clunky - sometimes the floating window
remains open, which can be quite annoying. However, it does work. I may be
overlooking something in the configuration.

") }}

```nix
#src/packages/neovim/base/default.nix
{root}: root.lib.assembleNeovim {name = "base";}

#src/packages/neovim/base/_manifest.nix
{}: {
  name = "base";
  basedOn = "light";
}

#src/packages/neovim/base/_plugins.nix
{pkgs}:
with pkgs.vimPlugins; [
  lazygit-nvim
]

#src/packages/neovim/base/_dependencies.nix
{root}: with root.packages; [lazygit]
```

The process of creating the edition is quite simple. Additionally, in the
manifest, we set the attribute `basedOn` to establish inheritance from the light
edition. We also add a new module called `dependencies` and include the wrapped
`lazygit` that we have prepared. You can add any other dependencies from nixpkgs
by using Haumea's `pkgs` input that we have made available to all Haumea modules
in our flake.

```lua
--src/packages/neovim/base/__config/lua/lazygit-nvim.lua
vim.api.nvim_set_keymap("n", "<A-g>", "<cmd>LazyGit<cr>", { noremap = true })
```

`alt+g` keymap to open the lazygit.

Now, we will add a plugin that is not in the Nix store. Just today, I saw on
Reddit [go_up.nvim](https://github.com/nullromo/go-up.nvim). Let's give it a
try.

```
.
└── src
    └── packages
        ├── neovim
        │   ├── base
        │   │   ├── __config
        │   │   │   └── lua
        │   │   │       └── lazygit-nvim.lua
        │   │   ├── _plugins.nix
        │   └── light
        └── vimPlugins
            └── go-up-nvim.nix
```

```nix
#src/packages/vimPlugins/go-up-nvim.nix
{pkgs}:
pkgs.vimUtils.buildVimPlugin {
  name = "go-up-nvim";
  src = pkgs.fetchFromGitHub {
    owner = "nullromo";
    repo = "go-up.nvim";
    rev = "master";
    hash = "sha256-+F89qRssyF+73cmWPHfXwg6fijV9EOdtL+uore0BSps=";
  };
}
```

We are using `buildVimPlugin` utility from the nixpkgs.

```nix
#src/packages/neovim/base/_plugins.nix
{
  pkgs,
  root,
}:
with pkgs.vimPlugins;
with root.packages.vimPlugins; [
  lazygit-nvim
  go-up-nvim
]
```

```lua
--src/packages/neovim/base/__config/lua/go-up-nvim.lua
require("go-up").setup()

```

Use `root` to refer to the new vim plugin package in the plugin list and create
a simple Lua configuration that will load the plugin with default options.

<div style="margin: 24px">
{{ resize_image_w(path="20241228-neovim-edition/baseEdition-goUp.png", width=450) }}
{{ resize_image_w(path="20241228-neovim-edition/baseEdition-lazygit.png", width=450) }}
</div>

Run `nix run .#neovim.base` and try pressing `zz` on the first line to see it
jump to the center. This is the go-up plugin. Press `alt+g` to bring up
lazygit. If you have a file, try pressing `e` to see if it opens in the
underlying neovim window. Notice that the buffer line numbers and nvim-tree are
inherited from the light edition.

{{ nerdy(text="

My [real-life base
edition](https://github.com/PrimaMateria/neovim-nix/tree/main/src/packages/neovim/base),
has the most extensive configuration. Here, I have set up all aspects of a
generic IDE, including refactoring, git support, a snippets engine (although
each project edition has its own snippets), AI support, language server
keybindings, and linting & formatting.

") }}

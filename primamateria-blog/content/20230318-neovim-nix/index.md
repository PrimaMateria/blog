+++
title = "How to create your own Neovim flake"
date = 2023-03-18
slug = "neovim-nix"

[extra]
banner = "banner-neovim-flake.png"
bannerAlt = "Mobius comic book style. Scenery of planetary scifi city. Plants growing on the walls. Neovim logo embedded"
reddithref = "https://www.reddit.com/r/NixOS/comments/120yk3a/how_to_create_your_own_neovim_flake/"

[taxonomies]
tags = ["nixos","neovim"]
+++

In this blog post, I will guide you through the process of setting up Neovim as
a Nix Flake, allowing you to keep your editor configuration in sync across
multiple machines. We'll start by initializing the flake. We'll add Vim script
configuration, organizing Vim scripts in separate files and transforming them
into config files in the Nix store. I will guide you through adding plugins, Lua
scripts, and runtime dependencies to Neovim using Nix. By the end of this blog
post, you will be able to configure your own development environment in a more
manageable way.

<!-- more -->
<!-- TOC -->

{{ update(date="2023-06-04", content="

Thanks to the help of [Sam Willis](https://github.com/samjwillis97), the mystery
of the non-functioning `symlinkjoin` has been clarified, and a workaround has
been found. Sam also assisted me in using `flake-utils`, which enabled me to
successfully build Neovim on Nix-on-Droid. In order to preserve the integrity of
the original post, I have described these changes in a follow-up post:
[Neovim flake Updates](@/20230604-neovim-nix-update/index.md). ") }}

{{ update(date="2023-11-30", content="

There is [NixVim](https://github.com/nix-community/nixvim) - a growing Neovim
repository that contains many plugins that can be easily enabled and configured
with Nix. Consider choosing this option because everyone can benefit from the
plugins contribued there. However, if you are looking for your own small
customized 'nook' configuration and want to continue using vim/lua configs, then
you are in the right place.

") }}


{{ update(date="2025-01-13", content="

This article is outdated and has been replaced with a newer and improved version
of Flake that supports multiple versions and has clearer organization. Please
read [Neovim Editions](@/20241228-neovim-edition/index.md) instead.

") }}

## Preface

This guide will provide a step-by-step process for setting up your own Neovim as
a Nix Flake. I won't delve into the explanation of Nix and Nix Flake, as there
are already ample resources that do this wonderfully.

With this setup, you can utilize Git and Nix's capabilities to keep your
configuration files, list of plugins, and required external dependencies in sync
across multiple devices. This will not ensure that only your editor
configuration is consistent, but also your entire development environment.

Please keep in mind that I am also in the process of learning Nix and may have
made some errors. Therefore, I kindly request that you provide your feedback in
the comments' section if you have some.

It is important to note that this guide does not constitute a comprehensive
Neovim configuration. Rather, it serves to demonstrate various concepts of Nix
configuration. After completing this guide, you should be able to supplement
your plugins and configurations accordingly.

I prepared a [repository](https://github.com/PrimaMateria/blog-neovim-nix) which
contains all the code examples introduced in this post. The commits' messages
correspond to the section titles.

## Initialize the flake

Flake will take inputs, and it will generate two outputs. First a package that
can be installed using the Nix package manager, and second an app that can be
executed directly from the flake.

First we start with flake skeleton:

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = { };
  outputs = { self }: { };
}
```

Next, we will add 2 inputs:

1. `nixpkgs` - a source for all Nix packages we can later declare
1. `neovim` - Neovim itself

{{ tip(tip="

If you want to use unstable Neovim, simply change the url to
`github:neovim/neovim?dir=contrib`. This will use the main branch. Be aware that
sometimes it can happen that Nix can fail to build it.") }}

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:nix-community/neovim-nightly-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, neovim }: { };
}
```

As first, we will simply pass Neovim from the input to the output.

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:nix-community/neovim-nightly-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, neovim }: {
      packages.x86_64-linux.default = neovim.packages.x86_64-linux.neovim;
      apps.x86_64-linux.default = {
        type = "app";
        program = "${neovim.packages.x86_64-linux.neovim}/bin/nvim";
      };
    };
}
```

Our flake provides Neovim as a default package for the `x86_64-linux` system,
and a default app executes Neovim's binary.

Now, let's run the app!

```bash
nix run
```

{{ tip(tip="If you got error that `flake.nix` cannot be found, then it is
because all files belonging to the flake must be tracked in git repository.

`git add .`") }}

If all goes well, you should be welcomed with the Neovim welcome message and the
version should correspond to the current stable version.

## Custom Neovim package

What you have done so far is that you just grabbed Neovim and provided it on the
output of your flake. Now, let's prepare it for the customization. First,
extract Neovim to a separate package.

```nix
# packages/myNeovim.nix
{ pkgs }:
    pkgs.wrapNeovim pkgs.neovim {
      configure = {
         # here will come your custom configuration
      };
    }
```

Next, create an overlay over the Nixpkgs which will extend Nixpkgs with your
Neovim package.

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:nix-community/neovim-nightly-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, neovim }:
    let
      overlayFlakeInputs = prev: final: {
        neovim = neovim.packages.x86_64-linux.neovim;
      };

      overlayMyNeovim = prev: final: {
        myNeovim = import ./packages/myNeovim.nix {
          pkgs = final;
        };
      };

      pkgs = import nixpkgs {
        system = "x86_64-linux";
        overlays = [ overlayFlakeInputs overlayMyNeovim ];
      };

    in {
      packages.x86_64-linux.default = pkgs.myNeovim;
      apps.x86_64-linux.default = {
        type = "app";
        program = "${pkgs.myNeovim}/bin/nvim";
      };
    };
}
```

An overlay allows you to define new package, or override some attributes of
already present package. Overlay is a function with 2 arguments: `prev` and
`final`. `prev` is the original "untouched" `nixpkgs` and `final` is the
modified `nixpkgs` which contains the modifications.

In the first overlay `overlayFlakeInputs` you override `neovim` with the Neovim
package that comes from the flake inputs. In the second overlay you define new
package `myNeovim` which is defined in `packages/myNeovim.nix`.

The function takes an input `pkgs` which is set to overlay's `final` argument.
Therefore, the `pkgs.neovim` now refers to the `neovim` declared in
`overlayFlakeInputs`. If you passed in the flake `prev` argument, then the
`neovim` would actually refer to package defined in original Nixpkgs on unstable
channel.

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart TD
    nixpkgs["<b>Nixpkgs</b><br/>neovim (stable)"]
    neovim["Neovim"]
    overlay1["Overlay Flake Inputs"]
    nixpkgs2["<b>Nixpkgs</b><br/>neovim (flake)"]
    overlay2["Overlay My Neovim"]
    myneovim["My Neovim"]
    nixpkgs3["<b>Nixpkgs</b><br/>neovim (flake)<br/>myNeovim"]
    
    nixpkgs -->|prev| overlay1
    neovim --> overlay1
    overlay1 -->|final| nixpkgs2
    
    nixpkgs2 -->|prev| overlay2
    myneovim --> overlay2
    overlay2 -->|final| nixpkgs3
{% end %}
<!-- prettier-ignore-end -->

At last, you replaced `neovim.packages.x86_64-linux.neovim` on the output of
your flake with your newly defined `myNeovim`.

You can test by running `nix run`. If done right, Neovim should still start as
before. Don't forget to track new file in git.

## Add Vim script config

{{ tip(tip="

Some of my Neovim configuration is still written in Vim script. I know it should
be possible to migrate it all to Lua, but this will be a project for later.") }}

### Vim scripts

We will organize Vim scripts in separate files in `config/vim/`.

At first, we created two Vim scripts: `nvim-setters.vim` and `nvim-0-init.vim`.
The latter one has `0` in the name to ensure that it is the first, because the
order of files in directory corresponds also to order of their sourcing in the
config file.

For an example, this is important for the leader key. If we called
`nnoremap <leader>x foo<cr>` before updating `mapleader` to desired key, it
would assume a default `\` as the leader key for these mappings.

```vim
" config/vim/nvim-0-init.vim
let mapleader = " "
```

```vim
" config/vim/nvim-setters.vim
set tabstop=2 softtabstop=2
set shiftwidth=2
set expandtab
set smartindent
set number
```

### default.nix

Next, create `default.nix`. Default file acts somehow as `index.js` in
JavaScript. If you import path leading to a directory, Nix will automatically
look for `default.nix` in it.

`default.nix` is defined as a function which returns string which represents the
content of our `vimrc`.

```nix
# config/default.nix
{ pkgs }:
let
  scripts2ConfigFiles = dir:
    let
      configDir = pkgs.stdenv.mkDerivation {
        name = "nvim-${dir}-configs";
        src = ./${dir};
        installPhase = ''
          mkdir -p $out/
          cp ./* $out/
        '';
      };
    in builtins.map (file: "${configDir}/${file}")
    (builtins.attrNames (builtins.readDir configDir));

  sourceConfigFiles = files:
    builtins.concatStringsSep "\n" (builtins.map (file:
      "source ${file}") files);

  vim = scripts2ConfigFiles "vim";
in sourceConfigFiles vim
```

The body of the function consists of a call to `sourceConfigFiles` with argument
`vim`. In the `let-in` block you can see both defined.

### Vim scripts to Nix store

Value of the variable `vim` is a result of `script2ConfigFiles` call. The
argument defines the subdirectory name from which we want to read the vim
scripts.

`script2ConfigFiles` function first in `let-in` block prepares `configDir`
derivation. This derivation is a directory which contains all Vim files. The
`installPhase` creates `$out` directory (this variable is automatically provided
during the evaluation) in the `/nix/store` and copies everything from our source
directory (`src = ./${dir}`) to it.

The body of `script2ConfigFiles` evaluates as follows:

- `builtins.readDir configDir` returns all files in the path defined by
  `configDir`. If we pass to a `configDir` a Nix derivation, Nix will
  automatically evaluate it to a path in `/nix/store` leading to this
  derivation. Returned set consists of attributes being filenames and values
  being file types.
- `builtins.attrNames (builtins.readDir configDir)` selects attributes
  (filenames) and collects them to a list of strings.
- `builtins.map (file: "${configDir}/${file}") <list of filenames>` will
  translate each filename to an absolute path to this file stored in Nix store.

To summarize, the `vim` variable is a list of strings which are absolute paths
pointing to `/nix/store` derivation which holds copies of all your Vim configs
from the `config/vim/`.ed

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart TD
    vimScripts["vim configs<br/><pre>config/vim</pre>"]
    nixPackage["nix package<br/><pre>/nix/store/XYZ-nvim-vim-configs</pre>"] 
    fileList["file list<br/><pre>{<br />  nvim-0-init.vim = 'regular';<br />  nvim-setters.vim = 'regular';<br/>}</pre>"] 
    fileNames["file names<br/><pre>['nvim-0-init.vim' 'nvim-setters.vim']</pre>"]
    absolutePaths["absolute paths<br/><code><pre/>[<br/>  '/nix/store/XYZ-nvim-vim-configs/nvim-0-init.vim'<br/>  '/nix/store/XYZ-nvim-vim-configs/nvim-setters.vim'<br/>]</pre>"]

    vimScripts -->|make derivation| nixPackage 
    nixPackage -->|read dir| fileList
    fileList -->|attribute names| fileNames
    fileNames -->|map| absolutePaths
{% end %}
<!-- prettier-ignore-end -->

### Sourcing Vim scripts

Function `sourceConfigFiles` takes the list of installed script files, and
transforms it to a list source calls.

```vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-0-init.vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-setters.vim
```

### Custom RC

At last, load the configuration string to your custom Neovim package.

```nix
# packages/myNeovim.nix
{ pkgs }:
let
  customRC = import ../config { inherit pkgs; };
in pkgs.wrapNeovim pkgs.neovim {
      configure = {
        inherit customRC;
      };
    }
```

{{ why(question="

Why to do it such complicated way?", answer="

Initially, I had all configurations stored in one large Nix string, which
quickly became messy and difficult to navigate. To improve the organization, I
extracted the configuration for each plugin into a separate Nix file and
combined them later using import calls.

However, I still found it unfit to write Vim code within the Nix string. To
address this issue, I packaged all the files into a derivation and sourced them
as Vim files.

With this new setup, adding a new file to the directory is as simple as placing
it there, and it will be automatically sourced, rather than having to manually
import it.") }}

After starting your Neovim with `nix run` you should see the column with line
numbers.

## Add plugin from Nixpkgs

Usually you will find the most popular plugins in Nixpkgs. Plugins can also list
their own dependencies to other plugins, and they will be installed together
automatically.

As an example we will add the Telescope plugin. First we will create a separate
nix file which will contain a list of the plugins:

```nix
# plugins.nix
{ pkgs }:
with pkgs.vimPlugins; [
  telescope-nvim
]
```

{{ tip(tip="

`with-expression` allows you to avoid repeating the selects from
`pkgs.vimPlugins` for each listed plugin.") }}

Next, extend your Neovim package to include all plugins listed in `plugins.nix`:

```nix
# packages/myNeovim.nix
{ pkgs }:
let
  customRC = import ../config { inherit pkgs; };
  plugins = import ../plugins.nix { inherit pkgs; };
in pkgs.wrapNeovim pkgs.neovim {
      configure = {
        inherit customRC;
        packages.all.start = plugins;
      };
    }
```

{{ why(question="

What exactly is `packages.all.start`?", answer="

Word `all` doesn't matter and can be anything. `start` signifies that the
plugins will be loaded on Neovim's launch. Another possible selector is `opt`
which is used for lazy-load of plugins via command `:packadd $plugin-name`.

I didn't yet find a reason to use this option. If I needed to define a
specialized Neovim flavor (e.g. one for web development, another for Arduino), I
would probably construct different apps in the flake.") }}

You can search plugins in Nixpkgs through
[website](https://search.nixos.org/packages?channel=unstable&from=0&size=50&sort=relevance&type=packages&query=vimPlugins.telescope).
Notice that the selected channel is unstable. This channel might have some
additional plugins compared to stable channel, or newer versions.

{{ why(question="

How about searching from the terminal?", answer="

To execute a search in the terminal, use the command
`nix search nixpkgs vimPlugins.telescope`. This will search within the `nixpkgs`
registry alias. To find out which flake this alias corresponds to, run the
command `nix registry list`. In my default configuration, it is set to
`global flake:nixpkgs github:NixOS/nixpkgs/nixpkgs-unstable`, which corresponds
to the unstable channel.

If you'd like to search within the stable channel, you can use the command
`nix search github:NixOS/nixpkgs/nixos-22.11 vimPlugins.telescope`. To make it
easier to search within this channel in the future, you can add a new registry
alias using the command `nix registry add`.") }}

At this step Neovim should be still runnable, but before you can verify that
Telescope works, you still need to write a config for it.

## Add Lua script config

Add Lua script to `config/lua` and extend `config/default.nix` to load it the
similar way as loading Vim script.

```lua
-- config/lua/nvim-telescope.lua
local opt = { noremap = true }
local telescope = require("telescope")
telescope.setup({})
vim.api.nvim_set_keymap("n", "<leader><tab>", ":lua require('telescope.builtin').find_files()<CR>", opt)
```

Extend `sourceConfigFiles` to choose between `source` and `luafile` call based
on the file's extension.

Then prepare `lua` list using `scripts2ConfigFiles` with `lua` subdirectory as
the argument.

At last, modify the body of module function to execute `sourceConfigFiles` on
both Vim and Lua lists and concatenate the returned strings with new-line
character into one single string.

```nix
# config/default.nix
{ pkgs }:
let
  scripts2ConfigFiles = dir:
    let
      configDir = pkgs.stdenv.mkDerivation {
        name = "nvim-${dir}-configs";
        src = ./${dir};
        installPhase = ''
          mkdir -p $out/
          cp ./* $out/
        '';
      };
    in builtins.map (file: "${configDir}/${file}")
    (builtins.attrNames (builtins.readDir configDir));

  sourceConfigFiles = files:
    builtins.concatStringsSep "\n" (builtins.map (file:
      (if pkgs.lib.strings.hasSuffix "lua" file then "luafile" else "source")
      + " ${file}") files);

  vim = scripts2ConfigFiles "vim";
  lua = scripts2ConfigFiles "lua";

in builtins.concatStringsSep "\n"
(builtins.map (configs: sourceConfigFiles configs) [ vim lua ])
```

The result will look like this:

```vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-0-init.vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-setters.vim
luafile /nix/store/z1p9n8cdi4wqhskazxsb2vy1gj2h83mx-nvim-lua-configs/nvim-telescope.lua
```

Now, if you execute `nix run` and hit space-tab, you should see telescope window
pop up.

## Add plugin not found in Nixpkgs

To demonstrate how to add a plugin which is not found in Nixpkgs, you will add a
Telescope extension which provides a picker for recent files.

Add
[smartpde/telescope-recent-files](https://github.com/smartpde/telescope-recent-files)
to your flake inputs. In the `overlayFlakeInputs` we extend existing list of
`vimPlugins` with a new package.

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:nix-community/neovim-nightly-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    telescope-recent-files-src = {
      url = "github:smartpde/telescope-recent-files";
      flake = false;
    };
  };
  outputs = { self, nixpkgs, neovim, telescope-recent-files-src }:
    let
      overlayFlakeInputs = prev: final: {
        neovim = neovim.packages.x86_64-linux.neovim;

        vimPlugins = final.vimPlugins // {
          telescope-recent-files = import ./packages/vimPlugins/telescopeRecentFiles.nix {
            src = telescope-recent-files-src;
            pkgs = prev;
          };
        };
      };

      overlayMyNeovim = prev: final: {
        myNeovim = import ./packages/myNeovim.nix {
          pkgs = final;
        };
      };

      pkgs = import nixpkgs {
        system = "x86_64-linux";
        overlays = [ overlayFlakeInputs overlayMyNeovim ];
      };

    in {
      packages.x86_64-linux.default = pkgs.myNeovim;
      apps.x86_64-linux.default = {
        type = "app";
        program = "${pkgs.myNeovim}/bin/nvim";
      };
    };
}
```

To create a package you can take advantage of existing utility `buildVimPlugin`.
Actually, this is how all plugins in Nixpkgs are defined. As the source pass the
GitHub repo from the flake inputs.

```nix
# packages/vimPlugins/telescopeRecentFiles.nix
{ pkgs, src }:
pkgs.vimUtils.buildVimPlugin {
  name = "telescope-recent-files";
  inherit src;
}
```

{{ tip(tip="

I have noticed that some plugins have a Makefile. They follow the
[mini.nvim](https://github.com/echasnovski/mini.nvim) template.

When Nix builds derivation with standard `mkDerivation` call, and it finds the
Makefile, it automatically tries to build it. This might fail.

The make command doesn't need to be executed for the plugin to work. What is in
the repo is already fully defined plugin that can be loaded to the Neovim as it
is.

To skip this automatic build include `dontBuild = true` into the set that is
passed to `buildVimPlugin` function.") }}

Now, you can add the plugin to the plugin list as before.

```nix
# plugins.nix
{ pkgs }:
with pkgs.vimPlugins; [
  telescope-nvim
  telescope-recent-files
]
```

Extend existing Telescope config to load the extension, and set up a keymap for
the new picker.

```lua
-- config/lua/nvim-telescope.lua
local opt = { noremap = true }
local telescope = require("telescope")
telescope.setup({})
telescope.load_extension("recent_files")
vim.api.nvim_set_keymap("n", "<leader><tab>", ":lua require('telescope.builtin').find_files()<CR>", opt)
vim.api.nvim_set_keymap("n", "<leader><leader>", ":lua require('telescope').extensions.recent_files.pick()<CR>", opt)
```

In the current state your Neovim should be runnable, and you should be able to
test the new `telescope-recent-files` plugin by pressing space-space.

## Add runtime dependency

Have you heard of [mason.nvim](https://github.com/williamboman/mason.nvim)? I
have discovered it only recently, and it's no surprise that it's gaining a lot
of popularity.

Managing external runtime dependencies, such as language servers, used to be
pain. I briefly examined it, and it appears that it offers limited list of
dependencies it supports. While it's an honorable effort, the community that
contributes and maintains Nixpkgs is much larger compared to the community that
works on Mason. This is why I believe that Nix provides greater freedom for
declaring and configuring a reusable development environments.

In this chapter we will add two dependencies to demonstrate a bug I have
discovered. First thing, define your dependencies in separate file.

Ideally it would be one list that contains all required Nix packages, but in our
case we will create two lists.

```nix
# runtimeDeps.nix
{ pkgs }:
{
  deps1 = with pkgs; [
    nodePackages.typescript-language-server
  ];
  deps2 = with pkgs; [ lazygit ];
}
```

Next, move a package that was previously returned from the module function to
the `let-in` block, and assign it to the variable `myNeovimUnwrapped`. Instead
of it now the module function will return new package - a simple shell
application.

```nix
# packages/myNeovim.nix
{ pkgs }:
let
  customRC = import ../config { inherit pkgs; };
  plugins = import ../plugins.nix { inherit pkgs; };
  runtimeDeps = import ../runtimeDeps.nix { inherit pkgs; };
  neovimRuntimeDependencies = pkgs.symlinkJoin {
    name = "neovimRuntimeDependencies";
    paths = runtimeDeps.deps1;
  };
  neovimRuntimeDependencies2 = pkgs.symlinkJoin {
    name = "neovimRuntimeDependencies2";
    paths = runtimeDeps.deps2;
  };
  myNeovimUnwrapped = pkgs.wrapNeovim pkgs.neovim {
    configure = {
      inherit customRC;
      packages.all.start = plugins;
    };
  };
in pkgs.writeShellApplication {
  name = "nvim";
  runtimeInputs = [ neovimRuntimeDependencies2 neovimRuntimeDependencies ];
  text = ''
    ${myNeovimUnwrapped}/bin/nvim "$@"
  '';
}
```

In the shell application we have defined `runtimeInputs`, and passed to it a
list containing two packages that correspond to the dependency lists specified
in the previous file. These packages are build using `symlinkJoin`. It takes the
provided `paths` and creates symlinks pointing to them, all bundled together in
one package. So it's one package that aggregates other packages through
symlinks.

{{ tip(tip="Here occurs the bug. For some reason, `symlinkJoin` fails to create
properly all symlinks if both dependencies - typescript server and lazygit - are
defined together. Some links will be omitted in the resulted package.

I don't know exactly what causes thus bug and which packages are incompatible.
That's also why I have not yet opened a GitHub issue for it. The naive guess is
that `nodePackages.*` can't be mixed with packages from 'root'. ") }}

The shell application we have defined is called a
[wrapper](https://nixos.wiki/wiki/Nix_Cookbook#Wrapping_packages), and it allows
us to enrich the original unwrapped application. In our case packages in the
`runtimePaths` paths will be added to `PATH` environment variable, and therefore
will be available for Neovim's process.

{{ why(question='

Why do we pass `"$@"` to unwrapped Neovim?', answer="

This is shell variable which has value of all parameters passed to the script.
For example, if you want to edit a specific file with `nvim foo.txt`, then the
parameter `foo.txt` must be forwarded to the original unwrapped `nvim`.") }}

You can test now that in terminal running `typescript-language-server --version`
will tell you that the command is not recognized. But running the command inside
Neovim's terminal (`:term`) will work. The same should also apply for `lazygit`.

## Generate Lua config from Nix

All Nix packages are in `/nix/store` in a directory which is prefixed with a
hash generated from the content of the package. If we want to reference some
package from the configuration scripts, we must resolve the path of the package
on build time otherwise we would not know exactly which hash is the correct one.
The traditional Lua script configuration files that we have already set up lack
this ability.

In this chapter you will add Typescript runtime dependency, and instruct
`typescript-language-server` to use this custom typescript instance.

First, add `nvim-lspconfig` plugin:

```nix
# plugins.nix
{ pkgs }:
with pkgs.vimPlugins; [
  telescope-nvim
  telescope-recent-files
  nvim-lspconfig
]
```

Then, add typescript to runtime dependencies.

```nix
# runtimeDeps.nix
{ pkgs }:
{
  deps1 = with pkgs; [
    nodePackages.typescript
    nodePackages.typescript-language-server
  ];
  deps2 = with pkgs; [ lazygit ];
}
```

Next, create new `nvim-lspconfig.lua.nix` in new directory `config/luanix`.

```nix
# config/luanix/nvim-lspconfig.lua.nix
# vim: ft=lua
{ pkgs }:
''
local nvim_lsp = require("lspconfig")
nvim_lsp.tsserver.setup({
  init_options = {
    tsserver = {
      path = "${pkgs.nodePackages.typescript}/lib/node_modules/typescript/lib",
    },
  },
})
''
```

The interesting part is the tsserver's `path` in the `init_options`. The value
contains a Nix variable `${pkgs.nodePackages.typescript}` which will be resolved
to the absolute path leading to the typescript package in the Nix store.

{{ why(question="

What is `vim: ft=vim` at top of the file?", answer="

We have a Nix function which returns multiline string. Since most of the content
in this file is Lua code, you might want to instruct Vim to use Lua formatting
with the [modeline](https://neovim.io/doc/user/options.html#modeline).") }}

Next, extend the `config/default.nix` to process and source new configuration.

```nix
# config/default.nix
{ pkgs }:
let
  nixFiles2ConfigFiles = dir:
    builtins.map (file:
      pkgs.writeTextFile {
        name = pkgs.lib.strings.removeSuffix ".nix" file;
        text = import ./${dir}/${file} { inherit pkgs; };
      }) (builtins.attrNames (builtins.readDir ./${dir}));

  scripts2ConfigFiles = dir:
    let
      configDir = pkgs.stdenv.mkDerivation {
        name = "nvim-${dir}-configs";
        src = ./${dir};
        installPhase = ''
          mkdir -p $out/
          cp ./* $out/
        '';
      };
    in builtins.map (file: "${configDir}/${file}")
    (builtins.attrNames (builtins.readDir configDir));

  sourceConfigFiles = files:
    builtins.concatStringsSep "\n" (builtins.map (file:
      (if pkgs.lib.strings.hasSuffix "lua" file then "luafile" else "source")
      + " ${file}") files);

  vim = scripts2ConfigFiles "vim";
  lua = scripts2ConfigFiles "lua";
  luanix = nixFiles2ConfigFiles "luanix";

in builtins.concatStringsSep "\n"
(builtins.map (configs: sourceConfigFiles configs) [ vim lua luanix])
```

New function `nixFiles2ConfigFiles` takes a `dir` argument, and returns (similar
like for `scripts2ConfigFiles`) a list of full paths to config files located in
the Nix store.

The implementation maps every file found in the provided directory to a separate
package - one single text file in Nix store. The name of the package is obtained
by removing the `.nix` suffix, so the `nvim-lspconfig.lua.nix` will become
`nvim-lspconfig.lua`. And the content of the text file package is the string
returned by the function in the luanix configuration.

While this content is written, Nix variables are resolved, and therefore
`${pkgs.nodePackages.typescript}` will become a full Nix store path of the
typescript package.

Lastly, `luanix` will be processed by `sourceConfigFiles`, and since the text
packages end correctly with `.lua`, in the vimrc they will be sourced with
`luafile` call. So the result in the generated config file will look like this:

The RC now loads also new Lua script which was produced from Nix code.

```vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-0-init.vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-setters.vim
luafile /nix/store/z1p9n8cdi4wqhskazxsb2vy1gj2h83mx-nvim-lua-configs/nvim-telescope.lua
luafile /nix/store/s8ar23b2x81m746w0gvn2mkdlcs4p8qb-nvim-lspconfig.lua
```

Now to test it we can create typescript with a type error, and see if the
tsserver will catch it.

```json
# tmp/test/tsconfig.json
{
  "include": ["test.ts"]
}
```

```typescript
// tmp/test/test.ts
const foo: number = "bar";
```

You should see an error `Type 'string' is not assignable to type 'number'.`

## Package anything else

In this chapter you won't do anything new. You will use already introduced
mechanics to package additional files. Hopefully, this will highlight the
pattern used for enriching your development environment. To be more specific,
you will add a snippet file for the typescript.

```snippets
# ultisnips/typescript.snippets
snippet af "arrow function"
($1) => {
    $2
}
endsnippet
```

Similar as before, we will take everything from `ultisnips` directory, and
package it together.

```nix
# packages/ultisnipsSnippets.nix
{ pkgs }:
pkgs.stdenv.mkDerivation {
  name = "ultisnipsSnippets";
  src = ../ultisnips;
  installPhase = ''
    mkdir -p $out/
    cp ./*.snippets $out/
  '';
}
```

The package with snippets is prepared, and we will use in the next chapter.

## Generate Vim config from Nix

To come the full circle, introduce `vimnix` script with configuration for the
Ultisnips plugin where you will set the path pointing to snippets package in Nix
store.

First, let's add the plugin.

```nix
# plugins.nix
{ pkgs }:
with pkgs.vimPlugins; [
  telescope-nvim
  telescope-recent-files
  nvim-lspconfig
  ultisnips
]
```

Then, in new directory `vimnix` create configuration for Ultisnipps.

```nix
# config/vimnix/nvim-ultisnips.vim.nix
# vim: ft=vim
{ pkgs } : let
  ultisnipsSnippets = import ../../packages/ultisnipsSnippets.nix { inherit pkgs; };
in ''
  let g:UltiSnipsSnippetDirectories=["${ultisnipsSnippets}"]
''
```

Again, this is a Nix function returning multiline string containing Vim script.
And we use Nix variable `${ultisnipsSnippets}` which is defined in `let-in`
block and references the package created in the previous chapter.

{{ why(question="

Why we didn't put the `ultisnipsSinppets` package to the overlay, similar as
`neovim` or `telescope-recent-files` packages?", answer="

You totally could do that. Let's call this decision a personal preference. The
reasoning behind is that I feel like the cohesion is better with Ultisnips
fingerprinting in less modules. But feel free to do it anyway you find the
best.") }}

In the `config/default.nix` we have everything prepared. Just load `vimnix`, and
add it to the list of configs that are sourced.

```nix
# config/default.nix
{ pkgs }:
let
  nixFiles2ConfigFiles = dir:
    builtins.map (file:
      pkgs.writeTextFile {
        name = pkgs.lib.strings.removeSuffix ".nix" file;
        text = import ./${dir}/${file} { inherit pkgs; };
      }) (builtins.attrNames (builtins.readDir ./${dir}));

  scripts2ConfigFiles = dir:
    let
      configDir = pkgs.stdenv.mkDerivation {
        name = "nvim-${dir}-configs";
        src = ./${dir};
        installPhase = ''
          mkdir -p $out/
          cp ./* $out/
        '';
      };
    in builtins.map (file: "${configDir}/${file}")
    (builtins.attrNames (builtins.readDir configDir));

  sourceConfigFiles = files:
    builtins.concatStringsSep "\n" (builtins.map (file:
      (if pkgs.lib.strings.hasSuffix "lua" file then "luafile" else "source")
      + " ${file}") files);

  vim = scripts2ConfigFiles "vim";
  vimnix = nixFiles2ConfigFiles "vimnix";
  lua = scripts2ConfigFiles "lua";
  luanix = nixFiles2ConfigFiles "luanix";

in builtins.concatStringsSep "\n"
(builtins.map (configs: sourceConfigFiles configs) [ vim vimnix lua luanix])
```

You would need to configure also completion plugin to make proper use of the
snippets. For the demonstration purposes this is enough.

To test, since we don't have completion set up, we can just open our `test.ts`
and run `:UltisnipsEdit`. It should open the snippet file in the Nix store
(`<c-g>` to see the current file path). Originally, you could edit the file like
that, but files in Nix store are read-only, so you need to modify the snippet
file you created in Ultisnips directory.

## Use your Neovim

Create an alias for `nix run` or add your Neovim as a package to your Home
Manager. I prefer to create an alias.

```bash
nvim = "nix run ~/dev/neovim-nix --";
```

{{ why(question="

What are the `--` at the end?", answer="

A `--` signals the end of options and disables further option processing. Any
arguments after the -- are treated as filenames and arguments. Basically, stuff
after the double-dash will apply to `nvim` command and not to `nix run`.") }}

I like to provide local path to the flake, so when I want to apply new changes I
don't need always push to remote. It's good for testing. But you can also run
the app directly from remote address.

```bash
nvim = "nix run github:PrimaMateria/neovim-nix --";
```

## Updating

Building flake creates `flake.lock` where the inputs are frozen to specific
version. Updating is as simple as `nix flake update`.

{{ tip(tip="

The best thing is that if something goes wrong, and you don't have time to
investigate, just revert the changes in `flake.lock`, run again, and you are
back in your previous working version.") }}

## Bonus: Secrets

This is a bonus chapter. Storing secrets in a git repository may not be
necessary for you. I have only used it to store an OpenAI API key which is
needed for the [ChatGPT.nvim](https://github.com/jackMort/ChatGPT.nvim) plugin.

You can use [git-crypt](https://github.com/AGWA/git-crypt) to encrypt the
desired files when they are sent to the remote repository and decrypt them when
they are returned to the local.

I choose to declare `git` and `git-crypt` outside the Neovim flake. If you are
using Nix configuration just add it to the `environment.systemPackages`, or if
you are using home manager add it to `home.packages`.

```bash
mkdir .secrets
git-crypt init
git-crypt export-key <PATH>
echo ".secrets/** filter=git-crypt diff=git-crypt" > .gitattributes
echo '{ openai-api-key = "secretkey"; }' > .secrets/secrets.nix
```

All the files in the `.secrets` directory will have content on remote encrypted.
Locally the `git-crypt` automatically decrypts the files.

{{ tip(tip="

Be aware that adding encrypted secrets to remote repo will make running app from
the remote flake not available anymore. Also installing it as package will
require referencing the local unencrypted flake.") }}

Now, let's add the plugin, and its configuration.

```nix
# plugins.nix
{ pkgs }:
with pkgs.vimPlugins; [
  telescope-nvim
  telescope-recent-files
  nvim-lspconfig
  ultisnips
  ChatGPT-nvim
]
```

```lua
-- config/lua/nvim-chatgpt.lua
require("chatgpt").setup({ })
vim.api.nvim_set_keymap("n", "<leader>aa", "<cmd>ChatGPT<cr>", { noremap = true })
```

The last piece is to make our secret API key available. For that just extend the
wrapper shell application.

Imported `secrets` in the `let-in` block are used to set an environment variable
`OPENAI_API_KEY` in the shell application's text.

```nix
# packages/myNeovim.nix
{ pkgs }:
let
  customRC = import ../config { inherit pkgs; };
  secrets = import ../.secrets/secrets.nix;
  plugins = import ../plugins.nix { inherit pkgs; };
  runtimeDeps = import ../runtimeDeps.nix { inherit pkgs; };
  neovimRuntimeDependencies = pkgs.symlinkJoin {
    name = "neovimRuntimeDependencies";
    paths = runtimeDeps.deps1;
  };
  neovimRuntimeDependencies2 = pkgs.symlinkJoin {
    name = "neovimRuntimeDependencies2";
    paths = runtimeDeps.deps2;
  };
  myNeovimUnwrapped = pkgs.wrapNeovim pkgs.neovim {
    configure = {
      inherit customRC;
      packages.all.start = plugins;
    };
  };
in pkgs.writeShellApplication {
  name = "nvim";
  runtimeInputs = [ neovimRuntimeDependencies2 neovimRuntimeDependencies ];
  text = ''
    OPENAI_API_KEY=${secrets.openai-api-key} ${myNeovimUnwrapped}/bin/nvim "$@"
  '';
}
```

Now space-a-a should open window with openai prompt.

## Support other systems

Maybe you are already aware of
[numtide/flake-utlis](https://github.com/numtide/flake-utils), and the popular
helper function that allows you to prepare package for multiple architectures.
For now your config has everywhere hard-coded `x86_64-linux`.

I was already experimenting with it, and I was trying to use the flake in
[Nix-on-Droid](https://f-droid.org/en/packages/com.termux.nix/), but I got some
errors. If I find working solutions later, I will write a blog post about it as
well.

It would be cool to have your lightweight development environment on the phone.
Maybe just grab some small keyboard, and you could stay crafty on the road. Even
if not hardcore programming, then just working on your ideas.

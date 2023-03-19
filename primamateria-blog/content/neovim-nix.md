+++
title = "How to create your own Neovim flake"
date = 2023-03-18

[extra]
banner = "neovim-banner.png"

[taxonomies]
tags = ["nixos","neovim"]
+++

In this blog post, I will guide you through the process of setting up Neovim as
a Nix Flake, allowing you to keep your editor configuration in sync across
multiple machines. We'll start by initializing the flake. We'll add vim script
configuration, organizing vim scripts in separate files and transforming them
into config files in the nix store. I will guide you through adding plugins, lua
scripts, and runtime dependencies to Neovim using Nix. By the end of this blog
post, you will be able to configure your own development environment in a more
manageable way.

<!-- more -->

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
the comments section if you have some.

It is important to note that this guide does not constitute a comprehensive
Neovim configuration. Rather, it serves to demonstrate various concepts of Nix
configuration. After completing this guide, you should be able to supplement
your plugins and configurations accordingly.

I prepared a [repository](https://github.com/PrimaMateria/blog-neovim-nix) which
contains all the code examples introduced in this post. The commits' messages
correspond to the section titles.

{{ end() }}

## Initialize the flake

Flake will take inputs, and it will generate two outputs. First a package that
can be installed using the nix package manager, and second an app that can be
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

1. `nixpkgs` - a source for all nix packages we can later declare
1. `neovim` - Neovim itself

{{ tip(tip="If you want to use unstable Neovim, simply change the url to `github:neovim/neovim?dir=contrib`. This will use the main branch. Be aware that sometimes it can happen that nix can fail to build it.") }}

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:neovim/neovim/stable?dir=contrib";
      inputs.nixpkgs.follows = "nixpkgs-unstable";
    };
  };
  outputs = { self, nixpkgs, neovim }: { };
}
```

{% todo() %} Investigate {% end %}

{{ why(
    question="Why do we override Neovim's flake nixpkgs input to follow the unstable version?",
    answer="This way we instruct Neovim to be built using packages from the same channel as we define in our input."
   )
}}

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
      url = "github:neovim/neovim/stable?dir=contrib";
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

Now, lets run the app!

```bash
nix run
```

{{ tip(tip="If you got error that `flake.nix` cannot be found, then it is
because all files belonging to the flake must be tracked in git repository.

`git add .`") }}

If all goes well, you should be welcomed with the neovim welcome message and the
version should correspond to the current stable version.

{{ end() }}

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

Next, create an overlay over the nixpkgs which will extend nixpkgs with your
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
      url = "github:neovim/neovim/stable?dir=contrib";
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
Therefore the `pkgs.neovim` now refers to the `neovim` declared in
`overlayFlakeInputs`. If you would pass in the flake `prev` argument, then the
`neovim` would actually refer to package defined in original nixpkgs on unstable
channel.

You can test by running `nix run`. If done right, Neovim should still start as
before. Don't forget to track new file in git.

{{ end() }}

## Add vim script config

{{ tip(tip="Some of my Neovim configuration is still written in Vim sript. I know it should possible to migrate it all to lua, but this will be a project for later.") }}

We will organize vim scripts in separate files in `config/vim/`. At first, write
it all the nix code down, and then we will explain it.

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

### Vim scripts

At first we created to vim scripts: `nvim-setters.vim` and `nvim-0-init.vim`.
The latter one has `0` in the name to ensure that it is the first file in the
directory. For an example, this is important for the leader key. If we would
call `nnoremap <leader>x foo<cr>` before updating `mapleader` to desired key, it
would assume a default `\` leader key for these mappings.

### Config's default nix script

Then you created `default.nix`. Default file acts somehow as `index.js` in
javascript. If you later import path leading to directory, nix will
automatically look for it.

`default.nix` resolves to a function which returns string which will be the
content of our `vimrc`.

The body of function is a call to `sourceConfigFiles` with argument `vim`. In
the `let-in` block you can see both defined.

### Transformation of Vim script to Config files in nix store

`vim` is a result `script2ConfigFiles` call with argument `"vim"`. The argument
defines the sub-directory name from which we want to read the vim scripts.

`script2ConfigFiles` function first in `let-in` block prepares `configDir` which
is a nix derivation. This derivation is a directory which contains all vim
files. The `installPhase` creates `$out` directory (this variable is
automatically provided during the evaluation) in the `/nix/store` and copies
everything from our source directory (`src = ./${dir}`) to it.

The body of `script2ConfigFiles` evalautes as follows:

- `builtins.readDir configDir` returns a set of all files in the path
  `configDir`. If we pass a `configDir` which is a value with derivation type,
  nix will automatically translate it to a path in `/nix/store` of this
  derivation. Returned set consists of attributes being filenames and values
  being filetypes.
- `builtins.attrNames (builtins.readDir configDir)` selects attributes
  (filenames) and collects them to a list of strings.
- `builtins.map (file: "${configDir}/${file}") <list of filenames>` will execute
  provided function on each item of the list of filenames. The function will
  construct a string representing full path to the file in the derivation in the
  `/nix/store`. The result is the a list of full paths poiting to your vim
  scripts installed in `/nix/store`.

So that is the `vim` variable - the list of strings which are full paths
pointing to `/nix/store` derivation which holds copies of all your vim files in
the `config/vim` directory.

### Transformation of Config files paths to Vim source commands

Function `sourceConfigFiles` takes the list of installed script files, and each
of it transforms to a list of strings `source <NIX_STORE_PATH_OF_VIM_SCRIPT>`.

```vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-0-init.vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-setters.vim
```

{{ why(question="Why do we need to do it such complicated way?", answer="At the beginning I used to have all configs in one big nix string. This became messy and hard to navigate, so first I extracted configuration for each plugin or common area to separate nix files, and combined them later together via import calls. I still didn't like that I write vim code in nix string, so then I decided to package all files to derivation and source them as vim files. It is also helpfull that now it is enough just to add a new file to the directory, and it will be automatically used, rather than importing it here or there manually.") }}

Starting neovim now with `nix run` should show the numbers column.

{{ end() }}

## Add plugin from Nixpkgs

Usually you will find the most popular plugins in nixpkgs. Plugins definition in
nixpkgs can also list their dependencies, so when the it depends on other
plugins, these will be installed and included to Neovim automatically without a
need to explicitly listing them.

For the example, we will add the Telescope plugin. First we will create a
separate nix file which will contain a list of the plugins:

```nix
# plugins.nix
{ pkgs }:
with pkgs.vimPlugins; [
  telescope-nvim
]
```

{{ tip(tip="`with-expression` allows you to avoid repeating the selects from `pkgs.vimPlugins` for each listed plugin.") }}

Add now extend your Neovim package to include all plugins listed in
`plugins.nix`:

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

{{ why(question="Why we set `packages.all.start`?", answer="Word `all` doesn't matter and can be anything. And the `start` signifies that the plugins will be loaded on the Neovim's launch. The other options is `opt` which allows to load plugin only via command `:packadd $plugin-name`. I don't see yet a reason for using opt plugins. If I would need to craft a specialized Neovim flavor (e.g. one for web development, another for arduino), I would probably construct different apps in the flake.") }}

You can search plugins in nixpkgs either through
[website](https://search.nixos.org/packages?channel=unstable&from=0&size=50&sort=relevance&type=packages&query=vimPlugins.telescope).
Notice that the selected channel is unstable. This channel might have some
additional plugins compared to stable channel, or newer version of them.

{{ why(question="How about searching from the terminal?", answer="Actually, it
is harder than you would think. You can always do
`nix search nixpkgs vimPlugins.telescope`, but this will search `nixpkgs`
channel which corresponds with the stable channel. If you run
`sudo nix-channel --list`, it will reveal to you which url is associated with
the `nixpkgs` alias.

The only way I have found was to add the unstable channel
`sudo nix-channel --add https://nixos.org/channels/nixpkgs-unstable unstable`,
update channels with `sudo nix-channel --update`, and then search with
`nix-env -qaP 'vimplugin.telescope.*' | grep unstable`. The trick here is that
in this case you don't query the package's attribute path, but the its symbolic
name, which I find unclear.") }}

At this step Neovim should be still runnable, but before you can verify that
Telescope works, we still need to write a config for it. This is decribed in
next chapter.

{{ end() }}

## Add lua script config

You will add lua script to `config/lua` and extend `config/default.nix` to load
it in simmilar manner as you loaded the vim script.

```lua
-- config/lua/nvim-telescope.lua
local opt = { noremap = true }
local telescope = require("telescope")
telescope.setup({})
vim.api.nvim_set_keymap("n", "<leader><tab>", ":lua require('telescope.builtin').find_files()<CR>", opt)
```

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

First extend `sourceConfigFiles` to use `source` or `luafile` based on the
file's extension. Then prepare `lua` variable by calling `scripts2ConfigFiles`
and pointing it to `lua` sub-directory. At last, modify the body of module
function to execute `sourceConfigFiles` on list of variables and concatenate the
returned strings with new-line character into one single string.

```vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-0-init.vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-setters.vim
luafile /nix/store/z1p9n8cdi4wqhskazxsb2vy1gj2h83mx-nvim-lua-configs/nvim-telescope.lua
```

Now, if you execute `nix run` and hit space-tab, it should show telescope
window.

{{ end() }}

## Add plugin not found in Nixpkgs

To demenostrate how to add a plugin which is not found in Nixpkgs, you will add
a Telescope extension which provides a picker for recent files.

Add
[smartpde/telescope-recent-files](https://github.com/smartpde/telescope-recent-files)
to your flake inputs.

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:neovim/neovim/stable?dir=contrib";
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

In the `overlayFlakeInputs` we extend existing list of `vimPlugins` with a new
package.

```nix
# packages/vimPlugins/telescopeRecentFiles.nix
{ pkgs, src }:
pkgs.vimUtils.buildVimPlugin {
  name = "telescope-recent-files";
  inherit src;
}
```

To create a package you take advantage of existing utility function
`buildVimPlugin`. Actually this is how all plugins already added to Nixpkgs are
defined as well. As the source you pass the github repo from the flake inputs.

{{ tip(tip="I noticed that some plugins have defined a Makefile. They follow the
[mini.nvim](https://github.com/echasnovski/mini.nvim) template. The make command
doesn't need to be executed for the plugin to work. What is in the repo is
already fully defined plugin that can be loaded to the Neovim.

When Nix makes derivation with standard `mkDerivation` call, and it finds the
Makefile, it automatically tries to build it. This might fail, and it's not
necessary for the plugin to work. To skip this automatic build include
`skipBuild = true` into the set passed to `buildVimPlugin` function.") }}

Next, you can add the plugin to the plugin list as usual.

```nix
# plugins.nix
{ pkgs }:
with pkgs.vimPlugins; [
  telescope-nvim
  telescope-recent-files
]
```

To make it work, extend the existing lua script for the Telescope.

```lua
-- config/lua/nvim-telescope.lua
local opt = { noremap = true }
local telescope = require("telescope")
telescope.setup({})
telescope.load_extension("recent_files")
vim.api.nvim_set_keymap("n", "<leader><tab>", ":lua require('telescope.builtin').find_files()<CR>", opt)
vim.api.nvim_set_keymap("n", "<leader><leader>", ":lua require('telescope').extensions.recent_files.pick()<CR>", opt)
```

In this state, your Neovim should be runnable, and you can test the new
`telescope-recent-files` plugin by pressing space-space.

{{ end() }}

## Add runtime dependency

Have you heard of [mason.nvim](https://github.com/williamboman/mason.nvim)? I
only recently discovered it, but it's no surprise that it's gaining popularity.
Managing external runtime dependencies, such as language servers, used to be a
pain. I briefly examined it and it appears that it manages a limited list of
dependencies it supports. While it's an honorable effort, the community behind
and maintaining Nixpkgs is much larger compared to the community behind mason.
This is why I believe that Nix will provide greater freedom for declaring and
configuring a reusable development environment.

In this chapter we will add two dependencies to demonstrate a bug I have
discovered, and how to overcome it. First thing, to keep it tidy, define your
dependencies in separate file. Ideally it would be one list of listing packages
fron Nixpkgs, but in our case we will create a set containing two lists.

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

Modify your Neovim package as follows:

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

First thing that was changed is that we moved a package that was previous
returned from the module function to the `let-in` block, and assigned it to the
variable `myNeovimUnwrapped`. Instead of it now the module function returns new
package - a simple shell application.

In the shell application we have defined `runtimeInputs` and passed to it a list
containing two packages that correspond to the dependency lists specified in the
previous file. These packages are build using `symlinkJoin`. It takes the
provided `paths` and creates symlinks pointing to them, all together in one
package. So it's one package that aggregates other packages through symlinks.

{{ tip(tip="Here occures the bug mentioned earlier. For some reason,
`symlinkJoin` fails to create properly all symlinks if both dependencies -
typescript server and lazygit - are defined together. Some links will be missing
in the resulted package.

I don't know what is the reason that some packages are incompatible. That's also
why I have not yet opened a github issue for it. The naive and rough guess is
that `nodePackages.*` can't be mixed with other 'root' packages.") }}

The shell application we have defined is called a
[wrapper](https://nixos.wiki/wiki/Nix_Cookbook#Wrapping_packages), and it allows
us to enrich the original unwrapped application. In our case packages in the
`runtimePaths` paths will be added to `PATH` environment vairable, and therefore
will be avaible for the Neovim process.

{{ why(question='Why do we pass `"$@"` to unwrapped Neovim?', answer="This is shell variable which has value of all parameters passed to the script. For example, if you want to edit a specific file `nvim foo.txt`, then the parameter `foo.txt` must forwarded to the original unwrapped `nvim`.") }}

You can test now that in terminal running `typescript-language-server --version`
will tell you that the command is not recognized. But running the command inside
Neovim's terminal (`:term`) will work. The same should apply for `lazygit`.

{{ end() }}

## Generate lua config from nix

All nix packages are in `/nix/store` in a directory which is prefixed with a
hash generated from the content of the package. If we want to reference some
package from the configuration scripts, we must resolve the path of the package
on build time. The traditional lua script configuration files that you have
already set up lack this ability.

In this chapter you will add Typescript runtime dependency, and instruct
`typescript-language-server` to use this custom typescript instance. Extend
runtime dependencies.

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

The interesting part is the tsserver's `path` set to `init_options` of the LSP.
The value contains a nix variable `${pkgs.nodePackages.typescript}` which will
be resolved to the absolute path of the typescript in the nix store.

{{ why(question="What is `vim: ft=vim` at top of the file?", answer="We haves a nix function which returns  multiline string. Since most of this nix file will be the lua code in the string, you might want to instruct vim to use lua formatting with this [modeline](https://neovim.io/doc/user/options.html#modeline).") }}

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

The new function `nixFiles2ConfigFiles` takes a `dir` argument, and returns
(similar like for `scripts2ConfigFiles`) a list of full paths to config files
located in the nix store.

The implementation maps every file found in the provided directory to a separate
package - one single text file. The name of the package is obtained by removing
the `.nix` suffix, so the `nvim-lspconfig.lua.nix` will become
`nvim-lspconfig.lua`. And the content of the text file package is the string
returned by the function in the luanix configuration.

While this content is written, nix variables are resolved, and therefore
`${pkgs.nodePackages.typescript}` will become a full nix store path of the
typescript package.

Lastly, `luanix` will be processed by `sourceCOnfigFiles`, and since the text
packages end correctly with `.lua`, in the vimrc they will be sourced with
`luafile` call. So the result in the generated config file will look like this:

```vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-0-init.vim
source /nix/store/9khyyhiapv1kbwphxk736nxqzl3xcnl9-nvim-vim-configs/nvim-setters.vim
luafile /nix/store/z1p9n8cdi4wqhskazxsb2vy1gj2h83mx-nvim-lua-configs/nvim-telescope.lua
luafile /nix/store/s8ar23b2x81m746w0gvn2mkdlcs4p8qb-nvim-lspconfig.lua
```

At last add `nvim-lspconfig` plugin:

```nix
# plugins.nix
{ pkgs }:
with pkgs.vimPlugins; [
  telescope-nvim
  telescope-recent-files
  nvim-lspconfig
]
```

Now to test it, we can create typescript type error, and see if the tsserver
will catch it.

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

{{ end() }}

## Package anything else

In this chapter you won't do anything new. You will use already introduced
mechanics to package addtional files. Hopefully, this will highlight the pattern
used for enriching your development environment. To be more specific, you will
add a snippet file for the typescript.

```snippets
# ultisnips/typescript.snippets
snippet af "arrow function"
($1) => {
    $2
}
endsnippet
```

Similar as before, we we will take everything from `ultisnips` directory, and
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

{{ end() }}

## Generate vim config from nix

To finish the whole circle, you will introduce `vimnix` script. It will be
configuration for the ultisnips plugin where you will set the path pointing to
nix store's snippets package.

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

Then in new directory `vimnix` create configuration for ultisnipps.

```nix
# config/vimnix/nvim-ultisnips.vim.nix
# vim: ft=vim
{ pkgs } : let
  ultisnipsSnippets = import ../../packages/ultisnipsSnippets.nix { inherit pkgs; };
in ''
  let g:UltiSnipsSnippetDirectories=["${ultisnipsSnippets}"]
''
```

Again, this is a nix function returning multiline string containing vim script.
And we use nix variable `${ultisnipsSnippets}` which is defined in `let-in`
block and references the package created in the previous chapter.

{{ why(question="Why we didn't put the `ultisnipsSinppets` package to the overlay, similar as `neovim` or `telescope-recent-files` packages?", answer="You totally could do that. Let's call this decision a personal preference. The reasoning behind is that I feel like the cohesion is better with ultisnips fingerprinting in less modules. But feel free to do it anyway you find the best.") }}

In the `config/default.nix` we have everything prepared. Just load `vimnix`, and
add it tot the list of configs that will be sourced.

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
snippets. For the demonstration purposes this is enough. To test, since we don't
have completion set up, we can just open our `test.ts` and run `:UltisnipsEdit`.
It should open the snippet file in the nix store (`<c-g>` to see the current
file path). Originally, you could edit the file here, but, of course, files from
nix store are read-only.

{{ end() }}

## Use your Neovim

Alias for nix run or add to package. Packages needs nix update. As mentioned,
this flake can be installed as package, or run as an application. I preffer to
create an alias.

```bash
nvim = "nix run ~/dev/neovim-nix --";
```

{{ why(question="What are the `--` at the end?", answer="A `--` signals the end of options and disables further option processing. Any arguments after the -- are treated as filenames and arguments. Basically, stuff after the double-dash will apply to `nvim` command and not to `nix run`.") }}

I like to provide local path to the flake, so when I want to apply new changes I
don't need always push to remote. It's good for testing. But you can also run
the app directly from remote address.

```bash
nvim = "nix run github:PrimaMateria/neovim-nix --";
```

{{ end() }}

## Updating

Nix flakes create `flake.lock` where the inputs are frozen to specific versions.
Updating is as simple as `nix flake update`.

{{ tip(tip="The best thing is that if something
goes wrong, and you don't have time to investigate, just revert the changes
in `flake.lock`, and you are back in your previous working version.") }}

{{ end() }}

## Bonus: Secrets

This is a bonus chapter. Storing secrets in a git repository may not be
necessary for you, but it is a useful skill to learn. In the context of Neovim,
I have only used it to store an OpenAI API key which is needed for the
[ChatGPT.nvim](https://github.com/jackMort/ChatGPT.nvim) plugin.

You can use [git-crypt](https://github.com/AGWA/git-crypt) to encrypt the
desired files when they are sent to the remote repository and decrypt them when
they are returned to the local.

I choose to declare `git` and `git-crypt` outside of the neovim flake. If you
are using nix configuration just add it to the `environment.systemPackages`, or
if you are using home manager add it to `home.packages`.

```bash
mkdir .secrets
git-crypt init
git-crypt export-key <PATH>
echo ".secrets/** filter=git-crypt diff=git-crypt" > .gitattributes
echo '{ openai-api-key = "secretkey"; }' > .secrets/secrets.nix
```

All the files in the `.secrets` directory will have content tracked encrypted.
Locally the `git-crypt` automatically decrypts the files.

{{ tip(tip="Be aware that adding encrypted secrets to remote repo will make running app from the remote flake not availabe anymore. Also installing it as package will require referencing the local unencrypted flake.") }}

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

{{ tip(tip="Interesting point here is that if you look into the [ChatGPT.nvim](https://github.com/jackMort/ChatGPT.nvim) README, you can notice that it requires bunch of other plugins to work. Nixpkgs offers a place to declare these dependencies for the plugins. When the `packages.all.start` are processed, these dependencies are indetified and installed together with the main plugin automatically.") }}

```lua
-- config/lua/nvim-chatgpt.lua
require("chatgpt").setup({ })
vim.api.nvim_set_keymap("n", "<leader>aa", "<cmd>ChatGPT<cr>", { noremap = true })
```

The last piece is to make our secret API key avaialable. For that just extend
the wrapper shell application.

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

Imported `secrets` in the `let-in` block are used to set an environment variable
`OPENAI_API_KEY` in the shell application's text.

Now space-a-a should open window with openai prompt.

{{ end() }}

## Support other systems

Maybe you are already aware about
[numtide/flake-utlis](https://github.com/numtide/flake-utils), and the popular
helper function that allows you to prepare package for mutliple.
architectures/systems. For now your config has everywhere hardcoded
`x86_64-linux`.

I was already experimenting with it and I was trying to install in
[Nix-on-Droid](https://f-droid.org/en/packages/com.termux.nix/), but I got some
errors. If I will find working solutions later, I will write a blog post about
it as well. It would be cool to have your lightweight development environment on
the phone. Maybe just grab some small keyboard, and you could stay crafty on the
road. Even if not hardcore programming, then just working on your ideas.

{{ end() }}

+++
title = "How to create your own Neovim flake"
date = 2022-12-29

[extra]
banner = "neovim-banner.png"
+++

## Introduction

This step-by-step guide will show you how to set up your own Neovim as a Nix
Flake. I won't explain what Nix and Nix Flake are here, as there are already
many other resources that do this perfectly.

{% todo() %} Add links to nix docs {% end %}

With this setup, you can use Git and Nix's magic to keep your configuration
files, list of plugins, and required external dependencies synced across
multiple machines. This will not only keep your editor configuration in sync,
but also your entire development environment. Additionally, you can use this
setup to keep your editor configuration in sync with your colleagues.

Please, be aware that I am also learning nix and possibly I might have done
something the wrong way. If you have more experience, and have a constructive
feedback please drop a message.

{% todo() %} Add contact page {% end %} {% todo() %} Create repo and add git
checkout commands to each chapter. {% end %}

TODO: Disclaimer that this is not full-blown neovim configuration. Guide is
meant to demosntrate different concepts of nix configuration. Once done, you
should be able to fill the gaps with your plugins and configs.

This post come out quite long. I don't think Nix is so hard. It's more the fact
that I try not forget anything I have learned, and I might go into some details
that could be skipped. But if they would be skipped then the knowledge would be
not shared and lost.

{{ end() }}

## Initialize the flake

Flake will take inputs, and it will generate an output which will be a package
that can be installed using the nix package manager, as well as an app that can
be executed directly.

First we start with bare flake structure:

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = { };
  outputs = { self }: { };
}
```

Next, we will add 2 inputs:

1. `nixpkgs` - a source of all nix packages we can later declare
1. `neovim` - Neovim itself

oth inputs favor unstable branches for rolling updates so that we can get early
access to all recently merged features.

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:neovim/neovim?dir=contrib";
      inputs.nixpkgs.follows = "nixpkgs-unstable";
    };
  };
  outputs = { self, nixpkgs, neovim }: { };
}
```

{{ why(question="Why do we override Neovim's flake nixpkgs input to follow the unstable version? ", answer="This way we instruct Neovim to be build using the same packages. Probably it would work even without it. And I kind of repeat it as a convention. But I can't see it as a recursive fix -meaning, if Neovim depends on other flakes, their nixpkgs inputs won't follow the provided value.") }}

As the initial step, we will pass Neovim from the input to the output.

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:neovim/neovim?dir=contrib";
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

If all goes well, you should be welcomed with the neovim welcome message and the
version should be the most up-to-date one from the master branch.

{{ end() }}

## Custom Neovim package

You can look on your configured Neovim as a standalone installable package. Now
you will create an overlay over the nixpkgs which provide definition of your
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
      url = "github:neovim/neovim?dir=contrib";
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

Here you introduced overlays. An overlay allows you to add or override some
attributes of already present package from nixpkgs. Overlay is a function with 2
arguments: `prev` and `final`. `prev` is the original "untouched" `nixpkgs` and
`final` is then the modified `nixpkgs`.

The overlays are set to `nixpkgs` together with the `system`. Based on the
`system` nix will know which package it needs to use in the build process.

In the first overlay `overlayFlakeInputs` you override `neovim` with the Neovim
package that comes from the flake inputs. In the second overlay you introduce
new attribute `myNeovim` which calls a function defined in separate file:

```nix
# packages/myNeovim.nix
{ pkgs }:
    pkgs.wrapNeovim pkgs.neovim {
      configure = {
         # here will come your custom configuration
      };
    }
```

The function takes an input `pkgs` which is set to overlay's `final` argument.
Therefore the `pkgs.neovim` now refers to the `neovim` declared in
`overlayFlakeInputs`. If you would pass in the flake `prev` argument, then the
`neovim` would actually refer to package defined in original nixpkgs on unstable
channel.

Test with `nix run` if everything is allright.

{{ end() }}

## Add vim script config

Some of my Neovim configuration is still written in Vim sript. I know it should
possible to migrate it all to lua, but this will be a project for later.

I organize my vim scripts into files in `config/vim`. At first, let's write it
all down, and then I will explain it all.

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
  customRC = import ../config;
in pkgs.wrapNeovim pkgs.neovim {
      configure = {
        inherit customRC;
      };
    }
```

### Understand Vim scripts

At first we created to vim scripts: `nvim-setters.vim` and `nvim-0-init.vim`.
The latter one has `0` in the name to ensure that it is the first file in the
directory. For an example, this is important for the leader key. If we would
call `nnoremap <leader>x foo<cr>` before updating `mapleader` to desired key, it
would assume a default `\` leader key for these mappings.

### Understand config's default nix script

Then you created `default.nix`. Default file acts somehow as `index.js` in
javascript. If you later import path leading to directory, nix will
automatically look for it.

`default.nix` resolves to a function which returns string which will be the
content of our `vimrc`.

The body of function is a call to `sourceConfigFiles` with argument `vim`. In
the `let-in` block you can see both defined.

### Understand transformation of Vim Script to Config files in nix store

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

### Understand transformation of Config files paths to vim source commands

Function `sourceConfigFiles` takes the list of installed script files, and each
of it transforms to a list of strings `source <NIX_STORE_PATH_OF_VIM_SCRIPT>`.

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
  customRC = import ../config;
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

Before you can verify that Telescope works, we still need to write a config for
it. This is decribed in next chapter.

{{ end() }}

## Add lua script config

You will add lua script to `config/lua` and extend `config/default.nix` to load
it in simmilar manner as you loaded the vim script.

```lua
-- config/lua/nvim-telescope.lua
local opt = { noremap = true }
local telescope = require("telescope")
telescope.setup({ })
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
      url = "github:neovim/neovim?dir=contrib";
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
telescope.setup({ })
telescope.load_extension("recent_files")
vim.api.nvim_set_keymap("n", "<leader><tab>", ":lua require('telescope.builtin').find_files()<CR>", opt)
vim.api.nvim_set_keymap("n", "<leader><leader>", ":lua require('telescope').extensions.recent_files.pick()<CR>", opt)
```

In this state, your Neovim should be runnable, and you can test the new
`telescope-recent-files` plugin by pressing space-space.

{{ end() }}

## Add runtime dependency

Have you heard about [mason.nvim](https://github.com/williamboman/mason.nvim)? I
have noticed it just recently, and it makes completely sense that it is getting
popular. Managing external runtime dependencies, like language servers, was
pain. I have looked briefly on it, and seems that they manage list of
dependencies they support. It is honorable effort, but the community feeding and
maintaing Nixpkgs compared to the mason's community is much larger. his is why I
think Nix will give you more freedom in declaration and configuration of your
reusable development environment.

In this chapter we will add two dependencies to demonstrate a mysterious bug I
have found, and how to overcome it. First thing, to keep it tidy, define your
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

In your neovim package you will make more changes. Let's first write it all
down.

```nix
# packages/myNeovim.nix
{ pkgs }:
let
  customRC = import ../config;
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

First thing that you changed was that you moved a package that was previous
returned from the module function to the `let-in` block, and assigned it to the
variable `myNeovimUnwrapped`. Instead of it now the module function returns new
package - a simple shell application.

In the shell application you defined `runtimeInputs` and passed to it a list
containing two packages that correspond to the dependency lists specified in the
previous file. These packages are build using `symlinkJoin`. It takes the
provided `paths` and creates symlinks pointing to them. All symlinksa are
bundled together into one package.

{{ tip(tip="And here occures the mysterious bug mentioned earlier. For some
reason, `symlinkJoin` fails to create properly all symlinks if both
dependencies - typescript server and lazygit - are defined together. Some links
will be missing in the resulted package.

{% todo() %} Which one, check when testing {% end %}

What is the rule for the mixture of the dependencies that manifests this bug I
have failed until now to discover. That's also why I have not yet opened a bug
for it. The naive and rough guess is that `nodePackages.*` can't be mixed with
other 'root' packages.") }}

Back to our shell application. It is called a
[wrapper](https://nixos.wiki/wiki/Nix_Cookbook#Wrapping_packages), and it allows
us to enrich the original unwrapped application. In our case packages in the
`runtimePaths` paths will be added to `PATH` environment vairable, and therefore
will be avaible for the Neovim process.

{{ why(question='Why do we pass `"$@"` to unwrapped Neovim?', answer="This is shell variable which has value of all parameters passed to the script. For example, if you want to edit a specific file `nvim foo.txt`, then the parameter `foo.txt` must forwarded to the original unwrapped `nvim`.") }}

You can test now that in terminal running `typescript-language-server --version`
will tell you that the command is not recognized. But running the command inside
Neovim's terminal (`:term`) will work.

{{ end() }}

## Generate lua config from nix

All nix packages are in `/nix/store` in a directory which is prefixed with hash
generated from the content of the package. If we want to reference some package
from the configuration scripts, we must resolve the path of the package on build
time. The traditional lua script configuration files that you have already set
up lack this ability.

In this chapter you will add Typescript runtime dependency, and use it in the
LSP configuration for `typescript-language-server`. Extend runtime dependencies.

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

Next create new `nvim-lspconfig.lua.nix` in new directory `config/luanix`.

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
The value contains a nix variable `${pkgs.nodePackages.typescript}`.

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
(similar like for `scripts2ConfigFiles`) a list of full paths to config file
located in the nix store.

The implementation maps every file found in the provided directory to a separate
package - a text file. The name of the package is obtained by removing the
`.nix` suffix, so the `nvim-lspconfig.lua.nix` will become `nvim-lspconfig.lua`.
And the content of the text file package is the string returned by the function
in the luanix configuration.

While this content is written, nix variables are resolved, and therefore
`${pkgs.nodePackages.typescript}` will become a full nix store path of the
typescript package.

Lastly `luanix` will be processed by `sourceCOnfigFiles`, and since the text
packages end correctly with `.lua`, in the vimrc they will be sourced with
`luafile` call.

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

Add snippets

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

```nix
# plugins.nix
{ pkgs }:
with pkgs.vimPlugins; [
  telescope-nvim
  telescope-recent-files
  ultisnips
]
```

## Generate vim config from nix

Use snippets

```nix
# config/vimnix/nvim-ultisnips.vim.nix
# vim: ft=vim
{ pkgs } : let
  ultisnipsSnippets = import ../../packages/ultisnipsSnippets.nix { inherit pkgs; };
in ''
  let g:UltiSnipsSnippetDirectories=["${ultisnipsSnippets}"]
''
```

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
  vimnix = nixFiles2ConfigFiles "luanix";
  lua = scripts2ConfigFiles "lua";
  luanix = nixFiles2ConfigFiles "luanix";

in builtins.concatStringsSep "\n"
(builtins.map (configs: sourceConfigFiles configs) [ vim vimnix lua luanix])
```

Would need to configure also completion plugin, to make proper use of it. For
demonstration purposes enough.

Run and try via command.

## Use your Neovim

Alias for nix run or add to package. Packages needs nix update.

## Updating

## Secrets

Rewrite to add ChatGPT. Warn about not able to run directly from github. Also
package must point to local path.

Storing secrets in a git repository may not be necessary for you, but it is a
useful skill to learn. In the context of Neovim, I have only used it to store an
OpenAI API key which is needed for the
[ChatGPT.nvim](https://github.com/jackMort/ChatGPT.nvim) plugin. You can use
[git-crypt](https://github.com/AGWA/git-crypt) to encrypt the desired files when
they are sent to the remote repository and decrypt them when they are returned
to the local.

I choose to declare `git` and `git-crypt` outside of the neovim flake. If you
are using nix configuration just add it to the `environment.systemPackages`, or
if you are using home manager add it to `home.packages`.

```bash
mkdir .secrets
git-crypt init
git-crypt export-key <PATH>
echo ".secrets/** filter=git-crypt diff=git-crypt" > .gitattributes
echo '{ openai-api-key = "<API_KEY>"; }' > .secrets/secrets.nix
```

All the files in the `.secrets` folder will have content tracked encrypted.
Locally the `git-crypt` automatically decrypts the files.

## Support other systems

Maybe just mention, and keep for later investigation.

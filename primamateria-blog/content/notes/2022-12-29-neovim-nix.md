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

{% todo() %} `Add` contact page {% end %}

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
pkgs:
with pkgs.vimPlugins; [
  telescope-nvim
]
```

{{ tip(tip="`with-expression` allows you to avoid repeating the selects from `pkgs.vimPlugins` for each listed plugin name.") }}

Add now extend your Neovim package to include all plugins listed in
`plugins.nix`:

```nix
# packages/myNeovim.nix
{ pkgs }:
let
  customRC = import ../config;
  plugins = import ../plugins.nix;
in pkgs.wrapNeovim pkgs.neovim {
      configure = {
        inherit customRC;
        packages.all.start = plugins pkgs;
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

Add recent files.

## Add runtime dependency

LSP server.

## Generate lua config from nix

LSP config with reference to LSP server package.

This is a nix file which when imported will resolve to multiline string. To
enable vim formatting you can force filetype `vim` in the
[modeline](https://neovim.io/doc/user/options.html#modeline) `vim: ft=vim`.

## Package anything else

Add snipets

## Secrets

Rewrite to add ChatGPT.

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

{% todo() %} add instruction for ChatGPT.plugin setup and passing api key to
neovim wrapper. {% end %}

## Usage

Alias for nix run. How about packages? Maybe won't work after adding secrets.
Verify and possibly get rid of packages.

## Updating

## Support other systems

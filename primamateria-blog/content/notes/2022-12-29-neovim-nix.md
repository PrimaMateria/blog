+++
title = "How to create your own Neovim flake"
date = 2022-12-29
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

{% todo() %} Add contact page {% end %}

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

{% todo() %} rewrite the answer {% end %}

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
      overlay = prev: final: {
        myNeovim = import ./packages/myNeovim.nix;
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

```nix
# packages/myNeovim.nix
{ pkgs }:
    pkgs.wrapNeovim neovim.packages.x86_64-linux.neovim {
      configure = {
         # here will come your custom configuration
      };
    }
```

{% todo() %} test and format the code {% end %}

Test with `nix run` if everything is allright.

## Add vim script config

Lua, good, will migrate later. If you are already pure lua user, read later to
see how to provide lua configs. Basic config with setters.

## Add plugin from Nixpkgs

Usually you will find the most popular plugins in nixpkgs. Plugins definition in
nixpkgs can also list their dependencies, so when the it depends on other
plugins, these will be installed and included to Neovim as well.

For the example, we will add the telescope plugin. First we will create a
separate nix file which will contain a list of the plugins:

```nix
# plugins.nix
pkgs:
with pkgs.vimPlugins; [
  telescope-nvim
]
```

Add now extend your Neovim package to include all plugins listed in
`plugins.nix`:

```nix
# packages/myNeovim.nix
{ pkgs }:
let
  plugins = import ../plugins.nix;
in pkgs.wrapNeovim neovim.packages.x86_64-linux.neovim {
      configure = {
        packages.all.start = plugins pkgs;
      };
    }
```

{% todo() %} test and format the code {% end %}

{{ why(question="Why we set `packages.all.start`?", answer="Word all doesn't matter and can be anything. And start signifies that the plugins will be loaded on start.") }}

{% todo() %} rephrase and verify start {% end %}

TIP: Searching nixpkgs for available plugins.

INFO: How to verify which plugins were included (checking results).

## Add lua script config

Configure telescope.

## Add plugin not found in Nixpkgs

Add recent files.

## Add runtime dependency

LSP server.

## Generate lua config from nix

LSP config with reference to LSP server package.

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

+++
title = "How to create your own Neovim flake"
date = 2022-12-29
+++

## Introduction

This step-by-step guide will show you how to set up your own Neovim as a Nix
Flake. I won't explain what Nix and Nix Flake are here, as there are already
many other resources that do this perfectly.

With this setup, you can use Git and Nix's magic to keep your configuration
files, list of plugins, and required external dependencies synced across
multiple machines. This will not only keep your editor configuration in sync,
but also your entire development environment. Additionally, you can use this
setup to keep your editor configuration in sync with your colleagues.

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

TODO: rewrite the answer

As the initial step, we will pass Neovim from the input to the output.

```nix
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

## Initialize secrets

Storing secrets in a git repository may not be necessary for you, but it is a
useful skill to learn. In the context of Neovim, I have only used it to store an
OpenAI API key which is needed for the ChatGPT.nvim plugin. You can use
[git-crypt](https://github.com/AGWA/git-crypt) to encrypt the desired files when
they are sent to the remote repository and decrypt them when they are returned
to the local.

## Add plugins

### Plugins found in nixpkgs

### Plugins not found in nixpkgs

## Add snippets

## Add config

### Vim script

### Lua script

### Lua from nix

## Add runtime dependency

## Updating

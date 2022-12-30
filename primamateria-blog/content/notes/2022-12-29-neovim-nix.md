+++
title = "How to create your own neovim flake"
date = 2022-12-29
+++

## Introduction

This is step by step guide how to set up your own neovim as nix flake.

You will have your config files, list of plugins and required external
dependencies tracked in git repository. With this setup and nix' magic, you
should have a convenient way to keep synced across machines not only your editor
configuration, but your whole development environment. You can also use this
setup to keep your editor configuration in sync with your colleagues.

## Initialize the flake

Flake will take provided inputs, and it will output a package, that can be
installed with nix package manager; and an app, which can be directly run.

First we start with bare flake structure:

```nix
# flake.nix
{
  description = "My own neovim flake";
  inputs = { };
  outputs = { self }: { };
}
```

? Why is `self` a required argument of the `outputs` function? ! Not found

We will add 2 inputs:

1. `nixpkgs` - a source of all nix packages we can later declare. We will use
   the master branch as we prefer early access to the latest feature over the
   stability.
1. `neovim` flake - we will source neovim directly from the neovim repository
   from the master branch to get access to rolling updates.

```nix
{
  description = "My own neovim flake";
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

{{ why(question="Why we override neovim's flake nixpkgs input to follow unstable?", answer="This way we instruct neovim to be build using the same packages. Probably it would work even without it. And I kind of repeat it as a convention. But I can't see it as a recursive fix -meaning, if neovim depends on other flakes, their nixpkgs inputs won't follow the provided value.") }}

Now, as the first step we will simply pass neovim from the input to the output:

```nix
{
  description = "My own neovim flake";
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

Our flake provides neovim as a default package for the `x86_64-linux` system,
and a default app refers executes neovim's binary.

Now, lets run the app!

```bash
nix run
```

If everything went well you should be greeted with neovim welcome message and
the version should be the latest one from the master branch.

## Initialize secrets

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

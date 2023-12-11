+++
title = "Hive"
date = 2023-11-28

[extra]
banner = "hive.png"

[taxonomies]
tags = ["nixos","hive","paisano","haumea"]
+++

Hive is a framework that aims to assist with the organization of personal Nix
configurations. This post describes why I have chosen to migrate to it and
explains how I accomplished it. It is intended for curious Nix users who feel
that their current configuration is disorganized and are seeking a new approach
to rework their code.

<!-- more -->

# Factoids

- Hive is a spiritual successor of Digga.
- Hive spawns from std.
- The author is David Arnold.
- First commit in the repository is from 29th March 2022.

{{ end() }}

{{ tip(tip="

In this post, I will describe my own approach of using Hive. It may differ from
the prevailing convention of naming things, and it may not utilize the latest
available Nix tools. I approach my problem as a developer who aims to create a
convenient and reproducible development environment. I am not an operations
professional who needs to ensure absolute security. Additionally, I am limited
by my current understanding, and I am open to your comments and opinions.

") }} {{ end() }}

# Road to Hive

I started with
[Will T's NixOS series ](https://www.youtube.com/watch?v=QKoQ1gKJY5A&list=PL-saUBvIJzOkjAw_vOac75v-x6EzNzZq-)
in 2022, copying configs without fully understanding them. But I managed to keep
it going for a while, and even eventually moved my daily office tasks from
Ubuntu WSL to NixOS WSL.

After creating the [Neovim flake](@/neovim-nix.md) I got some confidence. Felt
like I understood much more, and I was ready for the next step. I wanted to redo
my main NixOS config.

In my first config things got real messy - I mixed flakes, dwelved on the
old-school `import`, messed with callPackage without understanding what it does,
and I totally missed the "nix modules boat", even if I used them as copy-pasta
here and there.

I didn't have a solid grip on the language and on themodule system, and I needed
some guidance for how to organize my configs. So I started doing some research
and I found the [NixOS Guide](https://github.com/mikeroyal/NixOS-Guide), and
inside link to [Digga](https://github.com/divnix/digga). But the projects was
already with a deprecation notice.

{{ tip(tip="

Digga was already
[removed](https://github.com/mikeroyal/NixOS-Guide/commit/14a6d9530bb958bae7eaf531191bcc99f03e44f0)
from the NixOS Guide, but Hive had not yet been added.

") }}

The author mentions migration to std, flake-parts or flake-utils-plus. While
investigating std, the Hive was
[mentioned](https://std.divnix.com/#the-standard-nixos-story-in-case-you-wondered)
in the docs:

> _"Once you got fed up with divnix/digga or a disorganized personal
> configuration, please head straight over to divnix/hive and join the chat,
> there. It's work in progress. But hey! It means: we can progress together!"_

And there it was, Hive, a mysterious project with a README ban, with small
community and with some praise in the matrix chat. I was intrigued.

But before fully committing, I looked for alternatives.

{{ resize_image_w(path="hive/flake-parts.png", width=1008) }}

That's from Discord and it's not me asking, but someone with the same dilemma.

I have poked around the flake-parts' [documentation](https://flake.parts/), but
it was too steep for me to fully grok the concept. It felt like I am on the same
starting line for both Hive and flake-parts. Little what I have observed was
that the repositories using Hive contained some kind of block types, which gave
me an impression that it is more opionated framework, and as a newb this was
something I was looking for.

I followed [Lord-Valen's repo](https://github.com/Lord-Valen/configuration.nix).
The rough foundation draft I created by rewriting Valen's flake, and by blindly
migrating my old configs without even checking if it builds. Once I had my
"dream structure" in place, I created fresh WSL instance and keep on fixing the
code until I was able to do the first full build and system switch. From this
moment I had already good grasp on it and the rest of final detailing was smooth
sailing.

{{ end() }}

# NixOS Module

Before I start describing Hive, I have to mention the NixOS module this is an
essential mechanism.

The usual structure is as follows:

```nix
{ config, pkgs, lib, ... }:
with lib;
let
  cfg = config.thisModule;
in {
  imports = [
    ./someOtherModule1.nix
    ./someOtherModule2.nix
  ];
  options.thisModule = {
    someOption = mkOption {
      type = types.bool;
      default = false;
    };
  };
  config = {
    someConfig = mkIf cfg.someOption "someValue";
    someOtherConfig = "someOtherValue";
  };
}
```

There are 3 important sections:

- `imports` - list of other NixOS modules that will get imported
- `options` - list of options of the current module
- `config` - the main "body" with default and option-based configuration

{{ tip(tip="

Usually the docs mention `enable` option, that is common in NixOS and Home
Manager configurations. In my case I write and import modules that I intend to
use, so I never use `enable`. Although I can see now the idea of repositories of
prepared and mantained modules. This also why I got a feedback on my Neovim
flake tutorial that the prefferred way should be contributing to
[NixVim](https://github.com/nix-community/nixvim).

") }}

If modules doesn't have options, then we can omit the config field and place the
"main body" on top level:

```nix
{ pkgs, ... }: {
  imports = [ ./someOtherModule.nix ];
  environment.systemPackages =  [ pkgs.hello ];
}
```

{{ end() }}

# Paisano and Haumea

Important to mention are the transitive dependencies **Paisano** and **Haumea**.
It looks like both tools were created to solve the similar problem - to enable
using file systems for declaring modules, and to provide a nix function to
automatically load, or collect these modules into a nix' attribute set.
Additionally the load functions provide standardized call parameters, which
allow to easily access other modules from the configuration. Of course, there
are more advanced technicks like picking, filtering, or hoisting diferent
attributes, but it's not needed to go into more details with them.

{{ tip(tip="

[Haumea](https://github.com/nix-community/haumea) exists with
[initial commit](https://github.com/nix-community/haumea/commit/13c2fcf9e60ac2cd99e25433efd0d35e3b43d14ca)
from the 1st April 2023, and it's authored by
[figsoda](https://github.com/figsoda). You can have also look on my brief
[cheatsheet](@/haumea-cheatsheet.md).

[Paisano](https://github.com/paisano-nix/core) was at first a part of the
Standard platform, and it was extracted as separate tool with a
[first commit](https://github.com/paisano-nix/core/commit/9b95b00f7b4ea1af1d4eb5e09b33cdf8fdc1db44)
to it's own repository on 9th February 2023. There is also a short
[cheatsheet](@/paisano-cheatsheet.md).

") }}

In the Paisano repository exists a branch where David is trying to use Haumea
internally, but it is not used yet in Hive (or Standard), although both projects
are directly using Haumea internally.

{{ end() }}

# Testing Environment

For testing this tutorial I will be using Nix' built-in functionality to run
system configuration in the virtual machine. At first define initial flake
without Hive:

```nix
{
  outputs = { ... }@inputs:
    {
      nixosConfigurations.experiment = inputs.nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          ({ pkgs, ... }: {

            users.users.foo = {
              isNormalUser = true;
              initialPassword = "foo";
            };

            environment.systemPackages = with pkgs; [ hello ];
            system.stateVersion = "23.11";
          })
        ];
      };
    };

  inputs = {
    nixpkgs-stable.url = "github:nixos/nixpkgs/23.11";
    nixpkgs-unstable.url = "github:nixos/nixpkgs/master";
    nixpkgs.follows = "nixpkgs-unstable";
  };
}
```

Now test it with:

```
nix run '.#nixosConfigurations.experiment.config.system.build.vm'
```

The Qemu window will start with a machine that will load the configuration. Log
in with "foo/foo", and try to run `hello`:

<div style="margin-top: 24px">
{{ resize_image_w(path="hive/vm-test.png", width=450) }}
</div>

{{ end() }}

# Hive Flake

Hive is a flake-based configuration. Inputs include:

- **std** - the Standard - as I understand it, it's a more complex framework
  intended for DevOps to declare configurations for building and deploying
  projects. The Hive was spawned from the Standard with the intention of
  focusing on system and home configurations. Personally, I have never used the
  Standard before and probably will never need to.
- **hive** - I wouldn't say that Hive is an extension of the Standard. It
  adheres to the same principles and reuses some block types from std, but other
  than that, it seems that there isn't much dependency on it.

```nix
{
  outputs = { ... }@inputs:
    hive.growOn
      {
        inherit inputs;
        # TODO: define cells source directory
        # TODO: define cell blocks
      }
      {
        nixosConfigurations = hive.collect self "nixosConfigurations";
      };

  inputs = {
    nixpkgs-stable.url = "github:nixos/nixpkgs/23.11";
    nixpkgs-unstable.url = "github:nixos/nixpkgs/master";
    nixpkgs.follows = "nixpkgs-unstable";

    std = {
      url = "github:divnix/std";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    hive = {
      url = "github:divnix/hive";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

Outputs are the result of the `hive.growOn` function. `growOn` is paisano
function that takes variable count of parameters. The first one is always a
setup of the Hive, where the source folder for the cells is specified, together
with the cell block types available in our configuration.

The rest of the parameters, I believe, are called "layers of soil", they are
recursively merged together to one attribute set that becomes the conventional
outputs of the flake.

{{ end() }}

# Hive Biology

Cell, Block, Grow, bee, Harvest, findLoad

https://std.divnix.com/guides/growing-cells.html
https://std.divnix.com/reference/blocktypes.html
https://std.divnix.com/glossary.html

TODO: build up here an example code

In my own words this is how I understand the basic terms used in Hive:

## Cell

Cells is supposed to be top level structure for organizing the config. Cells is
constructed from different types of cell blocks. What I usually observed in
repositories using Hive was one main cell, sometimes accompanied by smaller
cells for, probably, some more exotic use cases. In my own config I decided the
cell to contain everything, and I named in "PrimaMateria".

## Cell Block

As mentioned, cell blocks are construction blocks of the cell. They are of
different types, and then the type defines what kind of transformations will
happen to the blocks when harvested, and may have different actions associated
with them. The actions are more related to the Standard platform, and I don't
use them at all. Later on I will present an approach I observed in Lord-Valen's
configuration and then my own structure.

The cell block types I am using in my configuration are only:

- **functions** - the most versatile type, that can be used for NixOS modules
- **nixosConfigurations** - block of this type returns list of NixOS system
  configurations, and uses the Bee module
- **homeConfigurations** - simalarly the block returns list of Home Manager
  configurations. It is, as well, using the Bee module.

# Bee

Bee module is a configuration for the of the build process that transforms the
blocks to the flake outputs. It contains the list of target systems, and slots
for passing Home Manager, WSL, Darwin and of course Nix packages flakes, that
will be used to build the outputs.

```nix
#        ████  ████
#      ██    ██    ██
#        ██    ██  ██
#          ██████████
#        ████░░██░░░░██
#      ██░░██░░██░░░░░░▓▓
#  ▓▓▓▓██░░██░░██░░▓▓░░██
#      ██░░██░░██░░░░░░██
#        ████░░██░░░░██
#          ██████████

{ inputs, cell }: {
  system = "x86_64-linux";
  pkgs = inputs.nixpkgs;
}

```

## Harvest

collect already in hive

## Find and Load

{{ end() }}

{{ tip(tip="

At the end I want to mention, that I am not a big fan of using biology terms to
name things in programming. I got already use to them, but in the project
without even a README they make understanding the source code one more step more
harder.

") }}

{{ why(question="

Yeah, criticizing is easy, but can you come with better names?

", answer="

The well know clique applies here - the hardest thing in the programmer life is
naming things.

- `cell` - `collection`
- `cellBlock` - `unit`, or just a `block` is fine either
- `grow` - `setup`
- `collect` - good one
- `bee` - `buildConfig`
- `findLoad` - good one

") }}

# Dream Structure

also mention that not using agenix, but kept using git-crypt

- **home-manager** - a tool for managing the user environment
- **wsl** - for my personal use case. I am using NixOS running on WSL. Actually,
  it's the only tested config I have done with Hive simply because over time I
  realized that this is the most convenient combination for me - at work, I am
  forced to use Windows, and at home, I can combine a convenient gaming
  experience with a handy NixOS environment.

# Links

and how to search github for hive projects
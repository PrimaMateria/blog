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

# Hive Biology

cell, blocks, bee, growOn, findLoad, paisano, haumea

# Dream Structure

# Links

and how to search github for hive projects

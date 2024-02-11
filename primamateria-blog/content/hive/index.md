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

In this post, I will describe my own approach of using Hive. It may differ from
the prevailing convention of naming things, and it may not utilize the latest
available Nix tools. I approach my problem as a developer who aims to create a
convenient and reproducible development environment. I am not an operations
professional who needs to ensure absolute security. Additionally, I am limited
by my current understanding, and I am open to your comments and opinions.

{{ end() }}

# Factoids

- Hive is a spiritual successor of Digga.
- Hive spawns from std.
- The author is David Arnold.
- First commit in the repository is from 29th March 2022.

{{ end() }}

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

{{ nerdy(text="

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

{{ nerdy(text="

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

{{ nerdy(text="

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

# The Hive

Hive is using following hierarchy of the building blocks:

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart TB
  subgraph Hive
    subgraph Cell
      subgraph Cell Block
        subgraph Cell Block Instance
        end
      end
    end
  end
{% end %}
<!-- prettier-ignore-end -->

The blocks will be introduced step by step in the tutorial.

Before we begin, also take a look at the following diagram that describes the
Hive. Don't be intimidated, it may appear complicated. For now, just quickly
scan it and continue with the tutorial. Once you have completed the tutorial,
you can return to review the diagram and see if it becomes clearer to you.

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart TB
  growOn -->|produces| flakeOutput
  growOn -->|processing| soil
  growOn -->|uses| hiveConfig
  hiveConfig -->|declares source directory of| cellBlock
  hiveConfig -->|declares list of| cellBlockType
  soil -->|contains| transformedBlock
  transformedBlock -->|is produced by| collect

  collect -->|resolves| collector
  collect -->|processing| cellBlock
  collector -->|calls| walkPaisano 
  walkPaisano -->|applies| renamer
  walkPaisano -->|applies| transformer

  cellBlock -->|calls| findLoad
  findLoad -->|finds all| cellBlockInstance
  findLoad -->|calls| hamuea-load
  hamuea-load -->|loads| cellBlockInstance

  cellBlock -->|is of| cellBlockType
  cellBlockType ---->|has dedicated| collector
  cellBlockType -->|has dedicated| transformer

  transformer -->|uses| bee
{% end %}
<!-- prettier-ignore-end -->

{{ end() }}

# Testing Environment

For testing this tutorial we will be using Nix' built-in functionality to run
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
  outputs = { std, hive, ... }@inputs:
    hive.growOn
      {
        inherit inputs;
        # TODO: define cells source directory
        # TODO: define cell blocks
      }
      {
        # TODO: define flake output
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

# Cell

Cells is supposed to be top level structure for organizing the config. Cells is
constructed from different types of cell blocks. What I usually observed in
repositories using Hive was one main cell, sometimes accompanied by smaller
cells for, probably, some more exotic use cases. In my own config I decided the
cell to contain everything, and I named in "PrimaMateria".

Create new directory path `cells/experiment` and keep it empty for now.

```
├── cells
│  └── experiment
└── flake.nix
```

Update `growOn` parameter set with `cellsFrom` attribute.

```nix
{
  outputs = { std, hive, ... }@inputs:
    hive.growOn
      {
        inherit inputs;
        cellsFrom = ./cells;
        # TODO: define cell blocks
      }
      {
        # TODO: define flake output
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

{{ nerdy(text="

David, the author of Standard and Hive, suggests naming the directory `nix` as
opposed to `celss`. This recommendation is based on the idea that it would
provide a clearer indication of the directory's content to individuals who are
not familiar with Hive. However, I have chosen to adopt the new domain language
and name the directory `cells`.

") }}

# Cell Block

Cell blocks are the fundamental components of a cell. They exist in different
forms, and each form dictates the changes that take place when they are
collected. Furthermore, each form may have different actions associated with it.
Although I personally do not utilize them, based on the documentation, it
appears that Standard provides a command-line interface (CLI) tool that offers a
user-friendly way to execute these actions.

At first, declare that the hive configuration will use a cell of type
`nixosConfiguration`.

```nix
{
  outputs = { std, hive, ... }@inputs:
    hive.growOn
      {
        inherit inputs;
        cellsFrom = ./cells;
        cellBlocks = with hive.blockTypes; [
          nixosConfigurations
        ];
      }
      {
        # TODO: define flake output
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

Now, cceate the new cell block. The filename must match the name of the cell
block type.

```
├── cells
│  └── experiment
│     └── nixosConfigurations.nix
└── flake.nix
```

Move the "experiment" system to the cell block. Assign the main module, which is
currently the only module, to the attribute that bears the name of the system
confuguration.

```nix
{ inputs, cell }:
let
  inherit (inputs) nixpkgs;
in
{
  experiment = {
    users.users.foo = {
      isNormalUser = true;
      initialPassword = "foo";
    };

    environment.systemPackages = with nixpkgs; [ hello ];
    system.stateVersion = "23.11";
  };
}
```

The meta configuration with the `system` attribute is not included in the cell
block. Cell blocks are independent of any specific system. The target system
will be configured later in the "bee" module.

Observe how the cell block can access all the inputs of the root flake
(specified by the `inputs` parameter), as well as all other cell blocks from the
current cell (specified by the `cell` parameter, which will be used later).

# Bee

The Bee module is a configuration used by transformer that transforms the cell
blocks into transformed system-specific derivatives. It includes a list of
target systems and slots for passing Home Manager, WSL, Darwin, and, of course,
Nix package flakes that will be used to produce the transformed blocks.

Once again, declare a new cell block of the type `functions` as the first step.
This type is the most versatile and does not undergo any special transformations
during the harvest process.

```nix
{
  outputs = { std, hive, ... }@inputs:
    hive.growOn
      {
        inherit inputs;
        cellsFrom = ./cells;
        cellBlocks = with std.blockTypes; with hive.blockTypes; [
          (functions "bee")
          nixosConfigurations
        ];
      }
      {
        # TODO: define flake output
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

Create the bee module. If your configuration becomes more complex, you may
eventually have multiple bees.

```
├── cells
│  └── experiment
│     ├── nixosConfigurations.nix
│     └── bee.nix
└── flake.nix
```

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

{{ nerdy(text="

If you attempt to define an overlay within the cell block, Hive will warn you
that this will not work and that overlays need to be already defined in `pkgs`
provided by the bee. I don't have an example for it because, so far, I have
always been able to meet my requirements without an overlay.

") }}

Finally, assign the bee to the main module of the experiment nixos
configuration. Now, the `cell` parameter becomes useful for easily referencing
the bee cell block.

```nix
{ inputs, cell }:
let
  inherit (inputs) nixpkgs;
  inherit (cell) bee;
in
{
  experiment = {
    inherit bee;

    users.users.foo = {
      isNormalUser = true;
      initialPassword = "foo";
    };

    environment.systemPackages = with nixpkgs; [ hello ];
    system.stateVersion = "23.11";
  };
}
```

# Collect

Collect function produces transformed blocks from provided cell block. Based on
cell block type it selects corresponsing collector and executes it to collect
and transform cell block instances employing the Bee module. Transformed blocks
are placed in the soil, that will be processed by `growOn` function to produce
final flake output.

Collect `nixosConfigurations` cell block.

```nix
{
  outputs = { self, std, hive, ... }@inputs:
    hive.growOn
      {
        inherit inputs;
        cellsFrom = ./cells;
        cellBlocks = with hive.blockTypes; with std.blockTypes; [
          (functions "bee")
          nixosConfigurations
        ];
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

If we will look on the output of `nix flake show` it will contain

```
├───nixosConfigurations
│   └───experiment-experiment: NixOS configuration
```

Then name "experiment-experiment" is chosen because the cell is called
experiment and also the nixos configuration is called experiment. This is little
confusing, so let's change it in the next step, but before test that the
experiment nixos can be run in the virtual machine:

```
nix run '.#nixosConfigurations.experiment-experiment.config.system.build.vm'
```

# findLoad

Function `findLoad` finds all Cell Block Instances of the Cell Block with path
specified in the `block` attribute. The found instances are loaded using Haumea.
The loading will be explained in next step.

Create two Cell Block Instances of nixos configurations - home instance that
will build nixos used at home, and work instance that will build nixos system
used in work.

```
├── cells
│  └── experiment
│     ├── nixosConfigurations
│     │  ├── default.nix
│     │  ├── home.nix
│     │  └── work.nix
│     └── bee.nix
└── flake.nix
```

To keep the tutorial simple, let's say that at work we need to use package
hello. Implement `work.nix` as follows:

```nix
{ inputs, cell }:
let
  inherit (inputs) nixpkgs;
  inherit (cell) bee;
in
{
  inherit bee;

  users.users.foo = {
    isNormalUser = true;
    initialPassword = "foo";
  };

  environment.systemPackages = with nixpkgs; [ hello ];
  system.stateVersion = "23.11";
}
```

And at home we need to use package cowsay. Implement `home.nix` as follows:

```nix
{ inputs, cell }:
let
  inherit (inputs) nixpkgs;
  inherit (cell) bee;
in
{
  inherit bee;

  users.users.foo = {
    isNormalUser = true;
    initialPassword = "foo";
  };

  environment.systemPackages = with nixpkgs; [ cowsay ];
  system.stateVersion = "23.11";
}
```

At last, in the `default.nix` call `findLoad` that will find and load home and
work nixos configurations.

```nix
{ inputs, cell }:
inputs.hive.findLoad {
  inherit inputs cell;
  block = ./.;
}
```

Now we can test both nixos systems in the virtual machine. Test that we can call
hello at work system, and cowsay at home system.

```
nix run '.#nixosConfigurations.experiment-work.config.system.build.vm'
nix run '.#nixosConfigurations.experiment-home.config.system.build.vm'
```

# Haumea Load

The files loaded by `findLoad` are loaded the Haumea way. That is important to
know when loading a directory instead of one file. Content in the Nix files in
this directory is then treated as value of an attribute with name that equals
the file name. That's the core Haumea magic.

Maybe I don't fully yet understand the power of Haumea load, but in my case I
found it useful only to define `options` for the NixOS module in a separate file
called `options.nix`. I split the code, but as a customly name NixOS module,
that I don't want Haumea to automatically dump into a attribute of the default
module. Therefore I ended up creating "private" submodules with names that are
prefixed with `__` which makes them ignored by Haumea.

TODO: example with Haumea loaded file and with private submodule

# Standard Structure

- TODO: mention that from valen
- TODO: rewrite the puml to mermaid
- TODO: mention about missing homeConfigurations

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart BT

    subgraph cell
        homeModules --> homeProfiles
        homeProfiles --> homeSuites
        homeProfiles --> nixosConfigurations
        homeSuites --> nixosConfigurations

        nixosModules --> nixosProfiles
        nixosProfiles --> nixosSuites
        nixosProfiles  --> nixosConfigurations
        nixosSuites --> nixosConfigurations
        userProfiles --> nixosSuites

        diskoConfigurations --> hardwareProfiles
        hardwareProfiles --> nixosConfigurations
        arionProfiles --> nixosConfigurations

        nixosConfigurations --> colmenaConfigurations
        nixosConfigurations --> installers
    end

    subgraph inputs
       nixos-hardware
       nixos-generators
    end

    nixos-hardware --> hardwareProfiles
    nixos-generators --> installers
{% end %}
<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart BT

    modules --> profiles
    profiles --> suites
    suites --> nixosConfigurations
{% end %}
<!-- prettier-ignore-end -->

# Dream Structure

- TODO: create graph
- TODO: talk about what are modules, what are cell blocks
- TODO: say it is experimenting stage and not the recommending
- TODO: mention not having tried the standalone install yet

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart BT

    applications --> homeConfigurations
    devices --> machines
    machines --> nixosConfigurations
    system --> installations
    installations --> nixosConfigurations
    secrets
{% end %}
<!-- prettier-ignore-end -->

Look on the nixosConfigurations side for mentat, wokwok and gg.

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart BT

    devices["
      <b>devices</b>
      disk_ssd_win
      ethernet
      graphics_nvidia_3080
      monitor_acer
      mouse_logitech_g502
      printer_hp_deskjet
    "]:::list

    machines["
      <b>machines</b>
      tower
    "]:::list

    system["
      <b>system</b>
      bootloader
      bluetooth
      networking
      sound
      essentials
      i3
    "]:::list

    installations["
      <b>installations</b>
      common
      bare_metal
    "]:::list

    nixosConfigurations["
      <b>nixosConfigurations</b>
      mentat
    "]:::list

    devices --> machines
    machines --> nixosConfigurations
    system --> installations
    installations --> nixosConfigurations

    classDef list text-align:left;

{% end %}
<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart BT

    system["
      <b>system</b>
      wsl
      essentials
      vnc
    "]:::list

    installations["
      <b>installations</b>
      common
      wsl
    "]:::list

    nixosConfigurations["
      <b>nixosConfigurations</b>
      wokwok
    "]:::list

    system --> installations
    installations --> nixosConfigurations

    classDef list text-align:left;

{% end %}
<!-- prettier-ignore-end -->

also mention that not using agenix, but kept using git-crypt

- **home-manager** - a tool for managing the user environment
- **wsl** - for my personal use case. I am using NixOS running on WSL. Actually,
  it's the only tested config I have done with Hive simply because over time I
  realized that this is the most convenient combination for me - at work, I am
  forced to use Windows, and at home, I can combine a convenient gaming
  experience with a handy NixOS environment.
- **homeConfigurations** - simalarly the block returns list of Home Manager
  configurations. It is, as well, using the Bee module.

# Critique

{{ nerdy(text="

At the end I want to mention, that I am not a big fan of using biology terms to
name things in programming. I got already use to them, but in the project
without even a README they make understanding the source code one more step more
harder.

") }}

{{ curious(text="

Yeah, criticizing is easy, but can you come with better names?

") }}

{{ nerdy(text="

The well know clique applies here - the hardest thing in the programmer life is
naming things.

- `cell` - `collection`
- `cellBlock` - ``
- `growOn` - `setup`
- `collect` - good one
- `bee` - `buildConfig`
- `findLoad` - good one

") }}

# Links

and how to search github for hive projects

https://std.divnix.com/guides/growing-cells.html
https://std.divnix.com/reference/blocktypes.html
https://std.divnix.com/glossary.html

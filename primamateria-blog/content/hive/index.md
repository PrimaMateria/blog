+++
title = "Hive"
date = 2023-11-28

[extra]
banner = "hive.png"

[taxonomies]
tags = ["nixos","hive","paisano","haumea"]
+++

Hive is a framework that aims to help with organizing personal Nix
configurations. This post explains why I have decided to switch to it and
provides a step-by-step tutorial for trying it out yourself. It is intended for
Nix users who are curious and feel that their current configuration is
disorganized, and are looking for a new way to restructure their code.

<!-- more -->

In this post, I will describe my own approach to using Hive. It may differ from
the prevailing convention of naming things, and it may not utilize the latest
available Nix tools. I approach my problem as a developer who aims to create a
convenient and reproducible development environment. I am not an operations
professional who needs to ensure absolute security. Additionally, I am limited
by my current understanding, and I am open to your comments and opinions.

{{ end() }}

# Factoids

- Hive is the spiritual successor of Digga.
- Hive originates from std (Standard).
- The author is David Arnold.
- The first commit in the repository is dated 29th March 2022.

{{ end() }}

# Road to Hive

I began with
[Will T's NixOS series](https://www.youtube.com/watch?v=QKoQ1gKJY5A&list=PL-saUBvIJzOkjAw_vOac75v-x6EzNzZq-)
in 2022, where I copied configurations without fully comprehending them.
However, I was able to sustain this practice for some time and eventually
transitioned my daily office tasks from Ubuntu WSL to NixOS WSL.

After creating the [Neovim flake](@/neovim-nix.md), I gained some confidence. I
felt like I understood much more and was ready for the next step. I wanted to
redo my main NixOS configuration.

In my initial configuration, things became quite messy. I mixed flakes, dwelled
on the old-school `import`, tampered with `callPackage` without comprehending
its purpose, and I completely overlooked the "nix modules boat", despite using
them as copy-pasta occasionally.

I didn't have a solid grasp of the language and the module system, and I needed
some guidance on how to organize my configurations. So I began researching and
came across the [NixOS Guide](https://github.com/mikeroyal/NixOS-Guide), which
included a link to [Digga](https://github.com/divnix/digga). However, I
discovered that the project had already been deprecated.

{{ nerdy(text="

Digga was already
[removed](https://github.com/mikeroyal/NixOS-Guide/commit/14a6d9530bb958bae7eaf531191bcc99f03e44f0)
from the NixOS Guide, but Hive had not yet been added.

") }}

The author mentions migration to std, flake-parts or flake-utils-plus. While
investigating std, the Hive was
[mentioned](https://std.divnix.com/#the-standard-nixos-story-in-case-you-wondered)
in the docs:

The author mentions migration to std, flake-parts, or flake-utils-plus. While
investigating std, the Hive was mentioned in the documentation:

> _"Once you got fed up with divnix/digga or a disorganized personal
> configuration, please head straight over to divnix/hive and join the chat,
> there. It's work in progress. But hey! It means: we can progress together!"_
>
> [The Standard NixOS Story (in case you wondered)](https://std.divnix.com/#the-standard-nixos-story-in-case-you-wondered).

And there it was, Hive, a mysterious project with a ban on README, a small
community, and some praise in the matrix chat. I was intrigued.

However, before fully committing, I searched for alternatives.

{{ resize_image_w(path="hive/flake-parts.png", width=1008) }}

This message is from Discord, and it is not me who is asking, but rather someone
who is facing the same dilemma.

I have explored the [documentation of flake-parts](https://flake.parts/), but it
was too difficult for me to fully understand the concept. It felt like I was
starting from scratch with both Hive and flake-parts. One thing I noticed was
that the repositories using Hive had certain block types, which gave me the
impression that it is a more opinionated framework. As a beginner, this is
something I was searching for.

I followed
[Lord-Valen's repository](https://github.com/Lord-Valen/configuration.nix). I
initially created a rough foundation draft by rewriting Valen's flake and
migrating my old configurations without checking if they build. Once I had my
desired structure set up, I created a fresh WSL instance and continued fixing
the code until I successfully completed the first full build and system switch.
From that point on, I had a good-enough understanding of it, and the remaining
final details were easily resolved.

{{ end() }}

# NixOS Module

Before I begin describing Hive, I must mention that the NixOS module is an
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

There are three important sections:

- `imports` - a list of other NixOS modules that will be imported.
- `options` - a list of options for the current module.
- `config` - the main "body" containing default and option-based configuration.

{{ nerdy(text="

Usually, the documentation mentions the `enable` option, which is common in
NixOS and Home Manager configurations. In my case, I write and import modules
that I intend to use, so I never use `enable`. However, I can now understand the
concept of repositories with prepared and maintained modules. This is also why I
received feedback on my Neovim flake tutorial, suggesting that the preferred
approach should be contributing to
[NixVim](https://github.com/nix-community/nixvim).

") }}

If modules do not have options or imports, then we can omit the config field and
place the "main body" at the top level.

```nix
{ pkgs, ... }: {
  imports = [ ./someOtherModule.nix ];
  environment.systemPackages =  [ pkgs.hello ];
}
```

{{ end() }}

# Paisano and Haumea

It is appropriate to mention the transitive dependencies **Paisano** and
**Haumea**. Both tools appear to have been created to solve a similar problem -
enabling the use of file systems to declare modules and providing a nix function
to automatically load or collect these modules into a nix attribute set.
Additionally, the load functions provide standardized call parameters, making it
easy to access other modules from the configuration. While there are more
advanced techniques such as picking, filtering, or hoisting different
attributes, it is not necessary to delve into further details about them right
now.

{{ nerdy(text="

[Haumea](https://github.com/nix-community/haumea) exists with its
[initial commit](https://github.com/nix-community/haumea/commit/13c2fcf9e60ac2cd99e25433efd0d35e3b43d14ca)
from the 1st April 2023, and it is authored by
[figsoda](https://github.com/figsoda). You can also take a look on my brief
[cheatsheet on Haumea](@/haumea-cheatsheet.md).

[Paisano](https://github.com/paisano-nix/core) was initially a part of the
Standard platform, but it was extracted as separate tool with a
[first commit](https://github.com/paisano-nix/core/commit/9b95b00f7b4ea1af1d4eb5e09b33cdf8fdc1db44)
in its own repository on 9th February 2023. There is also a short
[cheatsheet](@/paisano-cheatsheet.md) available.

") }}

{{ end() }}

# The Hive

Hive uses the following hierarchy of building blocks:

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

The blocks will be introduced gradually throughout the tutorial.

Before we start, please also take a look at the diagram below that explains the
Hive. Don't worry if it seems complex at first glance. Just give it a quick scan
for now and proceed with the tutorial. Once you finish the tutorial, you can
come back to review the diagram and see if it becomes easier to understand.

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

# Tutorial

I invite you to try out Hive on your own with the following tutorial. It's very
simple, just enough to explain the key concept I have learned. Afterwards, there
are a few more chapters discussing the whole system organization.

You can also find the tutorial sources at
[github:PrimaMateria/blog-hive](https://github.com/PrimaMateria/blog-hive).

## Testing Environment

To test this tutorial, we will utilize Nix's built-in functionality to execute
system configuration in the virtual machine. Initially, define the initial flake
without Hive.

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

Now, test it with the following command.

```
nix run '.#nixosConfigurations.experiment.config.system.build.vm'
```

The Qemu window will start with a machine that loads the configuration. Log in
using "foo/foo" and try to run the command `hello`.

<div style="margin-top: 24px">
{{ resize_image_w(path="hive/vm-test.png", width=450) }}
</div>

{{ end() }}

## Hive Flake

Hive is a configuration based on flakes. Inputs include:

- **std** - the Standard - as I understand it, it is a more complex framework
  intended for DevOps to declare configurations for building and deploying
  projects. The Hive was created based on the Standard with the intention of
  focusing on system and home configurations. Personally, I have never used the
  Standard before and probably will never need to.
- **hive** - I wouldn't say that Hive is an extension of the Standard. It
  follows the same principles and reuses some block types from std, but other
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

The outputs are the result of the `hive.growOn` function. `growOn` is a Paisano
function that takes a variable count of parameters. The first one is always a
Hive config, where the cells' source directory and cell block types list are
specified.

I believe the remaining parameters are referred to as "layers of soil". These
layers are recursively combined into one attribute set, which then becomes the
conventional outputs of the flake.

{{ end() }}

## Cell

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

{{ end() }}

## Cell Block

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

{{ end() }}

## Bee Module

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

{{ end() }}

## Collect

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

{{ end() }}

## findLoad

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

{{ end() }}

## Haumea Load

Instances loaded by `findLoad` are loaded with Haumea. That means that the
instance can be modularized into different files that will be put together into
one set where the attributes correspond to the file names.

Perhaps I have not yet fully realized the potential of Haumea, but so far I have
only found it useful for defining NixOS module options separately. In other
cases, I extract the code into "private" submodules with names that have the
prefix "\_\_". Haumea ignores these submodules, and I load them either through
Nix's `import` or with `nixpkgs.callPackage`.

In this step we introduce "system" cell block, that will act as collection of
different system configurations for the nixos configurations.

```
├── cells
│  └── experiment
│     ├── bee.nix
│     ├── nixosConfigurations
│     │  ├── default.nix
│     │  ├── home.nix
│     │  └── work.nix
│     └── system
│        ├── common.nix
│        ├── default.nix
│        └── parrot
│           ├── __cowsay.nix
│           ├── __hello.nix
│           ├── default.nix
│           └── options.nix
└── flake.nix
```

At first, tell Hive about the new cell block we will be using. Update
`cellblocks` in the `flake.nix` with `system` cell block of type `functions`.

```nix
{
  outputs = { self, std, hive, ... }@inputs:
    hive.growOn
      {
        inherit inputs;
        cellsFrom = ./cells;
        cellBlocks = with hive.blockTypes; with std.blockTypes; [
          (functions "bee")
          (functions "system")
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

Instances of the system cell block will be loaded using `findLoad` as before.
Create `system/default.nix` as follows:

```nix
{ inputs, cell }:
inputs.hive.findLoad {
  inherit inputs cell;
  block = ./.;
}
```

Up until home and work nixos configurations had duplicated code that creates the
VM user and sets the state version. Extract this code to `system/common.nix`:

```nix
{
  users.users.foo = {
    isNormalUser = true;
    initialPassword = "foo";
  };
  system.stateVersion = "23.11";
}
```

Next we will create new cell block instance - a "parrot" system module.

{{ curious(text="

Parrot is weird name. Heh, sorry, just go with it.

") }}

Parrot module configures `cowsay` and `hello` packages based on the set options
values. Create `system/parrot/default.nix`:

```nix
{ inputs, config }:
let
  inherit (inputs) nixpkgs;
  cfg = config.experiment.system.parrot;
in
{
  config = {
    environment.systemPackages = [
      (nixpkgs.callPackage ./__hello.nix { inherit (cfg) greeting; })
      (nixpkgs.callPackage ./__cowsay.nix { inherit (cfg) art; })
    ];
  };
}
```

The options definitions will be extracted to separate Hamuea module
`system/parrot/options.nix`:

```nix
{ inputs, cell }:
let
  inherit (inputs.nixpkgs) lib;
in
{
  experiment.system.parrot = {
    greeting = lib.mkOption {
      type = lib.types.str;
      description = "hello message";
      default = "Hello world";
    };
    art = lib.mkOption {
      type = lib.types.str;
      description = "cowsay art - one of items listed by cowsay -l";
      default = "default";
    };
  };
}
```

Custom cowsay and hello packages are implemented in private Haumea modules.

```nix
{ pkgs, art ? "default" }:
pkgs.writeShellApplication {
  name = "cowsay";
  text = ''${pkgs.cowsay}/bin/cowsay -f "${art}" "$@"'';
}
```

```nix
{ pkgs, greeting ? "Hello world" }:
pkgs.writeShellApplication {
  name = "hello";
  text = ''${pkgs.hello}/bin/hello --greeting "${greeting}"'';
}
```

{{ nerdy(text="

If they would not be private, Haumea would try to load them into the nixos
module set, so the result would look like this:

```nix
{ config = {}; option = {}; cowsay = {}; hello = {}; }
```

The build would fail with message that NixOS module contains unsupported
attributes because the top level can contain only `options`, `imports` and
`config`.

") }}

At last update the work and home nixos configurations utilizing new system
modules. Each system configure to provice custom values for to the parrot
options.

```nix
{ inputs, cell }:
let
  inherit (inputs) nixpkgs;
  inherit (cell) bee system;
in
{
  inherit bee;

  imports = [
    system.common
    system.parrot
    {
      experiment.system.parrot = {
        art = "elephant";
        greeting = "Hello home!";
      };
    }
  ];
}
```

```nix
{ inputs, cell }:
let
  inherit (inputs) nixpkgs;
  inherit (cell) bee system;
in
{
  inherit bee;

  imports = [
    system.common
    system.parrot
    {
      experiment.system.parrot = {
        art = "small";
        greeting = "Hello work!";
      };
    }
  ];
}
```

At last, test again the result in the virtual machine:

```
nix run '.#nixosConfigurations.experiment-work.config.system.build.vm'
```

<div style="margin-top: 24px">
{{ resize_image_w(path="hive/vm-test-work.png", width=450) }}
</div>

```
nix run '.#nixosConfigurations.experiment-home.config.system.build.vm'
```

<div style="margin-top: 24px">
{{ resize_image_w(path="hive/vm-test-home.png", width=450) }}
</div>

This concludes the tutorial. In next chapters we will discuss the cell
organization.

{{ end() }}

# Standard Cell Structure

Now when we already know how to create cell blocks and how to connect them a
question arises about the organization of the hive. What one cell encompasses
and of which types of cell blocks it consists?

First I will present
[Lord-Valen's configuration.nix](https://github.com/Lord-Valen/configuration.nix)
that, I believe, originates from recommended structures used in Standard. In the
next I will present my own domain language that I hope is tiny bit more
self-explanatory.

Valen's comb contains three crypticly named cells:

- lord-valen
- repo
- sioux

Cell "lord-valen" is biggest and I focused on it with further studies. I opened
each cell block and recorded which other cell block does it use. The result came
up in the form of the following diagram:

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
        hardwareProfiles ---> nixosConfigurations
        arionProfiles ---> nixosConfigurations

        nixosConfigurations --> colmenaConfigurations
        nixosConfigurations --> installers
    end

    subgraph inputs
       nixos-hardware
       nixos-generators
    end

    nixos-hardware -..-> hardwareProfiles
    nixos-generators -..-> installers
{% end %}
<!-- prettier-ignore-end -->

If we look on the vertical lines we can extract simplified backbone:

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart BT

    modules --> profiles
    profiles --> suites
    suites --> nixosConfigurations
{% end %}
<!-- prettier-ignore-end -->

If we look on the horizontal line we draw following simplified landscape:

<!-- prettier-ignore-start -->
{% mermaid() %}
block-beta
columns 3

    nixosConfigurations:3
    home
    nixos
    hardware
{% end %}
<!-- prettier-ignore-end -->

Interestingly, Valen does not use separate `homeConfigurations` but he incluse
home manager config into `nixosConfigurations`.

{{ end() }}

# Dream Cell Structure

I challenged myself to draw a scheme in principle same as Standard, but from my
own perspective of what I have included in my NixOS configuration.

In my previous repository I had nixos and user configurations separately defined
and separately installable. So I wanted to preserve this, not sure if it is more
correct, but I am just used to it.

Next I wanted to avoid usage of `profiles` and `suites` and choose more
descriptive names. I came up with the following hierarchy:

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart BT

    applications ---> homeConfigurations
    devices --> machines
    machines --> nixosConfigurations
    system --> installations
    installations --> nixosConfigurations
{% end %}
<!-- prettier-ignore-end -->

Let's look on how the home system and work system are laid out.

At home I run NixOS on PC and therefore system must have configured hardware
like mouse, monitor, disks, printer, etc. Also at home I use pure NixOS bare
metal installation and therefore I need to configure window maanger, sound,
graphic, etc.

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
      docker
    "]:::list

    installations["
      <b>installations</b>
      common
      bare_metal
    "]:::list

    nixosConfigurations["
      <b>nixosConfigurations</b>
      home
    "]:::list

    devices --> machines
    machines --> nixosConfigurations
    system --> installations
    installations --> nixosConfigurations

    classDef list text-align:left;

{% end %}
<!-- prettier-ignore-end -->

At work I run NixOS on WSL therefore the whole machine part is not required,
because this parts managed and configured by the host windows system. On the
other hand the installation on WSL requires it's own specific config and setup
of VNC.

<!-- prettier-ignore-start -->
{% mermaid() %}
flowchart BT

    system["
      <b>system</b>
      wsl
      essentials
      vnc
      docker
    "]:::list

    installations["
      <b>installations</b>
      common
      wsl
    "]:::list

    nixosConfigurations["
      <b>nixosConfigurations</b>
      work
    "]:::list

    system --> installations
    installations --> nixosConfigurations

    classDef list text-align:left;

{% end %}
<!-- prettier-ignore-end -->

At least this is how it should work in the theory. Practically I managed to
configure only WSL for work, and at home I also settled on WSL configuration
that allowed me to avoid annoying re-boots each time I want to switch between
gaming and crafting. Of course it comes its own limitations, but I think this is
for me currently the lowest energy state.

{{ end() }}

# Outro

Hive is still in its early stages with only a few people involved, and most of
the work is being done by one person. This person may also lose interest over
time and shift his focus to other projects. Additionally, the lack of openness,
such as the absence of documentation, may discourage the few interested
individuals who come across it. It is possible that Hive could easily fade away
in the future. This is why I have chosen to write this blog post, to uncover
what is hidden behind the facade of this "secretly open NixOS-Society" and share
this idea with a wider audience.

{{ curious(text="

If you have enjoyed this post, please leave a comment, even if it's just a
simple kudos. You wouldn't believe how great it feels to see that someone has
read through the work you spent a long time working on and that it is not
completely ignored.

") }}

{{ end() }}

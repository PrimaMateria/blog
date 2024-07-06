+++
title = "Paisano Cheatsheet"
date = 2023-11-02
slug = "paisano-cheatsheet"

[extra]
banner = "banner-paisano-cheatsheet.png"

[taxonomies]
tags = ["nixos","paisano","hive"]
+++

Paisano is not only a filesystem-based module system, but also a framework that
specifies roles such as cell, block, target, or soil.

<!-- more -->
<!-- TOC -->

In comparison, Haumea is a more abstract system that allows users to load and
process filesystem-based modules, without specifying what the modules should
represent. Paisano, on the other hand, is closer to being a framework because it
guides users in organizing their filesystem-based modules in a structure that
has a specific meaning, while still allowing users to define the types and
meaning themselves.

From the limited information I gathered, it appears that Paisano was extracted
from the `std` framework, while Haumea was developed in parallel. There is now a
branch in Paisano that internally utilizes Haumea.

According to the author, Paisano was created to meet the needs of devops
engineers. Since I am currently not interested in packaging software, but rather
in declaring my development environment, I have skipped advanced topics such as
actions, registries, and TUI tools.

- [github:paisano-nix/core](https://github.com/paisano-nix/core)
- [github:primamateria/experiment-paisano](https://github.com/PrimaMateria/experiment-paisano)

The examples below are just excerpts. For the full context, read the code in the
GitHub repository.

## Grow On

```nix
{
  inputs = {
    paisano = {
      url = "github:divnix/paisano";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nixpkgs.url = "github:nix-community/nixpkgs.lib";
  };

  outputs = { paisano, self, ... }@inputs:
    paisano.growOn
      {
        inherit inputs;
        systems = [ "x86_64-linux" "aarch64-linux" ];
        cellsFrom = ./cells;
        cellBlocks = [
          {
            name = "fooblock";
            type = "experiment";
          }
          {
            name = "barblock";
            type = "experiment";
          }
        ];
      }
      {
        product = {
          cell = paisano.harvest self [ "cell" ];
          block = paisano.harvest self [ "cell" "fooblock" ];
          foo = paisano.harvest self [ "cell" "fooblock" "foo" ];
          bar = paisano.harvest self [ "cell" "fooblock" "bar" ];

          cellPicked = paisano.pick self [ "cell" ];
          winnow = paisano.winnow (field: value: field != "baz" && value !=
            null) self [ "cell" "fooblock" ];
        };
      };
}
```

## Harvest cell

```text
├── cells
│  └── cell
│     ├── barblock.nix
│     │  └── { inputs, cell }: { bar = "bar"; }
│     └── fooblock.nix
│        └── { inputs, cell }: { foo = "foo"; inherit (cell.barblock) bar; baz = "baz"; }
└── flake.nix
   └── cell = paisano.harvest self [ "cell" ];

{
  cell = {
    aarch64-linux = {
      barblock = {bar = "bar";};
      fooblock = {
        bar = "bar";
        baz = "baz";
        foo = "foo";
      };
    };
    x86_64-linux = {
      barblock = {bar = "bar";};
      fooblock = {
        bar = "bar";
        baz = "baz";
        foo = "foo";
      };
    };
  };
}
```

## Harvest block

```text
├── cells
│  └── cell
│     ├── barblock.nix
│     │  └── { inputs, cell }: { bar = "bar"; }
│     └── fooblock.nix
│        └── { inputs, cell }: { foo = "foo"; inherit (cell.barblock) bar; baz = "baz"; }
└── flake.nix
   └── block = paisano.harvest self [ "cell" "fooblock" ];

{
  block = {
    aarch64-linux = {
      bar = "bar";
      baz = "baz";
      foo = "foo";
    };
    x86_64-linux = {
      bar = "bar";
      baz = "baz";
      foo = "foo";
    };
  };
}
```

## Harvest block key

```text
├── cells
│  └── cell
│     ├── barblock.nix
│     │  └── { inputs, cell }: { bar = "bar"; }
│     └── fooblock.nix
│        └── { inputs, cell }: { foo = "foo"; inherit (cell.barblock) bar; baz = "baz"; }
└── flake.nix
   └── foo = paisano.harvest self [ "cell" "fooblock" "foo" ];

{
  foo = {
    aarch64-linux = "foo";
    x86_64-linux = "foo";
  };
}

```

## Pick cell

```text
├── cells
│  └── cell
│     ├── barblock.nix
│     │  └── { inputs, cell }: { bar = "bar"; }
│     └── fooblock.nix
│        └── { inputs, cell }: { foo = "foo"; inherit (cell.barblock) bar; baz = "baz"; }
└── flake.nix
   └── cellPicked = paisano.pick self [ "cell" ];

{
  cellPicked = {
    barblock = {bar = "bar";};
    fooblock = {
      bar = "bar";
      baz = "baz";
      foo = "foo";
    };
  };
}

```

## Winnow block filtering out one key

```text
├── cells
│  └── cell
│     ├── barblock.nix
│     │  └── { inputs, cell }: { bar = "bar"; }
│     └── fooblock.nix
│        └── { inputs, cell }: { foo = "foo"; inherit (cell.barblock) bar; baz = "baz"; }
└── flake.nix
   └── winnow = paisano.winnow
         (field: value: field != "baz" && value != null)
         self
         [ "cell" "fooblock" ];

{
  winnow = {
    aarch64-linux = {
      bar = "bar";
      foo = "foo";
    };
    x86_64-linux = {
      bar = "bar";
      foo = "foo";
    };
  };
}
```

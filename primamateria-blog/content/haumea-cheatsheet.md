+++
title = "Haumea Cheatsheet"
date = 2023-10-22

[extra]

[taxonomies]
tags = ["nixos","haumea","hive"]
+++

Haumea is a filesystem-based module system for Nix that sets itself apart from
NixOS modules by embracing a structure more akin to traditional programming
languages. It incorporates a file hierarchy and visibility, aligning with the
principles of organized directory layouts and extensibility. Haumea simplifies
the process of importing files by automatically incorporating them into an
attribute set, eliminating the need for manual imports.

<!-- more -->

{{ update(date="2024-03-05", content="

I have standardized the example inputs to make it easier to identify differences
between the methods. I have also included two new examples for subdirectories
and internal directories.

") }}

{{ update(date="2024-03-06", content="

Add Lift Default example.

") }}

- [Haumea Docs](https://nix-community.github.io/haumea/intro/introduction.html)
- [github:nix-community/haumea](https://github.com/nix-community/haumea)
- [github:primamateria/experiment-haumea](https://github.com/PrimaMateria/experiment-haumea)

The examples below are just excerpts. For the full context, read the code in the
GitHub repository.

{{ end() }}

## Default

```text
├── examples
│  └── default
│     ├── one.nix
│     │  └── { farm }: { animal = farm.pig; fruit = "orange"; vegetables = [ "potato" ]; }
│     └── two.nix
│        └── { farm }: { animal = farm.cow; fruit = "banana"; vegetables = [ "carrot" ]; }
└── flake.nix
   └── default = haumea.lib.load {
         src = ./examples/default;
         inputs = { farm = { cow = "cow"; pig = "pig"; }; };
       };

{
  one = { animal = "pig"; fruit = "orange"; vegetables = [ "potato" ]; };
  two = { animal = "cow"; fruit = "banana"; vegetables = [ "carrot" ]; };
}
```

{{ end() }}

## Path

```text
├── examples
│  └── default
│     ├── one.nix
│     │  └── { farm }: { animal = farm.pig; fruit = "orange"; vegetables = [ "potato" ]; }
│     └── two.nix
│        └── { farm }: { animal = farm.cow; fruit = "banana"; vegetables = [ "carrot" ]; }
└── flake.nix
   └── path = haumea.lib.load {
         src = ./examples/default;
         loader = haumea.lib.loaders.path;
       };

{
  one = /nix/store/3dkpf96ycknjszjqq2lwjhh42qmsw6q5-source/examples/default/one.nix;
  two = /nix/store/3dkpf96ycknjszjqq2lwjhh42qmsw6q5-source/examples/default/two.nix;
}
```

{{ end() }}

## Scoped

Notice that `one.nix` and `two.nix` do not declare the `farm` parameter, but
still have access to `pig` and `cow`, since the `farm` is scoped.

```text
├── examples
│  └── default
│     ├── one.nix
│     │  └── {}: { animal = farm.pig; fruit = "orange"; vegetables = [ "potato" ]; }
│     └── two.nix
│        └── {}: { animal = farm.cow; fruit = "banana"; vegetables = [ "carrot" ]; }
└── flake.nix
   └── scoped = haumea.lib.load {
         src = ./examples/scoped;
         loader = haumea.lib.loaders.scoped;
         inputs = { farm = { cow = "cow"; pig = "pig"; }; };
       };

{
  one = { animal = "pig"; fruit = "orange"; vegetables = [ "potato" ]; };
  two = { animal = "cow"; fruit = "banana"; vegetables = [ "carrot" ]; };
}
```

{{ end() }}

## Hoist Attributes

```text
├── examples
│  └── scoped
│     ├── one.nix
│     │  └── { farm }: { animal = farm.pig; fruit = "orange"; vegetables = [ "potato" ]; }
│     └── two.nix
│        └── { farm }: { animal = farm.cow; fruit = "banana"; vegetables = [ "carrot" ]; }
└── flake.nix
   └── hoistAttrs = haumea.lib.load {
         src = ./examples/hoistAttrs;
         inputs = { farm = { cow = "cow"; pig = "pig"; }; };
         transformer = haumea.lib.transformers.hoistAttrs "fruit" "salad";
       };

{
  one = { animal = "pig"; vegetables = [ "potato" ]; };
  salad = { one = "orange"; two = "banana"; };
  two = { animal = "cow"; vegetables = [ "carrot" ]; };
}
```

{{ end() }}

## Hoist Lists

```text
├── examples
│  └── scoped
│     ├── one.nix
│     │  └── { farm }: { fruit = "orange"; vegetable = [ "potato" ]; animal = farm.pig; }
│     └── two.nix
│        └── { farm }: { fruit = "banana"; vegetable = [ "carrot" ]; animal = farm.cow; }
└── flake.nix
   └── hoistLists = haumea.lib.load {
         src = ./examples/hoistLists;
         inputs = { farm = { cow = "cow"; pig = "pig"; }; };
         transformer = haumea.lib.transformers.hoistLists "vegetables" "salad";
       };

{
  one = { animal = "pig"; fruit = "orange"; };
  salad = [ "potato" "carrot" ];
  two = { animal = "cow"; fruit = "banana"; };
}
```

{{ end() }}

## Lift Default

```text
├── examples
│  └── liftDefault
│     ├── one.nix
│     │  └── { farm }: { fruit = "orange"; vegetable = [ "potato" ]; animal = farm.pig; }
│     └── default.nix
│        └── { farm }: {
│              two = { animal = farm.cow; fruit = "banana"; vegetables = [ "carrot" ]; };
│            }
└── flake.nix
   └── liftDefault = haumea.lib.load {
         src = ./examples/liftDefault;
         inputs = { farm = { cow = "cow"; pig = "pig"; }; };
         transformer = haumea.lib.transformers.liftDefault;
       };

{
  one = { animal = "pig"; fruit = "orange"; vegetables = [ "potato" ]; };
  two = { animal = "cow"; fruit = "banana"; vegetables = [ "carrot" ]; };
}
```

{{ end() }}

## Sub Dir

```text
├── examples
│  └── subDir
│     ├── one
│     │  ├── animal.nix
│     │  │  └── { farm }: farm.pig
│     │  ├── fruit.nix
│     │  │  └── "orange"
│     │  └── vegetables.nix
│     │     └── [ "potato" ]
│     └── two.nix
│        └── { farm }: { fruit = "banana"; vegetable = [ "carrot" ]; animal = farm.cow; }
└── flake.nix
   └── subDir = haumea.lib.load {
         src = ./examples/subDir;
         inputs = { farm = { cow = "cow"; pig = "pig"; }; };
       };

{
  one = { animal = "pig"; fruit = "orange"; vegetables = [ "potato" ]; };
  two = { animal = "cow"; fruit = "banana"; vegetables = [ "carrot" ]; };
}
```

{{ end() }}

## Internal Dir

```text
├── examples
│  └── subDir
│     ├── __internal
│     │  ├── one.nix
│     │  │  └── { farm }: { animal = farm.pig; fruit = "orange"; vegetables = [ "potato" ]; }
│     │  └── two.nix
│     │     └── { farm }: { animal = farm.cow; fruit = "banana"; vegetables = [ "carrot" ]; }
│     └── alpha.nix
│        └── { haumea, farm }: {
│              beta.gamma = {
│                delta = haumea.lib.load {
│                  src = ./__internal;
│                  inputs = { inherit farm; };
│                };
│              };
│            }
└── flake.nix
   └── internalDir = haumea.lib.load {
         src = ./examples/internalDir;
         inputs = {
           inherit haumea;
           farm = { cow = "cow"; pig = "pig"; };
         };
       };


{
  alpha ={
    beta = {
      gamma = {
        delta = {
          one = { animal = "pig"; fruit = "orange"; vegetables = [ "potato" ]; };
          two = { animal = "cow"; fruit = "banana"; vegetables = [ "carrot" ]; };
        };
      };
    };
  };
}
```

{{ end() }}

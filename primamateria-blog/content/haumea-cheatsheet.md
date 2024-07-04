+++
title = "Haumea Cheatsheet"
date = 2023-10-22

[extra]
banner = "banner-haumea-cheatsheet.png"

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

- [Haumea Docs](https://nix-community.github.io/haumea/intro/introduction.html)
- [github:nix-community/haumea](https://github.com/nix-community/haumea)
- [github:primamateria/experiment-haumea](https://github.com/PrimaMateria/experiment-haumea)

The examples below are just excerpts. For the full context, read the code in the
GitHub repository.

{{ end() }}

## Default

The default behavior is to load the content of the `one.nix` and `two.nix` files
into the attributes `one` and `two`. Notice how we can easily pass the `farm`
input.

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

Specifying the path loader will assign the paths of the files in the Nix store
to the attributes instead.

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

Hoisting attributes named `fruit` from the files' contents and moving them to a
new attribute called `medley`.

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
         transformer = haumea.lib.transformers.hoistAttrs "fruit" "medley";
       };

{
  one = { animal = "pig"; vegetables = [ "potato" ]; };
  medley = { one = "orange"; two = "banana"; };
  two = { animal = "cow"; vegetables = [ "carrot" ]; };
}
```

{{ end() }}

## Hoist Lists

Hoisting lists named `vegetables` and concatenating them into one list assigned
to the attribute `salad`.

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

The contents of the `default.nix` file are included in the resulting set.

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

Module `one` is further divided into its individual leaf attributes modules.

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

## Self Super Root

- `self` - the module itself
- `super` - the directory where the modules is located
- `root` - whole src directory

Files that start with `_` or `__` are not included in the result set. Files that
start with `_` are visible to the `root` (entire src directory). Files that
start with `__` are visible to the nearest `super` (directory). Please take note
of the commented invalid selectors in the `default.nix` file.

```text
├── examples
│  └── selfSuperRoot
│     ├── alpha
│     │  ├── __field.nix
│     │  │  └── { carrot = "carrot"; potato = "potato"; }
│     │  ├── _orchard.nix
│     │  │  └── { banana = "banana"; orange = "orange"; }
│     │  ├── one.nix
│     │  │  └── { self, super, root }: {
│     │  │        id = "${self.animal}-${self.fruit}-${builtins.elemAt self.vegetables 0}";
│     │  │        animal = root.farm.pig;
│     │  │        fruit = super.orchard.orange;
│     │  │        vegetables = [ super.field.potato ];
│     │  │      }
│     │  └── two.nix
│     │     └── { self, super, root }: {
│     │           id = "${self.animal}-${self.fruit}-${builtins.elemAt self.vegetables 0}";
│     │           animal = root.farm.cow;
│     │           fruit = super.orchard.banana;
│     │           vegetables = [ super.field.carrot ];
│     │         }
│     │── _farm.nix
│     │  └── { cow = "cow"; pig = "pig"; }
│     └── default.nix
│        └── { self, super, root }: {
│              salad = super.alpha.one.vegetables ++ super.alpha.two.vegetables;
│              medley = [ super.alpha.orchard.banana super.alpha.orchard.orange ];
│
│              # inherit (self) alpha; => error: attribute 'alpha' missing
│              # inherit (super.alpha) field; => error: attribute 'field' missing
│            }
└── flake.nix
   └── selfSuperRoot = haumea.lib.load {
         src = ./examples/selfSuperRoot;
         transformer = haumea.lib.transformers.liftDefault;
       };

{
  alpha = {
    one = { animal = "pig"; fruit = "orange"; id = "pig-orange-potato"; vegetables = [ "potato" ]; };
    two = { animal = "cow"; fruit = "banana"; id = "cow-banana-carrot"; vegetables = [ "carrot" ]; };
  };
  medley = [ "banana" "orange" ];
  salad = [ "potato" "carrot" ];
}
```

{{ end() }}

## Post Updates

{{ update(date="2024-03-05", content="

I have standardized the example inputs to make it easier to identify differences
between the methods. I have also included two new examples for subdirectories
and internal directories.

") }}

{{ update(date="2024-03-06", content='

Added "Lift Default" example.

') }}

{{ update(date="2024-03-09", content='

I replaced the example "Internal Dir" with "Self Super Root" because I realized
that using "protected" and "private" modules is more elegant than loading the
internal deal separately. I also added a short description to each example.

') }}

{{ end() }}

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
│     ├── answer.nix
│     │  └── { lib }: (lib.const 42) { }
│     └── foo.nix
│        └── { bar }: { foo = "foo" + bar; }
└── flake.nix
   └── default = haumea.lib.load {
         src = ./examples/default;
         inputs = {
           inherit (nixpkgs) lib;
           bar = "bar";
         };
       };

{ answer = 42; foo = { foo = "foobar"; }; }
```

{{ end() }}

## Path

```text
├── examples
│  └── default
│     ├── answer.nix
│     │  └── { lib }: (lib.const 42) { }
│     └── foo.nix
│        └── { bar }: { foo = "foo" + bar; }
└── flake.nix
   └── path = haumea.lib.load {
         src = ./examples/default;
         loader = haumea.lib.loaders.path;
       };

{
  answer = /nix/store/3l8xxh2nw5wdawjmjg0bagfs9vvygwh1-source/examples/default/answer.nix;
  foo = /nix/store/3l8xxh2nw5wdawjmjg0bagfs9vvygwh1-source/examples/default/foo.nix;
}
```

{{ end() }}

## Scoped

```text
├── examples
│  └── scoped
│     └── answer.nix
│        └── {}: lib.id 42
└── flake.nix
   └── scoped = haumea.lib.load {
         src = ./examples/scoped;
         loader = haumea.lib.loaders.scoped;
         inputs = { inherit (nixpkgs) lib; };
       };

{ answer = 42; }
```

{{ end() }}

## Hoist Attributes

```text
├── examples
│  └── hoistAttrs
│     ├── answer.nix
│     │  └── {}: { foo = 42; bar = "not hoisted"; }
│     └── question.nix
│        └── {}: { foo = "answer to universe and everything"; bar = "not hoisted"; }
└── flake.nix
   └── hoistAttrs = haumea.lib.load {
         src = ./examples/hoistAttrs;
         transformer = haumea.lib.transformers.hoistAttrs "foo" "hitchhiker";
       };

{
  answer = { bar = "not hoisted"; };
  hitchhiker = { answer = 42; question = "answer to universe and everything"; };
  question = { bar = "not hoisted"; };
}
```

{{ end() }}

## Hoist Lists

```text
├── examples
│  └── hoistLists
│     ├── first.nix
│     │  └── {}: { foo = [ "universe" ]; }
│     └── second.nix
│        └── {}: { foo = [ "everyting" ]; }
└── flake.nix
   └── hoistLists = haumea.lib.load {
         src = ./examples/hoistLists;
         transformer = haumea.lib.transformers.hoistLists "foo" "hitchiker.question";
       };

{
  first = { };
  "hitchiker.question" = [ "universe" "everyting" ];
  second = { };
}
```

{{ end() }}

+++
title = "Neovim flake Updates"
date = 2023-06-04
slug = "neovim-nix-update"

[extra]
banner = "banner-neovim-flake-update.png"
bannerAlt = "Mobius comic book style. Jungle treetops scenery flyover. Dark green pastel. Neovim logo embedded."

[taxonomies]
tags = ["nixos","neovim"]
+++

This is a follow-up post to
[How to create your own Neovim flake](@/20230318-neovim-nix/index.md). Thanks to
the help of [Sam Willis](https://github.com/samjwillis97), the mystery of the
non-functioning `symlinkjoin` has been clarified, and a workaround has been
found. Sam also assisted me in using `flake-utils`, which enabled me to
successfully build Neovim on Nix-on-Droid.

<!-- more -->
<!-- TOC -->

## Runtime dependencies in one list

In my previous post, I described an issue I encountered while trying to create a
package using `symlinkJoin`. The problem was that it couldn't combine common
packages with node packages. However, Sam found an
[article by John Sangster](https://ertt.ca/blog/2022/01-12-nix-symlinkJoin-nodePackages/)
that explains this issue and offers a workaround.

To apply this fix to your flake, first update the `runtimeDeps.nix` file:

```nix
{ pkgs }:
with pkgs; [
  lazygit
  # packages with results in /lib/node_modules/.bin must come at the end
  nodePackages.typescript
  nodePackages.typescript-language-server
]
```

The order of the packages in the list is important. If the node packages are
placed first, only they will be included in the resulting package. Therefore,
place them at the end of the list.

Next, update the `myNeovim.nix` package.

```nix
{ pkgs }:
let
  customRC = import ../config { inherit pkgs; };
  secrets = import ../.secrets/secrets.nix;
  plugins = import ../plugins.nix { inherit pkgs; };
  runtimeDeps = import ../runtimeDeps.nix { inherit pkgs; };
  neovimRuntimeDependencies = pkgs.symlinkJoin {
    name = "neovimRuntimeDependencies";
    paths = runtimeDeps;
    # see: https://ertt.ca/blog/2022/01-12-nix-symlinkJoin-nodePackages/
    postBuild = ''
      for f in $out/lib/node_modules/.bin/*; do
         path="$(readlink --canonicalize-missing "$f")"
         ln -s "$path" "$out/bin/$(basename $f)"
      done
    '';
  };
  myNeovimUnwrapped = pkgs.wrapNeovim pkgs.neovim {
    configure = {
      inherit customRC;
      packages.all.start = plugins;
    };
  };
in
pkgs.writeShellApplication {
  name = "nvim";
  runtimeInputs = [ neovimRuntimeDependencies ];
  text = ''
    OPENAI_API_KEY=${secrets.openai-api-key} ${myNeovimUnwrapped}/bin/nvim "$@"
  '';
}
```

As you can see, we end up with a single list of runtime dependencies and less
code. The crucial part is the implementation of `postBuild`. For a detailed
example, refer to John's post.

## Using flake-utils to support multiple systems

As mentioned in my previous post,
[numtide/flake-utils](https://github.com/numtide/flake-utils) is a popular Nix
helper that allows us to easily prepare our Neovim package for different
architectures. Sam has successfully made modifications to our `flake.nix` and
shared the changes with me.

Let's briefly discuss the history of flake-utils. The first commit was made on
April 11, 2020, by Jonas Chevalier (GitHub username
[zimbatm](https://github.com/zimbatm)). A search on GitHub reveals an impressive
count of 13.3k code usages, highlighting its widespread adoption.

Now, here are the required changes in `flake.nix` file.

```nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:neovim/neovim/stable?dir=contrib";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    telescope-recent-files-src = {
      url = "github:smartpde/telescope-recent-files";
      flake = false;
    };
    flake-utils = {
      url = "github:numtide/flake-utils";
    };
  };
  outputs = { self, nixpkgs, neovim, telescope-recent-files-src, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlayFlakeInputs = prev: final: {
          neovim = neovim.packages.${prev.system}.neovim;

          vimPlugins = final.vimPlugins // {
            telescope-recent-files = import ./packages/vimPlugins/telescopeRecentFiles.nix {
              src = telescope-recent-files-src;
              pkgs = prev;
            };
          };
        };


        overlayMyNeovim = prev: final: {
          myNeovim = import ./packages/myNeovim.nix {
            pkgs = prev;
          };
        };

        pkgs = import nixpkgs {
          system = system;
          overlays = [ overlayFlakeInputs overlayMyNeovim ];
        };

      in
      {
        packages = rec {
          nvim = pkgs.myNeovim;
          default = nvim;
        };

        apps = rec {
          nvim = flake-utils.lib.mkApp { drv = self.packages.${system}.nvim; };
          default = nvim;
        };
      });
}
```

First, we added `flake-utils` as a new input and included it as an argument in
our `outputs` function.

The flake's `outputs` is a set with keys `packages` and `apps`. Instead of
directly defining the set, we will use `flake-utils.lib.eachDefaultSystem()`.
This function requires a callback function as an argument, which provides the
variable `system`.

The default systems are:

- aarch64-linux
- aarch64-darwin
- x86_64-darwin
- x86_64-linux

{{ tip(tip="

It is possible to select additional systems by using the
`flake-utils.lib.eachSystem [ <systems> ] <callback>` function, where
`[ <systems> ]` is a list of values from the
[all systems](https://github.com/numtide/flake-utils/blob/main/allSystems.nix)
list. However, it's important to note that building Neovim, plugins, and their
dependencies for exotic systems may not be widely supported or feasible. I
examined Neovim's flake, and it also provides outputs only for default systems.
") }}

For each of these default systems, the callback function will be executed. The
body of the callback includes our previous outputs set with slight
modifications.

The first modification is in the initialization of `pkgs`, where we specify
using the set of packages defined for the iterated system. This set of packages
will be provided to our overlays as the `prev` argument.

In the `overlayFlakeInputs`, we previously hardcoded the Neovim package to be
for the system `x86_64-linux`. Now, instead, we use `${prev.system}`, which
corresponds to the system that is set for `pkgs`.

{{ tip(tip="

In the `overlayMyNeovim`, I also corrected the packages that are passed to the
module from `final` to `prev`. Both ways would work, but logically it makes more
sense to pass the previous (original) set of packages as input for the build. ")
}}

The remaining magic is handled by flake-utils. It will reduce the list of
outputs returned from the callback for each system to a single set of outputs.
During this reduction operation, the system will be appended to each key of the
output.

Therefore, this implementation of the callback

```nix
{
  packages = rec {
    nvim = pkgs.myNeovim;
    default = nvim;
  };
}
```

will produce

```nix
{
  packages.x86_64-linux = rec {
    nvim = pkgs.myNeovim; # your neovim built with pkgs with system x86_64-linux
    default = nvim;
  };
  packages.x86_64-darwin = rec {
    nvim = pkgs.myNeovim; # your neovim built with pkgs with system x86_64-darwin
    default = nvim;
  };
  packages.aarch64-linux = rec {
    nvim = pkgs.myNeovim; # your neovim built with pkgs with system aarch64-linux
    default = nvim;
  };
  packages.aarch64-darwin = rec {
    nvim = pkgs.myNeovim; # your neovim built with pkgs with system aarch64-darwin
    default = nvim;
  };
}
```

And, of course, the same will happen to the `apps` as well.

Now we can compare the output of the `nix flake show` command between the
previous and updated versions.

```
# previous
├───apps
│   └───x86_64-linux
│       └───default: app
└───packages
    └───x86_64-linux
        └───default: package 'nvim'

# updated
├───apps
│   ├───aarch64-darwin
│   │   ├───default: app
│   │   └───nvim: app
│   ├───aarch64-linux
│   │   ├───default: app
│   │   └───nvim: app
│   ├───x86_64-darwin
│   │   ├───default: app
│   │   └───nvim: app
│   └───x86_64-linux
│       ├───default: app
│       └───nvim: app
└───packages
    ├───aarch64-darwin
    │   ├───default: package 'nvim'
    │   └───nvim: package 'nvim'
    ├───aarch64-linux
    │   ├───default: package 'nvim'
    │   └───nvim: package 'nvim'
    ├───x86_64-darwin
    │   ├───default: package 'nvim'
    │   └───nvim: package 'nvim'
    └───x86_64-linux
        ├───default: package 'nvim'
        └───nvim: package 'nvim'
```

{{ tip(tip="

I will not explain what the `flake-utils.lib.mkApp` does, as I will leave it as
an exercise for you to explore on your own. ") }}

With these changes in place, I was able to run my Neovim flake on Nix-on-Droid.
It took some time to build, but in the end, everything worked just like on my
machine running NixOS. My customized Neovim took up over 3GB, and the entire
Nix-on-Droid now occupies 5.68GB of storage on my phone.

I don't think I will ever do web development on my phone. Instead, I intend to
use it for note-taking or writing blog posts while on the go. The next step
would be to modify our flake structure to create different apps for different
workflows - one with heavy dependencies for web development and another with
lighter dependencies for blogging.

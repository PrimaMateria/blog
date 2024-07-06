+++
title = "nix-shell with custom nix channel"
date = 2024-04-17
slug = "nix-shell-with-custom-channels"

[extra]
banner = "banner-nix-shell-custom-channel.png"


[taxonomies]
tags = ["nixos","nix-flakes"]
+++

In NixOS, there is an old world of Nix channels, environments, and paths, and a
new world of Nix flakes, inputs, and outputs. Today, after a long time, I needed
to run `nix-shell -p foo` again, but it kept failing with an error stating that
the package could not be found, even though I could find it while searching the
stable and unstable channels.

<!-- more -->

## Problem

```
$ nix-shell -p prefetch-npm-deps
error:
       … while calling the 'derivationStrict' builtin

         at /builtin/derivation.nix:9:12: (source not available)

       … while evaluating derivation 'shell'
         whose name attribute is located at /nix/var/nix/profiles/per-user/root/channels/nixos/pkgs/stdenv/generic/make-derivation.nix:278:7

       … while evaluating attribute 'buildInputs' of derivation 'shell'

         at /nix/var/nix/profiles/per-user/root/channels/nixos/pkgs/stdenv/generic/make-derivation.nix:322:7:

          321|       depsHostHost                = lib.elemAt (lib.elemAt dependencies 1) 0;
          322|       buildInputs                 = lib.elemAt (lib.elemAt dependencies 1) 1;
             |       ^
          323|       depsTargetTarget            = lib.elemAt (lib.elemAt dependencies 2) 0;

       error: undefined variable 'prefetch-npm-deps'

       at «string»:1:107:

            1| {...}@args: with import <nixpkgs> args; (pkgs.runCommandCC or pkgs.runCommand) "shell" { buildInputs = [ (prefetch-npm-deps) ]; } ""
             |                                                                                                           ^
```

## Investigation

If I understand correctly, nix-shell is searching in `<nixpkgs>`. This is
resolved from the `$NIX_PATH`.

```
$ echo $NIX_PATH
nixpkgs=/nix/var/nix/profiles/per-user/root/channels/nixos:nixos-config=/etc/nixos/configuration.nix:/nix/var/nix/profiles/per-user/root/channels
```

`nixos` channel details were:

```
$ sudo nix-channel --list
nixos https://nixos.org/channels/nixos-22.05
```

I was fetching from version 22.05, while the
[NixOS Search](https://search.nixos.org/packages?channel=23.11&from=0&size=50&sort=relevance&type=packages&query=prefetch-npm-deps)
was browsing version 23.11.

## Solution

One option is to update the channel, and the other is to directly override the
nixpkgs path when invoking the nix-shell.

```
nix-shell -I nixpkgs=https://github.com/NixOS/nixpkgs/archive/refs/tags/23.11.tar.gz -p prefetch-npm-deps
```

The tar.gz you can find as an asset in
[GitHub tags page](https://github.com/NixOS/nixpkgs/tags).

## Oddity

{{ curious(text="

There is something about `~/.nix-defexpr` and how nix-env does not actually
respect the `NIX_PATH`. I did not understand that, so here are just some links
for further investigation.

- [https://stackoverflow.com/questions/40532798/loading-dependencies-from-nixpkgs-unstable-with-nix-shell](https://stackoverflow.com/questions/40532798/loading-dependencies-from-nixpkgs-unstable-with-nix-shell)
- [https://lethalman.blogspot.com/2014/09/nix-pill-15-nix-search-paths.html](https://lethalman.blogspot.com/2014/09/nix-pill-15-nix-search-paths.html)

") }}

{{ nerdy(text='

I tried following:

```
$ NIX_PATH= nix-shell -p hello
error:
       … <borked>

         at «none»:0: (source not available)

       … while calling the import builtin

         at «string»:1:18:

            1| {...}@args: with import <nixpkgs> args; (pkgs.runCommandCC or pkgs.runCommand) "shell" { buildInputs = [ (hello) ]; } ""
             |                  ^

       (stack trace truncated; use --show-trace to show the full trace)

       error: file nixpkgs was not found in the Nix search path (add it using $NIX_PATH or -I)

       at «none»:0: (source not available)
```

And this works as well:

```
$ NIX_PATH=nixpkgs=https://github.com/NixOS/nixpkgs/archive/refs/tags/23.11.tar.gz nix-shell -p prefetch-npm-deps
```

') }}

{{ curious(text="

This means that nix-shell actually reads the NIX_PATH, so the nix-env oddity may
not be related to nix-shell.

") }}

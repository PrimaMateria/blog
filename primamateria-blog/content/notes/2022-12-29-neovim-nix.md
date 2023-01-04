+++
title = "How to create your own Neovim flake"
date = 2022-12-29
+++

## Introduction

This step-by-step guide will show you how to set up your own Neovim as a Nix
Flake. I won't explain what Nix and Nix Flake are here, as there are already
many other resources that do this perfectly.

{% todo() %} Add links to nix docs {% end %}

With this setup, you can use Git and Nix's magic to keep your configuration
files, list of plugins, and required external dependencies synced across
multiple machines. This will not only keep your editor configuration in sync,
but also your entire development environment. Additionally, you can use this
setup to keep your editor configuration in sync with your colleagues.

Please, be aware that I am also learning nix and possibly I might have done
something the wrong way. If you have more experience, and have a constructive
feedback please drop a message.

{% todo() %} Add contact page {% end %}

## Initialize the flake

Flake will take inputs, and it will generate an output which will be a package
that can be installed using the nix package manager, as well as an app that can
be executed directly.

First we start with bare flake structure:

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = { };
  outputs = { self }: { };
}
```

Next, we will add 2 inputs:

1. `nixpkgs` - a source of all nix packages we can later declare
1. `neovim` - Neovim itself

oth inputs favor unstable branches for rolling updates so that we can get early
access to all recently merged features.

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:neovim/neovim?dir=contrib";
      inputs.nixpkgs.follows = "nixpkgs-unstable";
    };
  };
  outputs = { self, nixpkgs, neovim }: { };
}
```

{{ why(question="Why do we override Neovim's flake nixpkgs input to follow the unstable version? ", answer="This way we instruct Neovim to be build using the same packages. Probably it would work even without it. And I kind of repeat it as a convention. But I can't see it as a recursive fix -meaning, if Neovim depends on other flakes, their nixpkgs inputs won't follow the provided value.") }}

{% todo() %} rewrite the answer {% end %}

As the initial step, we will pass Neovim from the input to the output.

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:neovim/neovim?dir=contrib";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, neovim }: {
      packages.x86_64-linux.default = neovim.packages.x86_64-linux.neovim;
      apps.x86_64-linux.default = {
        type = "app";
        program = "${neovim.packages.x86_64-linux.neovim}/bin/nvim";
      };
    };
}
```

Our flake provides Neovim as a default package for the `x86_64-linux` system,
and a default app executes Neovim's binary.

Now, lets run the app!

```bash
nix run
```

If all goes well, you should be welcomed with the neovim welcome message and the
version should be the most up-to-date one from the master branch.

## Custom Neovim package

You can look on your configured Neovim as a standalone installable package. Now
you will create an overlay over the nixpkgs which provide definition of your
Neovim package.

```nix
# flake.nix
{
  description = "My own Neovim flake";
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs";
    };
    neovim = {
      url = "github:neovim/neovim?dir=contrib";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { self, nixpkgs, neovim }:
    let
      overlay = prev: final: {
        myNeovim = import ./packages/myNeovim.nix;
      };
    in {
      packages.x86_64-linux.default = pkgs.myNeovim;
      apps.x86_64-linux.default = {
        type = "app";
        program = "${pkgs.myNeovim}/bin/nvim";
      };
    };
}
```

```nix
# packages/myNeovim.nix
{ pkgs }:
    pkgs.wrapNeovim neovim.packages.x86_64-linux.neovim {
      configure = {
         # here will come your custom configuration
      };
    }
```

{% todo() %} test and format the code {% end %}

Test with `nix run` if everything is allright.

## Add plugins

### Plugins found in nixpkgs

### Plugins not found in nixpkgs

## Add config

### Vim script

### Lua script

### Lua from nix

## Add runtime dependency

## Updating

## Add snippets

## Secrets

Storing secrets in a git repository may not be necessary for you, but it is a
useful skill to learn. In the context of Neovim, I have only used it to store an
OpenAI API key which is needed for the
[ChatGPT.nvim](https://github.com/jackMort/ChatGPT.nvim) plugin. You can use
[git-crypt](https://github.com/AGWA/git-crypt) to encrypt the desired files when
they are sent to the remote repository and decrypt them when they are returned
to the local.

I choose to declare `git` and `git-crypt` outside of the neovim flake. If you
are using nix configuration just add it to the `environment.systemPackages`, or
if you are using home manager add it to `home.packages`.

```bash
mkdir .secrets
git-crypt init
git-crypt export-key <PATH>
echo ".secrets/** filter=git-crypt diff=git-crypt" > .gitattributes
echo '{ openai-api-key = "<API_KEY>"; }' > .secrets/secrets.nix
```

All the files in the `.secrets` folder will have content tracked encrypted.
Locally the `git-crypt` automatically decrypts the files.

{% todo() %} add instruction for ChatGPT.plugin setup and passing api key to
neovim wrapper. {% end %}

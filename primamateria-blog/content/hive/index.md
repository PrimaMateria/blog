+++
title = "Hive"
date = 2023-11-28

[extra]
banner = "hive.png"

[taxonomies]
tags = ["nixos","hive"]
+++

What is hive?

# Factoids

- Hive is a spiritual successor of Digga.
- Hive spawns from std.
- David Arnold is the author.
- First commit in the repository is from 29th March 2022.
-

<!-- more -->

# Disclaimer

In this post, I will describe my own approach to using Hive. It may differ from
the prevailing convention of naming things, and it may not utilize the latest
available Nix tools. I approach my problem as a developer who aims to create a
convenient and reproducible development environment. I am not an operations
professional who needs to ensure absolute security. Additionally, I am limited
by my current understanding and open to your comments and opinions.

# Road to Hive

I started with
[Will T's NixOS series ](https://www.youtube.com/watch?v=QKoQ1gKJY5A&list=PL-saUBvIJzOkjAw_vOac75v-x6EzNzZq-)
in 2022, copying configs without fully understanding them. But I managed to keep
it going for a while, and even eventually moved my daily office tasks from
Ubuntu to NixOS on WSL.

After creating Neovim flake I got some confidence. Felt like I understood much
more, and I was ready for the next step. I wanted to redo my main NixOS config.

In my first config things got real messy - I mixed flakes, dwelved on the
old-school `import`, messed with callPackage without understanding what it does,
and I totally missed the "nix modules boat", even if I used them as copy-pasta
here and there.

I didn't have a solid grip on the language and module system, and I needed some
guidance for how to organize my configs. So I started doing some research and I
encountered the [NixOS Guide](https://github.com/mikeroyal/NixOS-Guide).

I found [Digga](https://github.com/divnix/digga), but already with a deprecation
notice.

{{ tip(tip="

Digga was already
[removed](https://github.com/mikeroyal/NixOS-Guide/commit/14a6d9530bb958bae7eaf531191bcc99f03e44f0)
from the NixOS Guide.") }}

The author mentions migration to `std`, `flake-parts` or `flake-utils-plus`.
While investigating `std`, the `hive` came into my attention - a mysterious
project with a explicit prohibition on providing README, and even so getting
traction. I was intrigued.

But before committing fully, I looked for alternatives.

{{ resize_image_w(path="hive/flake-parts.png", width=1008) }}

That's not me asking on the Discord, but someone else with the same idea.

Poked around to see if it's good. Docs seemed incomplete. Couldn't fully
understand it, so I wanted a more straightforward framework to guide me. Decided
to try Hive.

Found Lord-Valeen's repo and messed around. Realized I was missing basics, so I
studied Haumea, Paisano, std, and Hive more carefully.

Built some codebase, set up testing on WSL, and started building tries. Finally
broke through, first with the build system, then the home manager. Smooth
sailing from there. Still discovering new things but in a productive state, able
to take it slow.

Discovery of hive:

Hive

# describe nix module

# describe hive's domain

# my ideal cell structure

# bee enters the cell

# links and how to search github for hive projects

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

Started with Will T's series. Copied most of the configs without fully
understanding what I am doing. Was able to keep it on for sometime, even grow
WSL with enough trust to switch my daily office from Ubuntu to Nix.

[Will T - NixOS series ](https://www.youtube.com/watch?v=QKoQ1gKJY5A&list=PL-saUBvIJzOkjAw_vOac75v-x6EzNzZq-)

Neovim Nix, boost in confidence. A feeling of understanding every corner. Ready
for the next step. Ready to refactor my main nixos configuration.

Messy, flake/callPackage/import/modules/flakes. I want to create a declarable
tmuxp sessions where I can combine different windows on different NixOS
instances, and I have no clue how to start.

Not solid understanding of language, module system. Craving for guiding hand,
start research and discovery of nixos guide.

[NixOS Guide](https://github.com/mikeroyal/NixOS-Guide)

Digga, obsoleted and abandoned by David. Migrated to std. Hive repository, keys
are hidden. Start digging around.

Before full commitment, searching for alternatives. Found flake-parts.

{{ resize_image_w(path="hive/flake-parts.png", width=1008) }}

Poke around ... is it really the hot stuff? The docs seemed halff-baked.
Couldn't easily fully grasp the concept, felt that I need more opinionated
framework to guide me.

Decided to give the Hive a try.

Found Lord-Valeen repository and started messing around. Later on still felt
that I missing the basic and started to study Haumea, Paisano, std and hive more
carefully.

After establishing some codebase, prepared testing WSL and started to building
tries. At last was able to break through, build system first, build the home
manager afterwards. From there it is smooth sailing, still feeling like there
are new things to discover, but already in productive state, able to slow down
and let it come as it is.

{{ tip(tip="

Digga was already
[removed](https://github.com/mikeroyal/NixOS-Guide/commit/14a6d9530bb958bae7eaf531191bcc99f03e44f0)
from the NixOS Guide.") }}

Discovery of hive:

Hive a mysterious project with a explicit prohibition on providing README, and
even so getting traction. I was intrigued.

# describe nix module

# describe hive's domain

# my ideal cell structure

# bee enters the cell

# links and how to search github for hive projects

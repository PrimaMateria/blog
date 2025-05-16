+++
title = "WSL NixOS cleanup"
date = "2025-05-16"
slug = "wsl-nixos-cleanup"

[extra]
banner = "banner-ai-generated-images.png"
bannerAlt = "TODO"
reddithref = ""

[taxonomies]
tags = ["nix"]
+++


Clean-up of the nixos store in the WSL.


<!-- more -->
<!-- TOC -->

Clean the store:

```
sudo nix-collect-garbage -d
```

WSL virtual disk file still left with big size. Use diskpart to reduce the size.

```
wsl --shutdown 
wsl.exe --list --verbose 
diskpart
```

```
DISKPART> select vdisk file="C:\Users\foo\bar\ext4.vhdx"
DISKPART> compact vdisk
```


- https://nixos.wiki/wiki/Storage_optimization
- https://stackoverflow.com/a/74870395

+++
title = "Running Steam and Project Zomboid on NixOS"
date = 2022-10-29

[taxonomies]
tags = ["nixos","games"]
+++

In recent years, Linux gaming has come a long way. Thanks to projects like
Proton and the work of the Linux gaming community, more and more games are now
available to play on Linux. In this blog post, I'll walk you through my
experience of setting up Steam on NixOS and playing the game Project Zomboid.
I'll cover how to install Steam, how to install games, and how to get mouse
support and run Steam games from dmenu. While I still believe that Windows is a
superior gaming platform, the recent announcement of Valve's Steam Deck has made
me excited to try gaming on Linux once again.

<!-- more -->

{{ resize_image(path="nixos-steam-project-zomboid/tux-zombie-000.png", height=250) }}

Over three years ago I made a decision to switch completely from Windows to
Linux. Full disk format and single boot to KDE Manjaro (which quickly became
i3wm Manjaro). The intention to game on Linux was clear from the beginning.
During that time I learned about Proton, Glorious Eggrolls, Lutris and I started
to hate Easy Anti-Cheat for the lack of support for the games that would
otherwise run flawlessly on Wine.

I learned a lot, but it ended with switch back to the dual-boot. Since then
there was a clear-cut between the gaming and usage. And I still stand by this
decision. Windows is still in my opinion superior gaming platform. But here I am
again, going to setup Steam and run, as first, Project Zomboid on NixOS. What
was the dealbreaker? The Valve's courage behind Steam Deck.

{{ resize_image(path="nixos-steam-project-zomboid/tux-zombie-001.png", height=250) }}

## Declaring Steam

[Wiki page](https://nixos.wiki/wiki/Steam) suggests enabling programs steam.
This is Nixos system configuration not a home manager's `programs`. I have
already allowed unfree packages, so I didn't need to extended
`allowUnfreePredicate`.

```nix
programs.steam = {
  enable = true;
  remotePlay.openFirewall = true; # Open ports in the firewall for Steam Remote Play
  dedicatedServer.openFirewall = true; # Open ports in the firewall for Source Dedicated Server
};
```

I kept `remotePlay` and `dedicatedServer` set to `true`. After applying this
changes I was able to run steam. First run update the Steam client, and after
authentication I was able to see my library.

{{ resize_image(path="nixos-steam-project-zomboid/tux-zombie-002.png", height=250) }}

## Declaring Steam games

I was expecting there will be a way to declare which games to install the
nix-way - declaring them in the nix configuration and automate steam
installation. Closest to this concept I found to be
[https://github.com/juliosueiras-nix/nix-steam](https://github.com/juliosueiras-nix/nix-steam).
It has already some games predefined, and it also provides a guide how to add
your own games. I will keep this option parked for the case I would start gaming
big on Linux (I doubt that now).

{{ resize_image(path="nixos-steam-project-zomboid/tux-zombie-003.png", height=250) }}

## Installing Project Zomboid

I have installed Project Zomboid the standard way through Steam client. It
worked flawlessly. Project Zomboid doesn't sync save data to Steam cloud. The
next task was to bring them from Windows. First I declared a mount point in the
Nixos configuration:

```nix
fileSystems."/mnt/c" = {
  device = "/dev/disk/by-uuid/6C8A776F8A773524";
  fsType = "ntfs";
  options = [ "defaults" "user" "rw" "utf8" "umask=000" "nofail" ];
};
```

Then I created a link to Zomboid Saves folder on Windows. Just for safety I
decided to back it up first. While doing this I realized that the mount point is
read-only. The above options though contain the `rw` flag and I also verified
that `ntfs-3g` is present on the path. After some googling I have found a
solution in
[https://askubuntu.com/posts/1192233/revisions](https://askubuntu.com/posts/1192233/revisions).
Change the settings in the Windows and after booting back to Linux, the mount
point was writable.

I started the game and loaded my latest save. Everything worked correctly. Later
I have verified in Windows that the saves produced on Linux are usable as well.

{{ resize_image(path="nixos-steam-project-zomboid/tux-zombie-004.png", height=250) }}

## Mouse support

For Project Zomboid I am used to keys assigned on the mouse which toggle
inventory and health windows. It helps with looking in distance for incoming
zombies while being in the stalker mode. I own Logitech G502 mouse. The official
client sadly is not supported on Linux. But fortunately there exists foss
alternative in combo of [ratbagd](https://github.com/libratbag/libratbag)
service and its GUI [piper](https://github.com/libratbag/piper).

I found existing
[issue on GitHub](https://github.com/libratbag/piper/issues/752) that suggests
reconnecting the mouse. Doing this fixes the connection issue, but it is a bit
annoying. Fortunately the mouse needs to be configured once and the last profile
is remembered and applied on next restart.

## Steam games run from dmenu

The last little enhancement was creating dmenu for running steam games. I found
an existing script on
[https://github.com/SFort/steam-dmenu](https://github.com/SFort/steam-dmenu),
and I just wrapped it to nix configuration:

```nix
steamRun = pkgs.writeShellApplication {
  name = "steamRun";
  text = ''
    run="${dmenu}/bin/dmenu -nb black -nf white -sb yellow -sf black -l 20 -c"
    path="$HOME/.local/share/Steam/steamapps"

    for arg in "$path"/appmanifest_*.acf; do
      line=$(cat "$arg");
      nam="$(echo "$line"|tr '\n\t' ' '|sed 's/.*"name"[^"]*"\([^"]*\).*/\1/'|tr ' ' '_')"
      set -- "$@" "$nam" "$(echo "$line"|tr '\n\t' ' '|sed 's/.*"appid"[^"]*"\([^"]*\).*/\1/')"
    done

    run=$(printf "%s  :%s\n" "$@" | $run | sed 's/.*:\(.*\)/\1/')
    test -n "$run" && xdg-open "steam://run/$run"
  '';
```

And added new i3 shortcut:

```
"${mod}+s" = "exec --no-startup-id ${steamRun}/bin/steamRun";
```

{{ resize_image(path="nixos-steam-project-zomboid/tux-zombie-005.png", height=250) }}

## Another discovered ideas and packages

- [SteamCMD](https://developer.valvesoftware.com/wiki/SteamCMD)
- [steam-tui](https://github.com/dmadisetti/steam-tui)
- [MangoHud](https://github.com/flightlessmango/MangoHud)

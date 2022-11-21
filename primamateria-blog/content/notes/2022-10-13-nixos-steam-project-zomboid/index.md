+++
title = "Running Steam and Project Zomboid on NixOS"
date = 2022-10-13
+++

{{ resize_image(path="notes/2022-10-13-nixos-steam-project-zomboid/tux-zombie-001.png", height=250) }}
{{ resize_image(path="notes/2022-10-13-nixos-steam-project-zomboid/tux-zombie-002.png", height=250) }}
{{ resize_image(path="notes/2022-10-13-nixos-steam-project-zomboid/tux-zombie-003.png", height=250) }}

Over three years ago I made a decision to switch completely from Windows to
Linux. Full disk format and single boot to KDE Manjaro (which quickly became
i3wm Manjaro). The intention to game on Linux was clear from the beginning.
During that time I learned about Proton, Glorious Eggrolls, Lutris and I
started to hate Easy Anti-Cheat for the lack of support for the games that
would otherwise run flawlessly on Wine.
 
It was a hell of a ride where I learned a lot, but it ended with switch back to
the dual-boot. Since then there was a clear cut between the gaming and usage.
And I still stand by this decision. Windows is still in my opinion superior
gaming platform. But here I am again going to setup Steam and run, as first,
Project Zomboid on NixOS. What was the deal breaker? The Valve's courage behind
Steam Deck.

## Declaring Steam

[Wiki page](https://nixos.wiki/wiki/Steam) suggests to enable programs steam. This is nixos system configuration not a home manager's `programs`. I have already allowed unfree packages so I didn't need to extended `allowUnfreePredicate`.

```nix
programs.steam = {
  enable = true;
  remotePlay.openFirewall = true; # Open ports in the firewall for Steam Remote Play
  dedicatedServer.openFirewall = true; # Open ports in the firewall for Source Dedicated Server
};
```

I kept `remotePlay` and `dedicatedServer` set to `true`. After applying this changes I was able to run steam. First run update the Steam client, and after authentication I was able to see my library. 

I was expecting there will be a way to declare which games to install the nix-way. On wiki, discourse

https://github.com/ChUrl/NixFlake/blob/31189247e2d0e981a9ab94bcb86ab2ab13317b14/home/modules/gaming.nix
https://usebottles.com/
https://github.com/berarma/oversteer
https://github.com/FeralInteractive/gamemode

https://github.com/Leixb/nixos-dotfiles/blob/41ad19796c3917f49ec67eadcb559745c0e9ef5e/users/leix/gaming.nix
- creates aliases for games
- it looks like it also lists some IDs, but does it auto-install these games?

https://github.com/Electrostasy/dots/blob/e792e2e6142186f2c6b2a7811e250718e9a77920/hosts/terra/gaming.nix
- https://github.com/flightlessmango/MangoHud
- also interesting approach to have dedicated mount for games

https://github.com/juliosueiras-nix/nix-steam
https://github.com/fufexan/nix-gaming

Project zomboid running but saved game was not synced.

Auto mount windows filesystem with:

```nix
  fileSystems."/mnt/c" =
    { device = "/dev/disk/by-uuid/6C8A776F8A773524";
      fsType = "ntfs";
      options = [ "defaults" "user" "rw" "utf8" "umask=000" "nofail" ];
    };

```

Then create a link to Zomboid Saves folder on Windows.
Also backup the folder.
Read only file system. Options have rw.
Verified that `ntfs-3g` is present.
Trying https://askubuntu.com/posts/1192233/revisions
Worked after restart.
Game works.
Moved character upstairs, need oto check in windows if it loads.

Trying steam run dmenu something
https://nixos.wiki/wiki/Steam#steam-tui
https://developer.valvesoftware.com/wiki/SteamCMD

https://github.com/SFort/steam-dmenu

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


```
        "${mod}+s" = "exec --no-startup-id ${steamRun}/bin/steamRun";
```

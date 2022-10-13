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

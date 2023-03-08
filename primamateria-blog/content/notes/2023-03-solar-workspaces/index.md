+++
title = "Solar i3 Workspaces"
date = 2023-03-07

[extra]
banner = "banner-solar.gif"
+++

Setting up i3 workspaces to have planet names and wallpapers in Nix and Home
Manager configuration.

{{ end() }}

## Backstory

Most of the time while I am using i3wm I have been using
[automatic workspace renamer](https://github.com/roosta/i3wsr) that was setting
the title of the workspace based on the windows. Having Firefox opened in
several workspaces would simply mark them all as "Firefox". I wanted to label
the workspace based on the designation, and not the tool.

Manual naming of the workspace was accurate but tedious, and most of the time I
went without setting the name resulting even in worse navigability.

Later, on my work machine I came up with static name for the common designation
like "Talk" for Slack and Teams, "Listen" for Spotify, "Code" for Windows
Terminal, etc. The remaining spaces I thought to be backup a named them Earth,
Moon and Sun.

Over time, I come to like it. Some programs I learned to open always on Moon or
Sun. Mentally I even imagine working on the surfaces of sun and moon.

I tried to apply the same workflow on home machine, but I found that the static
designation doesn't fit well. Sometimes my session is just above watching
movies, browsing or crafting. Always trying to find the correct workspace to do
something became again tedious.

Therefore, I decided to try to go fully with generic names. Logically scaling
Earth, Moon and Sun led me to name workspaces according to the Solar System. I
must admit I never could very well remember order of the planets. This
experiment should help with that as well.

{{ end() }}

Until now, I used solid gray color wallpaper. I settled on this mundane solution
one day while wasting my time in the office searching that one wallpaper that
would best express my nature, and it would charm my coworkers. I figured this
unprofessional and immediately set solid gray.

This started my crusade to minimalism. I got to removing most of the noisy parts
of the interfaces and try to follow CLI feel and look. The same was applied to
my smartphone - black background and
[white icons](https://play.google.com/store/apps/details?id=com.whicons.iconpack&gl=US&pli=1)
(I use this look until this day, and eliminating the eye-candy trap also helps
to reduce the time watching the phone's screen).

For some time I even experimented with monochrome editor themes. No syntax
highlights, just read the text. But this was already too cruel, and I
backtracked to Gruvbox as my champion theme.

I always tried to utilize maximum space for the program in use. Just recently
after I started to use GlazeWM in work I tried gaps. And I must admit even I
don't exactly know how, but it works. Maxed-up windows carry with them some kind
of tension, gaps on the other hand make it look like the windows levitate,
evoking a feeling of airy freedom.

I am returning to image wallpapers, but with prudence. Each workspace will show
the celestial object that it is named after. The Sun and planets cover 9
workspaces. For the workspace 0, which I usually use as a dump or temp, the
black hole Messier 87 is a great fit.

{{ end() }}

## Declaring wallpapers in Home Manager

I copied the wallpapers' directory to a directory in my config repo where I
store raw files. Then with Home Manger I instructed it to be set in the resulted
i3 config directory.

```nix
{
  home.file.solarSystem = {
    source = ../configs/solarSystem;
    target = ".config/i3/wallpapers";
  };
}
```

{{ end() }}

## Updating i3 config in Home Manager

In the `let` block I defined convenient functions:

- `ws` a function that returns name of the workspace based on the index
- `wswall` same as above, but returns wallpaper filename
- `setWallpaper` returns the i3 `exec` command calling `feh` which will set the
  wallpaper

```nix
{
  xsession.windowManager.i3 = {
    config = let
      workspaces = ["10: Messier 87" "1: Sun" "2: Mercury" "3: Venus" "4: Earth" "5: Mars" "6: Jupiter" "7: Saturn" "8: Uranus" "9: Neptune"];
      ws = n: builtins.elemAt workspaces n;

      wallpapers = ["messier87.jpg" "sun.jpg" "mercury.jpg" "venus.jpg" "earth.jpg" "mars.jpg" "jupiter.jpg" "saturn.jpg" "uranus.jpg" "neptune.jpg"];
      wswall = n: builtins.elemAt wallpapers n;

      setWallpaper = w: "exec --no-startup-id feh --bg-center ~/.config/i3/wallpapers/${w}";
    in {
      # rest of i3 config
    };
}
```

Then I updated keybindings that switch to workspaces. Before each `workspace`
call I added the `setWallpaper` call with matching workspace index.

```nix
# xsession.windowManager.i3.config.keybindings
{
  "${mod}+1" = "${setWallpaper (wswall 1)}; workspace number ${ws 1}";
  "${mod}+2" = "${setWallpaper (wswall 2)}; workspace number ${ws 2}";
  "${mod}+3" = "${setWallpaper (wswall 3)}; workspace number ${ws 3}";
  "${mod}+4" = "${setWallpaper (wswall 4)}; workspace number ${ws 4}";
  "${mod}+5" = "${setWallpaper (wswall 5)}; workspace number ${ws 5}";
  "${mod}+6" = "${setWallpaper (wswall 6)}; workspace number ${ws 6}";
  "${mod}+7" = "${setWallpaper (wswall 7)}; workspace number ${ws 7}";
  "${mod}+8" = "${setWallpaper (wswall 8)}; workspace number ${ws 8}";
  "${mod}+9" = "${setWallpaper (wswall 9)}; workspace number ${ws 9}";
  "${mod}+0" = "${setWallpaper (wswall 0)}; workspace number ${ws 0}";
}
```

At the start i3 executes command to switch to workspace 1. I had to call
`setWallpaper` there as well otherwise the wallpaper won't be set until I switch
to some workspace manually.

```nix
# xsession.windowManager.i3.config.startup
[
  { command = "${setWallpaper (wswall 1)}; i3-msg workspace '${ws 1}'"; notification = false; }
]
```

{{ end() }}

## Possible enhancements

The action of changing wallpaper is now bound to keybinding, but there are other
ways to switch workspaces. For example command `workspace back_and_forth` is not
covered. Also, controlling i3 via IPC messages won't trigger wallpaper change.

For future, probably the IPC protocol is the one that needs to be utilized. Run
a daemon process and listen to messages and react on change of focused
workspace.

{{ end() }}

## Wallpapers

All the wallpapers I found on the Wikimedia.

### Sun

{{ resize_image_w(path="notes/2023-03-solar-workspaces/sun.jpg", width=1008) }}
By NASA/SDO (AIA) -
http://sdo.gsfc.nasa.gov/assets/img/browse/2010/08/19/20100819_003221_4096_0304.jpg,
Public Domain, https://commons.wikimedia.org/w/index.php?curid=11348381

### Mercury

{{ resize_image_w(path="notes/2023-03-solar-workspaces/mercury.jpg", width=1008) }}
By NASA/Johns Hopkins University Applied Physics Laboratory/Arizona State
University/Carnegie Institution of Washington -
https://photojournal.jpl.nasa.gov/catalog/PIA11364, Public Domain,
https://commons.wikimedia.org/w/index.php?curid=83618472

### Venus

{{ resize_image_w(path="notes/2023-03-solar-workspaces/venus.jpg", width=1008) }}
By NASA/JPL-Caltech -
https://solarsystem.nasa.gov/resources/2524/newly-processed-views-of-venus-from-mariner-10/,
Public Domain, https://commons.wikimedia.org/w/index.php?curid=105847882

### Earth

{{ resize_image_w(path="notes/2023-03-solar-workspaces/earth.jpg", width=1008) }}
By NASA/Apollo 17 crew; taken by either Harrison Schmitt or Ron Evans -
http://tothemoon.ser.asu.edu/gallery/Apollo/17/Hasselblad%20500EL%2070%20mm
https://www.flickr.com/photos/projectapolloarchive/21081863984/, Public Domain,
https://commons.wikimedia.org/w/index.php?curid=114976945

### Mars

{{ resize_image_w(path="notes/2023-03-solar-workspaces/mars.jpg", width=1008) }}
By ESA & MPS for OSIRIS Team MPS/UPD/LAM/IAA/RSSD/INTA/UPM/DASP/IDA, CC BY-SA
IGO 3.0, CC BY-SA 3.0 igo,
https://commons.wikimedia.org/w/index.php?curid=56489423

### Jupiter

{{ resize_image_w(path="notes/2023-03-solar-workspaces/jupiter.jpg", width=1008) }}
By NASA/JPL-Caltech/SwRI/MSSS/Kevin M. Gill -
jpl.nasa.gov/spaceimages/details.php?id=PIA22946, Public Domain,
https://commons.wikimedia.org/w/index.php?curid=77494805

### Saturn

{{ resize_image_w(path="notes/2023-03-solar-workspaces/saturn.jpg", width=1008) }}
By NASA / JPL / Space Science Institute -
http://www.ciclops.org/view/5155/Saturn-Four-Years-On
http://www.nasa.gov/images/content/365640main_PIA11141_full.jpg
http://photojournal.jpl.nasa.gov/catalog/PIA11141, Public Domain,
https://commons.wikimedia.org/w/index.php?curid=7228953

### Uranus

{{ resize_image_w(path="notes/2023-03-solar-workspaces/uranus.jpg", width=1008) }}
By NASA - http://photojournal.jpl.nasa.gov/catalog/PIA18182, Public Domain,
https://commons.wikimedia.org/w/index.php?curid=121128532

### Neptune

{{ resize_image_w(path="notes/2023-03-solar-workspaces/neptune.jpg", width=1008) }}
By NASA/JPL - http://photojournal.jpl.nasa.gov/catalog/PIA00046, Public Domain,
https://commons.wikimedia.org/w/index.php?curid=31789

### Messier 87

{{ resize_image_w(path="notes/2023-03-solar-workspaces/messier87.jpg", width=1008) }}
By Event Horizon Telescope - https://www.eso.org/public/images/eso1907a/; JPG
saved from full size TIFF and converted with maximum quality level 12 in
Photoshop 2019., CC BY 4.0,
https://commons.wikimedia.org/w/index.php?curid=77916527

{{ end() }}

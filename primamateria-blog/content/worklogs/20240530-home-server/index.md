+++
title = "Home Server"
date = 2024-05-30
updated = 2024-07-04
slug = "home-server"

[extra]
banner = "banner-homeserver.png"
bannerAlt = "Mobius comics style. Cabin in the woods inside the deep forest. Lot of trees around. Window radiate yellow light. Satellite dish on the roof. Night sky full of stars and Milky Way. Science fiction"

[taxonomies]
tags = ["nix","raspberry pi","hive","nixos"]
+++

Setting up headless server that will be publicly accessible.

<!-- more -->
<!-- TOC -->

## Raspberry Pi 5 with Nix

- Installed Raspbian on the SD card.
- Generated new ssh key pair. Assigned IP address of rpi5 to the key.
- Copied public key to rpi5:
  `ssh-copy-id -i ./rpi5.pub primamateria@192.168.178.61`
- Setup rpi5 hostname. On WSL it required to set
  `wsl.wslConf.network.generateHosts = false;`
- Make sure nvim can edit files over scp. Recommended config of nvim-tree
  disables netrw that allows editing files over scp. See `:h nvim-tree-netrw`
- Installed nix on Raspbian with `curl -L https://nixos.org/nix/install | sh`
  (see [https://nixos.wiki/wiki/Nix_on_ARM](https://nixos.wiki/wiki/Nix_on_ARM))
- Editing single files will be cumbersome. I decided to edit `nixos-hive`
  directory locally and `rsync` it to rpi5. Added following shell application:
  ```nix
    (nixpkgs.writeShellApplication {
      name = "hive-rpi5-sync";
      runtimeInputs = [nixpkgs.rsync];
      text = ''
        rsync -a "$HOME/dev/nixos-hive" "rpi5:/home/primamateria/"
      '';
    })
  ```
- Created new rpi5 home configurations inside the hive.
- Created nix-shell with `git-crypt` and unlocked the `nixos-hive` repository on
  rpi5.
- Executed the first build.

  ```sh
  nix build .#homeConfigurations.primamateria-$HOSTNAME.activationPackage --extra-experimental-features nix-command --extra-experimental-features flakes
  ```

{{ nerdy(text="

**The build took the entire evening!** The minimum quality of shell-life tools
needs to be determined. The same will apply later for the neovim flake.
Everything must be streamlined to reduce build time. Additionally, I should
investigate if proper cachix configuration would be beneficial.

") }}

{{ curious(text="

`aarch64-linux` is in the official nixpkgs cachix, so there is no need for extra
configuration.

") }}

- After running `result/activate` programs are not found. When sourced
  `~/.nix-profile/etc/profile.d/nix.sh` then it started to work.

{{ curious(text="

What does `activate.sh` actually do? Does it just create links? The backed up
original `.profile` has some nix magic at the end. Maybe it needs to be added to
the rpi5 config in order to make it work.

") }}

- Created very minimal set of cli tools. Opted out tools like `eza` or `bat` in
  favor simpler `ls` and `cat`.
- Added following to make sure that nix is activated when terminal session is
  created:

  ```nix
  {
    #...
    programs.bash.profileExtra = ''
      if [ -e $HOME/.nix-profile/etc/profile.d/nix.sh ]; then . $HOME/.nix-profile/etc/profile.d/nix.sh; fi # added by Nix installer
    '';
  }
  ```

- Suddenly strange error started to appear while trying to activate built home
  manager result.

  ```text
  Starting Home Manager activation
  Inconsistency detected by ld.so: dl-setup_hash.c: 36: _dl_setup_hash: Assertion `(bitmask_nwords & (bitmask_nwords - 1)) == 0' failed!
  ```

  Debug reveals some issue with `libaws-c-cal.so.1.0.0`

  ```text
    $ LD_DEBUG=all result/activate
    ...
    219860:     file=libaws-c-cal.so.1.0.0 [0];  generating link map
    219860:       dynamic: 0x00007ffef049f840  base: 0x00007ffef0470000   size: 0x0000000000030578
    219860:         entry: 0x00007ffef0470000  phdr: 0x00007ffef0470040  phnum:                  6
  ```

  I am not interested in further investigation. My next step is to reflash the
  SD card with fresh raspbian.

- Reflashing raspbian dealt with the ld problem.
- Generate `nix.conf` that dealt with error about missing experimental feautes
  when trying to call `hive-home-reload`.

  ```nix
  {
    #...
    nix = {
      package = nixpkgs.nix;
      settings = {
        extra-experimental-features = ["nix-command" "flakes"];
      };
    };
  }
  ```

- Deactivating leds is achieved by passing `dtparam` configurations to the
  `/boot/firmware/config.txt`. Instead of directly updating this file I have
  prepared separated xdg config file.

  ```nix
  {
    #...
    xdg.configFile."rpi-boot-extract-config.txt".text = ''
      # disable leds
      dtparam=pwr_led_trigger=default-on
      dtparam=pwr_led_activelow=off
      dtparam=act_led_trigger=none
      dtparam=act_led_activelow=off
      dtparam=eth_led0=4
      dtparam=eth_led1=4
    '';
  }
  ```

  And added following line the origina `/boot/firmware/config.txt`:

  ```
  include /home/primamateria/.config/rpi-boot-extract-config.txt
  ```

  It didn't work, LEDs are still on. Writing the params directly to `config.txt`
  did the trick. So something is not working with the include statement. It
  looks like that referencing file not under `/boot` won't work
  ([source](https://raspberrypi.stackexchange.com/questions/78577/import-settings-from-other-file-into-config-txt)).

  I made config script that will copy `config.txt` defined in the hive and
  stored in nix store to the boot volume:

  ```nix
  (nixpkgs.writeShellApplication
    {
      name = "rpi5-configure";
      text = ''
        # Backup original /boot/firmware/config.txt
        sudo cp /boot/firmware/config.txt /boot/firmware/config.backup.txt
        # Copy custom config from the nix store
        sudo cp ${boot-firmware-config} /boot/firmware/config.txt
      '';
    })
  ```

## Docker

- Installed docker with docker's
  [convenience script](https://docs.docker.com/engine/install/debian/#install-using-the-convenience-script).

- I tried using arion. First I installed recommeded packages via home manager:

  ```nix
  {
    #...
    home.packages = [
      nixpkgs.arion
      nixpkgs.docker-client
    ];
  }
  ```

  Then I added my user to the docker group and create simple arion project. When
  I tried to run `arion up` it failed with
  [error](https://stackoverflow.com/questions/77641240/getting-docker-compose-typeerror-kwargs-from-env-got-an-unexpected-keyword-ar).
  The issue is the new `docker compose` that replaced older `docker-compose`
  while it looks like arion relies on the old version.

  Having docker compose project define in nix is not such a necessity for me.
  Next I will try to traditional yaml configuration.

## FreshRSS

- I defined docker compose file for FreshRSS inside the nix using
  `nixpkgs.writeTextFile` and `builtins.toJSON`. At first the service was not
  working, but later I found the issue was (probably) in permission settings or
  user creation. Running recommended commands that were shown after the first
  FreshRSS run that installed the service fixed the issue and now the service is
  accessible through local network.
- I wanted to expose the service to public. Hastily I bought domain on
  Squarespace just later to find that they don't offer Dynamic DNS service. The
  right for the full refund is limited to 5 days, which should be fine. Next I
  come across [noip.com](https://www.noip.com) that offers free domain with
  DDNS. I found a
  [tutorial](https://raspberrytips.com/install-no-ip-raspberry-pi/) that
  suggests installing noip client directly on raspberry. Other option worh to
  investigate is to leverage
  [fritzbox (home router) settings to connect to DDNS service](https://www.noip.com/support/knowledgebase/configuring-ddns-fritzbox).
- Updated the fritzbox and verified that the FreshRSS is reachable on the noip
  domain.
- Tried to install `certbot` to obtain SSL certificate from "Let's encrypt"
  using the nix-shell but it gives an error:

  ```
     error:
       … while evaluating a branch condition
         at /nix/store/r0f9gw57riyd2wqybqp8s494v1zngm68-nixpkgs/nixpkgs/pkgs/stdenv/booter.nix:99:7:
           98|     thisStage =
           99|       if args.__raw or false
             |       ^
          100|       then args'

       … in the right operand of the update (//) operator
         at /nix/store/r0f9gw57riyd2wqybqp8s494v1zngm68-nixpkgs/nixpkgs/pkgs/stdenv/booter.nix:84:7:
           83|       { allowCustomOverrides = index == 1; }
           84|       // (stageFun prevStage))
             |       ^
           85|     (lib.lists.reverseList stageFuns);

       (stack trace truncated; use '--show-trace' to show the full, detailed trace)

       error: getting status of '/nix/store/r0f9gw57riyd2wqybqp8s494v1zngm68-nixpkgs/nixpkgs/pkgs/by-name/bm': Structure needs cleaning
  ```

- https://hometechhacker.com/letsencrypt-certificate-dns-verification-noip/

## Traefik

- Installed [traefik](https://doc.traefik.io/traefik/) and made modifications to
  the freshrss service in the docker compose

  - removed port mapping to the host
  - added traefik related labels that configure path prefix router `/freshrss`
  - added middleware that strips the prefix from the requests

  At last, I have updated the base URL in the docker compose, but because
  freshrss was already installed, it was required to directly update
  `config.php` in the data volume. After restarting the docker, the freshrss is
  now available on [http://rpi5/freshrss](http://rpi5/freshrss).

{{ curious(text="

Treefik is much easier to work with than I had feared when initially looking at
the documentation.

") }}

- [Fresh RSS Docker Compose proxy](https://github.com/FreshRSS/FreshRSS/blob/edge/Docker/freshrss/docker-compose-proxy.yml)
- [Generate Certificate Signing Request](https://www.ssl.com/how-to/manually-generate-a-certificate-signing-request-csr-using-openssl/)
- I have create Certificate Sign Request and uploaded it to the noip admin
  interface. After some short time it verified it, and allowed me to download
  the certifacates. I have updated again the traefik configuration. Now
  accessing the URL doesn't return the default treafik certificate, but
  `Error code: SSL_ERROR_UNRECOGNIZED_NAME_ALERT`. Not sure what is wrong. I am
  little bit hoping that it might take time to propage the certificate and that
  it will start working later. If not, further investigation will be required.

- Fixed the the update URL in the Fritzbox settings. It could be find in the
  fritzbox help pages.

  ```
  https://dynupdate.no-ip.com/nic/update?hostname=<domain>&myip=<ipaddr>,<ip6addr>
  ```

- To investigate issue with not working SSL certificate I have enabled traefik
  logs and found out that the issue was that the private key was protected with
  password which is not yet supported in traefik. I have copied the private key
  to the new one without the passphrase. When I was trying to apply the change
  the pi started to misbehave again.
- Home manager activation reported some conflict and when I started to look into
  available space with `df` I encountered segmenation faults. It looks like the
  SD card is not very reliable medium. Maybe I should think using external disk
  for storing docker services volumes to avoid constant repetitive setup. After
  rewriting the SD card with fresh raspbian and going through initial setup I
  was able to verify that new unlocked private key did the trick and the
  freshrss is now properly available to public.

## Planning extenstion

- Next applications

  - matrix synapse server with bridge to slack, wechat, irc, and whatsapp,
    element client
    [tutorial](https://medium.com/@sncr28/deploying-a-matrix-server-with-element-chat-in-docker-compose-with-nginx-reverse-proxy-cc9850fd32f8)
  - amnezia wire gard
  - database for shared kodi data
  - media / file server
  - home devices manager

## Raspberry Pi replacement

- During the initialization of the Synapse service the system threw segmentation
  fault again. After the restart the boot up didn't succeed. Instead of
  reinstalling the again the Raspbian I contacted Amazon to try to get
  replacement micro SD card. Amazon instead offered chargeback for returning the
  whole Raspberry Pi. Now as I have second chance, I am looking for a x86-64
  system that would support proper NixOS.
- [Suggestions from Reddit](https://www.reddit.com/r/NixOS/comments/1dt4yq3/nixos_home_server_hardware_recommendations/?):

  - DELL Optiplex 5050 with i5-7500/8GB ram/256GB nvme + 2TB 3.5-inch HDD - 11W
    idle - 80
  - N100 - Beelink S12 Pros (no HDD)
  - Thinkcentre
  - Asrock N100DC
  - Beelink (10-15W) Max 25W
  - ASRock Deskmini X300 + Ryzen 5600G
  - Odriod H3+ (higher consumption)

|                          | Processor                      | RAM       | Disk           | Price   |
| ------------------------ | ------------------------------ | --------- | -------------- | ------- |
| Beelink S12 Pro          | Intel Alder Lake - N100 3.4GHz | 16GB DDR4 | 500GB PCIe SSD | 199€    |
| Dell Optiplex 5050 SFF   | i7-6700                        | 8GB DDR4  | 240GB SSD      | 209€    |
| Dell Optiplex 7050 USFF  | i5 Quad Core                   | 8GB DDR4  | 256GB          | 149€    |
| Dell Optiplex 7040       | i5-6400T                       | 8GB DDR4  | 240GB SSD      | 123€    |
| Lenovo ThinkCentre M900  | i7-6700T 2.8GHz                | 16GB      | 240GB          | 212.50€ |
| Lenovo ThinkCentre M910q | i5 3.10GHz                     | 8GB       | 256GB          | 159€    |
| Lenovo ThinkCentre M92   | i5 3.60GHx                     | 8GB       | 512GB          | 129€    |
| Raspberry Pi 5           | ARMv7 2.4GHz                   | 8GB       | 64GB SD card   | 139€    |

## Beelink

<div style="margin-top: 24px">
{{ resize_image_w(path="worklogs/20240530-home-server/beelink.webp", width=748) }}
</div>

- I decided to purchase the
  [Beelink EQ13](https://www.bee-link.com/en-de/collections/mini-pc/products/beelink-eq13-n100?variant=46197263073522)
  with an Intel Alder Lake N100 Processor, 4C/4T, max 25W TDP, max turbo
  frequency of 3.4 GHz, 16GB RAM, and 500GB SSD for approximately 200€. The
  Beelink came with Windows 11 preinstalled. I found information on a random
  Microsoft forum stating that it is not necessary to export the license key. If
  I decide to boot Windows again, simply installing the same version should be
  sufficient, as the machine signature should already be remembered in some kind
  of Microsoft registry.
- Next, I installed NixOS. I downloaded the latest NixOS iso file and uploaded
  it to my existing [Ventoy](https://www.ventoy.net/en/index.html) USB key. The
  installation was not without problems. Initially, the HDMI monitor did not
  work unless I booted to the live ISO with `nomodeset`, essentially loading
  without graphics drivers. Then, during the installation, I encountered issues
  with formatting the disk. The swap partition failed to be created, or at one
  point, something with calibria was holding onto mount points and not allowing
  them to be unmounted without a full restart. Originally, I had planned to try
  with a 2GB swap since the 16GB of RAM seemed sufficient for the start.
  However, due to these issues, I ended up proceeding without any swap. I can
  address this later if needed. I checked the `btop` and saw that there is
  plenty of free memory, so there is no need to worry.
- I installed the operating system without a desktop environment. However, the
  HDMI was not working again until I added `nomodeset` when booting (by pressing
  `e` in the boot menu and appending it as the last parameter). Despite some
  initial difficulties, I managed to enable SSH, integrate Beelink and
  HomeServer into the existing Hive configuration, and successfully run Traefik
  and FreshRSS as Docker services. Although I could use Nix services, I
  currently prefer Traefik, so I will continue using it.

{{ nerdy(text="

I have to mention the build speed. Beelink builds as fast as I am accustomed to.
There was no need to reduce the configuration to a minimum. I confidently
enabled the full shell capabilities along with my full-blown neovim. Now,
instead of editing the config and syncing it to the rpi, I am running my own
tmux server and neovim and editing directly on the beelink. It is much easier to
work with the beelink, and even though the price was higher, I still believe
that the price-to-performance ratio is much better compared to the rpi.
Additionally, the included 500GB SSD provides plenty of opportunities for
upcoming experiments.

") }}

{{ curious(text="

And don't forget to mention that it is x86-64 instead of the Raspberry Pi's ARM
architecture! Also it is very quiet.

") }}

## Matrix

- Picked up where I the configuration on rpi. I am still not sure if I can run
  the synapse on subdir `https://primamateria.ddns.net/synapse`. It seems that
  it will be possible, but looks like everything is harder with subdir than
  subdomains. Then I check the current SSL certificate I bought on noip would
  cost 150$ per year. Still other option might be a switch to Let's encrypt.
- Today I finished working on synapse configuration and docker compose. When
  trying to run into an issue when generating signing key:
  [https://github.com/element-hq/synapse/issues/16824a](https://github.com/element-hq/synapse/issues/16824).
  The issue is marked as closed. I tried to use docker image with `develop` tag
  but it fails as well. I generated the config and signing key to new separate
  volume and copied only the signing key with correct permission. Then the next
  error was permission denied for `/data/media`. Rather than creating it again
  by hand I should look for the core issue. At the end the most right solution
  seemed for me to manual `chown` docker's volumes `\_data`directories
  to`991:991` to match the UID and GID with which the synapse is run in the
  container.
- Now the synapse is running, and reporting being healthy. But I can't see it on
  the traefik dashboard. It is very confusing because all the examples use
  subdomain like matrix.example.com. And also based on the
  [nginx docs](https://element-hq.github.io/synapse/latest/reverse_proxy.html#nginx),
  it seems, that matrix exposes ports 443 and 8448. 443 is general SSL port.
  Does it mean that it will take over all the root 443 requests? Or maybe the
  requests will come with path `/_matrix` and `/_synapse/client`, so at the end
  443 is a subpath.
- Previously Traefik was not picking up synapse because I had typo in the
  labels. Checking Traefik logs inisde the container helped to find the issue.
  Afterwards I was trying to configure following proxy:

<!-- prettier-ignore-start -->
  {% mermaid() %}
  flowchart TD
      federation
      client

      subgraph homeServer

          subgraph traefik
              traefik443["443"]
          end

          subgraph synapse
              synapse8008["8008"]
          end
      end

      federation -->|/_matrix| traefik443
      client -->|/_synapse/client| traefik443
      traefik443 -->|/_synapse/client| synapse8008
      traefik443 -->|/_matrix| synapse8008

  {% end %}
<!-- prettier-ignore-end -->

- Next, I will try to setup also Element to and then start testing it together.
- https://github.com/element-hq/element-web/issues/17459
- https://goneuland.de/matrix-chattplattform-mittels-traefik-und-docker-installieren/
- Element served on subpath is trying to fetch relative resources from root path
  which fails. These subpaths are getting really annoying. Next I have to set up
  subdomains.
- I tried to set up let's encrypt wildcard ssl and it was really easy. It might
  be that before I felt intimidated by all the new information, and confused
  about setting up certbot. But Let's encrypt is even easier than the previous
  method of creating CSR and uploading pem files to server. Now with enabled
  subdomains it was really easy to complete the element and synapse setup. I
  have migrated also the freshrss to the subdomain.

{{ curious(text="

This is a great moment! I was able to unlock the subdomains without having to
pay over a hundred dollars for the yearly subscription. I was worried that there
might be a catch waiting for me down the line, but there wasn't.

") }}

<div style="margin-top: 24px">
{{ resize_image_w(path="worklogs/20240530-home-server/matrix-primamateria-ddns-net.webp", width=748) }}
</div>

- I encountered
  [issue with regenerated signing key](https://github.com/matrix-org/synapse/issues/7574).
  It was because when changing to subdomain I have deleted the previous docker
  volumes. User in the room for matrix.org susgested just to give a time until
  the cache expires.
- Meanwhile I move to setting up the bridges. As first I take wechat:
  [https://github.com/wechaty/matrix-appservice](https://github.com/wechaty/matrix-appservice).
- I am investigating Wechaty, but it is very confusing. Initially, I thought it
  was a paid service because it required a token. I did not appreciate
  discovering this after following the steps, rather than it being clearly
  stated in the README introduction. However, I am not certain if the paid token
  is truly necessary or if I am simply confused. This uncertainty leads to my
  second dissatisfaction. On their documentation page, there is a QR code to
  join the Wechat group. When scanned, it opens a webview with a Discord invite.
  Unfortunately, clicking the button did not work for me, even though I have
  Discord installed on my phone. I attempted to copy the link to Firefox, but
  that also did not work. I tried searching for the Wechaty space on Discord
  itself, but to no avail. This frustration led me to consider trying the
  alternative Go bridge as the next step.
- I didn't let it go. At the end I was able to join the Discord server and post
  [my question about the pricing](https://discord.com/channels/916984413944967180/916984414557323346/1269770505909571744a).
- [Chinese blog post](https://duo-github-io.translate.goog/posts/matrix-qq-wechat/?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=de)
  explaing the use of wechat bridge that is based on the mautrix-go. As far as I
  can see right now, it also depends on external agent. But in this case it is
  windows program run in wine in the docker with questionable stability. Until
  now, I still didn't get any answer on the wechaty discord, and, btw,
  matrix.org is still refusing my new signing key with 401s.
- The issue was not with cached signing key. I opened port 8448 and redirected
  it to synapse's 8008. This is the port through which the federation tries to
  reach the synapse. Now I can search the rooms, but when I try to join some it
  never fetches the message or users list.

<div style="margin-top: 24px">
{{ resize_image_w(path="worklogs/20240530-home-server/matrix-primamateria-ddns-net2.webp", width=748) }}
</div>

- After some time, the messages and users got fetched and now it all works.
- After few days of enjoying working matrix home server I came to conclusion
  that with exception of some few popular rooms matrix looks quite empty.
  Anyway, my main goal is to unify whatsapp and wechat into one application and
  matrix rooms are bonus. I started to work on the matrix-wechat bridge, since
  some random user replied to my query that it is know for it to be stable
  despite the disclaimer about wine stability in their readme.
- Also I briefly looked onto the IRC bridge. I took IRC bridge existence to be
  the self-evident, so it was quite a shock to finda
  [an announcment about discontinued support between Libera IRC network and Matrix](https://matrix.org/blog/2023/07/deportalling-libera-chat/).
  I really thought these two worlds will be close together. Somehow this another
  disappoitment uncovered after diving in, and now Matrix doesn't look anymore
  as modern savior, but more like
  ["Too weird to live, and too rare to die."](https://www.goodreads.com/quotes/1319753-there-he-goes-one-of-god-s-own-prototypes-a-high-powered)
  case.
- I am following the
  [translated guide](https://duo.github.io/posts/matrix-qq-wechat/). I have
  added the shared secret authenticator and successfuly restarted the synapse
  service with the new module loaded. One thing to be aware there was to set the
  correct python version where the python module is mapped via the docker
  volumes.
- The next steps are bit cumbersome, because I am converthing the yaml configs
  to nix. The generated configuration is really extensive, but luckily only with
  few fields that need to be adjusted. And the generation happens in two steps.
  I wasted time by porting the first step result to nix config, and then
  realizing that the second step still requires updated yaml and it will again
  write something back to it. It made me think if the porting all these yamls to
  nix is worth the effort. I concluded that yes, it is. Yaml files should
  usually be privately contained on some server. When server explodes, files are
  gone. My nix config will be comitted to public repository. Also the pure yaml
  files could be committed, but the secrets in them would be as well. Having
  these configs in nix using hive's secrets encrypted with git-crypt solves it -
  public and reproducible, but still secure.
- The matrix-weChat service, after starting, attempts to write something to the
  config file. However, this does not work because the files now come from the
  Nix store. Additionally, the config file and registration file must be located
  inside the container's `/data` directory. I am unsure how to map Nix store
  files into it while keeping the entire directory as a Docker volume. Other
  services allow for custom config file placement by passing an environment
  variable or parameter pointing to it. It is crucial that other services access
  these files in a read-only manner. I will revert the Nix configs back to YAML
  and store them inside a secret folder. And I will manually copy them to the
  Docker volume.
- I continue to work on getting the WeChat bridge to function properly. I am
  still working with the Nix configurations. As I resolved issues one by one, I
  reached a point where there are no errors when starting the bridge. Therefore,
  the read-only configurations may actually work. It is possible that previous
  write errors were caused by configuration mistakes, but when everything is
  correct, no writing takes place.
- Reached the point where the bridge is attempting to call the synapse server
  but is receiving an error stating that the @wechatbot user does not exist and
  is being responded to with a 403 error.

  ```
  2024-08-14 20:53:33,959 - synapse.config.appservice - 96 - INFO - main - Loaded application service: ApplicationService: {'token': '<redacted>', 'url': 'http://matrix-wechat:17778', 'hs_token': '<redacted>', 'sender': '@tcMC6UH6RL0XgI6u5ONiCZL1w0C2KQY5:matrix.primamateria.ddns.net', 'namespaces': {'users': [Namespace(exclusive=True, regex=re.compile('^@wechatbot:primamateria.ddns.net$')), Namespace(exclusive=True, regex=re.compile('^@_wechat_.*:primamateria.ddns.net$'))], 'aliases': [], 'rooms': []}, 'id': 'wechat', 'ip_range_whitelist': None, 'supports_ephemeral': True, 'msc3202_transaction_extensions': False, 'protocols': set(), 'rate_limited': False}
  2024-08-14 20:53:47,942 - synapse.http.server - 130 - INFO - GET-2 - <XForwardedForRequest at 0x7f5226547610 method='GET' uri='/_matrix/client/versions?user_id=%40wechatbot%3Aprimamateria.ddns.net' clientproto='HTTP/1.1' site='8008'> SynapseError: 403 - Application service has not registered this user (@wechatbot:primamateria.ddns.net)

  ```

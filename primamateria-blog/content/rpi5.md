+++
title = "Raspberry PI 5 with Nix"
date = 2024-05-30

[extra]

[taxonomies]
tags = ["nix","raspberry pi","hive"]
+++

# Worklog

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
  programs.bash.profileExtra = ''
    if [ -e $HOME/.nix-profile/etc/profile.d/nix.sh ]; then . $HOME/.nix-profile/etc/profile.d/nix.sh; fi # added by Nix installer
  '';
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
  nix = {
    package = nixpkgs.nix;
    settings = {
      extra-experimental-features = ["nix-command" "flakes"];
    };
  };
  ```

- Deactivating leds is achieved by passing `dtparam` configurations to the
  `/boot/firmware/config.txt`. Instead of directly updating this file I have
  prepared separated xdg config file.

  ```nix
      xdg.configFile."rpi-boot-extract-config.txt".text = ''
        # disable leds
        dtparam=pwr_led_trigger=default-on
        dtparam=pwr_led_activelow=off
        dtparam=act_led_trigger=none
        dtparam=act_led_activelow=off
        dtparam=eth_led0=4
        dtparam=eth_led1=4
      '';
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

- Installed dowcker with docker's
  [convenience script](https://docs.docker.com/engine/install/debian/#install-using-the-convenience-script).

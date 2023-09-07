Installation start 20:38

```Wrong
Downloading image
https://github.com/nix-community/NixOS-WSL/releases/tag/22.05-5c211b47
nixos-wsl-installer.tar.gz

Running Windows Terminal PowerShell
wsl --import NixOS .\NixOS\ .\Downloads\nixos-wsl-installer.tar.gz --version 2
import flag doesn't exist on wsl.exe

https://learn.microsoft.com/en-us/windows/wsl/install
Running PowerShell from start menu as administrator

PS C:\Windows\system32> wsl --install --no-distribution
Installing: Windows Subsystem for Linux
Windows Subsystem for Linux has been installed.
The requested operation is successful. Changes will not be effective until the system is rebooted.

Rebooting

Windows Terminal
PS C:\Users\matus.benko> wsl --import NixOS .\dev\NixOS\ .\Downloads\nixos-wsl-installer.tar.gz --version 2
Import in progress, this may take a few minutes.
The operation completed successfully.

wsl -d NixOS
Frozen on Starting systemd...

Second try
PS C:\Users\matus.benko> wsl -d NixOS
nsenter: failed to parse pid: '-p'
https://github.com/nix-community/NixOS-WSL/issues/67
https://discourse.nixos.org/t/nixos-wsl-2-error-with-22-05-5c211b47-nsenter-failed-to-parse-pid-p/24238

PS C:\Users\matus.benko> wsl -l -v
  NAME     STATE           VERSION
* NixOS    Running         2
PS C:\Users\matus.benko> wsl -t NixOS
The operation completed successfully.
PS C:\Users\matus.benko> wsl --unregister NixOS
Unregistering.
The operation completed successfully.

rmdir .\dev\NixOS\
```

Download checkpoint 20:50

```
PS C:\Users\matus.benko> wsl --import NixOS .\dev\NixOS\ .\Downloads\nixos-wsl-x86_64-linux.tar.gz --version 2

/* Work only
Import in progress, this may take a few minutes.
Unspecified error
Error code: Wsl/Service/E_FAIL

Second try worked
*/

Windows Terminal Config
https://windowsterminalthemes.dev/
Tomorrow Night Bright
paste in the settings json file

Appearance:
Hide title bar: off
Always show tabs: off
Use active terminal title as application title: off
Pane animations: off

Rendering:
Atlas Engine: on

Actions:
Remove ctr+c and ctrl+v

Profile:
Name: NixOS
Command line: %SystemRoot%\System32\wsl.exe -d NixOS
Starting directory: ~

Color scheme: Tomorrow Night Bright
Font face: SourceCodePro Nerd Font Mono
Font size: 9
Font weight: Medium
Scrollbar visibility: Hidden

https://github.com/ryanoasis/nerd-fonts#patched-fontshttps://github.com/ryanoasis/nerd-fonts#patched-fonts

https://github.com/NixOS/nixos-artwork/blob/master/logo/nix-snowflake.svg
https://svgtopng.com/

Booted
Systemd hangup on first run is fixed as well
```

Checkppoint 20:53

```
cd /home/nixos
nix-shell -p git git-crypt neovim

[nixos@nixos:~]$ nix-shell -p git git-crypt neovim

/* Work only
warning: error: unable to download 'https://cache.nixos.org/nix-cache-info': Couldn't resolve host name (6); retrying in 272 ms

Changed /etc/resolv.conf
nameserver 8.8.8.8
*/

# Download keychain
Download to Windows, unzip in Windows
[nix-shell:~]$ cp -r /mnt/c/Users/matus.benko/Downloads/keychain/ ./


git clone https://github.com/PrimaMateria/nixos.git
cd nixos/
git-crypt unlock ~/keychain/nixos.key
# Apply system
sudo nixos-rebuild switch --flake .#yueix
```

Checkpoint 20:57

```
/* shaddamix
hanging on 'querying fuse'
restarted
had restart multiple times, hanging on download from cache.nixos.org

sudo nixos-rebuild switch --flake .#yueix --option build-use-substitutes false
https://discourse.nixos.org/t/i-seem-to-be-stuck-because-a-binary-cache-is-down/23641
*/

some warnings, saw them before, ignoring
warning: the following units failed: systemd-binfmt.service
```

Checkpoint 21:18

```
# Restart WSL, should boot to mbenko@yueix
PS C:\Users\matus.benko> wsl -t NixOS
systemd frozen again, need to patch my files with stuff in updated tar file

mkdir dev
sudo su
mv /home/nixos/nixos/ /home/nixos/keychain/ /home/mbenko/dev
chown -R mbenko  dev/keychain/ dev/nixos/
exit

nix-shell -p git git-crypt neovim
cd dev/nixos/
git-crypt unlock ~/dev/keychain/nixos.key
```

Checkpoint 21:22

```
./users.sh

/* shaddamix
connection issues again
turned of nordvpn and it helped
used option and it finally finished

sudo chown -R mbenko /nix/var/nix/gcroots/per-user/mbenko/
sudo chown mbenko /nix/var/nix/profiles/per-user/mbenko/
*/

```

Checkpoint 21:39

```

# Restart WSL again
# fix resolv.conf again
cd ~/dev/nixos
git remote remove origin
git remote add origin git@github.com:PrimaMateria/nixos.git
git fetch
git branch --set-upstream-to=origin/master master

sudo rm -rf /home/nixos
```

```

```

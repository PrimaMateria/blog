+++
title = "Display Manager Origins"
date = 2023-07-02
slug = "display-manager-origins"

[extra]
banner = "banner-display-manager.png"

[taxonomies]
tags = ["X","display manager","history"]
+++

The term "Display Manager" and "Login Manager" are often used interchangeably,
causing confusion for many people. The question arises: why is it called a
Display Manager, and what does the term "Display" refer to in this context?

<!-- more -->
<!-- TOC -->

## Personal Computer vs Mainframe

The initial concept that comes to mind is a setup where a single mainframe
serves multiple user stations or displays. For example like we could see in
libraries or at universities. According to Wikipedia, various variations of this
setup exist, such as [thin clients](https://en.wikipedia.org/wiki/Thin_client),
[zero clients](https://en.wikipedia.org/wiki/Rich_client),
[dumb terminals](https://en.wikipedia.org/wiki/Computer_terminal#Dumb_terminal),
and rich clients. However, at their core, they all adhere to the same principle:
utilizing a remote server for computation.

<br />
{{ resize_image(path="20230702-display-manager-origins/Thin_clients.png", height=200) }}
<br />

Is this the true meaning of "Display" in the Display Manager? Let's dive into
the world of X.

## X Window System

I have found in the Archive book
[**X Window System user's guide : for X11 R3 and R4 of the X Window System** by **Quercia, Valerie**; **O'Reilly, Tim**](https://archive.org/details/xwindowsystem03quermiss/page/n31/mode/2up).

> {{ resize_image(path="20230702-display-manager-origins/x-window-system-configuration.png", height=500) }}

> The display server may run on the same computer as a client or on an entirely
> different machine. Servers are available for PCs, workstations, and even for
> special terminals ...

> For example, you might use a relatively low-powered PC or workstation as a
> display server to interact with clients that are running on a more powerful
> remote system. Even though the client program is actually running on the more
> powerful system, all user input and displayed output occur on the PC or
> workstation server and are communicated across the network using the X
> protocol.

This was a bit counter-intuitive for me. Usually, it's the clients that connect
to the server, so it took some getting used to the idea that the server connects
to the clients. Nevertheless, the concept is clear. For instance, we could run
the display server on an Arduino with a monitor, keyboard, and mouse. We could
then use it to display IntelliJ IDEA, which would be running and compiling a
complex project on my powerful desktop computer.

> The display manager, xdm, is a client that is designed to start the X server
> automatically (...) and to keep it running. In its most basic implementation,
> the display manager emulates the getty and login programs, which put up the
> login prompt on a standard terminal, keeping the server running, prompting for
> a user's name and password, and managing a standard login session.

So, login has always been a feature of the Display Manager, but its main
responsibility is still to start the X server. And why is it called a "Display"
manager? Simply because the central entity in the X Window System domain is the
Display.

{{ why(question="
Was this name chosen by the authors because of the concept of thin clients?
", answer="") }}

I believe so. The development of the X Window System began in 1984. During that
time, MS-DOS was popular on IBM PCs, the Apple Macintosh made its first
appearance, and Microsoft Windows was still a year away from its initial
release. The X Window System emerged from the project Athena, which had a strong
focus on thin clients. You can find more information about Project Athena
[here](https://en.wikipedia.org/wiki/Project_Athena).

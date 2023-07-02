Display Manager or Login Manager.
Common confusion point for many.
So why was it named as Display Manager, what is the Display we are talking about.

First thought was about setup consisting of one mainframe serving multiple user stations, or displays.
Based on wikipedia there are different variations called thin clients / zero clients, dumb terminals and rich clients.
But in the core, they all share the same principle - using remote server for the computation.

https://en.wikipedia.org/wiki/Thin_client
https://en.wikipedia.org/wiki/Computer_terminal#Dumb_terminal
https://en.wikipedia.org/wiki/Rich_client

How can we find the connection between the Display Manager  

http://www.rru.com/~meo/pubsntalks/xrj/xdm.html

xdm release
The X Display Manager, xdm, keeps X running on displays and provides basic user session management.
X11R3/

So what is X Display?

https://archive.org/details/xwindowsystem03quermiss/page/n31/mode/2up

The display server may run on the same computer as a client or on an entirely different machine.
Servers are available for PCs, workstations, and even for special terminals ... 

For example, you might  use a relatively low-powered PC or workstation as a display server to interact with clients that are running on a more powerful remote system.
Even though the client program is actually running on the more powerful system, all user input and displayed output occur on the PC or workstation server and are communicated across the network using the X protocol.

While X clients may display their results and take input from a single display server, they may each be running on a different computer on the network. It is important to note that the same programs may not look and act the same on different servers since there is no standard user interface since users can customize X clients differently on each server, and since the display hardware on each server may be different.

The display manager, xdm, is a client that is designed to start the X server automatically (...) and to keep it running.
In its most basic implementation, the display manager emulates the getty and login programs, which put up the login prompt on a standard terminal, keeping the server running, prompting for a user's name and password, and managing a standard login session.

# neovim editions

Here on my blog I wrote a post about creating your own neovim flake. It was nothing great, but it was working for me for several years. Adding plugins, tweaking configs here and there was without problem.
First sign of potential of enhancement came when I was experimenting with termux and running neovim on Android phone. As I remember I had to disable some plugins, but more or less the neovim was running. But it was so heavy. I was not planning to code in rust or do the web development on the phne. My wish was tohave some mobile blogging, note taking device. Once I have realizd that the I cannot connect my custom split keyboard (ferris sweep) to the phone, I fully gave up on the termux.
Later the same feeling of too heavy editor came when I have installed it on my home server. It runs on Alder lake N100 interl processor, and even it is not as fast as my home or work machine, but it is fast enough for me to accept the longer build at first run.
Another big hit was when I was preparing plantuml plugin with plantuml server that requires whole JDK. I realized that my neovim editor is becoming mud of ball. The JDK would influence the performance of the update, even if I make the UML diagram sporadically.

But believe or not the decision came when I was considering to have a little fun wit C. When I was still elarning to program I bought some books about C and the pointer where confusing that time.But now after long tie Iwanted to revisit it again.
Anyway, as I was ready to start configuring another language in my mud of ball I thought that since I am already ready to hack around, why rather not to reafactor my neovim flake.

My nix skills are not great. But I got familar with hamuea, that is has big ipact on the organization of my flakes. 
The goal was to create linear inheritance of neovim editions, starting with a light neovim with minimum plugins, evolving to base IDE and then specializing to different languages like rust, python, and of course my main web focused development environment.

The core organization of the configuration files and the library that was packaging thm into the nix store was left in principle the same. I just tried to modularize the utility finctions to separate files.
To followthe spirit of my first blog post, I will also write down a step by step guide, with slow beginner-friendly guidance.

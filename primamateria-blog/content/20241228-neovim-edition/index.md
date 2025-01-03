+++
title = "Neovim Editions"
date = 2025-01-03
slug = "neovim-editions"

[extra]
banner = "banner-neovim-flake.png"
bannerAlt = "todo"
reddithref = ""

[taxonomies]
tags = ["nixos","neovim"]
+++

Introduction to a neovim flake to host multilple neovim editions with
inheritance. Instead of having one big configuration for multiple 
tasks, we can create multiple editions focused on one specific task.
With the inheritance we can reusue configurations of one edition in another.
In this article I will provide a step by step guidance with beginner friendly
explanations on how create your own flake.


<!-- more -->
<!-- TOC -->

## Personal story

Here on my blog, I wrote a post about creating your own Neovim flake. It wasn't
anything extraordinary, but it had been working for me for several years. Adding
plugins and tweaking configurations was easy and problem-free (most of the
time).

I use neovim as daily driver for web development. Apart of that I use it for
side projects often programmed with different languages. For that are necessary
different language servers and different plugins. I didn't like that my
configuration is becoming a mix of everything.

Therefore recently I have reworked my neovim flake. Instead of providing one
editor for everything the flake provides now multiple editions of neovim
configured for a specific task.

Also my skills with nix have slightly improved. Especially, getting familiar
with Haumea granted me access to neatly organized modules. 

I am using the editions for few weeks, and I got enough confidence to say that
it was a right decision. 

## Before we start

This article stands alone. You do not need to read a previous one. Although I
may not delve deeply into analyzing every line like before, you may still find
it useful to read through it.

All the code you can find in
[github:PrimaMateria/blog-example-neovim-editions](todo).



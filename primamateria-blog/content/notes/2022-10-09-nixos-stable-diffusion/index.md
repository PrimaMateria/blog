+++
title = "AI generated images - Stable Diffusion on NixOS"
date = 2022-10-08
+++

This is a blog, so I will be recording not only the solutions but also the path
that lead to them.

## AI generated images

AI generated images become interesting for me when I start to think about
creating this blog. I wanted to show an GitHub avatar on the top, but the
original that I was using was recklessly copied from copyrighted site
simple-desktops.

I got an idea that if I would generate an image, then I could still keep using
the alien octopus, just differently visualized. Actually I am still not fully
sure how copyright for AI generated images work. I imagine that the AI is like
a Photoshop. The images created in Photoshop do not belong to the software, but
to the human "inventor".

My path of discovery started with [Craiyon](https://www.craiyon.com/). The
first image I chose was this one:

{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/primamateria-craiyon.jpg", height=200) }}

Just at the same day I have found [Dalle2
subreddit](https://www.reddit.com/r/dalle2/) with fresh post that the DALL.E 2
registration doesn't require anymore special invite from whishlist, and it goes
fully public. So I jumped in, and generated some new octopuses:

{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/primamateria-dalle-octopus1.png", height=200) }}
{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/primamateria-dalle-octopus2.png", height=200) }}
{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/primamateria-dalle-octopus3.png", height=200) }}
{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/primamateria-dalle-octopus4.png", height=200) }}

How gorgeous! But bitter realization followed. Each run requires credits. Some
free
[credits](https://help.openai.com/en/articles/6399305-how-dall-e-credits-work)
are given at the sign-up and few more each month. Do you want even more? Pay.
Of course this model makes sense, like for some proffesional writers. But for a
hobbyist who just want to play, it feels like a sword of Damocles  - not
allowing freely to experiment with your imagination because I am going to run
out of the credits any time soon.

So the journey continues. Xe recently wrote some posts about the **Stable
Diffusion**. A competitor to Dalle, but open-sourced one 💕. And surprisingly
originating from Munich, which made me personally feel happy.

The first experience with Stable Diffusion was via [Dream
Studio](https://beta.dreamstudio.ai/dream). It also offered an option I didn't
see in DALL.E before. It is possible to pass a reference image, provide a
prompt and new image will be generated with the same style. For example the
image on the left I draw long time ago, and the image on the right is the one
generated via Dream Studio.

{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/castaneda-origin.png", height=350) }}
{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/castaneda-dreamstudio.png", height=350) }}

And the credits again. Ah, no problem anymore, we can run it locally and forget
the whole credit nightmare ~ if we have super duped GPU with like [10GB free
VRAM](https://github.com/CompVis/stable-diffusion). Which we have, right? And
if not, then there is [optimized
  version](https://github.com/basujindal/stable-diffusion) which will be
  satisfied with 2.4GB VRAM. Oh, these are the miracles that start happening
  when things go open source.

## What worked

I am enchanted by Nix. And if I will have a solution then this solution will be
running in NixOs. And the best place for finding NixOs solutions is NixOS
discource.

[Stable Diffusion using nix
flakes](https://discourse.nixos.org/t/stable-diffusion-using-nix-flakes/21610)
by [Collin Arnett](https://collinarnett.me/)

These steps led me to locally running Stable Diffusion:
1. clone repository
1. register account on Hugging Faces
1. generate Access account
1. accept Terms and conditions for the Stable Diffusion model
1. run `nix run --impure`
1. update token and run

First run resulted in lot of downloading, but subsequent runs spent time only
on image generation. Later I have updated the script to get 4 images at once
and also to save them in PNG format. The final version before I decided to
write this post looked like this:

```python
import os
import torch
import transformers

from torch import autocast
from diffusers import StableDiffusionPipeline

HF_TOKEN =  os.environ.get("HF_TOKEN")

pipe = StableDiffusionPipeline.from_pretrained(
    "CompVis/stable-diffusion-v1-4", 
    revision="fp16", 
    torch_dtype=torch.float16,
    use_auth_token=HF_TOKEN
)
pipe = pipe.to("cuda")
pipe.enable_attention_slicing()

prompt = "Octopus symmetry geometry math"
with autocast("cuda"):
    image1 = pipe(prompt).images[0]  
    image2 = pipe(prompt).images[0] 
    image3 = pipe(prompt).images[0] 
    image4 = pipe(prompt).images[0]

display(image1)
display(image2)
display(image3)
display(image4)

image1.save(prompt + "1.png")
image2.save(prompt + "2.png")
image3.save(prompt + "3.png")
image4.save(prompt + "4.png")
```

And here are some images I have generated for the prompt "Octopus symmetry
geometry math":

{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/octopus-sd1.png", height=200) }}
{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/octopus-sd2.png", height=200) }}
{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/octopus-sd3.png", height=200) }}
{{ resize_image(path="notes/2022-10-09-nixos-stable-diffusion/octopus-sd4.png", height=200) }}

## What didn't work

Just for a record, here is what a tried before and what didn't work for me.

First I tried to follow [Xe's blog
post](https://xeiaso.net/blog/stable-diffusion-nixos). But running 

``` bash
nix shell nixpkgs#conda
conda-shell
```

resulted first in error messages `*** stack smashsng detected ***: terminated`
and later failed creation of conda environment because of no working git.
Running git in conda shell reported 

```
git: error while loading shared libraries: __vdso_gettimeofday: invalid mode for dlopen(): Invalid argument
```

I have also tried to install conda in via old 

```
nix-shell -p conda
```

but the git was still not working, now with slightly different message

```
git: /usr/lib/libc.so.6: version `GLIBC_2.34' not found (required by git)
```

I tried to look for help on [NixOS wiki](https://nixos.wiki/wiki/Python#conda),
but unfortunately it didn't help at all. When I searched on Discord the keyword
Conda, I got NobbZ' recent message ["The most reliable way of using conda I
have heard about was through a
VM"](https://discordapp.com/channels/568306982717751326/747637173364457632/1027938976453120051),
which ceased my further efforts involving conda.

And then I turned to Discourse and I found the working solution not involving
conda described above.




+++
title = "Startpages: Your Personalized Browser Launch Pad"
date = 2024-10-03
slug ="startpages"

[extra]
banner = "banner-startpages.png"
bannerAlt = "Mobius comic book style. Neatly organized cyberpunk workshop"
reddithref = ""

[taxonomies]
tags = ["environment", "project", "productivity", "browser"]
+++

Have you ever wished for a more personalized and efficient way to start your
browsing sessions? Enter Startpages – customizable web pages designed to replace
your browser's new tab page and provide quick access to your curated list of
links. Today, I'm excited to share a personal project I've been relying on for
some time.

<!-- more -->

## What are Startpages and Why Should You Care?

Startpages are more than just pretty interfaces; they're productivity boosters.
While many browser extensions offer visually appealing new tab pages, I wanted
something different – a simple, practical solution with a dense list of links
organized into categories that matter to me.

🚀 [**Demo**](https://primamateria.github.io/startpages-template/home.html) -
See an example setup with Home and Development start pages.

## Project Goals

1. **Simplicity**: A clean, no-frills interface
2. **Practicality**: Quick access to frequently used links
3. **Customization**: Easy to tailor to individual needs
4. **Organization**: Ability to categorize links efficiently

## Color Schemes

Personalize your browsing experience with various color schemes. Here's an
example using the Gruvbox Dark Hard theme:

<div style="margin-top: 24px">
{{ resize_image_w(path="20241003-startpages/base16-gruvbox-dark-hard.png", width=748) }}
</div>

[Browse all available color schemes](https://github.com/PrimaMateria/startpages-template/blob/main/_docs/colorschemes.md)
to find your perfect match. For the CSS-savvy, full customization is at your
fingertips!

## Content Structure

Organize your digital world with this intuitive layout:

<div style="margin-top: 24px">
{{ resize_image_w(path="20241003-startpages/content-schema.png", width=748) }}
</div>

- **Multiple Start Pages**: Switch between different contexts (e.g., Home,
  Development)
- **Columns & Categories**: Group related links for easy access
- **Custom Icons**: Use Font Awesome icons or any HTML content for link
  representation

## Getting Started

[💻 GitHub Repository](https://github.com/PrimaMateria/startpages-template) -
Get started with this template repository.

1. **Copy the Template**: Use GitHub's template feature to create your own
   repository.
2. **Enable GitHub Pages**: Host your Startpage for free and enjoy automatic
   updates.
3. **Customize**: Edit the YAML file to add your links and categories.

Not tech-savvy? Don't worry! Leave a comment, and I'll guide you through the
process.

## Browser Integration

Make your Startpage the default new tab with these extensions:

- [Firefox New Tab Override](https://addons.mozilla.org/en-US/firefox/addon/new-tab-override/)
- [Chrome New Tab Override](https://chromewebstore.google.com/detail/new-tab-override/fjcmlondipcnnpmbcollgifldmajfonf)

**Pro Tip**: Vimium users can enable page focus in Firefox's New Tab Override
settings for keyboard navigation with the 'f' key.

## Under the Hood

This project is powered by:

- **Zola**: A fast, flexible static site generator written in Rust
- **Tera**: A powerful templating engine
- **YAML**: For easy content management

## Conclusion

Startpages offer a unique way to tailor your browsing experience to your needs.
Whether you're a productivity enthusiast or just someone who likes things
organized, this project might be just what you're looking for.

Have you tried creating a Startpage before? What features would you like to see
added? Let's discuss in the comments below!

---

_Remember, your browser is your gateway to the internet – why not make it work
for you?_

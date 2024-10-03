+++
title = "Startpages"
date = 2024-10-03
slug ="startpages"

[extra]
banner = "banner-playwright-nixos-webdev.png"
bannerAlt = "todo"
reddithref = ""

[taxonomies]
tags = ["environment","project"]
+++

Startpages are web page with list of links meant to replace browser new tab page
and to provide quick access to your own personally currated list of websites.

<!-- more -->
<!-- TOC -->

There are many startpage plugins available for the browsers, but usually they
are designed to be pretty. I wanted to have a starting page that is simple and
practical.

I followed the concept of Zola, a framework I use to write this blog. It is a
Rust based generator that uses Tera as a templating engine. In Zola the content
is generated from markdown files, in the Startpages it is generated from YAML
file.

## Screenshots

<div style="margin-top: 24px">
{{ resize_image_w(path="20241003-startpages/base16-default-light.png", width=748) }}
</div>

This is the default base16-default-light colors schemes. Other base16
colorschemes are included as well. You can preview them
[on this github doc page](https://github.com/PrimaMateria/startpages-template/blob/main/_docs/colorschemes.md).

Styling is defined in SASS and, of course, it is fully customizable if you are
familiar with CSS styling.

## Content structure

<div style="margin-top: 24px">
{{ resize_image_w(path="20241003-startpages/content-schema.png", width=748) }}
</div>

At the bottom of the screenshot you can see "Development" and "Home". These are
two startpages between which you can switch. Currently the Home startpage is
active.

Links are organized in the columns where each column can have multiple
categories. Each link is defined by icon, label and the URL. Icon is any HTML
content that will be injected in the icon container. By default the
[Font Awesome icons](https://fontawesome.com/search?o=r&m=free&f=brands) are
used.

## Deployment

The GitHub repository is set up as template. So, if you have a GitHub account,
you can "copy" the repository with your own account.

{{ curious(text="

What is difference between the fork and generating the repository from the
template?

") }}

{{ nerdy(text="

Forking a repository creates a copy that remains linked to the original,
allowing you to easily sync updates from the original repo. It's commonly used
for contributing to open-source projects.

Generating a repository from a template, on the other hand, creates a new,
independent repo based on the template's structure and files, but without any
link to the original. It's ideal for starting new projects with predefined
setups.

") }}

After that you just need to enable GitHub pages on the copied repository. Then
everytime new commit is pushed to the main branch, already prepared GitHub
actions will run the generator to generate static HTML pages from the content
and publish the result on the GiuHub pages.

This might be a bit harder step for non-technical people. If something is not
clear, or you get stuck on something, just write a comment and I will try to
help.

There are some advantages of using GitHub:

- GitHub pages are free.
- Changes are tracked - you can find a link after you removed it.
- You can directly edit and commit the changes through GitHub's web editor.

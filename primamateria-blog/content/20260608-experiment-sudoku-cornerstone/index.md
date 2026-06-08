+++
title = "Experiment Sudoku - cornerstone"
date = "2026-06-08"
slug = "experiment-sudoku-cornerstone"

[extra]
banner = "banner-ai-generated-images.png"
bannerAlt = "TODO"
reddithref = ""

[taxonomies]
tags = []
+++



<!-- more -->
<!-- TOC -->

## Recap

It's long time since the init step. I started with rereading my old post, clone
the repo and update the flake inputs.

Neovim C edition run command:

```
nix run ~/dev/neovim-nix#neovim.c
```

Finshed running the `cmake`, generate bunch of stuff in the build folder, but
where is the executable? Summoning claude as teacher, not as coding agent. It
seems I have mistake in previous blog post. The second command to get executable
was `cmake --build build`. Executable `hello` appeared in the `build/`. 

That`s it the end of the first blog post. Now refresher on what are the files in
the project.

## Project structure

Listed the files. Filling in my understanding then I will verify with claude.

**`CMakeLists.txt`** —

This the `package.json` equivalent. It declares cmake version, and c language
version. It also declares the project name and tells to cmake which is the main
C file and what is the output executable file.

**`src/hello.c`** —

Source code, main file. Now it include one library which is standard
input/output, that provides the printf function. 


{{ nerdy(text="

Why is printf called like that? Print is clear but what the `f` stands for?
Print formatted? I see I provide an escape character for new line `\n`, so this
is where the formatting applies?

") }}

## build/

That gonna be harder now.

**`build/Makefile`** —

Makefile has the build instructions. This is what cmake abstracts. I wrote
before few makefiles with some trivial steps how to build something. But I don't
remember it so well that I can decrypt what cmake generated.

I imagine there is lot of boilerplate at start. It has commented lines. First
one is the default target. Target is like what? Npm script, or maven block that
got executed? Then there are some properties. 

- `.PHONY` - I don't even know very well the english word. Sounds like something
  you are yapping about to the world. Is it like a description?
- `.NOTPARALLEL` - that's clear. My friend used to say "where the parallelism
begins, the healthy brain ends". Parallel build of some huge project? I guess is
for the build performance but it introduces bunch of synchronisation challenges.
Could it be similar like when we were doing the split of the JS bundles on
webdev? So some pieces that don't change can stay cached by browser, in here in
C world, they could stay cached not to save load time, but build time.
- `.SUFFIXES` - extra options? Or some suffixes to the built filenaes?
- `% : *` - VCS based implicit rules 😵‍💫. Let's give it a guess. VCS 🤔 V
Compiler S. Virtual Compiler S. Virtual Compiler Standards 🤢.
- `.SUFFIXES` - another suffixes. Well seems like you don't mind duped keys here.`.hpux_make_needs_suffix_list`. I hope `hpux` gonna get it. `H` files - aren't these some kind of meta files about C? Like TS files are for JS files? Interfaces for the implementations?
- `$(VERBOSE)` - trying to silence nested makes. Do I employ nested makes, or is
  it another convention for big boys?

Well I reached end of at least the first target. Not really sure what this
target is about, because everything I guessed to be more of a config then some
instruction what should happen.

Let's go for next `cmake_force`.

- `.PHONY` - you again. You are description, aren't you?

Then there comes that comment "Set environment variables for the build.", and
another set of keys. Are the above ones all just environment variables? That's
nasty. That's like a global variables.

- `SHELL` - well I guess what this is about. The shell that will be used to
execute commands?
- `CMAKE_COMMAND` - yay, a path to nix store. That gonna be the cmake, which is
  gonna do cmake things.
- `RM` - that is remove, but not the normal unix `rm`, but some args passed to
`cmake`.
- `EQUALS` - equals equals equals. Is `=` also a unix command?
- `CMAKE_SOURCE_DIR` - path to the root of the project. Not to the `./src`? Ok,
  whatever.
- `CMAKE_BINARY_DIR` - points to `./build`. Probably that's why I found `hello`
  executable there after build.

That one was a bit less insane, but still I am so far from grokking it.
`edit_cache` target has one line that is now intended. Does intendation carry
significance in the Makefile like in Python? It starts with `@` symbol. `@$(CMAKE_COMMAND)`. I saw the the `CMAKE_COMMAND` above. So here we refer to it. Is this normal unix way to access env variables? Let's try.

```
i:~ $ set FOO=foo
i:~ $ echo "I like to eat $(FOO)"
-bash: FOO: command not found
I like to eat
```

How could I not realize it. That is execute command notation. I use it so
often. Is the `@` a special ingredient? 

```
i:~ $ @
-bash: @: command not found
i:~ $ @$(echo "ls")
-bash: @ls: command not found
```

Well, not in bash. How about

```
i:~ $ $(echo ls) -l
total 16
drwxr-xr-x 36 primamateria users 4096 Jun  8 22:23 dev
drwxr-xr-x  2 primamateria users 4096 Mar 14  2025 Documents
drwxr-xr-x  3 primamateria users 4096 Jan 26  2025 Downloads
lrwxrwxrwx  1 primamateria users   19 Feb  9  2025 matus -> /mnt/c/Users/matus/
drwxr-xr-x  5 primamateria users 4096 Jun  2  2025 Music
```

Finally that makes sense. So then the `@` might be some special instruction for
the cmake. The rest of the command I am not going to disect. The we have simllar 
notation for other targets. The revealing part is at `help` target.

```
help:
	@echo "The following are some of the valid targets for this Makefile:"
	@echo "... all (the default if no target is provided)"
	@echo "... clean"
...
```

So probably my intuition was correct. The `@` is for cmake like `!` for neovim
command. It executes that thing that comes after.

Now let verify it with teacher claude.


{{ claude(text="

Your intuition is close, but the `@` is a **make** feature, not a cmake one.
Normally `make` echoes each recipe line to the terminal *before* running it — so
without the `@` you'd see the `echo` command itself printed, and then its output.
The `@` prefix silences that echo, so only the command's actual output shows.
That's why `@$(CMAKE_COMMAND)` just runs cmake without first printing the command
line. And yes — `.PHONY` marks targets that aren't real files, so make always
runs them instead of skipping when a file of that name happens to exist.

") }}

And how about my other assumptions. I want deeper analysis of above nooby
evaluation.

{{ claude(text="

Let me go through your guesses:

`.PHONY` — correct, already covered. Marks targets that are not real files so make always runs them.

`.NOTPARALLEL` — your instinct about parallelism is right, but the purpose is correctness, not caching. It tells make: do not run my targets concurrently even if `-j` is passed. The C equivalent of browser-cached JS chunks is actually `.o` object files — each `.c` file compiles to its own `.o`, and only the ones whose source changed get recompiled.

`.SUFFIXES` with no value — clears all of make's built-in suffix rules, giving cmake a clean slate. The second `.SUFFIXES: .hpux_make_needs_suffix_list` is a portability hack for HP-UX, an old Unix from Hewlett-Packard. Ignore it.

`% : *` — VCS here means Version Control Systems, specifically RCS and SCCS, ancient source-control tools predating git by decades. The `%` is a make wildcard (matches any string). This rule lets make check files out of those old systems. Cmake includes it for compatibility — you will never need it.

`.h` files — excellent intuition. Header files in C are very much like TypeScript declaration files: they declare function signatures, types, and constants that other files can `#include`. The `.c` file is the implementation; the `.h` file is the interface.

`$(VERBOSE).` — correct on the variable, and the `.` is a clever trick: if `VERBOSE` is empty, `$(VERBOSE).` expands to `.` which is a valid (no-op) make flag; if set, it passes the value through for verbose output.

`SHELL` — correct.

`RM` — cmake uses `cmake -E remove` rather than bare `rm` so the same generated Makefile works cross-platform, including on Windows.

`EQUALS = =` — just a variable whose value is a literal `=` sign, used in places where a bare `=` would confuse the parser.

Indentation — YES, and this is one of the most infamous gotchas in all of Unix. Recipe lines in a Makefile MUST start with a real tab character, not spaces. A single space instead of a tab produces a cryptic error. Many editors silently convert tabs to spaces and silently break your Makefile. Python's indentation rules feel lenient by comparison.

") }}

**`build/CMakeCache.txt`** —

**`build/cmake_install.cmake`** —

**`build/compile_commands.json`** —

**`build/hello`** —


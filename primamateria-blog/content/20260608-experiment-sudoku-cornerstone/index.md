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

## build/Makefile

Basic building blocks of makefile:

**Target** is a file to build.
The **recipe** line must start with real tab character.
After target **prerequisite** can be specified .
**Phony target** is not bound to a file, but it is rather an recipe for some action.

```makefile
default_target: all
.PHONY : default_target
```

This is phony target that when invoked will trigger recipe of all targets
(excluding the phony ones, I guess). `.PHONY: name_of_the_target` explicitly
denotes this target as phony target.

```makefile
# Allow only one "make -f Makefile2" at a time, but pass parallelism.
.NOTPARALLEL:
```

This belongs to the same category as `.PHONY`. It is special [build-in target name](https://www.gnu.org/software/make/manual/make.html#Special-Targets). 

```makefile
# Disable implicit rules so canonical targets will work.
.SUFFIXES:

# Disable VCS-based implicit rules.
% : %,v

# Disable VCS-based implicit rules.
% : RCS/%

# Disable VCS-based implicit rules.
% : RCS/%,v

# Disable VCS-based implicit rules.
% : SCCS/s.%

# Disable VCS-based implicit rules.
% : s.%

.SUFFIXES: .hpux_make_needs_suffix_list
```

 Suffix mechanism is old functionality that was deprecated and kept only for the
 backward compatibility. 

{{ claude(text="

`.SUFFIXES` with no value — clears all of make's built-in suffix rules, giving cmake a clean slate. The second `.SUFFIXES: .hpux_make_needs_suffix_list` is a portability hack for HP-UX, an old Unix from Hewlett-Packard. Ignore it.

") }}

```makefile
# Command-line flag to silence nested $(MAKE).
$(VERBOSE)MAKESILENT = -s

#Suppress display of executed commands.
$(VERBOSE).SILENT:
```

`$(VERBOSE)` is an expansion of variable `VERBOSE`.

This is a trick in use. When `$(VERBOSE)` evaluates to empty, then the built-in
target `.SILENT` wil activate. Since there is no prerequisite listed, it will
apply to all targets. 

Similarly, if it expands a variable `somethingMAKESILENT` is defined, which
doesn't match later references to variable `MAKESILENT`. 

```makefile
# The shell in which to execute make rules.
SHELL = /bin/sh
```

For better sandboxing, the `SHELL` variable is defined, so it won't get
inherited by from system env.

```makefile
# The CMake executable.
CMAKE_COMMAND = /nix/store/sa1yjb7xxrzcbd1bysj3r561vidfxxvb-cmake-3.29.6/bin/cmake

# The command to remove a file.
RM = /nix/store/sa1yjb7xxrzcbd1bysj3r561vidfxxvb-cmake-3.29.6/bin/cmake -E rm -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /home/primamateria/dev/experiment-sudoku

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /home/primamateria/dev/experiment-sudoku/build
```

Another set of variables. 

{{ claude(text="

`EQUALS = =` — just a variable whose value is a literal `=` sign, used in places where a bare `=` would confuse the parser.

") }}

Then there are phony targets that seems to follow some kind of template that
`cmake` provides. For example look at:

```makefile
# The main clean target
clean:
	$(MAKE) $(MAKESILENT) -f CMakeFiles/Makefile2 clean
.PHONY : clean
```

The interesting part is the revelation of another `Makefile2`. It gets complex
in the `CMakeFiles/` folder. I am not going to deep dive there. What I have
noticed that inside there it is not just project agnostic definitions. It is
really bound to the `hello.c` that was defined in the `CMakeLists.txt`. This why
we first build a building system, and only then we can build the program itself. 

{{ curious(text="

I have a feeling this is powerful tool, but with twisted architecture and
workflows that are for common web dev unintuitive anymore.

") }}

I am leaving here the `Makefile`. I think I got enough of the basics. `cmake`
provides higher set of features, and therefore complicates it from start. Next I
feel I should get little bit more familiar with the `cmake`.

## cmake

**`CMakeLists.txt`** —

This the `package.json` equivalent. It declares cmake version, and c language
version. It also declares the project name and tells to cmake which is the main
C file and what is the output executable file.
hat gonna be harder now.

Going through [tutorial](https://cmake.org/cmake/help/latest/guide/tutorial/Getting%20Started%20with%20CMake.html).

Found alternative build commands.

```sh
cmake -B build
cmake --build build
```

Bumpint up minimum cmake version to the current installed version.

```cmake
cmake_minimum_required(VERSION 3.29)
```

Extracted source to separate cmake command and added the `PRIVATE` scope to
denote that this executable is not inheritable. 

```cmake
add_executable(hello)
target_sources(hello
  PRIVATE
    src/hello.c
)
```

What inheritance exactly means
needs to be revelaed later.


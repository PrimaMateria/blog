+++
title = "LED serial and parallel circuits"
date = "2026-05-11"
slug = "led-serial-parallel-circuits"

[extra]
banner = "banner-led-circuits.png"
bannerAlt = "A surreal retro-futuristic laboratory filled with glowing LEDs wired in strange serial and parallel constellations across floating circuit boards. Tiny red diodes emit soft light through tangled copper traces suspended in an endless teal void. Hand-drawn Moebius-inspired sci-fi comic style, delicate ink linework, sparse composition, atmospheric engineering notebook aesthetic, muted pastel colors, contemplative mood."
reddithref = ""

[taxonomies]
tags = []
+++

Trying to understand voltage distribution in serial and parallel LED circuits,
and verify Kirchhoff's voltage law experimentally.

<!-- more -->
<!-- TOC -->

<div style="margin-top: 24px">
{{ resize_image_w(path="20260511-led-circuits/led-circuits.png", width=450) }}
</div>

## Study 1: serial connection of 4 LEDs

### Setup

- Source voltage:
  $$ V_{0} = 5.36V $$

- Resistor:
  $$ R = 1k\Omega $$

- Four LEDs connected in series.

### Measurements

Measured voltages:

<div>
\begin{align}
V_{R} &= 0.02V\\
V_{1} &= 1.22V\\
V_{2} &= 1.38V\\
V_{3} &= 1.37V\\
V_{4} &= 1.26V
\end{align}
</div>

### Verification using Kirchhoff's voltage law

<div>
\begin{align}
V_{0} &= V_{R} + V_{1} + V_{2} + V_{3} + V_{4} + x\\
5.36V &= 0.02V + 1.22V + 1.38V + 1.37V + 1.26V + x\\
5.36V &= 5.25V + x\\
x &= 0.11V
\end{align}
</div>

The remaining \\(0.11V\\) is likely caused by measurement error, internal
resistance, or rounding.

### Observations

The LEDs not illuminated.

This makes sense because four LEDs in series consume almost the entire source
voltage:

<div>
\begin{equation}
1.22V + 1.38V + 1.37V + 1.26V \approx 5.23V
\end{equation}
</div>

That leaves almost no voltage across the resistor, therefore the current in the
circuit becomes extremely small.

---

## Study 2: serial connection of 3 LEDs

### Setup

- Source voltage:
  $$ V_{0} = 5.36V $$

- Resistor:
  $$ R = 1k\Omega $$

- Three LEDs connected in series.

### Measurements

<div>
\begin{align}
V_{R} &= 0.24V\\
V_{1} &= 1.69V\\
V_{2} &= 1.70V\\
V_{3} &= 1.70V
\end{align}
</div>

### Verification using Kirchhoff's voltage law

<div>
\begin{align}
V_{0} &= V_{R} + V_{1} + V_{2} + V_{3} + x\\
5.36V &= 0.24V + 1.69V + 1.70V + 1.70V + x\\
5.36V &= 5.33V + x\\
x &= 0.03V
\end{align}
</div>

### Observations

The LEDs illuminated, but noticeably weaker than expected.

Compared to the previous experiment, removing one LED increased the voltage
available on the resistor:

<div>
\begin{equation}
V_{R} = 0.24V
\end{equation}
</div>

This means more current could flow through the circuit.

---

## Study 3: parallel connection of 4 LEDs

### Setup

- Source voltage:
  $$ V_{0} = 5.36V $$

- Resistor:
  $$ R = 1k\Omega $$

- Four LEDs connected in parallel.

### Measurements

<div>
\begin{align}
V_{R} &= 3.59V\\
V_{L} &= 1.76V
\end{align}
</div>

### Verification using Kirchhoff's voltage law

<div>
\begin{align}
V_{0} &= V_{R} + V_{L} + x\\
5.36V &= 3.59V + 1.76V + x\\
5.36V &= 5.35V + x\\
x &= 0.01V
\end{align}
</div>

### Observations

The LEDs illuminated brightly.

Unlike the serial circuits, each LED branch received approximately the same
forward voltage:

<div>
\begin{equation}
V_{L} \approx 1.76V
\end{equation}
</div>

A much larger voltage remained on the resistor, therefore the circuit current
was significantly higher.

---

## Conclusions

This experiment demonstrates very clearly how voltage distributes differently in
serial and parallel LED circuits.

In the serial configuration, the forward voltages of LEDs add together:

<div>
\begin{equation}
V_{LED,total} = V_{1} + V_{2} + \dots
\end{equation}
</div>

With four LEDs connected in series, their combined forward voltage nearly
reached the supply voltage. Almost no voltage remained for the resistor, so the
current became extremely small and the LEDs barely illuminated.

Reducing the number of serial LEDs improved the situation slightly because more
voltage became available on the resistor.

In the parallel configuration, every LED branch experienced approximately the
same forward voltage independently. The resistor therefore carried a much larger
voltage drop, which allowed higher current and much brighter illumination.

The measured sums of voltages matched Kirchhoff's voltage law with relatively
small errors:

<div>
\begin{equation}
\sum V \approx V_{0}
\end{equation}
</div>

The errors remained within roughly \\(0.01V\text{ -- }0.11V\\), which is
reasonable for manual measurements using a multimeter.

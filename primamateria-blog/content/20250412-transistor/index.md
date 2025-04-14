+++
title = "Saturated NPN transistor"
date = "2025-04-12"
slug = "saturated-npn-transistor"

[extra]
banner = "banner-ai-generated-images.png"
bannerAlt = "TODO"
reddithref = ""

[taxonomies]
tags = []
+++

Trying to understand how the transistor works and verify it with an experiment.

<!-- more -->
<!-- TOC -->

- what is transistor and how it works in own words
- study 1: saturated transistor
- study 2: active transistor

Study structure:
- diagram
- calculations
- simulation 
- measurement
- conclussions

- https://www.falstad.com/circuit/jsinterface.html

```
$ 1 0.000005 10.20027730826997 50 5 50 5e-11
r 848 320 848 448 0 330
v 944 320 848 320 0 0 40 5 0 0 0.5
t 784 464 848 464 0 1 0.4319691597821816 0.6646411999727295 74 default
w 848 320 688 320 0
w 688 320 688 464 0
r 688 464 784 464 0 22000
w 944 320 944 480 0
w 944 480 848 480 0
```


<div style="margin-top: 24px">
{{ resize_image_w(path="20250412-transistor/transistor-saturated.drawio.png", width=450) }}
</div>

## Calculations

Transistor common-emitter current gain
$$ \beta = 200 - 450 \\ $$

Fix forward voltage drop on base
$$ V_{BE} = 0.7V $$

Calculate following values

$$ I_{C}, I_{B}, I_{E}, V_{R_{X}}, V_{CE} = ? $$

Using Kirchoff's voltage law for the input circuit

<div>
\begin{align}   
-V_{0} + V_{R_{X}} + V_{BE} &= 0\\
V_{R_{X}} &= V_{0} - V_{BE}\\
V_{R_{X}} &= 5.4V - 0.7V\\
V_{R_{X}} &= 4.7V
\end{align}
</div>

Using Ohm's law

<div>
\begin{align}
V_{R_{X}} &= I_{B} \cdot R_{X}\\
I_{B} &= V_{R_{X}} / R_{X}\\
I_{B} &= 4.7V / 22k\Omega\\
I_{B} &= 0.21mA
\end{align}
</div>

Using common-emitter current gain

<div>
\begin{align}
I_{C} &= \beta \cdot I_{B}
\end{align}
</div>

<div>
\begin{equation}
I_{C} = \begin{cases}
 200 \cdot 0.21mA = \color{red}42mA\\
 450 \cdot 0.21mA = \color{red}94.5mA
\end{cases}
\end{equation}
</div>

Such current on the collector is impossible, because then it would mean that the
voltage on \\(R_{1}\\) is

<div>
\begin{equation}   
V_{R_{1}} = I_{C} \cdot R_{1} = \color{red}94.5mA\color{none} \cdot 33O\Omega = \color{red}31.185V
\end{equation}
</div>

This is non-sense because then between the transistor's collector and emitter
will be negative voltage.

<div>
\begin{align}   
-V_{0} + V_{R_{1}} + V_{CE} &= 0\\
V_{CE} &= V_{0} - V_{R_{1}}\\
V_{CE} &= 5.4V - \color{red}31.185V\\
V_{CE} &= \color{red}-25.785V 
\end{align}
</div>

In this case we must perform reality check

<div>
\begin{align}   
-V_{0} + V_{R_{1}} + V_{CE,sat} &= 0 \\
V_{R_{1}} &= V_{0} - V_{CE,sat}\\
V_{R_{1}} &= 5.4V - 0.1V\\
V_{R_{1}} &= 5.3V
\end{align}
</div>

And then the real current on the collector should be

<div>
\begin{align}   
V_{R_{1}} &= I_{C} \cdot R_{1} \\
I_{C} &= V_{R_{1}} / R_{1} \\
I_{C} &= 5.3V / 330\Omega \\
I_{C} &= 16.06mA
\end{align}
</div>

The transistor will saturate long before the \\(I_{C}\\) reaches \\(94.5mA\\).
In the saturation the \\(I_{C}\\) is determined by the output circuit
(\\(V_{CE}\\) and \\(V_{R_{1}}\\)), and not by \\(\beta\\). 

{{ nerdy(text="

\\(V_{CE,sat}\\) I just took from internet, but later I checked the datasheet
and for \\(I_{C} \\approx 15mA\\) it is to be around \\(100mV = 0.1V\\).

") }}


At last according to Kirchoff's current law

<div>
\begin{equation}   
I_{E} = I_{B} + I_{C} = 0.21mA + 16.06mA = 16.27mA
\end{equation}
</div>

## Study 2: active transistor

<div style="margin-top: 24px">
{{ resize_image_w(path="20250412-transistor/transistor-active.drawio.png", width=450) }}
</div>


+++
title = "NPN transistor"
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

TODO: what is transistor and how it works in own words

Please don't use this for anything serious. I am simple hobbyist with no
real-life experience, and I am not sure if my claims are correct or not. That's
why I am doing it, trying to understand. But I am lazy to study deeply and
regularly. Just having fun.

## Study 1: Saturated transistor

<div style="margin-top: 24px">
{{ resize_image_w(path="20250412-transistor/transistor-saturated.drawio.png", width=450) }}
</div>

### Calculations

Transistor common-emitter current gain
$$ \beta = 200 - 450 \\ $$

Fix forward voltage drop on base
$$ V_{BE} = 0.7V $$

Calculate following values

$$ I_{C}, I_{B}, I_{E}, V_{R_{X}}, V_{R_{1}}, V_{CE} = ? $$

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

### Measurements

 Parameter           | Expected   | Measurement 1   | Δ (%)          | Measurement 2   | Δ (%)           |
 ------------------- | ---------- | --------------- | -------        | --------------- | -------         |
 \\(V_{0}\\)         | 5.40V      | 5.25V           | 0.15V (2.78%)  | 5.38V           | 0.02V (0.37%)   |
 \\(V_{R_{X}}\\)     | 4.70V      | 4.58V           | 0.12V (2.55%)  | 4.65V           | 0.05V (1.06%)   |
 \\(V_{R_{1}}\\)     | 5.30V      | 5.20V           | 0.10V (1.89%)  | 5.26V           | 0.04V (0.75%)   |
 \\(V_{CE}\\)        | 0.1V       | 0.11V           | 0.01V (10%)    | 0.11V           | 0.01V (10%)     |
 \\(V_{BE}\\)        | 0.7V       | 0.73V           | 0.03V (4.29%)  | 0.73V           | 0.03V (4.29%)   |
 \\(I_{B}\\)         | 0.21mA     | 0.20mA          | 0.01mA (4.76%) | 0.21mA          | 0mA (0%)        |
 \\(I_{C}\\)         | 16.06mA    | 14.85mA         | 1.24mA (7.53%) | 15.48mA         | 0.58mA  (3.61%) |
 \\(I_{E}\\)         | 16.27mA    | 15.56mA         | 0.71mA (4.36%) | 15.66mA         | 0.61mA (3.75%)  |
 \\(\beta_{sat}\\)   | 55         | 74.25           | 19.25 (35%)    | 73.71           | 18.74 (35.02%)  |


{{ nerdy(text="

A note about how I figured out the expected \\(\beta_{sat} = 55\\): according to
my conversation with LLM deep in the saturated mode the value of common-emitter
current gain drops to 10-50% of gain in active mode, and I used the higher limit
since we are very generous with \\(I_{B}\\). The gain in active mode I found in
the datasheet to be approx. 110, for \\(I_{C}=16mA\\) and \\(V_{CE}=5V\\). In the
measurement the drop is 67% which is also reasonable outcome.

") }}

### Conclusions

The second measurement has more accurate source voltate, so the error region is
lower. The base current and the base-emitter voltage wer quite steady and
accurate. The common-emitter gain went wild, but I learned that this value makes
only in the active mode. I find this exercise succesful.

TODO: go again about it. Focus more about how I learned about the reality check,
and how I unerstood how hFE is not reliable for calculations.

## Study 2: active transistor

<div style="margin-top: 24px">
{{ resize_image_w(path="20250412-transistor/transistor-active.drawio.png", width=450) }}
</div>

### Calculations

Transistor common-emitter current gain
$$ \beta = 200 - 450 \\ $$

Fix forward voltage drop on base
$$ V_{BE} = 0.7V $$

Calculate following values

$$ I_{C}, I_{B}, I_{E}, V_{R_{BX}}, V_{R_{X}}, V_{R_{B}}, V_{R_{1}}, V_{CE} = ? $$

Let's start again with the input circuit. 

<div>
\begin{align}   
-V_{I} + V_{R_{BX}} + V_{BE} &= 0\\
V_{R_{BX}} &= V_{I} - V_{BE}\\
V_{R_{BX}} &= 3.3V - 0.7V\\
V_{R_{BX}} &= 2.6V
\end{align}
</div>

Now we can figure out the conventional current flowing into the base. Since we
are using potentiometer, I will calculate 2 cases: minimum potentiometer
resistance \\(0\Omega\\), and maximum resistance \\(200k\Omega\\).

<div>
\begin{align}
V_{R_{BX}} &= I_{B} \cdot R_{BX}\\
I_{B} &= V_{R_{BX}} / R_{BX}\\
I_{B} &= \begin{cases}
   \text{min: } 2.6V / 82k\Omega = 31.71\mu A \\
   \text{max: } 2.6V / 282k\Omega = 9.22\mu A \\
\end{cases}
\end{align}
</div>

Now I don't want to again rely on \\(\beta\\) even if we are aiming for an
active mode. Let's try see what we can calculate on the output circuit.

BOOKMARK: I got stuck on what to calculate next. I asked chatgpt and also
provided diagram. It did something, but just by scanning it seemed bit off. Got
tired after. 


### Measurements

Using the real potentiometer and turning it around I was able to control the
brightness of the LED, but for the measurements it was really hard to set it to
an exact value as assumed in the calculations. Therefore for the case of minimum
potentiometer resistance I just connected \\(R_{B}\\) directly to the base, and
for the case of maximum resistance I have used normal \\(200k\Omega\\) resistor.


### Conclusions

The transistor’s h<sub>FE</sub> in saturation is lower than in active mode but not zero.

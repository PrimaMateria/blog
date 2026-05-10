+++
title = "NPN transistor"
date = "2025-04-12"
slug = "saturated-npn-transistor"

[extra]
banner = "banner-npn-transistor.png"
bannerAlt = "A lone swimmer struggling through a vast surreal ocean densely filled with floating electronic components — resistors, capacitors, diodes, transistors, integrated circuits, broken circuit boards, tangled copper wires, glowing LEDs beneath the water, biomechanical debris drifting like seaweed. The swimmer is actively swimming forward, arms pulling through the water, legs kicking, bubbles and turbulence trailing behind, tangled wires resisting movement. The ocean feels calm, beautiful, immense, and difficult to cross. Moebius-inspired French sci-fi comic art, Jean Giraud style illustration, elegant European graphic novel aesthetic, delicate ink linework, airy negative space, surreal retro-futurism, contemplative atmosphere, sparse composition, muted pastel turquoise and sandy colors, hand-drawn textures, philosophical sci-fi mood, cinematic wide shot, highly detailed environment, clean visual storytelling."
reddithref = ""

[taxonomies]
tags = []
+++

Trying to understand how the transistor works and verify it with an experiment.

<!-- more -->
<!-- TOC -->

## Study 1: Saturated transistor

<div style="margin-top: 24px">
{{ resize_image_w(path="20250412-transistor/transistor-saturated.drawio.png", width=450) }}
</div>

### Calculations

Transistor common-emitter current gain
$$ \beta = 200 - 450 \\ $$

Fix forward voltage drop on base
$$ V_{BE,sat} = 0.7V $$

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

 Parameter           | Expected      | Measurement 1   | Δ (%)                  | Measurement 2   | Δ (%)                  |
 ------------------- | ----------    | --------------- | -------                | --------------- | -------                |
 \\(V_{0}\\)         | \\(5.40V\\)   | \\(5.25V\\)     | \\(0.15V~(2.78\\%) \\) | \\(5.38V\\)     | \\(0.02V~(0.37\\%)\\)  |
 \\(V_{R_{X}}\\)     | \\(4.70V\\)   | \\(4.58V\\)     | \\(0.12V~(2.55\\%)\\)  | \\(4.65V\\)     | \\(0.05V~(1.06\\%)\\)  |
 \\(V_{R_{1}}\\)     | \\(5.30V\\)   | \\(5.20V\\)     | \\(0.10V~(1.89\\%)\\)  | \\(5.26V\\)     | \\(0.04V~(0.75\\%)\\)  |
 \\(V_{CE}\\)        | \\(0.1V\\)    | \\(0.11V\\)     | \\(0.01V~(10\\%)\\)    | \\(0.11V\\)     | \\(0.01V~(10\\%)\\)    |
 \\(V_{BE}\\)        | \\(0.7V\\)    | \\(0.73V\\)     | \\(0.03V~(4.29\\%)\\)  | \\(0.73V\\)     | \\(0.03V~(4.29\\%)\\)  |
 \\(I_{B}\\)         | \\(0.21mA\\)  | \\(0.20mA\\)    | \\(0.01mA~(4.76\\%)\\) | \\(0.21mA\\)    | \\(0mA~(0\\%)\\)       |
 \\(I_{C}\\)         | \\(16.06mA\\) | \\(14.85mA\\)   | \\(1.24mA~(7.53\\%)\\) | \\(15.48mA\\)   | \\(0.58mA~(3.61\\%)\\) |
 \\(I_{E}\\)         | \\(16.27mA\\) | \\(15.56mA\\)   | \\(0.71mA~(4.36\\%)\\) | \\(15.66mA\\)   | \\(0.61mA~(3.75\\%)\\) |
 \\(\beta_{sat}\\)   | \\(55\\)      | \\(74.25\\)     | \\(19.25~(35\\%)\\)    | \\(73.71\\)     | \\(18.74~(35.02\\%)\\) |


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

The transistor’s h<sub>FE</sub> in saturation is lower than in active mode but not zero.

## Study 2: active transistor

<div style="margin-top: 24px">
{{ resize_image_w(path="20250412-transistor/transistor-active.drawio.png", width=450) }}
</div>

### Calculations

Transistor common-emitter current gain
$$ \beta = 200 - 450 \\ $$

Fix forward voltage drop on base
$$ V_{BE,on} = 0.66V $$

Calculate following values

$$ I_{C}, I_{B}, I_{E}, V_{R_{BX}}, V_{R_{X}}, V_{R_{B}}, V_{R_{1}}, V_{CE} = ? $$

Let's start again with the input circuit. 

<div>
\begin{align}   
-V_{I} + V_{R_{BX}} + V_{BE} &= 0\\
V_{R_{BX}} &= V_{I} - V_{BE}\\
V_{R_{BX}} &= 3.3V - 0.66V\\
V_{R_{BX}} &= 2.64V
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
   \text{min: } 2.64V / 82k\Omega = 32.2\mu A \\
   \text{max: } 2.64V / 282k\Omega = 9.36\mu A \\
\end{cases}
\end{align}
</div>

Now I didn't want to again rely on \\(\beta\\) even if we are aiming for an
active mode. But I don't know any other way how to find anything without
employing some wild assumpted values that LLM suggest, even I didn't find or
extrapolate them myself from the datasheet. 

Anyway here is what I have tried: I found in LED datasheet that \\(V_{L}\\) will
be around \\(2.1V\\). The using Kirchoff's volate law on the output circuit.

<div>
\begin{align}
-V_{0} + V_{R_{1}} + V_{L} + V_{CE} &= 0 \\
-5.4V + I_{C} \cdot 33O\Omega + 2.1V + V_{CE} &= 0
\end{align}
</div>

There are two unknowns - \\(I_{C}\\) and \\(V_{CE}\\).

Let's imagine \\(V_{CE}\\) is would be not there. Then

<div>
\begin{align}
-5.4V + I_{C} \cdot 33O\Omega + 2.1V &= 0 \\
I_{C} \cdot 330\Omega &= 5.4V - 2.1V \\
I_{C} &= 3.3V / 330\Omega \\
I_{C} &= 10mA
\end{align}
</div>

If \\(V_{CE}>0V\\), then \\(I_{C}<10mA\\).

Next imagine \\(V_{CE}\\) is there, but the transistor is saturated. Then

<div>
\begin{align}
-5.4V + I_{C} \cdot 33O\Omega + 2.1V + 0.1V &= 0 \\
I_{C} \cdot 330\Omega &= 5.4V - 2.1V - 0.1V \\
I_{C} &= 3.2V / 330\Omega \\
I_{C} &= 9.6mA
\end{align}
</div>

Saturated transistor's \\(V_{CE}\\) should be less that active transistor's
\\(V_{CE}\\). So the \\(I_{C} < 9.6mA\\). That din't help a lot.

So I am giving up. Let's use \\(\beta\\). Now, in the active mode, it should be
in the range of the values stated in the datasheet: \\(200\text{ -- }450\\).


<div>
\begin{equation}
I_{C} = \beta \cdot I_{B} = \begin{cases}
 \text{min: } \begin{cases}
   \beta = 200: 200 \cdot 32.2\mu A = 6.44mA \\ 
   \beta = 450: 450 \cdot 32.2\mu A = 14.49mA 
 \end{cases} \\
 \text{max: } \begin{cases}
   \beta = 200: 200 \cdot 9.36\mu A = 1.87mA \\
   \beta = 450: 450 \cdot 9.36\mu A = 4.21mA 
 \end{cases}
\end{cases}
\end{equation}
</div> 

And then

<div>
\begin{equation}
\begin{split}
6.44mA \leq I_{C, min} \leq 14.49mA\\  
1.87mA \leq I_{C, max} \leq 4.21mA
\end{split}
\end{equation}
</div>

It seems that \\(I_{C,min}\\) overshot the previous established condition
\\(I_{C}<9.6mA\\). 

{{ nerdy(text="

So it means that even with \\(R_{B}=82k\Omega\\) that I though of already very
high, we might saturate the transistor or at least get close to it.  

") }}

Let's use this correction and assume:

<div>
\begin{equation}
\begin{split}
6.44mA \leq I_{C, min} \leq 9.6mA\\  
1.87mA \leq I_{C, max} \leq 4.21mA
\end{split}
\end{equation}
</div>

Now I need to calculate \\(V_{R_{1}}\\).

<div>
\begin{equation}
V_{R_{1}} = I_{C} \cdot R_{1} = \begin{cases}
 \text{min: } \begin{cases}
   \beta = 200: 6.44mA \cdot 330\Omega = 2.13V \\ 
   \beta = 450: 9.6mA \cdot 330\Omega = 3.17V
 \end{cases} \\
 \text{max: } \begin{cases}
   \beta = 200: 1.87mA \cdot 330\Omega = 0.62V \\
   \beta = 450: 4.21mA \cdot 330\Omega = 1.39V 
 \end{cases}
\end{cases}
\end{equation}
</div> 

<div>
\begin{equation}
\begin{split}
2.13V \leq V_{R_{1}, min} \leq 3.17V\\  
0.62V \leq V_{R_{1}, max} \leq 1.39V
\end{split}
\end{equation}
</div>

And now \\(V_{CE}\\).

<div>
\begin{align}
0 &= -V_{0} + V_{R_{1}} + V_{L} + V_{CE} \\
V_{CE} &= V_{0} - V_{L} - V_{R_{1}} \\
V_{CE} &= 5.4V - 2.1V - V_{R_{1}} \\
V_{CE} &= 3.3V - V_{R_{1}} \\
V_{CE} &= \begin{cases}
 \text{min: } \begin{cases}
   \beta = 200: 3.3V - 2.13V = 1.17V \\ 
   \beta = 450: 3.3V - 3.17V = 0.13V
 \end{cases} \\
 \text{max: } \begin{cases}
   \beta = 200: 3.3V - 0.62V = 2.68V \\
   \beta = 450: 3.3V - 1.39V = 1.91V 
 \end{cases}
\end{cases}
\end{align}
</div>



I keep on assuming that \\(V_{L}=2.1V\\) is constant. Probably that is not entirely correct. 

### Measurements

Using the real potentiometer and turning it around I was able to control the
brightness of the LED, but for the measurements it was really hard to set it to
an exact value as assumed in the calculations. Therefore for the case of minimum
potentiometer resistance I just connected \\(R_{B}\\) directly to the base, and
for the case of maximum resistance I have used normal \\(200k\Omega\\) resistor.


{{ nerdy(text="

I started to write this blog post, but just before finish we entered a live phase
in which blog writing didn't come under the consideration. After some time I
wanted to finish, but when now I look on the measurements write by hand in my
notice book ... well, I guess I need to practice my recording skill. I can't
decode it anymore.

") }}



### Conclusions

For the min resistance on base, where potentiometer was supposed to be giving
\\(0\Omega\\) I assumed the the transistor to be still in active mode, but I
think I have already entered saturation. (not sure)

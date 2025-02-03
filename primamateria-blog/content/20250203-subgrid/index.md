+++
title = "CSS Subgrids"
date = "2025-02-03"
slug = "css-subgrids"

[extra]
banner = "banner-subgrid.png"
bannerAlt = "Mobius comic book style. Tensegrity sculpture floating above the calm lake. Oddly the lake is inside the room, in the middle of the modern IT office that is filled with ferns. The sculpture is consist of different blocks being in constant and balanced pull against each other."
reddithref = ""

[taxonomies]
tags = ["webdev", "css"]
+++

<script async src="https://public.codepenassets.com/embed/index.js"></script>

Here are a few examples of CSS subgrid usage that I find very useful: subgrid with a custom gap, and auto-fitted and auto-filled subgrids set in minmaxed columns and automatically wrapping the rows.

<!-- more -->
<!-- TOC -->

## Simple example

Subgrids are grids in which cells are placed within the cells of the parent grid. This allows for alignment across separate components.


<p class="codepen" data-height="500" data-theme-id="light" data-default-tab="css,result" data-slug-hash="jENoWQR" data-pen-title="subgrid-simple-example" data-user="PrimaMateria" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/PrimaMateria/pen/jENoWQR">
  subgrid-simple-example</a> by Matus Benko (<a href="https://codepen.io/PrimaMateria">@PrimaMateria</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The parent grid is 3x3. Three items are placed in each column, with each item
spanning three rows. Subitems, which are the child divs of the items, are placed
in the cells of the parent grid and are aligned across the boundaries of their
container items.

## Subgrid gap

Subgrids can have their own gap.

<p class="codepen" data-height="500" data-theme-id="light" data-default-tab="css,result" data-slug-hash="RNbmaVe" data-pen-title="subgrid-simple-example" data-user="PrimaMateria" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/PrimaMateria/pen/RNbmaVe">
  subgrid-simple-example</a> by Matus Benko (<a href="https://codepen.io/PrimaMateria">@PrimaMateria</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The parent grid has a 16px gap. The item has a reduced gap of 4px. The first and second items were joined to demonstrate that both the parent grid's gaps - between columns and between rows - are overridden.

{{ nerdy(text="

Each subgrid can have a different gap, although in the end, the cells look oddly
misaligned.

") }}

## Subgrid auto-fit

This is very useful for rendering dynamic count of items.

<p class="codepen" data-height="500" data-theme-id="light" data-default-tab="css,result" data-slug-hash="EaYzymd" data-pen-title="subgrid-autofit" data-user="PrimaMateria" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/PrimaMateria/pen/EaYzymd">
  subgrid-autofit</a> by Matus Benko (<a href="https://codepen.io/PrimaMateria">@PrimaMateria</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The parent grid's column width is calculated to be at least 100px or 1 fraction
of the available space. When the first item is added, the column expands to 1fr.
If the number of items increases and would cause the column to resize to less
than the minimum 100px, the item will instead be placed in the next available
row - in this case, row 4, as the first 3 rows are already spanned by items.


{{ curious(text="

I must confess that before I realized subgrid items can be dynamically wrapped
to multiple rows and don't always need to be placed in a predefined parent grid
cell, I used a lot of JavaScript code to measure available space and calculate
the number of columns, as well as the exact row and column number for each item.
Whoops.

") }}

## Subgrid auto-fill

Auto-fill works the same way as auto-fit works. I am including this example just
for a nice visualization of the difference between these two.

<p class="codepen" data-height="500" data-theme-id="light" data-default-tab="css,result" data-slug-hash="emOadOx" data-pen-title="subgrid-autofit" data-user="PrimaMateria" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/PrimaMateria/pen/emOadOx">
  subgrid-autofit</a> by Matus Benko (<a href="https://codepen.io/PrimaMateria">@PrimaMateria</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

When using auto-fill, the grid will also include empty columns. This ensures
that the column size remains consistent from the beginning, just like in a fully
filled row.

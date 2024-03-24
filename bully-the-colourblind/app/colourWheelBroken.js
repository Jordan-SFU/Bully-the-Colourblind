'use client'

import React, { createContext, useEffect, useState } from 'react';
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { identifyColour } from '../utils/colorIdentify';
import { colourCorrectness } from '@/utils/colourCorrectness';

const barFatness = 20;
let colorWheelColor;
let selectedColour = '#808080';
let brightnessColour;
let colorCircleX
let colorCircleY
let barFillColor = "#808080";
let drawPicker = false;
let drawRectPicker = false;
let valuePickerPos = 0;
let rectTopDist;
let rectBottomDist;
let mouseDraggedBar = false;
let didTheRandomColorGetChosenYetOrNot = false;

const r = Math.sqrt(Math.random()) * 200;
const thetaILovePolarCoordinates = Math.random() * 2 * Math.PI;
const xBar = Math.random() * 20 + 280 - (barFatness / 2);
const yBar = Math.random() * 400;
const xCircle = r * Math.cos(thetaILovePolarCoordinates);
const yCircle = r * Math.sin(thetaILovePolarCoordinates);

let targetName;
let targetColour;

let finalColour = 'ffffff';

let image;
let font;

const black = "#000000";
const white = "#ffffff";

function isInsideColorWheel(p5) {
  let dist = p5.dist(p5.width / 2, p5.height / 2, p5.mouseX, p5.mouseY);
  if (dist < 165) {
    return true;
  }
  return false;

}
//return 0 for top, 1 for the bar, 2 for bottom
function isInsideBar(p5) {
  if (rectTopDist + 2 < barFatness / 2 && (p5.mouseY + 200 - (p5.height / 2)) < 0) {
    return true;
  }
  if (rectBottomDist < barFatness / 2 && (p5.mouseY + 200 - (p5.height / 2)) > 400) {
    return true;
  }
  if (p5.mouseX < (p5.width / 2) - (280 - barFatness / 2) && p5.mouseX > (p5.width / 2) - (280 + barFatness / 2) && (p5.mouseY + 200 - (p5.height / 2)) > 0 && (p5.mouseY + 200 - (p5.height / 2)) < 400) {
    return true;
  }
  return false;
}
//Draw a color wheel
function drawColorWheel(p5) {
  // draw the colour wheel in public/ColourWheel.png
  p5.imageMode(p5.CENTER);
  p5.image(image, 0, 0, 355, 355);
}

//Draw brightness slider
function drawBrightnessSlider(p5, colourToDrawIn) {
  const height = 400 / 255;

  //draw top and bottom circles of the bar
  p5.fill(white);
  p5.ellipse(-280, height - 200, barFatness);
  p5.fill(black);
  p5.ellipse(-280, 255 * height - 200, barFatness);

  //draw the rectangle
  p5.rectMode(p5.CENTER);
  for (let i = 0; i < 255; i++) {
    if (i < 128) {
      p5.fill(p5.lerpColor(p5.color(white), p5.color(colourToDrawIn), i / 127));
    } else if (i > 128) {
      p5.fill(p5.lerpColor(p5.color(colourToDrawIn), p5.color(black), (i - 128) / 127));
    } else {
      p5.fill(colourToDrawIn);
    }
    p5.rect(-280, height * i - 200, barFatness, height);
  }
  p5.rectMode(p5.CORNER);
}
//draw the color picker circle
// TODO: dont reset it you coward
function updateValuePicker(updateColor) {
  // if (p5.alpha(updateColor) != 0){
  //   console.log("hi guys its me hi guys");
  barFillColor = updateColor;
  valuePickerPos = .5;
  //barFillColor = p5.get(-280, valuePickerPos);
}

function drawValuePicker(p5) {
  p5.strokeWeight(0);
  rectTopDist = p5.dist((p5.width / 2) - 280, (p5.height / 2) - 200, p5.mouseX, p5.mouseY);
  rectBottomDist = p5.dist((p5.width / 2) - 280, (p5.height / 2) + 200, p5.mouseX, p5.mouseY);
  let mouseColor = p5.get(p5.mouseX, p5.mouseY);
  if (mouseDraggedBar) {
    if ((p5.mouseY + 200 - (p5.height / 2)) < 0) {
      // p5.stroke(0);
      drawRectPicker = true;
      valuePickerPos = -200;
      //if (p5.alpha(mouseColor != 0)){
        barFillColor = mouseColor;  
      //}
    }
    if ((p5.mouseY + 200 - (p5.height / 2)) > 400) {
      // p5.stroke(255);
      drawRectPicker = true;
      valuePickerPos = 200;
      //if (p5.alpha(mouseColor != 0)){
        barFillColor = mouseColor;
      //}
    if ((p5.mouseY + 200 - (p5.height / 2)) > 0 && (p5.mouseY + 200 - (p5.height / 2)) < 400) {
      // p5.stroke(p5.lerpColor(p5.color(black), p5.color(white), (p5.mouseY+200-(p5.height / 2))/400));
      drawRectPicker = true;
      valuePickerPos = p5.mouseY - 300;
      //if (p5.alpha(mouseColor != 0)){
        barFillColor = mouseColor;
      //}
    }

  }
  p5.fill(barFillColor);
  p5.ellipse(-280, valuePickerPos, 40, 40);
  return barFillColor;
  }
}
function drawCirclePicker(p5, colorForCircle){
  p5.strokeWeight(1);
  p5.stroke(0);
  p5.fill(colorForCircle);
  colorCircleX = p5.mouseX - p5.width / 2;
  colorCircleY = p5.mouseY - p5.height / 2;
  drawPicker = true;

  if (drawPicker) {
    p5.ellipse(colorCircleX, colorCircleY, 30, 30);
  }

}
function drawFinalColour(p5, colour) {
  p5.fill(colour == undefined ? '#ffffff' : colour);
  p5.rectMode(p5.CENTER);
  p5.noStroke();
  p5.rect(0, p5.height / 2.5, 100, 40, 25);
}

const sketch = (p5) => {
  
  p5.preload = () => {
    image = p5.loadImage('/ColourWheel.png');
    font = p5.loadFont('/arial.ttf');
  };

  p5.setup = () => {
    p5.createCanvas(600, 600, p5.WEBGL);
    p5.smooth();
    colorCircleX = p5.mouseX - p5.width / 2;
    colorCircleY = p5.mouseY - p5.width / 2;

    drawColorWheel(p5);

    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textFont(font, 20);
  };

  p5.draw = () => {

    p5.background(20, 200, 200, 0);
    p5.noStroke();


    // draw a colour wheel using the rainbow gradient and blending between the colours
    drawColorWheel(p5);

    // get the colour at the mouse position
    if (isInsideColorWheel) {
      colorWheelColor = p5.get(p5.mouseX, p5.mouseY);
    }

    // draw a slider for brightnes
    drawBrightnessSlider(p5, colorWheelColor);
    finalColour = drawValuePicker(p5);
    // draw a circle at the mouse position with the colour
    //TODO: make the circle project onto the edges if mouse is too far for a small amount of time
    if (isInsideColorWheel(p5)){
      drawCirclePicker(p5, colorWheelColor);
    }
    drawFinalColour(p5, finalColour);
    if (!didTheRandomColorGetChosenYetOrNot) {
      targetColour = p5.get(xCircle + (p5.width / 2), yCircle + (p5.height / 2));

      targetColour = p5.color(targetColour);

      // await target Name
      identifyColour(targetColour).then(data => {
        targetName = data.name.value;
      });

      if (targetName !== undefined && targetName !== 'Black') {
        console.log(targetColour.levels);
        console.log(targetName);
        didTheRandomColorGetChosenYetOrNot = true;
      }
    }

    p5.text("Where is the colour " + '"' +  targetName + '"?', 0, -270);
  }

  //selecting color
  //BUG: its selecting a colour outside of the circle why wtf
  p5.mousePressed = () => {
    //bjorns function
    //DO NOT TOUCH
    //console.log(p5.dist(p5.width / 2, p5.height / 2, p5.mouseX, p5.mouseY));
    //dont touch it im warning you
    //i have 3 monitors on this console.log
    //dont even thihnk about thinking about trying

    let dist = p5.dist(p5.width / 2, p5.height / 2, p5.mouseX, p5.mouseY);
    if (dist < 200) {
      selectedColour = colorWheelColor;

      selectedColour = p5.color(selectedColour);

      finalColour = selectedColour;
      updateValuePicker(finalColour);
      drawBrightnessSlider(p5, finalColour);
    }
  }

  p5.mouseDragged = () => {
    if (isInsideBar(p5)) {
      console.log("dragin deez");
      mouseDraggedBar = true;
    }
  }
  p5.mouseReleased = () => {
    console.log("releasin deez");
    mouseDraggedBar = false;
  }
};

export default function ColourWheelBroken() {
  return (
    <div>
      <NextReactP5Wrapper sketch={(p5) => sketch(p5)} />
      <div className='GuessColour'>
        <button className='Button' onClick={() => colourCorrectness(finalColour.levels, targetColour.levels)}>Guess</button>
      </div>
    </div>
  );
}
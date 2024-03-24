'use client'

import React, { createContext, useEffect, useState } from 'react';
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import { identifyColour } from '../utils/colorIdentify';
import { colourCorrectness } from '@/utils/colourCorrectness';
import styles from '../app/colourWheel.module.css';
//import handler from './server.js';

const barFatness = 20;
let colorWheelColor = '#808080';
let selectedColour = '#808080';
let brightnessColour;
let colorCircleX = 300;
let colorCircleY = 300;
let barFillColor = "#808080";
let drawPicker = false;
let drawRectPicker = false;
let valuePickerPos = 0;
let rectTopDist;
let rectBottomDist;
let dragBar = false;
let dragCircle = false;
let clickBar = false;
let clickTheCircles = false;
let xPos = 300;
let yPos = 300;

let finalColour;

let image;

const black = "#000000";
const white = "#ffffff";

let radius = 0;
let slider;
let angle;
let correctSlider;

let hasGuessed = false;
let correctnessValue;

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
function drawBrightnessSlider(p5, colorForBrightnessSlider) {
  const height = 400 / 255;
  p5.strokeWeight(0);
  //draw top and bottom circles of the bar
  p5.fill(255, 255, 255);
  p5.ellipse(-280, height - 200, barFatness);
  p5.fill(0, 0, 0);
  p5.ellipse(-280, 255 * height - 200, barFatness);

  //draw the rectangle
  p5.rectMode(p5.CENTER);
  for (let i = 0; i < 255; i++) {
    if (i < 128) {
      p5.fill(p5.lerpColor(p5.color(white), p5.color(colorWheelColor), i / 127));
    } else if (i > 128) {
      p5.fill(p5.lerpColor(p5.color(colorWheelColor), p5.color(black), (i - 128) / 127));
    } else {
      p5.fill(colorWheelColor);
    }
    p5.rect(-280, height * i - 200, barFatness, height);
  }
  p5.rectMode(p5.CORNER);
}


//draw the color picker circle
// TODO;
function updateValuePicker(p5, updateColor) {
  // p5.colorMode(p5.HSB);
  barFillColor = updateColor;
  // valuePickerPos = .5;
  drawBrightnessSlider(p5);
  barFillColor = p5.get(20, valuePickerPos + (p5.height / 2));
  // barFillColor = updateColor;
  p5.colorMode(p5.RGB);
}

function drawValuePicker(p5) {
  p5.strokeWeight(0);
  rectTopDist = p5.dist((p5.width / 2) - 280, (p5.height / 2) - 200, p5.mouseX, p5.mouseY);
  rectBottomDist = p5.dist((p5.width / 2) - 280, (p5.height / 2) + 200, p5.mouseX, p5.mouseY);
  if (dragBar || clickBar) {
    if ((p5.mouseY + 200 - (p5.height / 2)) < 0) {
      // p5.stroke(0);
      drawRectPicker = true;
      valuePickerPos = -200;
      barFillColor = white;
    }
    if ((p5.mouseY + 200 - (p5.height / 2)) > 400) {
      // p5.stroke(255);
      drawRectPicker = true;
      valuePickerPos = 200;
      barFillColor = black;
    }
    if ((p5.mouseY + 200 - (p5.height / 2)) > 0 && (p5.mouseY + 200 - (p5.height / 2)) < 400) {
      // p5.stroke(p5.lerpColor(p5.color(black), p5.color(white), (p5.mouseY+200-(p5.height / 2))/400));
      drawRectPicker = true;
      valuePickerPos = p5.mouseY - 300;
      barFillColor = p5.get(20, p5.mouseY);
    }
  }
  if (dragCircle || clickTheCircles) {
    drawRectPicker = true;
    barFillColor = p5.get(20, valuePickerPos + (p5.height / 2));
  }

  p5.fill(barFillColor);
  p5.ellipse(-280, valuePickerPos, 40, 40);
  return barFillColor;

}

function drawCirclePicker(p5) {
  p5.strokeWeight(1);
  p5.stroke(0);
  if (dragCircle || clickTheCircles) {
    xPos = p5.mouseX - p5.width / 2;
    yPos = p5.mouseY - p5.height / 2;
    let theta = Math.atan(yPos / xPos);
    if (isInsideColorWheel(p5)) {

      colorCircleX = xPos;
      colorCircleY = yPos;
    } else {
      if (xPos < 0) {
        colorCircleX = -160 * Math.cos(theta);
        colorCircleY = -160 * Math.sin(theta);
      } else {
        colorCircleX = 160 * Math.cos(theta);
        colorCircleY = 160 * Math.sin(theta);
      }
    }
  }
  // else{
  //   colorCircleX = 0;
  //   colorCircleY = 0;
  // }
  let colorOfCircle = p5.get(colorCircleX + (p5.width / 2), colorCircleY + (p5.height / 2));
  p5.fill(colorOfCircle);
  p5.ellipse(colorCircleX, colorCircleY, 30, 30);
  return colorOfCircle;
}
function drawFinalColour(p5, colour) {
  p5.fill(colour);
  p5.rectMode(p5.CENTER);
  p5.noStroke();
  p5.rect(0, p5.height / 2.5, 250, 40, 25);
}

const sketch = (p5, targetColour) => {

  p5.setup = () => {
    p5.createCanvas(600, 600, p5.WEBGL);
    p5.smooth();
    colorCircleX = 0;
    colorCircleY = 0;

    image = p5.loadImage('/ColourWheel.png');


  };

  p5.draw = () => {

    p5.background(20, 200, 200, 0);
    p5.noStroke();


    // draw a colour wheel using the rainbow gradient and blending between the colours
    drawColorWheel(p5);

    drawCirclePicker(p5);

    // get the colour at the mouse position
    // if (isInsideColorWheel) {
    //   colorWheelColor = p5.get(p5.mouseX, p5.mouseY);
    // }

    // draw a slider for brightness
    drawBrightnessSlider(p5)
    finalColour = drawValuePicker(p5);

    // draw a circle at the mouse position with the colour
    //TODO: make the circle project onto the edges if mouse is too far for a small amount of time

    drawFinalColour(p5, finalColour);

    // draw an ellipse at the radius and angle on the wheel
    if (hasGuessed) {
      if (radius != 0 || radius != NaN) {
        p5.fill(255, 255, 255);
        p5.ellipse(radius * Math.cos(angle), radius * Math.sin(angle), 5, 5);

        // draw an ellipse on the slider
        p5.fill(255, 255, 255);
        p5.ellipse(-280, slider - 200, 5, 5);
        correctSlider = slider-200;
        p5.stroke(0);
        p5.strokeWeight(1);

        p5.line(colorCircleX, colorCircleY, radius * Math.cos(angle), radius * Math.sin(angle));

      }
    }
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
    if (isInsideBar(p5)) {
      clickBar = true;
    }
    if (isInsideColorWheel(p5)) {
      clickTheCircles = true;
    }
    colorWheelColor = drawCirclePicker(p5);
    let dist = p5.dist(p5.width / 2, p5.height / 2, p5.mouseX, p5.mouseY);
    if (dist < 200) {
      selectedColour = colorWheelColor;

      finalColour = selectedColour;
      updateValuePicker(p5, finalColour);
      drawBrightnessSlider(p5, finalColour);
    }
  }
  p5.mouseDragged = () => {
    colorWheelColor = drawCirclePicker(p5);
    if (isInsideBar(p5) && !dragCircle) {
      dragBar = true;
    }
    if (isInsideColorWheel(p5) && !dragBar) {
      dragCircle = true;
    }
  }
  p5.mouseReleased = () => {
    dragBar = false;
    dragCircle = false;
    clickBar = false;
    clickTheCircles = false;
    // cconvert final colour to hsv and print
    let hsv = p5.color(finalColour).toString('hsv');
    //console.log(hsv);
  }
};

const handleGuess = async (targetColour) => {
  // Assuming finalColour contains the guess color
  const guessColor = finalColour.toString().split(',').map(component => parseInt(component));

  // Assuming targetColour contains the target color
  const targetColor = targetColour.split(',').map(component => parseInt(component));

  // Calculate the correctness of the guess
  correctnessValue = colourCorrectness([colorCircleX, colorCircleY, valuePickerPos], [radius, angle, correctSlider]);

  hasGuessed = true;
};

export default function ColourWheel() {

  const [targetName, setTargetName] = useState('');
  const [targetColour, setTargetColour] = useState('');

  let count = 0;

  useEffect(() => {
    const setTargetNameFromColor = async () => {
      if (count == 0) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);

        const rgb = `${r},${g},${b}`;
        setTargetColour(rgb);
        const data = await identifyColour(rgb);
        setTargetName(data.name.value);

        let hsv = data.hsl;

        radius = 160 * hsv.s / 100;
        slider = 400 - (hsv.l / 100 * 400);
        angle = hsv.h / 360 * 2 * Math.PI;

      }
    };
    setTargetNameFromColor();
    count++;

  }, []);

  return (
    <div className='ColourWheel'>
      <div className='ColourName'>
      <p>Where is the colour "{targetName}"?</p>
      </div>
      <div className='Canvas'>
        <NextReactP5Wrapper sketch={(p5) => sketch(p5, targetColour.split(',').map(component => parseInt(component)))} />
      </div>
      <div className='GuessColour'>
        <button className='Button' onClick={() => handleGuess(targetColour)}>Guess</button>
      </div>
    </div>
  );
}
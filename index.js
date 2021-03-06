'use strict';

const util    = require('util');
const process = require('process');
const asciimo = require('asciimo').Figlet;
const moment  = require('moment');
const clear   = require('clear');
const colors  = require('colors');

const REFRESH_RATE = 250; // ms

let WIDTH   = process.stdout.columns;
let HEIGHT  = process.stdout.rows;

process.stdout.on('resize', () => {
  WIDTH = process.stdout.columns;
  HEIGHT = process.stdout.rows;
});

const formatTime = (a,b) => {
  const t = moment(b.diff(a));

  return t.format('mm:ss');
};

const render = (time, color) => {
  clear();
  asciimo.write(time, FONT, (art) => {
    clear();
    process.stdout.write('\r\n');
    util.puts(color === 'red' ? art.red : art.green); 
    asciimo.write(time, FONT, (art) => {

    });
  });
};

const parseArgs = (idx, def) => {
  if (process.argv.length <= (2 + idx)) {
    return def;
  }

  return process.argv[2 + idx];
};

// -----------------------------------------------------

let POMODORO  = parseArgs(0, 25); // m
let BREAK     = parseArgs(1, 5);  // m
let FONT = parseArgs(2, 'Colossal');

// -----------------------------------------------------
let pend = moment().add(POMODORO, 'm');
let bend = moment().add(POMODORO + BREAK, 'm');

const timer = setInterval(() => {
  const now = moment();

  if (now.isBefore(pend)) {
    render(
        formatTime(now, pend),
        'red'
    );
  } else if(now.isBefore(bend)) {
    render(
        formatTime(now, bend),
        'green'
    );
  } else {
    pend = moment().add(POMODORO, 'm');
    bend = moment().add(POMODORO + BREAK, 'm'); 
  }
}, REFRESH_RATE);

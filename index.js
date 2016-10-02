'use strict';

const util    = require('util');
const process = require('process');
const asciimo = require('asciimo').Figlet;
const moment  = require('moment');
const clear   = require('clear');
const colors  = require('colors');
const notifier = require('node-notifier');

const REFRESH_RATE = 250; // ms

let WIDTH   = process.stdout.columns;
let HEIGHT  = process.stdout.rows;

process.stdout.on('resize', () => {
  WIDTH = process.stdout.columns;
  HEIGHT = process.stdout.rows;
});

const formatTime = (a, b) => {
  const time = moment(b.diff(a));

  return time.format('mm:ss');
};

const render = (time, color) => {
  clear();
  asciimo.write(time, FONT, (art) => {
    clear();
    process.stdout.write('\r\n');
    util.puts(color === 'red' ? art.red : art.green);
    asciimo.write(time, FONT, (art) => {});
  });
};

const parseArgs = (idx, def) => {
  if (process.argv.length <= (2 + idx)) {
    return def;
  }

  return process.argv[2 + idx];
};

// -----------------------------------------------------

let POMODORO   = Number(parseArgs(0, 25)); // pomodoro
let BREAK      = Number(parseArgs(1, 5));  // break
let LONG_BREAK = Number(parseArgs(2, 30)); // long break
let FONT       = parseArgs(3, 'Colossal');

// -----------------------------------------------------
let pomodoroEnd, breakEnd, pomodorosStarted = 0;

const buildNotification = message => {
  return {
    title: 'POMOCO',
    message
  };
};

const startPomodoro = () => {
  pomodorosStarted++;
  pomodoroEnd = moment().add(POMODORO, 'm');

  if (pomodorosStarted % 4 !== 0) {
    breakEnd = moment().add(POMODORO + BREAK, 'm');
  } else {
    breakEnd = moment().add(POMODORO + LONG_BREAK, 'm');
  }

  const now = moment();
  setTimeout(() => notifier.notify(buildNotification('end of POMODORO\nstarting BREAK')), pomodoroEnd.diff(now)).unref();
  setTimeout(() => notifier.notify(buildNotification('end of BREAK\nstarting POMODORO')), breakEnd.diff(now)).unref();
}

startPomodoro();

const timer = setInterval(() => {
  const now = moment();

  if (now.isBefore(pomodoroEnd)) {
    render(
        formatTime(now, pomodoroEnd),
        'red'
    );
  } else if(now.isBefore(breakEnd)) {
    render(
        formatTime(now, breakEnd),
        'green'
    );
  } else {
    startPomodoro();
  }
}, REFRESH_RATE);

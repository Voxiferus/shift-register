const leds = require("./modules/indicate.js");
const indicator = new leds("S17",4);

indicator.indicate(22.24);
const gpio = require("@tibbo-tps/gpio");
const lightSensor = require("@tibbo-tps/tibbit-28").init("S25");

// Set up indicator states matrix
const digits = {
    1: [0,1,0,0,1,0,0,0],
    2: [0,0,1,1,1,1,0,1],
    3: [0,1,1,0,1,1,0,1],
    4: [0,1,0,0,1,0,1,1],
    5: [0,1,1,0,0,1,1,1],
    6: [0,1,1,1,0,1,1,1],
    7: [0,1,0,0,1,1,0,0],
    8: [0,1,1,1,1,1,1,1],
    9: [0,1,1,0,1,1,1,1],
    0: [0,1,1,1,1,1,1,0],
    N: [0,0,0,0,0,0,0,1] // Dash symbol
};

// Pad function crops array or adds leading zeros
Array.prototype.pad = function(count){
    var list = this.slice(-count);
    while(list.length < count){
        list.unshift(0)
    }

    return list;
};

// Set up pins
var dataPin = gpio.init("S17A");
dataPin.setDirection("output");
dataPin.setValue(0);

var clockPin = gpio.init("S17B");
clockPin.setDirection("output");
clockPin.setValue(0);

var latchPin = gpio.init("S17C");
latchPin.setDirection("output");
latchPin.setValue(0);

const indicate = function(number){

    // Converts number to array of signals to be send
    const numberToSignals = function(number){
        return number
            .toString()
            .split("")
            .pad(3)
            .reverse()
            .map(function(value){
                return digits[value] === undefined ? digits["N"] : digits[value];
            })
            .reduce(function(previous, current, index, array){
                return previous.concat(current)
            });
    };

    var signals = numberToSignals(number);

    // set ST_CP to LOW
    latchPin.setValue(0);

    signals.forEach(function(value){
        // set DS to value to be pushed
        dataPin.setValue(value);

        // set SH_CP to HIGH and then to LOW
        clockPin.setValue(1);
        clockPin.setValue(0);
    });

    // then all signals are sent put latch to HIGH
    latchPin.setValue(1);
};

setInterval(function(){
    try{
        // read illumination value from the sensor
        var illumination = lightSensor.getData().illumination;
        illumination = illumination > 999 ? 999 : illumination;
    }catch(e){
        // if reading error, set value to indicated to "---"
        illumination = "NNN";
    }

    // display illumination value on the indicators
    indicate(illumination);
},1000);

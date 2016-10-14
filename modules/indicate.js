const gpio = require("@tibbo-tps/gpio");

class indicator {
    constructor(socket, length){
        // Pad function crops array or adds leading zeros
        Array.prototype.pad = function(count){
            var list = this.slice(-count);
            while(list.length < count){
                list.unshift(0)
            }

            return list;
        };

        // Set up indicator states matrix
        this.digits = {
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

        // Set up pins
        this.dataPin = gpio.init(socket+"A");
        this.dataPin.setDirection("output");
        this.dataPin.setValue(0);

        this.clockPin = gpio.init(socket+"B");
        this.clockPin.setDirection("output");
        this. clockPin.setValue(0);

        this.latchPin = gpio.init(socket+"C");
        this.latchPin.setDirection("output");
        this.latchPin.setValue(0);
    }

    indicate(number){
        var inst = this;

        // Converts number to array of signals to be send
        const numberToSignals = function(number){
            return number
                .toString()
                .split("")
                .pad(length)
                .reverse()
                .map(function(value){
                    return inst.digits[value] === undefined ? inst.digits["N"] : inst.digits[value];
                })
                .reduce(function(previous, current, index, array){
                    return previous.concat(current)
                });
        };

        var signals = numberToSignals(number);

        // set ST_CP to LOW
        inst.latchPin.setValue(0);

        signals.forEach(function(value){
            // set DS to value to be pushed
            inst.dataPin.setValue(value);

            // set SH_CP to HIGH and then to LOW
            inst.clockPin.setValue(1);
            inst.clockPin.setValue(0);
        });

        // then all signals are sent put latch to HIGH
        inst.latchPin.setValue(1);
    };
}

module.exports = indicator;

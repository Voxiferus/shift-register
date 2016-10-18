const gpio = require("@tibbo-tps/gpio");

class indicator {
    constructor(socket, length){
        this.length = length;

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
            N: [0,0,0,0,0,0,0,1], // Dash symbol
            B: [0,0,0,0,0,0,0,0] // Blank symbol
        };

        // Set up pins
        this.dataPin = gpio.init(socket+"A");
        this.dataPin.setDirection("output");
        this.dataPin.setValue(0);

        this.clockPin = gpio.init(socket+"B");
        this.clockPin.setDirection("output");
        this.clockPin.setValue(0);

        this.latchPin = gpio.init(socket+"C");
        this.latchPin.setDirection("output");
        this.latchPin.setValue(0);
    }

    indicate(number){
        var inst = this;

        // Converts number to array of signals to be send
        const numberToSignals = function(number){
            var output =[];
            number
                .toString()
                .split("")
                .forEach(function(current, index, array){
                    if(current !== "."){
                        var symbol = inst.digits[current];
                        if (symbol === undefined){
                            symbol = Array.from(inst.digits["N"])
                        }else if(array[index+1] === "."){
                            symbol = Array.from(symbol);
                            symbol[0] = 1;
                        }
                        output.unshift(symbol);
                    }
                },[]);

            // crop number to first "length" digits, if needed
            output = output.slice(-inst.length);

            // pad number with spaces if it's shorter than 4 digits
            while (output.length < inst.length){
                output.push(inst.digits["B"])
            }

            return output.reduce(function(prev, current){
                return prev.concat(current)
            });
        };

        var signals = numberToSignals(number);

        // Set ST_CP (latch) to LOW
        // This operation puts shift registers into "programming" mode.
        // Then latch is low shift register do not change output states,
        // but reads and "remembers" data from DS pin.
        inst.latchPin.setValue(0);

        signals.forEach(function(value){
            // set value to be pushed into register on DS pin
            inst.dataPin.setValue(value);

            // set SH_CP (clock) to HIGH and then to LOW
            // on rising edge of clock shift register read state from DS pin, and prepares it for setting on Q0 output.
            // The previously read values will be shifted each to the next pin.
            inst.clockPin.setValue(1);
            inst.clockPin.setValue(0);
        });

        // then all signals are sent ST_CP (latch) to HIGH
        // If latch is HIGH, all the read values will be simultaneously set to the outputs.
        inst.latchPin.setValue(1);
    };
}

module.exports = indicator;

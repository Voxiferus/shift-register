/*
const http = require("http");

http.get("http://api.fixer.io/latest?base=USD&symbols=RUB", (res) => {
    var buffer = Buffer.from([]);
    res.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk])
    });
    res.on('end',()=>{
        try{
            var result = JSON.parse(buffer.toString());
            var ratio = result['rates']['RUB'];
            console.log(ratio);
        }catch(e){
            console.log(e);
        }
    })
});*/

const gpio = require("@tibbo-tps/gpio");
const lightSensor = require("@tibbo-tps/tibbit-28").init("S25");

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
    N: [0,0,0,0,0,0,0,1]
};

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
    const numberToSignals = function(number){
        var digitsList = number
            .toString()
            .split("");

        while(digitsList.length < 3){
            digitsList.unshift(0)
        }

        return digitsList
            .reverse()
            .map(function(value){
                return digits[value] === undefined ? digits["N"] : digits[value];
            })
            .reduce(function(previous, current){
                return previous.concat(current)
            });
    };

    var signals = numberToSignals(number);

    latchPin.setValue(0);

    signals.forEach(function(value){
        dataPin.setValue(value);
        clockPin.setValue(1);
        clockPin.setValue(0);
    });

    latchPin.setValue(1);
};

setInterval(function(){
    try{
        var illumination = lightSensor.getData().illumination;
        illumination = illumination > 999 ? 999 : illumination;
    }catch(e){
        illumination = "NNN";
    }

    indicate(illumination);
},1000);

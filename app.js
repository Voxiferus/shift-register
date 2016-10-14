const lightSensor = require("@tibbo-tps/tibbit-28").init("S25");
const leds = require("./modules/indicate.js");
const indicator = new leds("S17",4);

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
    indicator.indicate(illumination);
},1000);

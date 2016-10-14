const leds = require("./modules/indicate.js");
const indicator = new leds("S17",4);
const http = require("http");

setInterval(function(){
    http
        .get("http://api.fixer.io/latest?base=USD",function(res){
            var data = "";
            res
                .on("data", function(chunk){
                    data += chunk.toString();
                })
                .on("end", function(){
                    try{
                        data = JSON.parse(data);
                        var rub = data["rates"]["RUB"].toFixed(2);
                        indicator.indicate(rub);
                    }catch(err){
                        console.log(err);
                    }
                })
        })
},1000);

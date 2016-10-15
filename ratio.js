const leds = require("./modules/indicate.js");
const indicator = new leds("S17",4);

const port = 3000;

const express = require("express");
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);

var exchangeRates, currentTicker = "EUR";

var getExchangeRates = function(){
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
                        exchangeRates = data["rates"];
                        indicate();
                    }catch(err){
                        console.log(err);
                    }
                })
        })
};

var indicate = function(){
    try{
        var rate = exchangeRates[currentTicker];
        indicator.indicate(rate);
    }catch(e){
        indicator.indicate("NNNN");
    }
};

getExchangeRates();

setInterval(function(){
    getExchangeRates();
}, 600000);

io.on('connection', function(socket){
    console.log('USER CONNECTED');

    socket.on('ticker:changed', function(ticker){
        currentTicker = ticker;
        indicate();
    });

    socket.on('disconnect', function(){
        console.log('USER DISCONNECTED');
    });
});

app.use("/", express.static('static'))

server
    .listen(port,function(){
        console.log("Listening on: "+port)
    });

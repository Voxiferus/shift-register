angular
    .module('exchange',[])
    .controller("currencySelector",['$scope','$http',function($scope, $http){
        $scope.selected = "EUR";

        var socket = io();

        var sendTicker = function(){
            socket.emit("ticker:changed", $scope.selected)
        };

        socket.on('connect', function () {
            $scope.locked = false;
            sendTicker();
            $scope.$apply();
        });

        socket.on('disconnect', function () {
            $scope.locked = true;
            $scope.$apply();
        });

        $scope.selectCurrency = function(ticker){
            $scope.selected = ticker;
            sendTicker();
        };

        $http.get("http://api.fixer.io/latest?base=USD")
            .then(
                function(response){
                    try{
                        $scope.currencies = response['data']['rates'];
                    }catch(e){
                        console.log(e)
                    }
                }
            )
    }]);
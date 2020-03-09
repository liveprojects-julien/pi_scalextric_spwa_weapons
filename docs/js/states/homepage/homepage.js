(function () {
    'use strict';

    angular
        .module('mainjs')
        .controller('homepageCtrl', homepageCtrl);

    homepageCtrl.$inject = [
        '$scope',
        '$state',
        'mqttService',
        'brokerDetails',
        'messageService'
        ];
    
    function homepageCtrl(
        $scope,
        $state,
        mqttService,
        brokerDetails,
        messageService
    ) {
        var vm = this;
        vm.go = go;
        var stateName = "homepage";
        vm.stateName = stateName;

        //Initialises the range of channels that can be selected and the selected channel
        vm.channels = Array.apply(null, {
            length: 5
        }).map(Function.call, Number);;
        vm.channel = 0;

        function go(valid) {
            if (!valid) {
                alert("Invalid Details")
            } else {
                $state.transitionTo('car_control',
                {
                    channel: vm.channel,
                });
            }
        }
        
        //mqttService.onMessageArrived(messageService.onMessageArrived);
        messageService.subscribe("testUUID/channel/0","home_page", function(message){
            //console.log("message in");
            console.log(JSON.stringify(message,null,2));
        });

       
        
    }
})();

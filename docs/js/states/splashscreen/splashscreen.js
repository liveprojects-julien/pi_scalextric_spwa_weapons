(function () {
    'use strict';

    angular
        .module('mainjs')
        .controller('splashscreenCtrl', splashscreenCtrl);

    splashscreenCtrl.$inject = [
        '$scope',
        '$state',
        'mqttService',
        'brokerDetails',
        'messageService',
        '$timeout'
        ];
    
    function splashscreenCtrl(
        $scope,
        $state,
        mqttService,
        brokerDetails,
        messageService,
        $timeout
    ) {
        var vm = this;
        
        vm.update = function(){
            
            console.log(brokerDetails);


            mqttService.initialize(brokerDetails.HOST, brokerDetails.PORT);

            messageService.initialize();

            mqttService.setMessageListener(messageService.onNewMessage);
            
            mqttService.setResubscribeListener(messageService.resubscribe);

            var mqttOptions = {};

            if (brokerDetails.SSL) { mqttOptions.useSSL = brokerDetails.SSL; }
            if (brokerDetails.USERNAME) {
                mqttOptions.userName = brokerDetails.USERNAME;
                if(brokerDetails.PASSWORD){
                    mqttOptions.password = brokerDetails.PASSWORD;
                }
            }

            mqttService.connect(function (success, error) {
                if (success) {
                    console.log("mqtt connect success");
                    $state.go('homepage');
                } else if (error) {
                    console.log(error)
                    alert(`Could Not Connect to ${brokerDetails.HOST}:${brokerDetails.PORT}`)
                }

            },mqttOptions)
        }

    }
})();

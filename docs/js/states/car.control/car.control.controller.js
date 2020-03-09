(function () {
    'use strict';

    angular
        .module('mainjs')
        .controller('carControlCtrl', carControlCtrl);

        carControlCtrl.$inject = [
        '$scope',
        '$state',
        '$stateParams',
        'brokerDetails',
        'messageService'
        ];
    
    function carControlCtrl(
        $scope,
        $state,
        $stateParams, 
        brokerDetails,
        messageService
    ) {
        
        var vm = this;
        var stateName = "car_control";
        
        var changed = false;

        var channel = $stateParams.channel;

        const DEFAULT_THROTTLE = 0;
        const DEFAULT_SENSOR = 1;

        /*
        throttle : is the throttle percentage the user is demanding.
        actualThrottle : is the throttle percentage the real world car is at.
        resources : is the array holding the available special weapons
        */
        vm.throttle = DEFAULT_THROTTLE;
        vm.sensorValue = DEFAULT_SENSOR;
        vm.actualThrottle = DEFAULT_THROTTLE;
        vm.resources = [];
        vm.stateName = stateName;


        vm.targetChannels = Array.apply(null, {
            length: 3
        }).map(Function.call, Number);;

        vm.targetChannels = vm.targetChannels.filter(targetChannel => targetChannel !== channel );
        console.log(vm.targetChannels);

        vm.targetChannel = -1;

        //Used to show error message when there is a server error.
        vm.throttleError = false;

        vm.stop = stop;
        vm.fireSpecialWeapon = fireSpecialWeapon;
        

        var throttleTopic = `${brokerDetails.UUID}/control/${channel}/throttle`;
        var getResourcesTopic = `${brokerDetails.UUID}/resources`;
        var resourceStateTopic = `${brokerDetails.UUID}/control/{channel}/{resourceId}/state`;
        var sensorTopic = `${brokerDetails.UUID}/sensors/3`;

        messageService.subscribe(sensorTopic);

        //subscribe to channel throttle
        messageService.subscribe(throttleTopic);

        // subscribe to channel resources
        messageService.subscribe(getResourcesTopic);

        /*
        Stops the car and returns user back to the index page,
        */
        function stop() {
            //stop the car
            var payload = {
                set : 0
            }
            messageService.publish(throttleTopic, JSON.stringify(payload));
            
            messageService.disconnect();
            $state.transitionTo('index', {});
        }

        /*
            Special weapons messages that could be received :
            { state: "busy" } or { state: "ready" }

            Special weapons payload format for firing :
            { state: "requested", target: [CHANNEL_ID] }

        */

        function fireSpecialWeapon(resourceId) {
            let payload = {
                state: "requested",
                target: vm.targetChannel
            };
            messageService.publish(resourceStateTopic.replace(/\{resourceId\}/, resourceId).replace(/\{channel\}/, channel), JSON.stringify(payload));
        }

        /*
        If user navigates to a different webpage stop the car.
        When this state is navigated to the onhashchange function 
        is called which is ignored. 
        */
        // window.onhashchange = function () {
        //     if (changed) {
        //         console.log('changed');
        //         stop();
        //     } else {
        //         changed = true;
        //     }
        // }

      
        messageService.subscribe(throttleTopic,stateName, function(message){
            if(message.topic == throttleTopic){
                console.log(JSON.stringify(message,null,2));
                var throttle  = JSON.parse(message.payloadString);
                //filter out any set throttle messages
                if(throttle.hasOwnProperty("throttle")){
                    vm.actualThrottle = throttle.throttle;
                }
            }
        });

        messageService.subscribe(getResourcesTopic,stateName, function(message){
            if(message.topic == getResourcesTopic){
                vm.resources = JSON.parse(message.payloadString);
                    vm.resources.forEach(resource => {
                        // subscribe to resource state for this channel
                        messageService.subscribe(resourceStateTopic.replace(/\{resourceId\}/, resource.id));
                    });
                    $scope.$apply();
            }
        });

        messageService.subscribe(resourceStateTopic,stateName, function(message){
            if (vm.resources !== undefined) {
                vm.resources.forEach(resource => {
                    if (message.topic === resourceStateTopic.replace(/\{resourceId\}/, resource.id)) {
                        console.log(message);
                    }
                })
            }
        });

        

        /*
        When users changes car throttle a change request is sent to server. 
        */
        $scope.$watch("vm.throttle", function (newThrottle, oldThrottle) {
            if (newThrottle != oldThrottle) {
                var payload = {
                    set : newThrottle
                }
                messageService.publish(throttleTopic, JSON.stringify(payload));
            }
        })
              
    }
})();

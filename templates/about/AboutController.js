/**
 * Created by Silviu Iulian Iacob on 4/5/16.
 */

(function() {

    angular.module('ionicApp')
        .controller('AboutController', AboutController);

    AboutController.$inject = ['$scope', '$ionicModal', 'joomlaService'];

    function AboutController($scope, $ionicModal, joomlaService) {

        $scope.logData = function() {
            joomlaService.getDummyData().then(function(data) {
               console.log('Data: ', data);
            });
        }

    }

}).call(this);
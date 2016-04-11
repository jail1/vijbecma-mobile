(function () {

    "use strict";

    angular.module('ionicApp').service('joomlaService', JoomlaService);

    JoomlaService.$inject = ['$http', 'restService'];

    function JoomlaService($http, restService) {

        // # GET

        function getDummyData() {
            return $http.get('services/menu.json');
        }

        function getCategories() {
            return $http.get('http://localhost/joomla/api/v1/index.php/categories');
        }

        // # REVEAL

        var result = {
            getDummyData : getDummyData,
            getCategories: getCategories
        };

        return result;
    }

}).call(this);
/**
 * Created by Silviu Iulian Iacob on 4/5/16.
 */

(function () {
    "use strict";

    angular.module('ionicApp').service('restService', restService);

    restService.$inject = ['$http', '$q', 'APP_URL', '$log'];

    function restService($http, $q, APP_URL, $log) {

        function HttpGet(url) {
            var d = $q.defer();
            $http.get(APP_URL + '/get' + url).success(function (response) {
                d.resolve(response);
            }).error(function (rejection) {
                d.reject(rejection);
            });
            return d.promise;
        }

        function HttpPost(url, data) {
            var d = $q.defer();
            $http.post(APP_URL + '/post' + url, data).success(function (response) {
                d.resolve(response);
            }).error(function (rejection) {
                $log.error(rejection);
            });
            return d.promise;
        }

        function HttpDelete(url, data) {
            var d = $q.defer();
            $http.delete(APP_URL + '/delete' + url).success(function (response) {
                d.resolve(response);
            }).error(function (rejection) {
                $log.error(rejection);
            });
            return d.promise;
        }

        var result = {
            get: HttpGet,
            post: HttpPost,
            delete: HttpDelete
        };

        return result;
    }

}).call(this);

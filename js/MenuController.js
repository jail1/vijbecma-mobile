/**
 * Created by Silviu Iulian Iacob on 4/6/16.
 */

(function () {
    "use strict";

    angular.module('ionicApp').controller('MenuController', MenuController);

    MenuController.$inject = ['$scope', 'loadMenuFile', '$cookies'];

    function MenuController($scope, loadMenuFileProvider, $cookies) {
        $scope.openedSection = {};
        $scope.currentSection = {};
        $scope.currentPage = {};
        this.isOpen = function (section) {
            return $scope.isSectionSelected(section);
        };
        this.selectSection = function (section) {
            $scope.openedSection = section;
        };
        this.selectPage = function (section, page) {
            $scope.currentSection = section;
            $scope.currentPage = page;
        };
        this.toggleOpen = function (section) {
            $scope.toggleSelectSection(section);
        };
        this.isSelected = function isSelected(page) {
            return $scope.isPageSelected(page);
        };
        /** Closes a toggled section if the child is not its own **/
        this.toggleCheckToggleOpen = function(section){
            if ($scope.openedSection != null && section.route.split(".")[0] != $scope.openedSection.route ){
                $scope.openedSection = null;
            }
        };
        $scope.toggleSelectSection = function (section) {
            $scope.openedSection = ($scope.openedSection === section ? null : section);
        };
        $scope.isSectionSelected = function (section) {
            return $scope.openedSection == section;
        };
        $scope.isPageSelected = function (page) {
            return $scope.currentPage == page;
        };

        //loaded by loadMenuFileProvider and kept into menuSections
        loadMenuFileProvider.registerPromise().then(function (data) {
            //$log.log("Making menu "+$cookies.state);
            $scope.menu = {};
            $scope.menu.sections = data;
            var languageEntries = [];
            angular.forEach(data, function (section) {
                languageEntries.push(section.name);
                angular.forEach(section.pages, function (page) {
                    if ($cookies.get('state') && page.route == $cookies.get('state')){
                        $scope.openedSection = section;
                    }
                    languageEntries.push(page.name);
                });
            });
        });
    }
}).call(this);

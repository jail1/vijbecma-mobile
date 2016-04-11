(function() {

    angular.module('ionicApp')
        .controller('HomeTabCtrl', HomeTabCtrl);

    HomeTabCtrl.$inject = ['$scope', '$ionicModal', '$controller', 'loadMenuFile', '$state', '$rootScope', '$sce', '$ionicPopup', 'joomlaService'];

    function HomeTabCtrl($scope, $ionicModal, $controller, loadMenuFileProvider, $state, $rootScope, $sce, $ionicPopup, joomlaService) {
        var sectionsTree;
        // # Extend the menu controller
        angular.extend(this, $controller('MenuController', {$scope: $scope}));

        // # Reusable functionality.

        function loadMenuData() {
            loadMenuFileProvider.registerPromise().then(function (data) {
                sectionsTree = [];
                angular.forEach(data, function (section) {
                    section.url = "/tab/home/"+section.routeName;
                    section.state = "tabs.home."+section.routeName;
                    if (angular.isDefined(section.children) && section.children.length > 0){
                        recursiva(section.children)
                    }
                    sectionsTree.push(section);
                });
                $scope.parentItems = [];
                angular.forEach(sectionsTree, function (section) {
                    $scope.parentItems.push(section);
                });
                $scope.notLastChild = true;
                $scope.firstChild = true;
                $scope.cachedParentItems = angular.copy($scope.parentItems);
                // console.info('$scope.parentItems', $scope.parentItems);
            });
        }

        function resetTreeView() {
            $scope.parentItems = $scope.cachedParentItems;
            $scope.notLastChild = true;
            $scope.firstChild = true;
        }

        // # General usage.

        $rootScope.goBack = function() {
            window.history.back();
        };

        $rootScope.goToSubjects = function() {
            resetTreeView();
            $state.go('tabs.home');
        };

        // # Prepare data for consumption.

        var recursiva = function(subsections){
            angular.forEach(subsections, function (section) {
                section.url = "/tab/home/"+section.routeName;
                section.state = "tabs.home."+section.routeName;
                //console.log(section.name + ' = ' + section.url)
                if (angular.isDefined(section.children) && section.children.length > 0) {
                    section.children = recursiva(section.children)
                }
            });
            return subsections
        };

        loadMenuData();

        var wasFound = false;
        var findSectionChildrenByName = function (tree, sectionName) {
            var result;
            angular.forEach(tree, function (section) {
                //console.log(section.state + " vs "+sectionName)
                if (section.state == sectionName){
                    wasFound = true;
                    result =  section;
                    return;
                }
                if (!wasFound && angular.isDefined(section.children) && section.children.length > 0){
                    result = findSectionChildrenByName(section.children, sectionName)
                }
            });
            return result;
        };
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            if(toState.name === "tabs.about" || toState.name === 'tabs.contact') {
                return;
            }
            if(toState.name === 'tabs.home') {
                resetTreeView();
                return;
            }
            $scope.firstChild = false;
            wasFound = false;
            var selectedSection = findSectionChildrenByName(sectionsTree, toState.name);
            if (angular.isDefined(selectedSection)){
                $scope.parentItems = [];
                angular.forEach(selectedSection.children, function (section) {
                    $scope.parentItems.push(section);
                });
                $scope.currentData = selectedSection.children.length == 0 ? selectedSection : {};
                if($scope.currentData && $scope.currentData.exercitii) {
                    $scope.groups = [];
                    if($scope.currentData && $scope.currentData.exercitii) {
                        angular.forEach($scope.currentData.exercitii, function(ex, index) {
                            $scope.groups[index] = {
                                name : ex.intrebare,
                                items: [ex.raspuns]
                            }
                        });
                    }
                }
                $scope.notLastChild = selectedSection.children.length == 0 ? false : true;
            }else{
                // console.error("Section named "+toState.name+" not found in the tree!!!")
            }
        });
        
        $scope.checkroute = function() {
            console.log('You are in : ', $state.$current.url.sourcePath);
        };

        // # Specific implementation logic.

        // # Event Listeners and destroyers.

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hide', function() {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
        });
        $scope.$on('modal.shown', function() {
            console.log('Modal is shown!');
        });

        // # Image Modal

        $ionicModal.fromTemplateUrl('templates/home/image-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.imageModal = modal;
        });

        $scope.showImage = function(source) {
            if(!source) {
                return;
            }
            $scope.imageSrc  = source;
            $scope.openImageModal();
        };

        $scope.openImageModal = function() {
            $scope.imageModal.show();
        };

        $scope.closeImageModal = function() {
            $scope.imageModal.hide();
        };

        // # Video Modal

        $ionicModal.fromTemplateUrl('templates/home/video-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.videoModal = modal;
        });

        $scope.showVideo = function(source) {
            if(!source) {
                return;
            }

            var confirmPopup = $ionicPopup.confirm({
                title: 'Folositi date mobile !',
                template: 'Utilizarea de date mobile (de tip 2G, 3D, 4G, etc), poate aduce costuri suplimentare. Vizualizarea de videoclipuri (in special cele HD) implica un transfer mai mare de date. Doriti sa continuati ?',
                cancelText: 'Renunta',
                okText: 'Continua',
                cssClass: 'width-100'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    var videoId  = getId(source);
                    $scope.videoIframeUrl = $sce.trustAsResourceUrl("http://youtube.com/embed/" + videoId);
                    $scope.openVideoModal();
                }
            });
        };

        $scope.openVideoModal = function() {
            $scope.videoModal.show();
        };

        $scope.closeVideoModal = function() {
            $scope.videoModal.hide();
        };

        // #############################################################################################################

        // # Accordion Q&A

        console.info('$scope.groups ', $scope.groups );
        /*
         * if given group is the selected group, deselect it
         * else, select the given group
         */
        $scope.toggleGroup = function(group) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = group;
            }
        };
        $scope.isGroupShown = function(group) {
            return $scope.shownGroup === group;
        };

        // #############################################################################################################

        // # Confirm Dialog

        $scope.showConfirm = function() {

        };
        
        // # 
        joomlaService.getCategories().then(function(res) {
            console.info(res);
        });

    }

}).call(this);

function getId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return 'error';
    }
}
(function() {

    var isProductionApplication = false;

    // # Build your functions ##########################################################################################

    function loadMenuFileProvider() {
        var self = this;
        var deferredPromises = [];
        this.registerConfigCallback = function (deferredConfigPromise) {
            //console.log('registerConfigCallback')
            deferredPromises.push(deferredConfigPromise);
            return deferredConfigPromise.promise;
        };
        this.$get = ['$q', '$http', 'MENU_FILE', '$cookies', '$state',
            function ($q, $http, MENU_FILE, $cookies, $state) {
                // console.log('Loading menu...')
                if (angular.isDefined($cookies.get('state'))) {
                    self.$state = $state;
                    self.savedState = $cookies.get('state');
                    self.savedStateParams = JSON.parse($cookies.get('stateParams'));
                }
                $http({
                    method: "GET",
                    url: MENU_FILE,
                    cache: false
                }).success(function (data) {
                    angular.forEach(deferredPromises, function (deferredPromise) {
                        deferredPromise.resolve(data);
                    });
                }).error(function () {
                    console.error("Failed to find " + MENU_FILE);
                });
                return {
                    registerPromise: function () {
                        //console.log('Registering promise')
                        var d = $q.defer();
                        deferredPromises.push(d);
                        return d.promise;
                    },
                    changeStateToPrevious: self.changeStateToPrevious
                }
            }
        ];
        this.changeStateToPrevious = function () {
            if (self.savedState) {
                console.log('Going to ' + self.savedState, self.savedStateParams);
                try {
                    self.$state.go(self.savedState, self.savedStateParams);
                }
                catch (ex) {
                    self.$state.go('tab/home');
                }
            }
        }
    }

    // #############################################################################################################

    configFn.$inject = ['$stateProvider',
                        '$urlRouterProvider',
                        'loadMenuFileProvider',
                        '$locationProvider'];

    function configFn($stateProvider,
                      $urlRouterProvider,
                      loadMenuFileProvider,
                      $locationProvider) {


        // #############################################################################################################
        // # Dynamic states

        // by badu : The god damn hack - made in Heaven
        var initInjector = angular.injector(['ng']);
        // by badu : var $http = initInjector.get('$http');
        var $q = initInjector.get('$q');
        var deferredConfigPromise = $q.defer();
        // # Restore route state.
        $urlRouterProvider.otherwise('/tab/home');
        $stateProvider
            .state('tabs', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })
            .state('tabs.home', {
                url: "/home",
                views: {
                    'home-tab': {
                        templateUrl: "templates/home/home.html",
                        controller: 'HomeTabCtrl'
                    }
                }
            })
            .state('tabs.about', {
                url: "/about",
                views: {
                    'about-tab': {
                        templateUrl: "templates/about/about.html"
                    }
                }
            })
            .state('tabs.contact', {
                url: "/contact",
                views: {
                    'contact-tab': {
                        templateUrl: "templates/contact/contact.html"
                    }
                }
            });
        //$urlRouterProvider.deferIntercept();
        loadMenuFileProvider.registerConfigCallback(deferredConfigPromise).then(function (data) {
            $locationProvider.html5Mode(true);

            /**
             if (angular.isObject(isHtml5)) {
                isHtml5 = isHtml5.enabled;
            }
             **/
            var recursiva = function(subsection){
                angular.forEach(subsection, function (section) {
                    //console.log("Configuring route "+section.routeName);
                    var parentRouteData = {
                        name: "tabs.home."+section.routeName,
                        url: "/"+section.routeName,
                        views: {
                            'home-tab': {
                                templateUrl: "templates/facts.html"
                            }
                        },
                        controller: 'HomeTabCtrl'
                    };
                    if (angular.isDefined(section.children) && section.children.length > 0) {
                        recursiva(section.children)
                    }
                    //console.info('parentRouteData', parentRouteData);
                    $stateProvider.state(parentRouteData);
                })
            };
            angular.forEach(data, function (section) {
                var parentRouteData = {
                    name: "tabs.home."+section.routeName,
                    url: "/"+section.routeName,
                    views: {
                        'home-tab': {
                            templateUrl: "templates/facts.html"
                        }
                    },
                    controller: 'HomeTabCtrl'
                };
                $stateProvider.state(parentRouteData);
                if (angular.isDefined(section.children) && section.children.length > 0){
                    recursiva(section.children)
                }
            });


            loadMenuFileProvider.changeStateToPrevious();
            // console.log('Routes setup complete')
        }, function(reason) {
            alert('Failed: ' + reason);
        }, function(update) {
            alert('Got notification: ' + update);
        });
        // #############################################################################################################

    }

    runFn.$inject = ['$rootScope', '$ionicPlatform', '$state', '$ionicPopup'];

    function runFn($rootScope, $ionicPlatform, $state, $ionicPopup) {

        // #############################################################################################################

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)

            // # Init some values.
            $rootScope.mobileData = false;

            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            // # Check for internet connection. Should reside under the window object in the cordova environment!
            if(window.Connection) {
                var navConType = navigator.connection.type;
                if(navConType === Connection.NONE) {
                    $ionicPopup.confirm({
                            title : 'Internet deconectat !',
                            content : 'Nu aveti conexiune stabila la Internet !'
                        })
                        .then(function(result) {
                            if(!result) {
                                // # If you find no internet connection, just exit the ionic application !
                                ionic.Platform.exitApp();
                            }
                        });
                } else if(navConType === Connection.UNKNOWN) {
                    $ionicPopup.confirm({
                        title : 'Conexiune la Internet necunoscuta !',
                        content : 'Nu am detectat o retea WiFi, 2G, 3G sau 4G. '
                    })
                } else if(navConType === Connection.CELL_2G || Connection.CELL_3G || Connection.CELL_4G) {
                    $rootScope.mobileData = true;
                    $ionicPopup.confirm({
                            title : 'Folositi date mobile !',
                            content : 'Aveti grija ! Folositi date mobile de tip 2G, 3G sau 4G. Acest lucru poate da cost suplimentar.'
                        })
                        .then(function(result) {
                            if(!result) {
                                // # If you find no internet connection, just exit the ionic application !
                                ionic.Platform.exitApp();
                            }
                        });
                }
            }
        });

        // # Listen to CordovaNetwork:offline and online event.
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {

        });
        // # Listen to CordovaNetwork:offline and offline event.
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
            if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    $ionicPopup.confirm({
                            title: 'Internet deconectat !',
                            content: 'Va rugam verificati conexiunea la internet si reincercati !'
                        })
                        .then(function(result) {
                            if(!result) {
                                ionic.Platform.exitApp();
                            }
                        });
                }
            }
        });

        // #############################################################################################################

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            //console.log("State was changed : " + toState.name);
        });
        $rootScope.$on('$stateChangeError', console.log.bind(console));
        $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
            console.error("State not found : " + unfoundState);
        });
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            //console.log("State change start " + toState.name, toParams);
            //TODO : make this store state and params
            //$cookies.put('state', toState.name);
            //$cookies.put('stateParams', JSON.stringify(toParams));
        });
        $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
            //console.log("View loading ", viewConfig);
        });

    }

    // # Bootstrap your angular application.

    menuFile = "js/services/menu.json";

    angular.module('ionicApp', ['ionic', 'menu', 'ngCookies'])
        // # Bootstrap
        .config(configFn)
        .run(runFn)
        // # Providers
        .provider('loadMenuFile', loadMenuFileProvider)
        // # Constants
        .constant("APP_URL", isProductionApplication ? "" : "http://localhost/api/v1/index.php/")
        .constant("MENU_FILE", menuFile);

}).call(this);

/*

TODO 2: Implement android build environment to test the compiled product.
TODO 3: Test the above written network detection script and make sure its results propagate properly.
TODO 4: Implement the connection conditional to the dialog at the video button.
TODO 5: Do some more visual fixes to make the application look better.

 */
var myApp = angular.module('myApp',["chart.js","ngRoute","ngAnimate", "angularUtils.directives.dirPagination"]);
myApp.config(function($routeProvider, ChartJsProvider){
	$routeProvider
		.when('/', {
			templateUrl: 'templates/console.html',
			controller: 'consoleController'
		})
		.when('/users/liveData', {
			templateUrl: 'templates/liveList.html',
			controller: 'consoleController'
		})
		.when('/users/cropDetails', {
			templateUrl: 'templates/cropDetails.html',
			controller: 'consoleController'
		})
		.when('/users/:id/edit', {
			templateUrl: 'templates/edit.html',
			controller: 'consoleController'
		})
		.when('/users/recordData', {
			templateUrl: 'templates/recordData.html',
			controller: 'consoleController'
		})
		.when('/users/settings', {
			templateUrl: 'templates/settings.html',
			controller: 'consoleController'
		})
		.when('/users/recordDataGraph', {
			templateUrl: 'templates/recordedVisuals.html',
			controller: 'LineCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});
		ChartJsProvider.setOptions({ chartColors : ['#FDB45C', '#00ADF9', '#4D5360'] });
});

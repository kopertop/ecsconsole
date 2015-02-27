angular.module('ECSTasker', [
		'ngMaterial',
		'ngRoute',
		'ECSTasker.services',
		'ECSTasker.directives'
	]).config(function($routeProvider) {
		'use strict';
		$routeProvider
			.when('/', {
				controller: 'MainCtrl',
				templateUrl: 'templates/main.html',
			})
			.otherwise({
				redirectTo: '/'
			});
	});

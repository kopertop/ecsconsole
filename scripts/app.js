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
			.when('/settings', {
				controller: 'SettingsCtrl',
				templateUrl: 'templates/settings.html',
			})
			.when('/task-runner', {
				controller: 'TaskRunnerCtrl',
				templateUrl: 'templates/task-runner.html',
			})
			.otherwise({
				redirectTo: '/'
			});
	});

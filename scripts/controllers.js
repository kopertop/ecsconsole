// scripts/controllers.js
angular.module('ECSTasker')
	.controller('MainCtrl', function($scope, $mdSidenav, $rootScope, AWSService, localStorageService){
		'use strict';
		$scope.credentials = {
			accessKeyId: localStorageService.get('AWSAccessKeyId'),
			secretAccessKey: localStorageService.get('AWSSecretAccessKey'),
		};
		$scope.authenticated = false;

		$scope.tasks = [
			{
				id: 'foo',
				status: {
					running: true,
				},
				name: 'Running Process',
			},
			{
				id: 'foo',
				status: {
					stopped: true,
				},
				name: 'Stopped Process',
			},

		];
		$scope.toggleSidenav = function(menuId) {
			$mdSidenav(menuId).toggle();
		};
		$scope.setCredentials = function(){
			localStorageService.set('AWSAccessKeyId', $scope.credentials.accessKeyId);
			localStorageService.set('AWSSecretAccessKey', $scope.credentials.secretAccessKey);
			var creds = new AWSService.Credentials($scope.credentials);
			AWSService.config.region = 'us-east-1';
			AWSService.config.credentials = creds;
			$scope.authenticated = true;
			$scope.loadTasks();
		};

		// Load all Tasks
		$scope.loadTasks = function loadTasks(){
			var ecs = new AWSService.ECS();
			ecs.listTasks({}, function(err, data){
				console.log(data);
			});
		};
		

	});

// scripts/controllers.js
angular.module('ECSTasker')
	.controller('MainCtrl', function($scope, $mdSidenav, $rootScope, AWSService, localStorageService, $interval){
		'use strict';
		$scope.credentials = {
			accessKeyId: localStorageService.get('AWSAccessKeyId'),
			secretAccessKey: localStorageService.get('AWSSecretAccessKey'),
		};
		$scope.authenticated = false;

		$scope.tasks = [];
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
				$scope.tasks.length = 0;
				// Lookup all the tasks
				ecs.describeTasks({ tasks: data.taskArns }, function(err, tasks){
					_.forEach(tasks.tasks, function(task){
						$scope.tasks.push({
							id: task.taskArn.split('/')[1],
							name: task.containers[0].name,
							status: {
								name: task.lastStatus,
								running: task.lastStatus === 'RUNNING',
								stopped: task.lastStatus !== 'RUNNING',
							},
						});
					});
					$scope.$apply();
				});
			});
		};

		// Reload tasks every 30 seconds
		$interval(function(){
			$scope.loadTasks();
		}, 30000);
		

		$scope.showTaskActions = function showTaskActions(task){
			console.log('ShowTask actions', task);
		};

	});

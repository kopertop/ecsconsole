// scripts/controllers.js
angular.module('ECSTasker')
	.controller('MainCtrl', function($scope, $mdSidenav, $rootScope, AWSService, localStorageService){
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
						// Describe the task definition
						ecs.describeTaskDefinition({ taskDefinition: task.taskDefinitionArn }, function(err, taskDefinition){
							console.log(task, taskDefinition.taskDefinition.containerDefinitions[0].name);
							$scope.tasks.push({
								id: task.taskArn.split('/')[1],
								name: taskDefinition.taskDefinition.containerDefinitions[0].name,
								status: {
									name: task.lastStatus,
									running: task.lastStatus === 'RUNNING',
									stopped: task.lastStatus !== 'RUNNING',
								},
							});
							$scope.$apply();
						});
					});
				});
			});
		};
		

	});

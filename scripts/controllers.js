// scripts/controllers.js
angular.module('ECSTasker')
	.controller('MenuCtrl', function($scope, $mdSidenav, $location){
		'use strict';
		$scope.menu = {
			sections: [
				{
					id: 'home',
					type: 'link',
					href: '/',
					name: 'Running Tasks',
				},
				{
					id: 'task_runner',
					type: 'link',
					href: '/task-runner',
					name: 'Launch Task',
				},
				{
					id: 'settings',
					type: 'link',
					href: '/settings',
					name: 'Settings',
				}

			],
		};
		$scope.goTo = function goTo(href){
			$location.path(href);
		};
	}).controller('MainCtrl', function($scope, $mdSidenav, $rootScope, $interval, $location){
		'use strict';

		$scope.tasks = [];
		$scope.toggleSidenav = function(menuId) {
			$mdSidenav(menuId).toggle();
		};

		// Load all Tasks
		$scope.loadTasks = function loadTasks(){
			$rootScope.ecs.listTasks({}, function(err, data){
				$scope.tasks.length = 0;
				// Lookup all the tasks
				$rootScope.ecs.describeTasks({ tasks: data.taskArns }, function(err, tasks){
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

		if($rootScope.ecs === undefined){
			$location.path('/settings');
		} else {
			// Reload tasks every 30 seconds
			$interval(function(){
				$scope.loadTasks();
			}, 30000);
			$scope.loadTasks();
		}

		$scope.showTaskActions = function showTaskActions(task){
			console.log('ShowTask actions', task);
		};

	}).controller('TaskRunnerCtrl', function($scope, $rootScope, $location, $mdToast){
		'use strict';
		$scope.taskDefinitions = [];

		if($rootScope.ecs === undefined){
			$location.path('/settings');
		} else {
			$rootScope.ecs.listTaskDefinitionFamilies({}, function(err, data){
				$scope.taskDefinitions.length = 0;
				_.forEach(data.families, function(td){
					$scope.taskDefinitions.push(td);
				});
				$scope.$apply();
			});
		}

		/**
		 * Start a task
		 */
		$scope.startTask = function startTask(td){
			// Ask how many to launch

			// Confirm Launch
			$mdToast.show(
				$mdToast.simple()
				.content('Launching Task: ' + td)
				.position('top right')
				.hideDelay(3000)
				);
			// Launch
			$rootScope.ecs.runTask({
				taskDefinition: td
			}, function(err, data){
				console.log(data);
			});
		};

	}).controller('SettingsCtrl', function($scope, $rootScope, AWSService, localStorageService, $location){
		'use strict';
		$rootScope.credentials = {
			accessKeyId: localStorageService.get('AWSAccessKeyId'),
			secretAccessKey: localStorageService.get('AWSSecretAccessKey'),
		};
		$scope.setCredentials = function(){
			localStorageService.set('AWSAccessKeyId', $rootScope.credentials.accessKeyId);
			localStorageService.set('AWSSecretAccessKey', $rootScope.credentials.secretAccessKey);
			var creds = new AWSService.Credentials($rootScope.credentials);
			AWSService.config.region = 'us-east-1';
			AWSService.config.credentials = creds;
			$rootScope.ecs = new AWSService.ECS();
			$location.path('/');
		};

	});

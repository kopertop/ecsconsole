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
			$mdSidenav('left').toggle();
		};

		$scope.toggleSidenav = function(menuId) {
			$mdSidenav(menuId).toggle();
		};

	}).controller('MainCtrl', function($scope, $mdSidenav, $mdDialog, $mdToast, $rootScope, $interval, $location){
		'use strict';

		$scope.tasks = [];
		$scope.showTaskGroup = {};
		// Load all Tasks
		$scope.loadTasks = function loadTasks(){
			$rootScope.ecs.listTasks({}, function(err, data){
				$scope.tasks.length = 0;
				var taskGroups = {};
				// Lookup all the tasks
				$rootScope.ecs.describeTasks({ tasks: data.taskArns }, function(err, tasks){
					_.forEach(tasks.tasks, function(task){
						// Group tasks into task Groups
						var taskName = task.containers[0].name;
						if(taskGroups[taskName] === undefined){
							taskGroups[taskName] = {
								name: taskName,
								tasks: [],
							};
							$scope.tasks.push(taskGroups[taskName]);
						}
						if($scope.showTaskGroup[taskName] === undefined){
							$scope.showTaskGroup[taskName] = false;
						}
						taskGroups[taskName].tasks.push({
							id: task.taskArn.split('/')[1],
							name: task.containers[0].name,
							status: task.lastStatus,
							data: task,
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

		$scope.showTaskActions = function showTaskActions(task, ev){
			function TaskDialogController($scope, $mdDialog) {
				$scope.task = task;
				$scope.hide = function() {
					$mdDialog.hide();
				};
				$scope.cancel = function() {
					$mdDialog.cancel();
				};
				$scope.stop = function() {
					// Confirm Launch
					$mdToast.show(
						$mdToast.simple()
						.content('Stopping Task: ' + $scope.task.name + ' <' + $scope.task.id + '>')
						.position('top right')
						.hideDelay(3000)
						);

					$scope.task.status.name = 'STOPPING';
					$scope.task.status.running = false;
					$scope.task.status.stopped = false;

					$rootScope.ecs.stopTask({
						task: $scope.task.id,
					}, function(err, data){
						if(err){
							$mdToast.show(
								$mdToast.simple()
								.content('Error stopping task: ' + err)
								.position('top right')
								.hideDelay(15000)
								);
						}
						console.log(data);
					});

					$mdDialog.hide();
				};
			}
			$mdDialog.show({
				controller: TaskDialogController,
				templateUrl: 'templates/taskActions.html',
				targetEvent: ev,
			});
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

	}).controller('SettingsCtrl', function($scope, $rootScope, AWSService, $location){
		'use strict';
		$rootScope.credentials = {};
		chrome.storage.sync.get(['AWSAccessKeyId', 'AWSSecretAccessKey'], function(value){
			$rootScope.credentials.accessKeyId = value.AWSAccessKeyId;
			$rootScope.credentials.secretAccessKey = value.AWSSecretAccessKey;
			$scope.$apply();
		});
		$scope.setCredentials = function(){
			chrome.storage.sync.set({
				AWSAccessKeyId: $rootScope.credentials.accessKeyId,
				AWSSecretAccessKey: $rootScope.credentials.secretAccessKey,
			}, function(){
			});
			var creds = new AWSService.Credentials($rootScope.credentials);
			AWSService.config.region = 'us-east-1';
			AWSService.config.credentials = creds;
			$rootScope.ecs = new AWSService.ECS();
			$location.path('/');
		};

	});

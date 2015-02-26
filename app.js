var app = angular.module('StarterApp', ['ngMaterial']);

app.controller('AppCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
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

	// Load all Tasks
	
	

}]);

myApp.controller('consoleController', function($scope, $route, $routeParams, $http, $filter){

	$scope.getAllData = function(){
		$http.get('/api/fieldData/').then(function(res){
			$scope.fieldData = res.data;
		});
	};

    // $scope.addinventory = function(){
    //     $http.post('/api/inventory/', $scope.inventory).then(function(){
    //         // window.location.href = '/#/inventory';
    //         // $scope.err = "Only 10 records can be added at the moment";
    //     });
    // };

    $scope.showSingleData = function(){
		var id = $routeParams.id;
        $http.get('/api/fieldData/' + id).then(function(res){
            $scope.fieldData = res.data;
        });
    };

	$scope.updateData = function(){
		var id = $routeParams.id;
		$http.put('/api/fieldData/' + id, $scope.fieldData).then(function(){
			window.location.href = '/#/users/cropDetails';
		});
	};
	
	$scope.deleteData = function(id){
		$http.delete('/api/fieldData/' + id).then(function(){
			$route.reload();
		});
	};

	$scope.getAllAttribData = function(){
		$http.get('/api/attribData').then(function(res){
			$scope.attribDetails = res.data;
		});
	};

	$scope.getAllRecordedData = function(){
		$http.get('/api/recordData').then(function(res){
			$scope.recordData = res.data;
		});
	};

	$scope.getAllUserSetting = function(){
		$http.get('/api/getUserData').then(function(res){
			$scope.user = res.data;
		});
	};

	$scope.updateEmail = function(id){
		$http.put('/api/updateEmail/' + id, $scope.user).then(function(res){
			$scope.emailMessage = res.data.mess;
		});
	};

	$scope.updatePassword = function(id){
		$http.put('/api/updatePass/' + id, $scope.user).then(function(res){
			$scope.passMess = res.data.mess;
		});
	};

	$scope.updateCity = function(id){
		$http.put('/api/updateCity/' + id, $scope.user).then(function(res){
			$scope.cityMessage = res.data.mess;
		});
	};

	$scope.config = {
		itemsPerPage: 5,
		fillLastPage: true
	}

	$scope.itemsPerPage = 8;
	$scope.first = 1;
	$scope.count = function(f, l){
		$scope.first = f;
		$scope.last = l;
	}

});

myApp.controller("LineCtrl", function ($scope, $http) {
	$http.get('/api/recordData').then(function(res){
		let recordData = res.data;
		let soil = [];
		let light = [];
		let createdDate = [];
		let humid = [];
		let temp = [];
		let wind = [];

		// Acquiring different attributes from the recorded data
		for(let i = 0; i < recordData.length; i++){
			soil.push(recordData[i].soil);
			light.push(recordData[i].light);
			humid.push(recordData[i].humidity);
			temp.push(recordData[i].temp);
			wind.push(recordData[i].wind.split(" ")[0]);
			createdDate.push(recordData[i].createdOn.split('T')[0] + " at " + recordData[i].createdOn.split('T')[1].slice(0,8));
		}

		$scope.labels1 = createdDate;
		$scope.series1 = [ 'Light', 'Soil'];
		$scope.data1 = [light, soil];
		
		$scope.onClick1 = function (points, evt) {
		console.log(points, evt);
		};

		$scope.datasetOverride1 = [{ yAxisID: 'y-axis-1' }];
		$scope.options1 = {
			legend: {
				display: true
			},
			scales: {
				yAxes: [
				{
					id: 'y-axis-1',
					type: 'linear',
					display: true,
					position: 'left',
					scaleLabel: {
						display: true,
						labelString: 'Value'
					}
				}],
				xAxes: [ 
				{
					scaleLabel: {
						display: true,
						labelString: 'TimeStamp'
					}
				}]
			}
		};

		$scope.labels2 = createdDate;
		$scope.series2 = [  'Temperature ℃', `Wind ${res.data[0].wind.split(" ")[1]}`, 'Humidity g/m³'];
		$scope.data2 = [temp, wind, humid];
		
		$scope.onClick2 = function (points, evt) {
			console.log(points, evt);
		};

		$scope.datasetOverride2 = [{ yAxisID: 'y-axis-2' }];
		$scope.options2 = {
			legend: {
				display: true
			},
			scales: {
				yAxes: [
				{
					id: 'y-axis-2',
					type: 'linear',
					display: true,
					position: 'left',
					scaleLabel: {
						display: true,
						labelString: 'Value'
					}
				}],
				xAxes: [ 
				{
					scaleLabel: {
						display: true,
						labelString: 'TimeStamp'
					}
				}]
			}
		};

	}); //$http 
});

myApp.controller('navController', function($scope, $http){
	$scope.getUser = function(){
		$http.get('/api/getWhichUser').then(function(res){
			$scope.loggedUser = res.data.loggedUser;
		});
	}
});
var app = angular.module('fp-shirt', ['common.fabric',
	'common.fabric.utilities',
	'common.fabric.constants']);

app.directive('fileupload', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.fileupload);
      element.bind('change', onChangeFunc);
    }
  };
});

app.controller('mainController',  ['$scope','$http', '$timeout', 'Fabric', 'FabricConstants', 'Keypress',
function($scope, $http, $timeout, Fabric, FabricConstants, Keypress) {

	$scope.fabric = {};
	$scope.FabricConstants = FabricConstants;

	$scope.workshopNo = "";
	$scope.projectname = "DESIGN WORKSHOP" + $scope.workshopNo;
	
	//
	// Creating Canvas Objects
	// ================================================================
	$scope.addText = function(str) {
		$scope.fabric.setDirty(true);
		str = str || 'Fresh Prints';
		$scope.fabric.addText(str);
	};
		
	$scope.changeShirt = function(image) {
		$scope.fabric.setDirty(true);
		$scope.fabric.clearCanvas();
		$scope.fabric.addImage(image, false);
	};
	
	$scope.changeColor = function(color){
		$scope.fabric.setDirty(true);
		if($scope.fabric.selectedObject &&
		   $scope.fabric.selectedObject.type == "text"){
		   	// Change the color of the text
		   $scope.fabric.selectedObject.fill = color;
		} else {
			// Change the color of the shirt
			$scope.fabric.stopContinuousRendering();
			$scope.fabric.canvasBackgroundColor = color;
		}
	}

	$scope.uploadFile = function(){
        var file = event.target.files[0];
        var filename = file.name;
		var uploadUrl = "/upload";
        var fd = new FormData();
        fd.append('file', file);

		var addImage = function(){
			$scope.fabric.setDirty(true);
			$scope.fabric.addImage("./uploads/"+filename , true);
		};
		
        $http.post(uploadUrl,fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(addImage,addImage);
	}
    

	// Init
	// ================================================================
	$scope.init = function() {
		$scope.fabric = new Fabric({
			JSONExportProperties: FabricConstants.JSONExportProperties,
			textDefaults: FabricConstants.textDefaults,
			shapeDefaults: FabricConstants.shapeDefaults,
			json: {}
		});
		
		$scope.changeShirt("assets/img/mens_hoodie_front.png");
	};

	// Time machine
	// ================================================================
	$scope.undo = function(index) {
		if ($scope.fabric.history.length > 0){
			$scope.fabric.loadJSON($scope.fabric.history[index].content);
			for (var i=0; i<=index;i++) $scope.fabric.history.shift();
		}
	};
	
	
	$scope.$on('canvas:created', $scope.init);

	Keypress.onSave(function() {
		$scope.updatePage();
	});

}]);

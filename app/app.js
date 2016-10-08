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

	$scope.workshopNo = "";//" 01";//$filter('date')(new Date(), 'yyyy-MM-dd');
			
	$scope.projectname = "DESIGN WORKSHOP" + $scope.workshopNo;
	
	//
	// Creating Canvas Objects
	// ================================================================

	$scope.changeShirt = function(image) {
		$scope.fabric.clearCanvas();
		$scope.fabric.addImage(image, false);
            
		/*
		$timeout(function(){
			$scope.fabric.addImage("assets/logoOnly.png", true);
		}, 2000);
		*/
		
		$scope.fabric.setDirty(true);
	};
	
	$scope.changeColor = function(color){
		if($scope.fabric.selectedObject &&
		   $scope.fabric.selectedObject.type == "text"){
		   	// Change the color of the text
		   $scope.fabric.selectedObject.fill = color;
		} else {
			// Change the color of the shirt
			$scope.fabric.setDirty(true);
			$scope.fabric.stopContinuousRendering();
			$scope.fabric.canvasBackgroundColor = color;
		}
	}

	$scope.uploadFile = function(){
		
       
       // alert('file was selected: ' + filename);
        
        var file = event.target.files[0];
        var filename = file.name;
		var uploadUrl = "/upload";
        var fd = new FormData();
        fd.append('file', file);

		var addImage = function(){
			$scope.fabric.addImage("./uploads/"+filename , true);
			$scope.fabric.setDirty(true);
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

	$scope.$on('canvas:created', $scope.init);

	Keypress.onSave(function() {
		$scope.updatePage();
	});

}]);

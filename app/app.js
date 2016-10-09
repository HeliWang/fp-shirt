var app = angular.module('fp-shirt', ['common.fabric',
    'common.fabric.utilities',
    'common.fabric.constants'
]);

app.directive('fileupload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var onChangeFunc = scope.$eval(attrs.fileupload);
            element.bind('change', onChangeFunc);
        }
    };
});

app.controller('mainController', ['$scope', '$http', '$timeout', 'Fabric', 'FabricConstants', 'Keypress',
    function($scope, $http, $timeout, Fabric, FabricConstants, Keypress) {

        $scope.fabric = {};
        $scope.FabricConstants = FabricConstants;
        $scope.projectid = "null";

        $scope.projectList = [];

        var dNow = new Date();
        $scope.workshopNo = dNow.getDate() + dNow.getHours() + dNow.getMinutes();
        $scope.projectname = "DESIGN WORKSHOP No." + $scope.workshopNo;

        //
        // Creating Canvas Objects
        // ================================================================

        $scope.changeShirt = function(image) {
            $scope.fabric.setDirty(true);
            $scope.fabric.clearCanvas();
            $scope.fabric.addImage(image, false);
        };

        $scope.addText = function(str) {
            $scope.fabric.setDirty(true);
            str = str || 'Fresh Prints';
            $scope.fabric.addText(str);
        };

        $scope.changeColor = function(color) {
            $scope.fabric.setDirty(true);
            if ($scope.fabric.selectedObject &&
                $scope.fabric.selectedObject.type == "text") {
                // Change the color of the text
                $scope.fabric.selectedObject.fill = color;
            } else {
                // Change the color of the shirt
                $scope.fabric.stopContinuousRendering();
                $scope.fabric.canvasBackgroundColor = color;
            }
        }

        $scope.uploadFile = function() {
            var file = event.target.files[0];
            var filename = file.name;
            var uploadUrl = "/upload";
            var fd = new FormData();
            fd.append('file', file);

            var addImage = function() {
                $scope.fabric.setDirty(true);
                $scope.fabric.addImage("./uploads/" + filename, true);
            };

            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(addImage, addImage);
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
            if ($scope.fabric.history.length > 0) {
                $scope.fabric.loadJSON($scope.fabric.history[index].content);
                for (var i = 0; i <= index; i++) $scope.fabric.history.shift();
            }
        };

        $scope.refreshProjectList = function() {
            var req = {
                method: 'GET',
                url: '/projectList'
            };
            $http(req).then(
                function(data) {
                    console.log("get-method-succeed");
                    $scope.projectList = data.data;
                },
                function() {
                    console.log("get-method-fail");
                }
            );
        };

        $scope.refreshProjectList();

        $scope.loadProject = function(index) {
            if ($scope.projectList.length > 0) {
                var cur = $scope.projectList[index];
                $scope.fabric.loadJSON(JSON.parse(cur.Project_content));
                $scope.projectid = cur.Project_id;
                $scope.projectname = cur.Project_name;
                $scope.fabric.setDirty(false);
            }
        };

        $scope.saveProject = function() {
            var req = {
                method: 'POST',
                url: '/insertProject',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "projectid": $scope.projectid,
                    "name": $scope.projectname,
                    "content": $scope.fabric.getJSON()
                }
            };
            $http(req).then(
                function(data) {
                    console.log("post-method-succeed");
                    $scope.projectid = data.data.Project_id;
                    $scope.refreshProjectList();
                    $scope.fabric.setDirty(false);
                },
                function() {
                    console.log("post-method-fail");
                });
        };

        $scope.$on('canvas:created', $scope.init);

        Keypress.onSave(function() {
            $scope.updatePage();
        });

    }
]);
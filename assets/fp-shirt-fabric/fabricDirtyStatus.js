angular.module('common.fabric.dirtyStatus', [])

.service('FabricDirtyStatus', ['$window', function($window) {

	var self = {
		dirty: false
	};

	function checkSaveStatus() {
		if (self.isDirty()) {
			return "Do You Really Want to Exit Without Saving Your Work?";
		}
	}

	self.endListening = function() {
		$window.onbeforeunload = null;
		$window.onhashchange = null;
	};

	self.startListening = function() {
		$window.onbeforeunload = checkSaveStatus;
		$window.onhashchange = checkSaveStatus;
	};

	self.isDirty = function() {
		return self.dirty;
	};

	self.setDirty = function(value) {
		self.dirty = value;
	};

	return self;

}]);

/* global angular */
'use strict';
angular.module("tdWizard")
.directive("wizard", function () {
  return {
    restrict: "E",
    transclude: true,
    replace: true,
    scope: {
      title: "@",
      backdrop: "@",
      autoShow: "@",
      onOk: "&",
      onCancel: "&",
      id: "@",
    },
    template:'<div class="modal"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header" ng-if="title"><h3 class="modal-title">{{currentStep.title || title}}</h3></div><div class="modal-body" ng-transclude></div></div></div></div>', 
    link: {
      pre: function (scope, element, attr, parents) {
        scope.currentStepIndex = 0;
        scope.currentStep = null;
        scope.steps = [];
      },
      post: function (scope, element, attr, parents) {
        var options = {};

        if (scope.backdrop) options.backdrop = scope.backdrop;
        if (scope.autoShow) options.show = scope.autoShow;
        else options.show = false;

        element.modal(options);
        scope._element = element;
      }
    },
    controller: function ($scope, $timeout, wzrds) {

      if ($scope.id)
        wzrds.set($scope.id, this);

      this.show = function () {
        $scope.currentStepIndex = 0;
        $scope.currentStep = $scope.steps[0];
        $scope._element.modal('show');
      };
      this.hide = function () { $scope._element.modal('hide'); };

      this.addStep = function (step) {
        $scope.steps.push(step);
        if (!$scope.currentStep) {
          $scope.currentStep = step;
        }
        step.wizard = $scope;
        step._stepIndex = $scope.steps.length - 1;
      };

      this.ok = $scope.ok = function () {
        $scope._element.modal('hide');
        if ($scope.onOk()) $scope.onOk()();
      };

      this.cancel = $scope.cancel = function () {
        $scope._element.modal('hide');
        if ($scope.onCancel()) $scope.onCancel()();
      };

      this.goNext = $scope.goNext = function () {
        var i = $scope.currentStepIndex + 1;
        if (i < $scope.steps.length) {
          if ($scope.$$phase) {
            $scope.currentStepIndex = i;
            $scope.currentStep = $scope.steps[i];
          }
          else {
            $scope.$apply(function () {
              $scope.currentStepIndex = i;
              $scope.currentStep = $scope.steps[i];
            });
          }
        }
      };

      this.goTo = $scope.goTo = function (index) {
        var i = index;
        if (i < $scope.steps.length && i >= 0) {
          if ($scope.$$phase) {
            $scope.currentStepIndex = i;
            $scope.currentStep = $scope.steps[i];
          }
          else {
            $scope.$apply(function () {
              $scope.currentStepIndex = i;
              $scope.currentStep = $scope.steps[i];
            });
          }
        }
      }

      this.goPrev = $scope.goPrev = function () {
        var i = $scope.currentStepIndex - 1;
        if (i >= 0) {
          if ($scope.$$phase) {
            $scope.currentStepIndex = i;
            $scope.currentStep = $scope.steps[i];
          }
          else {
            $scope.$apply(function () {
              $scope.currentStepIndex = i;
              $scope.currentStep = $scope.steps[i];
            });
          }
        }
      };
    }
  };
})
.directive("step", function () {
  return {
    require: "^wizard",
    restrict: "E",
    transclude: true,
    scope: {
      title: "@",
      onShow: "&",
    },
    template: "<div ng-show='_stepIndex === wizard.currentStepIndex' ng-transclude></div>",
    link: function (scope, element, attr, parent, trans) {
      parent.addStep(scope);
      scope.$watch("wizard.currentStepIndex", function (n, o) {
        if (n === scope._stepIndex && scope.onShow())
          scope.onShow()();
      });
    }
  };
})
.directive("wizardAction", function () {
  return {
    require: "^wizard",
    restrict: "A",
    link: function (scope, element, attr, parent) {
      if (attr.wizardAction) {
        element.on("click", function () {
          switch (attr.wizardAction) {
            case "ok": parent.ok(); console.log("wizard ok"); break;
            case "cancel": parent.cancel(); console.log("wizard cancel"); break;
            case "goNext": parent.goNext(); console.log("wizard next"); break;
            case "goPrev": parent.goPrev(); console.log("wizard prev"); break;
            default:
              if (attr.wizardAction.indexOf("goTo") >= 0)
              {
                var value = attr.wizardAction.replace("goTo(", "").replace(")", "");
                parent.goTo(value);
              }
              break;
          }
        });
      }
    }
  };
})
.factory("wzrds", function ($window) {
  if (typeof $window.wzrds == 'undefined')
    $window.wzrds = { object_registry: {} };

  return {
    set: function (name, value) {
      $window.wzrds.object_registry[name] = value;
    },
    get: function (name) {
      return $window.wzrds.object_registry[name];
    },
    remove: function (name) {
      $window.wzrds.object_registry[name] = null;
    }
  };
});

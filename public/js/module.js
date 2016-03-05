/**
 * Created by andersonjso on 2/24/16.
 */

var app = angular.module('mainApp', ['ngTable', 'ngResource', 'ngRoute', 'ui.bootstrap']);

/** CONFIG **/
app.config(function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'pages/exams.html',
            controller: 'examsController'
        })
        .when('/exam/:path', {
            templateUrl: 'pages/exam.html',
            controller: 'examController',
        })
        .otherwise({redirectTo: '/'})
})

app.controller('examsController', ['$scope', '$location', 'dataFactory',
    function($scope, $location, dataFactory){

        $scope.allExams;
        getExams();

        function getExams(){
            dataFactory.listExams()
                .success(function (response){
                    $scope.allExams = response;
                })
                .error(function (error){
                    $scope.status = 'Unable to load data: ' + error.message;
                })
        }

        $scope.goToExam = function(exam) {
            $location.path('/exam/' + exam.path.substring(11, 25));
        };
}]);

app.controller('examController', ['$scope', '$routeParams', 'dataFactory', '$uibModal',
    function ($scope, $routeParams, dataFactory, $uibModal) {

        var path = $routeParams.path;

        retrieveExamByPath();
        retrieveImageExamByPath();

        var getImagesNodules = function(id) {
            $scope.noduleImg = {};

            dataFactory.retrieveBigNoduleImage(path, id)
                .success(function(response){
                    $scope.noduleImg[id] = response;
                })
                .error(function (error){
                    $scope.status = 'Unable to load data: ' + error.message;
                });
        }

        function retrieveExamByPath(){
            dataFactory.retrieveExamByPath(path)
                .success(function (response){
                    $scope.exam = response;
                    $scope.bigNodules = $scope.exam.readingSession.bignodule;

                    for (var i = 0; i < $scope.bigNodules.length; i++){
                        var id = $scope.bigNodules[i].noduleId;
                        getImagesNodules(id);
                    }
                })
                .error(function (error){
                    $scope.status = 'Unable to load data: ' + error.message;
                })
        };

        function retrieveImageExamByPath(){
            dataFactory.retrieveImageExamByPath(path)
                .success(function (response){
                    $scope.image = response;
                })
                .error(function (error){
                    $scope.status = 'Unable to load data: ' + error.message;
                })
        }

        $scope.openNoduleDetails = function(actualNodule){
            $scope.actualNodule = actualNodule;

            var modal = $uibModal.open({
                templateUrl: 'pages/nodule-modal.html',
                controller: 'noduleModalController',
                size: 'lg',
                scope: $scope
            });

            modal.result.then(function (actualNodule){
               // $scope.actualNodule.noduleId = actualNodule.noduleId;
                $scope.actualNodule.subtlety = actualNodule.subtlety;
                $scope.actualNodule.internalStructure = actualNodule.internalStructure;
                $scope.actualNodule.calcification = actualNodule.calcification;
                $scope.actualNodule.sphericity = actualNodule.sphericity;
                $scope.actualNodule.margin = actualNodule.margin;
                $scope.actualNodule.lobulation = actualNodule.lobulation;
                $scope.actualNodule.spiculation = actualNodule.spiculation;
                $scope.actualNodule.texture = actualNodule.texture;
                $scope.actualNodule.malignancy = actualNodule.malignancy;
            });
        }


}]);

//
//			if(nodules.get(i).getMalignancy() == 5){
//				System.out.println(nodules.get(i).getPath()
//						+ " and " +
//						nodules.get(i).getIdNodule());
//				System.out.println("M");
//			}
//			else
//				System.out.println("B");

app.controller('noduleModalController', ['$scope', '$uibModal', 'dataFactory',
    function ($scope, $uibModal, dataFactory) {


}]);

app.factory('dataFactory', ['$http', function($http){
    var dataFactory = {};

    dataFactory.listExams = function(){
        return $http.get('exams')
    }

    dataFactory.retrieveBigNodulesFromExam = function(examPath){
        return $http.get('exam/' + examPath + '/bignodules')
    }

    dataFactory.retrieveSimilarNodules = function(examPath, noduleId){
        return $http.get('exam/' + examPath + '/nodule/' + noduleId + '/similar')
    }

    dataFactory.retrieveExamByPath = function(examPath){
        return $http.get('exam/' + examPath);
    }

    dataFactory.retrieveImageExamByPath = function(examPath){
        return $http.get('exam/image/' + examPath);
    }

    dataFactory.retrieveBigNoduleImage = function(examPath, noduleId){
        return $http.get('exam/' + examPath + '/bignodules/' + noduleId);
    }

    return dataFactory;
}])
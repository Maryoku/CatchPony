"use strict";

var app = angular.module("game", ["ngRoute", "ngResource"]);

app.config(function($routeProvider)
{
    $routeProvider
    .when("/page/:name", {
        templateUrl : function(page){
        	return "assets/"+page.name+".html"
        },
        controller: "pagesController"
    })
    .otherwise("/page/start");
})


.controller("pagesController",function($scope, $http){

	$http.get("?controller=user").success(function (data) {
		$scope.users = data;
	});
})


.controller("gameController", function ($scope, $rootScope, $http, $location) {

	$scope.level = 0;
	$scope.health = 100;
	$scope.score = 0;

	$rootScope.$on('caughtPony', function () {
		$scope.level++;
		$scope.score += parseInt($rootScope.currentPower);
	});

	$rootScope.$on('notCaughtPony', function () {

		if (($scope.health - 2 * parseInt($rootScope.currentPower)) <= 0)
		{
			$scope.health = 0;
			$rootScope.$emit('endGame');
		}
		else
		{
			$scope.level++;
			$scope.health -= 2 * parseInt($rootScope.currentPower);
		}
	});

	$rootScope.$on('endPony', function () {
		$rootScope.$emit('endGame');
	});

	$rootScope.$on('endGame', function () {
		$rootScope.totalScore = $scope.score;
		$location.path('/page/game_over');
	});

	$scope.sendData = function () {
		$http.post("?controller=user",
			{id:0, name: $scope.entername.username.$modelValue, score: $rootScope.totalScore})
			.success(function () {
				$location.path('/page/start');
			})
	}
})


.controller("menuController", function ($scope, $http) {
	$http.get("?controller=menu").success(function (data) {
		$scope.items = data;
	});
})


.controller("ponyController", function ($http, $scope, $interval, $timeout, $rootScope) {

	var ponies;

	$http.get("?controller=pony").success(function (data) {
		ponies = data;
		$scope.next();
	});

	var current = 0;
	var isEnd = false;
	$scope.power = 0;
	$scope.speed = 1;
	$scope.image = "images/ponies/1.png";
	$scope.active = "hidden";

	var timer;
	$scope.x = 50;
	$scope.y = 20;

	var animation, time = 0;

	$scope.move = function ()
    {
		$scope.active = "visible";
		animation = $interval(function () {
			time += parseInt($scope.speed) / 8;
			$scope.x = 40 * Math.sin(time / 40) + 50;
			$scope.y = 15 * Math.cos(time / 10) + 20;
		}, 30);

		timer = $timeout(function () {
			$scope.notCaught();
		}, 8000)
	};

	$scope.notCaught = function () {
		$rootScope.$emit('notCaughtPony');
		$scope.stop();
	};

	$scope.caught = function () {
		$rootScope.$emit('caughtPony');
		$timeout.cancel(timer);
		$scope.stop();
	};

	$scope.stop = function () {
		$scope.active = "hidden";
		$interval.cancel(animation);
		time = 0;
		$scope.x = 50;
		$scope.y = 20;

		if (!isEnd)
			$scope.next();
	};

	$scope.next = function () {

		if (current < ponies.length)
		{
			$scope.power = ponies[current].power;
			$rootScope.currentPower = $scope.power;
			$scope.speed = ponies[current].speed;
			$scope.image = ponies[current].image;

			current++;

			$scope.move();
		}
		else
		{
			$rootScope.$emit('endPony');
		}
	};

	$rootScope.$on('endGame', function () {
		isEnd = true;
	});
})


.directive("header", function(){
	return {
		templateUrl:"assets/directives/header.html",
		replace: true,
		restrict: 'E',
		scope:{},
		controller: "menuController"
	}
})


.directive("pony", function () {
	return {
		templateUrl:"assets/directives/pony.html",
		replace: true,
		restrict: 'E',
		scope:{},
		controller: "ponyController"
	}
})
(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .controller('PaginatorController', PaginatorController)
        .directive('paginator', paginator)
    ;

    /* @ngInject */
    function PaginatorController($scope)
    {
        this.getPaginator = function(){
            return $scope.paginator;
        };
    }

    /* @ngInject */
    function paginator()
    {
        return {
            restrict: 'A',
            controller: 'PaginatorController',
            scope: {
                paginator: '='
            },
            link: link
        };

        function link(scope, elm, attrs){
            scope.$watch(get_amount_of_pages, toggle_shown);

            //////////

            function toggle_shown(now, old){
                if(!!now && now > 1)
                {
                    elm.addClass('xd-paginator--multiple-pages');
                }
                else
                {
                    elm.addClass('xd-paginator--single-page');
                }
            }

            function get_amount_of_pages(){
                return !!scope.paginator ? scope.paginator.amount_of_pages : null;
            }
        }
    }
})();

(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .directive('paginatorUpperBound', paginator_upper_bound)
    ;

    /* @ngInject */
    function paginator_upper_bound()
    {
        return {
            restrict: 'A',
            require: '^paginator',
            scope:{},
            link: link
        };

        function link(scope, elm, attrs, paginatorCtrl)
        {
            scope.paginator = paginatorCtrl.getPaginator();
            scope.$watch(get_upper_bound, update_value);
            function update_value(now){
                elm.text(now);
            }
            function get_upper_bound(){
                if(paginatorCtrl.getPaginator())
                {
                    return paginatorCtrl.getPaginator().get_upper_bound();
                }
                return null;
            }
        }

    }

})();

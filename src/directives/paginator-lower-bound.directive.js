(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .directive('paginatorLowerBound', paginator_lower_bound)
    ;

    /* @ngInject */
    function paginator_lower_bound()
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
            scope.$watch(get_lower_bound, update_value);
            function update_value(now){
                elm.text(now);
            }
            function get_lower_bound(){
                if(paginatorCtrl.getPaginator())
                {
                    return paginatorCtrl.getPaginator().get_lower_bound();
                }
                return null;
            }
        }

    }

})();

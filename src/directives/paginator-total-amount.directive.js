(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .directive('paginatorTotalAmount', paginator_total_amount)
    ;

    /* @ngInject */
    function paginator_total_amount()
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
            scope.$watch(get_total_amount, update_value);
            function update_value(now){
                elm.text(now);
            }
            function get_total_amount(){
                if(paginatorCtrl.getPaginator())
                {
                    return paginatorCtrl.getPaginator().total_amount;
                }
                return null;
            }
        }

    }

})();

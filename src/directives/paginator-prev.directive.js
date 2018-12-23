(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .directive('paginatorPrev', paginator_prev)
    ;

    /* @ngInject */
    function paginator_prev()
    {
        return {
            restrict: 'A',
            require: '^paginator',
            scope:{},
            link: link
        };

        function link(scope, elm, attrs, paginatorCtrl)
        {
            elm.on('click', function()
            {
                scope.$apply(function()
                {
                    if(paginatorCtrl.getPaginator())
                    {
                        paginatorCtrl.getPaginator().prev();
                    }
                });
            });
            scope.$watch(has_prev, toggle_disabled);
            scope.paginator = paginatorCtrl.getPaginator();
            function toggle_disabled(now){
                elm.attr('disabled', !now);
            }
            function has_prev(){
                if(paginatorCtrl.getPaginator()){
                    return paginatorCtrl.getPaginator().has_prev();
                }
                return null;
            }
        }

    }

})();

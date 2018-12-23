(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .directive('paginatorNext', paginator_next)
    ;

    /* @ngInject */
    function paginator_next()
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
                        paginatorCtrl.getPaginator().next();
                    }
                });
            });
            scope.$watch(has_next, toggle_disabled);
            scope.paginator = paginatorCtrl.getPaginator();
            function toggle_disabled(now){
                elm.attr('disabled', !now);
            }
            function has_next(){
                if(paginatorCtrl.getPaginator())
                {
                    return paginatorCtrl.getPaginator().has_next();
                }
                return null;
            }
        }

    }

})();

(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .directive('orderingFilter', orderingFilter)
    ;

    /* @ngInject */
    function orderingFilter()
    {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, elm, attrs)
        {
            var asc_class = !!attrs.orderingAscClass ? attrs.orderingAscClass : 'is-asc';
            var desc_class = !!attrs.orderingDescClass ? attrs.orderingDescClass : 'is-desc';
            scope.$watch(attrs.orderer, function(old, orderer){
                if(!!orderer && !!attrs.orderingKey)
                {
                    var order_key = scope.$eval(attrs.orderingKey);
                    elm.on('click', function(){
                        scope.$apply(function(){
                            orderer.order(order_key);
                        });
                    });
                    if(!!orderer && !!orderer.value && !!order_key)
                    {
                        scope.$watch(attrs.orderer+'.value', function(now){
                            if(!!now)
                            {
                                removeClasses(elm, asc_class, desc_class);
                                if(orderer.is_ordered_asc(order_key))
                                {
                                    setClass(elm, asc_class);
                                }
                                else if(orderer.is_ordered_desc(order_key))
                                {
                                    setClass(elm, desc_class);
                                }
                            }
                        });
                    }
                }
            });
        }

        function setClass(elm, cls)
        {
            if(!elm.hasClass(cls))
            {
                elm.addClass(cls);
            }
        }

        function removeClasses(elm, asc_class, desc_class)
        {
            elm.removeClass(asc_class);
            elm.removeClass(desc_class);
        }
    }
})();

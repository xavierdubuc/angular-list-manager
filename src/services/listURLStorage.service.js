(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .factory('listURLStorage', listURLStorage)
    ;

    /* @ngInject */
    function listURLStorage($state, $stateParams, $httpParamSerializer)
    {
        var query_param = 'q';
        return {
            new_state: new_state,
            load_from_storage: load_from_storage
        };
        ////////////////

        function new_state(query_params){
            var q_params = {};
            q_params[query_param] = $httpParamSerializer(query_params);
            var params = angular.extend({}, $stateParams, q_params);
            $state.go('.', params, {notify:false});
        }

        function load_from_storage(){
            if(!!$stateParams[query_param])
            {
                return _decode($stateParams[query_param]);
            }
            return null;
        }

        function _decode(params){
            var out = {};
            var elements = params.split('&');
            if(!elements){
                return null;
            }
            for(var i in elements){
                var element = elements[i];
                var element_parts = element.split('=');
                out[element_parts[0]] = element_parts[1];
            }
            return out;
        }
    }
})();

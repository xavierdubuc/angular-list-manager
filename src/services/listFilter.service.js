(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .factory('listFilter', listFilter)
    ;

    /* @ngInject */
    function listFilter($stateParams)
    {
        return {instance: instance};
        ////////////////

        function instance(type, key, default_value, params)
        {
            if(type === 'undefined' || type === undefined)
            {
                type = 'generic';
            }
            return new ListFilter(type, key, default_value, params);
        }

        /**
         * ListFilter object representing a filter.
         * @param type the type of the filter (generic, search, ... )
         * @param key the key of the filter (a way to identify it)
         * @param default_value the default value of the filter
         * @param params an array with possibly keys :
         * - value for initial value (if different from default)
         * - force_bool if the filter must always be a boolean value
         * @constructor
         */
        function ListFilter(type, key, default_value, params)
        {
            var filter = this;
            filter.isolated = false;
            filter.getValue = getValue;
            filter.setValue = setValue;
            filter.hasDefaultValue = hasDefaultValue;
            init();

            ///////////

            /**
             * Initialize ListFilter.
             */
            function init()
            {
                if(typeof params === 'undefined' || params === undefined)
                {
                    params = {};
                }
                filter.type = type;

                // KEYS
                filter.key = key;
                filter.static = !!params.static ? params.static : false;
                filter.query_key = params.query_key ? params.query_key : filter.key;

                // VALUES
                filter.default_value = default_value;
                if(params.value)
                {
                    if(params.value === 'fromStateParams')
                    {
                        filter.setValue($stateParams[key] ? $stateParams[key] : default_value);
                    }
                    else
                    {
                        filter.setValue(params.value);
                    }
                }
                else
                {
                    filter.setValue(default_value);
                }

                // PARAMS
                filter.force_bool = !!params.force_bool;
            }

            /**
             * Get the computed value (null if default)
             * @returns {*}
             */
            function getValue()
            {
                if(hasDefaultValue())
                {
                    return null;
                }
                if(typeof filter.value === 'boolean')
                {
                    return filter.value ? 'True' : 'False';
                }
                return filter.value;
            }

            /**
             * Set the value.
             * @param value
             */
            function setValue(value)
            {
                if(filter.force_bool)
                {
                    filter.value = !!value;
                }
                filter.value = value;
            }

            function hasDefaultValue()
            {
                return filter.value === filter.default_value;
            }
        }
    }
})();

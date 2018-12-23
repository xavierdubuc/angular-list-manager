(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .factory('listOrderer', listOrderer)
    ;

    function listOrderer()
    {
        return {instance: instance};

        /**
         * Create a new ListOrderer object.
         * @param scope the scope in which this list is shown
         * @param callback
         * @param default_ordering
         * @returns {ListOrderer}
         */
        function instance(scope, callback, default_ordering)
        {
            return new ListOrderer(scope, callback, default_ordering);
        }

        function ListOrderer(scope, callback, default_ordering)
        {
            var orderer = this;
            var watch = false;
            var unwatcher = null;
            orderer.setOrdering = set_ordering;
            orderer.addOrdering = add_ordering;
            orderer.enableWatching = enable_watching;
            orderer.to_query_params = to_query_params;
            var scope_root_key = 'orderer';

            init();

            function init()
            {
                initScope();
            }

            function initScope()
            {
                scope[scope_root_key] = {
                    order: order,
                    is_ordered: is_ordered,
                    is_ordered_asc: is_ordered_asc,
                    is_ordered_desc: is_ordered_desc,
                    value: '',
                    values: []
                };
                set_ordering(default_ordering);
            }

            function is_ordered(key){
                var values = get_scope_var('values');
                for(var i in values)
                {
                    var value = values[i];
                    if(value === key || value === '-'+key)
                    {
                        return true;
                    }
                }
            }

            function is_ordered_asc(key){
                var values = get_scope_var('values');
                for(var i in values)
                {
                    var value = values[i];
                    if(value === key)
                    {
                        return true;
                    }
                }
            }

            function is_ordered_desc(key){
                var values = get_scope_var('values');
                for(var i in values)
                {
                    var value = values[i];
                    if(value === '-'+key)
                    {
                        return true;
                    }
                }
            }

            function order(value){
                if(is_ordered_asc(value))
                {
                    set_ordering('-'+value);
                }
                else
                {
                    set_ordering(value);
                }
            }

            function set_ordering(value)
            {
                if(value && value.constructor && value.constructor === Array)
                {
                    set_scope_var('values', value);
                    set_scope_var('value', value.join());
                }
                else
                {
                    var esc_value = value.toString();
                    set_scope_var('value', esc_value);
                    set_scope_var('values', esc_value.split(','));
                }
            }

            function add_ordering(value)
            {
                var values = get_scope_var('values');
                values.push(value);
                set_scope_var('values', values);
                set_scope_var('value', values.join());
            }

            function enable_watching()
            {
                watch = true;
                var key = get_scope_key('values');
                unwatcher = scope.$watch(key, function(now, ex)
                {
                    if(ex !== now)
                    {
                        if(now !== undefined)
                        {
                            callback(now);
                        }
                    }
                });
            }

            function to_query_params()
            {
                return {ordering: get_scope_var('value')};
            }

            function get_scope_key(name)
            {
                return scope_root_key + '.' + name;
            }

            function get_scope_vars()
            {
                return scope[scope_root_key];
            }

            function get_scope_var(name)
            {
                var vars = get_scope_vars();
                return vars ? vars[name] : undefined;
            }

            function set_scope_var(name, value)
            {
                var vars = get_scope_vars();
                if(vars)
                {
                    vars[name] = value;
                }
            }
        }
    }
})();

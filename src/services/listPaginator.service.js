(function()
{
    'use strict';

    angular
        .module('xd-list-manager')
        .factory('listPaginator', listPaginator)
    ;

    /* @ngInject */
    function listPaginator()
    {
        return {instance: instance};

        /**
         * Create a new ListPaginator object.
         * @param scope the scope in which this list is shown
         * @param fetch
         * @param items_by_page
         * @returns {ListPaginator}
         */
        function instance(scope, fetch, items_by_page)
        {
            return new ListPaginator(scope, fetch, items_by_page);
        }

        function ListPaginator(scope, fetch, r_items_by_page)
        {
            var default_items_by_page = 25;
            var paginator = this;
            var scope_root_key = 'pagination';

            paginator.get_total_count = get_total_count;
            paginator.setItemsByPage = setItemsByPage;
            paginator.goto = goto;
            paginator.prev = prev;
            paginator.next = next;
            paginator.has_next = has_next;
            paginator.has_prev = has_prev;
            paginator.update = update;
            paginator.get_lower_bound = get_lower_bound;
            paginator.get_upper_bound = get_upper_bound;
            paginator.to_query_params = to_query_params;
            paginator.set_page = set_page;
            init();

            function init()
            {
                initScope();
            }

            function initScope()
            {

                scope[scope_root_key] = {
                    items_by_page: typeof r_items_by_page === 'undefined' || r_items_by_page === undefined ? default_items_by_page : r_items_by_page,
                    amount_of_pages: null,
                    total_amount: 0,
                    page: 1,
                    next: next,
                    has_next: has_next,
                    prev: prev,
                    has_prev: has_prev,
                    goto: goto,
                    get_lower_bound: get_lower_bound,
                    get_upper_bound: get_upper_bound
                };
            }

            function get_total_count()
            {
                return get_scope_var('total_amount');
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

            function update(data)
            {
                var total_amount = data.count;
                var items_by_page = get_scope_var('items_by_page');
                set_scope_var('total_amount', total_amount);
                set_scope_var('amount_of_pages', Math.ceil(total_amount / items_by_page));
            }

            function setItemsByPage(items_by_page)
            {
                set_scope_var('items_by_page', items_by_page);
            }

            function goto(page)
            {
                set_scope_var('page', page);
                fetch();
            }

            function next()
            {
                var page = get_scope_var('page');
                if(has_next())
                {
                    goto(page + 1);
                }
            }

            function prev()
            {
                var page = get_scope_var('page');
                if(has_prev())
                {
                    goto(page - 1);
                }
            }

            function has_next()
            {
                var amount_of_pages = get_scope_var('amount_of_pages');
                var page = get_scope_var('page');
                return amount_of_pages && amount_of_pages > 1 && page < amount_of_pages;
            }

            function has_prev()
            {
                var amount_of_pages = get_scope_var('amount_of_pages');
                var page = get_scope_var('page');
                return amount_of_pages && amount_of_pages > 1 && page > 1;
            }

            function get_lower_bound()
            {
                var amount_of_pages = get_scope_var('amount_of_pages');
                var items_by_page = get_scope_var('items_by_page');
                var page = get_scope_var('page');
                if(!amount_of_pages || amount_of_pages === 0)
                {
                    return 0;
                }
                return 1 + (page - 1) * items_by_page;
            }

            function get_upper_bound()
            {
                var amount_of_pages = get_scope_var('amount_of_pages');
                var items_by_page = get_scope_var('items_by_page');
                var page = get_scope_var('page');
                var total_amount = get_scope_var('total_amount');
                if(!amount_of_pages || amount_of_pages === 0)
                {
                    return 0;
                }
                return Math.min(page * items_by_page, total_amount);
            }

            function to_query_params()
            {
                return {
                    items_by_page: get_scope_var('items_by_page'),
                    page: get_scope_var('page')
                };
            }

            function set_page(page)
            {
                if(typeof page === "undefined" || page === undefined)
                {
                    page = 1;
                }
                set_scope_var('page', parseInt(page,10));
            }
        }
    }

})();

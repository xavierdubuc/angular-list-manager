(function(){
    'use strict';

    angular
        .module('xd-list-manager')
        .factory('listManager', listManager)
    ;

    /* @ngInject */
    function listManager($q, $log, listFilter, listPaginator, listOrderer, listURLStorage, multipleRequestHandler, loadingManager)
    {
        var list_requester, default_list_state_storage = listURLStorage;

        return {instance: instance, setRequester: setRequester, setDefaultListStateStorage: setDefaultListStateStorage};

        ////////////////

        /**
         * Set the requester
         * @param requester
         */
        function setRequester(requester)
        {
            if(typeof requester === 'function')
            {
                if(requester.length < 2)
                {
                    $log.debug('[listManager] WARNING :: requester does not accept 2 arguments !');
                }
                list_requester = requester;
            }
            else
            {
                $log.error('[listManager] ERROR :: requester is not a function !');
            }
        }

        /**
         * Set the list state storage
         * @param state_storage
         */
        function setDefaultListStateStorage(state_storage)
        {
            if(!!state_storage)
            {
                if(_stateStorageIsValid(state_storage))
                {
                    default_list_state_storage = state_storage;
                }
                else
                {
                    if(!state_storage.new_state || typeof state_storage.new_state !== 'function')
                    {
                        $log.debug('[listManager] WARNING :: list state storage does not implement new_state function !');
                    }
                    if(!state_storage.load_from_storage || typeof state_storage.load_from_storage !== 'function')
                    {
                        $log.debug('[listManager] WARNING :: list state storage does not implement load_from_storage function !');
                    }
                }
            }
        }

        function _stateStorageIsValid(state_storage)
        {
            return !state_storage &&
                !state_storage.new_state || typeof state_storage.new_state !== 'function' &&
                !state_storage.load_from_storage || typeof state_storage.load_from_storage !== 'function';
        }

        /**
         * Create a new ListManager object.
         * @param scope the scope in which this list is shown
         * @param entities_key the key of the entities (used to query api and also as scope key for results)
         * @param filters (optional) the filters to use (could be register later)
         * @returns {ListManager}
         */
        function instance(scope, entities_key, filters)
        {
            return new ListManager(scope, entities_key, filters);
        }

        /**
         * ListManager object handling the queries made on a list of entities
         * @param scope the scope in which this list is shown
         * @param entities_key the key of the entities (used to query api and also as scope key for results)
         * @param filters (optional) the filters to use (could be register later)
         * @constructor
         */
        function ListManager(scope, entities_key, filters)
        {
            var pagination_enabled = false;
            var ordering_enabled = false;
            var scope_filters_root_key = 'filters';
            var manager = this;
            var fetching = false;
            var paginator = null;
            var orderer = null;
            var config = {
                aggregate: false,
                storage: false
            };
            var fetch_callbacks = [];
            var loader;
            var last_request_status = null;
            var list_storage = default_list_state_storage;
            var initial_fetch = true;

            // LOADERS METHODS
            manager.enableLoader = enableLoader;
            manager.isLoading = isLoading;
            manager.isLoaded = isLoaded;

            // FILTERS METHODS
            manager.setFilterValue = setFilterValue;
            manager.getFilters = getFilters;
            manager.registerFilter = registerFilter;
            manager.removeFilter = removeFilter;
            manager.watchFilter = watchFilter;
            manager.unwatchFilter = unwatchFilter;

            // CALLBACKS METHODS
            manager.getCallbacks = getCallbacks;
            manager.registerCallback = registerCallback;
            manager.removeCallback = removeCallback;

            // PAGINATION METHODS
            manager.enablePagination = enablePagination;
            manager.setItemsByPage = setItemsByPage;

            // ORDERING METHODS
            manager.enableOrdering = enableOrdering;
            manager.enableOrderingWatch = enableOrderingWatch;
            manager.setOrdering = setOrdering;
            manager.addOrdering = addOrdering;

            // AGGREGATION METHODS
            manager.enableAggregation = enableAggregation;
            manager.disableAggregation = disableAggregation;

            // STORAGE METHODS
            manager.enableStorage = enableStorage;
            manager.disableStorage = disableStorage;

            // GENERIC METHODS
            manager.getScopeKey = getScopeKey;
            manager.fetch = fetch;
            manager.reset = resetList;
            manager.is_fetching = is_fetching;
            manager.is_filtered = is_filtered;
            manager.get_total_count = get_total_count;
            manager.has_error = has_error;
            init();

            ////////////////

            /**
             * Initialize the ListManager
             * @returns {ListManager}
             */
            function init()
            {
                // set the watch on the filters
                if(typeof filters === 'undefined' || filters === undefined)
                {
                    filters = {};
                }
                scope[scope_filters_root_key] = scope[scope_filters_root_key] || {};
                for(var i in filters)
                {
                    var filter = filters[i];
                    manager.watchFilter(filter);
                }
                return manager;
            }

            // LOADING

            function loaderEnabled()
            {
                return !!loader;
            }

            function enableLoader()
            {
                loader = loadingManager.instance(scope, 'lm_loader');
            }

            function isLoading()
            {
                return loader && loader.is_loading();
            }

            function isLoaded()
            {
                return loader && loader.is_loaded();
            }

            // PAGINATION
            function enablePagination()
            {
                pagination_enabled = true;
                paginator = listPaginator.instance(scope, fetch);
            }

            // AGGREGATION
            function enableAggregation()
            {
                config.aggregate = true;
            }

            function disableAggregation()
            {
                config.aggregate = false;
            }

            function aggregationEnabled()
            {
                return config.aggregate;
            }

            // STORAGE
            function enableStorage(storer)
            {
                if(!!storer)
                {
                    if(_stateStorageIsValid(storer))
                    {
                        list_storage = storer;
                        config.storage = true;
                    }
                    else
                    {
                        $log.error('[listManager] ERROR :: list state storage is not valid, storage will be disabled !');
                    }
                }
                else
                {
                    config.storage = true;
                }
            }

            function disableStorage()
            {
                config.storage = false;
                if(pagination_enabled)
                {
                    paginator.disabledStorage();
                }
            }

            function storageEnabled()
            {
                return config.storage;
            }

            function setItemsByPage(items_by_page)
            {
                paginator.setItemsByPage(items_by_page);
            }

            /////// FILTERS
            function getFilters()
            {
                return filters;
            }

            /**
             * Register a filter
             * @param type its type
             * @param key its key
             * @param default_value its default value
             * @param params an array with possibly keys :
             * - value for initial value (if different from default)
             * - force_bool if the filter must always be a boolean value
             * @returns {*}
             */
            function registerFilter(type, key, default_value, params)
            {
                if(filters[key])
                {
                    throw "This filter is already registered !";
                }
                var filter = listFilter.instance(type, key, default_value, params);
                filters[key] = filter;

                initScopeModelValue(filter);
                manager.watchFilter(filter);
                return filter;
            }

            /**
             * Remove a filter from the filter list and unwatch it.
             * @param key the desired filter key
             */
            function removeFilter(key)
            {
                if(!filters[key])
                {
                    return;
                }

                manager.unwatchFilter(filters[key]);
                delete filters[key];
            }

            /**
             * Add a watcher to a given filter to track any filter modifications.
             * @param filter the desired filter.
             */
            function watchFilter(filter)
            {
                if(!filter)
                {
                    return;
                }
                var watch_key = manager.getScopeKey(filter);
                if(filter.type === 'generic')
                {
                    filter.unwatcher = scope.$watch(watch_key, function(now, ex){
                        if(ex !== now)
                        {
                            if(now !== undefined)
                            {
                                filterChanged(filter, now);
                            }
                            // prevent the autofetch
                            if(filter.isolated)
                            {
                                filter.isolated = false;
                                return;
                            }
                            manager.fetch();
                        }
                    });
                }
                else if(filter.type === 'search')
                {
                    filter.handler = multipleRequestHandler.instance(manager.fetch);
                    filter.unwatcher = scope.$watch(watch_key, function(now, ex){
                        if(ex !== now)
                        {
                            if(now !== undefined)
                            {
                                filterChanged(filter, now);
                            }
                            filter.handler.value_changed(now, ex);
                        }
                    });
                }
            }

            function filterChanged(filter, value)
            {
                filter.setValue(value);
                if(pagination_enabled)
                {
                    paginator.set_page(1);
                }
                if(aggregationEnabled())
                {
                    resetList();
                }
            }

            function setFilterValue(filter_key, value, autofetch)
            {
                if(typeof autofetch === 'undefined' || autofetch === undefined)
                {
                    autofetch = true;
                }
                var filter = filters[filter_key];
                if(!!filter)
                {
                    filter.isolated = !autofetch;
                    filter.setValue(value);
                    setScopeModelValue(filter);
                }
            }

            /**
             * Stop watching for a given filter modifications
             * @param filter the desired filter
             */
            function unwatchFilter(filter)
            {
                if(!filter)
                {
                    return;
                }
                if(filter.unwatcher)
                {
                    filter.unwatcher();
                }
            }

            // ORDERING

            function orderChanged(ordering)
            {
                if(pagination_enabled)
                {
                    paginator.set_page(1);
                }
                if(aggregationEnabled())
                {
                    resetList();
                }
                manager.fetch();
            }

            function enableOrdering(default_ordering, enable_watching)
            {
                if(typeof enable_watching === 'undefined' || enable_watching === undefined)
                {
                    enable_watching = false;
                }
                if(typeof default_ordering === 'undefined' || default_ordering === undefined)
                {
                    default_ordering = null;
                }
                ordering_enabled = true;
                orderer = listOrderer.instance(scope, orderChanged, default_ordering);
                if(enable_watching)
                {
                    orderer.enableWatching();
                }
            }

            function enableOrderingWatch()
            {
                if(ordering_enabled)
                {
                    orderer.enableWatching();
                }
            }

            function setOrdering(ordering)
            {
                if(ordering_enabled)
                {
                    orderer.setOrdering(ordering);
                }
            }

            function addOrdering(ordering)
            {
                if(ordering_enabled)
                {
                    orderer.addOrdering(ordering);
                }
            }

            // GENERIC
            /**
             * Get the scope key corresponding to a filter
             * @param filter the filter desired
             * @returns {string} the scope key
             */
            function getScopeKey(filter)
            {
                return scope_filters_root_key + '.' + filter.key;
            }

            /**
             * Initialize scope model value associated to a filter
             * @param filter the filter to initialize
             */
            function initScopeModelValue(filter)
            {
                if(!scope[scope_filters_root_key])
                {
                    scope[scope_filters_root_key] = {};
                }
                setScopeModelValue(filter);
            }

            /**
             * Initialize scope model value associated to a filter
             * @param filter the filter to initialize
             */
            function setScopeModelValue(filter)
            {
                scope[scope_filters_root_key][filter.key] = filter.value;
            }

            /**
             * Transform filters in query params.
             * @returns {{}}
             */
            function filtersToQueryParams(include_statics)
            {
                if(typeof include_statics === 'undefined' || include_statics === undefined)
                {
                    include_statics = true;
                }
                var query_params = {};
                for(var i in filters)
                {
                    var filter = filters[i];
                    var filter_value = filter.getValue();
                    if((include_statics || !filter.static) && filter_value !== null)
                    {
                        query_params[filter.query_key] = filter_value;
                    }
                }
                return query_params;
            }

            /**
             * Transform pagination in query params.
             * @returns {{}}
             */
            function paginationToQueryParams()
            {
                if(paginator)
                {
                    return paginator.to_query_params();
                }
            }

            /**
             * Transform ordering in query params.
             * @returns {{}}
             */
            function orderingToQueryParams()
            {
                if(orderer)
                {
                    return orderer.to_query_params();
                }
            }

            function _buildQueryParams(include_statics){
                if(typeof include_statics === 'undefined' || include_statics === undefined)
                {
                    include_statics = true;
                }
                var query_params = filtersToQueryParams(include_statics);
                if(pagination_enabled)
                {
                    angular.extend(query_params, paginationToQueryParams());
                }
                if(ordering_enabled)
                {
                    angular.extend(query_params, orderingToQueryParams());
                }
                return query_params;
            }

            /**
             * Fetch entities from server based on current filters value
             * @returns {*}
             */
            function fetch()
            {
                if(loaderEnabled())
                {
                    loader.loading();
                }
                var deferred = $q.defer();
                fetching = true;

                var query_params;

                if(initial_fetch && storageEnabled())
                {
                    var initial_values = list_storage.load_from_storage();
                    setValues(initial_values);
                }
                query_params = _buildQueryParams();
                initial_fetch = false;

                if(storageEnabled())
                {
                    list_storage.new_state(_buildQueryParams(false));
                }
                list_requester(entities_key, query_params)
                    .then(function(data){
                        last_request_status = 0;
                        if(!scope[entities_key])
                        {
                            resetList();
                        }
                        if(aggregationEnabled())
                        {
                            scope[entities_key] = scope[entities_key].concat(data.results);
                        }
                        else
                        {
                            scope[entities_key] = data.results;
                        }
                        // Pagination
                        if(pagination_enabled && paginator)
                        {
                            paginator.update(data);
                        }
                        fetching = false;
                        for(var key in getCallbacks())
                        {
                            if(!!getCallback(key).success)
                            {
                                getCallback(key).success(data);
                            }
                        }
                        if(loaderEnabled())
                        {
                            loader.loaded();
                        }
                        deferred.resolve(data);
                    })
                    .catch(function(response){
                        last_request_status = response.status;
                        // Pagination
                        if(pagination_enabled && paginator)
                        {
                            paginator.update({count:0});
                        }
                        if(!aggregationEnabled())
                        {
                            resetList();
                        }
                        for(var key in getCallbacks())
                        {
                            if(!!getCallback(key).error)
                            {
                                getCallback(key).error(response);
                            }
                        }
                        if(loaderEnabled())
                        {
                            loader.loaded();
                        }
                        deferred.reject(response);
                    })
                ;
                return deferred.promise;
            }

            function setValues(initial_values){
                if(!!initial_values)
                {
                    if(pagination_enabled)
                    {
                        if(!!initial_values.items_by_page)
                        {
                            setItemsByPage(parseInt(initial_values.items_by_page,10));
                        }
                        if(!!initial_values.page)
                        {
                            paginator.set_page(parseInt(initial_values.page, 10));
                        }
                    }
                    if(ordering_enabled)
                    {
                        if(!!initial_values.ordering)
                        {
                            setOrdering(initial_values.ordering);
                        }
                    }
                    for(var key in initial_values)
                    {
                        var initial_value = initial_values[key];
                        if(['items_by_page', 'page', 'ordering'].indexOf(key) < 0)
                        {
                            setFilterValue(key, initial_value);
                        }
                    }
                }
            }

            function resetList()
            {
                scope[entities_key] = [];
            }

            function is_fetching()
            {
                return fetching;
            }

            function is_filtered(ignore_list)
            {
                for(var i in filters)
                {
                    var filter = filters[i];
                    if(!ignore_list[i] && !filter.hasDefaultValue())
                    {
                        return true;
                    }
                }
                return false;
            }

            function get_total_count()
            {
                if(pagination_enabled && paginator)
                {
                    return paginator.get_total_count();
                }
                return undefined;
            }

            /////// CALLBACKS
            function getCallback(key)
            {
                return fetch_callbacks[key];
            }

            function getCallbacks()
            {
                return fetch_callbacks;
            }

            function registerCallback(key, callback)
            {
                fetch_callbacks[key] = callback;
            }

            function removeCallback(key)
            {
                delete fetch_callbacks[key];
            }

            function has_error()
            {
                return last_request_status > 0;
            }
        }
    }
})();

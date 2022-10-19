define([
    "uiComponent",
    "uiRegistry",
    "mage/storage",
    "freedom/ko",
    "jquery",
    "Bangra_Control/js/messages",
    "mage/url",
    "mage/loader"
], function (Component, registry, storage, ko, $, messagesContainer, url) {
    let messages = messagesContainer();
    return Component.extend({
        defaults           : {
            template  : {
                name: "Bangra_Control/clinics/list",
            },
            models         : ko.observableArray(),
            images         : ko.observableArray(),
            catalogs       : {},
            currentModel   : ko.observable(null),
            count          : ko.observable(0),
            filter         : ko.observable('').extend({rateLimit: {timeout: 300, method: "notifyWhenChangesStop"}}),
            order          : ko.observable("id"),
            orderDirection : ko.observable("asc"),
            page           : ko.observable(1),
            pages          : ko.observableArray([]),
            pageSize       : ko.observable(20),
            pageCount      : ko.observable(0),
            loading        : ko.observable(true),
            show           : ko.observable(true),
            request        : null,
            form           : null,
        },
        initialize : function () {
            this._super();
            this.initialized = true;
            this.loadModels();
            this.filter.subscribe(this.loadModels.bind(this));
            this.order.subscribe(this.loadModels.bind(this));
            this.orderDirection.subscribe(this.loadModels.bind(this));
            this.page.subscribe(this.loadModels.bind(this));
            let body = $('body');
            this.loading.subscribe(function(value){
                if(value){
                    body.trigger('processStart');
                } else {
                    body.trigger('processStop');
                }
            }.bind(this));
            this.page.subscribe(function(){
                this.loadModels();
            }.bind(this));
        },
        calculatePages: function() {
            let pages = [];
            var start = this.page() < 6 ? 1 : (this.page() - 5);
            var end   = start + 10;
            if(this.pageCount() > 10){
                if(end > this.pageCount()){
                    end   = this.pageCount();
                    start = end - 10;
                }
            } else {
                start = 1;
                end   = this.pageCount();
            }
            for(i = start; i <= end; i++) {
                pages.push(i);
            }
            this.pages(pages);
        },
        loadModels: function () {
            if (this.request !== null && this.request.readyState != 4) {
                this.request.abort();
            }
            this.loading(true);
            this.request = storage.get(
                this.generateUrl()
            ).done(
                function (response) {
                    this.images(response.images);
                    this.models(response.models);
                    this.count(response.count);
                    this.pageCount(Math.ceil(response.count / this.pageSize()));
                    this.calculatePages();
                    this.loading(false);
                }.bind(this)
            ).fail(
                function (response) {
                    this.models([]);
                    this.count(0);
                    this.pageCount(0);
                    this.request = null;
                    this.loading(false);
                    this.pages([]);
                }.bind(this)
            ).complete(
                function (response) {
                    if (undefined !== response.responseJSON && undefined !== response.responseJSON.redirect) {
                        window.location = response.responseJSON.redirect;
                    }
                    this.loading(false);
                    messages.timedClear();
                    this.request = null;
                }.bind(this)
            );
        },
        setOrder: function(field) {
            return function () {
                if(this.order() !==  field) {
                    this.orderDirection(this.orderDirection() !==  'desc' ? 'desc' : 'asc');
                    this.order(field);
                } else {
                    this.orderDirection(this.orderDirection() !==  'desc' ? 'desc' : 'asc');
                }
            }.bind(this)
        },
        getOrderCssClass: function(field) {
            if(this.order() !==  field) {
                return 'field-sorter';
            } else {
                if(this.orderDirection() == 'desc') {
                    return 'field-sorter field-sort-desc';
                } else {
                    return 'field-sorter field-sort-asc';
                }
            }
        },
        setPage: function(page) {
            return function () {
                if(this.page() !== page) {
                    this.page(page);
                }
            }.bind(this)
        },
        setPageSize: function(pageSize) {
            return function () {
                this.pageSize(pageSize);
            }.bind(this)
        },
        edit: function(model) {
            return function () {
                let form = registry.get('bangra_clinic_form');
                form.setModel(model, true);
                this.show(false);
            }.bind(this);
        },
        create: function(model) {
            return function () {
                this.show(false);
                let form = registry.get('bangra_clinic_form');
                form.setModel({});
                form.show(true);
            }.bind(this);
        },
        getCatalog      : function(catalog){
            if(undefined === this.catalogs[catalog]) {
                return [];
            }

            return this.catalogs[catalog];
        },
        generateUrl: function(){
            return url.build("/control/clinics/search?f=" + this.filter() + "&o=" + this.order() + "&d=" + this.orderDirection() + "&p=" + this.page() + "&ps=" + this.pageSize());
        },
        buildUrl: function(target){
            return url.build(target);
        }
    });
});



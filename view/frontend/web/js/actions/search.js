define(
    [
        "freedom/action/base",
        "freedom/ko",
        "freedom/utils",
        "mage/storage",
        "Magento_Ui/js/modal/alert",
        "underscore"
    ],
    function (FreedomActionBase, ko, utils, storage, alert, _) {

        return FreedomActionBase.extend({
            request  : null,
            page     : ko.observable(1),
            pages    : ko.observableArray([]),
            pageSize : ko.observable(20),
            pageCount: ko.observable(0),
            count    : ko.observable(0),
            getUrl   : function (filters, sort) {
                let keys           = Object.keys(filters);
                let searchCriteria = "";
                let criteriaIndex  = 0;
                for (let i = 0; i < keys.length; i++) {
                    let filterField    = keys[i];
                    let filter         = filters[filterField];
                    let field          = filter.field;
                    let condition      = filter.condition;
                    let filterValue    = filter();
                    let tmpFilterValue = filterValue;
                    let isArray        = _.isArray(filterValue);
                    if (isArray) {
                        tmpFilterValue = filterValue.join(",")
                        if (!utils.isEmpty(tmpFilterValue)) {
                            for (let j = 0; j < filterValue.length; j++) {
                                searchCriteria += "&searchCriteria[filter_groups][" + criteriaIndex + "][filters][" + j + "][field]=" + field +
                                    "&searchCriteria[filter_groups][" + criteriaIndex + "][filters][" + j + "][value]=" + filterValue[j] +
                                    "&searchCriteria[filter_groups][" + criteriaIndex + "][filters][" + j + "][condition_type]=" + condition;
                            }
                            criteriaIndex++;
                        }
                    } else {
                        if (!utils.isEmpty(tmpFilterValue)) {
                            searchCriteria += "&searchCriteria[filter_groups][" + criteriaIndex + "][filters][0][field]=" + field +
                                "&searchCriteria[filter_groups][" + criteriaIndex + "][filters][0][value]=" + filterValue +
                                "&searchCriteria[filter_groups][" + criteriaIndex + "][filters][0][condition_type]=" + condition;
                            criteriaIndex++;
                        }
                    }
                }
                keys                = Object.keys(sort);
                let sortConsecutive = 0;
                for (let i = 0; i < keys.length; i++) {
                    let field = keys[i];
                    let dir   = sort[keys[i]]();
                    if (dir === "") {
                        continue;
                    }
                    searchCriteria += "&searchCriteria[sortOrders][" + sortConsecutive + "][field]=" + field + "&searchCriteria[sortOrders][" + sortConsecutive + "][direction]=" + dir;
                    sortConsecutive++
                }
                return `rest/V1/${this.baseUrl}?searchCriteria[pageSize]=${this.pageSize()}&searchCriteria[currentPage]=${this.page()}${searchCriteria}`;
            },
            execute(filters, sort) {
                let self = this;
                self.loading(true);
                if (self.request !== null) {
                    self.cancel();
                }
                return new Promise(function (success, reject) {
                    self.request = storage.get(
                        self.getUrl(filters, sort)
                    ).done(
                        function (result) {
                            self.calculatePages(result);
                            success(result)
                            self.loading(false);
                        }.bind(this)
                    ).fail(
                        function (response) {
                            self.loading(false);
                            _.defaults(response,
                                {
                                    status      : null,
                                    responseJSON: {
                                        message: '',
                                    }
                                });
                            switch (response.status) {

                                case 401: // The authorization is failed.
                                case 403: // Access denied.
                                    window.location = BASE_URL;
                                    break;
                                case 500: // Resource internal error.
                                case 404: // Resource not found.
                                case 405: // Resource does not support method. / Resource method not implemented yet.
                                case 406: // The requested resource doesn’t accept the request.
                                case 400:
                                default:
                                    // The request data is invalid.
                                    if (self.showFailAlert(response)) {
                                        alert({
                                            title  : self.getFailTitle(response),
                                            content: response.responseJSON.message,
                                            actions: {
                                                always: function () {
                                                    reject(response)
                                                }
                                            }
                                        });
                                    } else {
                                        reject(response)
                                    }
                            }
                        }.bind(this)
                    ).complete(
                        function () {
                            self.loading(false);
                            self.request = null;
                        }.bind(this)
                    );
                });
            },
            calculatePages(result) {
                this.pageCount(Math.ceil(result.total_count / this.pageSize()));
                this.count(result.total_count);
                let pages = [];
                var start = this.page() < 6 ? 1 : (this.page() - 5);
                var end   = start + 7;
                if (this.pageCount() > 7) {
                    if (end > this.pageCount()) {
                        end   = this.pageCount();
                        start = end - 7;
                    }
                } else {
                    start = 1;
                    end   = this.pageCount();
                }
                for (i = start; i <= end; i++) {
                    pages.push(i);
                }
                this.pages(pages);
            }
        });
    }
);

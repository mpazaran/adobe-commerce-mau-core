define([
    "uiComponent",
    "uiRegistry",
    "freedom/action/search",
    "freedom/utils",
    "freedom/ko",
    "jquery",
    "underscore",
    "mage/translate",
], function (Component, registry, ActionSearch, utils, ko, $, _, __) {
    return Component.extend({
        formRegistryKey : null,
        actionSearch    : null,
        apiEndPoint     : "",
        defaultSortId   : "id",
        defaultSortOrder: "asc",
        showPager       : true,
        definedColumns  : null,
        filters         : {},
        sort            : {},
        sortClass       : {},
        defaults        : {
            template    : {
                name: "Freedom_Core/crud/list"
            },
            models      : ko.observableArray(),
            currentModel: ko.observable(null),
            filter      : ko.observable('').extend({rateLimit: {timeout: 300, method: "notifyWhenChangesStop"}}),
            show        : ko.observable(true),
            request     : null,
            form        : null,
        },
        initialize() {
            this._super();
            this.actionSearch = ActionSearch(this.getActionSearchOptions())
            this.getColumnsDefinition();
            this.loadModels();
            this.filter.subscribe(this.loadModels.bind(this));
            this.actionSearch.page.subscribe(this.loadModels.bind(this));
            this.actionSearch.pageSize.subscribe(this.loadModels.bind(this));
        },
        getColumns() {
            return [];
        },
        getColumnsDefinition() {
            if (this.definedColumns === null) {
                let columns         = this.getColumns()
                this.definedColumns = []
                for (let i = 0; i < columns.length; i++) {
                    let column    = columns[i];
                    column.filter = column.filter ? column.filter : {};
                    column.sort   = column.sort ? column.sort : "";
                    if (column.filter !== false) {
                        _.defaults(column.filter, {
                            isRange  : undefined,
                            condition: {
                                from  : null,
                                to    : null,
                                simple: "eq",
                            },
                            template : false,
                            definer  : false,
                            default  : "",
                            keys     : {
                                from  : null,
                                to    : null,
                                simple: null,
                            }
                        })
                    }
                    //eq|finset|from|gt|gteq|in|like|lt|lteq|moreq|neq|nfinset|nin|nlike|notnull|null|to
                    // noinspection FallThroughInSwitchStatementJS
                    switch (column.type) {
                        case "catalog":
                            column.renderer = "catalog"
                            if (column.filter !== false) {
                                column.filter.template  = column.filter.template === false ? "filter-template-catalog" : column.filter.template;
                                column.filter.isRange   = false;
                                column.filter.condition = "finset";
                                column.filter.multiple  = false;
                            }
                            break;
                        case "numeric":
                            column.renderer = column.renderer ? column.renderer : "numeric"
                            if (column.filter !== false) {
                                column.filter.template = column.filter.template === false ? "filter-template-numeric" : column.filter.template;
                                column.filter.isRange  = column.filter.isRange === undefined ? true : column.filter.isRange;
                            }
                            column.cssClass = column.cssClass ? column.cssClass : "text-right";
                            break;
                        case "currency":
                            column.renderer = column.renderer ? column.renderer : "currency"
                            if (column.filter !== false) {
                                column.filter.template = column.filter.template === false ? "filter-template-numeric" : column.filter.template;
                                column.filter.isRange  = column.filter.isRange === undefined ? true : column.filter.isRange;
                            }
                            column.cssClass = column.cssClass ? column.cssClass : "text-right";
                            break;
                        case "date":
                            column.renderer = column.renderer ? column.renderer : "date"
                            column.format   = column.format ? column.format : "Y-m-d H:i:s"
                            if (column.filter !== false) {
                                column.filter.template = column.filter.template === false ? "filter-template-date-range" : column.filter.template;
                                column.filter.isRange  = column.filter.isRange === undefined ? true : column.filter.isRange;
                            }
                            break;
                        case "image":
                            if (column.filter !== false) {
                                column.filter.template = column.filter.template === false ? "filter-template-null-not-null" : column.filter.template;
                                column.filter.isRange  = false;
                            }
                            column.filter.condition = "present"
                            column.renderer         = "image"
                            break;
                        case "file":
                            column.renderer = "file"
                            if (column.filter !== false) {
                                column.filter.template = column.filter.template === false ? "filter-template-null-not-null" : column.filter.template;
                                column.filter.isRange  = false;
                            }
                            return;
                        case "text":
                            if (column.filter !== false) {
                                column.filter.isRange   = false;
                                column.filter.condition = "like";
                            }
                        default:
                            if (column.filter !== false) {
                                column.filter.template = column.filter.template === false ? "filter-template-text" : column.filter.template;
                                column.filter.isRange  = false;
                            }
                            break;
                    }

                    if (column.filter !== false) {
                        if (column.filter.definer) {
                            column.filter.definer(this.filters, column);
                        } else {
                            if (column.filter.isRange) {
                                try {
                                    // noinspection JSPrimitiveTypeWrapperUsage
                                    column.filter.condition.from = column.filter.condition.from ? column.filter.condition.from : "gteq";
                                } catch (e) {
                                    // noinspection JSPrimitiveTypeWrapperUsage
                                    column.filter.condition.from = "gteq";
                                }
                                try {
                                    // noinspection JSPrimitiveTypeWrapperUsage
                                    column.filter.condition.to = column.filter.condition.to ? column.filter.condition.to : "lteq";
                                } catch (e) {
                                    // noinspection JSPrimitiveTypeWrapperUsage
                                    column.filter.condition.to = "lteq";
                                }
                            } else {
                                column.filter.condition = column.filter.condition ? column.filter.condition : "eq";
                            }

                            if (column.filter.isRange === true) {
                                column.filter.keys.from               = column.field + "_" + column.filter.condition.from;
                                column.filter.keys.to                 = column.field + "_" + column.filter.condition.to;
                                this.filters[column.filter.keys.from] = this.iniitializeFilter(column.field, column.filter.condition.from, column.filter.default);
                                this.filters[column.filter.keys.to]   = this.iniitializeFilter(column.field, column.filter.condition.to, column.filter.default);
                            } else {
                                column.filter.keys.simple               = column.field + "_" + column.filter.condition;
                                this.filters[column.filter.keys.simple] = this.iniitializeFilter(column.field, column.filter.condition, column.filter.default);
                            }
                        }
                    }
                    this.definedColumns.push(column);
                    this.sort[column.field] = ko.observable(column.sort);
                    if (column.sort === "ASC") {
                        this.sortClass[column.field] = ko.observable("field-sorter field-sort-asc");
                    } else {
                        if (column.sort === "DESC") {
                            this.sortClass[column.field] = ko.observable("field-sorter field-sort-desc");
                        } else {
                            this.sortClass[column.field] = ko.observable("field-sorter field-sort-neutral");
                        }
                    }
                    window.sort = this.sort;
                }
            }
            return this.definedColumns;
        },
        iniitializeFilter(field, condition, defaultValue) {
            let filter = ko.observable(defaultValue ? defaultValue : "").extend({
                rateLimit: {
                    timeout: 300,
                    method : "notifyWhenChangesStop"
                }
            })
            filter.subscribe(this.loadModels.bind(this))
            filter.field     = field;
            filter.condition = condition;
            return filter;
        },
        getActionSearchOptions() {
            return {
                baseUrl: this.apiEndPoint
            }
        },
        loadModels() {
            let self = this;
            self.actionSearch.execute(self.filters, self.sort).then(function (result) {
                self.models(result.items);
            })
        },
        setOrder(field) {
            return function () {
                if (this.sort[field]() === false) {
                    return;
                }
                if (this.sort[field]() === "") {
                    this.sort[field]("ASC")
                    this.sortClass[field]("field-sorter field-sort-asc");
                } else {
                    if (this.sort[field]() === "ASC") {
                        this.sort[field]("DESC")
                        this.sortClass[field]("field-sorter field-sort-desc");
                    } else {
                        this.sort[field]("")
                        this.sortClass[field]("field-sorter field-sort-neutral");
                    }
                }
                this.loadModels();
            }.bind(this)
        },
        setPage(page) {
            return function () {
                if (this.actionSearch.page() !== page) {
                    this.actionSearch.page(page);
                }
            }.bind(this)
        },
        setPageSize(pageSize) {
            return function () {
                this.actionSearch.pageSize(pageSize);
            }.bind(this)
        },
        getActions() {
            return [
                {
                    label: __("New"),
                    click: function (list) {
                        this.show(false);
                        let form = registry.get(this.formRegistryKey);
                        form.setModel({});
                        form.show(true);
                    }
                }
            ]
        },
        getRowActions(model) {
            return [
                {
                    icon : 'edit',
                    click: function () {
                        let form = registry.get(this.formRegistryKey);
                        let list = this;
                        form.load(model.id).then(function () {
                            list.show(false);
                            form.show(true);
                        });
                    }
                }
            ]
        },
        sanitizeActions(actions) {
            let sanitizedActions = [];
            for (let i = 0; i < actions.length; i++) {
                sanitizedActions.push(
                    _.defaults(actions[i], {
                        label: "",
                        click: function () {
                        },
                        icon : false
                    })
                );
            }
            return sanitizedActions;
        },
        renderCell(column, model) {
            if (column.renderer) {
                if (typeof column.renderer === "function") {
                    return column.renderer(model);
                } else {
                    let value = model[column.field];
                    switch (column.renderer) {
                        case "currency":
                            return utils.currency(
                                value,
                                column.sign,
                                column.decimals,
                                column.space
                            )
                        case "numeric":
                            return utils.number(
                                value * 1000,
                                column.sign,
                                column.decimals,
                                column.space
                            )
                        case "date":
                            let format = column.format ? column.format : "Y-m-d H:i:s"
                            return "";
                        case "image":
                            return "";
                        case "file":
                            return;
                        case "catalog":
                            return column.filter.catalog.text(_.isArray(value) ? value : value.split(","));
                        default:
                            console.debug("Undefined renderer " + column.renderer)
                            return value;
                    }
                }
            } else {

                return model[column.field];
            }
        },
        getRowActionsActions(model) {
            return [
                {
                    'edit' : 'Edit',
                    'click': this.edit
                }
            ]
        },
    });
});



define(
    [
        "uiClass",
        "mage/storage",
        "underscore",
        "mage/translate",
        "freedom/ko",
        "freedom/utils",
        "jquery"
    ],
    function (Class, storage, _, __, ko, utils, $) {

        return Class.extend({
            isAction : true,
            component: null,
            strings  : {
                successTitle  : "Success",
                successContent: "Done!",
                failTitle     : "Warning",
                failContent   : "Something is wrong!"
            },
            options  : {
                showSuccessAlert: true,
                showFailAlert   : true,
                modelIdField    : "id"
            },
            baseUrl  : "",
            loading : ko.observable(false),
            initialize(options) {
                _.defaults(options, {
                    component: null,
                    strings  : {},
                    options  : {},
                    baseUrl  : ""
                })
                // noinspection JSUnresolvedVariable
                _.defaults(options.strings, this.strings)
                // noinspection JSUnresolvedVariable
                _.defaults(options.options, this.options)
                // noinspection JSUnresolvedVariable
                this.component = options.component;
                // noinspection JSUnresolvedVariable
                this.strings   = options.strings;
                // noinspection JSUnresolvedVariable
                this.options   = options.options;
                // noinspection JSUnresolvedVariable
                this.baseUrl   = options.baseUrl;

                let body = $("body")
                this.loading.subscribe(function (value) {
                    if (value) {
                        body.trigger('processStart');
                    } else {
                        body.trigger('processStop');
                    }
                });

            },
            getSuccessTitle() {
                return __(this.strings.successTitle)
            },
            getFailTitle() {
                return __(this.strings.failTitle);
            },
            getSuccessContent() {
                return __(this.strings.successContent);
            },
            showSuccessAlert() {
                return this.options.showSuccessAlert;
            },
            showFailAlert() {
                return this.options.showFailAlert;
            },
            getUrl(data) {
                return "rest/V1/" + this.baseUrl + (this.isNew(data) ? "" : ("/" + data[this.options.modelIdField]));
            },
            isNew(data) {
                return !utils.isNumeric(data[this.options.modelIdField]);
            },
            execute(
                data,
                onSuccess,
                onFail
            ) {
                throw new Error("Event must be overwritten");
            }
        });

    }
);

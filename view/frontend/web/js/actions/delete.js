define(
    [
        "freedom/action/base",
        "mage/storage",
        "Magento_Ui/js/modal/alert",
        "Magento_Ui/js/modal/confirm",
        "underscore",
        "mage/translate"
    ],
    function (FreedomActionBase, storage, alert, confirm, _, __) {

        return FreedomActionBase.extend({
            getConfirmDeleteTitle() {
                return __(this.strings.confirmDeleteTitle);
            },
            getConfirmDeleteContent() {
                return __(this.strings.confirmDeleteContent);
            },
            getUrl(data) {
                return "rest/V1/" + this.baseUrl + "/" + data[this.options.modelIdField];
            },
            initialize(options) {
                this._super();
                this.strings.confirmDeleteTitle   = "Confirm delete";
                this.strings.confirmDeleteContent = "Do you really want delete the item?";
            },
            execute(data) {
                let self = this;
                return new Promise(function (success, reject) {
                    confirm({
                            title  : self.getConfirmDeleteTitle(),
                            content: self.getConfirmDeleteContent(),
                            actions: {
                                confirm: function () {
                                    self.loading(true);
                                    storage.delete(
                                        self.getUrl(data),
                                        JSON.stringify({
                                            model: data
                                        })
                                    ).done(
                                        function (model) {
                                            if (self.showSuccessAlert()) {
                                                alert(
                                                    {
                                                        title  : self.getSuccessTitle(),
                                                        content: self.getSuccessContent(),
                                                        actions: {
                                                            always: function () {
                                                                success(model)
                                                            }
                                                        }
                                                    }
                                                );
                                            } else {
                                                success(model)
                                            }
                                        }
                                    ).fail(
                                        function (response) {
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
                                        }
                                    ).complete(
                                        function () {
                                            self.loading(false);
                                        }
                                    );
                                }
                            }
                        }
                    );
                })
            }
        });
    }
);


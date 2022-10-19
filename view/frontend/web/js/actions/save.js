define(
    [
        "freedom/action/base",
        "mage/storage",
        "Magento_Ui/js/modal/alert",
        "underscore"
    ],
    function (FreedomActionBase, storage, alert, _) {

        return FreedomActionBase.extend({
            execute(data) {
                let self = this;
                return new Promise(function (success, reject) {
                    self.loading(true);
                    let isNew = self.isNew(data);
                    if (isNew) {
                        data[self.options.modelIdField] = null;
                    }
                    storage[isNew ? 'post' : 'put'](
                        self.getUrl(data),
                        JSON.stringify({
                            model: data
                        })
                    ).done(
                        function (model) {
                            self.loading(false);
                            if (self.showSuccessAlert(model)) {
                                alert(
                                    {
                                        title  : self.getSuccessTitle(model),
                                        content: self.getSuccessContent(model),
                                        actions: {
                                            always: function () {
                                                success(model)
                                            }.bind(this)
                                        }
                                    }
                                );
                            } else {
                                success(model)
                            }
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
                        }
                    ).complete(
                        function () {
                            self.loading(false);
                        }
                    );
                });
            }
        });
    }
);

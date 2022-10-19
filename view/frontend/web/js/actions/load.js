define(
    [
        "freedom/action/base",
        "mage/storage",
        "Magento_Ui/js/modal/alert",
        "underscore"
    ],
    function (FreedomActionBase, storage, alert, _) {

        return FreedomActionBase.extend({
            getUrl(id) {
                return "rest/V1/" + this.baseUrl + "/" + id;
            },
            execute(id) {
                let self = this;
                self.loading(true);
                return new Promise(function (success, reject) {
                    storage.get(
                        self.getUrl(id)
                    ).done(
                        function (model) {
                            success(model)
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
                            console.debug(response)
                            switch (response.status) {
                                case 401: // The authorization is failed.
                                case 403: // Access denied.
                                    //window.location = BASE_URL;
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
                        }.bind(this)
                    );
                });
            }
        });
    }
);

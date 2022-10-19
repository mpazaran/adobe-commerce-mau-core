define([
    "uiComponent",
    "uiRegistry",
    "mage/storage",
    "mage/translate",
    "mage/validation",
    "Magento_Ui/js/modal/alert",
    "Magento_Ui/js/modal/confirm",
    "jquery",
    "freedom/ko",
    "Freedom_Core/js/messages",
    "mage/loader"
], function (Component, registry, storage, __, validation, alert, confirm, $, ko, messagesContainer) {
    let messages = messagesContainer();
    return Component.extend({
        defaults        : {
            map                       : null,
            marker                    : new google.maps.Marker({}),
            template                  : {
                name       : "Bangra_Control/clinics/form",
                afterRender: function (renderedNodesArray, data) {

                }
            },
            model                     : {
                id       : ko.observable(''),
                name     : ko.observable(''),
                address  : ko.observable(''),
                image    : ko.observable(''),
                phone    : ko.observable(''),
                phone_2  : ko.observable(''),
                latitude : ko.observable(''),
                longitude: ko.observable(''),
            },
            loading                   : ko.observable(false),
            form                      : null,
            images                    : ko.observable({}),
            loadedClinicProcedures    : ko.observableArray([]),
            artificialClinicProcedures: ko.observableArray([]),
        },
        show            : ko.observable(false),
        setModel        : function (data, show) {
            let dataModel = _.defaults(data, {
                id       : null,
                name     : null,
                address  : null,
                image    : null,
                phone    : null,
                phone_2  : null,
                latitude : null,
                longitude: null,
            });
            this.model.id(dataModel.id);
            this.model.name(dataModel.name);
            this.model.address(dataModel.address);
            this.model.image(dataModel.image);
            this.model.phone(dataModel.phone);
            this.model.phone_2(dataModel.phone_2);
            this.model.latitude(dataModel.latitude);
            this.model.longitude(dataModel.longitude);
            if (this.model.id()) {
                let list = registry.get('bangra_clinic_list')
                if (undefined !== list.images()[this.model.id()]) {
                    this.images(list.images()[this.model.id()]);
                }
                this.marker.setPosition({
                    lat: parseFloat(dataModel.latitude),
                    lng: parseFloat(dataModel.longitude)
                });
            }
            clinicProcedureService.loadByClinic(this.model.id(), this.loadedClinicProcedures);
            this.artificialClinicProcedures([]);
            for (let i = 0; i < this.procedures.length; i++) {
                let procedure = this.procedures[i];
                let clinicProcedure = clinicProcedureService.createWithObservables();
                clinicProcedure.procedure_id(procedure.value);
                clinicProcedure.clinic_id(this.model.id());
                this.artificialClinicProcedures.push(clinicProcedure)
            }
            if (show === true) {
                this.show(true)
            }
        },
        initialize      : function () {
            this._super();
            let body = $('body');
            this.loading.subscribe(function (value) {
                if (value) {
                    body.trigger('processStart');
                } else {
                    body.trigger('processStop');
                }
            }.bind(this));
            this.setModel({});
            this.loadedClinicProcedures.subscribe(function (clinicProcedureList) {
                for (let i = 0; i < clinicProcedureList.length; i++) {
                    let clinicProcedure = clinicProcedureList[i];
                    let artificialClinicProcedure = _.find(this.artificialClinicProcedures(), function(item){
                        return item.clinic_id() == clinicProcedure.clinic_id &&
                            item.procedure_id() == clinicProcedure.procedure_id;
                    });
                    if(artificialClinicProcedure !== undefined) {
                        artificialClinicProcedure.id(clinicProcedure.id);
                        artificialClinicProcedure.enabled(ko.utils.isTrue(clinicProcedure.enabled));
                        artificialClinicProcedure.custom_price(ko.utils.isTrue(clinicProcedure.custom_price));
                        artificialClinicProcedure.price(clinicProcedure.price);
                    }
                }
            }.bind(this))
        },
        back            : function (reload) {
            let list = registry.get('bangra_clinic_list');
            if (reload === true) {
                list.loadModels();
            }
            list.show(true);
            this.show(false);
        },
        save            : function (back) {
            return function () {
                if (this.form.validation('isValid')) {
                    this.loading(true);
                    let data = ko.toJSON({
                        model              : this.model,
                        clinicProcedureList: this.artificialClinicProcedures,
                    });
                    storage.post(
                        "control/clinics/save",
                        data
                    ).done(
                        function (response) {
                            if (response.ok) {
                                this.setModel(response.model);
                                if (back) {
                                    this.back(true)
                                }
                            }
                        }.bind(this)
                    ).fail(
                        function (response) {
                        }.bind(this)
                    ).complete(
                        function (response) {
                            if (undefined !== response.responseJSON.redirect) {
                                window.location = response.responseJSON.redirect;
                            }
                            this.loading(false);
                            messages.timedClear();
                        }.bind(this)
                    );
                }
            }.bind(this);
        },
        remove          : function () {
            confirm({
                title  : __('Confirm delete'),
                content: __('Do you really confirm delete?'),
                actions: {
                    confirm: function () {
                        this.loading(true);
                        storage.delete(
                            "control/clinics/delete/id/" + this.model.id()
                        ).done(
                            function (response) {
                                if (response.ok) {
                                    this.back(true);
                                }
                            }.bind(this)
                        ).fail(
                            function (response) {
                            }.bind(this)
                        ).complete(
                            function (response) {
                                if (undefined !== response.responseJSON.redirect) {
                                    window.location = response.responseJSON.redirect;
                                }
                                this.loading(false);
                                messages.timedClear();
                            }.bind(this)
                        );
                    }.bind(this),
                    cancel : function () {
                    }.bind(this),
                    always : function () {
                    }.bind(this)
                }
            });
        },
        openFileSelector: function (selector, field) {
            let $scope = this;
            return function () {
                let fileSelector = $(selector);
                fileSelector.trigger("click");

                if (!fileSelector.data('initialized')) {
                    let reader = new FileReader();
                    reader.onload = function () {
                        $scope.loading(true);
                        let result = reader.result;
                        let img = new Image;
                        img.src = result.toString();
                        img.onload = function () {

                            /**
                             * Large images not allowed
                             */
                            if (img.width > 3000 || img.height > 4000) {
                                messages.addErrorMessage("Image width or height are not valid, maximum allowed size is 3000 x 4000.");
                                $scope.loading(false);
                                return;
                            }

                            storage.post(
                                "control/clinics/upload_image",
                                JSON.stringify({
                                    base64: result,
                                    field : field,
                                })
                            ).done(
                                function (response) {
                                    if (response.ok) {
                                        $scope.model[field](response.value);
                                        let images = $scope.images();
                                        images[field] = {
                                            original : response.original,
                                            thumbnail: response.thumbnail
                                        };
                                        $scope.images(images);
                                        $scope.model[field].valueHasMutated();
                                    }
                                    $scope.loading(false);
                                }
                            ).fail(
                                function (response) {
                                }
                            ).complete(
                                function (response) {
                                    if (undefined !== response.responseJSON.redirect) {
                                        window.location = response.responseJSON.redirect;
                                    }
                                    $scope.loading(false);
                                    messages.timedClear();
                                }
                            );
                        };
                    }.bind(this);

                    reader.onerror = function (error) {

                    }.bind(this);

                    fileSelector.change(function () {
                        /**
                         * Only images are allowed
                         */
                        let regex = new RegExp(/gif|jpg|jpeg|png/, 'i');
                        if (!regex.test(fileSelector[0]['files'][0].type.toLowerCase())) {
                            messages.addErrorMessage("Only images are allowed.");
                            $scope.loading(false);
                            return;
                        }
                        reader.readAsDataURL(fileSelector[0]['files'][0]);
                    });

                    fileSelector.data('initialized', true)
                }
            }
        },
        getThumbnail    : function (field) {
            if (this.images()[field]) {
                return this.images()[field].thumbnail;
            }
            return null;
        },
        getOriginalImage: function (field) {
            if (this.images()[field]) {
                return this.images()[field].original;
            }
            return null;
        },
        clearImage      : function (field) {
            return function () {
                let images = this.images;
                delete images[field];
                this.images(images);
                this.model[field]("");
                this.model[field].valueHasMutated();
            }.bind(this);
        },
    });
});



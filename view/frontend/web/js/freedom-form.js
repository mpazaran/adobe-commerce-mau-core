define([
    "uiComponent",
    "uiRegistry",
    "mage/validation",
    "jquery",
    "freedom/ko",
    "freedom/action/save",
    "freedom/action/delete",
    "freedom/action/load",
    "underscore",
    "freedom/utils"
], function (
    Component,
    registry,
    validation,
    $,
    ko,
    ActionSave,
    ActionDelete,
    ActionLoad,
    _,
    utils) {

    return Component.extend({
        formSelector   : null,
        listRegistryKey: null,
        actionSave     : null,
        actionDelete   : null,
        actionLoad     : null,
        apiEndPoint    : "",
        defaults       : {
            template: {
                name       : '',
                afterRender: function (renderedNodesArray, data) {
                    data.form = $(data.formSelector);
                    data.form.validation();
                }
            },
            model   : {},
            form    : null,
        },
        show           : ko.observable(false),
        setModel(data) {
            console.debug(this)
            console.warn("Method setModel must be overwritten");
        },
        _getData() {
            return ko.toJS(this.getModel())
        },
        getData() {
            return this._getData();
        },
        getModel() {
            return this.model;
        },
        getActionSaveOptions() {
            return {
                baseUrl: this.apiEndPoint
            }
        },
        getActionDeleteOptions() {
            return {
                baseUrl: this.apiEndPoint
            }
        },
        getActionLoadOptions() {
            return {
                baseUrl: this.apiEndPoint
            }
        },
        onSave(data) {
            console.debug(data)
        },
        onSaveFail(data) {
            console.debug(data)
        },
        onDelete(data) {
            console.debug(data)
        },
        onDeleteFail(data) {
            console.debug(data)
        },
        initialize() {
            this._super();
            this.actionSave   = ActionSave(this.getActionSaveOptions())
            this.actionDelete = ActionDelete(this.getActionDeleteOptions())
            this.actionLoad   = ActionLoad(this.getActionLoadOptions())
            this.setModel({});
        },
        load(id) {
            return this.actionLoad.execute(id).then(function (model) {
                this.setModel(model);
                return model
            }.bind(this));
        },
        back(reload) {
            if (this.listRegistryKey) {
                let list = registry.get(this.listRegistryKey);
                if (reload === true) {
                    list.loadModels();
                }
                list.show(true);
                this.show(false);
            }
        },
        _save(back) {
            if (this.form.validation('isValid')) {
                let data = this.getData();
                this.actionSave.execute(data).then(function (model) {
                    this.setModel(model);
                    this.onSave(model);
                    if (back) {
                        this.back(true);
                    }
                }).catch(function (response) {
                    this.onSaveFail(response)
                });
            };
        },
        save(formComponent) {
            formComponent._save(false);
        },
        saveBack(formComponent) {
            formComponent._save(true);
        },
        remove() {
            let data = this.getData();
            let self = this;
            this.actionDelete.execute(data).then(function () {
                self.onDelete(data);
                self.back(true)
            }).catch(function (response) {
                self.onDeleteFail(response)
            })
        },
    });
});



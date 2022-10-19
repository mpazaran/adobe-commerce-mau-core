define(
    [
        "freedom/ko",
        "freedom/utils"
    ],
    function (ko, u) {
        FreeCatalog                      = function (definition, options) {
            let constants = Object.keys(definition);
            for (let i = 0; i < constants.length; i++) {
                let key   = constants[i];
                this[key] = definition[key];
            }
            this.options = options;
            for (let i = 0; i < options.length; i++) {
                let option                = options[i];
                this.labels[option.value] = option.label;
            }
        };
        FreeCatalog.prototype.definition = {};
        FreeCatalog.prototype.labels     = {};
        FreeCatalog.prototype.options    = [];
        FreeCatalog.prototype.text       = function (value, def) {
            let source = ko.utils.unwrapObservable(value);
            if (source instanceof Array) {
                let lastIndex = source.length - 1;
                let result    = "";
                for (let i = 0; i < source.length; i++) {
                    if (i > 0 && i < lastIndex) {
                        result += ", " + this.text(source[i]);
                        continue;
                    }
                    if (i === 0) {
                        result = this.text(source[i]);
                        continue;
                    }
                    result += " & " + this.text(source[i]);
                }

                return result;
            }
            if (undefined !== this.labels[source]) {
                return this.labels[source];
            }
            return def;
        };
        FreeCatalog.prototype.getOptions = function () {
            return this.options;
        };

        FreeCatalog.prototype.isOneOf = function (value, indexes) {
            if (indexes === undefined) {
                indexes = Object.keys(this.definition);
            }
            let source = ko.utils.unwrapObservable(value);
            for (let i = 0; i < indexes.length; i++) {
                if (u.equals(source, this.definition[indexes[i]])) {
                    return true
                }
            }
            return false;
        };

        FreeCatalog.prototype.indexOf = function (value) {
            let indexes = Object.keys(this.definition);
            let source  = ko.utils.unwrapObservable(value);
            for (let i = 0; i < indexes.length; i++) {
                if (u.equals(source, this.definition[indexes[i]])) {
                    return indexes[i]
                }
            }
            return -1;
        };

        return FreeCatalog;
    }
);

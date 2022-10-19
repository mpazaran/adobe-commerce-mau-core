define([
    "uiClass",
    "underscore"
], function (Class, _) {
    return Class.extend({
        humanFileSize: function (bytes) {
            switch (true) {
                case bytes < 1024:
                    return bytes + "bytes";
                case bytes < 1048576:
                    return parseFloat(bytes / 1024).toFixed(2) + 'K';
                case bytes < 1073741824:
                    return parseFloat(bytes / 1048576).toFixed(2) + 'M';
                default:
                    return parseFloat(bytes / 1073741824).toFixed(2) + 'G';
            }
        },
        ifElse(condition, onTrue, onFalse) {
            return this.isTrue(condition) ? onTrue : onFalse
        },
        default(value, defaultValue) {
            return this.isTrue(value) ? value : (defaultValue === undefined ? '' : defaultValue);
        },
        /**
         *
         * @param callable
         * @param data
         * @param resolve
         * @param rejected
         * @param maxTries
         * @returns Promise
         */
        promise(callable, data, resolve, rejected, maxTries) {
            maxTries = this.default(maxTries, 1000)
            return new Promise(function () {
                let tries    = 0;
                let interval = setInterval(function () {
                    try {
                        if (callable.apply(data) === true) {
                            clearInterval(interval);
                            resolve(data);
                        } else {
                            tries++;
                            if (tries >= maxTries) {
                                throw new Error("Max tries reached")
                            }
                        }
                    } catch (e) {
                        clearInterval(interval);
                        rejected(e, data);
                    }
                }, 250);
            });
        },
        isTrue(value) {
            return !this.isFalse(value);
        },
        isFalse(value) {
            return (
                value === undefined ||
                value === null ||
                value === false ||
                value === 0 ||
                value === "" ||
                value === [] ||
                value === {} ||
                value === "undefined" ||
                value === "null" ||
                value === "false" ||
                value === "0" ||
                value === "[]" ||
                value === "{}"
            );
        },
        isEmpty(value) {
            return (
                value === undefined ||
                value === null ||
                value === "" ||
                value === [] ||
                value === {} ||
                value === "undefined" ||
                value === "null" ||
                value === "[]" ||
                value === "{}"
            );
        },
        isNumeric(number) {
            try {
                return parseFloat(number).toString() === variable.toString();
            } catch (e) {
                return false
            }
        },
        currency(value, currencySign, decimals, space) {
            currencySign   = this.default(currencySign, "$")
            decimals       = this.default(decimals, 2)
            space          = this.default(space, " ")
            let floatValue = parseFloat(parseFloat(typeof value === 'function' ? value() : value).toFixed());
            if (isNaN(floatValue)) {
                return null;
            }
            let sign = floatValue < 0 ? ("-" + value + space) : (currencySign + space.toString());
            return sign + Math.abs(floatValue).toFixed(decimals).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        },

        number(value, currencySign, decimals, space) {
            currencySign   = this.default(currencySign, "$")
            decimals       = this.default(decimals, 2)
            space          = this.default(space, " ")
            let floatValue = parseFloat(parseFloat(typeof value === 'function' ? value() : value).toFixed());
            if (isNaN(floatValue)) {
                return null;
            }
            let sign = floatValue < 0 ? ("-" + value + space) : (currencySign + space.toString());
            return sign + Math.abs(floatValue).toFixed(decimals).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        },

        equals(a, b) {
            try {
                if (isNaN(a) && isNaN(a)) {
                    if (typeof a === 'object' && a.compare !== undefined && typeof a.compare === 'function') {
                        return a.compare(b);
                    }
                    return a === b;
                }
                return parseFloat(a.toString()) === parseFloat(b.toString())
            } catch (e) {
                return false;
            }
        },

        lt(a, b) {
            try {
                return parseFloat(a.toString()) < parseFloat(b.toString())
            } catch (e) {
                return false;
            }
        },

        lte(a, b) {
            try {
                return parseFloat(a.toString()) <= parseFloat(b.toString())
            } catch (e) {
                return false;
            }
        },

        gt(a, b) {
            try {
                return parseFloat(a.toString()) > parseFloat(b.toString())
            } catch (e) {
                return false;
            }
        },

        gte(a, b) {
            try {
                return parseFloat(a.toString()) >= parseFloat(b.toString())
            } catch (e) {
                return false;
            }
        },

    })();
});

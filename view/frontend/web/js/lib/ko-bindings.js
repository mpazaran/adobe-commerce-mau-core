define(
    [
        "jquery",
        "ko",
        "underscore",
        "mapping",
        "mage/translate",
        "moment",
        "freedom/utils",
        "jquery/ui",
        "mask"
    ], function ($, ko, _, mapping, $t, moment, utils) {

        ko.utils.equals = function (a, b) {
            return utils.equals(a, b);
        }

        ko.utils.lt = function (a, b) {
            return utils.lt(a, b);
        }

        ko.utils.lte = function (a, b) {
            return utils.lte(a, b);
        }

        ko.utils.gt = function (a, b) {
            return utils.gt(a, b);
        }

        ko.utils.gte = function (a, b) {
            return utils.gte(a, b);
        }

        ko.utils.isTrue = function (valueAccessor) {
            return utils.isTrue(ko.utils.unwrapObservable(valueAccessor));
        }

        ko.utils.isFalse = function (valueAccesor) {
            return !ko.utils.isTrue(valueAccesor)
        }

        ko.utils.isValidIndex = function (valueAccessor) {
            let unwrappedValue = ko.utils.unwrapObservable(valueAccessor);
            let stringValue = (unwrappedValue + "").toLowerCase();
            return !(
                stringValue === "" ||
                stringValue === "null" ||
                unwrappedValue === null ||
                stringValue === "no" ||
                stringValue === "n" ||
                stringValue === "false" ||
                unwrappedValue === false ||
                stringValue === "undefined" ||
                unwrappedValue === undefined ||
                stringValue === "0" ||
                unwrappedValue === 0 ||
                stringValue === "-1" ||
                unwrappedValue === -1 ||
                stringValue === "[]" ||
                unwrappedValue === [] ||
                stringValue === "{}" ||
                unwrappedValue === {}
            );
        }

        ko.utils.isNotValidIndex = function (valueAccessor) {
            return !ko.utils.isValidIndex(valueAccessor);
        }

        ko.utils.currency = function (valueAccessor) {
            let value = ko.utils.unwrapObservable(valueAccessor)
            return utils.currency(parseFloat(parseFloat(typeof value === 'function' ? value() : value).toFixed()));
        }

        if (ko.mapping === undefined) {
            ko.mapping = mapping;

            ko.mapping.schemaFromJSON = function (data, defaults) {
                return ko.mapping.schemaFromJS(JSON.parse(data), defaults);
            }
            ko.mapping.schemaFromJS = function (data, defaults) {
                let mapping = ko.mapping.fromJS(data);
                let observables = null;
                if (_.isFunction(mapping)) {
                    if (ko.isObservable(mapping)) {
                        observables = mapping();
                    } else {
                        observables = mapping;
                    }
                } else {
                    observables = mapping;
                }

                if (_.isArray(observables)) {
                    let result = [];
                    for (let i = 0; i < observables.length; i++) {
                        result.push(_.defaults(observables[i], ko.mapping.fromJS(defaults)));
                    }
                    delete result.__ko_mapping__;
                    return result;
                }
                let object = _.defaults(observables, ko.mapping.fromJS(defaults));
                delete object.__ko_mapping__;
                return object;
            }
        }

        ko.bindingHandlers.debug = {
            init: function (element, valueAccessor) {
                console.debug(element);
                console.debug(valueAccessor());
            },
        };

        ko.virtualElements.allowedBindings.debug = true;

        ko.bindingHandlers.call = {
            init: function (element, valueAccessor) {
                let value = ko.utils.unwrapObservable(valueAccessor);
                value();
            },
        };

        ko.virtualElements.allowedBindings.call = true;

        ko.bindingHandlers.editableHtml = {
            init  : function (element, valueAccessor) {
                $(element).on('keyup', function () {
                    var observable = valueAccessor();
                    observable($(this).html());
                });
            },
            update: function (element, valueAccessor) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                $(element).html(value);
            }
        };

        ko.bindingHandlers.datetime = {
            update: function (element, valueAccessor) {
                var value = parseFloat(valueAccessor());
                if (!!value) {
                    ko.utils.setTextContent(element, moment.utc(value).format(Free.format.DATETIME));
                } else {
                    ko.utils.setTextContent(element, '');
                }
            },
        };

        ko.bindingHandlers.time = {
            update: function (element, valueAccessor) {
                var value = parseFloat(valueAccessor());
                if (!!value) {
                    ko.utils.setTextContent(element, moment.utc(value).format(Free.format.TIME));
                } else {
                    ko.utils.setTextContent(element, '');
                }
            },
        };

        ko.bindingHandlers.lookUp = {
            update: function (element, valueAccessor) {
                let value = _.defaults(ko.utils.unwrapObservable(valueAccessor()),
                    {
                        list        : [],
                        value       : undefined,
                        text        : 'label',
                        id          : 'value',
                        defaultValue: undefined,
                        defaultText : '',
                        formatter   : function (item, value) {
                            return $t(value);
                        }
                    });

                let given = ko.utils.unwrapObservable(value.value);
                if (!_.isArray(given)) {
                    let list = ko.utils.unwrapObservable(value.list);
                    let compare = isNaN(given) ? given : parseFloat(given);
                    let item = _.find(list, function (item) {
                        if (isNaN(item[value.id])) {
                            return item[value.id] === compare;
                        }
                        return parseFloat(item[value.id]) === compare;
                    });
                    if (!item) {
                        if (value.defaultValue !== undefined) {
                            compare = isNaN(value.defaultValue) ? value.defaultValue : parseFloat(value.defaultValue);
                            item = _.find(list, function (item) {
                                if (isNaN(item[value.id])) {
                                    return item[value.id] === compare;
                                }
                                return parseFloat(item[value.id]) === compare;
                            });
                            if (!item) {
                                ko.utils.setTextContent(element, value.formatter(item, item[value.text]));
                                return;
                            }
                        }
                    } else {
                        ko.utils.setTextContent(element, value.formatter(item, item[value.text]));
                        return;
                    }
                } else {
                    let list = ko.utils.unwrapObservable(value.list);
                    let items = _.filter(list, function (item) {
                        return given.indexOf(item[value.id]) > -1;
                    });
                    let result = []
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        result.push(value.formatter(item, item[value.text]));
                    }
                    if (result.length > 0) {
                        ko.utils.setTextContent(element, result.join(', '));
                        return;
                    }
                }
                ko.utils.setTextContent(element, value.formatter(null, value.defaultText));
            },
        };

        ko.bindingHandlers.list = {
            update: function (element, valueAccessor) {
                var value = valueAccessor();
                if (!!value && $.isArray(value)) {
                    if ('data' in value && 'label' in value) {
                        var label = value.label;
                        if (value.data.length > 1) {
                            let text = '';
                            for (let i = 0; i < value.data.length - 1; i++) {
                                text += value.data[i][label] + ', ';
                            }
                            ko.utils.setTextContent(element, text.slice(0, -2) + ' & ' + value.data[value.data.length - 1][label]);
                        } else {
                            ko.utils.setTextContent(element, value.data[0][label]);
                        }

                    } else {
                        if (value.length > 1) {
                            var text = '';
                            for (var i = 0; i < value.length - 1; i++) {
                                text += value[i] + ', ';
                            }
                            ko.utils.setTextContent(element, text.slice(0, -2) + ' & ' + value[value.length - 1]);
                        } else {
                            ko.utils.setTextContent(element, value[0]);
                        }
                    }
                } else {
                    if (!!value) {
                        ko.utils.setTextContent(element, value);
                    } else {
                        ko.utils.setTextContent(element, '');
                    }
                }
            },
        };

        ko.bindingHandlers.src = {
            update: function (element, valueAccessor) {
                element.src = valueAccessor();
            },
        };

        ko.bindingHandlers.fadeVisible = {
            init  : function (element, valueAccessor) {
                var value = valueAccessor();
                $(element).toggle(ko.unwrap(value));
            },
            update: function (element, valueAccessor) {
                var value = valueAccessor();
                ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
            }
        };

        ko.bindingHandlers.slideVisible = {
            init  : function (element, valueAccessor) {
                var value = valueAccessor();
                $(element).toggle(ko.unwrap(value));
            },
            update: function (element, valueAccessor) {
                var value = valueAccessor();
                ko.unwrap(value) ? $(element).slideDown() : $(element).slideUp();
            }
        };

        ko.bindingHandlers.link = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var newValueAccesssor = function () {
                    return function () {
                        $('body').trigger('processStart');
                        window.location = window.BASE_URL + valueAccessor().replace(/^\/+|\/+$/g, '');
                    }
                }
                ko.bindingHandlers.click.init(element, newValueAccesssor, allBindingsAccessor, viewModel, bindingContext);
            },
        };

        ko.bindingHandlers.linkNew = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var newValueAccesssor = function () {
                    return function () {
                        window.open(window.BASE_URL + valueAccessor().replace(/^\/+|\/+$/g, ''));
                    }
                }
                ko.bindingHandlers.click.init(element, newValueAccesssor, allBindingsAccessor, viewModel, bindingContext);
            },
        };

        ko.bindingHandlers.googleMapPoint = {
            update: function (element, valueAccessor) {
                var data = jQuery.extend({
                    width : 500,
                    height: 500,
                    color : 'blue',
                    label : null,
                    lat   : 0,
                    lng   : 0
                }, valueAccessor());
                var url = 'https://maps.googleapis.com/maps/api/staticmap?size=' +
                    data.width + 'x' + data.height +
                    '&markers=color:' + data.color + '|label:' + data.label + '|' + data.lat + ',' + data.lng;
                element.src = url + '&key=' + data.googleMapsApiKey;
            }
        };

        ko.extenders.numeric = function (target, precision) {
            //create a writable computed observable to intercept writes to our observable
            var result = ko.pureComputed({
                read : target,  //always return the original observables value
                write: function (newValue) {
                    var current            = target(),
                        roundingMultiplier = Math.pow(10, precision),
                        newValueAsNum      = isNaN(newValue) ? 0 : +newValue,
                        valueToWrite       = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

                    //only write if it changed
                    if (valueToWrite !== current) {
                        target(valueToWrite);
                    } else {
                        //if the rounded value is the same, but a different value was written, force a notification for the current field
                        if (newValue !== current) {
                            target.notifySubscribers(valueToWrite);
                        }
                    }
                }
            }).extend({notify: 'always'});

            //initialize with current value to make sure it is rounded appropriately
            result(target());

            //return the new computed observable
            return result;
        };

        ko.bindingHandlers['checkUp'] = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                let isCheckbox = element.type === "checkbox";

                if (!isCheckbox) {
                    return;
                }

                let unwrapedValue = valueAccessor();
                let config = {
                    value    : false,
                    checked  : false,
                    unchecked: true
                }
                if (ko.isObservable(unwrapedValue)) {
                    config =
                        {
                            value    : unwrapedValue,
                            checked  : false,
                            unchecked: true
                        };
                } else {
                    if (_.isObject(unwrapedValue)) {
                        config = _.defaults(
                            unwrapedValue,
                            {
                                value    : false,
                                checked  : false,
                                unchecked: true
                            }
                        );
                    } else {
                        console.warn("ko.bindingHandlers.checkUp: bad configuration " + element.dataset.bind);
                    }
                }

                if (!ko.isObservable(config.value)) {
                    console.warn("ko.bindingHandlers.checkUp: value is not an observable at " + element.dataset.bind);
                    return;
                }

                function updateModel() {
                    let isChecked = element.checked;
                    if (isChecked) {
                        config.value(ko.utils.unwrapObservable(config.checked))
                    } else {
                        config.value(ko.utils.unwrapObservable(config.unchecked))
                    }
                }

                function toggleCheck(value) {
                    let newValue = ko.utils.unwrapObservable(value);
                    element.checked = newValue === config.checked
                }

                ko.utils.registerEventHandler(element, "click", updateModel);
                if (ko.isSubscribable(config.value)) {
                    config.value.subscribe(toggleCheck)
                } else {
                    console.warn("ko.bindingHandlers.checkUp: value is not an subscribable at " + element.dataset.bind);
                }
            }
        };

        ko.bindingHandlers.dateInput = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                let config = valueAccessor();
                $(element).mask('0000-00-00', {
                    onComplete: function (inputDate) {
                        if (!moment.parseZone(inputDate).isValid()) {
                            $(element).val("");
                        }
                    }
                });
            }
        };

        ko.bindingHandlers.datetimeInput = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                let config = valueAccessor();
                $(element).mask('0000-00-00 00:00', {
                    onComplete: function (inputDate) {
                        if (!moment.parseZone(inputDate).isValid()) {
                            $(element).val("");
                        }
                    }
                });
            }
        };

        ko.bindingHandlers.phoneInput = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                $(element).mask('0000000000', {});
                ko.bindingHandlers.textInput.init(
                    element,
                    valueAccessor,
                    allBindings
                );
            }
        };

        ko.bindingHandlers.postalCodeInput = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                $(element).mask('00000', {});
                ko.bindingHandlers.textInput.init(
                    element,
                    valueAccessor,
                    allBindings
                );
            }
        };

        ko.bindingHandlers.emailInput = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                $(element).mask("A", {
                    translation: {
                        "A": { pattern: /[\w@\-.+]/, recursive: true }
                    },
                    onComplete: function (inputEmail) {
                        //if (!moment.parseZone(inputEmail).isValid()) {
                          //  $(element).val("");
                        //}
                        return false;
                    }
                });

                ko.bindingHandlers.textInput.init(
                    element,
                    valueAccessor,
                    allBindings
                );
            }
        };

        ko.decimalObservable = function (initialValue, options) {
            const settings = _.defaults(options || {},
                {
                    decimal      : 2,
                    allowNegative: true,
                    min          : null,
                    max          : null
                });
            const formatValue = function (value) {
                let newValue = null;
                if (settings.decimal) {
                    newValue = parseFloat(value);
                    if (isNaN(newValue)) {
                        return "";
                    }
                    let expression = new RegExp("/^([0-9]*)\\.([0-9]{" + settings.decimal + "})(.*)$/g")
                    newValue = parseFloat(value.replace(expression, '$1.$2'))
                } else {
                    newValue = parseInt(value);
                }
                if (isNaN(newValue)) {
                    return "";
                }
                let min = parseFloat(settings.min)
                if (!isNaN(min) && value < min) {
                    return min;
                }
                let max = parseFloat(settings.max)
                if (!isNaN(max) && value > max) {
                    return max;
                }
                if (!settings.allowNegative && value < 0) {
                    return "";
                }
                if (settings.decimal) {
                    return newValue.toFixed(settings.decimal)
                }
                return newValue;
            }

            const matchValue = function (value) {
                let parsedFloat = parseFloat(value);
                if (settings.decimal) {
                    let points = (value.match(/\./g) || []).length;
                    if (points > 1) {
                        return false;
                    } else {
                        if (
                            points === 1 &&
                            value.replace(/^(.*)\.(.*)$/g, "$2").length > settings.decimal //AND THE DECIMALS ARE MORE THAN THE ALLOWED
                        ) {
                            return false;
                        }
                    }

                } else {
                    if (parseInt(value) !== parsedFloat || value.indexOf(".") !== -1) {
                        return false;
                    }
                }

                if (
                    isNaN(parsedFloat) || // IS NOT A NUMBER
                    (!settings.allowNegative && parsedFloat < 0) // IF NOT ALLOW NEGATIVES
                ) {
                    return false;
                }

                let min = parseFloat(settings.min)
                if (!isNaN(min) && parsedFloat < min) {
                    return false;
                }
                let max = parseFloat(settings.max);

                if (
                    (!isNaN(max) && parsedFloat > max) ||
                    !settings.allowNegative && parsedFloat < 0
                ) {
                    return false;
                }

                return true;
            };

            let observedValue = initialValue;
            if (!ko.isObservable(initialValue)) {
                observedValue = ko.observable(initialValue);
            }

            let computer = ko.pureComputed({
                read : function () {
                    return observedValue();
                },
                write: function (newValue) {
                    let value = (ko.unwrap(newValue) || "").toString();
                    let hyphens = (value.match(/\-/g) || []).length;
                    if (hyphens > 0) {
                        value = value.replace(/\-/g, "");
                        if (hyphens === 1) {
                            value = "-" + value;
                        }
                    }
                    switch (value) {
                        case "":
                        case "-":
                            observedValue(value);
                            break;
                        case ".":
                            observedValue("0.");
                            break;
                        case "-.":
                            observedValue("-0.");
                            break;
                        default:
                            if (matchValue(value)) {
                                observedValue(value.replace(/([^0-9\.\-])/g, ""));
                                computer.notifySubscribers();
                            } else {
                                observedValue(formatValue(observedValue()));
                                observedValue.notifySubscribers(formatValue(observedValue()));
                                computer.notifySubscribers();
                            }
                    }

                    return false;
                }
            });
            return computer;
        };

        ko.integerObservable = function (initialValue, options) {
            const settings = _.defaults(options || {},
                {
                    allowNegative: true,
                    min          : null,
                    max          : null
                });
            settings.decimal = false;
            return ko.decimalObservable(initialValue, settings);
        }

        ko.bindingHandlers.decimalInput = {
            init: function (element, valueAccessor, allBindings) {

                let options = ko.utils.unwrapObservable(valueAccessor);
                let config = {};

                let givenConfig = {value: null};

                if (ko.isObservable(options)) {
                    givenConfig.value = options;
                } else {
                    if (_.isFunction(options)) {
                        options = options();
                    }
                    if (ko.isObservable(options)) {
                        givenConfig.value = options;
                    } else {
                        givenConfig = options;
                    }
                }

                if (!ko.isObservable(givenConfig.value)) {
                    console.warn("Property value is not observable", givenConfig);
                    return;
                } else {
                    console.warn("Property value is observable");
                }

                config = _.defaults(
                    givenConfig,
                    {
                        decimal      : 2,
                        min          : false,
                        max          : false,
                        allowNegative: true,
                        value        : ko.observable()
                    }
                );
                let decimalObserver = ko.decimalObservable(config.value, config);
                config.value.subscribe(function (newValue) {
                    decimalObserver(newValue);
                    decimalObserver.notifySubscribers();
                });
                ko.bindingHandlers.textInput.init(
                    element,
                    function () {
                        return decimalObserver;
                    },
                    allBindings
                );
            }
        };

        ko.bindingHandlers.integerInput = {
            init: function (element, valueAccessor, allBindings) {
                let options = ko.utils.unwrapObservable(valueAccessor);
                let config = {value: null};
                if (ko.isObservable(options)) {
                    config.value = options;
                } else {
                    if (_.isFunction(options)) {
                        config = options();
                    }
                    if (ko.isObservable(options)) {
                        config.value = options;
                    } else {
                        config = options;
                    }
                }

                config = _.defaults(
                    config,
                    {
                        decimal      : 0,
                        min          : false,
                        max          : false,
                        allowNegative: true,
                        value        : ko.observable()
                    }
                );

                config.decimal = 0;
                config.allowNegative = ko.utils.isFalse(config.min);

                ko.bindingHandlers.decimalInput.init(element, function () {
                    return config;
                }, allBindings);
            }
        };

        ko.bindingHandlers.controlPrice = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                let config = valueAccessor();
                $(element).numeric({
                    decimal      : 2,
                    decimalAuto  : 2,
                    allowNegative: false
                })
            }
        };

        ko.bindingHandlers.switch = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                let isCheckbox = element.type === "checkbox";

                if (!isCheckbox) {
                    return;
                }

                let label = $($(element).parent('label'));

                if (label.length === 0 && element.id) {
                    label = $("label[for='" + element.id + "']");
                }

                if (label.length === 0) {
                    return;
                }

                let unwrapedValue = valueAccessor();
                let config = {
                    value    : false,
                    checked  : true,
                    unchecked: false,
                    square   : false
                }
                if (ko.isObservable(unwrapedValue)) {
                    config =
                        {
                            value    : unwrapedValue,
                            checked  : true,
                            unchecked: false,
                            square   : false
                        };
                } else {
                    if (_.isObject(unwrapedValue)) {
                        config = _.defaults(
                            unwrapedValue,
                            {
                                value    : false,
                                checked  : true,
                                unchecked: false,
                                square   : false
                            }
                        );
                    } else {
                        console.warn("ko.bindingHandlers.switch: bad configuration " + element.dataset.bind);
                    }
                }

                if (!ko.isObservable(config.value)) {
                    console.warn("ko.bindingHandlers.switch: value is not an observable at " + element.dataset.bind);
                    return;
                }

                label.addClass("free-switch");

                function updateModel() {
                    let isChecked = element.checked;
                    if (isChecked) {
                        config.value(ko.utils.unwrapObservable(config.checked))
                    } else {
                        config.value(ko.utils.unwrapObservable(config.unchecked))
                    }
                }

                function toggleCheck(value) {
                    let newValue = ko.utils.unwrapObservable(value);
                    element.checked = newValue === config.checked
                }

                ko.utils.registerEventHandler(element, "click", updateModel);
                if (config.square) {
                    $(element).after("<span class=\"free-slider\"></span>");
                } else {
                    $(element).after("<span class=\"free-slider free-slider-round\"></span>");
                }
                if (ko.isSubscribable(config.value)) {
                    toggleCheck(config.value);
                    config.value.subscribe(toggleCheck);
                } else {
                    console.warn("ko.bindingHandlers.switch: value is not an subscribable at " + element.dataset.bind);
                }
            }
        };

        ko.bindingHandlers['loading'] = {
            init     : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                let loader = $('<div class="freedom-loader"><div class="freedom-loader-spinner fas fa-spinner fa-2x fa-pulse"></div></div>');
                if (ko.utils.unwrapObservable(valueAccessor())) {
                    loader.addClass("freedom-loader-on");
                }
                $(element).append(loader)
            }, update: function (element, valueAccessor) {
                $('.freedom-loader', element).toggleClass("freedom-loader-on", ko.utils.unwrapObservable(valueAccessor()));
            }
        }


        ko.subscribable.fn.subscribeChanged = function (callback) {
            var oldValue;
            return [
                this.subscribe(function (_oldValue) {
                    oldValue = _oldValue;
                }, this, 'beforeChange'),
                this.subscribe(function (newValue) {
                    callback(newValue, oldValue);
                })
            ];
        };

        ko.bindingHandlers.integer = {
            init: function (element, valueAccessor) {
                let allowNegative = ko.utils.unwrapObservable(valueAccessor)();
                if (allowNegative === true) {
                    $(element).on('input', function () {
                        this.value = this.value.replace(/(?!^-)[^\d.]/g, '').replace(/^([0-9\-]*)\.([0-9]*)\.([0-9]*)$/g, "$1.$2$3");
                    });
                } else {
                    $(element).on('input', function () {
                        this.value = this.value.replace(/[^\d.]/g, '').replace(/^([0-9]*)\.([0-9]*)\.([0-9]*)$/g, "$1.$2$3");
                    });
                }
            }
        };

        ko.bindingHandlers.currency = {
            'init'  : function () {
                return {'controlsDescendantBindings': true};
            },
            'update': function (element, valueAccessor) {
                ko.utils.setTextContent(element,
                    ko.utils.currency(valueAccessor)
                );
            }
        };

        ko.bindingHandlers.icon = {
            init: function (element, valueAccessor) {
                let icon = ko.utils.unwrapObservable(valueAccessor)();
                $(element).addClass("fa fa-" + icon);
            }
        };

        return ko;
    }
)
;

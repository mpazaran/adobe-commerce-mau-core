define([
    'jquery',
    'underscore',
    'mage/validation',
    'moment',
    'jquery/ui',
    'jquery/validate',
    'mage/translate'
], function ($, _, validation, moment) {
    'use strict';
    $.validator.addMethod(
        "mexicanPhone",
        function (value, element) {
            let expression = /([0-9]{10})/;
            return expression.test(value);
        },
        $.mage.__("Invalid phone numer, must be exactly 10 digits.")
    );
    $.validator.addMethod(
        "mexicanPostcode",
        function (value, element) {
            let expression = /^([0-9]{5})$/;
            return expression.test(value);
        },
        $.mage.__("Invalid postcode, must be exactly 5 digits.")
    );
    $.validator.addMethod(
        "mexicanTaxId",
        function (value, element) {
            let enterprise = /^([a-zA-Z]{3})([0-9]{6})([a-zA-Z0-9]{3})$/;
            let pearson = /^([a-zA-Z]{4})([0-9]{6})([a-zA-Z0-9]{3})$/;
            let date = false;
            if (enterprise.test(value)) {
                date = value.replace(enterprise, '$2');
            } else {
                if (pearson.test(value)) {
                    date = value.replace(pearson, '$2');
                } else {
                    return false;
                }
            }
            let testMoment = moment(date, 'YYMMDD');
            let today = moment();
            return testMoment.isValid() && testMoment.isSameOrBefore(today, 'day');
        },
        $.mage.__("Invalid Tax ID.")
    );
    return validation;
});

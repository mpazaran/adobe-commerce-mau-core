/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

var config = {
    map : {
        '*': {
            "freedom/resumable"    : 'Freedom_Core/js/lib/resumable',
            "freedom/ko"           : 'Freedom_Core/js/lib/ko-bindings',
            "freedom/icons"        : 'Freedom_Core/js/icons',
            "freedom/utils"        : 'Freedom_Core/js/utils',
            "freedom/validation"   : 'Freedom_Core/js/lib/validation',
            "freedom/catalog"      : 'Freedom_Core/js/freedom-catalog',
            "freedom/form"         : 'Freedom_Core/js/freedom-form',
            "freedom/list"         : 'Freedom_Core/js/freedom-list',
            "freedom/action/base"  : 'Freedom_Core/js/actions/base',
            "freedom/action/save"  : 'Freedom_Core/js/actions/save',
            "freedom/action/delete": 'Freedom_Core/js/actions/delete',
            "freedom/action/load"  : 'Freedom_Core/js/actions/load',
            "freedom/action/search": 'Freedom_Core/js/actions/search',
            "mapping"              : 'Freedom_Core/js/lib/ko-mapping',
            "jstree"               : 'Freedom_Core/js/jquery/jstree',
            "mask"                 : 'Freedom_Core/js/jquery/jquery.mask',
            "numeric"              : 'Freedom_Core/js/jquery/jquery.numeric',
            "Croppie"              : 'Freedom_Core/js/croppie/croppie',
            "Webcam"               : 'Freedom_Core/js/webcam/webcam',
            "FullCalendar"         : 'Freedom_Core/js/FullCalendar/main',
            "FullCalendarEs"       : 'Freedom_Core/js/FullCalendar/locales/es',
            "autoComplete"         : 'Freedom_Core/js/autoComplete/jquery.auto-complete'
        }
    },
    shim: {
        'autoComplete': {
            deps: [
                'jquery',
            ]
        },
        'mask'        : {
            deps: [
                'jquery',
            ]
        },
        'numeric'     : {
            deps: [
                'jquery',
            ]
        }
    },
};

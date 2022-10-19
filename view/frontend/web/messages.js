define([
    "uiComponent",
    "mage/translate",
    "Magento_Customer/js/customer-data"
], function (Component, __, customerData ) {
    return Component.extend({
        initialize: function () {
            this._super();
        },
        add : function (type, message) {
            let messages = customerData.get("messages")().messages;
            messages.push({
                type: type,
                text: __(message)
            });
            customerData.set("messages", {messages:messages});
        },
        addErrorMessage: function(message){
            this.add("error", message);
        },
        addInfoMessage: function(message){
            this.add("info", message);
        },
        addSuccessMessage: function(message){
            this.add("success", message);
        },
        addWarningMessage: function(message){
            this.add("warning", message);
        },
        clear: function(){
            customerData.set("messages", {messages:[]});
        },
        timedClear: function(){
            setTimeout(this.clear.bind(this),30000);
        }
    });
});



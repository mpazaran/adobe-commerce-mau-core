<?php

namespace Freedom\Core\Model;

class PaymentMethodsOptions
{

    /**
     * @var \Magento\Payment\Helper\Data
     */

    protected $paymentHelper;

    /**
     * @param \Magento\Payment\Helper\Data $paymentHelper
     */
    public function __construct(
        \Magento\Payment\Helper\Data $paymentHelper
    )
    {
        $this->paymentHelper = $paymentHelper;
    }

    public function toOptionArray()
    {
        $result         = [];
        $paymentMethods = $this->paymentHelper->getPaymentMethodList();
        asort($paymentMethods);
        foreach ($paymentMethods as $code => $name) {
            $result[] = [
                'value' => $code,
                'label' => $name . ' (' . $code . ')'
            ];
        }

        return $result;
    }
}

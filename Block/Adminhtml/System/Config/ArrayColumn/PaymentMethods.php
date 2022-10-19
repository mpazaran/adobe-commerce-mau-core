<?php


namespace Freedom\Core\Block\Adminhtml\System\Config\ArrayColumn;

use Freedom\Core\Model\PaymentMethodsOptions;
use Magento\Framework\View\Element\Context;
use Magento\Framework\View\Element\Html\Select;

class PaymentMethods extends Select
{
    /**
     * @var PaymentMethodsOptions
     */
    private $paymentMethodsOptions;

    /**
     * PaymentMethods constructor.
     * @param Context                                   $context
     * @param PaymentMethodsOptions $paymentMethodsOptions
     * @param array                                     $data
     */
    public function __construct(
        Context $context,
        PaymentMethodsOptions $paymentMethodsOptions,
        array $data = []
    )
    {
        parent::__construct($context, $data);
        $this->paymentMethodsOptions = $paymentMethodsOptions;
    }

    /**
     * Set "name" for <select> element
     *
     * @param string $value
     * @return $this
     */
    public function setInputName($value)
    {
        return $this->setName($value);
    }

    /**
     * Set "id" for <select> element
     *
     * @param $value
     * @return $this
     */
    public function setInputId($value)
    {
        return $this->setId($value);
    }

    /**
     * Render block HTML
     *
     * @return string
     */
    public function _toHtml(): string
    {
        if (!$this->getOptions()) {
            $this->setOptions($this->getSourceOptions());
        }
        return parent::_toHtml();
    }

    private function getSourceOptions(): array
    {
        return $this->paymentMethodsOptions->toOptionArray();
    }
}

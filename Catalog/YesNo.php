<?php

namespace Freedom\Core\Catalog;

use Magento\Framework\Data\OptionSourceInterface;

class YesNo implements OptionSourceInterface
{

    const YES = 'y';
    const NO  = 'n';

    private $options = [
        [
            'value' => YesNo::YES,
            'label' => 'Yes',
        ],
        [
            'value' => YesNo::NO,
            'label' => 'No',
        ]
    ];

    public function toOptionArray()
    {
        return $this->options;
    }
}

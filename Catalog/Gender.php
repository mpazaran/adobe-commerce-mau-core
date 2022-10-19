<?php

namespace Freedom\Core\Catalog;

use Magento\Framework\Data\OptionSourceInterface;

class Gender implements OptionSourceInterface
{

    const FEMALE = 'f';
    const MALE   = 'm';

    private $options = [
        [
            'value' => Gender::FEMALE,
            'label' => 'Female',
        ],
        [
            'value' => Gender::MALE,
            'label' => 'Male',
        ]
    ];

    public function toOptionArray()
    {
        return $this->options;
    }
}

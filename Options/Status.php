<?php

namespace Freedom\Core\Options;

use Magento\Framework\Data\OptionSourceInterface;

class Status implements OptionSourceInterface
{

    const ACTIVE = 1;
    const INACTIVE = 2;

    public function toOptionArray()
    {
        return [
            [
                'value' => static::INACTIVE,
                'label' => 'INACTIVE'
            ],
            [
                'value' => static::ACTIVE,
                'label' => 'ACTIVE'
            ]
        ];
    }
}

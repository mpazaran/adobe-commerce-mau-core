<?php

namespace Freedom\Core\Catalog\Status;

use Magento\Framework\Data\OptionSourceInterface;

class AcitveInactive implements OptionSourceInterface
{

    const ACTIVE   = 'a';
    const INACTIVE = 'i';

    private $options = [
        [
            'value' => AcitveInactive::ACTIVE,
            'label' => 'Active',
        ],
        [
            'value' => AcitveInactive::INACTIVE,
            'label' => 'Inactive',
        ]
    ];

    public function toOptionArray()
    {
        return $this->options;
    }

}

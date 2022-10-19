<?php

namespace Freedom\Core\Catalog\Status;

use Magento\Framework\Data\OptionSourceInterface;

class Deletable implements OptionSourceInterface {

    const ACTIVE = 'a';
    const INACTIVE = 'i';
    const DELETED = 'd';

    private $options = [
        [
            'value' => Deletable::ACTIVE,
            'label' => 'Active',
        ],
        [
            'value' => Deletable::INACTIVE,
            'label' => 'Inactive',
        ],
        [
            'value' => Deletable::DELETED,
            'label' => 'Deleted',
        ]
    ];

    public function toOptionArray()
    {
        return $this->options;
    }
}

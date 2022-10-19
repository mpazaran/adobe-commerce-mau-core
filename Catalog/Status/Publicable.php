<?php

namespace Freedom\Core\Catalog\Status;

use Magento\Framework\Data\OptionSourceInterface;

class Publicable implements OptionSourceInterface
{

    const DRAFT      = 'r';
    const PUBLICATED = 'p';
    const DELETED    = 'd';

    private $options = [
        [
            'value' => Publicable::DRAFT,
            'label' => 'Draft',
        ],
        [
            'value' => Publicable::PUBLICATED,
            'label' => 'Publicated',
        ],
        [
            'value' => Publicable::DELETED,
            'label' => 'Deleted',
        ]
    ];

    public function toOptionArray()
    {
        return $this->options;
    }
}

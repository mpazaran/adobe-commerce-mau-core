<?php

namespace Freedom\Core\Catalog;

use Magento\Framework\Data\OptionSourceInterface;

class Days implements OptionSourceInterface
{

    const MONDAY    = 'M';
    const TUESDAY   = 'T';
    const WEDNESDAY = 'W';
    const THURSDAY  = 'R';
    const FRIDAY    = 'F';
    const SATURDAY  = 'S';
    const SUNDAY    = 'U';

    private $options = [
        [
            'value' => Days::SUNDAY,
            'label' => 'Sunday'
        ],
        [
            'value' => Days::MONDAY,
            'label' => 'Monday'
        ],
        [
            'value' => Days::TUESDAY,
            'label' => 'Tuesday'
        ],
        [
            'value' => Days::WEDNESDAY,
            'label' => 'Wednesday'
        ],
        [
            'value' => Days::THURSDAY,
            'label' => 'Thursday'
        ],
        [
            'value' => Days::FRIDAY,
            'label' => 'Friday'
        ],
        [
            'value' => Days::SATURDAY,
            'label' => 'Saturday'
        ]
    ];

    public function toOptionArray()
    {
        return $this->options;
    }
}

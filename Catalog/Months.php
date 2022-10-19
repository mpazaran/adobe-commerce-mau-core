<?php

namespace Freedom\Core\Catalog;

use Magento\Framework\Data\OptionSourceInterface;

class Months implements OptionSourceInterface
{
    const JANUARY   = '01';
    const FEBRUARY  = '02';
    const MARCH     = '03';
    const APRIL     = '04';
    const MAY       = '05';
    const JUNE      = '06';
    const JULY      = '07';
    const AUGUST    = '08';
    const SEPTEMBER = '09';
    const OCTOBER   = '10';
    const NOVEMBER  = '11';
    const DECEMBER  = '12';

    private $options = [
        [
            'value' => Months::JANUARY,
            'label' => 'January'
        ],
        [
            'value' => Months::FEBRUARY,
            'label' => 'February'
        ],
        [
            'value' => Months::MARCH,
            'label' => 'March'
        ],
        [
            'value' => Months::APRIL,
            'label' => 'April'
        ],
        [
            'value' => Months::MAY,
            'label' => 'May'
        ],
        [
            'value' => Months::JUNE,
            'label' => 'June'
        ],
        [
            'value' => Months::JULY,
            'label' => 'July'
        ],
        [
            'value' => Months::AUGUST,
            'label' => 'August'
        ],
        [
            'value' => Months::SEPTEMBER,
            'label' => 'September'
        ],
        [
            'value' => Months::OCTOBER,
            'label' => 'October'
        ],
        [
            'value' => Months::NOVEMBER,
            'label' => 'November'
        ],
        [
            'value' => Months::DECEMBER,
            'label' => 'December'
        ],
    ];

    public function toOptionArray()
    {
        return $this->options;
    }
}

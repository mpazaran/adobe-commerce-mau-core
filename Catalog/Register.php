<?php

namespace Freedom\Core\Catalog;

use Magento\Framework\App\ObjectManager;
use Magento\Framework\Data\OptionSourceInterface;
use Magento\Framework\View\Element\Template;
use ReflectionClass;

class Register extends Template
{

    static $catalogs = [];

    static $objectManager = null;

    /**
     * @return null
     */
    public static function getObjectManager()
    {
        if (self::$objectManager === null) {
            self::$objectManager = ObjectManager::getInstance();
        }
        return self::$objectManager;
    }

    /**
     * @param string                       $id      To use in front
     * @param string|OptionSourceInterface $catalog Options object or class name
     */
    public static function register($id, $catalog)
    {
        try {
            if ($catalog instanceof OptionSourceInterface) {
                $oClass = new ReflectionClass(get_class($catalog));
            } else {
                $oClass  = new ReflectionClass($catalog);
                $catalog = self::getObjectManager()->get($catalog);
            }
        } catch (\ReflectionException $e) {
            static::$catalogs[$id] = [
                'constants' => ['ERROR'],
                'options'   => [
                    [
                        'value' => 'e',
                        'label' => $e->getMessage()
                    ]
                ],
            ];

            return;
        }

        static::$catalogs[$id] = [
            'constants' => $oClass->getConstants(),
            'options'   => $catalog->toOptionArray(),
        ];
    }

    /**
     * @param string $id To use in front
     * @param array  $options
     */
    public static function registerOptions($id, array $options)
    {
        $constants = [];
        foreach ($options as $pair) {
            $constants[] = $pair['value'];
        }

        static::$catalogs[$id] = [
            'constants' => $constants,
            'options'   => $options,
        ];
    }

    /**
     * @return array
     */
    public static function getCatalogs(): array
    {
        return self::$catalogs;
    }
}

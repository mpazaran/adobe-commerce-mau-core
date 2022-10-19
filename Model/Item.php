<?php

namespace Freedom\Core\Model;

use Freedom\Core\Api\Data\ItemInterface;

class Item implements ItemInterface
{

    /**
     * @var string|null
     */
    protected $key = null;

    /**
     * @var string|null
     */
    protected $value = null;

    /**
     * @return string
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * @param string $key
     * @return Item
     */
    public function setKey($key)
    {
        $this->key = $key;
        return $this;
    }

    /**
     * @return string
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * @param string $value
     * @return Item
     */
    public function setValue($value)
    {
        $this->value = $value;
        return $this;
    }

    /**
     * Item constructor.
     * @param string $key
     * @param string $value
     */
    public function __construct($key, $value)
    {
        $this->key   = $key;
        $this->value = $value;
    }

}

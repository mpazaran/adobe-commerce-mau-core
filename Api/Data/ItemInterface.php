<?php

namespace Freedom\Core\Api\Data;

/**
 * Interface which represents associative array item.
 */
interface ItemInterface
{
    /**
     * Item constructor.
     * @param string $key
     * @param string $value
     */
    public function __construct($key, $value);

    /**
     * Get key
     * @return string
     */
    public function getKey();

    /**
     * Set key
     * @param string $key
     * @return string
     */
    public function setKey($key);

    /**
     * Get value
     * @return string
     */
    public function getValue();

    /**
     * Set value
     * @param string
     * @return $this
     */
    public function setValue($value);
}

<?php

namespace Freedom\Core\Options;

use Magento\Eav\Model\ResourceModel\Entity\Attribute\Set\CollectionFactory as CollectionFactory;
use Magento\Eav\Model\ResourceModel\Entity\Attribute\Set\Collection;
use Magento\Eav\Model\Entity\Attribute\Set;
use Magento\Framework\Data\OptionSourceInterface;

/**
 * Class to get cart rules as option array
 */
class ProductAttributeSet implements OptionSourceInterface
{
    /**
     * @var CollectionFactory
     */
    private $collectionFactory;

    /**
     * @param CollectionFactory $collectionFactory
     */
    public function __construct(
        CollectionFactory $collectionFactory
    ) {
        $this->collectionFactory     = $collectionFactory;
    }

    /**
     * @return array
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function toOptionArray(): array
    {
        /** @var Collection $itemCollection */
        $itemCollection = $this->collectionFactory->create();
        $itemCollection
            ->addFieldToFilter('entity_type_id', 4)
            ->setOrder('attribute_set_name', 'asc');
        $items    = [];
        /** @var Set $item */
        foreach ($itemCollection->getItems() as $item) {
            $itemId  = $item->getId();
            $items[] = [
                'value' => $itemId,
                'label' => $item->getAttributeSetName()
            ];
        }

        return $items;
    }
}

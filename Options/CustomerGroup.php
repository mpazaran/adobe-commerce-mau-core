<?php

namespace Freedom\Core\Options;

use Magento\Customer\Api\Data\GroupInterface as DataInterface;
use Magento\Customer\Api\GroupRepositoryInterface as RepositoryInterface;
use Magento\Framework\Api\FilterBuilder;
use Magento\Framework\Api\Search\FilterGroupBuilder;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Framework\Api\SearchResults;
use Magento\Framework\Api\SortOrderBuilder;
use Magento\Framework\Data\OptionSourceInterface;

/**
 * Class to get customer group as option array
 */
class CustomerGroup implements OptionSourceInterface
{
    /**
     * @var RepositoryInterface
     */
    private $repository;

    /**
     * @var SearchCriteriaBuilder
     */

    private $searchCriteriaBuilder;
    /**
     * @var FilterBuilder
     */

    private $filterBuilder;
    /**
     * @var FilterGroupBuilder
     */

    private $filterGroupBuilder;

    /**
     * @var SortOrderBuilder
     */
    private $sortOrderBuilder;

    /**
     * @param RepositoryInterface   $repository
     * @param SearchCriteriaBuilder $searchCriteriaBuilder
     * @param FilterBuilder         $filterBuilder
     * @param FilterGroupBuilder    $filterGroupBuilder
     * @param SortOrderBuilder      $sortOrderBuilder
     */
    public function __construct(
        RepositoryInterface $repository,
        SearchCriteriaBuilder $searchCriteriaBuilder,
        FilterBuilder $filterBuilder,
        FilterGroupBuilder $filterGroupBuilder,
        SortOrderBuilder $sortOrderBuilder
    ) {
        $this->repository            = $repository;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
        $this->filterBuilder         = $filterBuilder;
        $this->filterGroupBuilder    = $filterGroupBuilder;
        $this->sortOrderBuilder      = $sortOrderBuilder;
    }

    /**
     * @return array
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function toOptionArray(): array
    {
        /** @var SearchResults $itemList */
        $itemList = $this->repository->getList($this->searchCriteriaBuilder->create());
        $items    = [];
        /** @var DataInterface $item */
        foreach ($itemList->getItems() as $item) {
            $itemId  = $item->getId();
            $items[] = [
                'value' => $itemId,
                'label' => $item->getCode()
            ];
        }

        return $items;
    }
}

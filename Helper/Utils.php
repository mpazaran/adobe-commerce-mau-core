<?php

namespace Freedom\Core\Helper;

use Exception;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Checkout\Model\Session as CheckoutSession;
use Magento\Checkout\Model\SessionFactory as CheckoutSessionFactory;
use Magento\Cms\Block\Block;
use Magento\Cms\Model\BlockFactory;
use Magento\Cms\Model\Template\FilterProvider;
use Magento\Customer\Api\CustomerRepositoryInterface;
use Magento\Customer\Api\Data\GroupInterface;
use Magento\Customer\Api\GroupRepositoryInterface;
use Magento\Customer\Model\Session;
use Magento\Customer\Model\SessionFactory;
use Magento\Framework\Api\CustomAttributesDataInterface;
use Magento\Framework\Api\FilterBuilder;
use Magento\Framework\Api\Search\FilterGroupBuilder;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Framework\Api\SortOrderBuilder;
use Magento\Framework\App\Area;
use Magento\Framework\App\Cache;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Framework\App\ResourceConnection;
use Magento\Framework\DB\Adapter\AdapterInterface;
use Magento\Framework\Encryption\Encryptor;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Mail\Template\TransportBuilder;
use Magento\Framework\Message\ManagerInterface;
use Magento\Framework\Pricing\Helper\Data;
use Magento\Framework\Translate\Inline\StateInterface;
use Magento\Store\Model\ScopeInterface;
use Magento\Store\Model\StoreManagerInterface;

class Utils extends AbstractHelper
{
    protected $transportBuilder;
    protected $storeManager;
    protected $inlineTranslation;
    /**
     * @var AdapterInterface
     */
    private $connection;
    /**
     * @var Data
     */
    private $currencyFormat;
    /**
     * @var ResourceConnection
     */
    private $resourceConnection;
    /**
     * @var BlockFactory
     */
    private $blockFactory;
    /**
     * @var FilterProvider
     */
    private $filterProvider;
    /**
     * @var Session
     */
    private $customerSession;
    /**
     * @var Encryptor
     */
    private $encryptor;
    /**
     * @var Cache
     */
    private $cache;
    /**
     * @var ManagerInterface
     */
    private $messages;
    /**
     * @var CustomerRepositoryInterface
     */
    private $customerRepository;
    /**
     * @var \Magento\Customer\Api\Data\CustomerInterface
     */
    private $customer;
    /**
     * @var GroupRepositoryInterface
     */
    private $groupRepository;
    /**
     * @var SearchCriteriaBuilder
     */
    private $searchCriteriaBuilder;
    /**
     * @var SortOrderBuilder
     */
    private $sortOrderBuilder;
    /**
     * @var FilterBuilder
     */
    private $filterBuilder;
    /**
     * @var FilterGroupBuilder
     */
    private $filterGroupBuilder;
    /**
     * @var ProductRepositoryInterface
     */
    private $productRepository;

    /**
     * @var CheckoutSession
     */
    private $checkoutsession;

    /**
     * Mail constructor.
     * @param Context                                $context
     * @param TransportBuilder                       $transportBuilder
     * @param StoreManagerInterface                  $storeManager
     * @param StateInterface                         $state
     * @param ScopeConfigInterface                   $scopeConfig
     * @param ResourceConnection                     $resourceConnection
     * @param BlockFactory                           $blockFactory
     * @param FilterProvider                         $filterProvider
     * @param Data                                   $currencyFormat
     * @param Encryptor                              $encryptor
     * @param Cache                       $cache
     * @param SessionFactory              $sessionFactory
     * @param CustomerRepositoryInterface $customerRepository
     * @param GroupRepositoryInterface    $groupRepository
     * @param SearchCriteriaBuilder       $searchCriteriaBuilder
     * @param SortOrderBuilder            $sortOrderBuilder
     * @param FilterBuilder               $filterBuilder
     * @param FilterGroupBuilder          $filterGroupBuilder
     * @param ProductRepositoryInterface  $productRepository
     * @param ManagerInterface            $messages
     * @param CheckoutSessionFactory      $checkoutSessionFactory
     */
    public function __construct(
        Context $context,
        TransportBuilder $transportBuilder,
        StoreManagerInterface $storeManager,
        StateInterface $state,
        ScopeConfigInterface $scopeConfig,
        ResourceConnection $resourceConnection,
        BlockFactory $blockFactory,
        FilterProvider $filterProvider,
        Data $currencyFormat,
        Encryptor $encryptor,
        Cache $cache,
        SessionFactory $sessionFactory,
        CustomerRepositoryInterface $customerRepository,
        GroupRepositoryInterface $groupRepository,
        SearchCriteriaBuilder $searchCriteriaBuilder,
        SortOrderBuilder $sortOrderBuilder,
        FilterBuilder $filterBuilder,
        FilterGroupBuilder $filterGroupBuilder,
        ProductRepositoryInterface $productRepository,
        ManagerInterface $messages,
        CheckoutSessionFactory $checkoutSessionFactory
    )
    {
        parent::__construct($context);
        $this->transportBuilder      = $transportBuilder;
        $this->storeManager          = $storeManager;
        $this->inlineTranslation     = $state;
        $this->scopeConfig           = $scopeConfig;
        $this->connection            = $resourceConnection->getConnection();
        $this->currencyFormat        = $currencyFormat;
        $this->resourceConnection    = $resourceConnection;
        $this->blockFactory          = $blockFactory;
        $this->filterProvider        = $filterProvider;
        $this->customerSession       = $sessionFactory->create();
        $this->encryptor             = $encryptor;
        $this->cache                 = $cache;
        $this->messages              = $messages;
        $this->customerRepository    = $customerRepository;
        $this->groupRepository       = $groupRepository;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
        $this->sortOrderBuilder      = $sortOrderBuilder;
        $this->filterBuilder         = $filterBuilder;
        $this->filterGroupBuilder    = $filterGroupBuilder;
        $this->productRepository     = $productRepository;
        $this->checkoutsession       = $checkoutSessionFactory->create();
    }

    public function frontNotification($toEmail, $toName, $subject = null, $content = null, $fromEmail = null, $fromName = null)
    {
        $this->sendEmail('front_notification', $toEmail, $toName, ['subject' => $subject, 'content' => $content], $fromEmail, $fromName);
    }

    public function sendEmail($templateId, $toEmail, $toName = null, $variables = [], $fromEmail = null, $fromName = null)
    {

        if (false !== strpos($fromEmail, '/') || empty($fromEmail)) {
            $fromEmail = $this->scopeConfig->getValue($fromEmail ?? 'trans_email/ident_general/email');
        }
        if (false !== strpos($fromName, '/') || empty($fromName)) {
            $fromName = $this->scopeConfig->getValue($fromName ?? 'trans_email/ident_general/name');
        }

        $variables['name']  = $variables['name'] ?? $toName;
        $variables['email'] = $variables['email'] ?? $toEmail;

        $storeId = $this->storeManager->getStore()->getId();

        $from = ['email' => $fromEmail, 'name' => $fromName];
        $this->inlineTranslation->suspend();

        $storeScope      = ScopeInterface::SCOPE_STORE;
        $templateOptions = [
            'area'  => Area::AREA_FRONTEND,
            'store' => $storeId
        ];

        $template = $this->transportBuilder->setTemplateIdentifier($templateId, $storeScope)
            ->setTemplateOptions($templateOptions)
            ->setTemplateVars($variables)
            ->setFrom($from);

        if (empty($toName)) {
            $template->addTo($toEmail);
        } else {
            $template->addTo($toEmail, $toName);
        }
        $transport = $template->getTransport();
        $transport->sendMessage();
        $this->inlineTranslation->resume();

    }

    protected function getAttributeOptionValue($attribute, $value, $entityType = 'product', $store = null)
    {

        try {
            $key    = "__FREEDOM_ATTRIBUTE_OPTION_VALUE_${entityType}_${attribute}_${value}_${store}";
            $result = $this->cache->load($key);
            if (false === $result) {
                $result = $this->connection->query('select eaov.option_id
from eav_attribute ea
         join eav_entity_type eet on ea.entity_type_id = eet.entity_type_id and eet.entity_type_code = :entityType
         join eav_attribute_option eao on ea.attribute_id = eao.attribute_id
         join eav_attribute_option_value eaov
              on eao.option_id = eaov.option_id and store_id = :store and eaov.value = :value
where attribute_code = :attribute',
                    [
                        'store'      => $store === null ? $this->storeManager->getStore()->getId() : $store,
                        'value'      => $value,
                        'entityType' => $entityType,
                        'attribute'  => $attribute
                    ])->fetchColumn(0);

                $this->cache->save($key, $result);

                return $result;
            }
        } catch (Exception $e) {
            $this->_logger->debug($e->getMessage(),
                [
                    'store'      => $store === null ? $this->storeManager->getStore()->getId() : $store,
                    'value'      => $value,
                    'entityType' => $entityType,
                    'attribute'  => $attribute
                ]);
            return null;
        }
    }

    public function getCustomerAttributeOptionValue($attribute, $option, $store = null)
    {
        return $this->getAttributeOptionValue($attribute, $option, 'customer', $store);
    }

    public function getCustomerAddressAttributeOptionValue($attribute, $option, $store = null)
    {
        return $this->getAttributeOptionValue($attribute, $option, 'customer_address', $store);
    }

    public function getCatalogCategoryAttributeOptionValue($attribute, $option, $store = null)
    {
        return $this->getAttributeOptionValue($attribute, $option, 'catalog_category', $store);
    }

    public function getCatalogProductAttributeOptionValue($attribute, $option, $store = null)
    {
        return $this->getAttributeOptionValue($attribute, $option, 'catalog_product', $store);
    }

    public function getOrderAttributeOptionValue($attribute, $option, $store = null)
    {
        return $this->getAttributeOptionValue($attribute, $option, 'order', $store);
    }

    public function getinvoiceAttributeOptionValue($attribute, $option, $store = null)
    {
        return $this->getAttributeOptionValue($attribute, $option, 'invoice', $store);
    }

    public function getCreditmemoAttributeOptionValue($attribute, $option, $store = null)
    {
        return $this->getAttributeOptionValue($attribute, $option, 'creditmemo', $store);
    }

    public function getShipmentAttributeOptionValue($attribute, $option, $store = null)
    {
        return $this->getAttributeOptionValue($attribute, $option, 'shipment', $store);
    }

    protected function _getAttributeLabel($entityType, $attribute, $value, $store = null)
    {

        try {
            $key    = "__FREEDOM_ATTRIBUTE_LABEL_${entityType}_${attribute}_${value}_${store}";
            $result = $this->cache->load($key);
            if (false === $result) {

                $result = $this->connection->query('select eaov.value from eav_attribute ea
    join eav_attribute_option eao on ea.attribute_id = eao.attribute_id
    join eav_attribute_option_value eaov on eao.option_id = eaov.option_id and eaov.store_id = ? and eao.option_id = ?
    join eav_entity_type eet on ea.entity_type_id = eet.entity_type_id and eet.entity_type_code = ?
    where attribute_code = ? and ea.entity_type_id = eet.entity_type_id order by eaov.store_id desc limit 1;',
                    [
                        $store === null ? $this->storeManager->getStore()->getId() : $store,
                        $value,
                        $entityType,
                        $attribute
                    ])->fetchColumn(0);

                $this->cache->save($key, $result);

                return $result;
            }
        } catch (Exception $e) {
            $this->_logger->debug($e->getMessage(),
                [
                    'entityType' => $entityType,
                    'attribute'  => $attribute,
                    'value'      => $value,
                    'store'      => $store
                ]);
            return null;
        }
    }

    public function getCustomerAttributeLabel($attribute, $value, $store = null)
    {
        return $this->_getAttributeLabel('customer', $attribute, $value, $store);
    }

    public function getProductAttributeLabel($attribute, $value, $store = null)
    {
        return $this->_getAttributeLabel('catalog_product', $attribute, $value, $store);
    }

    public function _getAttributeName($attribute, $default, $entityType)
    {
        try {
            return $this->connection->query('select IFNULL(value, frontend_label) from eav_attribute ea
left join eav_attribute_label eal on ea.attribute_id = eal.attribute_id and store_id = ?
join eav_entity_type eat on ea.entity_type_id = eat.entity_type_id and entity_type_code = ?
where attribute_code = ?;',
                [
                    $this->storeManager->getStore()->getId(),
                    $entityType,
                    $attribute
                ])->fetchColumn(0);
        } catch (Exception $e) {
            var_dump($e->getMessage());
            return $default;
        }
    }

    public function getProductAttributeName($attribute, $default = '')
    {
        return $this->_getAttributeName($attribute, $default, 'catalog_product');
    }

    public function getCustomerAttributeName($attribute, $default = '')
    {
        return $this->_getAttributeName($attribute, $default, 'customer');
    }

    public function currency($price)
    {
        return $this->currencyFormat->currency($price);
    }

    public function getCustomAttribute(CustomAttributesDataInterface $entity, $attributeCode, $default = '')
    {
        $attribute = $entity->getCustomAttribute($attributeCode);
        return $attribute === null ? $default : $attribute->getValue();
    }

    public function getStaticBlockHtml($code, $variables = [])
    {
        try {
            /** @var Block $html */
            $storeId = $this->storeManager->getStore()->getId();
            /** @var \Magento\Cms\Model\Block $block */
            $block = $this->blockFactory->create();
            /** @noinspection PhpDeprecationInspection */
            $block->setStoreId($storeId)->load($code);
            if ($block->isActive()) {
                $filter = $this->filterProvider->getBlockFilter();
                $filter
                    ->setStoreId($storeId)
                    ->setVariables($variables);
                $html = $filter->filter($block->getContent());
                return $html;
            } else {
                return '';
            }
        } catch (LocalizedException $e) {
            //SILENT
            return '';
        }
    }

    /**
     * @return Session
     */
    public function getCustomerSession()
    {
        return $this->customerSession;
    }

    /**
     * @return \Magento\Framework\App\RequestInterface
     */
    public function getRequest(): \Magento\Framework\App\RequestInterface
    {
        return $this->_request;
    }

    /**
     * @return \Magento\Framework\UrlInterface
     */
    public function getUrlBuilder(): \Magento\Framework\UrlInterface
    {
        return $this->_urlBuilder;
    }

    /**
     * @return ScopeConfigInterface
     */
    public function getConfig(): ScopeConfigInterface
    {
        return $this->scopeConfig;
    }

    /**
     * @return Encryptor
     */
    public function getEncryptor(): Encryptor
    {
        return $this->encryptor;
    }

    /**
     * @return Cache
     */
    public function getCache(): Cache
    {
        return $this->cache;
    }

    /**
     * @return ManagerInterface
     */
    public function getMessages(): ManagerInterface
    {
        return $this->messages;
    }

    /**
     * @param int|null $customerId
     * @return \Magento\Customer\Api\Data\CustomerInterface
     */
    public function getCustomer(int $customerId = null): \Magento\Customer\Api\Data\CustomerInterface
    {
        if ($this->customer === null) {
            $this->customer = $this->customerRepository->getById($customerId ?? $this->getCustomerSession()->getCustomerId());
        }
        return $this->customer;
    }

    /**
     * @param string $groupName
     * @return GroupInterface
     */
    public function getCustomerGroup(string $groupName): GroupInterface
    {
        $groupList = $this->groupRepository->getList(
            $this->simpleSearchCriteria('customer_group_code', $groupName)
        );
        if ($groupList->getTotalCount() === 0) {
            return $groupList->getItems()[0];
        } else {
            $groupList = $this->groupRepository->getList(
                $this->simpleSearchCriteria('customer_group_code', $groupName)
            );
            return $groupList->getItems()[0];
        }
    }

    /**
     * @param string $field
     * @param mixed  $value
     * @param string $condition
     * @return \Magento\Framework\Api\SearchCriteria
     */
    public function simpleSearchCriteria($field, $value, $condition = 'eq')
    {
        $searchCriteria = $this->searchCriteriaBuilder->create();
        $filter         = $this->filterBuilder->create();
        $filter->setField($field);
        $filter->setValue($value);
        $filter->setConditionType($condition);
        $filterGroup = $this->filterGroupBuilder->addFilter($filter)->create();
        $searchCriteria->setFilterGroups([$filterGroup]);
        return $searchCriteria;
    }

    /**
     * @param array $values
     * @param array $orders
     * @return \Magento\Framework\Api\SearchCriteria
     * @throws \Magento\Framework\Exception\InputException
     */
    public function assocToSearchCriteria(array $values, array $orders = [])
    {
        $searchCriteria = $this->searchCriteriaBuilder->create();
        $filterGroups   = [];
        foreach ($values as $field => $value) {
            list($field, $condition) = explode(':', $field . ':eq');
            $filter = $this->filterBuilder->create();
            $filter->setField($field);
            $filter->setValue($value);
            $filter->setConditionType($condition ?? 'eq');
            $this->filterGroupBuilder->addFilter($filter);
            $filterGroups[] = $this->filterGroupBuilder->create();
        }

        $searchCriteria->setFilterGroups($filterGroups);
        $sortOrders = [];
        foreach ($orders as $field => $direction) {
            $sortOrders[] = $this->sortOrderBuilder->create()->setDirection($direction)->setField($field);
        }
        $searchCriteria->setSortOrders($sortOrders);
        return $searchCriteria;
    }

    /**
     * @return GroupRepositoryInterface
     */
    public function getGroupRepository(): GroupRepositoryInterface
    {
        return $this->groupRepository;
    }

    /**
     * @return SortOrderBuilder
     */
    public function getSortOrderBuilder(): SortOrderBuilder
    {
        return $this->sortOrderBuilder;
    }

    /**
     * @return FilterBuilder
     */
    public function getFilterBuilder(): FilterBuilder
    {
        return $this->filterBuilder;
    }

    /**
     * @return FilterGroupBuilder
     */
    public function getFilterGroupBuilder(): FilterGroupBuilder
    {
        return $this->filterGroupBuilder;
    }

    /**
     * @param      $sku
     * @param bool $editMode
     * @param null $storeId
     * @param bool $forceReload
     * @return \Magento\Catalog\Api\Data\ProductInterface
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    public function getProductBySku($sku, $editMode = false, $storeId = null, $forceReload = false)
    {
        return $this->productRepository->get($sku, $editMode, $storeId, $forceReload);
    }

    /**
     * @param      $productId
     * @param bool $editMode
     * @param null $storeId
     * @param bool $forceReload
     * @throws \Magento\Framework\Exception\NoSuchEntityException
     */
    public function getProductById($productId, $editMode = false, $storeId = null, $forceReload = false)
    {
        return $this->productRepository->getById($productId, $editMode, $storeId, $forceReload);
    }

    /**
     * @return CheckoutSession
     */
    public function getCheckoutsession(): CheckoutSession
    {
        return $this->checkoutsession;
    }
}

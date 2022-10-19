<?php

namespace Freedom\Core\Helper;

use Magento\AdobeImsApi\Api\Data\UserProfileInterface;
use Magento\AdobeImsApi\Api\UserProfileRepositoryInterface;
use Magento\Authorization\Model\CompositeUserContext;
use Magento\Authorization\Model\UserContextInterface;
use Magento\Customer\Api\CustomerRepositoryInterface;
use Magento\Customer\Api\Data\CustomerInterface;
use Magento\Framework\App\Area;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Framework\App\State;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;

class WebApi extends AbstractHelper
{
    /**
     * @var Context
     */
    private $context;
    /**
     * @var State
     */
    private $state;
    /**
     * @var CompositeUserContext
     */
    private $userContext;
    /**
     * @var CustomerRepositoryInterface
     */
    private $customerRepository;
    /**
     * @var UserProfileRepositoryInterface
     */
    private $userProfileRepository;

    /**
     * WepApí constructor.
     * @param Context                        $context
     * @param State                          $state
     * @param CompositeUserContext           $userContext
     * @param CustomerRepositoryInterface    $customerRepository
     * @param UserProfileRepositoryInterface $userProfileRepository
     */
    public function __construct(
        Context $context,
        State $state,
        CompositeUserContext $userContext,
        CustomerRepositoryInterface $customerRepository,
        UserProfileRepositoryInterface $userProfileRepository
    )
    {
        parent::__construct($context);
        $this->context               = $context;
        $this->state                 = $state;
        $this->userContext           = $userContext;
        $this->customerRepository    = $customerRepository;
        $this->userProfileRepository = $userProfileRepository;
    }

    public function getAreaCode()
    {
        return $this->state->getAreaCode();
    }

    public function isAreaGlobal()
    {
        return $this->getAreaCode() === Area::AREA_GLOBAL;
    }

    public function isAreaFrontend()
    {
        return $this->getAreaCode() === Area::AREA_FRONTEND;
    }

    public function isAreaAdminhtml()
    {
        return $this->getAreaCode() === Area::AREA_ADMINHTML;
    }

    public function isAreaDoc()
    {
        return $this->getAreaCode() === Area::AREA_DOC;
    }

    public function isAreaCrontab()
    {
        return $this->getAreaCode() === Area::AREA_CRONTAB;
    }

    public function isAreaWebapiRest()
    {
        return $this->getAreaCode() === Area::AREA_WEBAPI_REST;
    }

    public function isAreaWebapi_soap()
    {
        return $this->getAreaCode() === Area::AREA_WEBAPI_SOAP;
    }

    public function isAreaGraphql()
    {
        return $this->getAreaCode() === Area::AREA_GRAPHQL;
    }

    public function getUserType()
    {
        return $this->userContext->getUserType();
    }

    public function isUserTypeIntegration()
    {
        return $this->getUserType() === UserContextInterface::USER_TYPE_INTEGRATION;
    }

    public function isUserTypeAdmin()
    {
        return $this->getUserType() === UserContextInterface::USER_TYPE_ADMIN;
    }

    public function isUserTypeCustomer()
    {
        return $this->getUserType() === UserContextInterface::USER_TYPE_CUSTOMER;
    }

    public function isUserTypeGuest()
    {
        return $this->getUserType() === UserContextInterface::USER_TYPE_GUEST;
    }

    public function getUserId()
    {
        return $this->userContext->getUserId();
    }

    /**
     * @return UserProfileInterface
     * @throws LocalizedException
     * @throws NoSuchEntityException
     */
    public function getUser()
    {
        if ($this->isUserTypeAdmin()) {
            return $this->userProfileRepository->getByUserId($this->getUserId());
        }
        throw new LocalizedException(__('User is not available beacuse the user type is not admin'));
    }

    /**
     * @return CustomerInterface
     * @throws LocalizedException
     * @throws NoSuchEntityException
     */
    public function getCustomer()
    {
        if ($this->isUserTypeAdmin()) {
            return $this->customerRepository->getById($this->getUserId());
        }
        throw new LocalizedException(__('User is not available beacuse the user type is not customer'));
    }
}

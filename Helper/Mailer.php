<?php

namespace Freedom\Core\Helper;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\Helper\AbstractHelper;
use Magento\Framework\App\Helper\Context;
use Magento\Framework\Mail\Template\TransportBuilder;
use Magento\Framework\Translate\Inline\StateInterface;
use Magento\Store\Model\StoreManagerInterface;

class Mailer extends AbstractHelper
{
    protected $transportBuilder;
    protected $storeManager;
    protected $inlineTranslation;

    /**
     * Mail constructor.
     * @param Context               $context
     * @param TransportBuilder      $transportBuilder
     * @param StoreManagerInterface $storeManager
     * @param StateInterface        $state
     * @param ScopeConfigInterface  $scopeConfig
     */
    public function __construct(
        Context $context,
        TransportBuilder $transportBuilder,
        StoreManagerInterface $storeManager,
        StateInterface $state,
        ScopeConfigInterface $scopeConfig
    )
    {
        $this->transportBuilder  = $transportBuilder;
        $this->storeManager      = $storeManager;
        $this->inlineTranslation = $state;
        $this->scopeConfig       = $scopeConfig;
        parent::__construct($context);
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

        $storeScope      = \Magento\Store\Model\ScopeInterface::SCOPE_STORE;
        $templateOptions = [
            'area'  => \Magento\Framework\App\Area::AREA_FRONTEND,
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
}

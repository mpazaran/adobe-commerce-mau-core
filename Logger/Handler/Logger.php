<?php

namespace Freedom\Core\Logger\Handler;

use Magento\Framework\Logger\Handler\Base;
use Monolog\Logger as MonoLogger;

class Logger extends Base
{

    /**
     * @var string
     */
    protected $fileName = '/var/log/freedom_core.log';

    /**
     * @var
     */
    protected $loggerType = MonoLogger::DEBUG;

}

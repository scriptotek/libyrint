<?php

require(__DIR__.'/vendor/autoload.php');

$dotenv = Dotenv\Dotenv::create(__DIR__);
$dotenv->load();

if (isset($_ENV['SENTRY_DSN'])) {
    Sentry\init(['dsn' => $_ENV['SENTRY_DSN']]);
}


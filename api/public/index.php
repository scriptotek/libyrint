<?php

use Symfony\Component\HttpFoundation\Request;

require('../bootstrap.php');

$app = new App\App();
$request = Request::createFromGlobals();
$response = $app->handleRequest($request);
$response->send();

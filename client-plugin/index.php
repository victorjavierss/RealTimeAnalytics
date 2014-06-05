<?php
/**
 * Created by PhpStorm.
 * User: vjavier
 * Date: 6/4/14
 * Time: 11:38 PM
 */

require_once __DIR__.'/vendor/autoload.php';

use Symfony\Component\HttpFoundation\Response;

$app = new Silex\Application();

$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver'   => 'pdo_mysql',
        'host'      => 'realtimeanalytics.c1jgsj59qnnj.us-west-2.rds.amazonaws.com',
        'dbname'    => 'nodeanal',
        'user'      => 'realanal',
        'password'  => 'r#!s123RTE!',
    ),
));

$app->register(new Silex\Provider\HttpCacheServiceProvider(), array(
    'http_cache.cache_dir' => __DIR__.'/cache/',
));

$app->get('/{version}/{apikey}', function($version, $apikey) use ($app)  {

    $sql = "SELECT * FROM customer WHERE apikey = ?";
    $customer = $app['db']->fetchAssoc($sql, array( $apikey ));

    var_dump( $customer );


    $expiresDate = new DateTime();
    $expiresDate->modify('+3600 seconds');

    $response = new Response("{$version}/{$apikey}");
    $response->setPublic();
    $response->setSharedMaxAge(3600);

    $response->setExpires( $expiresDate );
    $response->headers->addCacheControlDirective('must-revalidate', true);

    $response->setEtag($apikey);

    return $response;
});

$app->run();
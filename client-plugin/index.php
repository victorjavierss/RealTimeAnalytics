<?php
/**
 * Created by PhpStorm.
 * User: vjavier
 * Date: 6/4/14
 * Time: 11:38 PM
 */

require_once __DIR__.'/vendor/autoload.php';
require_once __DIR__.'/lib/JShrink/Minifier.php';
require_once __DIR__.'/lib/SilexMemcache/MemcacheExtension.php';


use Symfony\Component\HttpFoundation\Response;
use JShrink\Minifier;

$app = new Silex\Application();

define( 'APP_HOME', __DIR__  );
define( 'JS_PATH', __DIR__ . DIRECTORY_SEPARATOR . 'private' . DIRECTORY_SEPARATOR  );

$app['debug'] = true;

$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver'   => 'pdo_mysql',
        'host'      => 'realtimeanalytics.c1jgsj59qnnj.us-west-2.rds.amazonaws.com',
        'dbname'    => 'nodeanal',
        'user'      => 'realanal',
        'password'  => 'r#!s123RTE!',
    ),
));

$app->register(new SilexMemcache\MemcacheExtension(), array(
    'memcache.library'    => 'memcached',
    'memcache.server' => array(
        array('127.0.0.1', 11211)
    )
));

$app->register(new Silex\Provider\HttpCacheServiceProvider(), array(
    'http_cache.cache_dir' => __DIR__.'/cache/',
) );

$app->get('/{version}/{apikey}', function($version, $apikey) use ($app)  {

    $sql = "SELECT * FROM customer WHERE apikey = ?";
    $customer = $app['db']->fetchObject($sql, array( $apikey ));

    if( $customer ){

        $customerPackage = $customer->modules;
        if ( $customerPackage ){
            $socketIO   = JS_PATH . 'socket.io.js';
            $basePlugin = JS_PATH . 'base-api.js';
            $pluginJS   = JS_PATH . $customerPackage.'-plugin.js';

            if( $app['memcache']->get($version.$apikey) ){
                $compiledJS = file_get_contents($basePlugin) .  file_get_contents($socketIO)  . file_get_contents($pluginJS) . "var rap = new RealTimeAnalytics('{$apikey}')";
                $compiledJS = \JShrink\Minifier::minify($compiledJS);
                $app['memcache']->set($version.$apikey, $compiledJS);
            }

            $expiresDate = new DateTime();
            $expiresDate->modify('+3600 seconds');

            $response = new Response( $app['memcache']->get($version.$apikey) );
            $response->setPublic();
            $response->setSharedMaxAge(3600);

            $response->setExpires( $expiresDate );
            $response->headers->addCacheControlDirective('must-revalidate', true);
            $response->headers->set('Content-Type' , 'text/javascript');

            $response->setEtag($apikey);

            return $response;

        }else{
            $app->abort(404);
        }
    }else{
        $app->abort(404);
    }

    $app->abort(404);
});

$app->run();
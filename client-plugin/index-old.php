<?php
	header("content-type: text/javascript; charset: UTF-8");
	header("cache-control: must-revalidate");
	$offset = 3600;
	$expire = "expires: ".gmdate("D, d M Y H:i:s", time() + $offset)." GMT";
	header($expire);
    if( !ob_start("ob_gzhandler") ){
		ob_start();
	}

    define( 'APP_HOME', dirname(__FILE__)  );
    define( 'JS_PATH', APP_HOME . DIRECTORY_SEPARATOR . 'private' . DIRECTORY_SEPARATOR  );

    $include_path  =  APP_HOME . DIRECTORY_SEPARATOR . 'lib';

    set_include_path( $include_path . PATH_SEPARATOR . get_include_path());


    $apiKey = isset ( $_GET['apikey'] ) ? $_GET['apikey']  : 'doesntexits' ;

    $frontendOptions = array(
        'lifeTime' => 3600 // cache lifetime of 1 hour
    );

    $backendOptions = array(
        'cacheDir' => '/tmp/' // where to put the cache files
    );


    function __autoload($class_name){
            $class = str_replace('_',DIRECTORY_SEPARATOR,$class_name);
            $file = $class . '.php';
            if ($fh = @fopen($file, 'r', true)) {
                    include_once $file;
                }
         @fclose($fh);
     }

    $cache = Zend_Cache::factory('Core', 'File', $frontendOptions, $backendOptions);

    if ( ! ($jsCode = $cache->load( $apiKey ) ) ){
        require_once 'lib/JShrink/Minifier.php';
        $jsCode = '';
        $dbAdapter = Zend_Db::factory('Pdo_Mysql', array(
            'host'             => 'realtimeanalytics.c1jgsj59qnnj.us-west-2.rds.amazonaws.com',
            'username'         => 'realanal',
            'password'         => 'r#!s123RTE!',
            'dbname'           => 'nodeanal'
        ));
        Zend_Db_Table::setDefaultAdapter($dbAdapter);
        $customerTable = new Zend_Db_Table('customer');
        $select  = $customerTable->select()->where('apikey = ?', $apiKey);
        $customer = $customerTable->fetchRow($select);
        if( $customer ){
            $customerPackage = $customer->modules;
            if ( $customerPackage ){
                $socketIO   = JS_PATH . 'socket.io.js';
                $basePlugin = JS_PATH . 'base-api.js';
                $pluginJS   = JS_PATH . $customerPackage.'-plugin.js';
                $jsCode = file_get_contents($basePlugin) .  file_get_contents($socketIO) . file_get_contents($pluginJS) . "var rap = new RealTimeAnalytics('{$apiKey}')";
            }else{
                header('HTTP/1.1 401 Unauthorized');
                $jsCode = json_encode(array('error'=>"ApiKey not assigned"));
            }
        }else{
            header('HTTP/1.1 401 Unauthorized');
            $jsCode = json_encode(array('error'=>"ApiKey not assigned"));
        }

        $jsCode = \JShrink\Minifier::minify($jsCode);
        $cache->save($jsCode, $apiKey);
    }
    echo $jsCode;
	ob_flush();
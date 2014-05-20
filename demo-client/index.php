<html>
<head>
<title>Sample Player Module</title>
<script src="http://code.jquery.com/jquery-1.10.1.js"></script>
<script src="http://underscorejs.org/underscore.js"></script>
<!-- Ooyala Player -->
<script src="http://player.ooyala.com/v3/dcb79e2098c94889a1b9f2af6280b45d?version=2568beb0b141148c0e3f325f74f8a14fc277ca3d"> </script>

<!-- Real Time Analytics Plugin -->
<script type="text/javascript" src="http://ec2-54-187-235-66.us-west-2.compute.amazonaws.com/RealTimeAnalytics/client-plugin/?apikey=5593f8214fc7af3b82da8dd69d62a491210b28e0"></script>
</head>

<?php $ec = isset($_GET['ec']) ? $_GET['ec'] : 'dqbTVyZDqq92dzx4MRZOcrpBUNdGDQbR'; ?>
<body>
<div id='vd6799785e' ec='<?=$ec?>' style='width:770px;height:440px'></div>
<script type="text/javascript">
<!--//--><![CDATA[//><!--
	var player = null;
    OO.ready(function() {
    	player =  OO.Player.create('vd6799785e', '<?php echo $ec; ?>', {"wmode":"opaque","flashParams":{"hide":"all"}} );
    });
//--><!]]>
</script>
</body>
</html>
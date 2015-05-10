<?php

### configuration

$db['db_server'] = 'localhost';
$db['db_user'] = 'root';
$db['db_pass'] = '';
$db['db_database'] = 'coolcms';

### ---------------------
### connect to database
### ---------------------

$link = mysqli_connect($db['db_server'], $db['db_user'], $db['db_pass'], $db['db_database']);

if(mysqli_connect_errno()) {
  
	die("Failed to connect to MySQL: " . mysqli_connect_error());
}

### ---------------------
### controller
### ---------------------

/*
coolcms.php           		    /get all posts
coolcms.php?post=32   		    /get post 32
coolcms.php?offset=1  	        /get posts 11 - 20
coolcms.php?channel=3 		    /get all channel 3 posts
coolcms.php?latest=5&channel=3
*/

if(count($_GET)) {

	if(isset($_GET['more'])){
      
      $offset = mysqli_escape_string($link, $_GET['more']);
      if(isset($_GET['count'])){
        $count = mysqli_escape_string($link, $_GET['count']);
      } else {
        $count = 1;
      }
      
      get_posts($offset, $count); 
      
    } else if (isset($_GET['post'])){
      
      get_post_by_id(mysqli_escape_string($link, $_GET['post']),false);   
      
    } else if (isset($_GET['parse'])){
    
      $toSend = array('result' => parse($_GET['parse']));
      
      print_r(json_encode($toSend));
      
      
      
    }
	
} else {

	get_posts(0, 5);
	
}

### ---------------------
### public functions
### ---------------------

function get_posts($offset, $count) {
	
	global $link;
    $morePosts = false;
	
	$sql = "SELECT COUNT(1) FROM posts";
	
	$result = mysqli_query($link, $sql);
	$total = mysqli_fetch_array($result);
	
	$sql = "SELECT * FROM posts ORDER BY date DESC LIMIT $offset, $count";
  
    $result = mysqli_query($link,"SELECT * FROM posts ORDER BY date DESC LIMIT " . ($offset + $count) . ",1");
  
    if(mysqli_num_rows($result) != 0){
      $morePosts = true;
    }

	$result = mysqli_query($link, $sql);
	$rows = array();

	while ($row = mysqli_fetch_assoc($result)) {
		$rows[] = $row;
	}	

	//$json = '{"total":"' . $total[0] . '","posts":';
	$json = '{"posts": ';
    $json .= json_encode($rows);
    $json .= ',"morePosts":"' . $morePosts . '"';
	$json .= "}";
	
	print($json);	
}

function get_post_by_id($postId, $clean){

  global $link;
  
  $sql = 'SELECT * FROM posts WHERE id = ' . $postId;  
  $result = mysqli_query($link, $sql);
  
  $toSend = mysqli_fetch_assoc($result);
  print json_encode($toSend);

}

function parse($markdown){

  //include PHP Markdown Parser and instantiate it
  include '/parsedown/Parsedown.php';
  $Parsedown = new Parsedown();
  
  return($Parsedown->text($markdown)); 

}

### ---------------------
### private functions
### ---------------------
/*
function json_fix_encode($struct) {
	
   return preg_replace("/\\\\u([a-f0-9]{4})/e", "iconv('UCS-4LE','UTF-8',pack('V', hexdec('U$1')))", json_encode($struct));
}*/




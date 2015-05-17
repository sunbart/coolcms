<?php

session_start();

//include config file
include 'config.php';

//include PHP Markdown Parser and instantiate it
include '/parsedown/Parsedown.php';
$parser = new Parsedown();

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

if(count($_GET)) {

	if(isset($_GET['more'])){
      
      $offset = mysqli_escape_string($link, $_GET['more']);
      if(isset($_GET['count'])){
        $count = mysqli_escape_string($link, $_GET['count']);
      } else {
        $count = 1;
      }
      
      get_posts($offset, $count); 
      
    }
    else if (isset($_GET['post'])){
      
      get_post_by_id(mysqli_escape_string($link, $_GET['post']),false);   
      
    }
    else if (isset($_GET['parse'])){
    
      $toSend = array('result' => parse($_GET['parse']));
      
      print_r(json_encode($toSend));
      
    }
    else if (isset($_GET['clean'])) {
    
      get_post_by_id(mysqli_escape_string($link, $_GET['clean']),true);
    
    } 
    else if (isset($_GET['save'])){
    
      $id = mysqli_escape_string($link, $_GET['save']);
      $title = mysqli_escape_string($link, $_GET['title']);
      $body = mysqli_escape_string($link, $_GET['body']);
      
      save_post($id, $title, $body);
    
    } 
    else if (isset($_GET['new'])){
    
      new_post();
    
    } 
    else if (isset($_GET['delete'])){
    
      delete_post(mysqli_escape_string($link, $_GET['delete']));
      
    } 
    else if (isset($_GET['loggedin'])){
    
      $reply = array('loggedIn' => false);
      if(isset($_SESSION['loggedIn']) and $_SESSION['loggedIn'] == true){
        $reply['loggedIn'] = true;
      }
      
      print(json_encode($reply));
    
    } 
    else if (isset($_GET['login'])){
    
      $reply = array('success' => false);
      if(isset($users[$_GET['login']])){
        if($users[$_GET['login']] == $_GET['password']){
          $reply = array('success' => true);
          $_SESSION['loggedIn'] = true;
        }
      }
      
      print(json_encode($reply));
    
    } 
    else if (isset($_GET['logout'])){
    
      unset($_SESSION['loggedIn']);      
      print('{}');
    
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
      $rowWithParsedBody = $row;
      $rowWithParsedBody['body'] = parse($row['body']);
      $rows[] = $rowWithParsedBody;
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
  
  if(!$clean){
  
    $toSend['body'] = parse($toSend['body']);
  
  }
  
  print json_encode($toSend);

}
               
function parse($markdown){
  global $parser;
  return($parser->text($markdown)); 

}
               
function save_post($postID, $title, $body){

  global $link;
  
  $sql = 'UPDATE posts SET title="' . $title . '", body="' . $body . '" WHERE id=' . $postID;
  
  mysqli_query($link, $sql);
  
  $sql = 'SELECT * FROM posts WHERE id=' . $postID;
  $result = mysqli_query($link, $sql);
  
  $saveResult = mysqli_fetch_assoc($result);
  $saveResult['body'] = parse($saveResult['body']);
  
  
  print json_encode($saveResult);

}

function new_post(){

  global $link;
  
  $sql = 'INSERT INTO posts (date, title, body) VALUES (CURDATE(), "A Whole New Post", "This is a new post. Read further for formatting instructions, otherwise, feel free to delete all the text in here and begin with the creation of your next literary masterpiece.\n\nYou can use octothorpes (pound signs, hashtags) to create headings, like so:\n\n# Level 1 heading\n\n## Level 2 Heading\n\n### Level 3 heading\n\n#### And so on...\n\n####### Level 7 headings and below don\'t exist\n\nCreate new paragraphs by separating them by an empty line\n\nlike\n\nso.\n\nStuff like __bold__, _italics_, ~~strikethrough~~ and ___~~combinations~~___ is possible.\n\nUse these signs to create unordered lists:\n\n* An asterix\n- A dash\n+ A plus\n- You can mix them however you want\n\nOrdered lists need a number, a dot and some whitespace, like so:\n\n1. See?\n2. Quite easy.\n112358. The numbers do not matter.\n1. So you can be lazy and just use a 1.\n1. Also, notice that you need an empty line before the list.\n\n> Emphases and quotations could be useful\n> > You can nest them\n> > if you want,\n> > but to force a\n\n> > new\n\n> > line, use empty lines as a separator.\n\nCode blocks exist too...\n\n    print(\'Hello World\');\n    just_use(4, \'spaces\'); //Before all the lines\n\n<span style=\"color: red\">You can put in HTML and it will be preserved, but make sure to not overuse it. After all, that is what Markdown is for, to not make you write HTML</span>")';
  
  mysqli_query($link, $sql);
  
  $sql = 'SELECT id FROM posts WHERE title = "A Whole New Post"';
  $result = mysqli_query($link, $sql);
  
  print(json_encode(mysqli_fetch_assoc($result)));

}

function delete_post($postID){

  global $link;
  
  $sql = 'DELETE FROM posts WHERE id=' . $postID;
  mysqli_query($link, $sql);
  
  $output = array('id' => $postID);
  print(json_encode($output));
  
}
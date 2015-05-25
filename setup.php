<?php

//include config file
include 'config.php';

$link = mysqli_connect($db['db_server'], $db['db_user'], $db['db_pass']);

if(mysqli_connect_errno()) {
  
  die("Failed to connect to MySQL: " . mysqli_connect_error());
  
} else {

  $sql = 'CREATE DATABASE IF NOT EXISTS `' . $db['db_database'] . '`';
  
  mysqli_query($link, $sql);
  
  mysqli_close($link);
  
  $link = mysqli_connect($db['db_server'], $db['db_user'], $db['db_pass'], $db['db_database']);
  
  if(mysqli_connect_errno()) {
  
    die("Failed to connect to MySQL: " . mysqli_connect_error());

  } else {
  
    $sql = "CREATE TABLE IF NOT EXISTS `posts` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `date` date NOT NULL,
      `title` varchar(255) NOT NULL,
      `body` text NOT NULL,
      `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
      ) ENGINE=InnoDB  DEFAULT CHARSET=latin1";
    
    mysqli_query($link, $sql);
    
    $sql = 'INSERT INTO posts (title, body) VALUES ("Your First Post", "This is a sample post, I suggest you delete it and create a new one for ourself.")';
  
    mysqli_query($link, $sql);
    
  }
  
  header('Location: index.html');
  die();

}

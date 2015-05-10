(function($) {

  $.fn.coolcms = function(options) {
    
    var settings = $.extend({
      server: "coolcms.php"
    }, options);
    
    //declaration of general variables used throughout the script
    {
      var currentOffset = 0;
      var currentCount = 5;
      var postDetail = false;
      var self = this;
      var previousWindowPostion = 0;
    }
    
    
    //Expand post click event
    $(self).on('click', '.postHeading', function(event){
      
      var postId = $(this).parent().data('id');
       
      if(postDetail == false){
        showPostDetails(postId);
        postDetail = true;
        previousWindowPostion = $(window).scrollTop();
      } else {
        $('.detailedPost').remove();
        $('div .post').show();
        $('#morePostsButton').show();
        postDetail = false;
        $(window).scrollTop(previousWindowPostion);
      }
      
      
      
    });

    //Returns a post in proper HTML with \r\n\r\n replaced with paragraph tags
    var formatPost = function(d) {

      var s = '';
      
      var body = d.body;
      
      body = '<p>' + body.replace('\r\n\r\n','</p>\n<p>') + '</p>';
      
      if(body.length > 400){
        body = body.substring(0, body.indexOf('</p>'));
      }

      s = '<div class="post" data-id="' + d.id + '"><h2 class="postHeading">' + d.title + '</h2>';
      s += '<p class="date">' + d.date + '</p><div class="postBody">';
      s += body;
      s += '</div></div>'

      return s;
      
    };

    //Loads the first 5 posts
    $.getJSON(settings.server, function(data) {

      $(self).empty();
      
      $.each(data.posts, function(key, val) {
        $(self).append(formatPost(val)); 
        
      });

      if(data.morePosts == "1"){
        $(self).append('<div id="morePostsButton">Show More Posts</div>');
        $('#morePostsButton').on('click',showMorePosts);
      }

    });

    //Loads one more post, appends it in a proper format and creates a new "Show More Posts" button, if appropriate
    var showMorePosts = function(){     
      
      $.getJSON(settings.server, {more: currentOffset + currentCount, count: 1}, function(data){
        
        $.each(data.posts, function(key, val) {
        
          $(self).append(formatPost(val))
        
        });
        
        $('#morePostsButton').remove();
        
        if(data.morePosts == "1"){
          $(self).append('<div id="morePostsButton">Show More Posts</div>');
          $('#morePostsButton').on('click',showMorePosts);
        }
        
        currentCount++;
        
      });      
    }
    
    //Loads, formats and appends the whole post identified by postId
    var showPostDetails = function(postId){
      
      $.getJSON(settings.server, {post: postId}, function(data){ 
      
        $('div .post').hide();
        $('#morePostsButton').hide();
        
        body = data.body;
        
        
        while(!(body.indexOf('\r\n\r\n')==-1)){
          body = body.replace('\r\n\r\n','</p>\n<p>');
        }
        
        s = '<div class="detailedPost" data-id="' + data.id + '"><h2 class="postHeading">' + data.title + '</h2>';
        s += '<p class="date">' + data.date + '</p><div class="postBody">';
        s += '<p>' + body + '</p>';
        s += '</div></div>'
        
        console.log(s);
        $(self).append(s);
      
      });     
      
    }   

    return this;

  };
  
  $.fn.coolcmsAdmin = function(options){
  
    var settings = $.extend({
      server: "coolcms.php"
    }, options);
    
    var self = this;
    
    $(self).append('<textarea id="input"></textarea>');
    
    $(self).append(html_content);
      
  }

}(jQuery));

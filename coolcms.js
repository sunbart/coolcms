(function($) {

  $.fn.coolcms = function(options) {
    
    var currentOffset = 0;
    var currentCount = 5;
    var postDetail = false;
    
    var settings = $.extend({
      server: "coolcms.php"
    }, options);
    
    $('#blog').on('click', '.postHeading', function(event){
      
      var postId = $(this).parent().data('id');
       
      if(postDetail == false){
        showPostDetails(postId);
      } else {
        hidePostDetails();        
      }
      
      
    });

    var self = this;

    var formatPost = function(d) {

      var s = '';
      
      var body = d.body;
      
      body = '<p>' + body.replace('\r\n\r\n','</p>\n<p>') + '</p>';
      
      if(body.length > 400){
        body = body.substring(0, body.indexOf('</p>'));
      }

      s = '<div class="post" data-id="' + d.id + '"><h2 class="postHeading">' + d.title + '</h2>';
      s += '<p>' + d.date + "</p>";
      s += body;
      s += '</div>'

      return s;
      
    };


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
    
    var showPostDetails = function(postId){
      
      $.getJSON(settings.server, {post: postId}, function(data){ 
      
        $('div .post').hide();
        $('#morePostsButton').hide();
        
        body = data.body;
        
        
        while(!(body.indexOf('\r\n\r\n')==-1)){
          body = body.replace('\r\n\r\n','</p>\n<p>');
        }
        
        s = '<div class="detailedPost" data-id="' + data.id + '"><h2 class="postHeading">' + data.title + '</h2>';
        s += '<p>' + data.date + "</p>";
        s += '<p>' + body + '</p>';
        s += '</div>'
        
        console.log(s);
        $(self).append(s);
      
      });     
      
    }
    
    

    return this;

  };


}(jQuery));
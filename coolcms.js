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
    
    //Show more posts event 
    $(self).on('click', '#morePostsButton', function(event){
    //loads one more post, appends it in a proper format and 
    //creates a new "Show More Posts" button, if appropriate
         
      $.getJSON(settings.server, {more: currentOffset + currentCount, count: 1}, function(data){
        
        $.each(data.posts, function(key, val) {
        
          $(self).append(formatPost(val))
        
        });
        
        $('#morePostsButton').remove();
        
        if(data.morePosts == "1"){
          $(self).append('<div id="morePostsButton">Show More Posts</div>');
        }
        
        currentCount++;
        
      });    
      
    });
    
    //Edit post event
    $(self).on('click', '.editPostButton', function(event){
    
      var postId = $(this).parent().data('id');
      
      var self = this;
      
      $.getJSON(settings.server, {clean: postId},  function(data){
        
        var s = '<div class="postEditArea" style="display: none" data-bodyHash="" data-headingHash="">';
        s += '<input type="text" class="editPostHeading" value="' + data.title + '">';
        s += '<textarea class="editPostBody">' + data.body + '</textarea>';
        s += '<div class="button editorButton previewButton">Preview</div>';
        s += '<div class="button editorButton saveButton">Save</div>';
        s += '<div class="button editorButton closeButton">Close</div>';
        s += '</div>';

        $(self).before(s).hide();
        
        $('.postEditArea').data('headingHash', String(CryptoJS.MD5($('.editPostHeading').val()))).data('bodyHash', String(CryptoJS.MD5($('.editPostBody').val())));
        
        $('.postEditArea').slideToggle();
        
      });
    
    });
    
    //Close post editing form (checks, whether changes have been made, if yes, display dialogue)
    $(self).on('click', '.closeButton', function(event){
      
      if(CryptoJS.MD5($(this).siblings('.editPostHeading').val()) != $('.postEditArea').data('headingHash') || CryptoJS.MD5($(this).siblings('.editPostBody').val()) != $('.postEditArea').data('bodyHash')){//changes have been made in heading or body
        $.jconfirm({//ask for confirmation
          title: 'You made some changes.',
          message: 'Do you really want to abandon them?',
          confirm: 'Yes',
          cancel: 'Go back'
        }, function() {//discard changes
          $('.postEditArea').slideUp(function(){
          $('.postEditArea').remove();
          $('.editPostButton').slideDown(200);
        });
        });
      } else {//no changes have been made      
        $('.postEditArea').slideUp(function(){
          $('.postEditArea').remove();
          $('.editPostButton').slideDown(200);
        });
      }
      
      //set timeout unbind Enter click event      
            
    });
    
    //Get parsed input from the server and populate the post with it
    $(self).on('click', '.previewButton, .reloadButton',function(event){
    
      var postID = $(this).parent().parent().data('id');
      var self = this;
      
      $.getJSON(settings.server, {parse:$('.editPostBody').val()}, function(data){
      
        $('div[data-id="' + postID + '"] h2').text($('.editPostHeading').val());
        $('div[data-id="' + postID + '"] .postBody').html(data.result);
        
        
        var moreButtons = '';
        
        if($('.postEditArea').children('.originalButton').size() == 0){
          moreButtons += '<div class="button editorButton originalButton" style="display: initial;">Show Original</div>\n';
        }
        moreButtons += '<div class="button editorButton reloadButton" style="display: initial;">Reload Preview</div>';
        $(self).before(moreButtons);
        
        $(self).hide();
        
      });
    
    });
    
    //Reloads the post from the server
    $(self).on('click','.originalButton',function(event){
    
      var self = this;
      
      $.getJSON(settings.server, {post: $(self).parents('.detailedPost').data('id')}, function(data){
      
        $(self).parents('.detailedPost').children('h2').text(data.title);
        $(self).parents('.detailedPost').children('.postBody').html(data.body);
        
        $('.reloadButton').remove();
        $('.previewButton').show();
        $(self).remove();
        
      });
    
    });
    
    $(self).on('click', '.saveButton', function(event){
    
      console.log({
        save: $(this).parent().parent().data('id'),
        title: $('.editPostHeading').val(),
        body: $('.editPostBody').val()
      });
    
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
      }

    });
    
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
        s += '</div><div class="button editPostButton">Edit Post</div></div>'
        
        $(self).append(s);
      
      });     
      
    }   

    return this;

  };
  
}(jQuery));

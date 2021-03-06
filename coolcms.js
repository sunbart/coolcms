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
          $(self).append('<div id="morePostsButton" class="button">Show More Posts</div>');
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
        s += '<div class="button editorButton deleteButton">Delete post</div>';
        s += '</div>';

        $(self).before(s).hide();
        
        $('.postEditArea').data('headingHash', String(CryptoJS.MD5($('.editPostHeading').val()))).data('bodyHash', String(CryptoJS.MD5($('.editPostBody').val())));
        
        $('.postEditArea').slideToggle(function(){
          var offset = $('.postEditArea').offset().top;
          $(window).scrollTop(offset);
        });
        
        
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
        if ($('.editPostHeading').val() == 'A Whole New Post'){
          $.jconfirm({//ask for confirmation
          title: 'You didn\'t change anything.',
          message: 'The post template will be deleted from the database.',
          confirm: 'Ok, fine',
          cancel: 'Go back'
        }, function() {//discard changes
          $('.deleteButton').trigger('click');
          $('.jconfirm_success').trigger('click');
        });
        } else {
          $('.postEditArea').slideUp(function(){
            $('.postEditArea').remove();
            $('.editPostButton').slideDown(200);
          });
        }
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
    $(self).on('click', '.originalButton',function(event){
    
      var self = this;
      
      $.getJSON(settings.server, {post: $(self).parents('.detailedPost').data('id')}, function(data){
      
        $(self).parents('.detailedPost').children('h2').text(data.title);
        $(self).parents('.detailedPost').children('.postBody').html(data.body);
        
        $('.reloadButton').remove();
        $('.previewButton').show();
        $(self).remove();
        
      });
    
    });
    
    //Passes information to the server, which saves it to the database and returns the updated post
    $(self).on('click', '.saveButton', function(event){
    
        var self = this;
      
      $.getJSON(settings.server, {
        save: $(this).parent().parent().data('id'),
        title: $('.editPostHeading').val(),
        body: $('.editPostBody').val()
      }, function(data){
        
        $(self).parent().siblings('.postHeading').text(data.title);
        $(self).parent().siblings('.postBody').html(data.body);
        
        $('.post[data-id=' + data.id + ']').before('<div class="placeholder"></div>').remove();
        $('.placeholder').after(formatPost(data)).remove();
        $('.post[data-id=' + data.id + ']').hide();
        
        $('.postEditArea').slideUp(function(){
          $(this).remove();
          $('.editPostButton').slideDown(200);
        });
        
      });
    
    });
    
    //Shows a verification and sends a request to the server if confirmed
    $(self).on('click', '.deleteButton', function(event){
    
      $.jconfirm({//ask for confirmation
        title: 'Do you really want to delete this post?',
        message: 'It will go away forever (a long time).',
        confirm: 'Yes',
        cancel: 'I changed my mind'
      }, function() {//delete the post nd remove it from the currently open site
        var postID = $('.detailedPost').data('id');
        $.getJSON(settings.server, {delete: postID}, function(data){
        
          $('.post[data-id=' + data.id + ']').remove();
          $('.detailedPost[data-id=' + data.id + ']').slideUp(500, function(){
            $('.detailedPost[data-id=' + data.id + ']').children('.postHeading').trigger('click');
          });
        
        });
      });
    
    });
    
    //Sends a request to create a new post to the server
    $(self).on('click', '.newPostButton', function(event){
    
      var self = this;
      
      $.getJSON(settings.server, {new: true}, function(data){
        $.getJSON(settings.server, {post: data.id}, function(data){
          $('#headerWrapper').after(formatPost(data));
          $('div[data-id="' + data.id + '"]').children('.postHeading').trigger('click');
        });
      });     
    
    });
    
    //Reloads the page
    $(self).on('click', '#header h1', function(event){
    
      window.location.reload();
    
    });
    
    //Show login prompt
    $(self).on('click', '.loginButton', function(event){
    
      var loginPrompt = '<div id="loginPromptBackground">';
      loginPrompt += '<div id="loginPrompt">';
      loginPrompt += '<h1>Please enter your credentials:</h1>';
      loginPrompt += '<input type="text" id="username" value="admin"><br>';
      loginPrompt += '<input type="password" id="password" value="1123581321"><br>';      
      loginPrompt += '<div class="button loginSubmitButton">Submit</div>';      
      loginPrompt += '<div class="button loginCancelButton">Cancel</div>';
      loginPrompt += '</div></div>';
      
      $(self).append(loginPrompt);
    
    });
    
    //Send a request to revoke login credentials
    $(self).on('click', '.logoutButton', function(event){
    
      $.getJSON(settings.server, {logout: 1}, function(data){
        window.location.reload();
      });
    
    });
    
    //Send and verify credentials
    $(self).on('click', '.loginSubmitButton', function(){
    
      var username = $('#username').val().trim();
      var password = $('#password').val().trim();
      
      $.getJSON(settings.server, {login: username, password: password}, function(data){
        if(data.success == true){
          
          var buttons = '<div class="button logoutButton">Logout</div>';
          buttons += '<div class="button newPostButton">Create New Post</div>';
        
          $('.loginButton').before(buttons).remove();
          $('#loginPromptBackground').remove();
          
          $('.detailedPost').children('.postBody').after('<div class="button editPostButton">Edit Post</div>');
          
        } else {
          alert('Incorrect credentials');
        }
      });
    
    });
    
    //Closes the login prompt
    $(self).on('click', '.loginCancelButton', function(){
    
      $('#loginPromptBackground').remove();
    
    });

    //Loads the first 5 posts
    $.getJSON(settings.server, function(data) {

      $(self).empty();
      
      var postsData = data;
      
      var header = '<div id="headerWrapper"><div id="header">';
      header += '<h1>The Lorem Ipsum</h1>';     
      
      $.getJSON(settings.server, {loggedin:1}, function(data){
        
        if(data.loggedIn == true){
          header += '<div class="button logoutButton">Logout</div>';
          header += '<div class="button newPostButton">Create New Post</div>';          
        } else {
          header += '<div class="button loginButton">Login</div>';
        }
        
        header += '</div></div>';

        $(self).append(header);

        $.each(postsData.posts, function(key, val) {
          $(self).append(formatPost(val)); 

        });

        if(postsData.morePosts == "1"){
          $(self).append('<div id="morePostsButton" class="button">Show More Posts</div>');
        }
        
      });
      
      

    });
    
    //Returns a post in proper HTML with \r\n\r\n replaced with paragraph tags
    var formatPost = function(d) {

      var s = '';
      
      var body = d.body;
      
      if(body.length > 400){
        body = body.substring(0, body.indexOf('</p>'));
      }

      s = '<div class="post" data-id="' + d.id + '"><h2 class="postHeading">' + d.title + '</h2>';
      s += '<p class="date">' + d.date + '</p><div class="postBody">';
      s += body;
      s += '</div></div>'

      return s;
      
    };
    
    //Loads, formats and appends the whole post identified by postId
    var showPostDetails = function(postId){
      
      $.getJSON(settings.server, {post: postId}, function(data){ 
      
        $('div .post').hide();
        $('#morePostsButton').hide();
        
        body = data.body;
        
        s = '<div class="detailedPost" data-id="' + data.id + '"><h2 class="postHeading">' + data.title + '</h2>';
        s += '<p class="date">' + data.date + '</p><div class="postBody">';
        s += body;
        
        $.getJSON(settings.server, {loggedin: 1}, function(data){
        
          if(data.loggedIn == true){
            s += '</div><div class="button editPostButton">Edit Post</div>';
          }
          
          s += '</div>';
        
          $(self).prepend(s);
          if(data.title == 'A Whole New Post'){
            $('.editPostButton').trigger('click');
          }
        
        });
        
      
      });     
      
    }   

    return this;

  };
  
}(jQuery));

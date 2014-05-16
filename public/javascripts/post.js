var Post = Backbone.Model.extend({
    urlRoot: "/posts",
    defaults: {
      'title' : '',
      'content' : ''
    }
});

var PostCollection = Backbone.Collection.extend({
    model: Post,
    url: "/posts",
    comparator: function(Post) {
    return -Post.get("id"); 
    }
});

var PostListView = Backbone.View.extend({

    tagName: 'div',
    className: 'col-sm-10 col-sm-offset-1',
    initialize: function() {
        this.collection.bind('all', this.render, this);
        this.collection.sort();
        this.render();
    },

    template: Handlebars.compile(($("#posts-tmpl").html())),
    events: {
        'click .edit'   : 'editPost',
        'click .delete' : 'deletePost',
        'click #addPost' : 'addPost'
    },

    deletePost: function(e) {
        e.preventDefault();
        var postID = e.target.parentNode.parentNode.dataset.id;
        var model = this.collection.get(postID);
        console.log(model);
        model.destroy();
    },

    addPost: function(e) {
      e.preventDefault();
      app.navigate("/posts/new", true);
    },

    sortera: function() {
      this.collection.sort();
    },

    editPost: function(e) {
      e.preventDefault();
      var postID = e.target.parentNode.parentNode.dataset.id;
      console.log(postID);
      app.navigate("/posts/" + postID + "/edit", true);
    },

    render: function() {
        html = this.template({
            items: this.collection.toJSON()
        });

        this.$el.html(html);

        return this;
    }
});


var PostSingleView = Backbone.View.extend({
    tagName: 'div',
    className: 'col-sm-10 col-sm-offset-1 singel-post',

    initialize: function() {
        this.render();  
    },

    events: {'click #goBack' : 'backToBlog'},

    template: Handlebars.compile(($("#post-tmpl").html())),

    backToBlog: function(e) {
      e.preventDefault();
      app.navigate("/posts", true);
    },

    render: function() {
        html = this.template(this.model.toJSON());
        this.$el.html(html);
        return this;
    }
});


var AddPostView = Backbone.View.extend({
    tagName: 'div',
    className: 'col-sm-10 col-sm-offset-1 singel-post',

    initialize: function() {
      this.collection.bind('add', this.sortera, this);
      this.render();
    },
    template: Handlebars.compile($("#add-post-tmpl").html()),
    events: {
        'submit form' : 'addNewPost',
        'click #goBack' : 'backToBlog'
    },

    sortera: function() {
      this.collection.sort();
    },

    addNewPost: function(e) {
        e.preventDefault();
        var wrapEl = this.$el;
        this.collection.create({
            title: e.target.elements[0].value,
            content: e.target.elements[1].value
        },{
          success: function() {
              wrapEl.find('.status').html('<p>New Post Added!</p>');
              } 
          });
    },

    backToBlog: function(e) {
        e.preventDefault();
        app.navigate("/posts", true);
    },

    render: function() {
        this.$el.html(this.template);
        return this;    
    }
});

var EditPostView = Backbone.View.extend({
    tagName: 'div',
    className: 'col-sm-10 col-sm-offset-1 post-single',

    initialize: function() {
      this.render();
    },

    template: Handlebars.compile( ( $("#add-post-tmpl").html() ) ),

    events: {
        'submit form': 'update',
        'click #goBack' : 'backToBlog'
    },

    update: function(e) {
        e.preventDefault();
        var wrapEl = this.$el;
        this.model.set({
            title: e.target.elements[0].value,
            content: e.target.elements[1].value
        });
        this.model.save();
        wrapEl.find('.status').html('<p>Post updated!</p>'); 
        
    },

    backToBlog: function(e) {
      e.preventDefault();
      app.navigate("/posts", true);
    },

    render: function() {
        html = this.template(this.model.toJSON());
        this.$el.html(html);

        return this;
    }

});


Backbone.View.prototype.close = function(){
  this.remove();
  this.unbind();
  if (this.onClose){
   this.onClose();
  }
}


 var AppRoutes = Backbone.Router.extend({
    routes: {
        "posts" : "index",
        "posts/new" : "addPost",
        "posts/:id" : "postSingle",
        "posts/:id/edit" : "editPost"
    },

    showView: function (view) {
      
        if (this.currentView) this.currentView.close();
        $('.row').html(view.$el);
        this.currentView = view;
        return view;
    },

    index: function() {
      this.before();
      this.showView( new PostListView({collection: app.postList}) );
    },

    postSingle: function(id) {

      var singlePost = new Post({id:id});
      var self = this;
      singlePost.fetch({
        success: function() {
            self.showView( new PostSingleView({model: singlePost}) );
          }
        });
    },

    addPost: function(id) {
        this.before();
        this.showView( new AddPostView({collection: app.postList}) );
    },

    editPost: function(id) {
      this.before();
      var singlePost = this.postList.get(id);
      this.showView( new EditPostView({model: singlePost}) );
    },

    //Ser till att det alltid finns en aktiv collection att posta/hämta ifrån
    before: function() {
      if (!this.postList) {
        this.postList = new PostCollection();
        this.postList.fetch({success:function () {
        }});
      }
    }

});



var app = new AppRoutes;

Backbone.history.start();


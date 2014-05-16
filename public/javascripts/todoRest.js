var Todo = Backbone.Model.extend({
    defaults: {
        done: false
    }
});

var TodoCollection = Backbone.Collection.extend({
    model: Todo,
  localStorage: new Backbone.LocalStorage("TodoList"),
});

var TodoListView = Backbone.View.extend({
    initialize: function() {
        this.collection.bind("add remove change", _.bind(this.render, this))
    },
    template: Handlebars.compile(($("#todo-tpl").html())),
    events: {
        'submit form' : 'addTodo',
        'click #list input' : 'check',
        'click #clear' : 'clear'
    },
    clear: function(e) {
        e.preventDefault();
        var models = this.collection.where({done: true})
        _.each(models, function(model) {
            model.destroy();
        });
    },
    check: function(e) {
        var model = this.collection.get(e.target.dataset.id);
        model.set("done", e.target.checked);
        model.save();
    },
    addTodo: function(e) {
        e.preventDefault();
        this.collection.create({
            value: e.target.elements[0].value
        });
        e.target.reset();
    },
    render: function() {
        var single = "is 1 thing",
            plural = "are x things";
        html = this.template({
            items: this.collection.toJSON()
        });
        var doneItems = this.collection.where({done: false});
        var count = doneItems.length == 1 ? single : plural.replace("x", doneItems.length);
        this.$el.find("#count").html(count);
        this.$el.find("#list").html(html);

        return this;
    }
});

var todos = new TodoCollection();
todos.fetch();
var todoList = new TodoListView({
  el: "#todo",
  collection: todos
}).render();

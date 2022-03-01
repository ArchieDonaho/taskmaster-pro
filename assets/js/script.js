var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//clicking on a <p> element within a ".list-group" parent...
$(".list-group").on("click", "p", function() {
  //grab the current text, trim it, and save it to "text"
  var text = $(this)
    .text()
    .trim();

  //create a <textarea> element with cloass ".form-control" and a value of "text"
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);

  //replace theselected <p> element with the newly created <textarea>
  $(this).replaceWith(textInput);

  //add focus to the textbox automatically, allowing the user to immediately start typing without having to clock the box
  textInput.trigger("focus");
});

//edit the task description
  //the "blur" event triggers when anything other than the textarea element with a parent w/ class ".list-group" is interacted with
$(".list-group").on("blur", "textarea", function(){
  //grab the value within "textarea", trim it, and save to "text"
  var text = $(this)
    .val()
    .trim();

  //get the closest element with class ".list-group", grab it's id (list-toDo), then replace "list-" with "" (nothing)
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get the closest element with class ".list-group-item", then retrieve it's position relative to it's sibling elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //then combine the variables together to save it to the tasks object array
  tasks[status][index].text = text;
  saveTasks();

  //generate a <p> element with class "m-1" containing text of "text"
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  //lastly, replace the selected element with the taskP
  $(this).replaceWith(taskP);  
});

// when the date is clicked on...
$(".list-group").on("click", 'span', function(){
  //get the current text and trim it
  var date = $(this)
    .text()
    .trim();

  //create new input element
  var dateInput = $("<input>")
    .attr('type', 'text')
    .addClass('form-control')
    .val(date);

  //switch the focused element with the new element
  $(this).replaceWith(dateInput);

  //automatically focus on the new input element
  dateInput.trigger('focus');
})

//when the date is done being edited...
$('.list-group').on("blur", "input[type='text']", function(){
  //get the current text
  var date = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  var status = $(this)
    .closest('.list-group')
    .attr('id')
    .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
      .closest('.list-group-item')
      .index();

  //update the task in array and resave to localstorage
  tasks[status][index].date = date;
  saveTasks();

  //recreate the span element with bootstrap clases
  var taskSpan = $("<span>")
    .addClass('badge badge-primary badge-pill')
    .text(date);

  //replace the input element with the span element
  $(this).replaceWith(taskSpan);
})


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();



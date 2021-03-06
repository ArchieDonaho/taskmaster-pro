var tasks = {};

//check the due date and apply the proper background
var auditTask = function(taskEl){
  //get the "span" element nested in the list element
  var date = $(taskEl)
    .find("span")
    .text()
    .trim();

  //create a new moment object using the user's "local" time, and setting the hour to 17:00
  var time = moment(date, "L")
    .set("hour", 17);

  //remove any classes from the list element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //apply new classes if task is near/over due date
  //.isAfter() is a moment.js method to check if a time is after another
  if(moment().isAfter(time)){
    $(taskEl).addClass("list-group-item-danger")
  } else if(Math.abs(moment().diff(time, 'days')) <= 2){
    $(taskEl).addClass("list-group-item-warning");
  }
}

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

  //check due date
  auditTask(taskLi);

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

//edit the description
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

  //enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    //when the calander is closed, run the function
   onClose: function(){
    //force a "change" event on the 'dateInput'
    $(this).trigger("change");
  }
  });

  //automatically focus on the new input element
  dateInput.trigger('focus');
  
  
})

//when the date notices a change...
$('.list-group').on("change", "input[type='text']", function(){
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

  //pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
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
$("#task-form-modal .btn-save").click(function() {
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


//elements with class "card" allow elements with class "list-group" to be sortable within them
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  //doesnt scroll within the container
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  //starts when dragging starts
  activate: function(event){
    $(this).addClass("dropover");
    $("#trash .bottom-trash").addClass("bottom-trash-drag");
  },
  //starts when dragging stops
  deactivate: function(event){
    $(this).removeClass("dropover");
    $("#trash .bottom-trash").removeClass("bottom-trash-drag");
  },
  //starts when item enters a connected list
  over: function(event){
    $(this).addClass("dropover-active");
  },
  //starts when item exits a connected list
  out: function(event){
    $(this).removeClass("dropover-active");
  },
  // activates when the contents of a list have changed (reordered, removed, or added)
  update: function(event){
    //array to store the task data
    var tempArr = [];
    //loop over current set of children in sortable list
    $(this).children().each(function(){
      // find the "p" element & grab it's text content
      var text = $(this)
        .find("p")
        .text()
        .trim();
      // find the "span" element & grab it's text content
      var date = $(this)
        .find("span")
        .text()
        .trim();

      //add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    //trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");
    //update the array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

//add a droppable capability to the trash
$("#trash").droppable({
  //only accept cards with list-group-item
  accept: ".card .list-group-item",
  //draggable overlaps the droppable entirely
  tolerance: 'touch',
  //triggers when accepted draggable is dropped on the droppable- function(event, (draggable, helper, position, offset))
  //ui contains a property called "draggable" that contains the dragged element. we can then use this to delete the object
  drop: function(event, ui){
    ui.draggable.remove();
  },
  //triggers when accepted draggable is dragged over the droppable- function(event, (draggable, helper, position, offset))
  over: function(event, ui){
    console.log("over");
    $("#trash .bottom-trash").addClass("bottom-trash-active");
  },
  //triggers when accepted draggable is dragged out of the droppable- function(event, (draggable, helper, position, offset))
  out: function(event, ui){
    console.log('out');
    $("#trash .bottom-trash").removeClass("bottom-trash-active");
  }
});

//select the date textbox in the popup and add the datepicker method to it
$("#modalDueDate").datepicker({
  //sets a minimum date "1" day after the current date
  // minDate: 1
});

setInterval(function() {
  $(".card .list-group-item").each(function(idex, el){
    auditTask(el);
    console.log("hello");
  })
}, (1000 * 60) * 30);
//allows us to use "30" as minutes to make it easier to read
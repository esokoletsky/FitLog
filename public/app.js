 function getRoutines(callbackFn) {
    $.getJSON("/exercises", (data) => {
        callbackFn(data);
    });
}

function displayRoutine(data) {
    console.log(data);
   let routines =  data.exercises.map(routine =>  {
          return `<p>${routine.day}</p>`;
    });
    $("body").html(routines);          
}

function run() {
    getRoutines(displayRoutine);
}

$( "#js-start" ).submit(function(event) {
    event.preventDefault();
    run();
  });    

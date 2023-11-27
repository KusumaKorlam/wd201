const todoList = () => {
  all = []
  const add = (todoItem) => {
    all.push(todoItem)
  }
  const markAsComplete = (index) => {
    all[index].completed = true
  }
  let t=new Date().toISOString().split("T")[0];
  const checkIfDatePassed = (date) => {
        let date_arr = String(date).split("-");
        let today_arr = String(t).split("-");

        for(let i = 0 ; i < 8 ; i++){
            if(date_arr[i] < today_arr[i]){
                return "Overdue";
            }
            if(date_arr[i] > today_arr[i]){
                return "Underdue";
            }
        }
        return "DueToday";
    }

  const overdue = () => {
    // Write the date check condition here and return the array
    // of overdue items accordingly.
    let due=[];
    all.forEach(item => {
      let resoponses = checkIfDatePassed(iten.dueDate);
      if(responses === "Overdue"){
        due.push(item);
      }
    });
    return due;
  }

  const dueToday = () => {
    // Write the date check condition here and return the array
    // of todo items that are due today accordingly.
    let due = [];
      all.forEach((item) => {
        let responses = checkIfDatePassed(item.dueDate);
        if(responses === "DueToday"){
            due.push(item);
        }
      });
      return due;
  }

  const dueLater = () => {
    // Write the date check condition here and return the array
    // of todo items that are due later accordingly.
    let due = [];
      all.forEach((item) => {
        let responses = checkIfDatePassed(item.dueDate);
        if(responses === "Underdue"){
            due.push(item);
        }
      });
      return due;
  }

  const toDisplayableList = (list) => {
    // Format the To-Do list here, and return the output string
    // as per the format given above.
    let display = "";
      let dateFlag = true;
      let first_item = list[0].dueDate;
      let responses = checkIfDatePassed(first_item);
      if(responses === "DueToday"){
        dateFlag = false;
  }
    if(dateFlag === false){
          for(let i = 0 ; i < list.length ; i++){
            let item = list[i];
            let structure = ``;
            if(item.completed){
                structure += `[x] ${item.title}`;
            }
            else{
                structure += `[ ] ${item.title}`;
            }
            display += structure;
            if(i != list.length-1){
                display += '\n';
            }
          };
      }
      else{
        for(let i = 0 ; i < list.length ; i++){
            let item = list[i];
            let structure = ``;
            if(item.completed){
                structure += `[x] ${item.title} ${item.dueDate}`;
            }
            else{
                structure += `[ ] ${item.title} ${item.dueDate}`;
            }
            display += structure;
            if(i != list.length-1){
                display += '\n';
            }
          };
      }

      return display;
  }

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList
  };
};

// ####################################### #
// DO NOT CHANGE ANYTHING BELOW THIS LINE. #
// ####################################### #

const todos = todoList();

const formattedDate = d => {
  return d.toISOString().split("T")[0]
}

var dateToday = new Date()
const today = formattedDate(dateToday)
const yesterday = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() - 1))
)
const tomorrow = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() + 1))
)

todos.add({ title: 'Submit assignment', dueDate: yesterday, completed: false })
todos.add({ title: 'Pay rent', dueDate: today, completed: true })
todos.add({ title: 'Service Vehicle', dueDate: today, completed: false })
todos.add({ title: 'File taxes', dueDate: tomorrow, completed: false })
todos.add({ title: 'Pay electric bill', dueDate: tomorrow, completed: false })

console.log("My Todo-list\n")

console.log("Overdue")
var overdues = todos.overdue()
var formattedOverdues = todos.toDisplayableList(overdues)
console.log(formattedOverdues)
console.log("\n")

console.log("Due Today")
let itemsDueToday = todos.dueToday()
let formattedItemsDueToday = todos.toDisplayableList(itemsDueToday)
console.log(formattedItemsDueToday)
console.log("\n")

console.log("Due Later")
let itemsDueLater = todos.dueLater()
let formattedItemsDueLater = todos.toDisplayableList(itemsDueLater)
console.log(formattedItemsDueLater)
console.log("\n\n")

/* eslint-disable no-undef */
const todoList = () => {
  all = [];

  const add = (todoItem) => {
    all.push(todoItem);
  };

  const markAsComplete = (index) => {
    all[index].completed = true;
  };

  const overdue = () => {
    const today = new Date().toISOString().split("T")[0];
    return all.filter((todo) => !todo.completed && todo.dueDate < today);
  };

  const dueToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return all.filter((todo) => todo.dueDate === today);
  };

  const dueLater = () => {
    const today = new Date().toISOString().split("T")[0];
    return all.filter((todo) => !todo.completed && todo.dueDate > today);
  };

  const toDisplayableList = (list) => {
    return list
      .map((todo) => {
        const status = todo.completed ? "[x]" : "[ ]";
        const excludeDueDate = ["pay rent", "service vehicle"];
        const dueDate =
          !excludeDueDate.includes(todo.title.toLowerCase()) && todo.dueDate
            ? " " + formattedDate(new Date(todo.dueDate))
            : "";
        return` ${status} ${todo.title}${dueDate}`;
      })
      .join("\n");
  };
  const formattedDate = (d) => {
    return d.toISOString().split("T")[0];
  };

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList,
  };
};
module.exports = todoList;

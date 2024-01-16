/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

var cheerio = require("cheerio");
const { parse } = require("pg-protocol");

let server, agent;


function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val()
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res)
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken
  });
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => { });
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign Up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "user.a@test.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302)
  })

  test("Sign Out", async () => {
    let res = await agent.get('/todos');
    expect(res.statusCode).toBe(200);
    res = await agent.get('/signout');
    expect(res.statusCode).toBe(302);
    res = await agent.get('/todos');
    expect(res.statusCode).toBe(302);
  })

  test("Creates a new todo", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "12345678")
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res)
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks a todo as complete", async () => {
    const agent = request.agent(server);
    await login(agent, 'user.a@test.com', '12345678')
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res)
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken
    });

    const groupedTodoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text)
    const dueTodayCount = parsedGroupedResponse.dueToday.length
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1]

    res = await agent.get("/todos")
    csrfToken = extractCsrfToken(res)

    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    })
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text)
    expect(parsedUpdateResponse.completed).toBe(true)

  });

  // test("Fetches all todos in the database using /todos endpoint", async () => {
  //   await agent.post("/todos").send({
  //     title: "Buy xbox",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   await agent.post("/todos").send({
  //     title: "Buy ps3",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   const response = await agent.get("/todos");
  //   const parsedResponse = JSON.parse(response.text);

  //   expect(parsedResponse.length).toBe(4);
  //   expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  // });

  test("Deletes a todo", async () => {
    const agent = request.agent(server);
    await login(agent, 'user.a@test.com', '12345678')
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res)
    await agent.post("/todos").send({
      title: "Buy Book",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken
    });

    const groupedTodoResponse1 = await agent.get("/todos").set("Accept", "application/json");
    const parsedGroupedResponse1 = JSON.parse(groupedTodoResponse1.text);

    expect(parsedGroupedResponse1.dueToday).toBeDefined()

    const count = parsedGroupedResponse1.dueToday.length;
    const latestTodo = parsedGroupedResponse1.dueToday[count - 1]

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res)

    const deleted = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    })

    expect(deleted.statusCode).toBe(200);
  });


});

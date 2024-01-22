require("dotenv").config();
const request = require("supertest");
const app = require("./auth");

describe("Login Controller Test", () => {
  test("должен возвращать статус код 200, токен и объект пользователя с полями email и subscription", async (done) => {
    try {
      const response = await request(app.login)
        .post("/login")  //!или /api/users/login? но не помогло
        .send({ email: "lera123@example.com", password: "lera123" });
      expect(response.status).toBe(200);

      // Проверка наличия токена и объекта пользователя в ответе
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");

      // Проверка типов данных в объекте пользователя
      const { user } = response.body;
      expect(typeof user.email).toBe("string");
      expect(typeof user.subscription).toBe("string");

      done(); // В тестах Jest для обозначения завершения асинхронного теста
    } catch (error) {
      done(error);
    }
  });

  test("должен возвращать статус код 400 для некорректных данных", async (done) => {
    try {
      const response = await request(app.login)
        .post("/login")
        .send({ email: "inval555!!!idemail", password: "1234" });

      expect(response.status).toBe(400);
      done();
    } catch (error) {
      done(error);
    }
  });

  test("должен возвращать статус код 401 для несуществующего пользователя", async (done) => {
    try {
      const response = await request(app.login).post("/login").send({
        email: "nonexistent@example.com",
        password: "nonexistentpassword",
      });

      expect(response.status).toBe(401);
      done();
    } catch (error) {
      done(error);
    }
  });

  test("должен возвращать статус код 401 для неверного пароля", async (done) => {
    try {
      const response = await request(app.login)
        .post("/login")
        .send({ email: "lera123@example.com", password: "incorrectpassword" });

      expect(response.status).toBe(401);
      done();
    } catch (error) {
      done(error);
    }
  });
});

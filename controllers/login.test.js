const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const { User } = require("../models/user");
require("dotenv").config();

// Получение параметров для подключения к базе данных и настройки тестового сервера
const { DB_HOST } = process.env;

// Тестовые данные для регистрации нового пользователя
const newUser = {
  email: "lera12345@example.com",
  password: "1234567",
  subscription: "starter",
};

// Тестовые данные для успешного логина
const validUser = {
  email: "lera12345@example.com",
  password: "1234567",
};

// Тестовые данные для неудачного логина
const invalidUser = {
  email: "invalidemail@gmail.com",
  password: "123456",
};

// Описание тестов
describe("Test login controller", () => {
  let server;
  let response;
  let responseError;

  // Шаг 1: Подготовка сервера и данных перед тестами
  beforeAll(async () => {
    try {
      // Запуск тестового сервера
      server = app.listen();
      // Подключение к базе данных
      await mongoose.connect(DB_HOST);
      // Регистрация тестового пользователя
      await request(app).post("/api/users/register").send(newUser);
      // Выполнение успешного логина
      response = await request(app).post("/api/users/login").send(validUser);
      // Выполнение неудачного логина
      responseError = await request(app)
        .post("/api/users/login")
        .send(invalidUser);
    } catch (error) {
      console.error(
        "Error setting up server and data for tests:",
        error.message
      );
    }
  });

  // Шаг 2: Очистка данных после выполнения всех тестов
  afterAll(async () => {
    try {
      // Удаление всех пользователей с заданым email из базы данных
      await User.deleteMany({ email: "lera12345@example.com" });
      // Закрытие тестового сервера
      await server.close();
      // Отключение от базы данных
      await mongoose.connection.close();
    } catch (error) {
      console.error(
        "Error cleaning up data and closing server:",
        error.message
      );
    }
  });

  // Тест 1: Проверка успешного логина - статус код 200
  test("should return status code 200 for successful login", () => {
    expect(response.statusCode).toBe(200);
  });

  // Тест 2: Проверка наличия свойства "token" в ответе
  test("response body should have property 'token'", () => {
    expect(response.body).toHaveProperty("token");
  });

  // Тест 3: Проверка наличия свойства "user" в ответе
  test("response body should have property 'user'", () => {
    expect(response.body).toHaveProperty("user");
  });

  // Тест 4: Проверка типа свойства "user" (должно быть объектом)
  test("response body property 'user' should be of type 'object'", () => {
    expect(typeof response.body.user).toBe("object");
  });

  // Тест 5: Проверка наличия свойства "email" в объекте "user"
  test("object 'user' should have property 'email'", () => {
    expect(response.body.user).toHaveProperty("email");
  });

  // Тест 6: Проверка типа свойства "email" (должно быть строкой)
  test("property 'email' in 'user' should be of type 'string'", () => {
    expect(typeof response.body.user.email).toBe("string");
  });

  // Тест 7: Проверка наличия свойства "subscription" в объекте "user"
  test("object 'user' should have property 'subscription'", () => {
    expect(response.body.user).toHaveProperty("subscription");
  });

  // Тест 8: Проверка типа свойства "subscription" (должно быть строкой)
  test("property 'subscription' in 'user' should be of type 'string'", () => {
    expect(typeof response.body.user.subscription).toBe("string");
  });

  // Тест 9: Проверка неудачного логина - статус код 401
  test("should return status code 401 for unsuccessful login", async () => {
    expect(responseError.statusCode).toBe(401);
  });

  // Тест 10: Проверка сообщения об ошибке при неудачном логине
  test("response body should have property 'message' with text 'Email or password is wrong'", async () => {
    expect(responseError.body.message).toBe("Email or password is wrong");
  });
});

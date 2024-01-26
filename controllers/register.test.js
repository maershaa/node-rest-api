const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const { User } = require("../models/user");
require("dotenv").config();

// !не совсем понимаю для чгео оно
mongoose.set("strict", false);

// Получение значения DB_HOST из переменных окружения
const { DB_HOST } = process.env;

// Описание тестового набора
describe("Test register controller", () => {
  // Хук beforeAll запускается перед запуском всех тестов в данном тестовом наборе
  beforeAll(async () => {
    try {
      // Подключение к MongoDB
      await mongoose.connect(DB_HOST);

      // Удаление всех пользователей с указанными адресами электронной почты перед тестами
      await User.deleteMany({ email: { $in: ["testUser1@gmail.com", "testUser2@gmail.com"] } });

    } catch (error) {
      // Вывод ошибки в консоль, если подключение не удалось
      console.log(error.message);
    }
  });

  // Хук afterAll запускается после выполнения всех тестов в данном тестовом наборе
  afterAll(async () => {
    try {
      // Удаление всех пользователей с указанными адресами электронной почты после тестов
      await User.deleteMany({ email: { $in: ["testUser1@gmail.com", "testUser2@gmail.com"] } });

      // Отключение от MongoDB
      await mongoose.disconnect(DB_HOST);

    } catch (error) {
      // Вывод ошибки в консоль, если отключение не удалось
      console.log(error.message);
    }
  });

  // Тест: должен зарегистрировать нового пользователя
  it("should register new user", async () => {
    // Отправка POST-запроса для регистрации пользователя
    const response = await supertest(app).post("/api/users/register").send({
      email: "testUser1@gmail.com",
      password: "123456",
    });

    // Вывод в консоль статуса ответа и тела ответа для отладки
    console.log("Response status:", response.status);
    console.log("Response body:", response.body);
    console.log("Response body.user.email:", response.body.user.email);

    // Проверка ожидаемого статуса ответа и адреса электронной почты пользователя
    expect(response.statusCode).toBe(201);
    expect(response.body.user.email).toBe("testUser1@gmail.com");
  });

  // Тест: не должен регистрировать одного и того же пользователя дважды
  it("should not register the same user 2 times", async () => {
    // Регистрация первого пользователя
    await supertest(app).post("/api/users/register").send({
      email: "testUser2@gmail.com",
      password: "123456",
    });

    // Повторная попытка регистрации того же пользователя
    const response = await supertest(app).post("/api/users/register").send({
      email: "testUser2@gmail.com",
      password: "123456",
    });

    // Проверка ожидаемого статуса ответа (конфликт, так как пользователь уже существует)
    expect(response.statusCode).toBe(409);
  });
});

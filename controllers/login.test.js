require("dotenv").config();
const request = require("supertest");
const app = require("../routes/api/index");
const mongoose = require('mongoose');
const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const { DB_HOST } = process.env;

describe("Login Controller Test", () => {
  beforeAll(async () => {
    try {
      // подключение к тестовой базе данных
      await mongoose.connect(DB_HOST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection error:', error.message);
    }
  });

  beforeEach(async () => {
    // создаем тестового пользователя перед каждым тестом

    // Удаляем нашего тестового пользователя
    await User.deleteOne({ email: 'lera12345@example.com' });

    // Здесь создаем тестового пользователя после очистки коллекции
    const hashedPassword = await bcrypt.hash('password12345', 10);

    await User.create({
      email: 'lera12345@example.com',
      password: hashedPassword,
      avatarURL: "avatars/IMG_2149-5a0537f4-52d8-4938-9d3c-1f497db57dbe.jpg"
    });
  });

  afterAll(async () => {
    // Удаляем нашего тестового пользователя
    await User.deleteOne({ email: 'lera12345@example.com' });

    // Отключаемся от тестовой базы данных
    await mongoose.disconnect();
  });

  test("должен возвращать статус код 200, токен и объект пользователя с полями email и subscription", async () => {
    try {
      const response = await request(app)
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "lera12345@example.com", password: "lera123" });

      expect(response.status).toBe(200);

      // Проверка наличия токена и объекта пользователя в ответе
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");

      // Проверка типов данных в объекте пользователя
      const { user } = response.body;
      expect(typeof user.email).toBe("string");
      expect(typeof user.subscription).toBe("string");
    } catch (error) {
      throw error;
    }
  });

  test("должен возвращать статус код 400 для некорректных данных", async () => {
    try {
      const response = await request(app)
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "inval555!!!idemail", password: "1234" });

      expect(response.status).toBe(400);
    } catch (error) {
      throw error;
    }
  });

  test("должен возвращать статус код 401 для несуществующего пользователя", async () => {
    try {
      const response = await request(app)
        .post("/api/users/login")
        .send({
          email: "nonexistent@example.com",
          password: "nonexistentpassword",
        });

      expect(response.status).toBe(401);
    } catch (error) {
      throw error;
    }
  });

  test("должен возвращать статус код 401 для неверного пароля", async () => {
    try {
      const response = await request(app)
        .post("/api/users/login")
        .set("Content-Type", "application/json")
        .send({ email: "lera12345@example.com", password: "incorrectpassword" });

      expect(response.status).toBe(401);
    } catch (error) {
      throw error;
    }
  });
});

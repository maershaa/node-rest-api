const { Schema, model } = require("mongoose");
const Joi = require("joi"); //библиотека для проверки и валидации входных данных (например при добоавлении нового контакта чтобы был номер и имя, а не только имя)
const { handleMongooseError } = require("../helpers");

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const subscriptionRegex = ["starter", "pro", "business"];
const userSchema = new Schema(
  {
    //Схема = требования к проекту
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: emailRegex,
      unique: true, // создает уникальный индекс в MongoDB для поля email в коллекции пользователей + к этому еще нужно в настройках коллекци в mongoDB зайти на вкладку Indexes и увидеть там что в список было добавлено нужное нам уникальное свойство. если оно не добавилось - добавить его там вручную через кнопку create index
    },
    password: {
      type: String,
      minlength: 6,
      required: [true, "Password is required"],
    },
    subscription: {
      type: String,
      enum: subscriptionRegex,
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      required: true,
  },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
  },
  {
    versionKey: false, // исключит автоматическое добавление поля __v
    timestamps: true, // добавляет createdAt (время создания) и updatedAt (время последнего обновления) эллемента коллекции
  }
);

userSchema.post("save", handleMongooseError);

const registerSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
  subscription: Joi.string()
    .valid(...subscriptionRegex)
    .default("starter"), //(распыление) используется для передачи элементов массива subscriptionRegex в качестве отдельных аргументов методу .valid()
});

const emailSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

const User = model("user", userSchema); // модель

const schemas = {
  registerSchema,
  emailSchema,
  loginSchema,
};

module.exports = {
  User,
  schemas,
};

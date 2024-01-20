const { User } = require("../models/user"); // Подключение модели пользователя
const { schemas } = require("../models/user"); // Подключение схемы данных пользователя
const bcrypt = require("bcrypt"); // Подключение библиотеки для хеширования паролей
const { HttpError } = require("../helpers/index"); // Подключение кастомного класса для обработки ошибок
const jwt = require("jsonwebtoken"); // Подключение библиотеки для работы с JSON Web Tokens
require("dotenv").config(); // Загрузка переменных окружения
const fs = require("node:fs/promises"); // Подключение модуля для работы с файловой системой
const gravatar = require("gravatar"); // Подключение библиотеки для работы с Gravatar-изображениями
const path = require("path"); // Подключение модуля path для работы с путями в файловой системе
const Jimp = require("jimp"); // Подключение библиотеки Jimp для обработки изображений


//! Функция для обработки изображения с использованием Jimp
const processAvatar = async (avatarPath, options) => {
  return new Promise((resolve, reject) => {
    Jimp.read(avatarPath, (err, avatar) => {
      if (err) return reject(err);
      const width = 250;
      const height = 250;
      avatar.resize(width, height);
      avatar.circle(); // Делаем изображение круглым
      // Сохранение измененного изображения
      avatar.write(avatarPath, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

const register = async (req, res, next) => {
  try {
    // если данные не соответствуют ожидаемой схеме, будет выброшена ошибка HTTP 400 с соответствующим сообщением
    const { error } = schemas.registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    // Проверка существующего пользователя на то существует ли уже пользователь с таким адресом электронной почты
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user !== null) {
      throw HttpError(409, "Email already in use");
    }

    // Хеширование пароля с использованием bcrypt и добавлением соли (10 = cоль то есть сколько раз будет выполняться процесс хеширования (раунды))
    const hashPassword = await bcrypt.hash(password, 10);

    // Получение URL Gravatar-изображения на основе email пользователя
    const avatarURL = gravatar.url(email);
    // Обработка аватара
    await processAvatar(avatarURL);

    // Создание нового пользователя в базе данных с хешированным паролем и URL Gravatar-изображения
    // Когда чнловек будет регистрирвоаться ему будет предоставляться временная аватарка
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // если данные не соответствуют ожидаемой схеме, будет выброшена ошибка HTTP 400 с соответствующим сообщением
    const { error } = schemas.loginSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    // Извлекаем электронную почту и пароль из запроса
    const { email, password } = req.body;

    // Поиск пользователя в базе данных по электронной почте
    const user = await User.findOne({ email });

    // Проверка наличия пользователя
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    // Сравнение введенного пароля с хешем пароля в базе данных
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    // Создание JWT-токена для аутентификации пользователя
    const { SECRET_KEY } = process.env;
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    /*   console.log("token: ", token);
    const decodeToken = jwt.decode(token);
    console.log("decodeToken: ", decodeToken); */

    // Обновление токена в базе данных
    await User.findByIdAndUpdate(user._id, { token });

    // Возвращение токена в ответе
    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    // Передача ошибки следующему обработчику
    next(error);
  }
};


// Получение информации о текущем пользователе
const getCurrent = async (req, res, next) => {
  try {
    // Извлечение email и name из объекта пользователя в запросе
    const { email, name } = req.user;

    // Отправка JSON-ответа с информацией о текущем пользователе
    res.json({
      name,
      email,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(201).json({
      message: "No Content",
    });
  } catch (error) {
    next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { subscription } = req.body;

    // Проверка, что подписка установлена в одно из допустимых значений
    const validSubscriptions = ["starter", "pro", "business"];
    if (!validSubscriptions.includes(subscription)) {
      throw HttpError(
        400,
        "Invalid subscription value. Subscription must have one of the following values: ['starter', 'pro', 'business']"
      );
    }

    // Обновление подписки пользователя в базе данных
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true }
    );

    if (!updatedUser) {
      throw HttpError(404, "User not found");
    }

    // Отправляем обновленного пользователя в ответ
    res.status(200).json({
      email: updatedUser.email,
      subscription: updatedUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const avatarDir = path.join(__dirname, "../", "public", "avatars"); //путь к папке с аватрками
    // Извлечение идентификатора пользователя из объекта запроса
    const { _id } = req.user;
    // Извлечение информации о загруженном файле из объекта запроса
    const { path: tempUpload, originalname } = req.file;

    // Для избежания перезаписи файлов с одинаковыми именами, мы генерируем уникальное имя файла,
    // добавляя идентификатор пользователя к оригинальному имени файла.
    const filename = `${_id}_${originalname}`;

    // Полный путь к месту, куда будет перемещен загруженный аватар пользователя
    const resultUpload = path.join(avatarDir, filename);

    // Перемещение файла из временной папки в целевую папку (аватар пользователя)
    await fs.rename(tempUpload, resultUpload);

    // Формирование URL для нового аватара пользователя
    const avatarURL = path.join("avatars", filename);

    // Обработка аватара с использованием Jimp
    await processAvatar(resultUpload);
    console.log("processAvatar", processAvatar);

    // Обновление записи пользователя в базе данных с новым URL аватара
    await User.findByIdAndUpdate(_id, { avatarURL });

    // Отправка успешного ответа с URL нового аватара пользователя
    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateSubscription,
  updateAvatar,
};

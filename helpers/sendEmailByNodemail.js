//! Болванка. Не используется в текущем проекте.


/* // Генерация уникального токена для верификации
const verificationToken = crypto.randomUUID();

// Создание нового пользователя в базе данных с хешированным паролем и URL Gravatar-изображения
// Когда человек будет регистрироваться, ему будет предоставлена временная аватарка
const newUser = await User.create({
  ...req.body,
  password: hashPassword, // Хешированный пароль
  avatarURL, // URL Gravatar-изображения
  verificationToken, // Уникальный токен верификации
});

// Подготовка и отправка электронного письма с ссылкой на верификацию
const verifyEmail = {
  to: newUser.email, // Адрес электронной почты нового пользователя
  subject: "Verify email", // Тема письма
  html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verification email</a>`, // HTML-содержимое письма с ссылкой на верификацию
};

// Отправка электронного письма
await sendEmail(verifyEmail); */

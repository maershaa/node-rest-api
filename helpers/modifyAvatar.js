const Jimp = require("jimp"); // Подключение библиотеки Jimp для обработки изображений

//! Функция для обработки изображения с использованием Jimp
const modifyAvatar = async (avatarPath, options) => {
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
  module.exports = modifyAvatar;
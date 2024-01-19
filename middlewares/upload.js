const multer = require("multer");
const path = require("path");

// Определяем временную папку для сохранения загруженных файлов
const tempDir = path.join(__dirname, "../", "tmp");

// Настраиваем объект конфигурации Multer для сохранения файлов в временную папку
const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
}
});

// Создаем Middleware для обработки загрузки файлов с использованием настроенного Multer
const upload = multer({ storage: multerConfig });


  module.exports = upload;
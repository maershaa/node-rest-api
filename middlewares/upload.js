const multer = require("multer"); // Пакет для обработки множественных форм данных (в том числе файлов)
const path = require("node:path"); // Встроенный модуль Node.js для работы с путями к файлам и директориям
const crypto = require("node:crypto"); // Встроенный модуль Node.js для работы с шифрованием

// Определяем временную папку для сохранения загруженных файлов
const tempDir = path.join(__dirname, "../", "tmp");

// Настраиваем объект конфигурации Multer для сохранения файлов во временную папку
const multerConfig = multer.diskStorage({
  // Указываем путь к временной папке, куда будут сохраняться файлы перед обработкой
  destination: tempDir,

  // Генерируем уникальное имя файла, состоящее из оригинального имени, случайного суффикса и расширения
  filename: (req, file, cb) => {
    // Извлекаем расширение файла
    const extname = path.extname(file.originalname); 

    // Извлекаем базовое имя файла (без расширения)
    const basename = path.basename(file.originalname, extname); 

    // Генерируем случайный суффикс с использованием модуля crypto
    const suffix = crypto.randomUUID();

    // Формируем уникальное имя файла
    cb(null, `${basename}-${suffix}${extname}`);
  }
});

// Экспортируем настроенный объект Multer для использования в других частях приложения
const upload = multer({ storage: multerConfig });

module.exports = upload;


  // !Конфигурация Multer с уникальным именем файла для избежания перезаписи
/*   
  const multerConfig = multer.diskStorage({
    destination: tempDir,
       filename: (req, file, cb) => {
      cb(null, file.originalname);
  }
    }
  }); */

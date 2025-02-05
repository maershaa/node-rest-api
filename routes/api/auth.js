const express = require("express");

const router = express.Router(); //Этот объект позволяет группировать обработчики маршрутов, связанные с определенными путями URL то есть создает страничку записной книжки, а не новую книжку

const ctrl = require("../../controllers/auth"); // контроллеры те функции, которые обрабатывают запросы к определенным маршрутам (или эндпоинтам) в API (route handlers)
const { authenticate, upload } = require("../../middlewares");

// можно еще назвать signup
router.post("/register", ctrl.register);

// можно еще назвать signim
router.post("/login", ctrl.login);

router.get("/verify/:verificationToken",  ctrl.verifyEmail); //маршрут для проверки верификации email.

router.post("/verify",  ctrl.resendVerifyEmail); //маршрут если письмо с подтверждением почты не пришло пользователю


router.get("/current", authenticate, ctrl.getCurrent);

router.post("/logout", authenticate, ctrl.logout);

router.patch("/", authenticate, ctrl.updateSubscription);

router.patch("/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar);

module.exports = router;

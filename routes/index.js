const express = require('express');
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// Do work here
router.get('/', catchErrors(storeController.getStores));

router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.post('/stores/:id/edit',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore));
router.get('/stores/:id/delete', catchErrors(storeController.deleteStore));

router.get('/add', authController.isLoggedIn, storeController.addStore);
router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/register', userController.registerForm);
router.post('/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login);

router.get('/login', userController.loginForm);
router.post('/login', userController.validateLogin, authController.login);

router.get('/logout', authController.logout);

module.exports = router;

const mongoose = require('mongoose');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const Store = mongoose.model('Store');
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed" }, false);
    }
  },
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Store',
  });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is a file to resize
  if (!req.file) {
    // skip to next middleware if not
    return next();
  }
  // NOTE: data on req.file - fieldname, originalname, encoding, mimetype, buffer, size
  // get extension from mimetype
  const extension = req.file.mimetype.split('/')[1];
  // prepare filename and make it available on req.body
  req.body.photo = `${uuid.v4()}.${extension}`;
  // read photo into jimp from buffer in memory
  const photo = await jimp.read(req.file.buffer);
  // resize photo
  await photo.resize(800, jimp.AUTO);
  // write resized photo out to uploads photo
  await photo.write(`./public/uploads/${req.body.photo}`);
  // move on to next middleware
  return next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name} ✨. Care to leave a review?`);
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', {
    title: 'Stores',
    stores,
  });
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  if (store) {
    res.render('store', {
      title: store.name,
      store,
    });
  } else {
    next();
  }
};

exports.getStoresByTag = async (req, res) => {
  const { tag } = req.params;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tags', {
    title: 'Tags',
    tags,
    tag,
    stores,
  });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it');
  }
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id }).populate('author');
  confirmOwner(store, req.user);
  res.render('editStore', {
    title: 'Edit Store',
    store,
  });
};

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // returns new value instead of old one
    runValidators: true, // runs any validations (e.g. required) included in schema
  }).exec();
  req.flash('success', `Successfully updated ${store.name} 🙌. <a href="/stores/${store.slug}">View Store ➡</a>`);
  res.redirect(`/stores/${req.params.id}/edit`);
};

exports.deleteStore = async (req, res) => {
  const store = await Store.findOneAndRemove({ _id: req.params.id }).exec();
  req.flash('success', `Successfully removed ${store.name} 🗑`);
  res.redirect('/stores');
};

exports.searchStores = async (req, res) => {
  const stores = await Store.find({
    $text: {
      $search: req.query.q,
      $caseSensitive: false,
    },
  }, { // project: projects (adds) a field on to the query
    score: { $meta: 'textScore' },
  }).sort({
    score: { $meta: 'textScore' },
  }).limit(5); // limit to 5 results
  res.json(stores);
};

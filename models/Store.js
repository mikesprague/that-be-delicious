const mongoose = require('mongoose');
const slug = require('slugs');

mongoose.Promise = global.Promise;

const storeSchema = new mongoose.Schema({
  storeName: {
    type: String,
    trim: true,
    required: 'Please enter a store name',
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [
      {
        type: Number,
        required: 'You must supply coordinates',
      },
    ],
    address: {
      type: String,
      required: 'You must supply an address',
    },
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author',
  },
});

/* eslint-disable func-names */
storeSchema.pre('save', async function(next) {
  if (!this.isModified('storeName')) {
    return next();
  }
  this.slug = slug(this.storeName);
  // regex to match slug-1 pattern
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  // search db for matching slugs
  const storesWithSlug = await this.constructor.find({ slug: slugRegex });
  if (storesWithSlug.length) {
    // found existing slug(s), update url to next number
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    // all mongo aggregate pipeline operators begin with $
    { $unwind: '$tags' }, // $tags note: $ denotes tags is a field on the document
    { $group: { _id: '$tags', count: { $sum: 1 } } }, // group by $tag values, place into object as property '_id', add count attributee and increase by 1 for each tag
    { $sort: { count: -1 } }, // 1/-1 on $sort is ascending/descending
  ]);
};

module.exports = mongoose.model('Store', storeSchema);

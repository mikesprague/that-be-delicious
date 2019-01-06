const mongoose = require('mongoose');
const slug = require('slugs');

mongoose.Promise = global.Promise;

const storeSchema = new mongoose.Schema({
  name: {
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

storeSchema.index({
  name: 'text',
  description: 'text',
});

storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    return next();
  }
  this.slug = slug(this.name);
  // regex to match slug-1 pattern
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  // search db for matching slugs
  const storesWithSlug = await this.constructor.find({ slug: slugRegex });
  if (storesWithSlug.length) {
    // found existing slug(s), update url to next number
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  return next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    // all mongo aggregate pipeline operators begin with $
    { $unwind: '$tags' }, // $tags note: $ denotes tags is a field on the document
    { $group: { _id: '$tags', count: { $sum: 1 } } }, // group by $tag values, place into object as property '_id', add count attributee and increase by 1 for each tag
    { $sort: { count: -1 } }, // 1/-1 on $sort is ascending/descending
  ]);
};

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // look up stores and populate their reviews
    {
      $lookup: {
        // 'from' value comes from mongodb (it automatically takes model name and lowercase and adds an 's')
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews',
      },
    },
    // filter for only stores with more than 2 reviews
    // this is how you access index based values in mongo, so this checks for at least items with at least 2 reviews since it's a zero based index
    { $match: { 'reviews.1': { $exists: true } } },
    // add the average reviews field
    { $addFields: { averageRating: { $avg: '$reviews.rating' } } },
    // sort it by the new field, highest first
    { $sort: { averageRating: -1 } },
    // limit it to max of 10 results
    { $limit: 10 },
  ]);
};

// make reviews available via the store
storeSchema.virtual('reviews', {
  ref: 'Review', // which model to link
  localField: '_id', // which field on the store
  foreignField: 'store', // which field on the review
});

function autocompleteReviews(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autocompleteReviews);
storeSchema.pre('findOne', autocompleteReviews);

module.exports = mongoose.model('Store', storeSchema);

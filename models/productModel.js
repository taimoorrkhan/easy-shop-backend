const { mongoose } = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  richDescription: String,
  image: { type: String, default: '' },
  images: [{ type: String }],
  brand: String,
  price: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  countInStock: { type: Number, required: true, min: 0, max: 255 },
  rating: { type: Number, default: 0, max: 5, min: 1 },
  isFeatured: { type: Boolean, default: false },
  dateCreated: { type: Date, default: Date.now },


});
 

exports.Product = mongoose.model('Product', productSchema);
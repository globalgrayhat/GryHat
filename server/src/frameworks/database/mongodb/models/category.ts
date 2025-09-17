import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }
  ],
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

<<<<<<< HEAD
const Category = model('categories', categorySchema);
=======
const Category = model('Category', categorySchema);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)

export default Category;

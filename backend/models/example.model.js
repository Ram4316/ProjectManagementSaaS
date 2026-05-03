import mongoose from 'mongoose';

/**
 * Example Model Schema
 * Demonstrates Mongoose model pattern
 */
const exampleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },
    category: {
      type: String,
      required: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    metadata: {
      views: {
        type: Number,
        default: 0
      },
      likes: {
        type: Number,
        default: 0
      }
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
exampleSchema.index({ title: 'text', description: 'text' });
exampleSchema.index({ user: 1, createdAt: -1 });
exampleSchema.index({ status: 1, isPublished: 1 });

// Virtual field example
exampleSchema.virtual('fullInfo').get(function() {
  return `${this.title} - ${this.category}`;
});

// Instance method example
exampleSchema.methods.incrementViews = function() {
  this.metadata.views += 1;
  return this.save();
};

// Static method example
exampleSchema.statics.findByCategory = function(category) {
  return this.find({ category, isPublished: true });
};

// Pre-save middleware example
exampleSchema.pre('save', function(next) {
  // Perform actions before saving
  if (this.isModified('title')) {
    this.title = this.title.trim();
  }
  next();
});

// Pre-remove middleware example
exampleSchema.pre('remove', async function(next) {
  // Cleanup related data before removing
  console.log(`Removing item: ${this._id}`);
  next();
});

const Example = mongoose.model('Example', exampleSchema);

export default Example;

// Made with Bob

import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: 'user'
    },
    title: {
      type: String,
      required: true
    },
    brief: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    value_type: {
      type: String,
      required: true,
      enum: ['face', 'percentage'],
      default: 'face'
    },
    skills: [
      { type: mongoose.SchemaTypes.ObjectId, required: true, ref: 'skills' }
    ],
    // for uploading images in future
    image: {
      type: String
    }
  },
  { timestamps: true }
)

export const Offer = mongoose.model('offer', offerSchema)

import mongoose, { Document, Schema } from 'mongoose';

const PostSchema = new Schema({
  title: String,
  youtubeLink: String,
  description: String,
  originalSinger: String,
  originalTitle: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now() },
});

interface IPostSchema extends Document {
  title: string;
  youtubeLink: string;
  description: string;
  originalSinger: string;
  originalTitle: string;
  author: string;
  createdAt: Date;
}

PostSchema.methods.join = async function () {
  const result = await this.populate('author', 'username');
  return result;
};

export interface IPost extends IPostSchema {
  join: () => Promise<IPostSchema>;
}

const Post = mongoose.model<IPost>('Post', PostSchema);

export default Post;

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { Document, Schema } from 'mongoose';

// mongoose does not suppoort TypeScript officially. Reference below.
// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1

const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
});

interface IUserSchema extends Document {
  username: string;
  password: string;
}

// Add methods
UserSchema.methods.setPassword = async function (password: string) {
  const hash = await bcrypt.hash(password, 10);
  this.password = hash;
};

UserSchema.methods.checkPassword = async function (password: string) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.password;
  return data;
};

UserSchema.methods.generateToken = function () {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not exist.');
    return;
  }

  const token = jwt.sign({ _id: this._id, username: this.username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return token;
};

export interface IUser extends IUserSchema {
  setPassword: (password: string) => Promise<void>;
  checkPassword: (password: string) => Promise<boolean>;
  serialize: () => Omit<IUserSchema, 'password'>;
  generateToken: () => string | void;
}

const User = mongoose.model<IUser>('User', UserSchema);

export default User;

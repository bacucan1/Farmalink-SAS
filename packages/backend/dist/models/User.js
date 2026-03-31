import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['cliente', 'farmaceutico', 'admin'],
        default: 'cliente'
    },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const User = mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map
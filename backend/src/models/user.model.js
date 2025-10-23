import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true,
        },
        fullName:{
            type: String,
            required: true,
        },
        phone: {
            type: String,
            unique: true,
            required: true,
            validate: {
                validator: function(v) {
                    if (!v) return false;
                    const asStr = String(v);
                    if (/^\+\d{10,15}$/.test(asStr)) return true;
                    if (/^\d{10}$/.test(asStr)) return true;
                    return false;
                },
                message: props => `${props.value} is not a valid phone number`,
            }
        },
        password:{
            type: String,
            required: true,
            minlength: 6,
        },
        profilepic:{
            type: String,
            default: "",
        }
    },
    {timestamps: true}
);

const User = mongoose.model("User", userSchema);
export default User;
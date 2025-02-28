const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userId: {
        type: Number,
        unique: true,
        select: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    firstName: { type: String , required: true },
    lastName: { type: String , required: true },
    // Every user holds an array of his watch History, and date he watched the movie at
    watchHistory: {
        type: [{
            movieId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Movie"
            },
            watchedAt: {
                type: Date,
                default: Date.now
            }
    }],
    default: []
    },
    photo: { type: String, default: 'default.jpg'},
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

const Counter = mongoose.model("Counter", new mongoose.Schema({
    _id: String,
    seq: Number
}));

userSchema.pre("save", async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { _id: "userId" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.userId = counter.seq;
            next();
        } catch (error) {
            console.error("Error in pre-save hook:", error);
            next(error);
        }
    } else {
        next();
    }
});

// Define the returned Json format 
userSchema.method("toJSON", function () {
    const userSchema = this.toObject();

    return {
        userId: userSchema._id,
        email: userSchema.email,
        firstName: userSchema.firstName,
        lastName: userSchema.lastName,
        photo: userSchema.photo,
        watchHistory: userSchema.watchHistory.map(watch => ({
            movieId: watch.movieId._id,
            movieName: watch.movieId.name, 
            watchedAt: watch.watchedAt
        })),
        role: userSchema.role
    };
});

module.exports = mongoose.model("User", userSchema);
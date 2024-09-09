const mongoose = require("mongoose");

const { Schema } = mongoose;

const musicianSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    pictures: {
      main: {
        type: String,
        default:
          "https://images.pexels.com/photos/756507/pexels-photo-756507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      },
      secondary: {
        type: String,
        default:
          "https://images.pexels.com/photos/228842/pexels-photo-228842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      },
    },

    description: {
      type: String,
    },

    contact: {
      phone: {
        type: String,
      },

      email: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const Musician = mongoose.model("Musician", musicianSchema);

module.exports = Musician;

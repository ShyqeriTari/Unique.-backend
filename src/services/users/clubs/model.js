import mongoose from "mongoose"
import baseModel from "../baseModel.js"

const { Schema, model } = mongoose

const ClubSchema = baseModel.discriminator("Club", new Schema({
    players: [{ type: Schema.Types.ObjectId, ref: 'Player'}],
    // like: [{type: Schema.Types.ObjectId, ref: ['Club', 'Player', 'Fan']}]
}))

export default model("Club")
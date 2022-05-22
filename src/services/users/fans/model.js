import mongoose from "mongoose"
import baseModel from "../baseModel.js"

const { Schema, model } = mongoose

const FanSchema = baseModel.discriminator("Fan", new Schema({
    club: [{ type: Schema.Types.ObjectId, ref: 'Club'}]
}))

export default model("Fan")
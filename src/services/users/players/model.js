import mongoose from "mongoose"
import baseModel from "../baseModel.js"

const { Schema, model } = mongoose

const PlayerSchema = baseModel.discriminator("Player", new Schema({
    pac: { type: Number, default: 0 },
    sho: { type: Number, default: 0 },
    pas: { type: Number, default: 0 },
    dri: { type: Number, default: 0 },
    def: { type: Number, default: 0 },
    phy: { type: Number, default: 0 },
    club: { type: Schema.Types.ObjectId, ref: 'Club'},
    // like: [{type: Schema.Types.ObjectId, ref: ['Club', 'Player', 'Fan']}]
}))

export default model("Player")

import mongoose from "mongoose"
import baseModel from "./baseModel.js"

const { Schema, model } = mongoose

const PlayerSchema = baseModel.discriminator("Player", new Schema({
    pac: { type: Number, default: 0 },
    sho: { type: Number, default: 0 },
    pas: { type: Number, default: 0 },
    dri: { type: Number, default: 0 },
    def: { type: Number, default: 0 },
    phy: { type: Number, default: 0 },
}))

export default model("Player")
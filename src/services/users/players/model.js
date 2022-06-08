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
    position: {type: String,  enum: ["GK", "LWB", "LB", "CB", "RB", "RWB", "LM", "CM", "CDM", "CAM", "RM", "RW", "LF", "RF", "ST", "CF"]},
    video: {type: String},
    like: [{type: Schema.Types.ObjectId, refPath: "likeType"}],
    likeType:{type: String, enum: ["Club", "Player", "Fan"] },
    dislike: [{type: Schema.Types.ObjectId, refPath: "likeType"}]
}))

export default model("Player")

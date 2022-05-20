import express from "express"
import PlayersModel from "./playersModel.js"
import { generateAccessToken } from "../../auth/tools.js"
import { JWTAuthMiddleware } from "../../auth/JWTMiddleware.js"

const playersRouter = express.Router()

playersRouter.post("/register", async (req, res, next) => {
    try {
      const newPlayer = new PlayersModel(req.body)
      const { _id, role } = await newPlayer.save()
      const accessToken = await generateAccessToken({ _id: _id, role: role })
      res.status(201).send({ _id, accessToken })
    } catch (error) {
      next(error)
    }
  })

  playersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const user = await PlayersModel.findById(req.user._id)
      if (user) {
        res.send(user)
      } else {
        next(401, `User with id ${req.user._id} not found!`)
      }
    } catch (error) {
      next(error)
    }
  })

  export default playersRouter
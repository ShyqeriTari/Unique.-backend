import express from "express"
import PlayersModel from "./playersModel.js"
import createError from "http-errors"
import { generateAccessToken } from "../../auth/tools.js"
import { JWTAuthMiddleware } from "../../auth/JWTMiddleware.js"
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const playersRouter = express.Router()

const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
      cloudinary, 
      params: {
        folder: "Unique-players",
      }, limits: { fileSize: 3145728 }
    }),
  }).single("image");

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

 playersRouter.post("/login", async (req, res, next) => {
    try {
      const { email, password} = req.body
  
      const player = await PlayersModel.checkCredentials(email, (password))
  
      if (player) {
  
        const accessToken = await generateAccessToken({ _id: player._id, role: player.role })
  
        res.send({ accessToken })
      } else {
        next(createError(401, `Credentials are not ok!`))
      }
    } catch (error) {
      next(error)
    }
  })

playersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const players = await PlayersModel.find()
      res.send(players)
    } catch (error) {
      next(error)
    }
  })

  playersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const player = await PlayersModel.findById(req.user._id)
      if (player) {
        res.send(player)
      } else {
        next(createError(401, `Player with id ${req.user._id} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })

  playersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const player = await PlayersModel.findById(req.user._id)
      if (player) {
        res.send(player)
      } else {
        next(createError(401, `Player with id ${req.user._id} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })

  playersRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const player = await PlayersModel.findById(req.params.id)
      if (player) {
        res.send(player)
      } else {
        next(createError(404, `Player with id ${req.params.id} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })

  playersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {

      const updatedPlayer = await PlayersModel.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
      if(updatedPlayer){

        res.send(updatedPlayer)
    }else{
        next(createError(404, `Player with id ${req.user._id} not found!`))
    }
    } catch (error) {
      next(error)
    }
  })

  playersRouter.put("/imageUpload", JWTAuthMiddleware, cloudinaryUploader, async (req, res, next) => {
    try {
      const player = await PlayersModel.findByIdAndUpdate(
        req.user._id,
        { image: req.file.path },
        { new: true }
      );
  
      if (player) {
        res.send("Uploaded on Cloudinary!");
      } else {
        next(createError(404, `Player with id ${req.user._id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
  );

  playersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const deletedPlayer = await PlayersModel.findByIdAndDelete(req.user._id)

        res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  export default playersRouter
import express from "express"
import PlayersModel from "./model.js"
import createError from "http-errors"
import { generateAccessToken } from "../../../auth/tools.js"
import { JWTAuthMiddleware } from "../../../auth/JWTMiddleware.js"
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import q2m from "query-to-mongo";
import ClubsModel from "../clubs/model.js"

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
  
        res.send({accessToken: accessToken, id: player._id} )
      } else {
        next(createError(401, `Credentials are not ok!`))
      }
    } catch (error) {
      next(error)
    }
  })

  playersRouter.post("/addLike", JWTAuthMiddleware, async (req, res, next) => {
    try {
  
        const updatePlayer = await PlayersModel.findByIdAndUpdate(
          req.body.id,
          { $push: { like: req.user._id}}
      )
  
      res.status(200).send()
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

  playersRouter.post("/addDisLike", JWTAuthMiddleware, async (req, res, next) => {
    try {
  
        const updatePlayer = await PlayersModel.findByIdAndUpdate(
          req.body.id,
          { $push: { dislike: req.user._id}}
      )
  
      res.status(200).send()
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

playersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const mongoQuery = q2m(req.query);

      const players = await PlayersModel.find(mongoQuery.criteria ).populate({path:"club", select: "name country"})
     
      res.send(players)
    } catch (error) {
      next(error)
    }
  })

  playersRouter.get("/all", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const players = await PlayersModel.find().populate({path:"club", select: "name country"})
      res.send(players)
    } catch (error) {
      next(error)
    }
  })

  playersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const player = await PlayersModel.findById(req.user._id).populate({path:"club", select: "name country"})
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
      const player = await PlayersModel.findById(req.params.id).populate({path: "club"})
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

      const player = await PlayersModel.findById(req.user._id)
      
        if(req.body.club){
          const removeFromPrev = await ClubsModel.findByIdAndUpdate(player.club.toString(),
          { $pull: { players: req.user._id }})
          const updatedPlayer = await PlayersModel.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
          const updateClub = await ClubsModel.findByIdAndUpdate(
            req.body.club ,
            { $push: { players: req.user._id }}
        )
        res.send(updatedPlayer)
      } else if (!req.body.club){ 
          const updatedPlayer = await PlayersModel.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
      
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

  playersRouter.delete("/removeLike", JWTAuthMiddleware, async (req, res, next) => {
    try {

        const updatePlayers = await PlayersModel.findByIdAndUpdate(
          req.body.id,

            { $pull: { like: req.user._id }}

        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });

  playersRouter.delete("/removeDisLike", JWTAuthMiddleware, async (req, res, next) => {
    try {

        const updatePlayers = await PlayersModel.findByIdAndUpdate(
          req.body.id,

            { $pull: { dislike: req.user._id }}

        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });


  export default playersRouter
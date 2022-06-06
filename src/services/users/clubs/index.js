import express from "express"
import ClubsModel from "./model.js"
import createError from "http-errors"
import { generateAccessToken } from "../../../auth/tools.js"
import { JWTAuthMiddleware } from "../../../auth/JWTMiddleware.js"
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import q2m from "query-to-mongo";
import PlayersModel from "../players/model.js"

const clubsRouter = express.Router()

const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
      cloudinary, 
      params: {
        folder: "Unique-clubs",
      }, limits: { fileSize: 3145728 }
    }),
  }).single("image");

clubsRouter.post("/register", async (req, res, next) => {
    try {
      const newClub = new ClubsModel(req.body)
      const { _id, role } = await newClub.save()
      const accessToken = await generateAccessToken({ _id: _id, role: role })
      res.status(201).send({ _id, accessToken })
    } catch (error) {
      next(error)
    }
  })

clubsRouter.post("/login", async (req, res, next) => {
    try {
      const { email, password} = req.body
  
      const club = await ClubsModel.checkCredentials(email, (password))
  
      if (club) {
  
        const accessToken = await generateAccessToken({ _id: club._id, role: club.role })
  
        res.send({ accessToken })
      } else {
        next(createError(401, `Credentials are not ok!`))
      }
    } catch (error) {
      next(error)
    }
  })

  clubsRouter.post("/addplayer", JWTAuthMiddleware, async (req, res, next) => {
    try {
  
        const updateClub = await ClubsModel.findByIdAndUpdate(
          req.user._id ,
          { $push: { players: req.body.player }}
      )
  
      const updatePlayer = await PlayersModel.findByIdAndUpdate(
         req.body.player ,
         { club: req.user._id }
      )
  
      res.status(200).send()
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

  clubsRouter.post("/addLike", JWTAuthMiddleware, async (req, res, next) => {
    try {
  
        const updateClub = await ClubsModel.findByIdAndUpdate(
          req.body.id,
          { $push: { like: req.user._id}}
      )
  
      res.status(200).send()
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

  clubsRouter.post("/addDisLike", JWTAuthMiddleware, async (req, res, next) => {
    try {
  
        const updateClub = await ClubsModel.findByIdAndUpdate(
          req.body.id,
          { $push: { dislike: req.user._id}}
      )
  
      res.status(200).send()
    } catch (error) {
      console.log(error);
      next(error);
    }
  });


clubsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const mongoQuery = q2m(req.query);
      const clubs = await ClubsModel.find(mongoQuery.criteria )
      res.send(clubs)
    } catch (error) {
      next(error)
    }
  })

  clubsRouter.get("/all", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const clubs = await ClubsModel.find()
      res.send(clubs)
    } catch (error) {
      next(error)
    }
  })

clubsRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const club = await ClubsModel.findById(req.user._id).populate({path:"players", select: "-password -email", populate: {path: "club"}})
      if (club) {
        res.send(club)
      } else {
        next(createError(401, `Club with id ${req.user._id} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })

clubsRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const club = await ClubsModel.findById(req.params.id).populate({path:"players"})
      if (club) {
        res.send(club)
      } else {
        next(createError(404, `Club with id ${req.params.id} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })

clubsRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {

      const updatedClub = await ClubsModel.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
      if(updatedClub){

        res.send(updatedClub)
    }else{
        next(createError(404, `Club with id ${req.user._id} not found!`))
    }
    } catch (error) {
      next(error)
    }
  })

clubsRouter.put("/imageUpload", JWTAuthMiddleware, cloudinaryUploader, async (req, res, next) => {
    try {
      const club = await ClubsModel.findByIdAndUpdate(
        req.user._id,
        { image: req.file.path },
        { new: true }
      );
  
      if (club) {
        res.send("Uploaded on Cloudinary!");
      } else {
        next(createError(404, `Club with id ${req.user._id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
  );

clubsRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const deletedClub= await ClubsModel.findByIdAndDelete(req.user._id)

        res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  clubsRouter.delete("/removePlayer", JWTAuthMiddleware, async (req, res, next) => {
    try {

        const updatePlayers = await ClubsModel.findByIdAndUpdate(
            req.user._id,

            { $pull: { players: req.body.player }}

        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });

  clubsRouter.delete("/removeLike", JWTAuthMiddleware, async (req, res, next) => {
    try {

        const updatePlayers = await ClubsModel.findByIdAndUpdate(
          req.body.userlike,

            { $pull: { like: req.user._id }}

        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });

  clubsRouter.delete("/removeDisLike", JWTAuthMiddleware, async (req, res, next) => {
    try {

        const updatePlayers = await ClubsModel.findByIdAndUpdate(
          req.body.dislike,

            { $pull: { dislike: req.user._id }}

        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });

  export default clubsRouter
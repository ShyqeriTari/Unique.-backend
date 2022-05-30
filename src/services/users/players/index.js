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
  
        res.send({ accessToken })
      } else {
        next(createError(401, `Credentials are not ok!`))
      }
    } catch (error) {
      next(error)
    }
  })

  playersRouter.post("/addLike", JWTAuthMiddleware, async (req, res, next) => {
    try {
  
        const updateClub = await PlayersModel.findByIdAndUpdate(
          req.body.userlike,
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
  
        const updateClub = await PlayersModel.findByIdAndUpdate(
          req.body.dislike,
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
      if(mongoQuery.criteria.name &&  mongoQuery.criteria.position && mongoQuery.criteria.country && mongoQuery.criteria.birthdate){
      const players = await PlayersModel.find({ $and: [
        {name: mongoQuery.criteria.name},
        {country: mongoQuery.criteria.country},
        {position: mongoQuery.criteria.position},
        {birthdate: mongoQuery.criteria.birthdate},
        
       ]}
       )
      res.send(players)
    } else if(!mongoQuery.criteria.position && !mongoQuery.criteria.country && !mongoQuery.criteria.birthdate && mongoQuery.criteria.name){
      const players = await PlayersModel.find(
        {name: mongoQuery.criteria.name},
       )
      res.send(players)
      } else if( !mongoQuery.criteria.position && !mongoQuery.criteria.name && !mongoQuery.criteria.birthdate && mongoQuery.criteria.country){
        const players = await PlayersModel.find(
          {country: mongoQuery.criteria.country},
         )
        res.send(players)
        } else if(!mongoQuery.criteria.name && !mongoQuery.criteria.country && !mongoQuery.criteria.birthdate && mongoQuery.criteria.position){
          const players = await PlayersModel.find(
            {position: mongoQuery.criteria.position},
           )
          res.send(players)
          } else if(!mongoQuery.criteria.position && !mongoQuery.criteria.country && !mongoQuery.criteria.name &&mongoQuery.criteria.birthdate){
            const players = await PlayersModel.find(
              {birthdate: mongoQuery.criteria.birthdate},
             )
            res.send(players)
            } else  if(mongoQuery.criteria.name &&  mongoQuery.criteria.position && !mongoQuery.criteria.country && !mongoQuery.criteria.birthdate){
              const players = await PlayersModel.find({ $and: [
                {name: mongoQuery.criteria.name},
                {position: mongoQuery.criteria.position},
                
               ]}
               )
              res.send(players)
            } else  if(mongoQuery.criteria.name &&  mongoQuery.criteria.country && !mongoQuery.criteria.position && !mongoQuery.criteria.birthdate ){
              const players = await PlayersModel.find({ $and: [
                {name: mongoQuery.criteria.name},
                {country: mongoQuery.criteria.country},
               ]}
               )
              res.send(players)
            } else  if(mongoQuery.criteria.name &&  mongoQuery.criteria.birthdate &&  !mongoQuery.criteria.position && !mongoQuery.criteria.country ){
              const players = await PlayersModel.find({ $and: [
                {name: mongoQuery.criteria.name},
                {birthdate: mongoQuery.criteria.birthdate},
                
               ]}
               )
              res.send(players)
            } else  if( mongoQuery.criteria.position && mongoQuery.criteria.country &&  !mongoQuery.criteria.name && !mongoQuery.criteria.birthdate){
              const players = await PlayersModel.find({ $and: [
                {position: mongoQuery.criteria.position},
                {country: mongoQuery.criteria.country},
               ]}
               )
              res.send(players)
            } else  if( mongoQuery.criteria.position && mongoQuery.criteria.birthdate &&  !mongoQuery.criteria.name && !mongoQuery.criteria.country ){
              const players = await PlayersModel.find({ $and: [
                {position: mongoQuery.criteria.position},
                {birthdate: mongoQuery.criteria.birthdate},
               ]}
               )
              res.send(players)
            } else  if( mongoQuery.criteria.birthdate && mongoQuery.criteria.country &&  !mongoQuery.criteria.position && !mongoQuery.criteria.name ){
              const players = await PlayersModel.find({ $and: [
                {birthdate: mongoQuery.criteria.birthdate},
                {country: mongoQuery.criteria.country},
               ]}
               )
              res.send(players)
            } else  if( mongoQuery.criteria.birthdate && mongoQuery.criteria.country &&  mongoQuery.criteria.position && !mongoQuery.criteria.name ){
              const players = await PlayersModel.find({ $and: [
                {birthdate: mongoQuery.criteria.birthdate},
                {country: mongoQuery.criteria.country},
                {position: mongoQuery.criteria.position},
               ]}
               )
              res.send(players)
            } else  if( mongoQuery.criteria.birthdate && mongoQuery.criteria.country &&  !mongoQuery.criteria.position && mongoQuery.criteria.name ){
              const players = await PlayersModel.find({ $and: [
                {birthdate: mongoQuery.criteria.birthdate},
                {country: mongoQuery.criteria.country},
                {name: mongoQuery.criteria.name},
               ]}
               )
              res.send(players)
            } else  if( mongoQuery.criteria.birthdate && !mongoQuery.criteria.country &&  mongoQuery.criteria.position && mongoQuery.criteria.name ){
              const players = await PlayersModel.find({ $and: [
                {birthdate: mongoQuery.criteria.birthdate},
                {position: mongoQuery.criteria.position},
                {name: mongoQuery.criteria.name},
               ]}
               )
              res.send(players)
            } else  if( !mongoQuery.criteria.birthdate && mongoQuery.criteria.country &&  mongoQuery.criteria.position && mongoQuery.criteria.name ){
              const players = await PlayersModel.find({ $and: [
                {country: mongoQuery.criteria.country},
                {position: mongoQuery.criteria.position},
                {name: mongoQuery.criteria.name},
               ]}
               )
              res.send(players)
            }
    } catch (error) {
      next(error)
    }
  })

  playersRouter.get("/all", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const players = await PlayersModel.find()
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
        if(req.body.club){
          const updateClub = await ClubsModel.findByIdAndUpdate(
            req.body.club ,
            { $push: { players: req.user._id }}
        )
        }

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
          req.body.userlike,

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
          req.body.dislike,

            { $pull: { dislike: req.user._id }}

        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });


  export default playersRouter
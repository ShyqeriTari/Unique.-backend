import express from "express"
import FansModel from "./model.js"
import createError from "http-errors"
import { generateAccessToken } from "../../../auth/tools.js"
import { JWTAuthMiddleware } from "../../../auth/JWTMiddleware.js"
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import q2m from "query-to-mongo";

const fansRouter = express.Router()

const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
      cloudinary, 
      params: {
        folder: "Unique-fans",
      }, limits: { fileSize: 3145728 }
    }),
  }).single("image");

fansRouter.post("/register", async (req, res, next) => {
    try {
      const newFan = new FansModel(req.body)
      const { _id, role } = await newFan.save()
      const accessToken = await generateAccessToken({ _id: _id, role: role })
      res.status(201).send({ _id, accessToken })
    } catch (error) {
      next(error)
    }
  })

fansRouter.post("/login", async (req, res, next) => {
    try {
      const { email, password} = req.body
  
      const fan = await FansModel.checkCredentials(email, (password))
  
      if (fan) {
  
        const accessToken = await generateAccessToken({ _id: fan._id, role: fan.role })
  
        res.send({ accessToken })
      } else {
        next(createError(401, `Credentials are not ok!`))
      }
    } catch (error) {
      next(error)
    }
  })

  fansRouter.post("/addPlayer", JWTAuthMiddleware, async (req, res, next) => {
    try {
  
        const updateFan = await FansModel.findByIdAndUpdate(
          req.user._id ,
          { $push: { favPlayers: req.body.player }}
      )
  
      res.status(200).send()
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

  fansRouter.post("/addClub", JWTAuthMiddleware, async (req, res, next) => {
    try {
  
        const updateFan = await FansModel.findByIdAndUpdate(
          req.user._id ,
          { $push: { favClubs: req.body.club }}
      )
  
      res.status(200).send()
    } catch (error) {
      console.log(error);
      next(error);
    }
  });


fansRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
      const fan = await FansModel.findById(req.user._id).populate({path: "favPlayers"})
      if (fan) {
        res.send(fan)
      } else {
        next(createError(401, `User with id ${req.user._id} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })


fansRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {

      const updatedFan = await FansModel.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
      if(updatedFan){

        res.send(updatedFan)
    }else{
        next(createError(404, `User with id ${req.user._id} not found!`))
    }
    } catch (error) {
      next(error)
    }
  })

fansRouter.put("/imageUpload", JWTAuthMiddleware, cloudinaryUploader, async (req, res, next) => {
    try {
      const fan = await FansModel.findByIdAndUpdate(
        req.user._id,
        { image: req.file.path },
        { new: true }
      );
  
      if (fan) {
        res.send("Uploaded on Cloudinary!");
      } else {
        next(createError(404, `User with id ${req.user._id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
  );

fansRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
    try {
        const deletedFan = await FansModel.findByIdAndDelete(req.user._id)

        res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  fansRouter.delete("/removePlayer", JWTAuthMiddleware, async (req, res, next) => {
    try {

        const updateFan = await FansModel.findByIdAndUpdate(
            req.user._id,

            { $pull: { favPlayers: req.body.player }}

        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });

  fansRouter.delete("/removeClub", JWTAuthMiddleware, async (req, res, next) => {
    try {

        const updateFan = await FansModel.findByIdAndUpdate(
            req.user._id,

            { $pull: { favClubs: req.body.club }}

        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });

  export default fansRouter
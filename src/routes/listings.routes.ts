import { Router } from "express";
import { createListing, deleteListing, getAllListings, getSingleListing, updateListing } from "../controllers/listings.controller";
import { authenticate, requireHost } from "../middlewares/auth.middleware";

const route = Router();

route.get("/", getAllListings);
route.get("/:id", getSingleListing);
route.post("/",authenticate,requireHost, createListing);
route.put("/:id", updateListing);
route.delete("/:id", deleteListing);

export default route;
import { Router } from "express";
import { createListing, getAllListings, getSingleListing, updateListing } from "../controllers/listings.controller";

const route = Router();

route.get("/", getAllListings);
route.get("/:id", getSingleListing);
route.post("/", createListing);
route.put("/:id", updateListing);
// route.delete("/:id", deleteListing);

export default route;
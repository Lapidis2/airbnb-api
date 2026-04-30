import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getAllListings,
  getSingleListing,
  searchListings,
  updateListing,
  deleteListing,
  createListing,
} from "../../controllers/listings.controller";

const route = Router();

route.get("/", getAllListings as any);
route.get("/search", searchListings as any);
route.get("/:id", getSingleListing as any);
route.post("/", authenticate, createListing as any);
route.put("/:id", authenticate, updateListing as any);
route.delete("/:id", authenticate, deleteListing as any);

export default route;

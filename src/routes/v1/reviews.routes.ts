import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getListingReviews,
  createReview,
  deleteReview,
} from "../../controllers/reviews.controller";

const route = Router();

route.get("/listings/:listingId/reviews", getListingReviews as any);
route.post("/listings/:listingId/reviews", authenticate, createReview as any);
route.delete("/:id", authenticate, deleteReview as any);

export default route;

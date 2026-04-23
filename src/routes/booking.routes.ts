import {Router} from "express"
import { createBooking } from "../controllers/booking.controller";
const route=Router()

route.post("/",createBooking)

export default route
import { z } from "zod";

export const createBookingSchema = z
  .object({
    checkIn: z.coerce.date({
      message: "checkIn must be a valid date",
    }),
    checkOut: z.coerce.date({
      message: "checkOut must be a valid date",
    }),
    userId: z.number().int().positive({
      message: "userId must be a positive integer",
    }),
    listingId: z.number().int().positive({
      message: "listingId must be a positive integer",
    }),
    guests: z.number().int().positive({
      message: "guests must be a positive integer",
    }),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  })
  .refine((data) => data.checkIn < data.checkOut, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

export const updateBookingSchema = z
  .object({
    checkIn: z.coerce.date({
      message: "checkIn must be a valid date",
    }).optional(),

    checkOut: z.coerce.date({
      message: "checkOut must be a valid date",
    }).optional(),

    status: z
      .enum(["PENDING", "CONFIRMED", "CANCELLED"], {
        message: "Invalid booking status",
      })
      .optional(),
  })
  .refine(
    (data) => {
      // only validate if both dates exist
      if (data.checkIn && data.checkOut) {
        return data.checkIn < data.checkOut;
      }
      return true;
    },
    {
      message: "checkOut must be after checkIn",
      path: ["checkOut"],
    }
  );
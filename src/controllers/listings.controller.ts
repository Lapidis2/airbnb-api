import type { Request, Response } from "express";
import  {  listings,  Listing } from "../models/listings.model";

export const getAllListings = (_req: Request, res: Response): void => {
  res.status(200).json(listings);
};

export const getSingleListing = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const listing = listings.find(list => list.id === id);

  if (!listing) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }

  res.status(200).json(listing);
};

export const createListing = (req: Request, res: Response): void => {
  const data = req.body as Partial<Listing>;

  if (
    !data.title ||
    !data.description ||
    !data.location ||
    !data.pricePerNight ||
    !data.guests ||
    !data.type ||
    !data.amenities ||
    !data.host
  ) {
    res.status(400).json({ message: "There is some missing required fields" });
    return;
  }

  const newListing: Listing = {
    id: listings.length + 1,
    title: data.title,
    description: data.description,
    location: data.location,
    pricePerNight: data.pricePerNight,
    guests: data.guests,
    type: data.type,
    amenities: data.amenities,
    host: data.host,
    rating: data.rating
  };

  listings.push(newListing);
  res.status(201).json({ message: "Listing created successfully", listing: newListing });
};

export const updateListing = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = listings.findIndex(list => list.id === id);

  if (index === -1) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }

  listings[index] = { ...listings[index], ...req.body };
  res.json(listings[index]);
};

export const deleteListing = (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const index = listings.findIndex(l => l.id === id);

  if (index === -1) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }

  listings.splice(index, 1);
  res.json({ message: "Listing deleted" });
};
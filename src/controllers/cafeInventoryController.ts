import { Request, Response } from "express";
import { CafeInventory } from "../models/schemas";

export const getCafeInventory = async (req: Request, res: Response) => {
  try {
    const items = await CafeInventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createCafeInventory = async (req: Request, res: Response) => {
  try {
    const cafeInventory = new CafeInventory(req.body);
    await cafeInventory.save();
    res.status(201).json(cafeInventory);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateCafeInventory = async (req: Request, res: Response) => {
  try {
    const item = await CafeInventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteCafeInventory = async (req: Request, res: Response) => {
  try {
    const item = await CafeInventory.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

import { Request, Response } from "express";
import { CafeInventory } from "../models/cafeInventory.model";
import { v4 as uuidv4 } from "uuid";
import { CafeInventory as CafeInventoryType } from "../types/interface";

export const getCafeInventory = async (_req: Request, res: Response) => {
  try {
    const items = await CafeInventory.find();

    res.status(200).json({
      message: "Inventory fetched successfully",
      data: items,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

export const bulkCreateInventory = async (
  req: Request<{}, {}, CafeInventoryType[]>,
  res: Response
) => {
  try {
    const items = req.body;

    const normalizedItems = items.map((item) => ({
      _id: uuidv4(),
      item_name: item.item_name.trim().toLowerCase(),
      quantity: item.quantity,
      price: item.price,
    }));

    const result = await CafeInventory.insertMany(normalizedItems);
    res.status(201).json({
      message: "Inventory items created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: "Bulk creation failed" });
  }
};

export const updateBulkInventoryItems = async (
  req: Request<{}, {}, CafeInventoryType[]>,
  res: Response
) => {
  try {
    const updates = req.body;

    const operations = updates.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: {
          $set: {
            item_name: item.item_name.trim().toLowerCase(),
            quantity: item.quantity,
            price: item.price,
            updatedAt: new Date(),
          },
        },
      },
    }));

    const result = await CafeInventory.bulkWrite(operations);

    res.status(200).json({
      message: "Inventory updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Bulk update failed" });
  }
};

export const bulkDeleteInventory = async (
  req: Request<{}, {}, { _id: string }[]>,
  res: Response
) => {
  try {
    const items = req.body;

    // console.log(items);

    const operations = items.map((item) => ({
      deleteOne: {
        filter: { _id: item._id },
      },
    }));

    // console.log(operations);
    const result = await CafeInventory.bulkWrite(operations);

    // console.log(result);
    res.status(200).json({
      message: "Inventory items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Bulk delete failed" });
  }
};

import { Request, Response } from "express";
import { CafeInventory } from "../models/cafeInventory.model";
import { v4 as uuidv4 } from "uuid";
import { CafeInventory as CafeInventoryType } from "../types/interface";

import { makeInventoryTag } from "../utils/etag";

export const getCafeInventory = async (req: Request, res: Response) => {
  try {
    const items = await CafeInventory.find().sort({ item_name: 1 }).lean();
    const tag = makeInventoryTag(items);

    if (req.headers["if-none-match"] === tag) {
      return res.status(304).end(); // No change, no data sent
    }

    res.setHeader("ETag", tag);
    res.setHeader("Cache-Control", "public, max-age=30"); // 30 sec cache

    res.status(200).json({
      message: "Inventory fetched successfully",
      data: items
    });
  } catch {
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
export const handleCafePurchase = async (req: Request, res: Response) => {
  const { cart } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: "Cart must be a non-empty array" });
  }

  try {
    const operations = cart.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.quantityOrdered } },
      },
    }));

    const result = await CafeInventory.bulkWrite(operations);

    res.status(200).json({
      message: "Inventory updated after purchase",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Failed to update inventory after purchase:", error);
    res.status(500).json({ error: "Purchase update failed" });
  }
};


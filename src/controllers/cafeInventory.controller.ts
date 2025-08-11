// src/controllers/cafeInventory.controller.ts
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
      return res.status(304).end(); // No change
    }

    res.setHeader("ETag", tag);
    res.setHeader("Cache-Control", "public, max-age=30");

    return res.status(200).json({
      message: "Inventory fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("getCafeInventory error:", error);
    return res.status(500).json({ error: "Failed to fetch inventory" });
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

    return res.status(201).json({
      message: "Inventory items created successfully",
      data: result,
    });
  } catch (error) {
    console.error("bulkCreateInventory error:", error);
    return res.status(500).json({ error: "Bulk creation failed" });
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

    return res.status(200).json({
      message: "Inventory updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("updateBulkInventoryItems error:", error);
    return res.status(500).json({ error: "Bulk update failed" });
  }
};

export const bulkDeleteInventory = async (
  req: Request<{}, {}, { _id: string }[]>,
  res: Response
) => {
  try {
    const items = req.body;

    const operations = items.map((item) => ({
      deleteOne: { filter: { _id: item._id } },
    }));

    const result = await CafeInventory.bulkWrite(operations);

    return res.status(200).json({
      message: "Inventory items deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("bulkDeleteInventory error:", error);
    return res.status(500).json({ error: "Bulk delete failed" });
  }
};

type CartItem = {
  _id: string;
  quantityOrdered: number;
  item_name?: string;
  price?: number;
};

export const checkoutSuccess = async (
  req: Request<{}, {}, { cart: CartItem[]; total: number }>,
  res: Response
) => {
  const { cart, total } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: "Cart must be a non-empty array" });
  }

  try {
    // 1) Decrement stock
    const operations = cart.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.quantityOrdered } },
      },
    }));
    await CafeInventory.bulkWrite(operations);

    // 2) Fetch updated inventory
    const updatedInventory = await CafeInventory.find()
      .sort({ item_name: 1 })
      .lean();

    
    return res.status(200).json({
      message: "Checkout processed successfully",
      items: cart,
      total,
      updatedInventory,
    });
  } catch (error) {
    console.error("checkoutSuccess error:", error);
    return res.status(500).json({ error: "Checkout processing failed" });
  }
};

import { CafeInventory } from "../models/schemas";

export const createCafeInventory = async () => {
  try {
    const cafeInventory = new CafeInventory({
      item_name: "Coffee",
      item_price: 2.5,
      item_description: "Freshly brewed coffee",
      item_image: "https://example.com/coffee.jpg",
      item_category: "Beverages",
      available_quantity: 100,
    });

    await cafeInventory.save();
  } catch (error) {
    console.error(error);
  }
};

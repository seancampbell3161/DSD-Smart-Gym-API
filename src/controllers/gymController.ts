import { Gym } from "../models/schemas";

export const createGym = async () => {
  try {
    const gym = new Gym({
      name: "Planet Thickness",
      address: "123 address way",
      city: "City",
      zipcode: "12345",
      phone: "123-456-7890",
    });

    await gym.save();
  } catch (error) {
    console.error(error);
  }
};

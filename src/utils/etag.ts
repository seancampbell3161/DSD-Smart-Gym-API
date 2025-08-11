import crypto from "crypto";

export function makeInventoryTag(items: any[]) {
  const base = JSON.stringify(items.map(i => ({
    id: i._id,
    updated: i.updatedAt
  })));
  return `"inv-${crypto.createHash("sha1").update(base).digest("hex")}"`;
}

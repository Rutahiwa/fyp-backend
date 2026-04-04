import bcrypt from "bcrypt";

export async function hashPassword(plainText: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(plainText, saltRounds);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hash);
}

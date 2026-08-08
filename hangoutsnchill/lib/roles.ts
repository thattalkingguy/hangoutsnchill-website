export type UserRole = "admin" | "creator" | "member";

export function isAdmin(role?: UserRole | string | null) {
  return role === "admin";
}

export function isCreator(role?: UserRole | string | null) {
  return role === "creator";
}

export function isMember(role?: UserRole | string | null) {
  return role === "member";
}

export function canManageMarketplace(role?: UserRole | string | null) {
  return isAdmin(role) || isCreator(role);
}

export function canAccessAdmin(role?: UserRole | string | null) {
  return isAdmin(role);
}

export function canPurchase(role?: UserRole | string | null) {
  return (
    isAdmin(role) ||
    isCreator(role) ||
    isMember(role)
  );
}
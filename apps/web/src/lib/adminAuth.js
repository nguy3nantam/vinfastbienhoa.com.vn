import pb from "./pocketbaseClient";

const ADMIN_COLLECTION = "_superusers";
const STAFF_COLLECTION = "users";

export const isSuperuserAuthed = () =>
  pb.authStore.isValid && pb.authStore.record?.collectionName === ADMIN_COLLECTION;

export const isStaffAuthed = () =>
  pb.authStore.isValid && pb.authStore.record?.collectionName === STAFF_COLLECTION;

export const isAdminAuthed = () => isSuperuserAuthed() || isStaffAuthed();

// "admin" = toàn quyền (_superusers), "user" = quyền giới hạn (users)
export const currentRole = () => {
  if (isSuperuserAuthed()) return "admin";
  if (isStaffAuthed()) return "user";
  return null;
};

export const adminLogin = async (email, password) => {
  try {
    return await pb.collection(ADMIN_COLLECTION).authWithPassword(email, password);
  } catch (err) {
    try {
      return await pb.collection(STAFF_COLLECTION).authWithPassword(email, password);
    } catch {
      throw err;
    }
  }
};

export const adminLogout = () => pb.authStore.clear();

export const currentAdmin = () => (isAdminAuthed() ? pb.authStore.record : null);

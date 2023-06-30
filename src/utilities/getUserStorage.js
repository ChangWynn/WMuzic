import { storage } from "../config/firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";

export const getUserStorage = async () => {
  const userStoragePath = `USER-UID-${localStorage.getItem("uid")}`;
  const userStorageRef = ref(storage, userStoragePath);

  try {
    return await listAll(userStorageRef);
  } catch (err) {
    console.log(err);
  }
};

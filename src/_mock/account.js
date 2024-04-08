import { auth } from "../config/firebase-config";

const currentUser = auth.currentUser;

const account = {
  displayName: currentUser ? currentUser.displayName : 'Demo User', // Set default display name if currentUser or its displayName is undefined
  email: currentUser ? currentUser.email : "",
  photoURL: currentUser && currentUser.photoURL ? currentUser.photoURL : '/assets/images/avatars/avatar_default.jpg',
};

export default account;

import { auth } from '../config/firebase-config';

const currentUser = auth.currentUser;

const account = {
  displayName: currentUser ? currentUser.displayName : 'Profile', // Set default display name if currentUser or its displayName is undefined
  email: currentUser ? currentUser.email : '',
  photoURL: currentUser && currentUser.photoURL ? currentUser.photoURL : '/assets/images/avatars/avatar_default.png',
};

export default account;

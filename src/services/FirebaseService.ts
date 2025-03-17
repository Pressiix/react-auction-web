import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import { initializeApp } from "firebase/app";
// import type { Analytics } from "firebase/analytics";
// import { getAnalytics } from "firebase/analytics";
import type { Auth, User, UserCredential } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
  FacebookAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  Database,
  get,
  getDatabase,
  ref,
  set,
  push,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { UserInfo } from "../types/user";

export class FirebaseService {
  private static firebaseApp: FirebaseApp | null = null;
  private static firebaseAuth: Auth | null = null;
  private static database: Database | null = null;
  // private static firebaseAnalytics: Analytics | null = null;

  // Initialize Firebase with provided configuration
  public static async initialize(config: FirebaseOptions): Promise<void> {
    this.firebaseApp = initializeApp(config);
    this.firebaseAuth = getAuth(this.firebaseApp);
    this.database = getDatabase(this.firebaseApp);

    // if (typeof window !== "undefined") {
    //   this.firebaseAnalytics = getAnalytics(this.firebaseApp);
    // }
  }

  // Ensure Firebase services are initialized before using them
  public static ensureInitialized(): void {
    if (!this.firebaseAuth || !this.database) {
      throw new Error(
        "Firebase is not initialized. Call FirebaseService.initialize() first.",
      );
    }
  }

  // Get Firebase App instance
  public static getFirebaseApp(): FirebaseApp | null {
    return this.firebaseApp;
  }

  // Get Firebase Analytics instance
  // public static getFirebaseAnalytics(): Analytics | null {
  //   return this.firebaseAnalytics;
  // }

  // Get Firebase Auth instance
  public static getFirebaseAuth(): Auth | null {
    return this.firebaseAuth;
  }

  public static getFirebaseDatabase(): Database | null {
    return this.database;
  }

  // Database Methods
  public static async addDocument(path: string, data: any): Promise<string> {
    this.ensureInitialized();
    try {
      const newRef = push(ref(this.database!, path));
      await set(newRef, data); // Set data at the new reference instead of root path
      return newRef.key!;
    } catch (error) {
      throw new Error(
        "Error adding document to Database: " + (error as Error).message,
      );
    }
  }

  public static async setDocument(
    path: string,
    id: string,
    data: any,
  ): Promise<void> {
    this.ensureInitialized();
    try {
      await set(ref(this.database!, `${path}/${id}`), data);
    } catch (error) {
      throw new Error(
        "Error setting document in Database: " + (error as Error).message,
      );
    }
  }

  public static async getDocuments(
    path: string,
    whereClause: { [key: string]: any } = {},
    limit?: number,
  ): Promise<any[]> {
    this.ensureInitialized();
    try {
      const dbRef = ref(this.database!, path);
      let snapshot;

      if (Object.keys(whereClause).length > 0) {
        const [firstKey, firstValue] = Object.entries(whereClause)[0];
        const dbQuery = query(
          dbRef,
          orderByChild(firstKey),
          equalTo(firstValue),
        );
        snapshot = await get(dbQuery);

        // Filter results for additional conditions
        let results: Array<{ id: string } & { [key: string]: any }> = [];
        if (snapshot.exists()) {
          results = Object.entries(snapshot.val())
            .map(([id, value]) => ({
              ...(value as object),
              id,
            }))
            .filter((item: { [key: string]: any }) => {
              // Check all remaining conditions
              return Object.entries(whereClause).every(
                ([key, value]) => item[key] === value,
              );
            });

          // Apply limit if specified
          if (limit && limit > 0) {
            results = results.slice(0, limit);
          }
        }
        return results;
      } else {
        snapshot = await get(dbRef);
        if (snapshot.exists()) {
          let results = Object.entries(snapshot.val()).map(([id, value]) => ({
            ...(value as object),
            id,
          }));

          // Apply limit if specified
          if (limit && limit > 0) {
            results = results.slice(0, limit);
          }
          return results;
        }
      }
      return [];
    } catch (error) {
      throw new Error(
        "Error fetching documents from Database: " + (error as Error).message,
      );
    }
  }

  public static async getDocumentById(path: string, id: string): Promise<any> {
    this.ensureInitialized();
    try {
      const snapshot = await get(ref(this.database!, `${path}/${id}`));
      if (snapshot.exists()) {
        return { id, ...snapshot.val() };
      } else {
        throw new Error("No document found.");
      }
    } catch (error) {
      throw new Error(
        "Error fetching document from Database: " + (error as Error).message,
      );
    }
  }

  // User Signup with email and password
  public static async signup(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    this.ensureInitialized();
    try {
      return await createUserWithEmailAndPassword(
        this.firebaseAuth!,
        email,
        password,
      );
    } catch (error: any) {
      throw new Error(this.mapFirebaseAuthError(error.code));
    }
  }

  // User Sign-In with email and password
  public static async signIn(
    email: string,
    password: string,
  ): Promise<UserCredential> {
    this.ensureInitialized();
    try {
      const user = await signInWithEmailAndPassword(
        this.firebaseAuth!,
        email,
        password,
      );
      return user;
    } catch (error: any) {
      throw new Error(this.mapFirebaseAuthError(error.code));
    }
  }

  // Sign out the current user
  public static async signOut(): Promise<void> {
    this.ensureInitialized();
    try {
      await this.firebaseAuth!.signOut();
    } catch (error) {
      throw new Error("Error signing out.");
    }
  }

  // Get current user
  public static async getCurrentUser(): Promise<User | null> {
    this.ensureInitialized();
    return this.firebaseAuth!.currentUser;
  }

  // Check if the user is authenticated
  public static async isAuthenticated(): Promise<boolean> {
    this.ensureInitialized();
    return !!this.firebaseAuth!.currentUser;
  }

  // Send a verification email to the current user
  public static async sendVerificationEmail(): Promise<void> {
    this.ensureInitialized();
    try {
      if (this.firebaseAuth!.currentUser) {
        await sendEmailVerification(this.firebaseAuth!.currentUser);
      } else {
        throw new Error("No user is currently signed in.");
      }
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  public static async sendPasswordRecoveryEmail(email: string): Promise<void> {
    this.ensureInitialized();
    try {
      await sendPasswordResetEmail(this.firebaseAuth!, email);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Update current user's profile information
  public static async updateUserProfile({
    displayName = "",
    photoURL = "",
  }: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    this.ensureInitialized();
    try {
      if (this.firebaseAuth!.currentUser) {
        await updateProfile(this.firebaseAuth!.currentUser, {
          displayName,
          photoURL,
        });
      } else {
        throw new Error("No user is currently signed in.");
      }
    } catch (error) {
      throw new Error("Error updating profile.");
    }
  }

  // Map Firebase Auth errors to custom messages
  public static mapFirebaseAuthError(errorCode: string): string {
    switch (errorCode) {
      case "auth/invalid-credential":
        return "The email address or password is incorrect. Please check again.";
      case "auth/email-already-in-use":
        return "The email address is already in use by another account.";
      case "auth/weak-password":
        return "The password is too weak.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      default:
        return "An unknown error occurred. Please try again.";
    }
  }

  public static async loginWithFacebook(): Promise<any> {
    this.ensureInitialized();
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(this.firebaseAuth!, provider);
      // Facebook Access Token
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (result.user) {
        const { photoURL, displayName } = result.user;
        // Use the access token to get additional user info like the avatar
        if (accessToken) {
          // Fetch user profile image from Facebook Graph API
          const response = await fetch(
            `https://graph.facebook.com/me?fields=picture.type(large)&access_token=${accessToken}`,
          );
          const data = await response.json();
          const { providerData } = result.user;

          if (providerData.length) {
            const facebookUserInfo = {
              ...providerData[0],
              avatarUrl: data.picture?.data?.url,
            };

            const { avatarUrl, displayName: facebookDisplayName } =
              facebookUserInfo;
            if (
              (avatarUrl && avatarUrl !== photoURL) ||
              facebookDisplayName !== displayName
            ) {
              await this.updateUserProfile({
                photoURL: avatarUrl,
                displayName:
                  facebookDisplayName ??
                  `user-${Math.floor(Math.random() * 1e14)
                    .toString()
                    .padStart(14, "0")}`,
              });
            }
          }
        }
      }

      return { ...result.user, accessToken };
    } catch (error) {
      throw new Error(
        "Error logging in with Facebook: " + (error as Error).message,
      );
    }
  }

  public static async loginWithGoogle(): Promise<any> {
    this.ensureInitialized();
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    try {
      const result = await signInWithPopup(this.firebaseAuth!, provider);

      return result.user;
    } catch (error) {
      throw new Error(
        "Error logging in with Google: " + (error as Error).message,
      );
    }
  }

  public static async fetchSignInMethodsForEmail(
    email: string,
  ): Promise<boolean> {
    this.ensureInitialized();
    try {
      const signInMethods = await fetchSignInMethodsForEmail(
        this.firebaseAuth!,
        email,
      );
      // If the array has any elements, the user exists
      return signInMethods.length > 0;
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw error;
    }
  }

  public static async GetUserInfoById(uid: string): Promise<UserInfo | null> {
    this.ensureInitialized();
    try {
      const users = await this.getDocuments("/users", { uid });
      if (users.length > 0) {
        return users[0] as UserInfo;
      }
      return null;
    } catch (error) {
      throw new Error("Error fetching user info: " + (error as Error).message);
    }
  }

  public static async checkDuplicateUsername(
    username: string,
  ): Promise<boolean> {
    this.ensureInitialized();
    try {
      const users = await this.getDocuments("/users", { username });
      return users.length > 0;
    } catch (error) {
      throw new Error("Error checking username: " + (error as Error).message);
    }
  }
}

// ============================================================
// JEEVA NADI BOOKS
// FIREBASE CONFIGURATION
// PRODUCTION EDITION
//
// Authentication:
// • Google
// • Phone OTP
//
// Firestore:
// • users
// • orders
// • participants
//
// Payment:
// • UPI
// • UTR / Transaction ID
//
// IMPORTANT:
// • Customer UPI ID is NOT required.
// • UTR is the only customer payment reference.
// • Firebase Storage is NOT used.
// • Payment screenshots are NOT stored.
// ============================================================

"use strict";


// ============================================================
// FIREBASE APP
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


// ============================================================
// FIREBASE AUTH
// ============================================================

import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    signOut,
    updateProfile,
    reload
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ============================================================
// FIRESTORE
// ============================================================

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIGURATION
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyC3_2DjUY-LoC6aeTcA5ldn1xiqeqY0mg4",

    authDomain:
        "jeevanadi-biblequiz-2026.firebaseapp.com",

    projectId:
        "jeevanadi-biblequiz-2026",

    storageBucket:
        "jeevanadi-biblequiz-2026.firebasestorage.app",

    messagingSenderId:
        "861542495844",

    appId:
        "1:861542495844:web:55b1c9b8ca6691e3c95171",

    measurementId:
        "G-YLLMSQV1L8"

};


// ============================================================
// VALIDATE FIREBASE CONFIG
// ============================================================

function validateFirebaseConfig() {

    const requiredFields = [

        "apiKey",
        "authDomain",
        "projectId",
        "messagingSenderId",
        "appId"

    ];


    const missingFields =
        requiredFields.filter(
            (field) => {

                const value =
                    String(
                        firebaseConfig[field] || ""
                    ).trim();


                return (

                    !value ||

                    value.includes(
                        "YOUR_"
                    ) ||

                    value.includes(
                        "PASTE_"
                    ) ||

                    value.includes(
                        "XXXXXXXX"
                    )

                );

            }
        );


    if (
        missingFields.length > 0
    ) {

        const error =
            new Error(
                "Firebase configuration is incomplete: " +
                missingFields.join(", ")
            );


        error.code =
            "FIREBASE_CONFIG_INVALID";


        throw error;

    }

}


validateFirebaseConfig();


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app =
    initializeApp(
        firebaseConfig
    );


const auth =
    getAuth(
        app
    );


const db =
    getFirestore(
        app
    );


// ============================================================
// GOOGLE AUTH PROVIDER
// ============================================================

const googleProvider =
    new GoogleAuthProvider();


googleProvider.setCustomParameters({

    prompt:
        "select_account"

});


// ============================================================
// FIRESTORE COLLECTIONS
// ============================================================

const FIRESTORE_COLLECTIONS = {

    users:
        "users",

    orders:
        "orders",

    participants:
        "participants"

};


// ============================================================
// AUTH PERSISTENCE
// ============================================================

const persistenceReady =
    setPersistence(
        auth,
        browserLocalPersistence
    )
    .catch(
        (error) => {

            console.error(
                "Firebase persistence failed:",
                error
            );

            throw error;

        }
    );


// ============================================================
// AUTH STATE
// ============================================================

let currentFirebaseUser =
    null;


let resolveAuthStateReady =
    null;


const authStateReady =
    new Promise(
        (resolve) => {

            resolveAuthStateReady =
                resolve;

        }
    );


const unsubscribeAuthState =
    onAuthStateChanged(

        auth,

        (user) => {

            currentFirebaseUser =
                user || null;


            if (
                resolveAuthStateReady
            ) {

                resolveAuthStateReady(
                    currentFirebaseUser
                );


                resolveAuthStateReady =
                    null;

            }


            console.log(

                user

                    ? "Jeeva Nadi Firebase: user authenticated."

                    : "Jeeva Nadi Firebase: user signed out."

            );

        }

    );


// ============================================================
// CURRENT USER
// ============================================================

function getCurrentUser() {

    return (

        auth.currentUser ||

        currentFirebaseUser ||

        null

    );

}


// ============================================================
// REQUIRE AUTHENTICATED USER
// ============================================================

function requireAuthenticatedUser() {

    const user =
        getCurrentUser();


    if (!user) {

        const error =
            new Error(
                "Please sign in before continuing."
            );


        error.code =
            "AUTH_REQUIRED";


        throw error;

    }


    return user;

}


// ============================================================
// OBJECT VALIDATION
// ============================================================

function validateObject(
    value,
    errorCode
) {

    if (

        !value ||

        typeof value !==
            "object" ||

        Array.isArray(value)

    ) {

        const error =
            new Error(
                errorCode
            );


        error.code =
            errorCode;


        throw error;

    }

}


// ============================================================
// USER PROFILE
// ============================================================

async function saveUserProfile(
    uid,
    profileData = {}
) {

    if (!uid) {

        const error =
            new Error(
                "Firebase UID is required."
            );


        error.code =
            "UID_REQUIRED";


        throw error;

    }


    validateObject(
        profileData,
        "INVALID_PROFILE_DATA"
    );


    const userRef =
        doc(

            db,

            FIRESTORE_COLLECTIONS.users,

            uid

        );


    const existing =
        await getDoc(
            userRef
        );


    const data = {

        ...profileData,

        uid,

        updatedAt:
            serverTimestamp()

    };


    if (
        !existing.exists()
    ) {

        data.createdAt =
            serverTimestamp();

    }


    await setDoc(

        userRef,

        data,

        {
            merge: true
        }

    );


    return true;

}


// ============================================================
// GET USER PROFILE
// ============================================================

async function getUserProfile(
    uid
) {

    if (!uid) {
        return null;
    }


    const userRef =
        doc(

            db,

            FIRESTORE_COLLECTIONS.users,

            uid

        );


    const snapshot =
        await getDoc(
            userRef
        );


    if (
        !snapshot.exists()
    ) {

        return null;

    }


    return {

        id:
            snapshot.id,

        ...snapshot.data()

    };

}


// ============================================================
// UPDATE USER PROFILE
// ============================================================

async function updateUserProfile(
    uid,
    profileData = {}
) {

    if (!uid) {

        const error =
            new Error(
                "Firebase UID is required."
            );


        error.code =
            "UID_REQUIRED";


        throw error;

    }


    validateObject(

        profileData,

        "INVALID_PROFILE_DATA"

    );


    const userRef =
        doc(

            db,

            FIRESTORE_COLLECTIONS.users,

            uid

        );


    const snapshot =
        await getDoc(
            userRef
        );


    if (
        !snapshot.exists()
    ) {

        const error =
            new Error(
                "User profile not found."
            );


        error.code =
            "USER_PROFILE_NOT_FOUND";


        throw error;

    }


    await updateDoc(

        userRef,

        {

            ...profileData,

            updatedAt:
                serverTimestamp()

        }

    );


    return true;

}


// ============================================================
// LOCATION
// ============================================================

function getCurrentLocation() {

    return new Promise(

        (resolve, reject) => {

            if (
                !navigator.geolocation
            ) {

                const error =
                    new Error(
                        "Location is not supported by this browser."
                    );


                error.code =
                    "LOCATION_NOT_SUPPORTED";


                reject(error);

                return;

            }


            navigator.geolocation.getCurrentPosition(

                (position) => {

                    resolve({

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude,

                        accuracy:
                            position.coords.accuracy

                    });

                },


                () => {

                    const error =
                        new Error(
                            "Unable to get your location."
                        );


                    error.code =
                        "LOCATION_ERROR";


                    reject(error);

                },


                {

                    enableHighAccuracy:
                        true,

                    timeout:
                        10000,

                    maximumAge:
                        300000

                }

            );

        }

    );

}


// ============================================================
// CREATE ORDER
// ============================================================

async function createOrder(
    orderData
) {

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const user =
        requireAuthenticatedUser();


    // --------------------------------------------------------
    // VALIDATE ORDER OBJECT
    // --------------------------------------------------------

    validateObject(

        orderData,

        "INVALID_ORDER_DATA"

    );


    // --------------------------------------------------------
    // ITEMS
    // --------------------------------------------------------

    const items =
        Array.isArray(
            orderData.items
        )

            ? orderData.items

            : [];


    if (
        items.length === 0
    ) {

        const error =
            new Error(
                "Your cart is empty."
            );


        error.code =
            "ORDER_ITEMS_REQUIRED";


        throw error;

    }


    // --------------------------------------------------------
    // CUSTOMER
    // --------------------------------------------------------

    const customer =

        (

            orderData.customer &&

            typeof orderData.customer ===
                "object" &&

            !Array.isArray(
                orderData.customer
            )

        )

            ? orderData.customer

            : {};


    // --------------------------------------------------------
    // SHIPPING ADDRESS
    // --------------------------------------------------------

    const shippingAddress =

        (

            orderData.shippingAddress &&

            typeof orderData.shippingAddress ===
                "object" &&

            !Array.isArray(
                orderData.shippingAddress
            )

        )

            ? orderData.shippingAddress

            : {};


    // --------------------------------------------------------
    // PRICING
    // --------------------------------------------------------

    const pricing =

        (

            orderData.pricing &&

            typeof orderData.pricing ===
                "object" &&

            !Array.isArray(
                orderData.pricing
            )

        )

            ? orderData.pricing

            : {};


    // --------------------------------------------------------
    // PAYMENT
    // --------------------------------------------------------

    const payment =

        (

            orderData.payment &&

            typeof orderData.payment ===
                "object" &&

            !Array.isArray(
                orderData.payment
            )

        )

            ? orderData.payment

            : {};


    // ========================================================
    // NORMALIZE ITEMS
    // ========================================================

    const normalizedItems =

        items.map(

            (item) => {

                const price =
                    Number(
                        item.price
                    ) || 0;


                const quantity =
                    Math.max(

                        1,

                        Math.floor(

                            Number(
                                item.quantity
                            ) || 1

                        )

                    );


                return {

                    id:
                        String(
                            item.id || ""
                        ),

                    key:
                        String(
                            item.key ||
                            item.id ||
                            ""
                        ),

                    name:
                        String(

                            item.name ||

                            item.product ||

                            item.title ||

                            "Book"

                        ),

                    product:
                        String(

                            item.product ||

                            item.name ||

                            item.title ||

                            "Book"

                        ),

                    image:
                        String(
                            item.image || ""
                        ),

                    variant:
                        String(
                            item.variant || ""
                        ),

                    price,

                    quantity,

                    lineTotal:
                        price * quantity

                };

            }

        );


    // ========================================================
    // PAYMENT VALIDATION
    //
    // IMPORTANT:
    // Only UTR is required.
    //
    // NO CUSTOMER UPI ID.
    // ========================================================

    const utr =
        String(
            payment.utr || ""
        ).trim();


    if (!utr) {

        const error =
            new Error(
                "UPI transaction ID / UTR is required."
            );


        error.code =
            "UTR_REQUIRED";


        throw error;

    }


    // ========================================================
    // ORDER DOCUMENT
    // ========================================================

    const orderDocumentData = {

        // ----------------------------------------------------
        // USER
        // ----------------------------------------------------

        userId:
            user.uid,


        source:
            "Jeeva Nadi Books",


        orderVersion:
            4,


        // ----------------------------------------------------
        // CUSTOMER
        // ----------------------------------------------------

        customer: {

            uid:
                user.uid,

            name:
                String(

                    customer.name ||

                    user.displayName ||

                    ""

                ),

            email:
                String(

                    customer.email ||

                    user.email ||

                    ""

                ),

            phone:
                String(

                    customer.phone ||

                    user.phoneNumber ||

                    ""

                )

        },


        // ----------------------------------------------------
        // SHIPPING ADDRESS
        // ----------------------------------------------------

        shippingAddress: {

            address:
                String(
                    shippingAddress.address || ""
                ),

            city:
                String(
                    shippingAddress.city || ""
                ),

            state:
                String(
                    shippingAddress.state || ""
                ),

            pincode:
                String(
                    shippingAddress.pincode || ""
                )

        },


        // ----------------------------------------------------
        // ITEMS
        // ----------------------------------------------------

        items:
            normalizedItems,


        // ----------------------------------------------------
        // PRICING
        // ----------------------------------------------------

        pricing: {

            subtotal:
                Number(
                    pricing.subtotal
                ) || 0,

            delivery:
                Number(
                    pricing.delivery
                ) || 0,

            packaging:
                Number(
                    pricing.packaging
                ) || 0,

            total:
                Number(
                    pricing.total
                ) || 0,

            currency:
                "INR"

        },


        // ====================================================
        // PAYMENT
        // ====================================================
        //
        // Customer enters:
        //
        // UTR / Transaction ID
        //
        // That's all.
        // ====================================================

        paymentMethod:
            "UPI",

        paymentStatus:
            "Pending",


        payment: {

            method:
                "UPI",

            utr:
                utr

        },


        // ----------------------------------------------------
        // ORDER STATUS
        // ----------------------------------------------------

        status:
            "Pending",


        // ----------------------------------------------------
        // VERIFICATION
        // ----------------------------------------------------

        verification: {

            status:
                "Pending",

            reviewedBy:
                "",

            reviewedAt:
                null,

            rejectionReason:
                ""

        },


        // ----------------------------------------------------
        // NOTES
        // ----------------------------------------------------

        notes:
            String(
                orderData.notes || ""
            ),


        // ----------------------------------------------------
        // LOCATION
        // ----------------------------------------------------

        location:
            orderData.location || null,


        // ----------------------------------------------------
        // TIMESTAMPS
        // ----------------------------------------------------

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };


    // ========================================================
    // ADD ORDER TO FIRESTORE
    // ========================================================

    const ordersRef =
        collection(

            db,

            FIRESTORE_COLLECTIONS.orders

        );


    const document =
        await addDoc(

            ordersRef,

            orderDocumentData

        );


    // ========================================================
    // RETURN ORDER ID
    // ========================================================

    return {

        id:
            document.id,

        orderId:
            document.id

    };

}


// ============================================================
// GET USER ORDERS
// ============================================================

async function getUserOrders(
    uid
) {

    const user =
        requireAuthenticatedUser();


    if (!uid) {
        return [];
    }


    if (
        uid !== user.uid
    ) {

        const error =
            new Error(
                "You do not have permission to access these orders."
            );


        error.code =
            "ORDER_ACCESS_DENIED";


        throw error;

    }


    const ordersRef =
        collection(

            db,

            FIRESTORE_COLLECTIONS.orders

        );


    const ordersQuery =
        query(

            ordersRef,

            where(
                "userId",
                "==",
                uid
            ),

            orderBy(
                "createdAt",
                "desc"
            )

        );


    const snapshot =
        await getDocs(
            ordersQuery
        );


    return snapshot.docs.map(

        (order) => ({

            id:
                order.id,

            ...order.data()

        })

    );

}


// ============================================================
// GET SINGLE ORDER
// ============================================================

async function getOrder(
    orderId
) {

    const user =
        requireAuthenticatedUser();


    if (!orderId) {
        return null;
    }


    const orderRef =
        doc(

            db,

            FIRESTORE_COLLECTIONS.orders,

            orderId

        );


    const snapshot =
        await getDoc(
            orderRef
        );


    if (
        !snapshot.exists()
    ) {

        return null;

    }


    const data =
        snapshot.data();


    if (
        data.userId !==
        user.uid
    ) {

        const error =
            new Error(
                "You do not have permission to access this order."
            );


        error.code =
            "ORDER_ACCESS_DENIED";


        throw error;

    }


    return {

        id:
            snapshot.id,

        ...data

    };

}


// ============================================================
// EXPORTS
// ============================================================

export {

    // --------------------------------------------------------
    // Firebase
    // --------------------------------------------------------

    app,
    auth,
    db,


    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    GoogleAuthProvider,

    googleProvider,

    signInWithPopup,

    signInWithPhoneNumber,

    RecaptchaVerifier,

    onAuthStateChanged,

    signOut,

    updateProfile,

    reload,


    // --------------------------------------------------------
    // Persistence
    // --------------------------------------------------------

    persistenceReady,


    // --------------------------------------------------------
    // Auth State
    // --------------------------------------------------------

    authStateReady,

    getCurrentUser,

    requireAuthenticatedUser,

    unsubscribeAuthState,


    // --------------------------------------------------------
    // Firestore
    // --------------------------------------------------------

    doc,

    setDoc,

    getDoc,

    updateDoc,

    serverTimestamp,

    collection,

    addDoc,

    query,

    where,

    orderBy,

    getDocs,


    // --------------------------------------------------------
    // Users
    // --------------------------------------------------------

    saveUserProfile,

    getUserProfile,

    updateUserProfile,


    // --------------------------------------------------------
    // Location
    // --------------------------------------------------------

    getCurrentLocation,


    // --------------------------------------------------------
    // Orders
    // --------------------------------------------------------

    createOrder,

    getUserOrders,

    getOrder,


    // --------------------------------------------------------
    // Constants
    // --------------------------------------------------------

    FIRESTORE_COLLECTIONS

};


// ============================================================
// DEBUG API
// ============================================================

window.JeevaNadiFirebase = {

    app,

    auth,

    db,

    getCurrentUser,

    authStateReady

};


// ============================================================
// CONSOLE
// ============================================================

console.log(
    "Jeeva Nadi Firebase: configuration loaded."
);

console.log(
    "Jeeva Nadi Firebase: Google + Phone OTP."
);

console.log(
    "Jeeva Nadi Firebase: Firestore users + orders."
);

console.log(
    "Jeeva Nadi Firebase: UPI + UTR payment system."
);

console.log(
    "Jeeva Nadi Firebase: Customer UPI ID is NOT required."
);

console.log(
    "Jeeva Nadi Firebase: Storage disabled."
);

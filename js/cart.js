/* =========================================================
   JEEVA NADI BOOKS
   PREMIUM SHOPPING CART ENGINE
   ---------------------------------------------------------
   File:
   js/cart.js

   Works with:
   • books.js
   • cart.html
   • cart-page.js
   • firebase-config.js

   IMPORTANT:
   • Firebase is initialized ONLY by firebase-config.js
   • This file does NOT initialize Firebase again
   • UID-specific carts
   • Google / Phone authentication compatible
   • Fast cart startup
========================================================= */

"use strict";


/* =========================================================
   STORAGE
========================================================= */

const USER_CART_PREFIX =
    "JeevaNadiCart_UID_";


const LEGACY_CART_KEYS = [

    "JeevaNadiCart",

    "jeevaNadiCart",

    "jeeva-nadi-cart",

    "booksCart",

    "cart"

];


/* =========================================================
   INTERNAL STATE
========================================================= */

let cartItems = [];

let currentUser = null;

let authenticationReady = false;

let authStarted = false;

let clearVersion = 0;


/* =========================================================
   EVENT HELPER
========================================================= */

function emit(
    eventName,
    detail = {}
) {

    try {

        window.dispatchEvent(

            new CustomEvent(

                eventName,

                {
                    detail
                }

            )

        );

    }

    catch (error) {

        console.warn(
            "Jeeva Nadi Cart: Event error",
            error
        );

    }

}


/* =========================================================
   STORAGE KEY
========================================================= */

function getUserCartKey(
    uid
) {

    return (

        USER_CART_PREFIX +

        String(uid)

    );

}


/* =========================================================
   READ STORAGE
========================================================= */

function readStorage(
    key
) {

    try {

        const raw =
            localStorage.getItem(
                key
            );


        if (!raw) {

            return [];

        }


        const parsed =
            JSON.parse(
                raw
            );


        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch (error) {

        console.warn(
            "Jeeva Nadi Cart: Invalid cart storage.",
            key,
            error
        );


        return [];

    }

}


/* =========================================================
   WRITE STORAGE
========================================================= */

function writeStorage(
    key,
    value
) {

    try {

        localStorage.setItem(

            key,

            JSON.stringify(
                value
            )

        );


        return true;

    }

    catch (error) {

        console.error(
            "Jeeva Nadi Cart: Unable to save cart.",
            error
        );


        return false;

    }

}


/* =========================================================
   REMOVE STORAGE
========================================================= */

function removeStorage(
    key
) {

    try {

        localStorage.removeItem(
            key
        );

    }

    catch (error) {

        console.warn(
            "Jeeva Nadi Cart: Unable to remove storage.",
            key,
            error
        );

    }

}


/* =========================================================
   PRICE NORMALIZATION
========================================================= */

function normalizePrice(
    value
) {

    if (

        typeof value === "number" &&

        Number.isFinite(value)

    ) {

        return value;

    }


    if (

        typeof value === "string"

    ) {

        const cleaned =

            value

                .replace(
                    /[₹,\s]/g,
                    ""
                )

                .trim();


        const number =
            Number(
                cleaned
            );


        if (
            Number.isFinite(number)
        ) {

            return number;

        }

    }


    return 0;

}


/* =========================================================
   QUANTITY NORMALIZATION
========================================================= */

function normalizeQuantity(
    value
) {

    const number =
        Number(
            value
        );


    if (

        !Number.isFinite(number) ||

        number < 1

    ) {

        return 1;

    }


    return Math.floor(
        number
    );

}


/* =========================================================
   FALLBACK IMAGE
========================================================= */

function getFallbackImage(
    item
) {

    const text =

        String(

            item?.product ??

            item?.name ??

            item?.title ??

            ""

        )

            .toLowerCase()

            .trim();


    /*
     * Telugu Bible
     */

    if (
        text.includes(
            "telugu bible"
        )
    ) {

        return (
            "images/Telugu Bible BSI 1.png"
        );

    }


    /*
     * Songs Book
     */

    if (

        text.includes(
            "songs book"
        ) ||

        text.includes(
            "jeeva nadi songs"
        )

    ) {

        return (
            "images/Songs Book 1.jpg"
        );

    }


    return "";

}


/* =========================================================
   IMAGE NORMALIZATION
========================================================= */

function normalizeImage(
    item
) {

    const image =

        String(

            item?.image ??

            item?.img ??

            item?.imageUrl ??

            item?.thumbnail ??

            ""

        )

            .trim();


    if (image) {

        return image;

    }


    return getFallbackImage(
        item
    );

}


/* =========================================================
   ITEM NORMALIZATION
========================================================= */

function normalizeItem(
    rawItem,
    index = 0
) {

    if (

        !rawItem ||

        typeof rawItem !==
            "object"

    ) {

        return null;

    }


    const product =

        String(

            rawItem.product ??

            rawItem.name ??

            rawItem.title ??

            ""

        )

            .trim();


    if (!product) {

        return null;

    }


    const variant =

        String(

            rawItem.variant ??

            rawItem.subtitle ??

            ""

        )

            .trim();


    const price =

        normalizePrice(

            rawItem.price ??

            rawItem.amount ??

            rawItem.unitPrice ??

            0

        );


    const quantity =

        normalizeQuantity(

            rawItem.quantity ??

            rawItem.qty ??

            1

        );


    /*
     * Stable cart key.
     */

    const key =

        String(

            rawItem.key ??

            rawItem.id ??

            (

                variant

                    ? `${product}::${variant}`

                    : `${product}::default`

            )

        )

            .trim();


    const image =
        normalizeImage(
            rawItem
        );


    const category =

        String(

            rawItem.category ??

            "books"

        )

            .trim();


    return {

        key,

        id:

            String(

                rawItem.id ??

                key ??

                `item-${index}`

            )

                .trim(),


        product,


        name:

            String(

                rawItem.name ??

                product

            )

                .trim(),


        title:

            String(

                rawItem.title ??

                rawItem.name ??

                product

            )

                .trim(),


        variant,


        price,


        quantity,


        image,


        category,


        language:

            String(

                rawItem.language ??

                ""

            )

                .trim(),


        design:

            String(

                rawItem.design ??

                ""

            )

                .trim(),


        size:

            String(

                rawItem.size ??

                ""

            )

                .trim(),


        lineTotal:

            price * quantity

    };

}


/* =========================================================
   NORMALIZE ARRAY
========================================================= */

function normalizeItems(
    list
) {

    if (
        !Array.isArray(list)
    ) {

        return [];

    }


    return list

        .map(

            (
                item,
                index
            ) =>

                normalizeItem(
                    item,
                    index
                )

        )

        .filter(Boolean);

}


/* =========================================================
   GET ITEMS
========================================================= */

function getItems() {

    return cartItems.map(

        item => ({
            ...item
        })

    );

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    if (
        !currentUser?.uid
    ) {

        return false;

    }


    return writeStorage(

        getUserCartKey(
            currentUser.uid
        ),

        getItems()

    );

}


/* =========================================================
   REMOVE LEGACY CARTS
========================================================= */

function removeLegacyCarts() {

    LEGACY_CART_KEYS.forEach(

        key => {

            removeStorage(
                key
            );

        }

    );

}


/* =========================================================
   LOAD USER CART
========================================================= */

function loadUserCart() {

    if (
        !currentUser?.uid
    ) {

        cartItems = [];

        return;

    }


    const versionAtStart =
        clearVersion;


    const uidKey =

        getUserCartKey(
            currentUser.uid
        );


    /*
     * FIRST:
     * Load user's permanent UID cart.
     */

    let loaded =

        normalizeItems(

            readStorage(
                uidKey
            )

        );


    /*
     * LEGACY MIGRATION
     *
     * Only when UID cart is empty.
     */

    if (
        loaded.length === 0
    ) {

        for (

            const legacyKey
            of LEGACY_CART_KEYS

        ) {

            const legacyItems =

                normalizeItems(

                    readStorage(
                        legacyKey
                    )

                );


            if (
                legacyItems.length > 0
            ) {

                loaded =
                    legacyItems;

                break;

            }

        }

    }


    /*
     * Prevent stale asynchronous
     * loading from restoring a
     * cart after Clear Cart.
     */

    if (

        versionAtStart !==
        clearVersion

    ) {

        return;

    }


    cartItems =
        loaded;


    /*
     * Save to UID cart.
     */

    saveCart();


    /*
     * Remove old generic carts.
     */

    removeLegacyCarts();


    emit(

        "jeevaNadiCartReady",

        {
            uid:
                currentUser.uid
        }

    );


    emit(

        "jeevaNadiCartUpdated",

        {
            items:
                getItems()
        }

    );

}


/* =========================================================
   CLEAR CART
========================================================= */

function clearCart() {

    clearVersion++;


    cartItems = [];


    if (
        currentUser?.uid
    ) {

        removeStorage(

            getUserCartKey(
                currentUser.uid
            )

        );

    }


    removeLegacyCarts();


    emit(

        "jeevaNadiCartUpdated",

        {
            items: []
        }

    );


    emit(

        "jeevaNadiCartCleared",

        {
            items: []
        }

    );


    return true;

}


/* =========================================================
   FIND ITEM
========================================================= */

function findItem(
    identifier
) {

    const id =

        String(
            identifier ?? ""
        );


    return (

        cartItems.find(

            item =>

                item.key === id ||

                item.id === id

        ) ||

        null

    );

}


/* =========================================================
   ADD
========================================================= */

function add(
    productData
) {

    /*
     * Authentication is still loading.
     */

    if (
        !authenticationReady
    ) {

        emit(

            "jeevaNadiCartAuthRequired",

            {
                reason:
                    "authentication-loading"
            }

        );


        return false;

    }


    /*
     * User is signed out.
     */

    if (
        !currentUser
    ) {

        emit(

            "jeevaNadiCartAuthRequired",

            {
                reason:
                    "signed-out"
            }

        );


        return false;

    }


    const incoming =

        normalizeItem(
            productData
        );


    if (!incoming) {

        return false;

    }


    if (
        incoming.price <= 0
    ) {

        return false;

    }


    const existingIndex =

        cartItems.findIndex(

            item =>

                item.key ===
                incoming.key

        );


    /*
     * EXISTING PRODUCT
     */

    if (
        existingIndex !== -1
    ) {

        const existing =

            cartItems[
                existingIndex
            ];


        existing.quantity =

            normalizeQuantity(
                existing.quantity
            ) +

            incoming.quantity;


        existing.price =
            incoming.price;


        existing.product =
            incoming.product;


        existing.name =
            incoming.name;


        existing.title =
            incoming.title;


        existing.variant =
            incoming.variant;


        existing.category =
            incoming.category;


        existing.language =
            incoming.language;


        existing.design =
            incoming.design;


        existing.size =
            incoming.size;


        /*
         * IMPORTANT:
         * Preserve incoming image.
         */

        if (
            incoming.image
        ) {

            existing.image =
                incoming.image;

        }


        existing.lineTotal =

            existing.price *

            existing.quantity;

    }


    /*
     * NEW PRODUCT
     */

    else {

        cartItems.push(
            incoming
        );

    }


    saveCart();


    emit(

        "jeevaNadiCartUpdated",

        {
            items:
                getItems()
        }

    );


    return true;

}


/* =========================================================
   REMOVE
========================================================= */

function remove(
    identifier
) {

    const id =

        String(
            identifier ?? ""
        );


    const oldLength =
        cartItems.length;


    cartItems =

        cartItems.filter(

            item =>

                item.key !== id &&

                item.id !== id

        );


    if (

        cartItems.length ===
        oldLength

    ) {

        return false;

    }


    saveCart();


    emit(

        "jeevaNadiCartUpdated",

        {
            items:
                getItems()
        }

    );


    return true;

}


/* =========================================================
   UPDATE QUANTITY
========================================================= */

function updateQuantity(
    identifier,
    quantity
) {

    const id =

        String(
            identifier ?? ""
        );


    const index =

        cartItems.findIndex(

            item =>

                item.key === id ||

                item.id === id

        );


    if (
        index === -1
    ) {

        return false;

    }


    const number =
        Number(
            quantity
        );


    /*
     * Zero means remove.
     */

    if (

        !Number.isFinite(number) ||

        number <= 0

    ) {

        return remove(
            id
        );

    }


    cartItems[index].quantity =

        Math.max(

            1,

            Math.floor(
                number
            )

        );


    cartItems[index].lineTotal =

        cartItems[index].price *

        cartItems[index].quantity;


    saveCart();


    emit(

        "jeevaNadiCartUpdated",

        {
            items:
                getItems()
        }

    );


    return true;

}


/* =========================================================
   INCREMENT
========================================================= */

function increment(
    identifier
) {

    const item =
        findItem(
            identifier
        );


    if (!item) {

        return false;

    }


    return updateQuantity(

        item.key,

        item.quantity + 1

    );

}


/* =========================================================
   DECREMENT
========================================================= */

function decrement(
    identifier
) {

    const item =
        findItem(
            identifier
        );


    if (!item) {

        return false;

    }


    if (
        item.quantity <= 1
    ) {

        return remove(
            item.key
        );

    }


    return updateQuantity(

        item.key,

        item.quantity - 1

    );

}


/* =========================================================
   COUNT
========================================================= */

function count() {

    return cartItems.reduce(

        (
            total,
            item
        ) =>

            total +

            normalizeQuantity(
                item.quantity
            ),

        0

    );

}


/* =========================================================
   SUBTOTAL
========================================================= */

function subtotal() {

    return cartItems.reduce(

        (
            total,
            item
        ) =>

            total +

            (

                normalizePrice(
                    item.price
                ) *

                normalizeQuantity(
                    item.quantity
                )

            ),

        0

    );

}


/* =========================================================
   TOTAL
========================================================= */

function total() {

    /*
     * Delivery currently FREE.
     */

    return subtotal();

}


/* =========================================================
   AUTH STATUS
========================================================= */

function isAuthenticated() {

    return Boolean(
        currentUser
    );

}


function isAuthenticationReady() {

    return Boolean(
        authenticationReady
    );

}


function getUser() {

    return currentUser;

}


/* =========================================================
   FIREBASE AUTH
   ---------------------------------------------------------
   IMPORTANT:
   firebase-config.js already initializes Firebase.
   We ONLY consume its exported auth state.
========================================================= */

async function initializeAuthentication() {

    if (
        authStarted
    ) {

        return;

    }


    authStarted =
        true;


    /*
     * Try to use the already initialized
     * JeevaNadiFirebase API first.
     */

    try {

        /*
         * firebase-config.js is imported here
         * only once by this module.
         *
         * It does NOT initialize Firebase again.
         */

        const firebase =

            await import(
                "./firebase-config.js"
            );


        /*
         * Use the existing Firebase Auth
         * state promise.
         */

        if (
            firebase.authStateReady
        ) {

            try {

                await firebase.authStateReady;

            }

            catch (error) {

                console.warn(

                    "Jeeva Nadi Cart: Auth state promise failed.",

                    error

                );

            }

        }


        /*
         * Get the current Firebase user.
         */

        if (

            typeof firebase.getCurrentUser ===
            "function"

        ) {

            currentUser =
                firebase.getCurrentUser();

        }

        else if (
            firebase.auth
        ) {

            currentUser =
                firebase.auth.currentUser ||
                null;

        }


        authenticationReady =
            true;


        /*
         * If already signed in,
         * load that user's cart.
         */

        if (
            currentUser
        ) {

            loadUserCart();

        }

        else {

            cartItems = [];


            emit(

                "jeevaNadiCartReady",

                {
                    uid: null
                }

            );


            emit(

                "jeevaNadiCartUpdated",

                {
                    items: []
                }

            );

        }


        emit(

            "jeevaNadiAuthChanged",

            {
                user:
                    currentUser
            }

        );


        /*
         * IMPORTANT:
         *
         * firebase-config.js already has
         * its own onAuthStateChanged listener.
         *
         * We add our own listener using
         * the SAME auth instance.
         */

        if (

            firebase.auth &&

            typeof firebase.onAuthStateChanged ===
                "function"

        ) {

            firebase.onAuthStateChanged(

                firebase.auth,

                user => {

                    const previousUid =
                        currentUser?.uid ||
                        null;


                    const newUid =
                        user?.uid ||
                        null;


                    currentUser =
                        user ||
                        null;


                    authenticationReady =
                        true;


                    /*
                     * USER LOGGED IN
                     */

                    if (
                        currentUser
                    ) {

                        /*
                         * Only reload if
                         * the user actually changed.
                         */

                        if (
                            previousUid !==
                            newUid
                        ) {

                            loadUserCart();

                        }

                    }


                    /*
                     * USER LOGGED OUT
                     */

                    else {

                        cartItems = [];


                        emit(

                            "jeevaNadiCartReady",

                            {
                                uid: null
                            }

                        );


                        emit(

                            "jeevaNadiCartUpdated",

                            {
                                items: []
                            }

                        );

                    }


                    emit(

                        "jeevaNadiAuthChanged",

                        {
                            user:
                                currentUser
                        }

                    );

                }

            );

        }

    }

    catch (error) {

        console.error(

            "Jeeva Nadi Cart: Firebase connection failed.",

            error

        );


        authenticationReady =
            true;


        currentUser =
            null;


        cartItems =
            [];


        emit(

            "jeevaNadiCartReady",

            {
                uid: null
            }

        );


        emit(

            "jeevaNadiCartUpdated",

            {
                items: []
            }

        );


        emit(

            "jeevaNadiAuthChanged",

            {
                user: null
            }

        );

    }

}


/* =========================================================
   PUBLIC API
========================================================= */

window.JeevaNadiCart = {

    add,

    remove,

    update:
        updateQuantity,

    updateQuantity,

    increment,

    decrement,

    find:
        findItem,

    getItems,

    items:
        getItems,

    count,

    subtotal,

    total,

    clear:
        clearCart,

    isAuthenticated,

    isAuthenticationReady,

    getUser,

    getCurrentUser:
        getUser

};


/* =========================================================
   START
========================================================= */

initializeAuthentication();


console.log(
    "Jeeva Nadi Cart Engine loaded successfully."
); 
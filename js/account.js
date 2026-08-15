/* ============================================================
   JEEVA NADI BOOKS
   CUSTOMER ACCOUNT ENGINE
   ------------------------------------------------------------
   FILE:
   js/account.js

   AUTHENTICATION
   ------------------------------------------------------------
   • Google
   • Phone OTP
   • Firebase Local Persistence
   • Shared Firebase Auth instance

   FIRESTORE
   ------------------------------------------------------------
   • users/{uid}
   • orders

   IMPORTANT ARCHITECTURE
   ------------------------------------------------------------

       firebase-config.js
              │
              ├── auth
              ├── db
              └── Firebase functions
                     │
             ┌───────┼────────┐
             │       │        │
         account.js books.js cart.js
             │       │        │
             └───────┼────────┘
                     │
                 SAME USER

   DO NOT INITIALIZE FIREBASE AGAIN IN THIS FILE.

============================================================ */

"use strict";


/* ============================================================
   FIREBASE IMPORTS
   ------------------------------------------------------------
   IMPORTANT:
   Everything comes from firebase-config.js.

   This prevents account.js from creating a second Firebase
   Auth instance.
============================================================ */

import {
    auth,
    db,

    googleProvider,

    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    signOut,

    onAuthStateChanged,

    collection,
    query,
    where,
    getDocs,

    doc,
    setDoc,
    getDoc,

    serverTimestamp,

    updateProfile,
    reload,

    getCurrentUser

} from "./firebase-config.js";


/* ============================================================
   CONFIGURATION
============================================================ */

const ACCOUNT_CONFIG = Object.freeze({

    collections: Object.freeze({

        users:
            "users",

        orders:
            "orders"

    }),

    fallbackAvatar:
        "images/account.png",

    defaultProductImage:
        "images/books/english-bible.jpg"

});


/* ============================================================
   STATE
============================================================ */

const state = {

    started:
        false,

    authObserverStarted:
        false,

    authReady:
        false,

    currentUser:
        null,

    currentProfile:
        null,

    confirmationResult:
        null,

    recaptcha:
        null,

    googleBusy:
        false,

    otpBusy:
        false,

    verifyBusy:
        false,

    logoutBusy:
        false,

    ordersLoading:
        false,

    lastOrders:
        []

};


/* ============================================================
   DOM HELPERS
============================================================ */

function $(id) {

    return document.getElementById(id);

}


function show(element) {

    if (!element) {
        return;
    }

    element.classList.remove(
        "hidden"
    );

    element.hidden = false;

}


function hide(element) {

    if (!element) {
        return;
    }

    element.classList.add(
        "hidden"
    );

    element.hidden = true;

}


function showOnly(id) {

    const views = [

        "loadingView",

        "loginView",

        "otpView",

        "dashboardView"

    ];


    views.forEach(
        viewId => {

            const element =
                $(viewId);


            if (!element) {
                return;
            }


            if (
                viewId === id
            ) {

                show(element);

            }

            else {

                hide(element);

            }

        }
    );

}


/* ============================================================
   STRING HELPERS
============================================================ */

function clean(value) {

    return String(
        value ?? ""
    ).trim();

}


function normalize(value) {

    return clean(
        value
    ).toLowerCase();

}


/* ============================================================
   SAFE HTML
============================================================ */

function escapeHtml(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   MESSAGES
============================================================ */

function showMessage(
    id,
    message,
    type = "error"
) {

    const element =
        $(id);


    if (!element) {
        return;
    }


    element.textContent =
        clean(message);


    element.className =
        `message ${type}`;


    if (message) {

        show(element);

    }

    else {

        hide(element);

    }

}


function clearMessage(id) {

    const element =
        $(id);


    if (!element) {
        return;
    }


    element.textContent =
        "";


    element.className =
        "message";


    hide(element);

}


/* ============================================================
   BUTTON LOADING
============================================================ */

function setButtonLoading(
    button,
    loading,
    text = "Please wait..."
) {

    if (!button) {
        return;
    }


    if (loading) {

        if (
            !button.dataset.originalHtml
        ) {

            button.dataset.originalHtml =
                button.innerHTML;

        }


        button.disabled =
            true;


        button.setAttribute(
            "aria-busy",
            "true"
        );


        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>${escapeHtml(text)}</span>
        `;

    }

    else {

        button.disabled =
            false;


        button.removeAttribute(
            "aria-busy"
        );


        if (
            button.dataset.originalHtml
        ) {

            button.innerHTML =
                button.dataset.originalHtml;

        }

    }

}


/* ============================================================
   FIREBASE AVAILABILITY
============================================================ */

function isFirebaseReady() {

    return Boolean(
        auth &&
        db
    );

}


/* ============================================================
   AUTH ERROR MESSAGES
============================================================ */

function friendlyAuthError(
    error
) {

    const code =
        error?.code || "";


    const messages = {

        "auth/popup-closed-by-user":
            "Google sign-in was cancelled.",

        "auth/popup-blocked":
            "Your browser blocked the Google sign-in window.",

        "auth/cancelled-popup-request":
            "A Google sign-in window is already open.",

        "auth/network-request-failed":
            "Network connection failed. Please check your internet connection.",

        "auth/invalid-phone-number":
            "Please enter a valid 10-digit Indian mobile number.",

        "auth/missing-phone-number":
            "Please enter your mobile number.",

        "auth/invalid-verification-code":
            "The OTP you entered is incorrect.",

        "auth/code-expired":
            "This OTP has expired. Please request a new OTP.",

        "auth/too-many-requests":
            "Too many attempts were made. Please wait and try again.",

        "auth/quota-exceeded":
            "Firebase SMS quota has been reached.",

        "auth/billing-not-enabled":
            "Phone OTP requires Firebase billing to be enabled.",

        "auth/operation-not-allowed":
            "This authentication method is not enabled in Firebase.",

        "auth/user-disabled":
            "This account has been disabled.",

        "auth/unauthorized-domain":
            "This website domain is not authorized in Firebase.",

        "auth/invalid-credential":
            "The authentication credential is invalid.",

        "auth/account-exists-with-different-credential":
            "An account already exists with another sign-in method.",

        "auth/internal-error":
            "Firebase returned an internal authentication error.",

        "auth/weak-password":
            "The password is too weak.",

        "auth/email-already-in-use":
            "This email address is already registered."

    };


    return (

        messages[code] ||

        error?.message ||

        "Authentication failed. Please try again."

    );

}


/* ============================================================
   FIRESTORE ERROR
============================================================ */

function friendlyFirestoreError(
    error
) {

    const code =
        error?.code || "";


    if (
        code.includes(
            "permission-denied"
        )
    ) {

        return (
            "Your account does not have permission to access this information."
        );

    }


    if (
        code.includes(
            "unauthenticated"
        )
    ) {

        return (
            "Your session has expired. Please sign in again."
        );

    }


    if (
        code.includes(
            "unavailable"
        )
    ) {

        return (
            "Firebase is temporarily unavailable. Please try again."
        );

    }


    return (
        "Unable to load your account information right now."
    );

}


/* ============================================================
   PROVIDER NAME
============================================================ */

function getProviderName(
    user
) {

    const providers =
        user?.providerData || [];


    if (
        providers.some(
            provider =>
                provider.providerId ===
                "google.com"
        )
    ) {

        return "Google";

    }


    if (
        providers.some(
            provider =>
                provider.providerId ===
                "phone"
        )
    ) {

        return "Phone OTP";

    }


    if (
        providers.some(
            provider =>
                provider.providerId ===
                "password"
        )
    ) {

        return "Email / Password";

    }


    return providers.length
        ? "Firebase Authentication"
        : "—";

}


/* ============================================================
   PHONE NORMALIZATION
============================================================ */

function normalizePhone(
    value
) {

    if (!value) {
        return "";
    }


    const digits =
        String(value)
            .replace(
                /\D/g,
                ""
            );


    if (
        digits.length === 10
    ) {

        return (
            `+91 ${digits}`
        );

    }


    if (
        digits.length === 12 &&
        digits.startsWith("91")
    ) {

        return (
            `+91 ${digits.slice(2)}`
        );

    }


    return String(
        value
    );

}


/* ============================================================
   PHONE INPUT
============================================================ */

function getPhoneNumber() {

    const input =
        $("phoneNumber");


    if (!input) {

        const error =
            new Error(
                "Mobile number field is missing."
            );


        error.code =
            "INVALID_PHONE";


        throw error;

    }


    const digits =
        input.value
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                10
            );


    input.value =
        digits;


    if (
        !/^[6-9]\d{9}$/.test(
            digits
        )
    ) {

        const error =
            new Error(
                "Please enter a valid 10-digit Indian mobile number."
            );


        error.code =
            "INVALID_PHONE";


        throw error;

    }


    return (
        `+91${digits}`
    );

}


/* ============================================================
   CURRENT USER
   ------------------------------------------------------------
   IMPORTANT:
   Always use the auth instance from firebase-config.js.
============================================================ */

function getAuthenticatedUser() {

    return (
        auth?.currentUser ||
        state.currentUser ||
        getCurrentUser?.() ||
        null
    );

}


/* ============================================================
   PROFILE SYNC
============================================================ */

async function syncUserProfile(
    user
) {

    if (
        !user ||
        !db
    ) {

        return null;

    }


    try {

        const userRef =
            doc(
                db,
                ACCOUNT_CONFIG.collections.users,
                user.uid
            );


        const existing =
            await getDoc(
                userRef
            );


        const profile = {

            uid:
                user.uid,

            name:
                user.displayName ||
                "",

            email:
                user.email ||
                "",

            phone:
                user.phoneNumber ||
                "",

            photoURL:
                user.photoURL ||
                "",

            provider:
                getProviderName(
                    user
                ),

            updatedAt:
                serverTimestamp(),

            lastLoginAt:
                serverTimestamp()

        };


        if (
            !existing.exists()
        ) {

            profile.createdAt =
                serverTimestamp();

        }


        await setDoc(
            userRef,
            profile,
            {
                merge: true
            }
        );


        return {
            ...profile,
            uid:
                user.uid
        };

    }

    catch (error) {

        console.warn(
            "Jeeva Nadi Books: profile sync skipped.",
            error
        );


        return null;

    }

}


/* ============================================================
   LOAD USER PROFILE
============================================================ */

async function loadUserProfile(
    user
) {

    if (
        !user ||
        !db
    ) {

        return null;

    }


    try {

        const userRef =
            doc(
                db,
                ACCOUNT_CONFIG.collections.users,
                user.uid
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

    catch (error) {

        console.warn(
            "Jeeva Nadi Books: profile loading failed.",
            error
        );


        return null;

    }

}


/* ============================================================
   CUSTOMER UI
============================================================ */

function populateCustomer(
    user,
    profile = null
) {

    if (!user) {
        return;
    }


    const name =
        profile?.name ||

        user.displayName ||

        "Customer";


    const email =
        profile?.email ||

        user.email ||

        "";


    const phone =
        profile?.phone ||

        user.phoneNumber ||

        "";


    const photo =
        profile?.photoURL ||

        user.photoURL ||

        ACCOUNT_CONFIG.fallbackAvatar;


    /* --------------------------------------------------------
       AVATAR
    -------------------------------------------------------- */

    const avatar =
        $("customerAvatar");


    if (avatar) {

        avatar.src =
            photo;


        avatar.alt =
            `${name} profile picture`;


        avatar.onerror =
            () => {

                avatar.onerror =
                    null;

                avatar.src =
                    ACCOUNT_CONFIG.fallbackAvatar;

            };

    }


    /* --------------------------------------------------------
       MAIN NAME
    -------------------------------------------------------- */

    const customerName =
        $("customerName");


    if (customerName) {

        customerName.textContent =
            name;

    }


    /* --------------------------------------------------------
       SUBTITLE
    -------------------------------------------------------- */

    const subtitle =
        $("customerSubtitle");


    if (subtitle) {

        subtitle.textContent =

            email ||

            normalizePhone(
                phone
            ) ||

            "Your Jeeva Nadi Books account";

    }


    /* --------------------------------------------------------
       PROFILE FIELDS
    -------------------------------------------------------- */

    const fields = {

        profileName:
            name,

        profileEmail:
            email || "—",

        profilePhone:
            normalizePhone(
                phone
            ) || "—",

        profileProvider:
            getProviderName(
                user
            ),

        profileUid:
            user.uid || "—"

    };


    Object.entries(
        fields
    ).forEach(
        ([id, value]) => {

            const element =
                $(id);


            if (element) {

                element.textContent =
                    value;

            }

        }
    );

}


/* ============================================================
   DATE HELPERS
============================================================ */

function getOrderDate(
    order
) {

    const value =

        order?.createdAt ??

        order?.created_at ??

        order?.orderDate ??

        order?.date ??

        order?.timestamp;


    if (!value) {

        return 0;

    }


    if (
        typeof value.toMillis ===
        "function"
    ) {

        return value.toMillis();

    }


    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate().getTime();

    }


    if (
        typeof value.seconds ===
        "number"
    ) {

        return (
            value.seconds *
            1000
        );

    }


    if (
        typeof value._seconds ===
        "number"
    ) {

        return (
            value._seconds *
            1000
        );

    }


    if (
        value instanceof Date
    ) {

        return value.getTime();

    }


    if (
        typeof value ===
        "number"
    ) {

        return value;

    }


    const parsed =
        Date.parse(
            String(value)
        );


    return Number.isNaN(
        parsed
    )
        ? 0
        : parsed;

}


/* ============================================================
   FORMAT DATE
============================================================ */

function formatOrderDate(
    order
) {

    const timestamp =
        getOrderDate(
            order
        );


    if (!timestamp) {

        return "Date unavailable";

    }


    try {

        return new Date(
            timestamp
        ).toLocaleDateString(
            "en-IN",
            {
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"
            }
        );

    }

    catch {

        return "Date unavailable";

    }

}


/* ============================================================
   CURRENCY
============================================================ */

function formatCurrency(
    amount
) {

    const number =
        Number(
            amount
        );


    const safe =
        Number.isFinite(
            number
        )
            ? number
            : 0;


    return (
        `₹${safe.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits:
                    2
            }
        )}`
    );

}


/* ============================================================
   ORDER ITEMS
============================================================ */

function getOrderItems(
    order
) {

    if (
        Array.isArray(
            order?.items
        )
    ) {

        return order.items;

    }


    if (
        Array.isArray(
            order?.products
        )
    ) {

        return order.products;

    }


    return [];

}


/* ============================================================
   ITEM NAME
============================================================ */

function getItemName(
    item
) {

    return (

        item?.name ||

        item?.product ||

        item?.title ||

        item?.bookName ||

        item?.variant ||

        "Jeeva Nadi Book"

    );

}


/* ============================================================
   ITEM VARIANT
============================================================ */

function getItemVariant(
    item
) {

    const product =
        clean(

            item?.product ||

            item?.name ||

            item?.title ||

            ""

        );


    const variant =
        clean(

            item?.variant ||

            item?.edition ||

            item?.language ||

            item?.bookType ||

            ""

        );


    if (
        !variant
    ) {

        return "";

    }


    if (
        normalize(
            variant
        ) ===
        normalize(
            product
        )
    ) {

        return "";

    }


    return variant;

}


/* ============================================================
   ITEM QUANTITY
============================================================ */

function getItemQuantity(
    item
) {

    const quantity =
        Number(
            item?.quantity
        );


    if (
        Number.isFinite(
            quantity
        ) &&
        quantity > 0
    ) {

        return quantity;

    }


    return 1;

}


/* ============================================================
   ITEM PRICE
============================================================ */

function getItemPrice(
    item
) {

    const candidates = [

        item?.price,

        item?.unitPrice,

        item?.salePrice,

        item?.amount,

        item?.productPrice

    ];


    for (
        const value of candidates
    ) {

        const number =
            Number(
                value
            );


        if (
            Number.isFinite(
                number
            )
        ) {

            return number;

        }

    }


    return 0;

}


/* ============================================================
   ORDER TOTAL
============================================================ */

function getOrderTotal(
    order
) {

    const candidates = [

        order?.pricing?.total,

        order?.total,

        order?.amount,

        order?.grandTotal

    ];


    for (
        const value of candidates
    ) {

        const number =
            Number(
                value
            );


        if (
            Number.isFinite(
                number
            )
        ) {

            return number;

        }

    }


    return getOrderItems(
        order
    ).reduce(

        (
            total,
            item
        ) =>

            total +

            (
                getItemPrice(
                    item
                ) *

                getItemQuantity(
                    item
                )
            ),

        0

    );

}


/* ============================================================
   ORDER STATUS
============================================================ */

function getOrderStatus(
    order
) {

    return (

        order?.status ||

        order?.orderStatus ||

        order?.paymentStatus ||

        order?.payment?.status ||

        order?.verification?.status ||

        "Pending"

    );

}


/* ============================================================
   PAYMENT STATUS
============================================================ */

function getPaymentStatus(
    order
) {

    return (

        order?.paymentStatus ||

        order?.payment?.status ||

        order?.verification?.status ||

        "Pending"

    );

}


/* ============================================================
   STATUS CLASS
============================================================ */

function getStatusClass(
    status
) {

    const value =
        normalize(
            status ||
            "pending"
        );


    if (

        value.includes(
            "reject"
        ) ||

        value.includes(
            "cancel"
        ) ||

        value.includes(
            "fail"
        )

    ) {

        return "rejected";

    }


    if (

        value.includes(
            "complete"
        ) ||

        value.includes(
            "approve"
        ) ||

        value.includes(
            "success"
        ) ||

        value.includes(
            "deliver"
        ) ||

        value.includes(
            "paid"
        )

    ) {

        return "completed";

    }


    if (
        value.includes(
            "process"
        )
    ) {

        return "processing";

    }


    if (

        value.includes(
            "await"
        ) ||

        value.includes(
            "verification"
        )

    ) {

        return "verification";

    }


    return "pending";

}


/* ============================================================
   STATUS ICON
============================================================ */

function getStatusIcon(
    status
) {

    const value =
        normalize(
            status
        );


    if (

        value.includes(
            "reject"
        ) ||

        value.includes(
            "cancel"
        ) ||

        value.includes(
            "fail"
        )

    ) {

        return "fa-circle-xmark";

    }


    if (

        value.includes(
            "complete"
        ) ||

        value.includes(
            "approve"
        ) ||

        value.includes(
            "success"
        ) ||

        value.includes(
            "deliver"
        ) ||

        value.includes(
            "paid"
        )

    ) {

        return "fa-circle-check";

    }


    if (

        value.includes(
            "process"
        ) ||

        value.includes(
            "pending"
        ) ||

        value.includes(
            "await"
        ) ||

        value.includes(
            "verification"
        )

    ) {

        return "fa-clock";

    }


    return "fa-circle-info";

}


/* ============================================================
   PENDING ORDER
============================================================ */

function isPendingOrder(
    order
) {

    const status =

        `${getOrderStatus(
            order
        )} ${getPaymentStatus(
            order
        )}`.toLowerCase();


    return (

        status.includes(
            "pending"
        ) ||

        status.includes(
            "processing"
        ) ||

        status.includes(
            "verification"
        ) ||

        status.includes(
            "awaiting"
        )

    );

}


/* ============================================================
   SUMMARY RESET
============================================================ */

function resetSummary() {

    const values = {

        totalOrders:
            "0",

        totalBooks:
            "0",

        totalSpent:
            "₹0",

        pendingOrders:
            "0"

    };


    Object.entries(
        values
    ).forEach(
        ([id, value]) => {

            const element =
                $(id);


            if (element) {

                element.textContent =
                    value;

            }

        }
    );

}


/* ============================================================
   SUMMARY
============================================================ */

function updateSummary(
    orders
) {

    const safeOrders =
        Array.isArray(
            orders
        )
            ? orders
            : [];


    const totalBooks =
        safeOrders.reduce(

            (
                total,
                order
            ) =>

                total +

                getOrderItems(
                    order
                ).reduce(

                    (
                        count,
                        item
                    ) =>

                        count +

                        getItemQuantity(
                            item
                        ),

                    0

                ),

            0

        );


    const totalSpent =
        safeOrders.reduce(

            (
                total,
                order
            ) =>

                total +

                getOrderTotal(
                    order
                ),

            0

        );


    const pending =
        safeOrders.filter(
            isPendingOrder
        ).length;


    const values = {

        totalOrders:
            String(
                safeOrders.length
            ),

        totalBooks:
            String(
                totalBooks
            ),

        totalSpent:
            formatCurrency(
                totalSpent
            ),

        pendingOrders:
            String(
                pending
            )

    };


    Object.entries(
        values
    ).forEach(
        ([id, value]) => {

            const element =
                $(id);


            if (element) {

                element.textContent =
                    value;

            }

        }
    );

}


/* ============================================================
   FALLBACK IMAGE
============================================================ */

function createFallbackImage(
    title
) {

    const safeTitle =
        String(
            title ||
            "BOOK"
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            );


    const svg = `

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="240"
            height="300"
            viewBox="0 0 240 300"
        >

            <defs>

                <linearGradient
                    id="jnFallbackBg"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >

                    <stop
                        offset="0%"
                        stop-color="#071936"
                    />

                    <stop
                        offset="100%"
                        stop-color="#153b6f"
                    />

                </linearGradient>

            </defs>


            <rect
                width="240"
                height="300"
                rx="18"
                fill="url(#jnFallbackBg)"
            />


            <circle
                cx="120"
                cy="92"
                r="42"
                fill="#d6ad43"
                opacity=".15"
            />


            <text
                x="120"
                y="105"
                text-anchor="middle"
                fill="#f0d27b"
                font-size="42"
                font-family="Arial"
            >
                ✦
            </text>


            <text
                x="120"
                y="180"
                text-anchor="middle"
                fill="#ffffff"
                font-size="15"
                font-weight="700"
                font-family="Arial"
            >
                ${safeTitle.slice(
                    0,
                    24
                )}
            </text>


            <text
                x="120"
                y="210"
                text-anchor="middle"
                fill="#d6ad43"
                font-size="11"
                font-family="Arial"
                letter-spacing="2"
            >
                JEEVA NADI BOOKS
            </text>

        </svg>

    `;


    return (

        "data:image/svg+xml;charset=UTF-8," +

        encodeURIComponent(
            svg
        )

    );

}


/* ============================================================
   PRODUCT IMAGE
============================================================ */

function getProductImage(
    item
) {

    const stored =

        item?.image ||

        item?.imageUrl ||

        item?.imageURL ||

        item?.productImage ||

        item?.thumbnail ||

        item?.photo;


    if (stored) {

        return String(
            stored
        );

    }


    const text = (

        `${getItemName(
            item
        )} ${getItemVariant(
            item
        )}`

    ).toLowerCase();


    if (

        text.includes(
            "telugu"
        ) &&

        text.includes(
            "bible"
        )

    ) {

        return (
            "images/books/telugu-bible-bsi.jpg"
        );

    }


    if (
        text.includes(
            "song"
        )
    ) {

        return (
            "images/books/songs-book.jpg"
        );

    }


    if (

        text.includes(
            "english"
        ) &&

        text.includes(
            "bible"
        )

    ) {

        return (
            "images/books/english-bible.jpg"
        );

    }


    if (
        text.includes(
            "cover"
        )
    ) {

        return (
            "images/books/bible-cover.jpg"
        );

    }


    if (
        text.includes(
            "calendar"
        )
    ) {

        return (
            "images/books/calendar.jpg"
        );

    }


    return createFallbackImage(
        getItemName(
            item
        )
    );

}


/* ============================================================
   ORDER ITEM
============================================================ */

function createOrderItem(
    item
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "order-item";


    const name =
        getItemName(
            item
        );


    const variant =
        getItemVariant(
            item
        );


    const quantity =
        getItemQuantity(
            item
        );


    const price =
        getItemPrice(
            item
        );


    const image =
        getProductImage(
            item
        );


    row.innerHTML = `

        <div class="order-item-image-wrap">

            <img
                class="order-item-image"
                alt="${escapeHtml(
                    name
                )}"
                loading="lazy"
            >

        </div>


        <div class="order-item-info">

            <div class="order-item-name">
                ${escapeHtml(
                    name
                )}
            </div>


            ${
                variant

                    ? `

                        <div class="order-item-variant">
                            ${escapeHtml(
                                variant
                            )}
                        </div>

                    `

                    : ""
            }


            <div class="order-item-price">

                ${
                    price > 0

                        ? `${formatCurrency(
                            price
                        )} each`

                        : "Price unavailable"
                }

            </div>

        </div>


        <div class="order-item-quantity">

            <span>×</span>

            <strong>
                ${quantity}
            </strong>

        </div>

    `;


    const imageElement =
        row.querySelector(
            ".order-item-image"
        );


    if (imageElement) {

        imageElement.src =
            image;


        imageElement.addEventListener(
            "error",
            () => {

                imageElement.onerror =
                    null;


                imageElement.src =
                    createFallbackImage(
                        name
                    );

            },
            {
                once:
                    true
            }
        );

    }


    return row;

}


/* ============================================================
   ORDER CARD
============================================================ */

function createOrderCard(
    order
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "order-card";


    const orderId =

        order?.id ||

        order?.orderId ||

        "Order";


    const status =
        getOrderStatus(
            order
        );


    const payment =
        getPaymentStatus(
            order
        );


    const items =
        getOrderItems(
            order
        );


    const safeItems =
        Array.isArray(
            items
        )
            ? items
            : [];


    const itemCount =
        safeItems.reduce(

            (
                total,
                item
            ) =>

                total +

                getItemQuantity(
                    item
                ),

            0

        );


    /* --------------------------------------------------------
       HEADER
    -------------------------------------------------------- */

    const header =
        document.createElement(
            "div"
        );


    header.className =
        "order-header";


    header.innerHTML = `

        <div class="order-header-left">

            <div class="order-number">

                <span class="order-label">
                    ORDER #
                </span>

                <strong>
                    ${escapeHtml(
                        orderId
                    )}
                </strong>

            </div>


            <div class="order-date">

                ${escapeHtml(
                    formatOrderDate(
                        order
                    )
                )}

            </div>

        </div>


        <div class="order-header-right">

            <div class="order-title">
                Jeeva Nadi Books Order
            </div>


            <div
                class="order-status ${getStatusClass(
                    status
                )}"
            >

                <i
                    class="fa-solid ${getStatusIcon(
                        status
                    )}"
                ></i>


                <span>
                    ${escapeHtml(
                        status
                    )}
                </span>

            </div>

        </div>

    `;


    card.appendChild(
        header
    );


    /* --------------------------------------------------------
       ITEMS
    -------------------------------------------------------- */

    const itemsContainer =
        document.createElement(
            "div"
        );


    itemsContainer.className =
        "order-items";


    if (
        safeItems.length === 0
    ) {

        itemsContainer.innerHTML = `

            <div class="order-item">

                <div class="order-item-image-wrap">

                    <img
                        class="order-item-image"
                        alt="Jeeva Nadi Book"
                    >

                </div>


                <div class="order-item-info">

                    <div class="order-item-name">
                        Jeeva Nadi Book
                    </div>


                    <div class="order-item-variant">
                        Product details unavailable
                    </div>

                </div>


                <div class="order-item-quantity">

                    ×

                    <strong>
                        1
                    </strong>

                </div>

            </div>

        `;


        const fallback =
            itemsContainer.querySelector(
                ".order-item-image"
            );


        if (fallback) {

            fallback.src =
                createFallbackImage(
                    "Jeeva Nadi Book"
                );

        }

    }

    else {

        safeItems.forEach(
            item => {

                itemsContainer.appendChild(
                    createOrderItem(
                        item
                    )
                );

            }
        );

    }


    card.appendChild(
        itemsContainer
    );


    /* --------------------------------------------------------
       FOOTER
    -------------------------------------------------------- */

    const paymentClass =
        getStatusClass(
            payment
        );


    const paymentIcon =
        getStatusIcon(
            payment
        );


    const footer =
        document.createElement(
            "div"
        );


    footer.className =
        "order-footer";


    footer.innerHTML = `

        <div class="order-footer-stat">

            <span class="order-footer-label">
                Items
            </span>


            <strong>

                ${itemCount}

                item${
                    itemCount === 1
                        ? ""
                        : "s"
                }

            </strong>

        </div>


        <div class="order-footer-stat">

            <span class="order-footer-label">
                Payment Status
            </span>


            <strong
                class="payment-status ${paymentClass}"
            >

                <i
                    class="fa-solid ${paymentIcon}"
                ></i>


                ${escapeHtml(
                    payment
                )}

            </strong>

        </div>


        <div class="order-total">

            <span>
                Order Total
            </span>


            <strong>

                ${formatCurrency(
                    getOrderTotal(
                        order
                    )
                )}

            </strong>

        </div>

    `;


    card.appendChild(
        footer
    );


    return card;

}


/* ============================================================
   RENDER ORDERS
============================================================ */

function renderOrders(
    orders
) {

    const list =
        $("ordersList");


    const empty =
        $("ordersEmpty");


    if (!list) {
        return;
    }


    list.replaceChildren();


    if (

        !Array.isArray(
            orders
        ) ||

        orders.length === 0

    ) {

        if (empty) {
            show(empty);
        }

        return;

    }


    if (empty) {
        hide(empty);
    }


    const fragment =
        document.createDocumentFragment();


    orders.forEach(
        order => {

            fragment.appendChild(
                createOrderCard(
                    order
                )
            );

        }
    );


    list.appendChild(
        fragment
    );

}


/* ============================================================
   ORDER ERROR
============================================================ */

function renderOrderError(
    message
) {

    const list =
        $("ordersList");


    const empty =
        $("ordersEmpty");


    if (empty) {
        hide(empty);
    }


    if (!list) {
        return;
    }


    list.innerHTML = `

        <div class="empty-orders">

            <div class="empty-icon">

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

            </div>


            <h3>
                Orders temporarily unavailable
            </h3>


            <p>
                ${escapeHtml(
                    message
                )}
            </p>

        </div>

    `;

}


/* ============================================================
   LOAD ORDERS
============================================================ */

async function loadOrders() {

    const user =
        getAuthenticatedUser();


    if (
        !user ||
        !db
    ) {

        resetSummary();

        renderOrders([]);

        return [];

    }


    if (
        state.ordersLoading
    ) {

        return (
            state.lastOrders
        );

    }


    state.ordersLoading =
        true;


    const loading =
        $("ordersLoading");


    if (loading) {
        show(loading);
    }


    try {

        /*
         * IMPORTANT:
         *
         * We query ONLY by userId.
         *
         * No orderBy() is used.
         *
         * Therefore no composite index is required.
         */

        const ordersQuery =
            query(

                collection(
                    db,
                    ACCOUNT_CONFIG.collections.orders
                ),

                where(
                    "userId",
                    "==",
                    user.uid
                )

            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        const orders =
            snapshot.docs.map(
                snapshotDoc => ({

                    id:
                        snapshotDoc.id,

                    ...snapshotDoc.data()

                })
            );


        orders.sort(
            (a, b) =>

                getOrderDate(
                    b
                ) -

                getOrderDate(
                    a
                )
        );


        state.lastOrders =
            orders;


        updateSummary(
            orders
        );


        renderOrders(
            orders
        );


        return orders;

    }

    catch (error) {

        console.error(
            "Jeeva Nadi Books: Order loading failed.",
            error
        );


        state.lastOrders =
            [];


        resetSummary();


        renderOrderError(
            friendlyFirestoreError(
                error
            )
        );


        return [];

    }

    finally {

        state.ordersLoading =
            false;


        if (loading) {
            hide(loading);
        }

    }

}


/* ============================================================
   RECAPTCHA CLEANUP
============================================================ */

function destroyRecaptcha() {

    if (
        state.recaptcha
    ) {

        try {

            state.recaptcha.clear();

        }

        catch (error) {

            console.warn(
                "Jeeva Nadi Books: reCAPTCHA cleanup warning.",
                error
            );

        }

    }


    state.recaptcha =
        null;


    const container =
        $("recaptcha-container");


    if (container) {

        container.innerHTML =
            "";

    }

}


/* ============================================================
   CREATE RECAPTCHA
============================================================ */

async function createRecaptcha() {

    if (!auth) {

        throw new Error(
            "Firebase Authentication is unavailable."
        );

    }


    destroyRecaptcha();


    const container =
        $("recaptcha-container");


    if (!container) {

        throw new Error(
            "reCAPTCHA container is missing."
        );

    }


    state.recaptcha =
        new RecaptchaVerifier(

            auth,

            "recaptcha-container",

            {

                size:
                    "invisible",


                callback:
                    () => {

                        console.log(
                            "Jeeva Nadi Books: reCAPTCHA verified."
                        );

                    },


                "expired-callback":
                    () => {

                        console.warn(
                            "Jeeva Nadi Books: reCAPTCHA expired."
                        );

                    },


                "error-callback":
                    error => {

                        console.warn(
                            "Jeeva Nadi Books: reCAPTCHA error.",
                            error
                        );

                    }

            }

        );


    await state.recaptcha.render();


    return (
        state.recaptcha
    );

}


/* ============================================================
   GOOGLE LOGIN
============================================================ */

async function handleGoogleLogin() {

    if (

        state.googleBusy ||

        !auth

    ) {

        return;

    }


    state.googleBusy =
        true;


    const button =
        $("googleLoginBtn");


    clearMessage(
        "loginMessage"
    );


    setButtonLoading(
        button,
        true,
        "Connecting..."
    );


    try {

        /*
         * THIS AUTH INSTANCE IS THE SAME INSTANCE
         * USED BY cart.js.
         */

        await signInWithPopup(
            auth,
            googleProvider
        );


        /*
         * Do not manually set state.currentUser.
         *
         * onAuthStateChanged() is the single
         * source of truth.
         */

    }

    catch (error) {

        console.error(
            "Jeeva Nadi Books: Google sign-in failed.",
            error
        );


        showMessage(
            "loginMessage",
            friendlyAuthError(
                error
            ),
            "error"
        );

    }

    finally {

        state.googleBusy =
            false;


        setButtonLoading(
            button,
            false
        );

    }

}


/* ============================================================
   SEND OTP
============================================================ */

async function sendOtp() {

    if (

        state.otpBusy ||

        !auth

    ) {

        return;

    }


    state.otpBusy =
        true;


    const button =
        $("sendOtpBtn");


    clearMessage(
        "loginMessage"
    );


    setButtonLoading(
        button,
        true,
        "Sending OTP..."
    );


    try {

        const phoneNumber =
            getPhoneNumber();


        const verifier =
            await createRecaptcha();


        state.confirmationResult =

            await signInWithPhoneNumber(

                auth,

                phoneNumber,

                verifier

            );


        const description =
            $("otpDescription");


        if (description) {

            description.textContent =

                `Enter the 6-digit OTP sent to ${normalizePhone(
                    phoneNumber
                )}.`;

        }


        const otp =
            $("otpCode");


        if (otp) {

            otp.value =
                "";

        }


        clearMessage(
            "otpMessage"
        );


        showOnly(
            "otpView"
        );


        setTimeout(
            () => {

                otp?.focus();

            },
            100
        );

    }

    catch (error) {

        console.error(
            "Jeeva Nadi Books: OTP sending failed.",
            error
        );


        destroyRecaptcha();


        if (
            error?.code ===
            "INVALID_PHONE"
        ) {

            showMessage(
                "loginMessage",
                error.message,
                "error"
            );

        }

        else {

            showMessage(
                "loginMessage",
                friendlyAuthError(
                    error
                ),
                "error"
            );

        }

    }

    finally {

        state.otpBusy =
            false;


        setButtonLoading(
            button,
            false
        );

    }

}


/* ============================================================
   VERIFY OTP
============================================================ */

async function verifyOtp() {

    if (
        state.verifyBusy
    ) {

        return;

    }


    const input =
        $("otpCode");


    const button =
        $("verifyOtpBtn");


    clearMessage(
        "otpMessage"
    );


    if (
        !state.confirmationResult
    ) {

        showMessage(

            "otpMessage",

            "This OTP session has expired. Please request a new OTP.",

            "error"

        );


        return;

    }


    const otp =
        String(
            input?.value ||
            ""
        )

            .replace(
                /\D/g,
                ""
            )

            .slice(
                0,
                6
            );


    if (input) {

        input.value =
            otp;

    }


    if (
        otp.length !== 6
    ) {

        showMessage(

            "otpMessage",

            "Please enter the complete 6-digit OTP.",

            "error"

        );


        return;

    }


    state.verifyBusy =
        true;


    setButtonLoading(
        button,
        true,
        "Verifying..."
    );


    try {

        /*
         * confirmationResult.confirm()
         * signs the user into THE SAME auth instance.
         */

        await state.confirmationResult.confirm(
            otp
        );


        state.confirmationResult =
            null;


        destroyRecaptcha();


        /*
         * onAuthStateChanged() handles the rest.
         */

    }

    catch (error) {

        console.error(
            "Jeeva Nadi Books: OTP verification failed.",
            error
        );


        showMessage(
            "otpMessage",
            friendlyAuthError(
                error
            ),
            "error"
        );

    }

    finally {

        state.verifyBusy =
            false;


        setButtonLoading(
            button,
            false
        );

    }

}


/* ============================================================
   RESEND OTP
============================================================ */

async function resendOtp() {

    if (
        state.otpBusy
    ) {

        return;

    }


    state.confirmationResult =
        null;


    destroyRecaptcha();


    showOnly(
        "loginView"
    );


    await sendOtp();

}


/* ============================================================
   CHANGE PHONE
============================================================ */

function changePhone() {

    state.confirmationResult =
        null;


    destroyRecaptcha();


    const otp =
        $("otpCode");


    if (otp) {

        otp.value =
            "";

    }


    clearMessage(
        "otpMessage"
    );


    showOnly(
        "loginView"
    );


    setTimeout(
        () => {

            $("phoneNumber")?.focus();

        },
        100
    );

}


/* ============================================================
   LOGOUT MODAL
============================================================ */

function openLogoutModal() {

    const modal =
        $("logoutModal");


    if (!modal) {

        performLogout();

        return;

    }


    show(modal);


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* ============================================================
   CLOSE LOGOUT MODAL
============================================================ */

function closeLogoutModal() {

    const modal =
        $("logoutModal");


    if (!modal) {

        return;

    }


    hide(modal);


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* ============================================================
   LOGOUT
============================================================ */

async function performLogout() {

    if (

        state.logoutBusy ||

        !auth

    ) {

        return;

    }


    state.logoutBusy =
        true;


    const button =
        $("confirmLogoutBtn");


    setButtonLoading(
        button,
        true,
        "Signing out..."
    );


    try {

        destroyRecaptcha();


        await signOut(
            auth
        );


        /*
         * The shared auth observer will now receive null.
         */


        state.currentUser =
            null;


        state.currentProfile =
            null;


        state.lastOrders =
            [];


        state.confirmationResult =
            null;


        resetSummary();


        closeLogoutModal();

    }

    catch (error) {

        console.error(
            "Jeeva Nadi Books: Logout failed.",
            error
        );


        showMessage(

            "loginMessage",

            friendlyAuthError(
                error
            ),

            "error"

        );

    }

    finally {

        state.logoutBusy =
            false;


        setButtonLoading(
            button,
            false
        );

    }

}


/* ============================================================
   SHOW LOGIN
============================================================ */

function showLogin() {

    state.currentUser =
        null;


    state.currentProfile =
        null;


    state.lastOrders =
        [];


    state.confirmationResult =
        null;


    resetSummary();


    showOnly(
        "loginView"
    );


    clearMessage(
        "otpMessage"
    );

}


/* ============================================================
   OPEN DASHBOARD
============================================================ */

async function openDashboard(
    user
) {

    if (!user) {

        showLogin();

        return;

    }


    state.currentUser =
        user;


    /*
     * Show dashboard immediately.
     *
     * Do not wait for Firestore profile/order loading
     * before displaying authenticated state.
     */

    showOnly(
        "dashboardView"
    );


    populateCustomer(
        user
    );


    try {

        const profile =
            await loadUserProfile(
                user
            );


        if (profile) {

            state.currentProfile =
                profile;


            populateCustomer(
                user,
                profile
            );

        }

        else {

            const createdProfile =
                await syncUserProfile(
                    user
                );


            if (
                createdProfile
            ) {

                state.currentProfile =
                    createdProfile;


                populateCustomer(
                    user,
                    createdProfile
                );

            }

        }

    }

    catch (error) {

        console.warn(
            "Jeeva Nadi Books: profile loading warning.",
            error
        );

    }


    await loadOrders();

}


/* ============================================================
   REFRESH ORDERS
============================================================ */

async function refreshOrders() {

    const user =
        getAuthenticatedUser();


    if (!user) {

        showLogin();

        return;

    }


    const buttons = [

        $("refreshOrdersBtn"),

        $("refreshOrdersBtnSecondary")

    ].filter(
        Boolean
    );


    buttons.forEach(
        button => {

            button.disabled =
                true;


            if (
                !button.dataset.oldHtml
            ) {

                button.dataset.oldHtml =
                    button.innerHTML;

            }


            button.innerHTML = `

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                <span>
                    Refreshing...
                </span>

            `;

        }
    );


    try {

        await loadOrders();

    }

    finally {

        buttons.forEach(
            button => {

                button.disabled =
                    false;


                if (
                    button.dataset.oldHtml
                ) {

                    button.innerHTML =
                        button.dataset.oldHtml;

                }

            }
        );

    }

}


/* ============================================================
   KEYBOARD INPUT
============================================================ */

function setupKeyboard() {

    const phone =
        $("phoneNumber");


    if (phone) {

        phone.addEventListener(
            "input",
            () => {

                phone.value =

                    phone.value

                        .replace(
                            /\D/g,
                            ""
                        )

                        .slice(
                            0,
                            10
                        );

            }
        );


        phone.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    sendOtp();

                }

            }
        );

    }


    const otp =
        $("otpCode");


    if (otp) {

        otp.addEventListener(
            "input",
            () => {

                otp.value =

                    otp.value

                        .replace(
                            /\D/g,
                            ""
                        )

                        .slice(
                            0,
                            6
                        );

            }
        );


        otp.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    verifyOtp();

                }

            }
        );

    }

}


/* ============================================================
   EVENT LISTENERS
============================================================ */

function setupEventListeners() {

    $("googleLoginBtn")
        ?.addEventListener(
            "click",
            handleGoogleLogin
        );


    $("sendOtpBtn")
        ?.addEventListener(
            "click",
            sendOtp
        );


    $("verifyOtpBtn")
        ?.addEventListener(
            "click",
            verifyOtp
        );


    $("resendOtpBtn")
        ?.addEventListener(
            "click",
            resendOtp
        );


    $("changePhoneBtn")
        ?.addEventListener(
            "click",
            changePhone
        );


    $("logoutBtn")
        ?.addEventListener(
            "click",
            openLogoutModal
        );


    $("cancelLogoutBtn")
        ?.addEventListener(
            "click",
            closeLogoutModal
        );


    $("confirmLogoutBtn")
        ?.addEventListener(
            "click",
            performLogout
        );


    $("logoutBackdrop")
        ?.addEventListener(
            "click",
            closeLogoutModal
        );


    $("refreshOrdersBtn")
        ?.addEventListener(
            "click",
            refreshOrders
        );


    $("refreshOrdersBtnSecondary")
        ?.addEventListener(
            "click",
            refreshOrders
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeLogoutModal();

            }

        }
    );


    setupKeyboard();

}


/* ============================================================
   AUTH OBSERVER
   ------------------------------------------------------------
   THIS IS THE MOST IMPORTANT PART.
============================================================ */

function startAuthObserver() {

    if (

        state.authObserverStarted ||

        !auth

    ) {

        return;

    }


    state.authObserverStarted =
        true;


    onAuthStateChanged(

        auth,

        async user => {

            state.authReady =
                true;


            state.currentUser =
                user ||
                null;


            console.log(

                user

                    ? "Jeeva Nadi Account: user authenticated."

                    : "Jeeva Nadi Account: user signed out."

            );


            /*
             * Notify the rest of the website.
             *
             * cart.js uses the SAME Firebase auth instance.
             */

            window.dispatchEvent(

                new CustomEvent(
                    "jeevaNadiAuthChanged",
                    {
                        detail: {
                            user:
                                user ||
                                null
                        }
                    }
                )

            );


            if (user) {

                await openDashboard(
                    user
                );

            }

            else {

                destroyRecaptcha();

                showLogin();

            }

        }

    );

}


/* ============================================================
   INITIALIZATION
============================================================ */

async function initializeAccountEngine() {

    if (
        state.started
    ) {

        return;

    }


    state.started =
        true;


    showOnly(
        "loadingView"
    );


    setupEventListeners();


    if (
        !isFirebaseReady()
    ) {

        console.error(
            "Jeeva Nadi Books: Shared Firebase instance is unavailable."
        );


        showOnly(
            "loginView"
        );


        showMessage(

            "loginMessage",

            "The account service could not initialize. Please check firebase-config.js.",

            "error"

        );


        return;

    }


    try {

        /*
         * firebase-config.js already configures:
         *
         * browserLocalPersistence
         *
         * Therefore we do NOT call setPersistence()
         * again here.
         */


        startAuthObserver();


        /*
         * If Firebase already knows the current user,
         * the observer will handle it.
         *
         * This fallback makes the account page robust
         * if currentUser is already populated.
         */

        const existingUser =
            auth.currentUser ||
            getCurrentUser?.() ||
            null;


        if (
            existingUser &&
            !state.currentUser
        ) {

            state.currentUser =
                existingUser;


            await openDashboard(
                existingUser
            );

        }

    }

    catch (error) {

        console.error(

            "Jeeva Nadi Books: Account initialization failed.",

            error

        );


        showOnly(
            "loginView"
        );


        showMessage(

            "loginMessage",

            friendlyAuthError(
                error
            ),

            "error"

        );

    }

}


/* ============================================================
   PUBLIC ACCOUNT API
============================================================ */

window.JeevaNadiAccount = {

    getCurrentUser() {

        return (
            auth?.currentUser ||
            state.currentUser ||
            null
        );

    },


    isAuthenticated() {

        return Boolean(
            auth?.currentUser ||
            state.currentUser
        );

    },


    isAuthReady() {

        return Boolean(
            state.authReady
        );

    },


    async refreshOrders() {

        return refreshOrders();

    },


    async loadOrders() {

        return loadOrders();

    },


    getState() {

        return {
            ...state
        };

    },


    logout() {

        return performLogout();

    }

};


/* ============================================================
   START
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(

        "DOMContentLoaded",

        initializeAccountEngine,

        {
            once:
                true
        }

    );

}

else {

    initializeAccountEngine();

}


/* ============================================================
   FINAL DIAGNOSTIC
============================================================ */

console.log(
    "Jeeva Nadi Account: Customer account engine loaded using shared Firebase Auth."
);

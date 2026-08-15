/* ============================================================
   JEEVA NADI BOOKS
   PREMIUM CUSTOMER ACCOUNT ENGINE
   ------------------------------------------------------------
   Firebase Authentication
   • Google
   • Phone OTP

   Firestore
   • users
   • orders

   IMPORTANT
   ------------------------------------------------------------
   Orders are queried only by userId.

   No Firestore orderBy() is used.
   Orders are sorted locally.

============================================================ */

"use strict";


/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import {

    initializeApp,

    getApps

} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {

    getAuth,

    setPersistence,

    browserLocalPersistence,

    onAuthStateChanged,

    GoogleAuthProvider,

    signInWithPopup,

    signInWithRedirect,

    getRedirectResult,

    signInWithPhoneNumber,

    RecaptchaVerifier,

    signOut

} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {

    getFirestore,

    doc,

    setDoc,

    collection,

    query,

    where,

    getDocs,

    serverTimestamp

} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* ============================================================
   FIREBASE CONFIG
============================================================ */

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


const STORE_APP_NAME =
    "JeevaNadiBooksStore";


const USERS_COLLECTION =
    "users";


const ORDERS_COLLECTION =
    "orders";


/* ============================================================
   FIREBASE INITIALIZATION
============================================================ */

let storeApp;


try {

    const existing =
        getApps().find(
            app =>
                app.name === STORE_APP_NAME
        );


    storeApp =
        existing ||
        initializeApp(
            firebaseConfig,
            STORE_APP_NAME
        );

} catch (error) {

    console.error(
        "Jeeva Nadi Books: Firebase initialization failed.",
        error
    );

}


/* ============================================================
   SERVICES
============================================================ */

const auth =
    storeApp
        ? getAuth(storeApp)
        : null;


const db =
    storeApp
        ? getFirestore(storeApp)
        : null;


/* ============================================================
   GOOGLE
============================================================ */

const googleProvider =
    new GoogleAuthProvider();


googleProvider.setCustomParameters({

    prompt:
        "select_account"

});


googleProvider.addScope(
    "email"
);


/* ============================================================
   STATE
============================================================ */

const state = {

    started:
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

    authObserverStarted:
        false,

    ordersLoading:
        false,

    lastOrders:
        [],

    googleBusy:
        false,

    otpBusy:
        false,

    logoutBusy:
        false

};


/* ============================================================
   DOM
============================================================ */

function $(id) {

    return document.getElementById(id);

}


/* ============================================================
   VISIBILITY
============================================================ */

function show(element) {

    if (!element) {
        return;
    }

    element.classList.remove(
        "hidden"
    );

}


function hide(element) {

    if (!element) {
        return;
    }

    element.classList.add(
        "hidden"
    );

}


/* ============================================================
   VIEW SWITCHER
============================================================ */

function showOnly(viewId) {

    [

        "loadingView",
        "loginView",
        "otpView",
        "dashboardView"

    ].forEach(
        id => {

            const element =
                $(id);


            if (!element) {
                return;
            }


            if (
                id === viewId
            ) {

                show(element);

            } else {

                hide(element);

            }

        }
    );

}


/* ============================================================
   HTML ESCAPE
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
   MESSAGE
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
        message;


    element.className =
        "message";


    element.classList.add(
        type
    );


    show(element);

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


        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                ${escapeHtml(text)}
            </span>

        `;

    } else {

        button.disabled =
            false;


        if (
            button.dataset.originalHtml
        ) {

            button.innerHTML =
                button.dataset.originalHtml;

        }

    }

}


/* ============================================================
   AUTH ERROR
============================================================ */

function friendlyAuthError(error) {

    const code =
        error?.code || "";


    const messages = {

        "auth/popup-closed-by-user":
            "Google sign-in was cancelled.",

        "auth/popup-blocked":
            "Your browser blocked the Google sign-in window.",

        "auth/cancelled-popup-request":
            "A Google sign-in window is already open.",

        "auth/invalid-phone-number":
            "Please enter a valid Indian mobile number.",

        "auth/invalid-verification-code":
            "The OTP you entered is incorrect.",

        "auth/code-expired":
            "This OTP has expired. Please request a new one.",

        "auth/too-many-requests":
            "Too many attempts. Please wait and try again.",

        "auth/quota-exceeded":
            "Firebase SMS quota has been reached.",

        "auth/billing-not-enabled":
            "Phone OTP requires Firebase billing to be enabled for SMS authentication.",

        "auth/operation-not-allowed":
            "This authentication method is not enabled in Firebase.",

        "auth/network-request-failed":
            "Network connection failed. Please check your internet.",

        "auth/user-disabled":
            "This account has been disabled.",

        "auth/unauthorized-domain":
            "This website domain is not authorized in Firebase.",

        "auth/invalid-credential":
            "The authentication credential is invalid."

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

function friendlyFirestoreError(error) {

    const code =
        error?.code || "";


    if (
        code.includes(
            "permission-denied"
        )
    ) {

        return "Your account does not have permission to access orders.";

    }


    if (
        code.includes(
            "unavailable"
        )
    ) {

        return "Firebase is temporarily unavailable.";

    }


    if (
        code.includes(
            "unauthenticated"
        )
    ) {

        return "Your session has expired. Please sign in again.";

    }


    return "Unable to load your orders right now.";

}


/* ============================================================
   PROVIDER
============================================================ */

function getProviderName(user) {

    if (
        !user?.providerData
    ) {

        return "—";

    }


    const providers =
        user.providerData.map(
            item =>
                item.providerId
        );


    if (
        providers.includes(
            "google.com"
        )
    ) {

        return "Google";

    }


    if (
        providers.includes(
            "phone"
        )
    ) {

        return "Phone OTP";

    }


    return "Firebase Authentication";

}


/* ============================================================
   PHONE
============================================================ */

function normalizePhone(value) {

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

        return "+91 " + digits;

    }


    if (
        digits.length === 12 &&
        digits.startsWith("91")
    ) {

        return "+91 " +
            digits.slice(2);

    }


    return String(value);

}


function getPhoneNumber() {

    const input =
        $("phoneNumber");


    if (!input) {

        throw new Error(
            "Mobile number field is missing."
        );

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


    return "+91" + digits;

}


/* ============================================================
   PROFILE
============================================================ */

async function syncUserProfile(user) {

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
                USERS_COLLECTION,
                user.uid
            );


        const data = {

            uid:
                user.uid,

            name:
                user.displayName || "",

            email:
                user.email || "",

            phone:
                user.phoneNumber || "",

            photoURL:
                user.photoURL || "",

            provider:
                getProviderName(user),

            updatedAt:
                serverTimestamp(),

            lastLoginAt:
                serverTimestamp()

        };


        await setDoc(
            userRef,
            data,
            {
                merge:
                    true
            }
        );


        return data;

    } catch (error) {

        console.warn(
            "Jeeva Nadi Books: Profile sync skipped.",
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


    const avatar =
        $("customerAvatar");


    if (avatar) {

        avatar.src =
            profile?.photoURL ||
            user.photoURL ||
            "images/account.png";


        avatar.onerror =
            () => {

                avatar.onerror =
                    null;

                avatar.src =
                    "images/account.png";

            };

    }


    const customerName =
        $("customerName");


    if (customerName) {

        customerName.textContent =
            name;

    }


    const subtitle =
        $("customerSubtitle");


    if (subtitle) {

        subtitle.textContent =
            email ||
            normalizePhone(phone) ||
            "Your Jeeva Nadi Books account";

    }


    const fields = {

        profileName:
            name,

        profileEmail:
            email || "—",

        profilePhone:
            normalizePhone(phone) || "—",

        profileProvider:
            getProviderName(user),

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
   DATE
============================================================ */

function getOrderDate(order) {

    const value =
        order?.createdAt ||
        order?.created_at ||
        order?.orderDate ||
        order?.date ||
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

        return value.seconds * 1000;

    }


    if (
        typeof value._seconds ===
        "number"
    ) {

        return value._seconds * 1000;

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


function formatOrderDate(order) {

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

    } catch {

        return "Date unavailable";

    }

}


/* ============================================================
   CURRENCY
============================================================ */

function formatCurrency(amount) {

    const number =
        Number(amount);


    const safe =
        Number.isFinite(
            number
        )
            ? number
            : 0;


    return "₹" +
        safe.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits:
                    2
            }
        );

}


/* ============================================================
   ORDER ITEMS
============================================================ */

function getOrderItems(order) {

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

function getItemName(item) {

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

function getItemVariant(item) {

    const product =
        String(
            item?.product ||
            item?.name ||
            item?.title ||
            ""
        ).trim();


    const variant =
        String(
            item?.variant ||
            item?.edition ||
            item?.language ||
            item?.bookType ||
            ""
        ).trim();


    if (
        !variant ||
        variant.toLowerCase() ===
        product.toLowerCase()
    ) {

        return "";

    }


    return variant;

}


/* ============================================================
   ITEM QUANTITY
============================================================ */

function getItemQuantity(item) {

    const value =
        Number(
            item?.quantity
        );


    return (
        Number.isFinite(value) &&
        value > 0
    )
        ? value
        : 1;

}


/* ============================================================
   ITEM PRICE
============================================================ */

function getItemPrice(item) {

    const values = [

        item?.price,

        item?.unitPrice,

        item?.salePrice,

        item?.amount,

        item?.productPrice

    ];


    for (
        const value of values
    ) {

        const number =
            Number(value);


        if (
            Number.isFinite(number)
        ) {

            return number;

        }

    }


    return 0;

}


/* ============================================================
   PRODUCT IMAGE
   ------------------------------------------------------------
   Priority:
   1. Firestore image
   2. Known product image mapping
   3. SVG fallback

============================================================ */

function getProductImage(item) {

    const storedImage =

        item?.image ||

        item?.imageUrl ||

        item?.imageURL ||

        item?.productImage ||

        item?.thumbnail ||

        item?.photo;


    if (storedImage) {

        return String(
            storedImage
        );

    }


    const text =
        (
            getItemName(item) +
            " " +
            getItemVariant(item)
        ).toLowerCase();


    /*
       Adjust these paths if your actual
       filenames are different.
    */

    if (
        text.includes("telugu") &&
        text.includes("bible")
    ) {

        return "images/books/telugu-bible-bsi.jpg";

    }


    if (
        text.includes("song")
    ) {

        return "images/books/songs-book.jpg";

    }


    if (
        text.includes("english") &&
        text.includes("bible")
    ) {

        return "images/books/english-bible.jpg";

    }


    if (
        text.includes("cover")
    ) {

        return "images/books/bible-cover.jpg";

    }


    if (
        text.includes("calendar")
    ) {

        return "images/books/calendar.jpg";

    }


    return createFallbackImage(
        getItemName(item)
    );

}


/* ============================================================
   SVG FALLBACK IMAGE
============================================================ */

function createFallbackImage(title) {

    const safeTitle =
        String(
            title || "BOOK"
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
                    id="bg"
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
                fill="url(#bg)"
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
                ${safeTitle.slice(0, 24)}
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
        encodeURIComponent(svg)
    );

}


/* ============================================================
   ORDER TOTAL
============================================================ */

function getOrderTotal(order) {

    const possible = [

        order?.pricing?.total,

        order?.total,

        order?.amount,

        order?.grandTotal

    ];


    for (
        const value of possible
    ) {

        const number =
            Number(value);


        if (
            Number.isFinite(number)
        ) {

            return number;

        }

    }


    const items =
        getOrderItems(
            order
        );


    return items.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                getItemPrice(item) *
                getItemQuantity(item)
            );

        },
        0
    );

}


/* ============================================================
   STATUS
============================================================ */

function getOrderStatus(order) {

    return (

        order?.status ||

        order?.orderStatus ||

        order?.paymentStatus ||

        order?.payment?.status ||

        order?.verification?.status ||

        "Pending"

    );

}


function getPaymentStatus(order) {

    return (

        order?.paymentStatus ||

        order?.payment?.status ||

        order?.verification?.status ||

        "Pending"

    );

}


function getStatusClass(status) {

    const clean =
        String(
            status || "pending"
        )
            .toLowerCase()
            .trim();


    if (
        clean.includes("reject") ||
        clean.includes("cancel") ||
        clean.includes("fail")
    ) {

        return "rejected";

    }


    if (
        clean.includes("complete") ||
        clean.includes("approve") ||
        clean.includes("success") ||
        clean.includes("deliver") ||
        clean.includes("paid")
    ) {

        return "completed";

    }


    if (
        clean.includes("process")
    ) {

        return "processing";

    }


    if (
        clean.includes("await") ||
        clean.includes("verification")
    ) {

        return "verification";

    }


    return "pending";

}


function getStatusIcon(status) {

    const clean =
        String(
            status || ""
        ).toLowerCase();


    if (
        clean.includes("reject") ||
        clean.includes("cancel") ||
        clean.includes("fail")
    ) {

        return "fa-circle-xmark";

    }


    if (
        clean.includes("complete") ||
        clean.includes("approve") ||
        clean.includes("success") ||
        clean.includes("deliver") ||
        clean.includes("paid")
    ) {

        return "fa-circle-check";

    }


    if (
        clean.includes("process") ||
        clean.includes("pending") ||
        clean.includes("await") ||
        clean.includes("verification")
    ) {

        return "fa-clock";

    }


    return "fa-circle-info";

}


/* ============================================================
   BOOK COUNT
============================================================ */

function getBookCount(orders) {

    return orders.reduce(
        (
            total,
            order
        ) => {

            return (
                total +
                getOrderItems(order)
                    .reduce(
                        (
                            count,
                            item
                        ) => {

                            return (
                                count +
                                getItemQuantity(item)
                            );

                        },
                        0
                    )
            );

        },
        0
    );

}


/* ============================================================
   PENDING
============================================================ */

function isPendingOrder(order) {

    const status =
        (
            getOrderStatus(order) +
            " " +
            getPaymentStatus(order)
        )
            .toLowerCase();


    return (

        status.includes("pending") ||
        status.includes("processing") ||
        status.includes("verification") ||
        status.includes("awaiting")

    );

}


/* ============================================================
   SUMMARY
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


function updateSummary(orders) {

    const safe =
        Array.isArray(
            orders
        )
            ? orders
            : [];


    const totalSpent =
        safe.reduce(
            (
                total,
                order
            ) => {

                return (
                    total +
                    getOrderTotal(order)
                );

            },
            0
        );


    const pending =
        safe.filter(
            isPendingOrder
        ).length;


    const values = {

        totalOrders:
            safe.length,

        totalBooks:
            getBookCount(safe),

        totalSpent:
            formatCurrency(
                totalSpent
            ),

        pendingOrders:
            pending

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
   RENDER SINGLE ITEM
============================================================ */

function createOrderItem(item) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "order-item";


    const name =
        getItemName(item);


    const variant =
        getItemVariant(item);


    const quantity =
        getItemQuantity(item);


    const price =
        getItemPrice(item);


    const image =
        getProductImage(item);


    row.innerHTML = `

        <div class="order-item-image-wrap">

            <img
                class="order-item-image"
                alt="${escapeHtml(name)}"
                loading="lazy"
            >

        </div>


        <div class="order-item-info">

            <div class="order-item-name">

                ${escapeHtml(name)}

            </div>


            ${
                variant
                    ? `
                        <div class="order-item-variant">

                            ${escapeHtml(variant)}

                        </div>
                    `
                    : ""
            }


            <div class="order-item-price">

                ${
                    price > 0
                        ? `${formatCurrency(price)} each`
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
   RENDER ORDER
============================================================ */

function createOrderCard(order) {

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


    const statusClass =
        getStatusClass(
            status
        );


    const paymentClass =
        getStatusClass(
            payment
        );


    const statusIcon =
        getStatusIcon(
            status
        );


    const paymentIcon =
        getStatusIcon(
            payment
        );


    const items =
        getOrderItems(
            order
        );


    const safeItems =
        Array.isArray(items)
            ? items
            : [];


    const itemCount =
        safeItems.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    getItemQuantity(item)
                );

            },
            0
        );


    /* ========================================================
       HEADER
    ======================================================== */

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
                    ${escapeHtml(orderId)}
                </strong>

            </div>


            <div class="order-date">

                ${escapeHtml(
                    formatOrderDate(order)
                )}

            </div>

        </div>


        <div class="order-header-right">

            <div class="order-title">
                Jeeva Nadi Books Order
            </div>


            <div class="order-status ${statusClass}">

                <i
                    class="fa-solid ${statusIcon}"
                ></i>

                <span>
                    ${escapeHtml(status)}
                </span>

            </div>

        </div>

    `;


    card.appendChild(
        header
    );


    /* ========================================================
       ITEMS
    ======================================================== */

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
                    <strong>1</strong>

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

    } else {

        safeItems.forEach(
            item => {

                itemsContainer.appendChild(
                    createOrderItem(item)
                );

            }
        );

    }


    card.appendChild(
        itemsContainer
    );


    /* ========================================================
       FOOTER
    ======================================================== */

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
                item${itemCount === 1 ? "" : "s"}
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

                ${escapeHtml(payment)}

            </strong>

        </div>


        <div class="order-total">

            <span>
                Order Total
            </span>

            <strong>
                ${formatCurrency(
                    getOrderTotal(order)
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

function renderOrders(orders) {

    const list =
        $("ordersList");


    const empty =
        $("ordersEmpty");


    if (!list) {
        return;
    }


    list.replaceChildren();


    if (
        !Array.isArray(orders) ||
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

function renderOrderError(message) {

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

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>


            <h3>
                Orders temporarily unavailable
            </h3>


            <p>
                ${escapeHtml(message)}
            </p>

        </div>

    `;

}


/* ============================================================
   LOAD ORDERS
============================================================ */

async function loadOrders() {

    const user =
        auth?.currentUser ||
        state.currentUser;


    if (
        !user ||
        !db
    ) {

        return [];

    }


    if (
        state.ordersLoading
    ) {

        return state.lastOrders;

    }


    state.ordersLoading =
        true;


    const loading =
        $("ordersLoading");


    if (loading) {
        show(loading);
    }


    try {

        const ordersRef =
            collection(
                db,
                ORDERS_COLLECTION
            );


        /*
           IMPORTANT:
           Only userId filter.
           No orderBy().
        */

        const ordersQuery =
            query(
                ordersRef,
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
                item => ({

                    id:
                        item.id,

                    ...item.data()

                })
            );


        orders.sort(
            (
                a,
                b
            ) => {

                return (
                    getOrderDate(b) -
                    getOrderDate(a)
                );

            }
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

    } catch (error) {

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

    } finally {

        state.ordersLoading =
            false;


        if (loading) {
            hide(loading);
        }

    }

}


/* ============================================================
   RECAPTCHA
============================================================ */

function destroyRecaptcha() {

    if (
        state.recaptcha
    ) {

        try {

            state.recaptcha.clear();

        } catch (error) {

            console.warn(
                "reCAPTCHA cleanup warning.",
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
                            "reCAPTCHA expired."
                        );

                    },

                "error-callback":
                    error => {

                        console.warn(
                            "reCAPTCHA error.",
                            error
                        );

                    }

            }
        );


    await state.recaptcha.render();


    return state.recaptcha;

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

        await signInWithPopup(
            auth,
            googleProvider
        );

    } catch (error) {

        console.error(
            "Google sign-in failed.",
            error
        );


        if (
            error.code ===
            "auth/popup-blocked"
        ) {

            try {

                await signInWithRedirect(
                    auth,
                    googleProvider
                );


                return;

            } catch (
                redirectError
            ) {

                showMessage(
                    "loginMessage",
                    friendlyAuthError(
                        redirectError
                    ),
                    "error"
                );

            }

        } else {

            showMessage(
                "loginMessage",
                friendlyAuthError(
                    error
                ),
                "error"
            );

        }

    } finally {

        state.googleBusy =
            false;


        setButtonLoading(
            button,
            false
        );

    }

}


/* ============================================================
   GOOGLE REDIRECT
============================================================ */

async function handleGoogleRedirectResult() {

    if (!auth) {
        return;
    }


    try {

        await getRedirectResult(
            auth
        );

    } catch (error) {

        console.error(
            "Google redirect result failed.",
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


    setButtonLoading(
        button,
        true,
        "Sending OTP..."
    );


    clearMessage(
        "loginMessage"
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
                `Enter the 6-digit OTP sent to ${phoneNumber}.`;

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

    } catch (error) {

        console.error(
            "OTP sending failed.",
            error
        );


        destroyRecaptcha();


        if (
            error.code ===
            "INVALID_PHONE"
        ) {

            showMessage(
                "loginMessage",
                error.message,
                "error"
            );

        } else {

            showMessage(
                "loginMessage",
                friendlyAuthError(
                    error
                ),
                "error"
            );

        }

    } finally {

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
            input?.value || ""
        )
            .replace(
                /\D/g,
                ""
            );


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


    setButtonLoading(
        button,
        true,
        "Verifying..."
    );


    try {

        await state.confirmationResult.confirm(
            otp
        );


        state.confirmationResult =
            null;


        destroyRecaptcha();

    } catch (error) {

        console.error(
            "OTP verification failed.",
            error
        );


        showMessage(
            "otpMessage",
            friendlyAuthError(
                error
            ),
            "error"
        );

    } finally {

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

}


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

        await signOut(
            auth
        );


        state.currentUser =
            null;


        state.currentProfile =
            null;


        state.lastOrders =
            [];


        state.confirmationResult =
            null;


        destroyRecaptcha();


        closeLogoutModal();

    } catch (error) {

        console.error(
            "Logout failed.",
            error
        );


        showMessage(
            "loginMessage",
            "Unable to sign out right now. Please try again.",
            "error"
        );

    } finally {

        state.logoutBusy =
            false;


        setButtonLoading(
            button,
            false
        );

    }

}


/* ============================================================
   DASHBOARD
============================================================ */

async function openDashboard(user) {

    if (!user) {

        showOnly(
            "loginView"
        );

        return;

    }


    state.currentUser =
        user;


    showOnly(
        "dashboardView"
    );


    populateCustomer(
        user
    );


    /*
       Profile is deliberately non-blocking.
    */

    syncUserProfile(
        user
    )
        .then(
            profile => {

                if (!profile) {
                    return;
                }


                state.currentProfile =
                    profile;


                populateCustomer(
                    user,
                    profile
                );

            }
        )
        .catch(
            error => {

                console.warn(
                    "Profile synchronization warning.",
                    error
                );

            }
        );


    await loadOrders();

}


/* ============================================================
   LOGIN
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

}


/* ============================================================
   REFRESH
============================================================ */

async function refreshOrders() {

    if (
        !state.currentUser
    ) {

        return;

    }


    const buttons = [

        $("refreshOrdersBtn"),
        $("refreshOrdersBtnSecondary")

    ];


    buttons.forEach(
        button => {

            if (button) {

                button.disabled =
                    true;

                button.dataset.oldHtml =
                    button.innerHTML;

                button.innerHTML =
                    `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Refreshing...
                    `;

            }

        }
    );


    try {

        await loadOrders();

    } finally {

        buttons.forEach(
            button => {

                if (!button) {
                    return;
                }


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
   KEYBOARD
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
   EVENTS
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
                user || null;


            if (user) {

                await openDashboard(
                    user
                );

            } else {

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


    if (!auth) {

        console.error(
            "Jeeva Nadi Books: Firebase Authentication unavailable."
        );


        showMessage(
            "loginMessage",
            "The account service could not initialize. Please check your Firebase configuration.",
            "error"
        );


        showOnly(
            "loginView"
        );


        return;

    }


    try {

        await setPersistence(
            auth,
            browserLocalPersistence
        );

    } catch (error) {

        console.warn(
            "Authentication persistence warning.",
            error
        );

    }


    await handleGoogleRedirectResult();


    startAuthObserver();

}


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

} else {

    initializeAccountEngine();

}


/* ============================================================
   OPTIONAL DEBUG API
============================================================ */

window.JeevaNadiAccount = {

    getCurrentUser:
        () =>
            auth?.currentUser || null,

    loadOrders,

    refreshOrders,

    state

};

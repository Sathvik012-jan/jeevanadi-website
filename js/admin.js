/* =========================================================
   JEEVA NADI BOOKS
   ADMIN PANEL
   ---------------------------------------------------------
   Firebase Authentication + Firestore
   ---------------------------------------------------------

   ARCHITECTURE
   ---------------------------------------------------------
   CUSTOMER AUTH:
       Default Firebase App
       Default Firebase Auth

   ADMIN AUTH:
       Named Firebase App: "JeevaNadiAdmin"
       Separate Firebase Auth instance
       Session persistence

   Therefore:

       Admin Login
            ↓
       Admin Auth only

       Customer Login
            ↓
       Customer Auth only

       Admin Logout
            ↓
       Customer remains signed in

   IMPORTANT SECURITY NOTE
   ---------------------------------------------------------
   The ADMIN_EMAILS whitelist below is NOT sufficient
   security by itself.

   Firestore Security Rules MUST ALSO restrict access
   to authorized administrators.

========================================================= */

"use strict";


/* =========================================================
   FIREBASE IMPORTS
========================================================= */

import {
    initializeApp,
    getApps
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    setPersistence,
    browserSessionPersistence,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

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


/* =========================================================
   ADMIN APP
========================================================= */

const ADMIN_APP_NAME =
    "JeevaNadiAdmin";


let adminApp;


/*
 * Reuse the existing named app if the script is loaded
 * more than once.
 */

const existingAdminApp =
    getApps().find(
        app => app.name === ADMIN_APP_NAME
    );


if (existingAdminApp) {

    adminApp =
        existingAdminApp;

} else {

    adminApp =
        initializeApp(
            firebaseConfig,
            ADMIN_APP_NAME
        );

}


/* =========================================================
   ADMIN FIREBASE SERVICES
========================================================= */

const adminAuth =
    getAuth(
        adminApp
    );


const adminDb =
    getFirestore(
        adminApp
    );


/* =========================================================
   ADMIN AUTH PERSISTENCE
========================================================= */

let adminPersistenceReady =
    false;


async function initializeAdminPersistence() {

    if (
        adminPersistenceReady
    ) {

        return;

    }


    await setPersistence(
        adminAuth,
        browserSessionPersistence
    );


    adminPersistenceReady =
        true;


    console.log(
        "Jeeva Nadi Admin: session persistence initialized."
    );

}


/* =========================================================
   AUTHORIZED ADMIN EMAILS
   ---------------------------------------------------------
   IMPORTANT:
   This is only a client-side authorization check.
   Firestore Rules must enforce the same restriction.
========================================================= */

const ADMIN_EMAILS =
    new Set([

        "sathvikdobbala@gmail.com",

        "info@jeevanadiministries.org"

    ]);


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    orders: [],

    currentAction: null,

    loginInProgress: false,

    loadingOrders: false,

    actionInProgress: false,

    authObserverStarted: false

};


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {

    return document.getElementById(
        id
    );

}


/* =========================================================
   DOM REFERENCES
========================================================= */

const DOM = {

    authLoading:
        $("adminAuthLoading"),

    loginView:
        $("adminLoginView"),

    dashboard:
        $("adminDashboard"),

    loginButton:
        $("googleAdminLoginBtn"),

    loginMessage:
        $("adminLoginMessage"),

    logoutButton:
        $("adminLogoutBtn"),

    refreshButton:
        $("refreshOrdersBtn"),

    filter:
        $("orderFilter"),

    ordersList:
        $("ordersList"),

    ordersLoading:
        $("ordersLoading"),

    ordersEmpty:
        $("ordersEmpty"),

    modal:
        $("actionModal"),

    modalBackdrop:
        $("actionModalBackdrop"),

    modalIcon:
        $("actionModalIcon"),

    modalTitle:
        $("actionModalTitle"),

    modalText:
        $("actionModalText"),

    cancelButton:
        $("cancelActionBtn"),

    confirmButton:
        $("confirmActionBtn"),

    toast:
        $("adminToast"),

    adminName:
        $("adminName"),

    adminEmail:
        $("adminEmail"),

    adminPhoto:
        $("adminPhoto")

};


/* =========================================================
   APPLICATION START
========================================================= */

initializeAdmin();


/* =========================================================
   INITIALIZE ADMIN APPLICATION
========================================================= */

async function initializeAdmin() {

    console.log(
        "Jeeva Nadi Books — Admin Engine initializing..."
    );


    setupEventListeners();


    /*
     * Show authentication loading state initially.
     */

    showAuthenticationLoading();


    try {

        /*
         * Persistence MUST be configured before
         * authentication state is observed.
         */

        await initializeAdminPersistence();


        observeAuthentication();


        console.log(
            "Jeeva Nadi Books — Admin Engine ready."
        );


    } catch (error) {

        console.error(
            "Admin initialization failed:",
            error
        );


        showLoginView();


        showLoginMessage(
            "Unable to initialize Admin Authentication. Please refresh the page.",
            "error"
        );

    }

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    /*
     * Google Login
     */

    DOM.loginButton?.addEventListener(
        "click",
        handleAdminLogin
    );


    /*
     * Logout
     */

    DOM.logoutButton?.addEventListener(
        "click",
        handleLogout
    );


    /*
     * Refresh Orders
     */

    DOM.refreshButton?.addEventListener(
        "click",
        () => {

            loadOrders(
                true
            );

        }
    );


    /*
     * Order Filter
     */

    DOM.filter?.addEventListener(
        "change",
        renderOrders
    );


    /*
     * Modal Cancel
     */

    DOM.cancelButton?.addEventListener(
        "click",
        closeActionModal
    );


    /*
     * Modal Backdrop
     */

    DOM.modalBackdrop?.addEventListener(
        "click",
        closeActionModal
    );


    /*
     * Modal Confirm
     */

    DOM.confirmButton?.addEventListener(
        "click",
        confirmOrderAction
    );


    /*
     * Order Action Buttons
     */

    DOM.ordersList?.addEventListener(
        "click",
        handleOrderActionClick
    );


    /*
     * Escape key
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeActionModal();

            }

        }
    );

}


/* =========================================================
   AUTHENTICATION OBSERVER
========================================================= */

function observeAuthentication() {

    if (
        state.authObserverStarted
    ) {

        return;

    }


    state.authObserverStarted =
        true;


    onAuthStateChanged(
        adminAuth,
        handleAuthenticationState
    );

}


/* =========================================================
   AUTHENTICATION STATE HANDLER
========================================================= */

async function handleAuthenticationState(
    user
) {

    console.log(
        "Admin Authentication state:",
        user?.email || "Signed out"
    );


    /*
     * No Admin user.
     */

    if (
        !user
    ) {

        state.orders =
            [];

        state.currentAction =
            null;

        updateStatistics();

        renderOrders();

        showLoginView();

        return;

    }


    const email =
        normalizeEmail(
            user.email
        );


    /*
     * Client-side authorization check.
     */

    if (
        !isAuthorizedAdmin(
            email
        )
    ) {

        await rejectUnauthorizedUser(
            user
        );

        return;

    }


    /*
     * Authorized administrator.
     */

    showDashboard(
        user
    );


    await loadOrders();

}


/* =========================================================
   NORMALIZE EMAIL
========================================================= */

function normalizeEmail(
    email
) {

    return String(
        email || ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   CHECK ADMIN AUTHORIZATION
========================================================= */

function isAuthorizedAdmin(
    email
) {

    return ADMIN_EMAILS.has(
        normalizeEmail(
            email
        )
    );

}


/* =========================================================
   GET CURRENT ADMIN
========================================================= */

function getCurrentAuthorizedAdmin() {

    const user =
        adminAuth.currentUser;


    if (
        !user
    ) {

        return null;

    }


    const email =
        normalizeEmail(
            user.email
        );


    if (
        !isAuthorizedAdmin(
            email
        )
    ) {

        return null;

    }


    return user;

}


/* =========================================================
   REJECT UNAUTHORIZED USER
========================================================= */

async function rejectUnauthorizedUser(
    user
) {

    const email =
        normalizeEmail(
            user?.email
        );


    console.warn(
        "Unauthorized Admin account:",
        email
    );


    /*
     * IMPORTANT:
     *
     * This signs out ONLY the named Admin Auth.
     *
     * Customer Auth remains untouched.
     */

    try {

        await signOut(
            adminAuth
        );

    } catch (error) {

        console.error(
            "Unable to sign out unauthorized Admin account:",
            error
        );

    }


    state.orders =
        [];

    updateStatistics();

    renderOrders();

    showLoginView();


    showLoginMessage(

        `This Google account (${email || "unknown"}) is not authorized as an administrator.`,

        "error"

    );

}


/* =========================================================
   GOOGLE ADMIN LOGIN
========================================================= */

async function handleAdminLogin() {

    if (
        state.loginInProgress
    ) {

        return;

    }


    state.loginInProgress =
        true;


    clearLoginMessage();


    setLoginLoading(
        true
    );


    try {

        /*
         * Make absolutely sure Admin persistence
         * is initialized.
         */

        await initializeAdminPersistence();


        const provider =
            new GoogleAuthProvider();


        /*
         * Always ask which Google account should
         * be used.
         */

        provider.setCustomParameters({

            prompt:
                "select_account"

        });


        provider.addScope(
            "email"
        );


        console.log(
            "Starting Admin Google Sign-In..."
        );


        const result =
            await signInWithPopup(
                adminAuth,
                provider
            );


        const user =
            result?.user;


        if (
            !user
        ) {

            throw new Error(
                "Google authentication did not return an Admin user."
            );

        }


        const email =
            normalizeEmail(
                user.email
            );


        console.log(
            "Google Admin login successful:",
            email
        );


        /*
         * SECURITY CHECK
         */

        if (
            !isAuthorizedAdmin(
                email
            )
        ) {

            console.warn(
                "Unauthorized Admin login attempt:",
                email
            );


            /*
             * Sign out ONLY the Admin Auth instance.
             */

            await signOut(
                adminAuth
            );


            showLoginView();


            showLoginMessage(

                `The Google account ${email || "unknown"} is not authorized to access the Admin panel.`,

                "error"

            );


            return;

        }


        /*
         * Authorized.
         *
         * onAuthStateChanged() will display the
         * dashboard and load orders.
         */

        console.log(
            "Authorized administrator:",
            email
        );

    } catch (error) {

        console.error(
            "Admin Google login error:",
            error
        );


        handleLoginError(
            error
        );

    } finally {

        state.loginInProgress =
            false;


        setLoginLoading(
            false
        );

    }

}


/* =========================================================
   LOGIN BUTTON LOADING
========================================================= */

function setLoginLoading(
    loading
) {

    if (
        !DOM.loginButton
    ) {

        return;

    }


    DOM.loginButton.disabled =
        Boolean(
            loading
        );


    if (
        loading
    ) {

        DOM.loginButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Signing in...
            </span>

        `;

    } else {

        DOM.loginButton.innerHTML = `

            <i class="fa-brands fa-google"></i>

            <span>
                Continue with Google
            </span>

        `;

    }

}


/* =========================================================
   LOGIN ERROR HANDLER
========================================================= */

function handleLoginError(
    error
) {

    const code =
        String(
            error?.code || ""
        );


    let message =
        "Admin login failed. Please try again.";


    switch (code) {

        case "auth/popup-closed-by-user":

            message =
                "Google sign-in was cancelled.";

            break;


        case "auth/popup-blocked":

            message =
                "Your browser blocked the Google sign-in popup. Please allow popups for this website.";

            break;


        case "auth/cancelled-popup-request":

            message =
                "A Google sign-in window is already open. Please finish that window first.";

            break;


        case "auth/unauthorized-domain":

            message =
                "This website is not authorized in Firebase Authentication. Add the website domain under Firebase Authentication → Settings → Authorized domains.";

            break;


        case "auth/operation-not-allowed":

            message =
                "Google Sign-In is not enabled in Firebase Authentication.";

            break;


        case "auth/network-request-failed":

            message =
                "Network error while contacting Firebase. Check your internet connection.";

            break;


        case "auth/invalid-credential":

            message =
                "Google authentication credentials were invalid. Please refresh the page and try again.";

            break;


        case "auth/internal-error":

            message =
                "Firebase encountered an internal authentication error. Please try again.";

            break;


        case "auth/too-many-requests":

            message =
                "Too many login attempts were made. Please wait a moment and try again.";

            break;


        default:

            if (
                error?.message
            ) {

                message =
                    error.message;

            }

            break;

    }


    showLoginMessage(
        message,
        "error"
    );

}


/* =========================================================
   AUTHENTICATION LOADING VIEW
========================================================= */

function showAuthenticationLoading() {

    DOM.authLoading?.classList.remove(
        "hidden"
    );


    DOM.loginView?.classList.add(
        "hidden"
    );


    DOM.dashboard?.classList.add(
        "hidden"
    );

}


/* =========================================================
   LOGIN VIEW
========================================================= */

function showLoginView() {

    DOM.authLoading?.classList.add(
        "hidden"
    );


    DOM.loginView?.classList.remove(
        "hidden"
    );


    DOM.dashboard?.classList.add(
        "hidden"
    );


    setLoginLoading(
        false
    );

}


/* =========================================================
   DASHBOARD VIEW
========================================================= */

function showDashboard(
    user
) {

    DOM.authLoading?.classList.add(
        "hidden"
    );


    DOM.loginView?.classList.add(
        "hidden"
    );


    DOM.dashboard?.classList.remove(
        "hidden"
    );


    if (
        DOM.adminName
    ) {

        DOM.adminName.textContent =
            user.displayName ||
            "Administrator";

    }


    if (
        DOM.adminEmail
    ) {

        DOM.adminEmail.textContent =
            user.email ||
            "—";

    }


    if (
        DOM.adminPhoto
    ) {

        if (
            user.photoURL
        ) {

            DOM.adminPhoto.src =
                user.photoURL;

        } else {

            DOM.adminPhoto.removeAttribute(
                "src"
            );

        }


        DOM.adminPhoto.alt =
            user.displayName ||
            "Administrator";

    }

}


/* =========================================================
   LOGIN MESSAGE
========================================================= */

function showLoginMessage(
    message,
    type = "error"
) {

    if (
        !DOM.loginMessage
    ) {

        return;

    }


    DOM.loginMessage.textContent =
        String(
            message || ""
        );


    DOM.loginMessage.className =
        `admin-message ${type}`;

}


/* =========================================================
   CLEAR LOGIN MESSAGE
========================================================= */

function clearLoginMessage() {

    if (
        !DOM.loginMessage
    ) {

        return;

    }


    DOM.loginMessage.textContent =
        "";


    DOM.loginMessage.className =
        "admin-message hidden";

}


/* =========================================================
   LOAD ORDERS
========================================================= */

async function loadOrders(
    showRefreshMessage = false
) {

    if (
        state.loadingOrders
    ) {

        return;

    }


    const user =
        getCurrentAuthorizedAdmin();


    if (
        !user
    ) {

        console.warn(
            "Order loading blocked: no authorized Admin."
        );

        return;

    }


    state.loadingOrders =
        true;


    setOrdersLoading(
        true
    );


    try {

        /*
         * Orders are sorted newest first.
         */

        const ordersQuery =
            query(

                collection(
                    adminDb,
                    "orders"
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


        /*
         * Verify that the Admin session has not
         * changed while Firestore was loading.
         */

        const currentAdmin =
            getCurrentAuthorizedAdmin();


        if (
            !currentAdmin
        ) {

            state.orders =
                [];

            updateStatistics();

            renderOrders();

            return;

        }


        state.orders =
            snapshot.docs.map(
                orderDoc => ({

                    id:
                        orderDoc.id,

                    ...orderDoc.data()

                })
            );


        updateStatistics();

        renderOrders();


        if (
            showRefreshMessage
        ) {

            showToast(
                "Orders refreshed successfully."
            );

        }

    } catch (error) {

        console.error(
            "Firestore orders error:",
            error
        );


        state.orders =
            [];


        updateStatistics();

        renderOrders();


        showToast(
            getFirestoreErrorMessage(
                error
            )
        );

    } finally {

        state.loadingOrders =
            false;


        setOrdersLoading(
            false
        );

    }

}


/* =========================================================
   ORDERS LOADING STATE
========================================================= */

function setOrdersLoading(
    loading
) {

    if (
        DOM.ordersLoading
    ) {

        DOM.ordersLoading.classList.toggle(
            "hidden",
            !loading
        );

    }


    if (
        loading &&
        DOM.ordersEmpty
    ) {

        DOM.ordersEmpty.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   FILTER ORDERS
========================================================= */

function getFilteredOrders() {

    const selected =
        String(
            DOM.filter?.value ||
            "all"
        )
            .trim()
            .toLowerCase();


    if (
        selected === "all"
    ) {

        return [
            ...state.orders
        ];

    }


    return state.orders.filter(
        order => {

            const status =
                normalizeStatus(
                    getOrderStatus(
                        order
                    )
                );


            return (
                status ===
                selected
            );

        }
    );

}


/* =========================================================
   GET ORDER STATUS
========================================================= */

function getOrderStatus(
    order
) {

    /*
     * Main order status is authoritative.
     */

    return String(

        order?.status ??

        order?.verification?.status ??

        order?.payment?.paymentStatus ??

        "Pending"

    )
        .trim();

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
    status
) {

    return String(
        status || "pending"
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   STATUS PILL CLASS
========================================================= */

function getStatusPillClass(
    status
) {

    const normalized =
        normalizeStatus(
            status
        );


    switch (
        normalized
    ) {

        case "approved":

            return "status-pill-approved";


        case "rejected":

            return "status-pill-rejected";


        default:

            return "status-pill-pending";

    }

}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders() {

    if (
        !DOM.ordersList
    ) {

        return;

    }


    const orders =
        getFilteredOrders();


    DOM.ordersList.innerHTML =
        "";


    if (
        orders.length === 0
    ) {

        DOM.ordersEmpty?.classList.remove(
            "hidden"
        );

        return;

    }


    DOM.ordersEmpty?.classList.add(
        "hidden"
    );


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


    DOM.ordersList.appendChild(
        fragment
    );

}


/* =========================================================
   CREATE ORDER CARD
========================================================= */

function createOrderCard(
    order
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "order-card";


    const status =
        getOrderStatus(
            order
        );


    const normalizedStatus =
        normalizeStatus(
            status
        );


    const customer =
        isPlainObject(
            order?.customer
        )
            ? order.customer
            : {};


    const payment =
        isPlainObject(
            order?.payment
        )
            ? order.payment
            : {};


    const pricing =
        isPlainObject(
            order?.pricing
        )
            ? order.pricing
            : {};


    const items =
        Array.isArray(
            order?.items
        )
            ? order.items
            : [];


    const shippingAddress =
        isPlainObject(
            order?.shippingAddress
        )
            ? order.shippingAddress
            : null;


    const statusClass =
        getMainStatusClass(
            normalizedStatus
        );


    const paymentStatus =
        payment.paymentStatus ||
        status ||
        "Pending";


    const verificationStatus =
        order?.verification?.status ||
        status ||
        "Pending";


    const paymentPillClass =
        getStatusPillClass(
            paymentStatus
        );


    const verificationPillClass =
        getStatusPillClass(
            verificationStatus
        );


    const canReview =
        normalizedStatus ===
        "pending";


    card.innerHTML = `

        <div class="order-top">

            <div>

                <div class="order-id">

                    Order ID:

                    <strong>
                        ${escapeHTML(
                            order.id
                        )}
                    </strong>

                </div>


                <div class="order-date">

                    ${escapeHTML(
                        formatDate(
                            order.createdAt
                        )
                    )}

                </div>

            </div>


            <span
                class="status-badge ${statusClass}"
            >

                ${escapeHTML(
                    status
                )}

            </span>

        </div>


        <div class="order-grid">


            <!-- CUSTOMER -->

            <div class="order-info-box">

                <h4>
                    Customer
                </h4>


                <p>

                    <strong>
                        Name:
                    </strong>

                    ${escapeHTML(
                        customer.name ||
                        "—"
                    )}

                </p>


                <p>

                    <strong>
                        Email:
                    </strong>

                    ${escapeHTML(
                        customer.email ||
                        "—"
                    )}

                </p>


                <p>

                    <strong>
                        Phone:
                    </strong>

                    ${escapeHTML(
                        customer.phone ||
                        "—"
                    )}

                </p>

            </div>


            <!-- SHIPPING -->

            <div class="order-info-box">

                <h4>
                    Shipping
                </h4>


                ${renderShipping(
                    shippingAddress
                )}

            </div>


            <!-- PAYMENT -->

            <div class="order-info-box">

                <h4>
                    Payment
                </h4>


                <p>

                    <strong>
                        Total:
                    </strong>

                    ₹${formatCurrency(
                        pricing.total
                    )}

                </p>


                <p>

                    <strong>
                        Method:
                    </strong>

                    ${escapeHTML(
                        payment.method ||
                        payment.paymentMethod ||
                        "—"
                    )}

                </p>


                <p>

                    <strong>
                        UTR:
                    </strong>

                    <span class="utr-value">

                        ${escapeHTML(
                            payment.utr ||
                            "Not provided"
                        )}

                    </span>

                </p>

            </div>


        </div>


        <!-- PURCHASED ITEMS -->

        <div class="order-items">

            <h4>
                Purchased Books
            </h4>


            ${renderItems(
                items
            )}

        </div>


        <!-- PAYMENT VERIFICATION -->

        <div class="payment-verification">


            <div>

                <span class="payment-label">
                    Payment Status
                </span>


                <strong
                    class="payment-status-pill ${paymentPillClass}"
                >

                    ${escapeHTML(
                        paymentStatus
                    )}

                </strong>

            </div>


            <div>

                <span class="payment-label">
                    Verification
                </span>


                <strong
                    class="payment-status-pill ${verificationPillClass}"
                >

                    ${escapeHTML(
                        verificationStatus
                    )}

                </strong>

            </div>


        </div>


        ${
            canReview

                ? `

                    <div class="order-actions">


                        <button
                            type="button"
                            class="reject-button"
                            data-action="reject"
                            data-order-id="${escapeAttribute(
                                order.id
                            )}"
                        >

                            <i class="fa-solid fa-xmark"></i>

                            Reject Payment

                        </button>


                        <button
                            type="button"
                            class="approve-button"
                            data-action="approve"
                            data-order-id="${escapeAttribute(
                                order.id
                            )}"
                        >

                            <i class="fa-solid fa-check"></i>

                            Approve Payment

                        </button>


                    </div>

                `

                : ""

        }

    `;


    return card;

}


/* =========================================================
   MAIN STATUS CLASS
========================================================= */

function getMainStatusClass(
    status
) {

    switch (
        normalizeStatus(
            status
        )
    ) {

        case "approved":

            return "status-approved";


        case "rejected":

            return "status-rejected";


        default:

            return "status-pending";

    }

}


/* =========================================================
   SHIPPING
========================================================= */

function renderShipping(
    address
) {

    if (
        !address
    ) {

        return `
            <p>—</p>
        `;

    }


    const addressLine =
        address.address ||
        address.line1 ||
        "—";


    const city =
        address.city ||
        "";


    const state =
        address.state ||
        "";


    const pincode =
        address.pincode ||
        address.postalCode ||
        "";


    const cityState =
        [city, state]
            .filter(Boolean)
            .join(", ");


    return `

        <p>

            ${escapeHTML(
                addressLine
            )}

        </p>


        ${
            cityState

                ? `

                    <p>

                        ${escapeHTML(
                            cityState
                        )}

                    </p>

                `

                : ""

        }


        ${
            pincode

                ? `

                    <p>

                        <strong>

                            ${escapeHTML(
                                pincode
                            )}

                        </strong>

                    </p>

                `

                : ""

        }

    `;

}


/* =========================================================
   RENDER PURCHASED ITEMS
========================================================= */

function renderItems(
    items
) {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return `

            <p>
                No item information available.
            </p>

        `;

    }


    return items
        .map(
            item => {

                const safeItem =
                    isPlainObject(
                        item
                    )
                        ? item
                        : {};


                const image =
                    safeItem.image ||
                    safeItem.imageUrl ||
                    "./images/account.png";


                const quantity =
                    Math.max(
                        1,
                        Number(
                            safeItem.quantity ??
                            1
                        )
                    );


                const lineTotal =
                    safeItem.lineTotal;


                let price;


                if (
                    lineTotal !==
                    undefined &&
                    lineTotal !==
                    null
                ) {

                    price =
                        Number(
                            lineTotal
                        );

                } else {

                    price =
                        Number(
                            safeItem.price ||
                            0
                        ) *
                        quantity;

                }


                if (
                    !Number.isFinite(
                        price
                    )
                ) {

                    price =
                        0;

                }


                const itemName =
                    safeItem.name ||
                    safeItem.title ||
                    "Book";


                const variant =
                    safeItem.variant ||
                    "";


                return `

                    <div class="order-item">


                        <img
                            class="order-item-image"
                            src="${escapeAttribute(
                                image
                            )}"
                            alt=""
                            loading="lazy"
                            onerror="this.onerror=null;this.src='./images/account.png';"
                        >


                        <div
                            class="order-item-details"
                        >


                            <div
                                class="order-item-name"
                            >

                                ${escapeHTML(
                                    itemName
                                )}

                            </div>


                            ${
                                variant

                                    ? `

                                        <div
                                            class="order-item-variant"
                                        >

                                            ${escapeHTML(
                                                variant
                                            )}

                                        </div>

                                    `

                                    : ""

                            }


                            <div
                                class="order-item-variant"
                            >

                                Quantity:
                                ${quantity}

                            </div>


                        </div>


                        <strong
                            class="order-item-price"
                        >

                            ₹${formatCurrency(
                                price
                            )}

                        </strong>


                    </div>

                `;

            }
        )
        .join("");

}


/* =========================================================
   ORDER ACTION CLICK
========================================================= */

function handleOrderActionClick(
    event
) {

    if (
        state.actionInProgress
    ) {

        return;

    }


    const target =
        event.target;


    const button =
        target.closest(
            "[data-action]"
        );


    if (
        !button
    ) {

        return;

    }


    const action =
        String(
            button.dataset.action ||
            ""
        )
            .trim()
            .toLowerCase();


    const orderId =
        String(
            button.dataset.orderId ||
            ""
        )
            .trim();


    if (
        !orderId
    ) {

        return;

    }


    if (
        ![
            "approve",
            "reject"
        ].includes(
            action
        )
    ) {

        return;

    }


    openActionModal(
        action,
        orderId
    );

}


/* =========================================================
   OPEN ACTION MODAL
========================================================= */

function openActionModal(
    action,
    orderId
) {

    if (
        !DOM.modal ||
        !DOM.modalTitle ||
        !DOM.modalText ||
        !DOM.modalIcon ||
        !DOM.confirmButton
    ) {

        console.error(
            "Admin action modal elements are missing."
        );

        return;

    }


    const order =
        state.orders.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    orderId
                )
        );


    if (
        !order
    ) {

        showToast(
            "The selected order could not be found."
        );

        return;

    }


    const currentStatus =
        normalizeStatus(
            getOrderStatus(
                order
            )
        );


    /*
     * Only Pending orders can be reviewed.
     */

    if (
        currentStatus !==
        "pending"
    ) {

        showToast(
            "This order has already been reviewed."
        );

        return;

    }


    state.currentAction = {

        action,

        orderId

    };


    const isApprove =
        action ===
        "approve";


    DOM.modalTitle.textContent =

        isApprove
            ? "Approve Payment?"
            : "Reject Payment?";


    DOM.modalText.textContent =

        isApprove

            ? "Confirm that you have verified the UPI payment. The customer's order will be marked as approved."

            : "Confirm that this payment should be rejected. The customer's order will be marked as rejected.";


    DOM.modalIcon.innerHTML =

        isApprove

            ? '<i class="fa-solid fa-circle-check"></i>'

            : '<i class="fa-solid fa-circle-xmark"></i>';


    DOM.modalIcon.className =
        `action-modal-icon ${
            isApprove
                ? "approve-modal"
                : "reject-modal"
        }`;


    DOM.confirmButton.textContent =

        isApprove
            ? "Approve Payment"
            : "Reject Payment";


    DOM.confirmButton.className =
        `confirm-button ${
            isApprove
                ? "approve-confirm"
                : "reject-confirm"
        }`;


    DOM.confirmButton.disabled =
        false;


    DOM.modal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE ACTION MODAL
========================================================= */

function closeActionModal() {

    /*
     * Do not allow closing while Firebase update
     * is actually processing.
     */

    if (
        state.actionInProgress
    ) {

        return;

    }


    DOM.modal?.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "modal-open"
    );


    state.currentAction =
        null;


    if (
        DOM.confirmButton
    ) {

        DOM.confirmButton.disabled =
            false;

        DOM.confirmButton.textContent =
            "Confirm";

    }

}


/* =========================================================
   CONFIRM ORDER ACTION
========================================================= */

async function confirmOrderAction() {

    if (
        !state.currentAction ||
        state.actionInProgress
    ) {

        return;

    }


    const {
        action,
        orderId
    } =
        state.currentAction;


    state.actionInProgress =
        true;


    if (
        DOM.confirmButton
    ) {

        DOM.confirmButton.disabled =
            true;


        DOM.confirmButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Processing...

        `;

    }


    try {

        await updateOrderStatus(
            orderId,
            action
        );


        /*
         * Close the modal only after the update
         * succeeds.
         */

        state.actionInProgress =
            false;


        DOM.modal?.classList.add(
            "hidden"
        );


        document.body.classList.remove(
            "modal-open"
        );


        state.currentAction =
            null;


        showToast(

            action ===
            "approve"

                ? "Payment approved successfully."

                : "Payment rejected successfully."

        );


        /*
         * Refresh order data from Firestore.
         */

        await loadOrders();

    } catch (error) {

        console.error(
            "Order update error:",
            error
        );


        showToast(
            getFirestoreErrorMessage(
                error
            )
        );


        if (
            DOM.confirmButton
        ) {

            DOM.confirmButton.disabled =
                false;


            DOM.confirmButton.textContent =

                action ===
                "approve"

                    ? "Approve Payment"

                    : "Reject Payment";

        }


        state.actionInProgress =
            false;

    }

}


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

async function updateOrderStatus(
    orderId,
    action
) {

    /*
     * SECURITY CHECK
     * ------------------------------------------------------
     * Always verify the Admin Auth instance immediately
     * before modifying Firestore.
     */

    const user =
        getCurrentAuthorizedAdmin();


    if (
        !user
    ) {

        throw createFirebaseError(
            "unauthenticated",
            "Administrator is not signed in."
        );

    }


    if (
        !orderId
    ) {

        throw new Error(
            "Order ID is missing."
        );

    }


    if (
        ![
            "approve",
            "reject"
        ].includes(
            action
        )
    ) {

        throw new Error(
            "Invalid order action."
        );

    }


    /*
     * Make sure the order still exists in our
     * current local state.
     */

    const existingOrder =
        state.orders.find(
            order =>
                String(
                    order.id
                ) ===
                String(
                    orderId
                )
        );


    if (
        !existingOrder
    ) {

        throw new Error(
            "The selected order is no longer available."
        );

    }


    /*
     * Prevent double-processing.
     */

    const existingStatus =
        normalizeStatus(
            getOrderStatus(
                existingOrder
            )
        );


    if (
        existingStatus !==
        "pending"
    ) {

        throw new Error(
            "This order has already been reviewed."
        );

    }


    const newStatus =
        action ===
        "approve"

            ? "Approved"

            : "Rejected";


    const orderRef =
        doc(
            adminDb,
            "orders",
            orderId
        );


    /*
     * Update all relevant status fields together.
     */

    await updateDoc(
        orderRef,
        {

            status:
                newStatus,

            "payment.paymentStatus":
                newStatus,

            "verification.status":
                newStatus,

            "verification.reviewedAt":
                serverTimestamp(),

            "verification.reviewedBy":
                normalizeEmail(
                    user.email
                ),

            updatedAt:
                serverTimestamp()

        }
    );


    console.log(
        "Order updated successfully:",
        {
            orderId,
            status: newStatus,
            reviewedBy: normalizeEmail(
                user.email
            )
        }
    );

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    let pending =
        0;

    let approved =
        0;

    let rejected =
        0;


    state.orders.forEach(
        order => {

            const status =
                normalizeStatus(
                    getOrderStatus(
                        order
                    )
                );


            if (
                status ===
                "approved"
            ) {

                approved++;

            }

            else if (
                status ===
                "rejected"
            ) {

                rejected++;

            }

            else {

                pending++;

            }

        }
    );


    setText(
        "statTotalOrders",
        state.orders.length
    );


    setText(
        "statPending",
        pending
    );


    setText(
        "statApproved",
        approved
    );


    setText(
        "statRejected",
        rejected
    );

}


/* =========================================================
   ADMIN LOGOUT
========================================================= */

async function handleLogout() {

    if (
        state.loginInProgress ||
        state.actionInProgress
    ) {

        return;

    }


    try {

        /*
         * Only Admin Auth is signed out.
         *
         * Customer Auth is completely untouched.
         */

        await signOut(
            adminAuth
        );


        state.orders =
            [];

        state.currentAction =
            null;


        updateStatistics();

        renderOrders();


        showLoginView();


        showToast(
            "Admin signed out successfully."
        );


        console.log(
            "Admin signed out. Customer authentication was not modified."
        );

    } catch (error) {

        console.error(
            "Admin logout error:",
            error
        );


        showToast(
            "Unable to sign out Admin. Please try again."
        );

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    if (
        !DOM.toast
    ) {

        return;

    }


    DOM.toast.textContent =
        String(
            message || ""
        );


    DOM.toast.classList.add(
        "show"
    );


    clearTimeout(
        DOM.toast.__timer
    );


    DOM.toast.__timer =
        window.setTimeout(
            () => {

                DOM.toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        $(id);


    if (
        element
    ) {

        element.textContent =
            String(
                value ?? ""
            );

    }

}


/* =========================================================
   CURRENCY FORMAT
========================================================= */

function formatCurrency(
    value
) {

    const number =
        Number(
            value
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return "0";

    }


    return number.toLocaleString(
        "en-IN",
        {

            minimumFractionDigits:
                0,

            maximumFractionDigits:
                2

        }
    );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    timestamp
) {

    if (
        timestamp ===
        null ||
        timestamp ===
        undefined
    ) {

        return "Date unavailable";

    }


    let date =
        null;


    /*
     * Firestore Timestamp
     */

    if (
        typeof timestamp.toDate ===
        "function"
    ) {

        date =
            timestamp.toDate();

    }


    /*
     * Serialized Firestore Timestamp
     */

    else if (
        typeof timestamp.seconds !==
        "undefined"
    ) {

        const seconds =
            Number(
                timestamp.seconds
            );


        const nanoseconds =
            Number(
                timestamp.nanoseconds ||
                0
            );


        if (
            Number.isFinite(
                seconds
            )
        ) {

            date =
                new Date(

                    (
                        seconds *
                        1000
                    ) +

                    (
                        nanoseconds /
                        1000000
                    )

                );

        }

    }


    /*
     * JavaScript Date
     */

    else if (
        timestamp instanceof Date
    ) {

        date =
            timestamp;

    }


    /*
     * String / Number
     */

    else if (
        typeof timestamp ===
            "string" ||

        typeof timestamp ===
            "number"
    ) {

        date =
            new Date(
                timestamp
            );

    }


    if (
        !date ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return date.toLocaleString(
        "en-IN",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


/* =========================================================
   CHECK PLAIN OBJECT
========================================================= */

function isPlainObject(
    value
) {

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   ATTRIBUTE ESCAPE
========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   FIREBASE ERROR CREATOR
========================================================= */

function createFirebaseError(
    code,
    message
) {

    const error =
        new Error(
            message
        );


    error.code =
        `auth/${code}`;


    return error;

}


/* =========================================================
   FIRESTORE ERROR MESSAGE
========================================================= */

function getFirestoreErrorMessage(
    error
) {

    const code =
        String(
            error?.code ||
            ""
        );


    switch (
        code
    ) {

        case "permission-denied":

        case "firestore/permission-denied":

            return (
                "Firebase denied this Admin operation. " +
                "Check your Firestore Security Rules and make sure this Admin account is authorized."
            );


        case "failed-precondition":

        case "firestore/failed-precondition":

            return (
                "Firestore requires an index for this query. " +
                "Open the Firebase console and create the required index."
            );


        case "not-found":

        case "firestore/not-found":

            return (
                "The order could not be found. It may have been deleted."
            );


        case "unavailable":

        case "firestore/unavailable":

            return (
                "Firebase is temporarily unavailable. Please try again."
            );


        case "unauthenticated":

        case "auth/unauthenticated":

            return (
                "Your Admin session has expired. Please sign in again."
            );


        case "deadline-exceeded":

            return (
                "Firebase took too long to respond. Please try again."
            );


        case "resource-exhausted":

            return (
                "Firebase temporarily rejected the request because a resource limit was reached."
            );


        default:

            if (
                error?.message
            ) {

                return error.message;

            }


            return (
                "Unable to complete the Firebase operation."
            );

    }

}

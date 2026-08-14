/* =========================================================
   JEEVA NADI BOOKS
   ADVANCED ADMIN PANEL
   ---------------------------------------------------------
   Firebase Authentication + Firestore
   ---------------------------------------------------------
   IMPORTANT ARCHITECTURE

   ADMIN AUTH IS COMPLETELY SEPARATED FROM CUSTOMER AUTH.

   Customer account.js:
       default Firebase App
       default Firebase Auth

   Admin admin.js:
       named Firebase App: "JeevaNadiAdmin"
       separate Firebase Auth persistence

   Therefore:

       Admin login
             ↓
       DOES NOT replace
       customer login session

       Admin logout
             ↓
       DOES NOT sign customer out

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
   FIREBASE APP INITIALIZATION
========================================================= */

/*
 * DO NOT use the default Firebase Auth instance here.
 *
 * The Store account page uses the default Firebase app.
 *
 * We create a separate named Firebase app for Admin.
 */

const ADMIN_APP_NAME =
    "JeevaNadiAdmin";


let adminApp;


/*
 * Prevent duplicate initialization if this script
 * is ever loaded more than once.
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

/*
 * IMPORTANT
 *
 * browserSessionPersistence means the Admin login
 * belongs only to the Admin browser session/tab.
 *
 * More importantly, because Admin uses a NAMED Firebase
 * APP, its Auth persistence storage is separate from the
 * Store's default Firebase Auth persistence.
 */

let adminPersistenceReady =
    false;


async function initializeAdminPersistence() {

    if (adminPersistenceReady) {

        return;

    }


    try {

        await setPersistence(
            adminAuth,
            browserSessionPersistence
        );


        adminPersistenceReady =
            true;


        console.log(
            "Admin Auth persistence initialized."
        );


    } catch (error) {

        console.error(
            "Unable to initialize Admin Auth persistence:",
            error
        );


        throw error;

    }

}


/* =========================================================
   AUTHORIZED ADMIN EMAILS
========================================================= */

/*
 * ONLY these two accounts are administrators.
 *
 * Normal Store customers must NOT be added here.
 */

const ADMIN_EMAILS =
    new Set([

        "sathvikdobbala@gmail.com",

        "info@jeevanadiministries.org"

    ]);


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    orders:
        [],

    currentAction:
        null,

    loginInProgress:
        false,

    loadingOrders:
        false,

    actionInProgress:
        false

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


async function initializeAdmin() {

    console.log(
        "Jeeva Nadi Books — Admin Engine initializing..."
    );


    setupEventListeners();


    try {

        /*
         * IMPORTANT:
         *
         * Configure Admin Auth before observing
         * or starting Google authentication.
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


    DOM.loginButton?.addEventListener(
        "click",
        handleAdminLogin
    );


    DOM.logoutButton?.addEventListener(
        "click",
        handleLogout
    );


    DOM.refreshButton?.addEventListener(
        "click",
        () => loadOrders(true)
    );


    DOM.filter?.addEventListener(
        "change",
        renderOrders
    );


    DOM.cancelButton?.addEventListener(
        "click",
        closeActionModal
    );


    DOM.modalBackdrop?.addEventListener(
        "click",
        closeActionModal
    );


    DOM.confirmButton?.addEventListener(
        "click",
        confirmOrderAction
    );


    DOM.ordersList?.addEventListener(
        "click",
        handleOrderActionClick
    );


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

    onAuthStateChanged(
        adminAuth,
        async user => {

            console.log(
                "Admin Authentication state:",
                user
                    ? user.email
                    : "Signed out"
            );


            try {

                /*
                 * No ADMIN user.
                 */

                if (!user) {

                    state.orders =
                        [];

                    renderOrders();

                    updateStatistics();

                    showLoginView();

                    return;

                }


                const email =
                    normalizeEmail(
                        user.email
                    );


                /*
                 * Check Admin whitelist.
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


            } catch (error) {

                console.error(
                    "Admin authentication state error:",
                    error
                );


                showLoginView();


                showLoginMessage(
                    "Unable to initialize the Admin panel. Please refresh and try again.",
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   NORMALIZE EMAIL
========================================================= */

function normalizeEmail(email) {

    return String(
        email || ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   CHECK ADMIN AUTHORIZATION
========================================================= */

function isAuthorizedAdmin(email) {

    return ADMIN_EMAILS.has(
        normalizeEmail(
            email
        )
    );

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
        "Unauthorized admin account:",
        email
    );


    /*
     * IMPORTANT:
     *
     * This is adminAuth.signOut().
     *
     * It DOES NOT sign out the Store's default
     * Firebase Auth instance.
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
         * Make absolutely sure Admin persistence is ready.
         */

        await initializeAdminPersistence();


        const provider =
            new GoogleAuthProvider();


        provider.setCustomParameters({

            /*
             * Always allow the administrator to choose
             * which Google account to use.
             */

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


        if (!user) {

            throw new Error(
                "Google authentication did not return an Admin user."
            );

        }


        const email =
            normalizeEmail(
                user.email
            );


        console.log(
            "Admin Google login successful:",
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
             * IMPORTANT:
             *
             * Only adminAuth is signed out.
             *
             * Customer account remains untouched.
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
         * Authorized admin.
         *
         * onAuthStateChanged() handles the dashboard.
         */

        console.log(
            "Authorized Admin:",
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
   LOGIN BUTTON STATE
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
        loading;


    if (loading) {

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
                "This website is not authorized in Firebase Authentication. Add this domain under Firebase Authentication → Settings → Authorized domains.";

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
                "Google authentication credentials were invalid. Refresh the page and try again.";

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
   ADMIN DASHBOARD VIEW
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
        message;


    DOM.loginMessage.className =
        `admin-message ${type}`;

}


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
        adminAuth.currentUser;


    if (
        !user
    ) {

        return;

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

        console.warn(
            "Order loading blocked because current Admin is unauthorized:",
            email
        );

        return;

    }


    state.loadingOrders =
        true;


    setOrdersLoading(
        true
    );


    try {

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
         * Make sure Admin has not changed while
         * the Firestore request was running.
         */

        const currentAdmin =
            adminAuth.currentUser;


        if (
            !currentAdmin
        ) {

            return;

        }


        if (
            !isAuthorizedAdmin(
                currentAdmin.email
            )
        ) {

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
                "Orders refreshed."
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

    DOM.ordersLoading?.classList.toggle(
        "hidden",
        !loading
    );


    if (
        loading
    ) {

        DOM.ordersEmpty?.classList.add(
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

        return state.orders;

    }


    return state.orders.filter(
        order => {

            return (
                getOrderStatus(
                    order
                )
                    .toLowerCase() ===
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

    return String(

        order?.verification?.status ||

        order?.status ||

        order?.payment?.paymentStatus ||

        "Pending"

    )
        .trim();

}


/* =========================================================
   STATUS PILL CLASS
========================================================= */

function getStatusPillClass(
    status
) {

    const normalized =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    if (
        normalized === "approved"
    ) {

        return "status-pill-approved";

    }


    if (
        normalized === "rejected"
    ) {

        return "status-pill-rejected";

    }


    return "status-pill-pending";

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


    const customer =
        order.customer ||
        {};


    const payment =
        order.payment ||
        {};


    const pricing =
        order.pricing ||
        {};


    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    const normalizedStatus =
        status
            .toLowerCase();


    const statusClass =

        normalizedStatus ===
        "approved"

            ? "status-approved"

            : normalizedStatus ===
              "rejected"

                ? "status-rejected"

                : "status-pending";


    const paymentStatus =
        payment.paymentStatus ||
        status;


    const verificationStatus =
        order?.verification?.status ||
        "Pending";


    const paymentPillClass =
        getStatusPillClass(
            paymentStatus
        );


    const verificationPillClass =
        getStatusPillClass(
            verificationStatus
        );


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


            <div class="order-info-box">

                <h4>
                    Shipping
                </h4>

                ${renderShipping(
                    order.shippingAddress
                )}

            </div>


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


        <div class="order-items">

            <h4>
                Purchased Books
            </h4>

            ${renderItems(
                items
            )}

        </div>


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
            normalizedStatus ===
            "pending"

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
   SHIPPING
========================================================= */

function renderShipping(
    address
) {

    if (
        !address
    ) {

        return "<p>—</p>";

    }


    return `

        <p>

            ${escapeHTML(
                address.address ||
                "—"
            )}

        </p>


        <p>

            ${escapeHTML(
                address.city ||
                ""
            )}

            ${
                address.city &&
                address.state
                    ? ", "
                    : ""
            }

            ${escapeHTML(
                address.state ||
                ""
            )}

        </p>


        <p>

            <strong>

                ${escapeHTML(
                    address.pincode ||
                    ""
                )}

            </strong>

        </p>

    `;

}


/* =========================================================
   RENDER PURCHASED ITEMS
========================================================= */

function renderItems(
    items
) {

    if (
        !items.length
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

                const image =
                    item.image ||
                    "./images/account.png";


                const quantity =
                    Math.max(
                        1,
                        Number(
                            item.quantity ||
                            1
                        )
                    );


                const price =
                    Number(

                        item.lineTotal ??

                        (
                            Number(
                                item.price ||
                                0
                            ) *
                            quantity
                        )

                    );


                return `

                    <div class="order-item">


                        <img
                            class="order-item-image"
                            src="${escapeAttribute(
                                image
                            )}"
                            alt=""
                            onerror="this.onerror=null;this.src='./images/account.png';"
                        >


                        <div class="order-item-details">


                            <div class="order-item-name">

                                ${escapeHTML(
                                    item.name ||
                                    item.title ||
                                    "Book"
                                )}

                            </div>


                            ${
                                item.variant

                                    ? `

                                        <div
                                            class="order-item-variant"
                                        >

                                            ${escapeHTML(
                                                item.variant
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
   ORDER ACTION BUTTON
========================================================= */

function handleOrderActionClick(
    event
) {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (
        !button
    ) {

        return;

    }


    const action =
        button.dataset.action;


    const orderId =
        button.dataset.orderId;


    if (
        !orderId ||
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
            "Action modal elements are missing from the HTML."
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

    DOM.modal?.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "modal-open"
    );


    state.currentAction =
        null;


    state.actionInProgress =
        false;


    if (
        DOM.confirmButton
    ) {

        DOM.confirmButton.disabled =
            false;

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


        closeActionModal();


        showToast(

            action ===
            "approve"

                ? "Payment approved successfully."

                : "Payment rejected successfully."

        );


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


    } finally {

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
     * IMPORTANT:
     *
     * Check the ADMIN auth instance,
     * NOT the Store auth instance.
     */

    const user =
        adminAuth.currentUser;


    if (
        !user
    ) {

        throw new Error(
            "Administrator is not signed in."
        );

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

        throw new Error(
            "Unauthorized administrator."
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
                email,

            updatedAt:
                serverTimestamp()

        }
    );


    console.log(
        "Order updated:",
        orderId,
        newStatus,
        email
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
                getOrderStatus(
                    order
                )
                    .toLowerCase();


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

    try {

        /*
         * IMPORTANT:
         *
         * Only Admin Auth is signed out.
         *
         * The Store account.js Auth session is untouched.
         */

        await signOut(
            adminAuth
        );


        state.orders =
            [];


        state.currentAction =
            null;


        renderOrders();


        updateStatistics();


        showLoginView();


        showToast(
            "Admin signed out successfully."
        );


        console.log(
            "Admin signed out. Store customer session was not modified."
        );


    } catch (error) {

        console.error(
            "Admin logout error:",
            error
        );


        showToast(
            "Unable to sign out Admin."
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
        message;


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
                value
            );

    }

}


/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(
    value
) {

    const number =
        Number(
            value ||
            0
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
        !timestamp
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
     * Firestore serialized timestamp
     */

    else if (
        typeof timestamp.seconds !==
        "undefined"
    ) {

        date =
            new Date(
                Number(
                    timestamp.seconds
                ) * 1000
            );

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
     * String / number
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
   HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
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


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

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


    if (
        code ===
        "permission-denied"
    ) {

        return (
            "Firebase denied this Admin operation. " +
            "Check that the published Firestore rules authorize the Admin account."
        );

    }


    if (
        code ===
        "failed-precondition"
    ) {

        return (
            "Firestore requires an index for this query."
        );

    }


    if (
        code ===
        "not-found"
    ) {

        return (
            "The order could not be found. It may have been deleted."
        );

    }


    if (
        code ===
        "unavailable"
    ) {

        return (
            "Firebase is temporarily unavailable. Please try again."
        );

    }


    if (
        code ===
        "unauthenticated"
    ) {

        return (
            "Your Admin session has expired. Please sign in again."
        );

    }


    if (
        error?.message
    ) {

        return error.message;

    }


    return (
        "Unable to complete the Firebase operation."
    );

}
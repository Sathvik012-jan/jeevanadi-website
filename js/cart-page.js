/* =========================================================
   JEEVA NADI BOOKS
   CART PAGE CONTROLLER
   File: js/cart-page.js

   Responsibilities:
   - Render cart items
   - Display real product images
   - Quantity + / -
   - Remove individual products
   - Clear complete cart
   - Calculate subtotal / total
   - Empty cart design
   - Checkout navigation
   - Cart event synchronization
   - Handles Firebase/cart loading delay
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

let cartPageReady = false;
let renderTimer = null;
let lastRenderedSignature = "";


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector) {
    return document.querySelector(selector);
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatMoney(value) {

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "₹0.00";
    }

    return amount.toLocaleString(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


function normalizeQuantity(value) {

    const quantity =
        Number(value);

    if (
        !Number.isFinite(quantity) ||
        quantity < 1
    ) {
        return 1;
    }

    return Math.floor(quantity);
}


function normalizePrice(value) {

    const price =
        Number(value);

    if (!Number.isFinite(price)) {
        return 0;
    }

    return price;
}


/* =========================================================
   CART ENGINE
========================================================= */

function getCartEngine() {

    return window.JeevaNadiCart || null;
}


function getCartItems() {

    const cart =
        getCartEngine();

    if (!cart) {
        return [];
    }

    try {

        if (
            typeof cart.getItems ===
            "function"
        ) {
            return cart.getItems() || [];
        }


        if (
            typeof cart.items ===
            "function"
        ) {
            return cart.items() || [];
        }


        return [];

    } catch (error) {

        console.error(
            "Unable to read cart items:",
            error
        );

        return [];
    }
}


function getCartCount(items) {

    const cart =
        getCartEngine();

    if (
        cart &&
        typeof cart.count ===
        "function"
    ) {

        return Number(
            cart.count()
        ) || 0;
    }


    return items.reduce(
        (
            total,
            item
        ) => {

            return total +
                normalizeQuantity(
                    item.quantity
                );

        },
        0
    );
}


function getCartSubtotal(items) {

    const cart =
        getCartEngine();

    if (
        cart &&
        typeof cart.subtotal ===
        "function"
    ) {

        return Number(
            cart.subtotal()
        ) || 0;
    }


    return items.reduce(
        (
            total,
            item
        ) => {

            return total +
                (
                    normalizePrice(
                        item.price
                    ) *
                    normalizeQuantity(
                        item.quantity
                    )
                );

        },
        0
    );
}


/* =========================================================
   IMAGE HELPERS
========================================================= */

function getItemImage(item) {

    const image =
        String(
            item?.image ??
            item?.img ??
            item?.imageUrl ??
            item?.thumbnail ??
            ""
        ).trim();

    return image;
}


function getImageHTML(item) {

    const image =
        getItemImage(item);

    const name =
        escapeHTML(
            item?.name ??
            item?.product ??
            item?.title ??
            "Product"
        );


    /*
     * REAL PRODUCT IMAGE
     */

    if (image) {

        return `
            <div class="jn-cart-product-image-wrap">

                <img
                    src="${escapeHTML(image)}"
                    alt="${name}"
                    class="jn-cart-product-image"
                    loading="eager"
                    decoding="async"
                    data-cart-image="true"
                >

            </div>
        `;
    }


    /*
     * NO IMAGE AVAILABLE
     */

    return `
        <div class="jn-cart-product-image-wrap jn-cart-no-image">

            <div class="jn-cart-no-image-icon">
                📖
            </div>

            <span>
                Jeeva Nadi Books
            </span>

        </div>
    `;
}


/* =========================================================
   IMAGE ERROR HANDLING
========================================================= */

function setupImageFallbacks() {

    document
        .querySelectorAll(
            "img[data-cart-image='true']"
        )
        .forEach(
            image => {

                if (
                    image.dataset.fallbackReady
                ) {
                    return;
                }

                image.dataset.fallbackReady =
                    "true";


                image.addEventListener(
                    "error",
                    function () {

                        const wrapper =
                            image.closest(
                                ".jn-cart-product-image-wrap"
                            );

                        if (!wrapper) {
                            return;
                        }


                        wrapper.classList.add(
                            "jn-cart-no-image"
                        );


                        wrapper.innerHTML = `
                            <div class="jn-cart-no-image-icon">
                                📖
                            </div>

                            <span>
                                Image unavailable
                            </span>
                        `;
                    }
                );
            }
        );
}


/* =========================================================
   EMPTY CART
========================================================= */

function renderEmptyCart() {

    return `
        <div class="jn-cart-empty-state">

            <div class="jn-cart-empty-glow"></div>


            <div class="jn-cart-empty-icon-wrap">

                <div class="jn-cart-empty-icon">
                    🛒
                </div>

            </div>


            <span class="jn-cart-empty-label">
                YOUR CART IS WAITING
            </span>


            <h3>
                Your Cart Is Empty
            </h3>


            <p class="jn-cart-empty-main-text">
                You haven't added any books yet.
            </p>


            <p class="jn-cart-empty-subtext">
                Discover Bibles, Christian books,
                worship resources and meaningful
                gifts from Jeeva Nadi Books.
            </p>


            <a
                href="books.html"
                class="jn-cart-empty-button"
            >

                <span>
                    Explore Books
                </span>

                <span>
                    →
                </span>

            </a>


            <div class="jn-cart-empty-features">

                <div class="jn-cart-empty-feature">

                    <span>
                        📖
                    </span>

                    <small>
                        Christian Books
                    </small>

                </div>


                <div class="jn-cart-empty-feature">

                    <span>
                        ✝
                    </span>

                    <small>
                        Bibles & Resources
                    </small>

                </div>


                <div class="jn-cart-empty-feature">

                    <span>
                        🎁
                    </span>

                    <small>
                        Meaningful Gifts
                    </small>

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   PRODUCT DESCRIPTION
========================================================= */

function getProductDescription(item) {

    const category =
        String(
            item?.category || ""
        ).toLowerCase();


    if (
        category === "songs"
    ) {

        return `
            Worship collection featuring
            Christian hymns and worship songs.
        `;
    }


    if (
        category === "bibles"
    ) {

        return `
            Holy Bible edition for personal
            reading, study and devotion.
        `;
    }


    if (
        category === "covers"
    ) {

        return `
            Protective Bible cover selected
            according to your chosen option.
        `;
    }


    if (
        category === "calendars"
    ) {

        return `
            Jeeva Nadi Christian calendar
            for your home and daily use.
        `;
    }


    if (
        category === "promises"
    ) {

        return `
            Christian promise cards for
            encouragement and daily reflection.
        `;
    }


    return `
        Carefully selected Christian resources
        from Jeeva Nadi Books.
    `;
}


/* =========================================================
   CATEGORY LABEL
========================================================= */

function getCategoryLabel(item) {

    const category =
        String(
            item?.category || "books"
        )
        .trim()
        .toLowerCase();


    const labels = {

        books:
            "BOOKS",

        bibles:
            "BIBLES",

        songs:
            "SONGS",

        covers:
            "BIBLE ACCESSORIES",

        calendars:
            "CALENDARS",

        promises:
            "PROMISE CARDS",

        gifts:
            "CHRISTIAN GIFTS"

    };


    return (
        labels[category] ||
        "BOOKS"
    );
}


/* =========================================================
   CART ITEM
========================================================= */

function renderCartItem(
    item,
    index
) {

    const key =
        String(
            item?.key ??
            item?.id ??
            `cart-item-${index}`
        );


    const productName =
        String(
            item?.name ??
            item?.product ??
            item?.title ??
            "Product"
        ).trim();


    const variant =
        String(
            item?.variant ??
            ""
        ).trim();


    const price =
        normalizePrice(
            item?.price
        );


    const quantity =
        normalizeQuantity(
            item?.quantity
        );


    const lineTotal =
        price * quantity;


    const safeKey =
        escapeHTML(key);


    const safeName =
        escapeHTML(productName);


    const safeVariant =
        escapeHTML(variant);


    const categoryLabel =
        escapeHTML(
            getCategoryLabel(item)
        );


    const description =
        escapeHTML(
            getProductDescription(item)
        );


    return `
        <article
            class="jn-cart-item"
            data-cart-key="${safeKey}"
        >


            <!-- =============================================
                 PRODUCT IMAGE
            ============================================== -->

            ${getImageHTML(item)}


            <!-- =============================================
                 PRODUCT INFORMATION
            ============================================== -->

            <div class="jn-cart-product-info">


                <span class="jn-cart-product-category">
                    ${categoryLabel}
                </span>


                <h3 class="jn-cart-product-name">
                    ${safeName}
                </h3>


                ${
                    variant
                        ? `
                            <p class="jn-cart-product-variant">
                                ${safeVariant}
                            </p>
                          `
                        : ""
                }


                <p class="jn-cart-product-description">
                    ${description}
                </p>


                <div class="jn-cart-product-unit-price">
                    ${formatMoney(price)}
                    <span>
                        per item
                    </span>
                </div>

            </div>


            <!-- =============================================
                 RIGHT SIDE CONTROLS
            ============================================== -->

            <div class="jn-cart-product-actions">


                <!-- LINE TOTAL -->

                <strong
                    class="jn-cart-line-total"
                >
                    ${formatMoney(lineTotal)}
                </strong>


                <!-- QUANTITY -->

                <div class="jn-cart-quantity-section">

                    <span class="jn-cart-quantity-label">
                        Quantity
                    </span>


                    <div
                        class="jn-cart-quantity-control"
                    >

                        <button
                            type="button"
                            class="jn-cart-quantity-button"
                            data-action="decrease"
                            data-cart-key="${safeKey}"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>


                        <span
                            class="jn-cart-quantity-value"
                            aria-live="polite"
                        >
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            class="jn-cart-quantity-button"
                            data-action="increase"
                            data-cart-key="${safeKey}"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>

                </div>


                <!-- REMOVE -->

                <button
                    type="button"
                    class="jn-cart-remove-button"
                    data-action="remove"
                    data-cart-key="${safeKey}"
                >
                    Remove
                </button>

            </div>

        </article>
    `;
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderCartItems(
    items
) {

    const container =
        $("#cart-items");

    if (!container) {
        return;
    }


    if (!items.length) {

        container.innerHTML =
            renderEmptyCart();

        return;
    }


    container.innerHTML =
        items
            .map(
                (
                    item,
                    index
                ) =>
                    renderCartItem(
                        item,
                        index
                    )
            )
            .join("");


    setupImageFallbacks();
}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary(
    items
) {

    const count =
        getCartCount(items);


    const subtotal =
        getCartSubtotal(items);


    const itemCount =
        $("#cart-item-count");


    const summaryItems =
        $("#cart-summary-items");


    const subtotalElement =
        $("#cart-subtotal");


    const deliveryElement =
        $("#cart-delivery");


    const totalElement =
        $("#cart-total");


    const clearButton =
        $("#clear-cart");


    const checkoutButton =
        $("#proceed-checkout");


    if (itemCount) {

        itemCount.textContent =
            String(count);
    }


    if (summaryItems) {

        summaryItems.textContent =
            String(count);
    }


    if (subtotalElement) {

        subtotalElement.textContent =
            formatMoney(subtotal);
    }


    /*
     * Delivery is currently FREE
     */

    if (deliveryElement) {

        deliveryElement.textContent =
            count > 0
                ? "FREE"
                : "—";

        deliveryElement.classList.toggle(
            "is-free",
            count > 0
        );
    }


    if (totalElement) {

        totalElement.textContent =
            formatMoney(subtotal);
    }


    if (clearButton) {

        clearButton.disabled =
            count === 0;
    }


    if (checkoutButton) {

        checkoutButton.disabled =
            count === 0;
    }
}


/* =========================================================
   FULL RENDER
========================================================= */

function renderCart() {

    const cart =
        getCartEngine();


    if (!cart) {

        scheduleRender();

        return;
    }


    /*
     * Do not show false empty state while
     * Firebase authentication is resolving.
     */

    if (
        typeof cart.isAuthenticationReady ===
        "function" &&
        !cart.isAuthenticationReady()
    ) {

        const container =
            $("#cart-items");

        if (container) {

            container.innerHTML = `
                <div class="jn-cart-loading">
                    <div class="jn-cart-loading-spinner"></div>

                    <strong>
                        Loading your cart...
                    </strong>

                    <span>
                        Please wait a moment.
                    </span>
                </div>
            `;
        }

        return;
    }


    const items =
        getCartItems();


    const signature =
        JSON.stringify(
            items.map(
                item => ({
                    key:
                        item.key ??
                        item.id,

                    quantity:
                        item.quantity,

                    price:
                        item.price,

                    image:
                        item.image
                })
            )
        );


    /*
     * Avoid unnecessary DOM rebuilds.
     */

    if (
        signature ===
        lastRenderedSignature
    ) {

        updateSummary(
            items
        );

        return;
    }


    lastRenderedSignature =
        signature;


    renderCartItems(
        items
    );


    updateSummary(
        items
    );


    cartPageReady =
        true;
}


/* =========================================================
   RENDER RETRY
========================================================= */

function scheduleRender() {

    clearTimeout(
        renderTimer
    );


    renderTimer =
        window.setTimeout(
            function () {

                renderCart();

            },
            150
        );
}


/* =========================================================
   QUANTITY UPDATE
========================================================= */

function changeQuantity(
    key,
    direction
) {

    const cart =
        getCartEngine();


    if (!cart) {
        return;
    }


    const identifier =
        String(key);


    let success =
        false;


    try {

        if (
            direction ===
            "increase"
        ) {

            if (
                typeof cart.increment ===
                "function"
            ) {

                success =
                    cart.increment(
                        identifier
                    );

            } else {

                const item =
                    typeof cart.find ===
                    "function"
                        ? cart.find(
                            identifier
                        )
                        : null;


                if (item) {

                    success =
                        cart.updateQuantity(
                            identifier,
                            normalizeQuantity(
                                item.quantity
                            ) + 1
                        );
                }
            }
        }


        if (
            direction ===
            "decrease"
        ) {

            if (
                typeof cart.decrement ===
                "function"
            ) {

                success =
                    cart.decrement(
                        identifier
                    );

            } else {

                const item =
                    typeof cart.find ===
                    "function"
                        ? cart.find(
                            identifier
                        )
                        : null;


                if (item) {

                    const quantity =
                        normalizeQuantity(
                            item.quantity
                        );


                    if (
                        quantity <= 1
                    ) {

                        success =
                            cart.remove(
                                identifier
                            );

                    } else {

                        success =
                            cart.updateQuantity(
                                identifier,
                                quantity - 1
                            );
                    }
                }
            }
        }

    } catch (error) {

        console.error(
            "Quantity update failed:",
            error
        );
    }


    if (success) {

        /*
         * cart.js emits jeevaNadiCartUpdated.
         * The event listener below will render.
         */

        return;
    }


    scheduleRender();
}


/* =========================================================
   REMOVE PRODUCT
========================================================= */

function removeItem(
    key
) {

    const cart =
        getCartEngine();


    if (!cart) {
        return;
    }


    try {

        cart.remove(
            String(key)
        );

    } catch (error) {

        console.error(
            "Unable to remove cart item:",
            error
        );

        scheduleRender();
    }
}


/* =========================================================
   CLEAR COMPLETE CART
========================================================= */

function clearCompleteCart() {

    const cart =
        getCartEngine();


    if (!cart) {
        return;
    }


    const items =
        getCartItems();


    if (!items.length) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to remove all items from your cart?"
        );


    if (!confirmed) {
        return;
    }


    try {

        /*
         * Use the official cart engine first.
         */

        if (
            typeof cart.clear ===
            "function"
        ) {

            cart.clear();
        }


        /*
         * Also remove older legacy keys.
         *
         * This is important because old versions
         * of the cart used multiple localStorage keys.
         */

        const legacyKeys = [
            "JeevaNadiCart",
            "jeevaNadiCart",
            "jeeva-nadi-cart",
            "booksCart",
            "cart"
        ];


        legacyKeys.forEach(
            key => {

                try {

                    localStorage.removeItem(
                        key
                    );

                } catch (error) {

                    console.warn(
                        "Unable to remove old cart key:",
                        key
                    );
                }
            }
        );


        /*
         * Remove UID-specific cart too.
         */

        try {

            const user =
                typeof cart.getUser ===
                "function"
                    ? cart.getUser()
                    : null;


            if (
                user?.uid
            ) {

                localStorage.removeItem(
                    `JeevaNadiCart_UID_${user.uid}`
                );
            }

        } catch (error) {

            console.warn(
                "Unable to clear UID cart:",
                error
            );
        }


        /*
         * Force page refresh of the cart UI.
         */

        lastRenderedSignature =
            "";


        renderCart();


    } catch (error) {

        console.error(
            "Clear cart failed:",
            error
        );
    }
}


/* =========================================================
   CHECKOUT
========================================================= */

function proceedToCheckout() {

    const cart =
        getCartEngine();


    if (!cart) {
        return;
    }


    const items =
        getCartItems();


    if (!items.length) {

        window.alert(
            "Your cart is empty."
        );

        return;
    }


    window.location.href =
        "checkout.html";
}


/* =========================================================
   CLICK EVENTS
========================================================= */

function setupClickEvents() {

    document.addEventListener(
        "click",
        function (event) {


            /*
             * Quantity buttons
             */

            const quantityButton =
                event.target.closest(
                    "[data-action='increase'], [data-action='decrease']"
                );


            if (quantityButton) {

                event.preventDefault();


                const key =
                    quantityButton.dataset.cartKey;


                const action =
                    quantityButton.dataset.action;


                if (
                    key &&
                    action
                ) {

                    changeQuantity(
                        key,
                        action
                    );
                }


                return;
            }


            /*
             * Remove
             */

            const removeButton =
                event.target.closest(
                    "[data-action='remove']"
                );


            if (removeButton) {

                event.preventDefault();


                const key =
                    removeButton.dataset.cartKey;


                if (key) {

                    removeItem(
                        key
                    );
                }


                return;
            }


            /*
             * Clear Cart
             */

            if (
                event.target.closest(
                    "#clear-cart"
                )
            ) {

                event.preventDefault();

                clearCompleteCart();

                return;
            }


            /*
             * Proceed to Checkout
             */

            if (
                event.target.closest(
                    "#proceed-checkout"
                )
            ) {

                event.preventDefault();

                proceedToCheckout();

                return;
            }

        }
    );
}


/* =========================================================
   CART EVENTS
========================================================= */

function setupCartEvents() {

    window.addEventListener(
        "jeevaNadiCartUpdated",
        function () {

            lastRenderedSignature =
                "";

            renderCart();

        }
    );


    window.addEventListener(
        "jeevaNadiCartReady",
        function () {

            lastRenderedSignature =
                "";

            renderCart();

        }
    );


    window.addEventListener(
        "jeevaNadiAuthChanged",
        function () {

            lastRenderedSignature =
                "";

            renderCart();

        }
    );
}


/* =========================================================
   STORAGE EVENTS
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "JeevaNadiCart" ||
            String(
                event.key || ""
            ).startsWith(
                "JeevaNadiCart_UID_"
            )
        ) {

            lastRenderedSignature =
                "";

            renderCart();
        }
    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeCartPage() {

    setupClickEvents();

    setupCartEvents();

    renderCart();


    /*
     * The cart engine is an ES module and Firebase
     * authentication is asynchronous.
     *
     * Retry briefly until the engine is available.
     */

    let attempts =
        0;


    const retry =
        window.setInterval(
            function () {

                attempts++;


                if (
                    window.JeevaNadiCart
                ) {

                    renderCart();
                }


                if (
                    attempts >= 40
                ) {

                    window.clearInterval(
                        retry
                    );
                }

            },
            250
        );
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCartPage
    );

} else {

    initializeCartPage();
}


/* =========================================================
   DEBUG API
========================================================= */

window.JeevaNadiCartPage = {

    refresh:
        function () {

            lastRenderedSignature =
                "";

            renderCart();
        },

    getItems:
        function () {

            return getCartItems();
        },

    isReady:
        function () {

            return cartPageReady;
        }

};


console.log(
    "Jeeva Nadi Cart Page loaded."
);
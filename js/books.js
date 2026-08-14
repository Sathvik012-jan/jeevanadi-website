/* ============================================================
   JEEVA NADI BOOKS
   PREMIUM STORE ENGINE
   ------------------------------------------------------------
   FILE:
   js/books.js

   BIBLE COVER HIERARCHY
   ------------------------------------------------------------

       LANGUAGE
           ↓
       COVER SIZE
           ↓
       COVER DESIGN
           ↓
       PRICE

   IMPORTANT
   ------------------------------------------------------------

   The DESIGN selector must NEVER contain the price.

   Correct:
       Floral Fabric

   Price:
       ₹100

   Incorrect:
       Floral Fabric — ₹100

   BIBLE COVER INVENTORY
   ------------------------------------------------------------

   ENGLISH
   Regular
      • Light Blue Fabric          ₹200
      • Floral Fabric              ₹100
      • Abstract Patterned         ₹200
      • Colorful Embroidered       ₹250

   TELUGU
   Regular
      • Dark Brown Leather         ₹150
      • Maroon Patterned           ₹250
      • Paisley Patterned          ₹500
      • Black Leather Pouch        ₹150
      • Red-Yellow Patterned       ₹500

   Small
      • Black Leather              ₹100

============================================================ */

"use strict";


/* ============================================================
   CART MODULE
============================================================ */

import "./cart.js";


/* ============================================================
   STORE CONFIGURATION
============================================================ */

const STORE = Object.freeze({

    selectors: Object.freeze({

        grid:
            "#store-product-grid, #product-grid",

        search:
            "#store-search, #book-search",

        searchButton:
            "#store-search-button, #search-button",

        categories:
            "[data-store-category], .jn-books-category-tab",

        sort:
            "#store-sort, #sort-products",

        result:
            "#store-result-count, #result-count",

        empty:
            "#store-empty, #empty-state",

        cartCount:
            "[data-store-cart-count], [data-cart-count], #cart-count",

        toast:
            "#store-toast, #storeToast"

    }),

    classes: Object.freeze({

        active:
            "is-active",

        added:
            "is-added",

        hidden:
            "store-product-hidden"

    })

});


/* ============================================================
   STORE STATE
============================================================ */

const state = {

    category: "all",

    search: "",

    sort: "featured",

    initialized: false

};


let toastTimer = null;


/* ============================================================
   BIBLE COVER DATABASE
   ------------------------------------------------------------
   SINGLE SOURCE OF TRUTH
============================================================ */

const BIBLE_COVERS = Object.freeze([

    /* ========================================================
       ENGLISH — REGULAR
    ======================================================== */

    Object.freeze({
        id: "english-light-blue",
        language: "English",
        size: "Regular",
        design: "Light Blue Fabric",
        name: "Light Blue Fabric English Bible",
        price: 200,
        image: "images/bc 3 english blue color.jpeg",
        imageFallbacks: [
            "images/bc 3 english blue color.jpeg"
        ],
        description:
            "Light blue fabric English Bible cover with a clean and elegant appearance."
    }),

    Object.freeze({
        id: "english-floral",
        language: "English",
        size: "Regular",
        design: "Floral Fabric",
        name: "Floral Fabric English Bible",
        price: 100,
        image: "images/bc 8 english.jpeg",
        imageFallbacks: [
            "images/bc 8 english.jpeg"
        ],
        description:
            "Floral fabric English Bible cover with beautiful decorative patterns."
    }),

    Object.freeze({
        id: "english-abstract",
        language: "English",
        size: "Regular",
        design: "Abstract Patterned",
        name: "Abstract Patterned English Bible",
        price: 200,
        image: "images/english bc 4 design.jpeg",
        imageFallbacks: [
            "images/english bc 4 design.jpeg",
            "images/english bc 4 design .jpeg"
        ],
        description:
            "Artistic abstract patterned English Bible cover with a colorful contemporary design."
    }),

    Object.freeze({
        id: "english-embroidered",
        language: "English",
        size: "Regular",
        design: "Colorful Embroidered",
        name: "Colorful Embroidered English Bible",
        price: 250,
        image: "images/english bc 7 design.jpeg",
        imageFallbacks: [
            "images/english bc 7 design.jpeg",
            "images/english bc 7 design .jpeg"
        ],
        description:
            "Colorful embroidered English Bible cover featuring decorative fabric work."
    }),


    /* ========================================================
       TELUGU — REGULAR
    ======================================================== */

    Object.freeze({
        id: "telugu-dark-brown",
        language: "Telugu",
        size: "Regular",
        design: "Dark Brown Leather",
        name: "Dark Brown Leather Telugu Bible",
        price: 150,
        image: "images/bc 2.jpeg",
        imageFallbacks: [
            "images/bc 2.jpeg"
        ],
        description:
            "Dark brown leather Bible cover designed for regular-size Telugu Bibles with a classic and durable finish."
    }),

    Object.freeze({
        id: "telugu-maroon",
        language: "Telugu",
        size: "Regular",
        design: "Maroon Patterned",
        name: "Maroon Patterned Telugu Bible",
        price: 250,
        image: "images/bc 5 telugu design.jpeg",
        imageFallbacks: [
            "images/bc 5 telugu design.jpeg"
        ],
        description:
            "Beautiful maroon patterned Telugu Bible cover with decorative fabric detailing."
    }),

    Object.freeze({
        id: "telugu-paisley",
        language: "Telugu",
        size: "Regular",
        design: "Paisley Patterned",
        name: "Paisley Patterned Telugu Bible",
        price: 500,
        image: "images/bc 6 telugu.jpeg",
        imageFallbacks: [
            "images/bc 6 telugu.jpeg"
        ],
        description:
            "Decorative paisley-patterned Telugu Bible cover with a distinctive traditional design."
    }),

    Object.freeze({
        id: "telugu-black-pouch",
        language: "Telugu",
        size: "Regular",
        design: "Black Leather Pouch",
        name: "Black Leather Telugu Bible Pouch",
        price: 150,
        image: "images/bc 10 telugu.jpeg",
        imageFallbacks: [
            "images/bc 10 telugu.jpeg"
        ],
        description:
            "Black leather-style Telugu Bible pouch designed to provide practical protection for your Bible."
    }),

    Object.freeze({
        id: "telugu-red-yellow",
        language: "Telugu",
        size: "Regular",
        design: "Red-Yellow Patterned",
        name: "Red-Yellow Patterned Telugu Bible",
        price: 500,
        image: "images/telugu bc 9.jpeg",
        imageFallbacks: [
            "images/telugu bc 9.jpeg"
        ],
        description:
            "Decorative red and yellow patterned Telugu Bible cover with a traditional fabric design."
    }),


    /* ========================================================
       TELUGU — SMALL
       --------------------------------------------------------
       THIS IS THE ONLY SMALL COVER.
    ======================================================== */

    Object.freeze({
        id: "telugu-black-small",
        language: "Telugu",
        size: "Small",
        design: "Black Leather",
        name: "Black Leather Telugu Bible",
        price: 100,
        image: "images/bc 1 small.jpeg",
        imageFallbacks: [
            "images/bc 1 small.jpeg",
            "images/bc 1.jpeg"
        ],
        description:
            "Small black leather Telugu Bible cover with a simple and elegant finish."
    })

]);


/* ============================================================
   DOM HELPERS
============================================================ */

function $(selector, root = document) {

    return root.querySelector(selector);

}


function $$(selector, root = document) {

    return Array.from(
        root.querySelectorAll(selector)
    );

}


/* ============================================================
   VALUE HELPERS
============================================================ */

function clean(value) {

    return String(value ?? "").trim();

}


function normalize(value) {

    return clean(value).toLowerCase();

}


function getNumber(value, fallback = 0) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


/* ============================================================
   PRODUCT GRID
============================================================ */

function getProductGrid() {

    return $(
        STORE.selectors.grid
    );

}


/* ============================================================
   PRODUCT CARDS
============================================================ */

function getProductCards() {

    const grid =
        getProductGrid();

    if (!grid) {
        return [];
    }

    let cards =
        $$(
            "[data-product-card]",
            grid
        );

    if (!cards.length) {

        cards =
            $$(
                ".jn-books-product-card",
                grid
            );

    }

    if (!cards.length) {

        cards =
            Array.from(
                grid.children
            ).filter(
                element =>
                    element.dataset.product ||
                    element.dataset.category ||
                    element.dataset.name
            );

    }

    return cards;

}


/* ============================================================
   CARD DATA
============================================================ */

function getCardPrice(card) {

    return getNumber(
        card?.dataset?.price,
        0
    );

}


function getCardName(card) {

    if (!card) {
        return "";
    }

    return clean(

        card.dataset.name ||

        $(
            "[data-product-name], " +
            ".product-name, " +
            ".jn-books-product-name, " +
            ".jn-books-product-title",
            card
        )?.textContent ||

        ""

    );

}


/* ============================================================
   SEARCH
============================================================ */

function setupSearch() {

    const input =
        $(STORE.selectors.search);

    const button =
        $(STORE.selectors.searchButton);

    if (!input) {
        return;
    }


    function performSearch() {

        state.search =
            normalize(input.value);

        refreshProducts();

    }


    input.addEventListener(
        "input",
        performSearch
    );


    input.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Enter") {
                return;
            }

            event.preventDefault();

            performSearch();

        }
    );


    button?.addEventListener(
        "click",
        performSearch
    );

}


/* ============================================================
   CATEGORY FILTER
============================================================ */

function setupCategories() {

    const buttons =
        $$(STORE.selectors.categories);

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    state.category =
                        normalize(
                            button.dataset.storeCategory ||
                            button.dataset.category ||
                            "all"
                        ) || "all";


                    buttons.forEach(
                        item => {

                            const active =
                                item === button;

                            item.classList.toggle(
                                STORE.classes.active,
                                active
                            );

                            item.classList.toggle(
                                "active",
                                active
                            );

                            item.setAttribute(
                                "aria-selected",
                                String(active)
                            );

                        }
                    );


                    refreshProducts();

                }
            );

        }
    );

}


/* ============================================================
   SORTING
============================================================ */

function setupSorting() {

    const select =
        $(STORE.selectors.sort);

    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        () => {

            state.sort =
                select.value ||
                "featured";

            applySorting();

            refreshProducts();

        }
    );

}

function storeOriginalProductOrder() {

    const cards = getProductCards();

    cards.forEach(
        (card, index) => {

            if (!card.dataset.originalOrder) {

                card.dataset.originalOrder =
                    index;

            }

        }
    );

}
/* ============================================================
   REFRESH PRODUCTS
============================================================ */

function refreshProducts() {

    const cards =
        getProductCards();

    let visible = 0;


    cards.forEach(
        card => {

            const category =
                normalize(
                    card.dataset.category
                );


            const name =
                normalize(
                    card.dataset.name
                );


            const searchable =
                normalize(
                    [
                        card.dataset.search,
                        card.textContent
                    ]
                        .filter(Boolean)
                        .join(" ")
                );


            const categoryMatch =
                state.category === "all" ||
                category === state.category;


            const searchMatch =
                !state.search ||
                name.includes(state.search) ||
                searchable.includes(state.search);


            const shouldShow =
                categoryMatch &&
                searchMatch;


            card.hidden =
                !shouldShow;


            card.classList.toggle(
                STORE.classes.hidden,
                !shouldShow
            );


            if (shouldShow) {
                visible++;
            }

        }
    );


    updateResultText(
        visible,
        cards.length
    );


    updateEmptyState(
        visible
    );

}


/* ============================================================
   RESULT TEXT
============================================================ */

function updateResultText(
    visible,
    total
) {

    const result =
        $(STORE.selectors.result);

    if (!result) {
        return;
    }


    if (state.search) {

        result.textContent =
            `${visible} ${
                visible === 1
                    ? "product"
                    : "products"
            } found for "${state.search}"`;

        return;

    }


    if (state.category === "all") {

        result.textContent =
            `Showing all ${total} products`;

        return;

    }


    result.textContent =
        `Showing ${visible} ${
            visible === 1
                ? "product"
                : "products"
        }`;

}


/* ============================================================
   EMPTY STATE
============================================================ */

function updateEmptyState(visible) {

    const empty =
        $(STORE.selectors.empty);

    if (!empty) {
        return;
    }

    empty.hidden =
        visible !== 0;

}


/* ============================================================
   IMAGE FALLBACK
============================================================ */

function setupImageFallback(
    image,
    sources
) {

    if (
        !image ||
        !Array.isArray(sources)
    ) {
        return;
    }


    const validSources =
        sources
            .map(clean)
            .filter(Boolean);


    if (!validSources.length) {
        return;
    }


    let currentIndex = 0;


    image.onerror = () => {

        currentIndex++;


        if (
            currentIndex >=
            validSources.length
        ) {

            console.warn(
                "Jeeva Nadi Books: All image paths failed:",
                validSources
            );

            return;

        }


        image.src =
            validSources[currentIndex];

    };

}


/* ============================================================
   PRODUCT IMAGE GALLERIES
============================================================ */

function setupProductGalleries() {

    const cards =
        getProductCards();


    cards.forEach(
        card => {

            const image =
                $(
                    "[data-gallery-image], " +
                    ".jn-books-product-image",
                    card
                );


            if (!image) {
                return;
            }


            const raw =
                image.dataset.galleryImages ||
                image.dataset.images;


            if (!raw) {

                hideGalleryControls(card);

                return;

            }


            let images = [];


            try {

                images =
                    JSON.parse(raw);

            }

            catch (error) {

                console.warn(
                    "Invalid gallery data:",
                    error
                );

                hideGalleryControls(card);

                return;

            }


            if (
                !Array.isArray(images) ||
                images.length <= 1
            ) {

                hideGalleryControls(card);

                return;

            }


            const previous =
                $(
                    "[data-gallery-prev], " +
                    ".jn-books-gallery-button.left",
                    card
                );


            const next =
                $(
                    "[data-gallery-next], " +
                    ".jn-books-gallery-button.right",
                    card
                );


            const dots =
                $(
                    "[data-gallery-dots], " +
                    ".jn-books-image-dots",
                    card
                );


            let index = 0;


            function render() {

                const source =
                    clean(images[index]);


                if (!source) {
                    return;
                }


                image.src =
                    source;


                renderDots(
                    dots,
                    images.length,
                    index
                );

            }


            function move(direction) {

                index =
                    (
                        index +
                        direction +
                        images.length
                    ) %
                    images.length;

                render();

            }


            previous?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    move(-1);

                }
            );


            next?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    move(1);

                }
            );


            render();

        }
    );

}


/* ============================================================
   HIDE GALLERY CONTROLS
============================================================ */

function hideGalleryControls(card) {

    $$(
        "[data-gallery-prev], " +
        "[data-gallery-next], " +
        "[data-gallery-dots], " +
        ".jn-books-gallery-button.left, " +
        ".jn-books-gallery-button.right, " +
        ".jn-books-image-dots",
        card
    )
    .forEach(
        element => {

            element.hidden = true;

        }
    );

}


/* ============================================================
   GALLERY DOTS
============================================================ */

function renderDots(
    container,
    total,
    active
) {

    if (!container) {
        return;
    }


    container.replaceChildren();


    for (
        let index = 0;
        index < total;
        index++
    ) {

        const dot =
            document.createElement("span");


        dot.className =
            "store-gallery-dot";


        dot.classList.toggle(
            "active",
            index === active
        );


        container.appendChild(dot);

    }

}


/* ============================================================
   BIBLE COVER DATABASE
   ------------------------------------------------------------
   DATABASE HELPERS
============================================================ */

function getCoversByLanguage(language) {

    const target =
        normalize(language);


    return BIBLE_COVERS.filter(
        cover =>
            normalize(cover.language) ===
            target
    );

}


function getCoversByLanguageAndSize(
    language,
    size
) {

    const targetLanguage =
        normalize(language);

    const targetSize =
        normalize(size);


    return BIBLE_COVERS.filter(
        cover =>
            normalize(cover.language) ===
                targetLanguage &&

            normalize(cover.size) ===
                targetSize
    );

}


function getAvailableSizes(language) {

    return [
        ...new Set(
            getCoversByLanguage(language)
                .map(
                    cover =>
                        cover.size
                )
        )
    ];

}


/* ============================================================
   SIZE SELECTOR
============================================================ */

function rebuildSizeSelector(
    select,
    language,
    preferredSize = ""
) {

    if (!select) {
        return "";
    }


    const sizes =
        getAvailableSizes(language);


    select.replaceChildren();


    sizes.forEach(
        size => {

            const option =
                document.createElement("option");


            option.value =
                size;


            option.textContent =
                size;


            select.appendChild(option);

        }
    );


    if (!sizes.length) {

        select.value = "";

        return "";

    }


    let selected =
        sizes.find(
            size =>
                normalize(size) ===
                normalize(preferredSize)
        );


    if (!selected) {

        selected =
            sizes.find(
                size =>
                    normalize(size) ===
                    "regular"
            );

    }


    if (!selected) {
        selected = sizes[0];
    }


    select.value =
        selected;


    return selected;

}


/* ============================================================
   DESIGN SELECTOR
   ------------------------------------------------------------
   IMPORTANT:
   PRICE IS NEVER DISPLAYED HERE.
============================================================ */

function rebuildCoverDesignSelector(
    select,
    language,
    size,
    preferredCoverId = ""
) {

    if (!select) {
        return [];
    }


    const covers =
        getCoversByLanguageAndSize(
            language,
            size
        );


    select.replaceChildren();


    covers.forEach(
        cover => {

            const option =
                document.createElement("option");


            option.value =
                cover.id;


            /*
             * ONLY THE DESIGN NAME IS VISIBLE.
             *
             * No price.
             */
            option.textContent =
                cover.design;


            /*
             * Internal data.
             * Price remains available to JS
             * but is NOT displayed.
             */

            option.dataset.coverId =
                cover.id;

            option.dataset.language =
                cover.language;

            option.dataset.size =
                cover.size;

            option.dataset.design =
                cover.design;

            option.dataset.price =
                String(cover.price);


            select.appendChild(option);

        }
    );


    if (!covers.length) {

        select.value = "";

        return [];

    }


    const preferred =
        covers.find(
            cover =>
                cover.id ===
                preferredCoverId
        );


    select.value =
        preferred
            ? preferred.id
            : covers[0].id;


    return covers;

}


/* ============================================================
   COVER TITLE
============================================================ */

function updateCoverTitle(
    card,
    selected
) {

    if (!selected) {
        return;
    }


    $$(
        "[data-cover-title], " +
        ".jn-books-cover-title, " +
        "[data-cover-name], " +
        ".jn-books-cover-name",
        card
    )
    .forEach(
        element => {

            element.textContent =
                selected.name;

        }
    );

}


/* ============================================================
   COVER META
============================================================ */

function updateCoverMeta(
    card,
    selected
) {

    if (!selected) {
        return;
    }


    $$(
        "[data-selected-cover-language]",
        card
    )
    .forEach(
        element => {

            element.textContent =
                selected.language;

        }
    );


    $$(
        "[data-selected-cover-design]",
        card
    )
    .forEach(
        element => {

            element.textContent =
                selected.design;

        }
    );


    $$(
        "[data-selected-cover-size]",
        card
    )
    .forEach(
        element => {

            element.textContent =
                selected.size;

        }
    );

}


/* ============================================================
   COVER PRICE
   ------------------------------------------------------------
   PRICE IS COMPLETELY SEPARATE FROM DESIGN SELECTOR.
============================================================ */

function updateCoverPrice(
    element,
    selected
) {

    if (!element || !selected) {
        return;
    }


    element.replaceChildren();


    const amount =
        document.createElement("span");


    amount.className =
        "cover-price-amount";


    amount.textContent =
        `₹${selected.price}`;


    element.appendChild(amount);


    const size =
        document.createElement("small");


    size.className =
        "cover-price-size";


    size.textContent =
        selected.size;


    element.appendChild(size);

}


/* ============================================================
   BIBLE COVER SYSTEM
============================================================ */

function setupBibleCovers() {

    const card =
        $(
            '[data-product-card][data-category="covers"], ' +
            '.jn-books-product-card[data-category="covers"]'
        );


    if (!card) {

        console.warn(
            "Jeeva Nadi Books: Bible cover card not found."
        );

        return;

    }


    const language =
        $(
            "[data-cover-language], " +
            ".jn-books-cover-language, " +
            "#cover-language",
            card
        );


    const size =
        $(
            "[data-cover-size], " +
            ".jn-books-cover-size, " +
            "#cover-size",
            card
        );


    const design =
        $(
            "[data-cover-design], " +
            ".jn-books-cover-design, " +
            "#cover-design",
            card
        );


    const image =
        $(
            "[data-cover-image], " +
            "#selected-cover-image",
            card
        );


    const description =
        $(
            "[data-cover-description], " +
            "#cover-design-description",
            card
        );


    const price =
        $(
            "[data-cover-price], " +
            "#cover-selected-price",
            card
        );


    const previous =
        $(
            "[data-cover-prev], " +
            "#cover-gallery-prev",
            card
        );


    const next =
        $(
            "[data-cover-next], " +
            "#cover-gallery-next",
            card
        );


    const dots =
        $(
            "[data-cover-dots], " +
            "#cover-image-dots",
            card
        );


    const addButton =
        $(
            "[data-add-cover], " +
            "#add-cover-to-cart, " +
            ".jn-books-add-cart",
            card
        );


    if (
        !language ||
        !size ||
        !design ||
        !image ||
        !price ||
        !addButton
    ) {

        console.warn(
            "Jeeva Nadi Books: Bible cover controls are incomplete."
        );

        return;

    }


    let covers = [];

    let currentIndex = 0;


    /* ========================================================
       SELECTED COVER
    ======================================================== */

    function getSelectedCover() {

        return (
            covers.find(
                cover =>
                    cover.id ===
                    design.value
            ) || null
        );

    }


    /* ========================================================
       UPDATE CART DATA
    ======================================================== */

    function updateCoverCartData(
        selected
    ) {

        addButton.dataset.product =
            "Bible Cover";

        addButton.dataset.title =
            selected.name;

        addButton.dataset.price =
            String(selected.price);

        addButton.dataset.variant =
            [
                selected.name,
                selected.language,
                selected.size,
                selected.design
            ].join(" | ");

        addButton.dataset.category =
            "covers";

        addButton.dataset.image =
            selected.image;

        addButton.dataset.coverName =
            selected.name;

        addButton.dataset.coverLanguage =
            selected.language;

        addButton.dataset.coverDesign =
            selected.design;

        addButton.dataset.coverSize =
            selected.size;

        addButton.dataset.coverId =
            selected.id;

    }


    /* ========================================================
       RENDER SELECTED COVER
    ======================================================== */

    function renderSelectedCover() {

        const selected =
            getSelectedCover();


        if (!selected) {
            return;
        }


        currentIndex =
            Math.max(
                0,
                covers.findIndex(
                    cover =>
                        cover.id ===
                        selected.id
                )
            );


        /* ----------------------------------------------------
           IMAGE
        ---------------------------------------------------- */

        image.removeAttribute(
            "data-error-logged"
        );


        image.src =
            selected.image;


        image.alt =
            `${selected.name} — ` +
            `${selected.size} ${selected.language} Bible cover`;


        setupImageFallback(
            image,
            selected.imageFallbacks
        );


        /* ----------------------------------------------------
           DESCRIPTION
        ---------------------------------------------------- */

        if (description) {

            description.textContent =
                selected.description;

        }


        /* ----------------------------------------------------
           PRICE
        ---------------------------------------------------- */

        updateCoverPrice(
            price,
            selected
        );


        /* ----------------------------------------------------
           TITLE
        ---------------------------------------------------- */

        updateCoverTitle(
            card,
            selected
        );


        /* ----------------------------------------------------
           META
        ---------------------------------------------------- */

        updateCoverMeta(
            card,
            selected
        );


        /* ----------------------------------------------------
           CART
        ---------------------------------------------------- */

        updateCoverCartData(
            selected
        );


        /* ----------------------------------------------------
           DOTS
        ---------------------------------------------------- */

        renderDots(
            dots,
            covers.length,
            currentIndex
        );

    }


    /* ========================================================
       REBUILD COVER SYSTEM
       --------------------------------------------------------
       LANGUAGE → SIZE → DESIGN
    ======================================================== */

    function rebuildCoverSystem(
        preferredSize = "Regular",
        preferredCoverId = ""
    ) {

        const selectedLanguage =
            clean(language.value);


        if (!selectedLanguage) {

            covers = [];

            size.replaceChildren();

            design.replaceChildren();

            return;

        }


        /*
         * LANGUAGE → SIZE
         */

        const selectedSize =
            rebuildSizeSelector(
                size,
                selectedLanguage,
                preferredSize
            );


        /*
         * LANGUAGE + SIZE → DESIGN
         */

        covers =
            rebuildCoverDesignSelector(
                design,
                selectedLanguage,
                selectedSize,
                preferredCoverId
            );


        currentIndex = 0;


        /*
         * Render first valid cover.
         */

        renderSelectedCover();

    }


    /* ========================================================
       LANGUAGE CHANGE
    ======================================================== */

    language.addEventListener(
        "change",
        () => {

            /*
             * Whenever language changes,
             * start from Regular.
             */

            rebuildCoverSystem(
                "Regular"
            );

        }
    );


    /* ========================================================
       SIZE CHANGE
    ======================================================== */

    size.addEventListener(
        "change",
        () => {

            const selectedLanguage =
                clean(language.value);

            const selectedSize =
                clean(size.value);


            covers =
                rebuildCoverDesignSelector(
                    design,
                    selectedLanguage,
                    selectedSize
                );


            currentIndex = 0;


            renderSelectedCover();

        }
    );


    /* ========================================================
       DESIGN CHANGE
    ======================================================== */

    design.addEventListener(
        "change",
        () => {

            renderSelectedCover();

        }
    );


    /* ========================================================
       PREVIOUS
    ======================================================== */

    previous?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if (!covers.length) {
                return;
            }


            currentIndex =
                (
                    currentIndex -
                    1 +
                    covers.length
                ) %
                covers.length;


            design.value =
                covers[currentIndex].id;


            renderSelectedCover();

        }
    );


    /* ========================================================
       NEXT
    ======================================================== */

    next?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if (!covers.length) {
                return;
            }


            currentIndex =
                (
                    currentIndex +
                    1
                ) %
                covers.length;


            design.value =
                covers[currentIndex].id;


            renderSelectedCover();

        }
    );


    /* ========================================================
       DEFAULT LANGUAGE
    ======================================================== */

    const englishOption =
        Array.from(
            language.options || []
        ).find(
            option =>
                normalize(option.value) ===
                    "english" ||

                normalize(option.textContent) ===
                    "english"
        );


    if (englishOption) {

        language.value =
            englishOption.value;

    }


    /* ========================================================
       INITIAL COVER
       --------------------------------------------------------
       English
       Regular
       Light Blue Fabric
       ₹200
    ======================================================== */

    rebuildCoverSystem(
        "Regular",
        "english-light-blue"
    );

}


/* ============================================================
   PROMISE CARDS
============================================================ */

function setupPromiseCards() {

    const cards =
        $$(
            '[data-product-card][data-category="promises"], ' +
            '.jn-books-product-card[data-category="promises"]'
        );


    cards.forEach(
        card => {

            const select =
                $(
                    "[data-promise-quantity], " +
                    ".jn-books-promise-select",
                    card
                );


            const price =
                $(
                    "[data-promise-price], " +
                    ".jn-books-promise-price",
                    card
                );


            const button =
                $(
                    "[data-add-product], " +
                    ".jn-books-add-cart",
                    card
                );


            if (!select || !button) {
                return;
            }


            function updatePromiseProduct() {

                const option =
                    select.options[
                        select.selectedIndex
                    ];


                if (!option) {
                    return;
                }


                const quantity =
                    getNumber(
                        option.value,
                        1
                    );


                const selectedPrice =
                    getNumber(
                        option.dataset.price,
                        0
                    );


                button.dataset.product =
                    "Promise Cards";


                button.dataset.price =
                    String(selectedPrice);


                button.dataset.variant =
                    `${quantity} Cards — ₹${selectedPrice}`;


                button.dataset.category =
                    "promises";


                if (!button.dataset.image) {

                    const image =
                        $("img", card);


                    if (image) {

                        button.dataset.image =
                            image.currentSrc ||
                            image.src ||
                            "";

                    }

                }


                if (price) {

                    price.textContent =
                        `₹${selectedPrice}`;

                }

            }


            select.addEventListener(
                "change",
                updatePromiseProduct
            );


            updatePromiseProduct();

        }
    );

}


/* ============================================================
   CART BUTTON SYSTEM
============================================================ */

function setupCartButtons() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-add-product], " +
                    "[data-add-cover], " +
                    ".jn-books-add-cart"
                );


            if (!button) {
                return;
            }


            event.preventDefault();


            if (button.disabled) {
                return;
            }


            addToCart(button);

        }
    );

}


/* ============================================================
   ADD TO CART
============================================================ */

function addToCart(button) {

    const cart =
        window.JeevaNadiCart;


    if (!cart) {

        notify(
            "Cart is still loading. Please wait."
        );

        return;

    }


    /* --------------------------------------------------------
       AUTHENTICATION READY
    -------------------------------------------------------- */

    if (
        typeof cart.isAuthenticationReady ===
        "function"
    ) {

        if (!cart.isAuthenticationReady()) {

            notify(
                "Please wait while your account is loading."
            );

            return;

        }

    }


    /* --------------------------------------------------------
       AUTHENTICATION
    -------------------------------------------------------- */

    if (
        typeof cart.isAuthenticated ===
        "function"
    ) {

        if (!cart.isAuthenticated()) {

            notify(
                "Please sign in before adding products."
            );


            window.dispatchEvent(
                new CustomEvent(
                    "jeevaNadiCartAuthRequired",
                    {
                        detail: {
                            reason: "signed-out"
                        }
                    }
                )
            );


            return;

        }

    }


    /* --------------------------------------------------------
       PRODUCT DATA
    -------------------------------------------------------- */

    const product =
        clean(
            button.dataset.product ||
            button.dataset.title
        );


    const variant =
        clean(
            button.dataset.variant
        );


    const category =
        clean(
            button.dataset.category ||
            "books"
        );


    const image =
        clean(
            button.dataset.image
        );


    const price =
        getNumber(
            button.dataset.price,
            0
        );


    if (!product) {

        notify(
            "Product information is missing."
        );

        return;

    }


    if (price <= 0) {

        notify(
            "This product is currently unavailable."
        );

        return;

    }


    /* --------------------------------------------------------
       UNIQUE CART KEY
    -------------------------------------------------------- */

    const key =
        variant
            ? `${product}::${variant}`
            : `${product}::default`;


    /* --------------------------------------------------------
       DISPLAY NAME
    -------------------------------------------------------- */

    const itemName =
        category === "covers" &&
        button.dataset.coverName
            ? button.dataset.coverName
            : product;


    /* --------------------------------------------------------
       CART ITEM
    -------------------------------------------------------- */

    const item = {

        key,

        id: key,

        product,

        title: itemName,

        name: itemName,

        variant,

        price,

        quantity: 1,

        image,

        category,

        language:
            button.dataset.coverLanguage ||
            "",

        design:
            button.dataset.coverDesign ||
            "",

        size:
            button.dataset.coverSize ||
            "",

        coverId:
            button.dataset.coverId ||
            ""

    };


    /* --------------------------------------------------------
       ADD
    -------------------------------------------------------- */

    let success = false;


    try {

        if (
            typeof cart.add !==
            "function"
        ) {

            throw new Error(
                "cart.add() is unavailable."
            );

        }


        success =
            Boolean(
                cart.add(item)
            );

    }

    catch (error) {

        console.error(
            "Jeeva Nadi Books: Cart error",
            error
        );


        notify(
            "Unable to add this product to your cart."
        );


        return;

    }


    if (!success) {
        return;
    }


    /* --------------------------------------------------------
       SUCCESS
    -------------------------------------------------------- */

    notify(
        `${itemName} — ` +
        `${selectedVariantText(item)} ` +
        `added to cart.`
    );


    animateButton(
        button
    );


    refreshCartCount();

}


/* ============================================================
   SELECTED VARIANT TEXT
============================================================ */

function selectedVariantText(item) {

    if (
        item.category !== "covers"
    ) {

        return (
            item.variant ||
            "Product"
        );

    }


    return [
        item.language,
        item.size,
        item.design,
        `₹${item.price}`
    ]
        .filter(Boolean)
        .join(" • ");

}


/* ============================================================
   CART EVENTS
============================================================ */

function setupCartEvents() {

    window.addEventListener(
        "jeevaNadiCartUpdated",
        refreshCartCount
    );


    window.addEventListener(
        "jeevaNadiCartReady",
        refreshCartCount
    );


    window.addEventListener(
        "jeevaNadiAuthChanged",
        refreshCartCount
    );


    window.addEventListener(
        "jeevaNadiCartAuthRequired",
        event => {

            const reason =
                event.detail?.reason;


            if (
                reason ===
                "authentication-loading"
            ) {

                notify(
                    "Please wait while your account is loading."
                );

                return;

            }


            notify(
                "Please sign in to use the shopping cart."
            );

        }
    );

}


/* ============================================================
   CART COUNT
============================================================ */

function refreshCartCount() {

    const counters =
        $$(STORE.selectors.cartCount);


    if (!counters.length) {
        return;
    }


    const cart =
        window.JeevaNadiCart;


    if (!cart) {
        return;
    }


    let count = 0;


    try {

        if (
            typeof cart.count ===
            "function"
        ) {

            count =
                getNumber(
                    cart.count(),
                    0
                );

        }

    }

    catch (error) {

        console.warn(
            "Jeeva Nadi Books: Unable to read cart count.",
            error
        );

        return;

    }


    counters.forEach(
        element => {

            element.textContent =
                String(count);


            element.classList.toggle(
                "has-items",
                count > 0
            );


            element.setAttribute(
                "aria-label",
                `${count} item${
                    count === 1
                        ? ""
                        : "s"
                } in cart`
            );

        }
    );

}


/* ============================================================
   BUTTON ANIMATION
============================================================ */

function animateButton(button) {

    if (!button) {
        return;
    }


    button.disabled = true;


    button.classList.add(
        STORE.classes.added
    );


    button.textContent =
        "✓ Added to Cart";


    window.setTimeout(
        () => {

            button.disabled = false;


            button.classList.remove(
                STORE.classes.added
            );


            /*
             * Always restore the
             * Add to Cart label.
             */

            button.textContent =
                "🛒 Add to Cart";

        },
        1400
    );

}


/* ============================================================
   TOAST
============================================================ */

function notify(message) {

    const toast =
        $(STORE.selectors.toast);


    if (!toast) {

        console.info(
            "Jeeva Nadi Books:",
            message
        );

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        STORE.classes.active
    );


    toast.classList.add(
        "show"
    );


    if (toastTimer) {

        clearTimeout(
            toastTimer
        );

    }


    toastTimer =
        window.setTimeout(
            () => {

                toast.classList.remove(
                    STORE.classes.active
                );


                toast.classList.remove(
                    "show"
                );

            },
            3200
        );

}


/* ============================================================
   RESTORE STORE STATE
============================================================ */

function restoreState() {

    state.category =
        "all";

    state.search =
        "";

    state.sort =
        "featured";


    const search =
        $(STORE.selectors.search);


    if (search) {
        search.value = "";
    }


    const categories =
        $$(STORE.selectors.categories);


    categories.forEach(
        button => {

            const category =
                normalize(
                    button.dataset.storeCategory ||
                    button.dataset.category
                );


            const active =
                category === "all";


            button.classList.toggle(
                STORE.classes.active,
                active
            );


            button.classList.toggle(
                "active",
                active
            );


            button.setAttribute(
                "aria-selected",
                String(active)
            );

        }
    );


    const sort =
        $(STORE.selectors.sort);


    if (sort) {
        sort.value = "featured";
    }

}


/* ============================================================
   IMAGE ERROR MONITOR
============================================================ */

function setupImageErrorMonitoring() {

    document.addEventListener(
        "error",
        event => {

            const image =
                event.target;


            if (
                !(image instanceof HTMLImageElement)
            ) {

                return;

            }


            const source =
                clean(
                    image.getAttribute("src")
                );


            if (!source) {
                return;
            }


            if (
                source.startsWith("data:") ||
                source.startsWith("blob:")
            ) {
                return;
            }


            if (
                image.dataset.errorLogged ===
                "true"
            ) {
                return;
            }


            image.dataset.errorLogged =
                "true";


            console.warn(
                "Jeeva Nadi Books: Image could not be loaded:",
                source
            );

        },
        true
    );

}


/* ============================================================
   BOOT
============================================================ */

function bootBooksStore() {

    if (state.initialized) {
        return;
    }


    if (!getProductGrid()) {

        console.error(
            "Jeeva Nadi Books: Product grid not found."
        );

        return;

    }


    state.initialized =
        true;


    setupSearch();

    setupCategories();

    setupSorting();

    setupProductGalleries();

    setupBibleCovers();

    setupPromiseCards();

    setupCartButtons();

    setupCartEvents();

    restoreState();

    applySorting();

    refreshProducts();

    refreshCartCount();


    console.log(
        "Jeeva Nadi Books: Store initialized successfully."
    );

}


/* ============================================================
   PUBLIC API
============================================================ */

window.JeevaNadiBooksStore = {

    refreshProducts,

    refreshCartCount,

    notify,

    getState() {

        return {
            ...state
        };

    },


    getProducts() {

        return getProductCards();

    },


    getBibleCovers() {

        return BIBLE_COVERS.map(
            cover => ({
                ...cover
            })
        );

    },


    getCoversByLanguage(
        language
    ) {

        return getCoversByLanguage(
            language
        );

    },


    getCoversByLanguageAndSize(
        language,
        size
    ) {

        return getCoversByLanguageAndSize(
            language,
            size
        );

    }

};


/* ============================================================
   GLOBAL IMAGE MONITOR
============================================================ */

setupImageErrorMonitoring();


/* ============================================================
   START STORE
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        bootBooksStore,
        {
            once: true
        }
    );

}

else {

    bootBooksStore();

}
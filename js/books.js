/* ============================================================
   JEHOVAH JIREH BOOKSTORE
   Interactive Product Catalogue & Enquiry Experience
   VERSION 15.0

   Responsive | Accessible | Modular | Catalogue-only
   No cart, checkout, accounts or online payments.

   GALLERY RULE:
   Automatic rotation is disabled unless data-autoplay="true".
============================================================ */


/* ============================================================
   01. STORE CONFIGURATION
============================================================ */

const STORE = Object.freeze({
    name: "Jehovah Jireh Bookstore",
    primaryPhone: "919347348805",
    secondaryPhone: "917702713577",
    email: "nadijeeva4@gmail.com",
    currency: "\u20B9",
    galleryInterval: 3000,

    selectors: {
        grid: "#product-grid",
        search: "#book-search",
        searchForm: "#book-search-form",
        categories: "#category-tabs",
        sort: "#sort-products",
        result: "#result-count",
        empty: "#empty-state",
        reset: "#reset-search",
        toast: "#store-toast",
        mobileButton: "#mobile-menu-button",
        mobileNavigation: "#mobile-navigation",
        keychains: "[data-keychains-section]"
    }
});


/* ============================================================
   02. JESUS LOVES YOU WRISTBAND CONFIGURATION
   ------------------------------------------------------------
   Fixed price: ₹20 per wristband.
   Customers can select any combination of colours.
   No combo offers or quantity restrictions.
============================================================ */

const WRISTBAND_PRICE = 20;

const WRISTBAND_COLOURS = Object.freeze([

    {
        name: "Purple",
        image: "images/01 - Jesus Loves You Wristband Purple.jpg"
    },

    {
        name: "Yellow",
        image: "images/02 - Jesus Loves You Wristband Yellow.jpg"
    },

    {
        name: "Neon Green",
        image: "images/03 - Jesus Loves You Wristband Neon Green.jpg"
    },

    {
        name: "Red",
        image: "images/04 - Jesus Loves You Wristband Red.jpg"
    },

    {
        name: "Black",
        image: "images/05 - Jesus Loves You Wristband Black.jpg"
    },

    {
        name: "White",
        image: "images/06 - Jesus Loves You Wristband White.jpg"
    }

]);

/* ============================================================
   03. SUNDAY SCHOOL SONGS BOOKS
============================================================ */

const SUNDAY_SCHOOL_BOOKS = Object.freeze({
    price: 50,

    editions: {
        rainbow: {
            id: "rainbow",
            name: "Rainbow Cover",
            shortName: "Rainbow",
            colour: "Light Blue",
            image: "images/01 - Sunday School Songs Book - Light Blue Rainbow Cover.jpg",
            description: "A cheerful light blue cover featuring a beautiful rainbow design."
        },

        guitar: {
            id: "guitar",
            name: "Guitar Cover",
            shortName: "Guitar",
            colour: "Purple",
            image: "images/02 - Sunday School Songs Book - Purple Guitar Cover.jpg",
            description: "A distinctive purple cover featuring a guitar design."
        },

        violin: {
            id: "violin",
            name: "Violin Cover",
            shortName: "Violin",
            colour: "Dark Blue",
            image: "images/03 - Sunday School Songs Book - Dark Blue Violin Cover.jpg",
            description: "An elegant dark blue cover featuring a violin design."
        }
    }
});
/* ============================================================
   04. BIBLE COVER DATABASE
   ------------------------------------------------------------
   TOTAL PRODUCTS : 10
   TELUGU COVERS  : 8
   ENGLISH COVERS : 2

   All product IDs, image paths, prices and descriptions
   are maintained for the Bible Cover Explorer.
============================================================ */

const BIBLE_COVERS = Object.freeze([

  // ==========================================================
  // TELUGU BIBLE COVERS
  // ==========================================================

  {
    id: "telugu-maroon-patterned",
    name: "Maroon Patterned Fabric Bible Cover",
    design: "Maroon Patterned Fabric",
    language: "Telugu",
    size: "Regular",
    price: 150,
    image: "images/bc 5 telugu design.jpeg",
    description: "A maroon, black and brown patterned fabric Bible cover with a full zip closure and front pocket. Telugu Bible cover."
  },

  {
    id: "telugu-dark-brown-rexin",
    name: "Dark Brown Leather-Look Rexin Bible Cover",
    design: "Dark Brown Rexin",
    language: "Telugu",
    size: "Regular",
    price: 100,
    image: "images/bc 2.jpeg",
    description: "A textured dark brown Rexin Bible cover with gold Telugu lettering, full zip closure and front pocket. Not real leather."
  },

  {
    id: "telugu-velvet-paisley",
    name: "Velvet Paisley Patterned Bible Cover",
    design: "Velvet Paisley Patterned",
    language: "Telugu",
    size: "Regular",
    price: 150,
    image: "images/bc 6 telugu.jpeg",
    description: "A soft velvet-fabric Bible cover with a black base and rich maroon, red and mustard paisley patterns. Telugu Bible cover."
  },

  {
    id: "telugu-large-black-rexin",
    name: "Large Black Rexin Bible Cover",
    design: "Large Black Rexin",
    language: "Telugu",
    size: "Regular",
    price: 150,
    image: "images/bc 1 small.jpeg",
    description: "A large, textured black Rexin Bible cover with gold Telugu lettering, full zip closure and front pocket. Not real leather."
  },

  {
    id: "telugu-red-yellow-fabric",
    name: "Red & Yellow Fabric Bible Cover",
    design: "Red & Yellow Fabric",
    language: "Telugu",
    size: "Regular",
    price: 150,
    image: "images/telugu bc 9.jpg",
    description: "A colourful red, yellow, brown and black floral-patterned fabric Bible cover with a full zip closure and front pocket. Telugu Bible cover."
  },

  {
    id: "telugu-small-black-rexin",
    name: "Small Black Rexin Bible Cover",
    design: "Small Black Rexin",
    language: "Telugu",
    size: "Small",
    price: 100,
    image: "images/bc 1 small.jpeg",
    description: "A compact, textured black Rexin Bible cover with Telugu lettering, full zip closure and front pocket. Not real leather."
  },

  {
    id: "telugu-abstract-patterned",
    name: "Abstract Patterned Fabric Bible Cover",
    design: "Abstract Patterned Fabric",
    language: "Telugu",
    size: "Regular",
    price: 150,
    image: "images/english bc 4 design .jpeg",
    description: "A stylish black, maroon and orange abstract-patterned fabric Bible cover with Telugu lettering."
  },

  {
    id: "telugu-embroidered",
    name: "Embroidered Fabric Bible Cover",
    design: "Embroidered Fabric",
    language: "Telugu",
    size: "Regular",
    price: 150,
    image: "images/english bc 7 design .jpeg",
    description: "A traditional maroon and black embroidered-style textured fabric Bible cover with Telugu lettering."
  },


  // ==========================================================
  // ENGLISH BIBLE COVERS
  // ==========================================================

  {
    id: "english-light-blue",
    name: "Light Blue English Holy Bible Cover",
    design: "Light Blue Holy Bible",
    language: "English",
    size: "Regular",
    price: 200,
    image: "images/bc 3 english blue color.jpeg",
    description: "A light blue fabric Bible cover with gold Holy Bible lettering, full zip closure and front pocket."
  },

  {
    id: "english-floral-fabric",
    name: "English Floral Fabric Bible Cover",
    design: "English Floral Fabric",
    language: "English",
    size: "Regular",
    price: 150,
    image: "images/bc 8 english.jpeg",
    description: "A black fabric Bible cover with red and yellow dotted floral patterns, full zip closure and front pocket."
  }

]);

/* ============================================================
   05. CHRISTIAN PHOTO FRAME DATABASE
============================================================ */

const PHOTO_FRAMES = Object.freeze([
    {
        id: "double-unto-thee",
        name: "Double Unto Thee",
        language: "English",
        reference: "Zechariah 9:12",
        design: "Light Wooden Floral",
        price: 300,
        image: "images/English-Floral-Zechariah-9-12.jpg",
        description: "A beautiful light wooden floral frame featuring Zechariah 9:12, reflecting restoration, hope and God's abundant blessing."
    },

    {
        id: "bless-thee-out-of-zion",
        name: "Bless Thee Out Of Zion",
        language: "English",
        reference: "Psalm 128:5",
        design: "Oval Board",
        price: 200,
        image: "images/English-Oval-Psalm-128-5.jpg",
        description: "An oval board design featuring Psalm 128:5. This design does not have glass."
    },

    {
        id: "the-lord-shall-increase-you",
        name: "The Lord Shall Increase You",
        language: "English",
        reference: "Psalm 115:14",
        design: "Horseshoe-Shaped Hanging Board",
        price: 250,
        image: "images/English-Horseshoe-Psalm-115-14.jpg",
        description: "A horseshoe-shaped hanging board featuring Psalm 115:14."
    },

    {
        id: "peace-be-to-thine-house",
        name: "Peace Be To Thine House",
        language: "English",
        reference: "1 Samuel 25:6",
        design: "White Floral Frame",
        price: 300,
        image: "images/Frame 1 - Peace Be To Thine House.jpg",
        description: "A white floral frame featuring the blessing of peace from 1 Samuel 25:6."
    },

    {
        id: "lord-will-fulfil",
        name: "The Lord Will Fulfil",
        language: "English",
        reference: "Psalm 138:8",
        design: "Light Wooden Floral",
        price: 300,
        image: "images/Frame 4 - The Lord Will Fulfil Psalm.jpg",
        description: "A light wooden floral frame featuring Psalm 138:8."
    },

    {
        id: "siyonulonundi-yehovah",
        name: "Siyonulonundi Yehovah",
        language: "Telugu",
        reference: "Psalm 128:5",
        design: "Light Wooden Floral",
        price: 300,
        image: "images/Telugu-Floral-Psalm-128-5.jpg",
        description: "A light wooden floral Telugu frame featuring Psalm 128:5."
    },

    {
        id: "naa-vakyamu",
        name: "Naa Vakyamu",
        language: "Telugu",
        reference: "Deuteronomy 32:2",
        design: "Black Frame",
        price: 280,
        image: "images/Frame 3 - Naa Vakyamu Deuteronomy.jpg",
        description: "A black Telugu frame featuring Deuteronomy 32:2."
    },

    {
        id: "siyonuku",
        name: "Siyonuku",
        language: "Telugu",
        reference: "Jeremiah 31:6",
        design: "Dark Grey Mountain Landscape",
        price: 300,
        image: "images/Frame 5 - Siyonuku Joshua.jpg",
        description: "A dark grey mountain landscape frame featuring the Telugu scripture design."
    },

    {
        id: "nativity",
        name: "Nativity",
        language: "Telugu & English",
        reference: "Luke 2:14",
        design: "Christmas Nativity",
        price: 400,
        image: "images/Telugu-English-Nativity-Luke-2-14.jpg",
        description: "A Telugu and English Christmas nativity frame featuring Luke 2:14."
    },

    {
        id: "blessing-makes-one-rich",
        name: "The Blessing Of The Lord Makes One Rich",
        language: "Telugu & English",
        reference: "Proverbs 10:22",
        design: "Dark Brown and Gold",
        price: 300,
        image: "images/Frame 2 - Blessing Of The Lord Proverbs.jpg",
        description: "A dark brown and gold Telugu-English frame featuring Proverbs 10:22."
    }
]);


/* ============================================================
   06. CHRISTIAN KEYCHAINS DATABASE
   16 DESIGNS | 4 COLLECTIONS
============================================================ */

const KEYCHAINS = Object.freeze([
    {
        id: "p-letter",
        name: "P Letter",
        collection: "alphabet",
        collectionName: "Alphabet",
        design: "Silver Alphabet",
        price: 90,
        image: "images/Alphabet-P-Silver-Keychain.jpg",
        description: "A beautiful silver alphabet keychain with the letter P."
    },
    {
        id: "jesus-never-fails",
        name: "Jesus Never Fails",
        collection: "guitar",
        collectionName: "Guitar",
        design: "Gold Guitar",
        price: 25,
        image: "images/Guitar-Jesus-Never-Fails-Gold.jpg",
        description: "A guitar-shaped Christian keychain carrying the encouraging message Jesus Never Fails."
    },
    {
        id: "praise-the-lord",
        name: "Praise The Lord",
        collection: "guitar",
        collectionName: "Guitar",
        design: "Black Guitar",
        price: 25,
        image: "images/Guitar-Praise-The-Lord-Black.jpg",
        description: "A guitar-shaped keychain celebrating praise and worship."
    },
    {
        id: "jesus-heals-you",
        name: "Jesus Heals You",
        collection: "oval",
        collectionName: "Oval Messages",
        design: "Gold Oval Message",
        price: 90,
        image: "images/Cross-Verse-Jesus-Heals-You-Oval-Gold.jpg",
        description: "An oval Christian message keychain carrying the words Jesus Heals You."
    },
    {
        id: "jesus-saves-you",
        name: "Jesus Saves You",
        collection: "guitar",
        collectionName: "Guitar",
        design: "Black Guitar",
        price: 25,
        image: "images/Guitar-Jesus-Saves-You-Black.jpg",
        description: "A guitar-shaped Christian keychain sharing the message of salvation in Jesus Christ."
    },
    {
        id: "god-bless-you",
        name: "God Bless You",
        collection: "oval",
        collectionName: "Oval Messages",
        design: "Gold Oval Message",
        price: 90,
        image: "images/Cross-Verse-God-Bless-You-Oval-Gold.jpg",
        description: "An oval inspirational keychain carrying the message God Bless You."
    },
    {
        id: "m-letter",
        name: "M Letter",
        collection: "alphabet",
        collectionName: "Alphabet",
        design: "Silver Alphabet",
        price: 90,
        image: "images/Alphabet-M-Silver-Keychain.jpg",
        description: "A silver alphabet keychain with the letter M."
    },
    {
        id: "j-letter",
        name: "J Letter",
        collection: "alphabet",
        collectionName: "Alphabet",
        design: "Silver Alphabet",
        price: 90,
        image: "images/Alphabet-J-Silver-Keychain.jpg",
        description: "A silver alphabet keychain with the letter J."
    },
    {
        id: "o-letter",
        name: "O Letter",
        collection: "alphabet",
        collectionName: "Alphabet",
        design: "Silver Alphabet",
        price: 90,
        image: "images/Alphabet-O-Silver-Keychain.jpg",
        description: "A silver alphabet keychain with the letter O."
    },
    {
        id: "brown-woven-cross",
        name: "Brown Woven Cross",
        collection: "cross",
        collectionName: "Cross",
        design: "Brown Woven Cross",
        price: 90,
        image: "images/Cross-Brown-Woven-Design.jpg",
        description: "A distinctive brown woven cross keychain."
    },
    {
        id: "d-letter",
        name: "D Letter",
        collection: "alphabet",
        collectionName: "Alphabet",
        design: "Silver Alphabet",
        price: 90,
        image: "images/Alphabet-D-Silver-Keychain.jpg",
        description: "A silver alphabet keychain with the letter D."
    },
    {
        id: "c-letter",
        name: "C Letter",
        collection: "alphabet",
        collectionName: "Alphabet",
        design: "Silver Alphabet",
        price: 90,
        image: "images/Alphabet-C-Silver-Keychain.jpg",
        description: "A silver alphabet keychain with the letter C."
    },
    {
        id: "b-letter",
        name: "B Letter",
        collection: "alphabet",
        collectionName: "Alphabet",
        design: "Silver Alphabet",
        price: 90,
        image: "images/Alphabet-B-Silver-Keychain.jpg",
        description: "A silver alphabet keychain with the letter B."
    },
    {
        id: "crucifix-jesus-cross",
        name: "Crucifix Jesus Cross",
        collection: "cross",
        collectionName: "Cross",
        design: "Brown Stone Crucifix",
        price: 90,
        image: "images/Cross-Crucifix-Jesus-Stone-Brown.jpg",
        description: "A Christian crucifix keychain featuring Jesus on the cross."
    },
    {
        id: "silver-woven-cross",
        name: "Silver Woven Cross",
        collection: "cross",
        collectionName: "Cross",
        design: "Silver Woven Cross",
        price: 90,
        image: "images/Cross-Silver-Woven-Design.jpg",
        description: "A distinctive silver woven cross keychain."
    },
    {
        id: "n-letter",
        name: "N Letter",
        collection: "alphabet",
        collectionName: "Alphabet",
        design: "Silver Alphabet",
        price: 90,
        image: "images/Alphabet-N-Silver-Keychain.jpg",
        description: "A silver alphabet keychain with the letter N."
    }
]);


/* ============================================================
   07. APPLICATION STATE
============================================================ */

const state = {
    category: "all",
    search: "",
    sort: "featured",

    keychainCategory: "all",
    keychainCollection: "all",
    keychainIndex: 0,

    selectedColours: new Set(["Purple"]),
    lastSelectedColour: "Purple",

    coverIndex: 0,
    frameIndex: 0,

    sundaySchoolCover: "rainbow",

    toastTimer: null,
    initialized: false
};


/* ============================================================
   08. GENERAL HELPERS
============================================================ */

const $ = (selector, root = document) =>
    root.querySelector(selector);

const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

const money = value =>
    `${STORE.currency}${Number(value || 0).toLocaleString("en-IN")}`;

function setText(selector, value, root = document) {
    const element = $(selector, root);

    if (element) {
        element.textContent = value ?? "";
    }
}

function setHTML(selector, value, root = document) {
    const element = $(selector, root);

    if (element) {
        element.innerHTML = value ?? "";
    }
}

function normalizeCategory(value) {
    const category = String(value || "all")
        .trim()
        .toLowerCase();

    const aliases = {
        all: "all",
        "all-keychains": "all",
        alphabet: "alphabet",
        alphabets: "alphabet",
        guitar: "guitar",
        guitars: "guitar",
        cross: "cross",
        crosses: "cross",
        oval: "oval",
        ovals: "oval",
        "oval-message": "oval",
        "oval-messages": "oval"
    };

    return aliases[category] || category;
}


/* ============================================================
   09. SAFE IMAGE HANDLING
============================================================ */

function setImage(image, src, alt = "Product image") {
    if (!image) return;

    image.onerror = null;
    image.classList.remove("image-unavailable");
    image.removeAttribute("data-image-error");
    image.alt = alt;

    if (typeof src !== "string" || !src.trim()) {
        image.removeAttribute("src");
        image.classList.add("image-unavailable");
        image.setAttribute("data-image-error", "true");
        image.alt = `${alt} — photograph coming soon`;
        return;
    }

    image.onerror = () => {
        image.onerror = null;
        image.classList.add("image-unavailable");
        image.setAttribute("data-image-error", "true");
        image.alt = `${alt} — image unavailable`;
        image.removeAttribute("src");

        console.error(
            "Bookstore image could not be loaded:",
            src
        );
    };

    image.src = src;
}


/* ============================================================
   10. TOAST NOTIFICATIONS
============================================================ */

function showToast(message) {
    const toast = $(STORE.selectors.toast);

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show", "is-visible");

    window.clearTimeout(state.toastTimer);

    state.toastTimer = window.setTimeout(() => {
        toast.classList.remove("show", "is-visible");
    }, 3200);
}


/* ============================================================
   11. MAIN PRODUCT GRID HELPERS
============================================================ */

function getProductCards() {
    return $$("#product-grid [data-product-card]");
}

function getSearchText(card) {
    return [
        card.dataset.name,
        card.dataset.category,
        card.dataset.search,
        card.textContent
    ].join(" ").toLocaleLowerCase();
}

function updateCardPrice(card, price) {
    if (!card) return;

    card.dataset.price = String(price);
}


/* ============================================================
   12. MAIN CATALOGUE SEARCH, FILTER AND SORT
============================================================ */

function applyFiltersAndSort() {
    const grid = $(STORE.selectors.grid);

    if (!grid) return;

    const cards = getProductCards();
    const query = state.search.trim().toLocaleLowerCase();
    const visible = [];

    cards.forEach(card => {
        const categoryMatch =
            state.category === "all" ||
            card.dataset.category === state.category;

        const searchMatch =
            !query || getSearchText(card).includes(query);

        const matches = categoryMatch && searchMatch;

        card.hidden = !matches;

        if (matches) {
            visible.push(card);
        }
    });

    const sorters = {
        featured: (a, b) =>
            Number(a.dataset.originalIndex) -
            Number(b.dataset.originalIndex),

        low: (a, b) =>
            Number(a.dataset.price || 0) -
            Number(b.dataset.price || 0),

        high: (a, b) =>
            Number(b.dataset.price || 0) -
            Number(a.dataset.price || 0),

        name: (a, b) =>
            (a.dataset.name || "").localeCompare(
                b.dataset.name || ""
            )
    };

    const sortedCards = [...cards].sort(
        sorters[state.sort] || sorters.featured
    );

    const collectionTile = [...grid.children].find(
        child => child.classList.contains(
            "jn-books-keychains-collection-card"
        )
    );

    sortedCards.forEach(card => {
        if (collectionTile) {
            grid.insertBefore(card, collectionTile);
        } else {
            grid.appendChild(card);
        }
    });

    const result = $(STORE.selectors.result);

    if (result) {
        result.textContent =
            query || state.category !== "all"
                ? `Showing ${visible.length} of ${cards.length} products`
                : `Showing all ${cards.length} products`;
    }

    const empty = $(STORE.selectors.empty);

    if (empty) {
        empty.hidden = visible.length !== 0;
    }
}


/* ============================================================
   13. MAIN CATEGORY BUTTONS
============================================================ */

function updateCategoryButtons() {
    $$("#category-tabs [data-category]").forEach(button => {
        const active =
            button.dataset.category === state.category;

        button.classList.toggle("active", active);

        button.setAttribute(
            "aria-pressed",
            String(active)
        );
    });
}


/* ============================================================
   14. SEARCH AND FILTER EVENTS
============================================================ */

function setupSearchAndFilters() {
    const form = $(STORE.selectors.searchForm);
    const search = $(STORE.selectors.search);
    const categories = $(STORE.selectors.categories);
    const sort = $(STORE.selectors.sort);
    const reset = $(STORE.selectors.reset);

    form?.addEventListener("submit", event => {
        event.preventDefault();

        state.search = search?.value || "";

        applyFiltersAndSort();

        $("#collection")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    search?.addEventListener("input", () => {
        state.search = search.value;
        applyFiltersAndSort();
    });

    categories?.addEventListener("click", event => {
        const button = event.target.closest("[data-category]");

        if (!button || !categories.contains(button)) return;

        state.category = button.dataset.category || "all";

        updateCategoryButtons();
        applyFiltersAndSort();
    });

    sort?.addEventListener("change", () => {
        state.sort = sort.value;
        applyFiltersAndSort();
    });

    reset?.addEventListener("click", () => {
        state.category = "all";
        state.search = "";
        state.sort = "featured";

        if (search) search.value = "";
        if (sort) sort.value = "featured";

        updateCategoryButtons();
        applyFiltersAndSort();
    });
}


/* ============================================================
   15. INDEPENDENT PRODUCT IMAGE GALLERIES
============================================================ */

const galleryControllers = new WeakMap();

function setupProductGalleries() {
    getProductCards().forEach(card => {
        const image = $(
            ".jn-books-product-image[data-images]",
            card
        );

        if (!image || galleryControllers.has(image)) return;

        let images = [];

        try {
            images = JSON.parse(image.dataset.images || "[]");
        } catch (error) {
            console.error(
                "Invalid gallery image list:",
                card.dataset.name,
                error
            );
            return;
        }

        if (
            !Array.isArray(images) ||
            images.length < 2 ||
            !images.every(
                src =>
                    typeof src === "string" &&
                    src.trim().length > 0
            )
        ) {
            return;
        }

        let index = Number(image.dataset.index || 0);

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= images.length
        ) {
            index = 0;
        }

        const previous = $(
            ".jn-books-gallery-button.left",
            card
        );

        const next = $(
            ".jn-books-gallery-button.right",
            card
        );

        const dots = $(
            ".jn-books-image-dots",
            card
        );

        let timer = null;
        let isHovered = false;
        let isFocused = false;

        function renderGallery() {
            index = (
                (index % images.length) +
                images.length
            ) % images.length;

            image.dataset.index = String(index);

            setImage(
                image,
                images[index],
                `${card.dataset.name || "Product"} — Image ${index + 1}`
            );

            if (!dots) return;

            const fragment =
                document.createDocumentFragment();

            images.forEach((src, dotIndex) => {
                const dot = document.createElement("button");

                dot.type = "button";
                dot.className =
                    dotIndex === index ? "active" : "";

                dot.setAttribute(
                    "aria-label",
                    `Show image ${dotIndex + 1} of ${images.length}`
                );

                dot.setAttribute(
                    "aria-pressed",
                    String(dotIndex === index)
                );

                dot.addEventListener("click", () => {
                    showImage(dotIndex);
                });

                fragment.appendChild(dot);
            });

            dots.replaceChildren(fragment);
        }

        function stopAutoplay() {
            if (timer !== null) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        function startAutoplay() {
            stopAutoplay();

            const enabled =
                image.dataset.autoplay === "true";

            if (
                !enabled ||
                isHovered ||
                isFocused ||
                document.hidden
            ) {
                return;
            }

            timer = window.setInterval(() => {
                index++;
                renderGallery();
            }, STORE.galleryInterval);
        }

        function showImage(nextIndex) {
            index = nextIndex;
            renderGallery();
            startAutoplay();
        }

        previous?.addEventListener("click", () => {
            showImage(index - 1);
        });

        next?.addEventListener("click", () => {
            showImage(index + 1);
        });

        card.addEventListener("mouseenter", () => {
            isHovered = true;
            stopAutoplay();
        });

        card.addEventListener("mouseleave", () => {
            isHovered = false;
            startAutoplay();
        });

        card.addEventListener("focusin", () => {
            isFocused = true;
            stopAutoplay();
        });

        card.addEventListener("focusout", event => {
            if (!card.contains(event.relatedTarget)) {
                isFocused = false;
                startAutoplay();
            }
        });

        const controller = {
            start: startAutoplay,
            stop: stopAutoplay
        };

        galleryControllers.set(image, controller);

        renderGallery();
        startAutoplay();
    });
}


/* ============================================================
   16. GALLERY VISIBILITY MANAGEMENT
============================================================ */

function setupGalleryVisibility() {
    if (
        document.documentElement.dataset.galleryVisibilityReady === "true"
    ) {
        return;
    }

    document.addEventListener("visibilitychange", () => {
        getProductCards().forEach(card => {
            const image = $(
                ".jn-books-product-image[data-images]",
                card
            );

            if (!image) return;

            const controller =
                galleryControllers.get(image);

            if (!controller) return;

            if (document.hidden) {
                controller.stop();
            } else {
                controller.start();
            }
        });
    });

    document.documentElement.dataset.galleryVisibilityReady =
        "true";
}

/* ================= END OF PART 1 — SECTIONS 01–16 ================= */


/* ============================================================
   17. STRICT BIBLE COVER FILTERING

   LANGUAGE RULES:
   English = English covers only.
   Telugu  = Telugu covers only.
   All     = All 10 covers.

   SIZE RULES:
   English = Regular only.
   Telugu  = Regular or Small.
   All     = All available sizes.

   No cross-language products are permitted.
============================================================ */

function normalizeCoverFilter(value) {
    return String(value ?? "all")
        .trim()
        .toLowerCase();
}


function getFilteredCovers() {

    const language = normalizeCoverFilter(
        $("#cover-language")?.value
    );

    const size = normalizeCoverFilter(
        $("#cover-size")?.value
    );

    return BIBLE_COVERS.filter(cover => {

        const coverLanguage =
            normalizeCoverFilter(cover.language);

        const coverSize =
            normalizeCoverFilter(cover.size);

        /* STRICT LANGUAGE FILTER */

        const languageMatches =
            language === "all" ||
            coverLanguage === language;

        /* STRICT SIZE FILTER */

        const sizeMatches =
            size === "all" ||
            coverSize === size;

        /* ENGLISH MUST NEVER SHOW SMALL COVERS */

        const validEnglishSize =
            coverLanguage !== "english" ||
            coverSize === "regular";

        return (
            languageMatches &&
            sizeMatches &&
            validEnglishSize
        );
    });
}


/* ============================================================
   18. DYNAMIC LANGUAGE AND SIZE OPTIONS

   English:
   Regular only.

   Telugu:
   Regular and Small.

   All Languages:
   All Sizes, Regular and Small.
============================================================ */

function populateCoverSizeOptions(selectedSize = "all") {

    const sizeSelect = $("#cover-size");

    const language = normalizeCoverFilter(
        $("#cover-language")?.value
    );

    if (!sizeSelect) return;

    let availableSizes;

    if (language === "english") {

        availableSizes = ["Regular"];

    } else if (language === "telugu") {

        availableSizes = ["Regular", "Small"];

    } else {

        availableSizes = ["All", "Regular", "Small"];
    }

    const requestedSize =
        normalizeCoverFilter(selectedSize);

    const matchingSize = availableSizes.find(
        size =>
            normalizeCoverFilter(size) === requestedSize
    );

    const finalSize =
        matchingSize || availableSizes[0];

    sizeSelect.replaceChildren();

    availableSizes.forEach(size => {

        const option = document.createElement("option");

        option.value = size;

        option.textContent =
            normalizeCoverFilter(size) === "all"
                ? "All Sizes"
                : size;

        sizeSelect.appendChild(option);
    });

    sizeSelect.value = finalSize;
}


/* ============================================================
   19. DYNAMIC BIBLE COVER DESIGN DROPDOWN
============================================================ */

function populateCoverDesignOptions(selectedId = "") {

    const select = $("#cover-design");

    if (!select) return [];

    const matches = getFilteredCovers();

    select.replaceChildren();

    if (matches.length === 0) {

        const option = document.createElement("option");

        option.value = "";
        option.textContent = "No matching Bible covers";

        select.appendChild(option);

        return [];
    }

    matches.forEach(cover => {

        const option = document.createElement("option");

        option.value = cover.id;

        option.textContent =
            `${cover.name} — ${money(cover.price)}`;

        option.dataset.language = cover.language;
        option.dataset.size = cover.size;
        option.dataset.price = String(cover.price);
        option.dataset.image = cover.image;

        select.appendChild(option);
    });

    const selectedExists = matches.some(
        cover => cover.id === selectedId
    );

    select.value = selectedExists
        ? selectedId
        : matches[0].id;

    return matches;
}


/* ============================================================
   20. SHARED EXPLORER DOT NAVIGATION
============================================================ */

function renderExplorerDots(
    selector,
    items,
    activeIndex,
    onSelect
) {

    const container = $(selector);

    if (!container) return;

    container.replaceChildren();

    items.forEach((item, index) => {

        const button = document.createElement("button");

        button.type = "button";

        button.className =
            index === activeIndex ? "active" : "";

        button.setAttribute(
            "aria-label",
            `View ${item.name || item.design || "option"}`
        );

        button.setAttribute(
            "aria-pressed",
            String(index === activeIndex)
        );

        button.addEventListener("click", () => {
            onSelect(index);
        });

        container.appendChild(button);
    });

    /* Hide dots when there is only one product. */

    container.hidden = items.length <= 1;
}



/* ============================================================
   21. RENDER SELECTED BIBLE COVER
============================================================ */

function renderCover(index = state.coverIndex) {

    const filteredCovers = getFilteredCovers();

    const image = $("#selected-cover-image");
    const enquiry = $("#enquire-about-cover") ||
        $("[data-enquire-cover]");

    // HANDLE EMPTY FILTER RESULTS

    if (!filteredCovers.length) {

        setImage(
            image,
            "",
            "No Bible covers match the selected filters"
        );

        setText("#selected-cover-name", "No matching Bible covers");
        setText("#cover-design-description", "");
        setText("#selected-cover-display-name", "No matching Bible covers");
        setText("#selected-cover-language", "—");
        setText("#selected-cover-size", "—");
        setText("#selected-cover-design", "—");
        setHTML("#cover-selected-price", "—");

        populateCoverDesignOptions("");

        if (enquiry) {
            enquiry.disabled = true;
            enquiry.dataset.product = "";
            enquiry.dataset.price = "";
            enquiry.dataset.variant = "";
            enquiry.dataset.image = "";
            enquiry.dataset.coverId = "";
        }

        const dots = $("#cover-image-dots");

        if (dots) {
            dots.replaceChildren();
            dots.hidden = true;
        }

        return;
    }

    // FIND SELECTED COVER

    let selectedCover = BIBLE_COVERS[index];

    let filteredIndex = filteredCovers.findIndex(
        cover => cover.id === selectedCover?.id
    );

    // FALL BACK TO FIRST MATCHING COVER

    if (filteredIndex === -1) {

        selectedCover = filteredCovers[0];

        index = BIBLE_COVERS.findIndex(
            cover => cover.id === selectedCover.id
        );

        filteredIndex = 0;
    }

    if (!selectedCover || index < 0) {
        console.error(
            "Bible Covers: selected cover could not be resolved."
        );
        return;
    }

    state.coverIndex = index;

    // PRODUCT IMAGE

    setImage(
        image,
        selectedCover.image,
        `${selectedCover.name} — ${selectedCover.language} Bible cover`
    );

    // PRODUCT INFORMATION

    setText("#selected-cover-name", selectedCover.name);
    setText("#cover-design-description", selectedCover.description);
    setText("#selected-cover-display-name", selectedCover.name);
    setText("#selected-cover-language", selectedCover.language);
    setText("#selected-cover-size", selectedCover.size);
    setText("#selected-cover-design", selectedCover.design);

    // PRICE

    setHTML(
        "#cover-selected-price",
        `${money(selectedCover.price)} <small>/ cover</small>`
    );

    // DESIGN DROPDOWN

    populateCoverDesignOptions(selectedCover.id);

    // WHATSAPP ENQUIRY

    if (enquiry) {

        enquiry.disabled = false;

        enquiry.dataset.product = selectedCover.name;
        enquiry.dataset.price = String(selectedCover.price);

        enquiry.dataset.variant =
            `${selectedCover.language} — ${selectedCover.size} — ${selectedCover.design}`;

        enquiry.dataset.image = selectedCover.image;
        enquiry.dataset.coverId = selectedCover.id;
    }

    // UPDATE PRODUCT CARD PRICE IF AVAILABLE

    const coverCard =
        enquiry?.closest("[data-product-id]") ||
        $('[data-product-id="bible-covers"]');

    updateCardPrice(coverCard, selectedCover.price);

    // FILTERED COVER NAVIGATION DOTS

    renderExplorerDots(
        "#cover-image-dots",
        filteredCovers,
        filteredIndex,
        nextFilteredIndex => {

            const nextCover = filteredCovers[nextFilteredIndex];

            if (!nextCover) return;

            const absoluteIndex = BIBLE_COVERS.findIndex(
                cover => cover.id === nextCover.id
            );

            if (absoluteIndex !== -1) {
                renderCover(absoluteIndex);
            }
        }
    );
}


/* ============================================================
   21. BIBLE COVER EXPLORER INITIALISATION

   Handles:
   - English / Telugu / All language filters
   - Regular / Small / All size filters
   - Design selection
   - Previous / Next gallery navigation
   - First matching cover selection
============================================================ */

function setupCoverExplorer() {

    const language = $("#cover-language");
    const size = $("#cover-size");
    const design = $("#cover-design");

    const previous = $("#cover-gallery-prev");
    const next = $("#cover-gallery-next");

    if (!language || !size || !design) {

        console.warn(
            "Bible Covers explorer: required HTML controls are missing."
        );

        return;
    }

    /* PREVENT DUPLICATE EVENT LISTENERS */

    if (language.dataset.coverExplorerReady === "true") {
        return;
    }

    language.dataset.coverExplorerReady = "true";


    /* SELECT FIRST MATCHING COVER */

    function selectFirstFilteredCover() {

        const matches = getFilteredCovers();

        if (!matches.length) {

            renderCover(state.coverIndex);

            return;
        }

        const absoluteIndex = BIBLE_COVERS.findIndex(
            cover => cover.id === matches[0].id
        );

        if (absoluteIndex !== -1) {
            renderCover(absoluteIndex);
        }
    }


    /* LANGUAGE CHANGE */

    language.addEventListener("change", () => {

        const selectedLanguage =
            normalizeCoverFilter(language.value);

        if (
            !["all", "english", "telugu"].includes(selectedLanguage)
        ) {
            language.value = "All";
        }

        /*
           Reset the size filter whenever the language changes.

           English -> Regular
           Telugu  -> Regular
           All     -> All Sizes
        */

        if (selectedLanguage === "all") {

            populateCoverSizeOptions("All");

        } else {

            populateCoverSizeOptions("Regular");
        }

        selectFirstFilteredCover();
    });


    /* SIZE CHANGE */

    size.addEventListener("change", () => {

        selectFirstFilteredCover();
    });


    /* DESIGN CHANGE */

    design.addEventListener("change", () => {

        const selectedId = design.value;

        const selected = getFilteredCovers().find(
            cover => cover.id === selectedId
        );

        if (!selected) return;

        const absoluteIndex = BIBLE_COVERS.findIndex(
            cover => cover.id === selected.id
        );

        if (absoluteIndex !== -1) {
            renderCover(absoluteIndex);
        }
    });


    /* PREVIOUS COVER */

    previous?.addEventListener("click", () => {

        const matches = getFilteredCovers();

        if (matches.length <= 1) return;

        const currentIndex = matches.findIndex(
            cover =>
                cover.id === BIBLE_COVERS[state.coverIndex]?.id
        );

        const safeIndex =
            currentIndex === -1 ? 0 : currentIndex;

        const previousIndex =
            (safeIndex - 1 + matches.length) % matches.length;

        const selected = matches[previousIndex];

        const absoluteIndex = BIBLE_COVERS.findIndex(
            cover => cover.id === selected.id
        );

        if (absoluteIndex !== -1) {
            renderCover(absoluteIndex);
        }
    });


    /* NEXT COVER */

    next?.addEventListener("click", () => {

        const matches = getFilteredCovers();

        if (matches.length <= 1) return;

        const currentIndex = matches.findIndex(
            cover =>
                cover.id === BIBLE_COVERS[state.coverIndex]?.id
        );

        const safeIndex =
            currentIndex === -1 ? 0 : currentIndex;

        const nextIndex =
            (safeIndex + 1) % matches.length;

        const selected = matches[nextIndex];

        const absoluteIndex = BIBLE_COVERS.findIndex(
            cover => cover.id === selected.id
        );

        if (absoluteIndex !== -1) {
            renderCover(absoluteIndex);
        }
    });


    /* INITIAL LANGUAGE VALIDATION */

    const initialLanguage =
        normalizeCoverFilter(language.value);

    if (
        !["all", "english", "telugu"].includes(initialLanguage)
    ) {
        language.value = "All";
    }


    /* INITIAL SIZE */

    const finalLanguage =
        normalizeCoverFilter(language.value);

    if (finalLanguage === "all") {

        populateCoverSizeOptions("All");

    } else {

        populateCoverSizeOptions("Regular");
    }


    /* INITIAL PRODUCT */

    selectFirstFilteredCover();
}


/* ================= END OF BIBLE COVER EXPLORER ================= */


/* ============================================================
   22. RENDER SELECTED CHRISTIAN PHOTO FRAME
============================================================ */

function getFilteredFrames() {

    const language =
        $("#frame-language")?.value || "all";

    return PHOTO_FRAMES.filter(frame =>
        language === "all" ||
        frame.language === language
    );
}


function renderFrame(index = state.frameIndex) {

    const filteredFrames = getFilteredFrames();

    if (!filteredFrames.length) {

        console.warn(
            "Photo Frames: no products match the selected language."
        );

        const enquiry = $("#enquire-about-frame");

        if (enquiry) {
            enquiry.disabled = true;
        }

        return;
    }

    let item = PHOTO_FRAMES[index];

    let filteredIndex = filteredFrames.findIndex(
        frame => frame.id === item?.id
    );


    /* FALL BACK TO FIRST MATCHING FRAME */

    if (filteredIndex === -1) {

        item = filteredFrames[0];

        index = PHOTO_FRAMES.findIndex(
            frame => frame.id === item.id
        );

        filteredIndex = 0;
    }

    state.frameIndex = index;


    /* PRODUCT IMAGE */

    setImage(
        $("#selected-frame-image"),
        item.image,
        `${item.name} — ${item.language} Christian photo frame`
    );


    /* PRODUCT INFORMATION */

    setText("#selected-frame-name", item.name);

    setText(
        "#frame-design-description",
        item.description
    );

    setText(
        "#selected-frame-display-name",
        item.name
    );

    setText(
        "#selected-frame-language",
        item.language
    );

    setText(
        "#selected-frame-reference",
        item.reference
    );

    setText(
        "#selected-frame-design",
        item.design
    );


    /* PRICE */

    setHTML(
        "#frame-selected-price",
        `${money(item.price)} <small>/ frame</small>`
    );


    /* MAIN PRODUCT CARD PRICE */

    const card = $(
        '[data-product-id="christian-photo-frames"]'
    );

    updateCardPrice(card, item.price);


    /* WHATSAPP ENQUIRY */

    const enquiry = $("#enquire-about-frame");

    if (enquiry) {

        enquiry.disabled = false;

        enquiry.dataset.product = item.name;

        enquiry.dataset.price =
            String(item.price);

        enquiry.dataset.variant =
            `${item.language} — ${item.reference} — ${item.design}`;

        enquiry.dataset.category = "gifts";

        enquiry.dataset.image = item.image;

        enquiry.dataset.frameId = item.id;
    }


    /* DOTS: ACTIVE LANGUAGE ONLY */

    renderExplorerDots(
        "#frame-image-dots",
        filteredFrames,
        filteredIndex,
        nextFilteredIndex => {

            const selected =
                filteredFrames[nextFilteredIndex];

            const absoluteIndex = PHOTO_FRAMES.findIndex(
                frame => frame.id === selected.id
            );

            if (absoluteIndex !== -1) {
                renderFrame(absoluteIndex);
            }
        }
    );
}


/* ============================================================
   23. SETUP PHOTO FRAME EXPLORER
============================================================ */

function setupFrameExplorer() {

    const language = $("#frame-language");


    /* SELECT FIRST MATCHING FRAME */

    function selectFirstFilteredFrame() {

        const matches = getFilteredFrames();

        if (!matches.length) {

            const enquiry = $("#enquire-about-frame");

            if (enquiry) {
                enquiry.disabled = true;
            }

            return;
        }

        const absoluteIndex = PHOTO_FRAMES.findIndex(
            frame => frame.id === matches[0].id
        );

        if (absoluteIndex !== -1) {
            renderFrame(absoluteIndex);
        }
    }


    /* PREVIOUS FRAME */

    $("#frame-gallery-prev")?.addEventListener(
        "click",
        () => {

            const matches = getFilteredFrames();

            if (!matches.length) return;

            const currentIndex = matches.findIndex(
                frame =>
                    frame.id === PHOTO_FRAMES[state.frameIndex]?.id
            );

            const safeIndex =
                currentIndex === -1 ? 0 : currentIndex;

            const previousIndex =
                (safeIndex - 1 + matches.length) %
                matches.length;

            const selected = matches[previousIndex];

            const absoluteIndex = PHOTO_FRAMES.findIndex(
                frame => frame.id === selected.id
            );

            if (absoluteIndex !== -1) {
                renderFrame(absoluteIndex);
            }
        }
    );


    /* NEXT FRAME */

    $("#frame-gallery-next")?.addEventListener(
        "click",
        () => {

            const matches = getFilteredFrames();

            if (!matches.length) return;

            const currentIndex = matches.findIndex(
                frame =>
                    frame.id === PHOTO_FRAMES[state.frameIndex]?.id
            );

            const safeIndex =
                currentIndex === -1 ? 0 : currentIndex;

            const nextIndex =
                (safeIndex + 1) % matches.length;

            const selected = matches[nextIndex];

            const absoluteIndex = PHOTO_FRAMES.findIndex(
                frame => frame.id === selected.id
            );

            if (absoluteIndex !== -1) {
                renderFrame(absoluteIndex);
            }
        }
    );


    /* LANGUAGE FILTER */

    language?.addEventListener(
        "change",
        selectFirstFilteredFrame
    );


    /* VALIDATE INITIAL LANGUAGE */

    if (
        language &&
        ![
            "all",
            "English",
            "Telugu",
            "Telugu & English"
        ].includes(language.value)
    ) {
        language.value = "all";
    }


    /* INITIAL FRAME */

    selectFirstFilteredFrame();
}


/* ============================================================
   24. WRISTBAND CONFIGURATOR
   FIXED PRICE: ₹20 PER WRISTBAND
   NO COMBO OFFERS
============================================================ */

function updateWristbandSelection() {

    const selected = [...state.selectedColours];

    const quantity = selected.length;

    const price = quantity * WRISTBAND_PRICE;


    /* CURRENTLY SELECTED COLOUR */

    const currentColour =
        selected.includes(state.lastSelectedColour)
            ? state.lastSelectedColour
            : selected[selected.length - 1] ||
              WRISTBAND_COLOURS[0].name;


    const colourRecord =
        WRISTBAND_COLOURS.find(item =>
            item.name === currentColour
        ) || WRISTBAND_COLOURS[0];


    /* PRODUCT IMAGE */

    setImage(
        $("#wristband-selected-image"),
        colourRecord.image,
        `${colourRecord.name} Jesus Loves You wristband`
    );


    /* COLOUR SELECTION BUTTONS */

    $$("#wristband-colour-options [data-wristband-colour]")
        .forEach(button => {

            button.type = "button";

            const active = state.selectedColours.has(
                button.dataset.wristbandColour
            );

            button.classList.toggle("active", active);

            button.setAttribute(
                "aria-pressed",
                String(active)
            );
        });


    /* PRICE DISPLAY */

    setHTML(
        "#wristband-selected-price",
        `${money(price)} <small>${quantity} wristband${quantity === 1 ? "" : "s"}</small>`
    );


    /* SELECTION STATUS */

    const status = $("#wristband-selection-status");

    if (status) {

        if (quantity === 0) {

            status.textContent =
                "Select your favourite wristband colour.";

        } else {

            status.textContent =
                `${quantity} wristband${quantity === 1 ? "" : "s"} selected. Total: ${money(price)}.`;
        }
    }


    /* WHATSAPP ENQUIRY */

    const button = $("#enquire-about-wristbands");

    if (button) {

        button.disabled = quantity === 0;

        button.dataset.product =
            "Jesus Loves You Wristbands";

        button.dataset.price =
            String(price);

        button.dataset.variant =
            selected.join(", ");

        button.dataset.image =
            colourRecord.image;

        button.dataset.quantity =
            String(quantity);

        button.dataset.quantityUnit =
            "wristbands";

        button.dataset.category =
            "gifts";
    }


    /* MAIN PRODUCT CARD PRICE */

    const card = $(
        '[data-product-id="jesus-loves-you-wristbands"]'
    );

    updateCardPrice(card, price);
}


/* ============================================================
   25. SETUP WRISTBAND CONTROLS
   NO COMBO DROPDOWN
============================================================ */

function setupWristbands() {

    const swatches = $("#wristband-colour-options");

    if (!swatches) return;


    /* PREVENT DUPLICATE INITIALIZATION */

    if (swatches.dataset.wristbandsReady === "true") {
        return;
    }

    swatches.dataset.wristbandsReady = "true";


    /* COLOUR SELECTION */

    swatches.addEventListener("click", event => {

        if (!(event.target instanceof Element)) return;

        const button = event.target.closest(
            "[data-wristband-colour]"
        );

        if (!button || !swatches.contains(button)) {
            return;
        }

        const colour = button.dataset.wristbandColour;


        /* VALIDATE COLOUR */

        if (
            !WRISTBAND_COLOURS.some(
                item => item.name === colour
            )
        ) {
            return;
        }


        /* TOGGLE COLOUR SELECTION */

        if (state.selectedColours.has(colour)) {

            state.selectedColours.delete(colour);

        } else {

            state.selectedColours.add(colour);

            state.lastSelectedColour = colour;
        }


        updateWristbandSelection();
    });


    /* INITIAL DISPLAY */

    updateWristbandSelection();
}
 

/* ============================================================
   26. PROMISE CARDS PRICING & IMAGE CONFIGURATION
   ------------------------------------------------------------
   SIX IMAGES:
   pc - 1.jpeg through pc - 6.jpeg

   Quantity options:
   100–700 cards.

   Selected gallery image is automatically included
   in the WhatsApp enquiry.
============================================================ */

const PROMISE_CARD_IMAGES = Object.freeze([
    "images/pc - 1.jpeg",
    "images/pc - 2.jpeg",
    "images/pc - 3.jpeg",
    "images/pc - 4.jpeg",
    "images/pc - 5.jpeg",
    "images/pc - 6.jpeg",
     
]);


/* ============================================================
   UPDATE PROMISE CARD PRICE
============================================================ */

function updatePromiseCardPrice() {

    const select = $("#promise-quantity");

    const option = select?.selectedOptions?.[0];

    if (!option) return;

    const quantity = Number(option.value);

    const price = Number(
        option.dataset.price || quantity
    );


    /* PRICE DISPLAY */

    setHTML(
        "#promise-price",
        `${money(price)} <small>selected pack</small>`
    );


    /* WHATSAPP ENQUIRY */

    const card = $(
        '[data-product-id="promise-cards"]'
    );

    const button = $(
        "[data-enquire]",
        card || document
    );

    if (button) {

        button.dataset.product = "Promise Cards";

        button.dataset.price =
            String(price);

        button.dataset.variant =
            `${quantity} Cards`;

        button.dataset.quantity =
            String(quantity);

        button.dataset.quantityUnit =
            "cards";

        button.dataset.category =
            "promises";
    }


    /* MAIN PRODUCT CARD PRICE */

    updateCardPrice(card, price);
}



/* =========================================================
   27. PROMISE CARDS GALLERY SETUP
========================================================= */

function setupPromiseCards() {

    /* -----------------------------------------
       1. INITIALIZE QUANTITY AND PACK PRICING
    ----------------------------------------- */

    const quantitySelect = $("#promise-quantity");

    const card = $('[data-product-id="promise-cards"]');

    const enquiryButton = $("[data-enquire]", card || document);

    if (
        quantitySelect &&
        quantitySelect.dataset.promisePricingReady !== "true"
    ) {

        quantitySelect.addEventListener(
            "change",
            updatePromiseCardPrice
        );

        quantitySelect.dataset.promisePricingReady = "true";
    }

    updatePromiseCardPrice();


    /* -----------------------------------------
       2. FIND PROMISE CARDS GALLERY
    ----------------------------------------- */

    const gallery = $("[data-promise-gallery]");

    if (!gallery) {

        console.warn(
            "Promise Cards: Gallery not found. Check data-promise-gallery in books.html."
        );

        return;
    }

    // Prevent duplicate initialization.
    if (gallery.dataset.promiseGalleryReady === "true") {
        return;
    }


    /* -----------------------------------------
       3. FIND ALL GALLERY ELEMENTS
    ----------------------------------------- */

    const image = $("[data-promise-image]", gallery);

    const previous = $("[data-promise-prev]", gallery);

    const next = $("[data-promise-next]", gallery);

    const dots = $$("[data-promise-dot]", gallery);


    /* -----------------------------------------
       4. VALIDATE GALLERY ELEMENTS
    ----------------------------------------- */

    const imageArrayValid =
        Array.isArray(PROMISE_CARD_IMAGES);

    const imageCount = imageArrayValid
        ? PROMISE_CARD_IMAGES.length
        : 0;

    const errors = [];

    if (!image) {
        errors.push("Main gallery image is missing.");
    }

    if (!previous) {
        errors.push("Previous arrow is missing.");
    }

    if (!next) {
        errors.push("Next arrow is missing.");
    }

    if (dots.length !== 6) {
        errors.push(
            `Expected 6 navigation dots, but found ${dots.length}.`
        );
    }

    if (!imageArrayValid) {
        errors.push(
            "PROMISE_CARD_IMAGES is not a valid array."
        );
   } else if (imageCount !== 6) {
    errors.push(
        `Expected 6 gallery images, but found ${imageCount}.`
    );
}

    if (errors.length > 0) {

        console.error(
            "Promise Cards: Gallery initialization failed."
        );

        errors.forEach((error) => {
            console.error("❌ " + error);
        });

        console.table({
            imageFound: !!image,
            previousArrowFound: !!previous,
            nextArrowFound: !!next,
            navigationDotsFound: dots.length,
            imageArrayValid: imageArrayValid,
            imageCount: imageCount
        });

        return;
    }


    /* -----------------------------------------
       5. MARK GALLERY AS INITIALIZED
    ----------------------------------------- */

    gallery.dataset.promiseGalleryReady = "true";


    /* -----------------------------------------
       6. INITIALIZE GALLERY INDEX
    ----------------------------------------- */

    let currentIndex = 0;

    let transitionFrame = null;


    /* -----------------------------------------
       7. RENDER SELECTED PROMISE CARD IMAGE
    ----------------------------------------- */

    function renderPromiseImage(index) {

        // Circular navigation.
        currentIndex =
            (
                index + PROMISE_CARD_IMAGES.length
            ) % PROMISE_CARD_IMAGES.length;

        const selectedIndex = currentIndex;

        const selectedImage =
            PROMISE_CARD_IMAGES[selectedIndex];


        // Cancel any pending transition.
        if (transitionFrame !== null) {
            cancelAnimationFrame(transitionFrame);
        }


        // Begin image transition.
        image.classList.remove("is-active");


        transitionFrame = requestAnimationFrame(() => {

            // Change image source and alternative text.
            setImage(
                image,
                selectedImage,
                `Promise Cards Design ${selectedIndex + 1}`
            );

            image.dataset.imageIndex =
                String(selectedIndex);


            // Complete image transition.
            transitionFrame = requestAnimationFrame(() => {

                image.classList.add("is-active");

                transitionFrame = null;

            });

        });


        /* -------------------------------------
           UPDATE SIX NAVIGATION DOTS
        ------------------------------------- */

        dots.forEach((dot, dotIndex) => {

            const isActive =
                dotIndex === selectedIndex;

            dot.classList.toggle(
                "is-active",
                isActive
            );

            dot.setAttribute(
                "aria-pressed",
                String(isActive)
            );

            dot.setAttribute(
                "aria-current",
                isActive ? "true" : "false"
            );

        });


        /* -------------------------------------
           UPDATE WHATSAPP ENQUIRY IMAGE
        ------------------------------------- */

        if (enquiryButton) {

            enquiryButton.dataset.image =
                selectedImage;

        }

    }


    /* -----------------------------------------
       8. PREVIOUS ARROW
    ----------------------------------------- */

    previous.addEventListener("click", (event) => {

        event.preventDefault();

        renderPromiseImage(currentIndex - 1);

    });


    /* -----------------------------------------
       9. NEXT ARROW
    ----------------------------------------- */

    next.addEventListener("click", (event) => {

        event.preventDefault();

        renderPromiseImage(currentIndex + 1);

    });


    /* -----------------------------------------
       10. NAVIGATION DOTS
    ----------------------------------------- */

    dots.forEach((dot, index) => {

        dot.addEventListener("click", (event) => {

            event.preventDefault();

            renderPromiseImage(index);

        });

    });


    /* -----------------------------------------
       11. DISPLAY FIRST IMAGE
    ----------------------------------------- */

    renderPromiseImage(0);


    /* -----------------------------------------
       12. SUCCESS MESSAGE
    ----------------------------------------- */

    console.info(
        "Jehovah Jireh Bookstore: Promise Cards six-image gallery initialized successfully."
    );

}


/* ============================================================
   28. SUNDAY SCHOOL SONGS BOOKS CONFIGURATOR
============================================================ */

function setupSundaySchoolBooks() {

    const card = $(
        '[data-product-id="sunday-school-songs-books"]'
    );

    if (!card) return;


    /* -----------------------------------------
       1. HTML ELEMENTS
    ----------------------------------------- */

    const select = $("#sunday-school-cover-design", card);
    const image = $("#sunday-school-selected-image", card);
    const coverName = $("#sunday-school-selected-cover", card);
    const colourName = $("#sunday-school-selected-colour", card);
    const priceDisplay = $("#sunday-school-selected-price", card);

    const enquiryButton = $(
        "#enquire-about-sunday-school-books",
        card
    );

    const previousButton = $(
        "#sunday-school-gallery-prev",
        card
    );

    const nextButton = $(
        "#sunday-school-gallery-next",
        card
    );


    /* -----------------------------------------
       2. VALIDATE REQUIRED ELEMENTS
    ----------------------------------------- */

    if (
        !select ||
        !image ||
        !coverName ||
        !colourName ||
        !priceDisplay ||
        !enquiryButton
    ) {
        console.warn(
            "Sunday School Books: Required HTML elements are missing."
        );
        return;
    }

    if (card.dataset.sundaySchoolReady === "true") {
        return;
    }

    card.dataset.sundaySchoolReady = "true";


    /* -----------------------------------------
       3. LOAD EDITIONS AND PRICE
    ----------------------------------------- */

    const editions = Object.values(
        SUNDAY_SCHOOL_BOOKS.editions
    );

    const price = SUNDAY_SCHOOL_BOOKS.price;

    if (!editions.length) {
        console.warn("Sunday School Books: No editions found.");
        return;
    }


    /* -----------------------------------------
       4. RESTORE PREVIOUS SELECTION
    ----------------------------------------- */

    const savedIndex = editions.findIndex(
        edition => edition.id === state.sundaySchoolCover
    );

    let selectedIndex = savedIndex >= 0 ? savedIndex : 0;


    /* -----------------------------------------
       5. RENDER SELECTED EDITION
    ----------------------------------------- */

    function renderEdition(index) {

        selectedIndex =
            (index + editions.length) % editions.length;

        const edition = editions[selectedIndex];

        if (!edition) return;

        state.sundaySchoolCover = edition.id;

        select.value = edition.id;


        /* PRODUCT IMAGE */

        setImage(
            image,
            edition.image,
            `Sunday School Songs Book — ${edition.name}`
        );


        /* PRODUCT INFORMATION */

        coverName.textContent = edition.name;
        colourName.textContent = edition.colour;


        /* PRICE */

        priceDisplay.innerHTML =
            `${money(price)} <small>/ book</small>`;

        updateCardPrice(card, price);


        /* WHATSAPP ENQUIRY */

        enquiryButton.disabled = false;

        enquiryButton.dataset.product =
            "Sunday School Songs Book";

        enquiryButton.dataset.price =
            String(price);

        enquiryButton.dataset.quantity = "1";
        enquiryButton.dataset.quantityUnit = "book";
        enquiryButton.dataset.category = "songs";

        enquiryButton.dataset.variant =
            `${edition.name} — ${edition.colour}`;

        enquiryButton.dataset.image = edition.image;


        /* GALLERY DOTS */

        renderExplorerDots(
            "#sunday-school-image-dots",
            editions,
            selectedIndex,
            nextIndex => renderEdition(nextIndex)
        );
    }


    /* -----------------------------------------
       6. EDITION SELECT CHANGE
    ----------------------------------------- */

    select.addEventListener("change", () => {

        const index = editions.findIndex(
            edition => edition.id === select.value
        );

        if (index !== -1) {
            renderEdition(index);
        }

    });


    /* -----------------------------------------
       7. PREVIOUS EDITION
    ----------------------------------------- */

    previousButton?.addEventListener("click", (event) => {

        event.preventDefault();

        renderEdition(selectedIndex - 1);

    });


    /* -----------------------------------------
       8. NEXT EDITION
    ----------------------------------------- */

    nextButton?.addEventListener("click", (event) => {

        event.preventDefault();

        renderEdition(selectedIndex + 1);

    });


    /* -----------------------------------------
       9. DISPLAY INITIAL EDITION
    ----------------------------------------- */

    renderEdition(selectedIndex);

}


/* ================= END OF PART 2 — SECTIONS 21–28 ================= */

/* ================= END OF PART 2 — SECTIONS 21–28 ================= */


/* ============================================================
   29. KEYCHAIN COLLECTION FILTERS
============================================================ */

function getKeychainCards(section) {

    return $$(
        "[data-keychain-card]",
        section
    );
}


function getKeychainFilterButtons(section) {

    return $$(
        [
            "[data-keychain-filter]",
            "[data-keychain-category-filter]",
            "[data-keychain-tab]",
            "button[data-keychain-category]"
        ].join(","),
        section
    );
}


function getKeychainButtonCategory(button) {

    return normalizeCategory(
        button.dataset.keychainFilter ||
        button.dataset.keychainCategoryFilter ||
        button.dataset.keychainTab ||
        button.dataset.keychainCategory ||
        "all"
    );
}


function updateKeychainFilterButtons(section) {

    getKeychainFilterButtons(section).forEach(button => {

        const active =
            getKeychainButtonCategory(button) ===
            state.keychainCategory;

        button.classList.toggle(
            "active",
            active
        );

        button.setAttribute(
            "aria-pressed",
            String(active)
        );
    });
}


function applyKeychainFilter(section) {

    if (!section) return;

    const cards =
        getKeychainCards(section);

    let visibleCount = 0;


    /* FILTER PRODUCT CARDS */

    cards.forEach(card => {

        const category = normalizeCategory(
            card.dataset.keychainCategory
        );

        const matches =
            state.keychainCategory === "all" ||
            category === state.keychainCategory;

        card.hidden = !matches;

        if (matches) {
            visibleCount++;
        }
    });


    /* EMPTY STATE */

    const empty = $(
        "[data-keychains-empty]",
        section
    );

    if (empty) {
        empty.hidden = visibleCount !== 0;
    }


    /* RESULT COUNT */

    const result = $(
        "[data-keychains-result]",
        section
    );

    if (result) {

        result.textContent =
            `Showing ${visibleCount} of ${cards.length} keychains`;
    }
}


function setupKeychainFilters() {

    const section =
        $(STORE.selectors.keychains);

    if (!section) return;


    /* PREVENT DUPLICATE INITIALISATION */

    if (section.dataset.keychainFiltersReady === "true") {
        return;
    }

    section.dataset.keychainFiltersReady = "true";


    /* CATEGORY BUTTON CLICK */

    section.addEventListener("click", event => {

        const button = event.target.closest(
            [
                "[data-keychain-filter]",
                "[data-keychain-category-filter]",
                "[data-keychain-tab]",
                "button[data-keychain-category]"
            ].join(",")
        );

        if (!button || !section.contains(button)) {
            return;
        }


        state.keychainCategory =
            getKeychainButtonCategory(button);


        updateKeychainFilterButtons(section);

        applyKeychainFilter(section);
    });


    /* INITIAL FILTER */

    updateKeychainFilterButtons(section);

    applyKeychainFilter(section);
}


/* ================= END OF SECTION 29 ================= */


/* ============================================================
   30. KEYCHAIN PRODUCT EXPLORER
============================================================ */

function setupKeychainProductExplorer() {
    const image = $("#selected-keychain-image");
    const previous = $("#keychain-gallery-prev");
    const next = $("#keychain-gallery-next");
    const dots = $("#keychain-image-dots");

    const collectionFilter = $("#keychain-collection");
    const designSelect = $("#keychain-design");

    const name = $("#selected-keychain-name");
    const description = $("#keychain-design-description");
    const displayName = $("#selected-keychain-display-name");
    const selectedCollection = $("#selected-keychain-collection");
    const selectedDesign = $("#selected-keychain-design");
    const priceDisplay = $("#keychain-selected-price");

    const enquiryButton = $("#enquire-about-keychain");

    if (
        !image ||
        !previous ||
        !next ||
        !dots ||
        !collectionFilter ||
        !designSelect ||
        !enquiryButton
    ) {
        console.info(
            "Keychain explorer not initialized: one or more required HTML elements are missing."
        );
        return;
    }

    let currentCollection = "all";
    let currentDesigns = [...KEYCHAINS];
    let currentIndex = 0;

    function getSelectedKeychain() {
        return currentDesigns[currentIndex] || null;
    }

    function updateDesignOptions() {
        currentCollection =
            normalizeCategory(collectionFilter.value);

        currentDesigns =
            currentCollection === "all"
                ? [...KEYCHAINS]
                : KEYCHAINS.filter(
                    item => item.collection === currentCollection
                );

        designSelect.replaceChildren();

        currentDesigns.forEach((item, index) => {
            const option = document.createElement("option");

            option.value = String(index);
            option.textContent =
                `${item.name} — ${money(item.price)}`;

            designSelect.appendChild(option);
        });

        currentIndex = 0;

        if (!currentDesigns.length) {
            designSelect.value = "";
            enquiryButton.disabled = true;

            setImage(
                image,
                "",
                "No keychain designs available"
            );

            if (name) name.textContent = "No designs available";
            if (description) description.textContent = "";
            if (displayName) displayName.textContent = "";
            if (selectedCollection) selectedCollection.textContent = "";
            if (selectedDesign) selectedDesign.textContent = "";
            if (priceDisplay) priceDisplay.textContent = "";

            dots.replaceChildren();
            return;
        }

        designSelect.value = "0";
        updateSelectedKeychain();
    }

    function updateSelectedKeychain() {
        const item = getSelectedKeychain();

        if (!item) return;

        setImage(
            image,
            item.image,
            `${item.name} Christian keychain`
        );

        if (name) name.textContent = item.name;
        if (description) description.textContent = item.description;
        if (displayName) displayName.textContent = item.name;

        if (selectedCollection) {
            selectedCollection.textContent = item.collectionName;
        }

        if (selectedDesign) {
            selectedDesign.textContent = item.design;
        }

        if (priceDisplay) {
            priceDisplay.textContent = money(item.price);
        }

        designSelect.value = String(currentIndex);

        enquiryButton.disabled = false;
        enquiryButton.dataset.product =
            `Christian Keychains — ${item.name}`;
        enquiryButton.dataset.price = String(item.price);
        enquiryButton.dataset.variant =
            `${item.collectionName} — ${item.design}`;
        enquiryButton.dataset.category = "gifts";
        enquiryButton.dataset.image = item.image;
        enquiryButton.dataset.keychainId = item.id;

        updateGalleryDots();
    }

    function updateGalleryDots() {
        dots.replaceChildren();

        currentDesigns.forEach((item, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "jn-books-image-dot";

            dot.setAttribute(
                "aria-label",
                `View ${item.name}`
            );

            dot.setAttribute(
                "aria-current",
                index === currentIndex ? "true" : "false"
            );

            dot.setAttribute(
                "aria-pressed",
                String(index === currentIndex)
            );

            if (index === currentIndex) {
                dot.classList.add("active");
            }

            dot.addEventListener("click", () => {
                currentIndex = index;
                updateSelectedKeychain();
            });

            dots.appendChild(dot);
        });
    }

    previous.addEventListener("click", () => {
        if (!currentDesigns.length) return;

        currentIndex =
            (currentIndex - 1 + currentDesigns.length) %
            currentDesigns.length;

        updateSelectedKeychain();
    });

    next.addEventListener("click", () => {
        if (!currentDesigns.length) return;

        currentIndex =
            (currentIndex + 1) % currentDesigns.length;

        updateSelectedKeychain();
    });

    collectionFilter.addEventListener("change", () => {
        updateDesignOptions();
    });

    designSelect.addEventListener("change", () => {
        const index = Number(designSelect.value);

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < currentDesigns.length
        ) {
            currentIndex = index;
            updateSelectedKeychain();
        }
    });

    const initialCollection =
        normalizeCategory(collectionFilter.value);

    currentCollection = [
        "all",
        "alphabet",
        "guitar",
        "cross",
        "oval"
    ].includes(initialCollection)
        ? initialCollection
        : "all";

    collectionFilter.value = currentCollection;

    updateDesignOptions();

    window.JehovahJirehKeychainExplorer = Object.freeze({
        getSelected: getSelectedKeychain,

        getCollection: () => currentCollection,

        getDesigns: () => [...currentDesigns],

        select: index => {
            if (
                Number.isInteger(index) &&
                index >= 0 &&
                index < currentDesigns.length
            ) {
                currentIndex = index;
                updateSelectedKeychain();
            }
        },

        selectCollection: collection => {
            const normalized =
                normalizeCategory(collection);

            if (
                ![
                    "all",
                    "alphabet",
                    "guitar",
                    "cross",
                    "oval"
                ].includes(normalized)
            ) {
                return;
            }

            collectionFilter.value = normalized;
            updateDesignOptions();
        }
    });
}


/* ============================================================
   31. LEGACY KEYCHAIN CARD ENQUIRY
============================================================ */

function createKeychainEnquiryButton(card) {
    if (!card) return null;

    const name =
        card.dataset.name ||
        card.dataset.keychainId ||
        "Christian Keychain";

    const price =
        Number(card.dataset.price || 0);

    const category =
        normalizeCategory(card.dataset.keychainCategory);

    const image = $("img", card);

    const imageSource =
        image && image.dataset.imageError !== "true"
            ? image.currentSrc || image.src
            : "";

    return {
        disabled: false,

        dataset: {
            product: name,
            price: String(price),

            variant: category === "all"
                ? "Christian Keychain"
                : `${category.charAt(0).toUpperCase()}${category.slice(1)} Keychain`,

            image: imageSource
        }
    };
}


function handleKeychainEnquiry(button) {
    const section = $(STORE.selectors.keychains);

    if (!section) return;

    const productId =
        button.dataset.keychainEnquire;

    const cards = getKeychainCards(section);

    const card = cards.find(item =>
        item.dataset.keychainId === productId ||
        item.dataset.keychainId === button.dataset.keychainId ||
        item.id === productId
    );

    if (!card) {
        console.warn(
            "Could not find the keychain product for enquiry:",
            productId
        );

        showToast(
            "Sorry, this keychain enquiry could not be opened."
        );

        return;
    }

    const enquiryButton =
        createKeychainEnquiryButton(card);

    if (enquiryButton) {
        openWhatsApp(enquiryButton);
    }
}


/* ============================================================
   32. WHATSAPP ENQUIRY MESSAGE
============================================================ */

function createEnquiryMessage(button) {
    const product =
        button.dataset.product || "Product enquiry";

    const price =
        Number(button.dataset.price || 0);

    const variant =
        button.dataset.variant || "";

    const quantity =
        button.dataset.quantity;

    const unit =
        button.dataset.quantityUnit;

    const lines = [
        `Hello ${STORE.name},`,
        "",
        "I would like to enquire about the following product:",
        `Product: ${product}`
    ];

    if (variant) {
        lines.push(`Selection: ${variant}`);
    }

    if (quantity && unit) {
        lines.push(`Quantity: ${quantity} ${unit}`);
    }

    if (price > 0) {
        lines.push(`Displayed price: ${money(price)}`);
    }

    if (button.dataset.image) {
        try {
            const imageURL = new URL(
                button.dataset.image,
                document.baseURI
            ).href;

            lines.push(`Product image: ${imageURL}`);
        } catch (error) {
            console.warn(
                "Could not create product image URL:",
                error
            );
        }
    }

    lines.push(
        "",
        "Please let me know about availability and the purchasing process.",
        "",
        "Thank you."
    );

    return lines.join("\n");
}


/* ============================================================
   33. OPEN WHATSAPP
============================================================ */

function openWhatsApp(button) {
    if (!button || button.disabled) return;

    const message =
        createEnquiryMessage(button);

    const url =
        `https://wa.me/${STORE.primaryPhone}` +
        `?text=${encodeURIComponent(message)}`;

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}


/* ============================================================
   34. PRODUCT ENQUIRY EVENTS
============================================================ */

function setupEnquiries() {
    if (
        document.documentElement.dataset.enquiriesReady === "true"
    ) {
        return;
    }

    document.addEventListener("click", event => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        /* LEGACY KEYCHAIN ENQUIRY BUTTONS */

        const keychainButton = target.closest(
            "[data-keychain-enquire]"
        );

        if (keychainButton) {
            if (keychainButton.disabled) return;

            handleKeychainEnquiry(keychainButton);
            return;
        }

        /* MAIN AND EXPLORER ENQUIRY BUTTONS */

        const button = target.closest(
            [
                "[data-enquire]",
                "[data-enquire-cover]",
                "[data-enquire-frame]",
                "#enquire-about-cover",
                "#enquire-about-frame",
                "#enquire-about-wristbands",
                "#enquire-about-keychain",
                "#enquire-about-sunday-school-books"
            ].join(",")
        );

        if (!button || button.disabled) return;

        const grid = $(STORE.selectors.grid);

        const isMainProduct =
            grid && grid.contains(button);

        const isExplorerEnquiry = [
            "enquire-about-cover",
            "enquire-about-frame",
            "enquire-about-wristbands",
            "enquire-about-keychain",
            "enquire-about-sunday-school-books"
        ].includes(button.id);

        if (!isMainProduct && !isExplorerEnquiry) return;

        openWhatsApp(button);
    });

    document.documentElement.dataset.enquiriesReady =
        "true";
}


/* ============================================================
   35. MOBILE NAVIGATION
============================================================ */

function setupMobileNavigation() {
    const button = $(STORE.selectors.mobileButton);
    const nav = $(STORE.selectors.mobileNavigation);

    if (!button || !nav) return;

    const close = () => {
        nav.hidden = true;

        button.setAttribute(
            "aria-expanded",
            "false"
        );

        button.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        document.body.classList.remove(
            "jn-books-menu-open"
        );
    };

    button.addEventListener("click", () => {
        const opening = nav.hidden;

        nav.hidden = !opening;

        button.setAttribute(
            "aria-expanded",
            String(opening)
        );

        button.setAttribute(
            "aria-label",
            opening
                ? "Close navigation menu"
                : "Open navigation menu"
        );

        document.body.classList.toggle(
            "jn-books-menu-open",
            opening
        );
    });

    nav.addEventListener("click", event => {
        if (event.target.closest("a")) {
            close();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !nav.hidden) {
            close();
            button.focus();
        }
    });

    document.addEventListener("click", event => {
        if (
            !nav.hidden &&
            !nav.contains(event.target) &&
            !button.contains(event.target)
        ) {
            close();
        }
    });
}


/* ============================================================
   36. CONTACT LINKS
============================================================ */

function setupContactLinks() {
    $$('a[href^="https://wa.me/"]').forEach(link => {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    });
}


/* ============================================================
   37. IMAGE FALLBACKS
============================================================ */

function setupImageFallbacks() {
    $$("img").forEach(image => {
        if (image.dataset.fallbackReady === "true") {
            return;
        }

        image.dataset.fallbackReady = "true";

        if (
            image.complete &&
            image.naturalWidth === 0 &&
            image.currentSrc
        ) {
            image.classList.add("image-unavailable");

            image.setAttribute(
                "data-image-error",
                "true"
            );
        }

        image.addEventListener("error", () => {
            image.classList.add("image-unavailable");

            image.setAttribute(
                "data-image-error",
                "true"
            );
        }, { once: true });
    });
}


/* ============================================================
   38. FOOTER YEAR
============================================================ */

function setupFooterYear() {
    const year = $("#current-year");

    if (year) {
        year.textContent =
            String(new Date().getFullYear());
    }
}


/* ============================================================
   39. INITIALIZE BOOKSTORE
============================================================ */

function initializeBookstore() {
    if (state.initialized) return;

    const grid = $(STORE.selectors.grid);

    if (!grid) {
        console.warn(
            "Jehovah Jireh Bookstore: product grid was not found."
        );

        return;
    }

    getProductCards().forEach((card, index) => {
        if (card.dataset.originalIndex === undefined) {
            card.dataset.originalIndex =
                String(index);
        }
    });

    try {
        /* MAIN CATALOGUE */

        setupSearchAndFilters();
        setupProductGalleries();
        setupGalleryVisibility();

        /* PRODUCT EXPLORERS */

        setupCoverExplorer();
        setupFrameExplorer();

        /* PRODUCT CONFIGURATORS */

        setupWristbands();
        setupPromiseCards();
        setupSundaySchoolBooks();

        /* KEYCHAIN COLLECTION AND PRODUCT EXPLORER */

        setupKeychainFilters();
        setupKeychainProductExplorer();

        /* ENQUIRIES AND NAVIGATION */

        setupEnquiries();
        setupMobileNavigation();
        setupContactLinks();

        /* GENERAL PAGE FUNCTIONALITY */

        setupFooterYear();
        setupImageFallbacks();

        /* INITIAL CATALOGUE DISPLAY */

        updateCategoryButtons();
        applyFiltersAndSort();

        state.initialized = true;

        console.info(
            "Jehovah Jireh Bookstore Version 15.0 initialized successfully."
        );

    } catch (error) {
        console.error(
            "Jehovah Jireh Bookstore could not initialize completely:",
            error
        );

        state.initialized = false;

        showToast(
            "Some catalogue controls could not load. Please refresh the page."
        );
    }
}


/* ============================================================
   40. DOCUMENT READY
============================================================ */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeBookstore,
        { once: true }
    );
} else {
    initializeBookstore();
}


/* ============================================================
   41. PUBLIC BOOKSTORE INTERFACE
============================================================ */

window.JehovahJirehBookstore = Object.freeze({
    initialize: initializeBookstore,

    filter: category => {
        state.category = category || "all";

        updateCategoryButtons();
        applyFiltersAndSort();
    },

    search: query => {
        state.search = String(query || "");

        const input = $(STORE.selectors.search);

        if (input) {
            input.value = state.search;
        }

        applyFiltersAndSort();
    },

    filterKeychains: category => {
        state.keychainCategory =
            normalizeCategory(category);

        const section = $(STORE.selectors.keychains);

        if (!section) return;

        updateKeychainFilterButtons(section);
        applyKeychainFilter(section);
    },

    getProducts: () =>
        getProductCards().map(card => ({
            id: card.dataset.productId,
            name: card.dataset.name,
            category: card.dataset.category,
            price: Number(card.dataset.price || 0),
            comingSoon:
                card.dataset.comingSoon === "true"
        })),

    getKeychains: () =>
        KEYCHAINS.map(item => ({
            id: item.id,
            name: item.name,
            category: item.collection,
            collectionName: item.collectionName,
            design: item.design,
            price: item.price,
            image: item.image,
            description: item.description
        })),

    getCoverOptions: () =>
        BIBLE_COVERS.map(item => ({ ...item })),

    getFrameOptions: () =>
        PHOTO_FRAMES.map(item => ({ ...item })),

    getSundaySchoolBookOptions: () =>
        Object.values(SUNDAY_SCHOOL_BOOKS.editions)
            .map(item => ({ ...item })),

    getSelectedSundaySchoolCover: () =>
        SUNDAY_SCHOOL_BOOKS.editions[
            state.sundaySchoolCover
        ],

    getSelectedKeychain: () =>
        window.JehovahJirehKeychainExplorer
            ?.getSelected() || null,

    getSelectedBibleCover: () =>
        BIBLE_COVERS[state.coverIndex] || null,

    getSelectedPhotoFrame: () =>
        PHOTO_FRAMES[state.frameIndex] || null,

    getKeychainCollections: () => [
        {
            id: "alphabet",
            name: "Alphabet",
            count: KEYCHAINS.filter(
                item => item.collection === "alphabet"
            ).length
        },
        {
            id: "guitar",
            name: "Guitar",
            count: KEYCHAINS.filter(
                item => item.collection === "guitar"
            ).length
        },
        {
            id: "cross",
            name: "Cross",
            count: KEYCHAINS.filter(
                item => item.collection === "cross"
            ).length
        },
        {
            id: "oval",
            name: "Oval Messages",
            count: KEYCHAINS.filter(
                item => item.collection === "oval"
            ).length
        }
    ]
});


/* ============================================================
   END OF JEHOVAH JIREH BOOKSTORE JAVASCRIPT
   VERSION 15.0
============================================================ */

/* ============================================================
   MAGICAL SCROLL REVEAL — BOOKSTORE
============================================================ */

function setupBooksMagicalReveal() {

    const elements = document.querySelectorAll(`
        .jn-books-announcement,
        .jn-books-section-heading,
        .jn-books-category-wrapper,
        .jn-books-toolbar,
        .jn-books-product-card,
        .jn-books-story-panel,
        .jn-books-information-card,
        .jn-books-contact-heading,
        .jn-books-contact-card,
        .jn-books-contact-note,
        .jn-books-footer-inner
    `);

    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        elements.forEach(element => {
            element.classList.add("is-visible");
        });

        return;
    }

    if (!("IntersectionObserver" in window)) {
        elements.forEach(element => {
            element.classList.add("is-visible");
        });

        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");

                currentObserver.unobserve(entry.target);

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -45px 0px"
        }
    );

    elements.forEach((element, index) => {

        element.classList.add("jn-books-reveal");

        if (element.matches(".jn-books-product-card")) {
            element.style.transitionDelay =
                `${(index % 3) * 100}ms`;
        }

        observer.observe(element);

    });
}

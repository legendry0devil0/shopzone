import { useState } from "react"
import productsData from "./products.json"
import "./App.css"


const electronicsCategories = [
    "smartphones",
    "laptops",
    "tablets",
    "mobile-accessories",
    "mens-watches",
    "womens-watches"
]


const clothingCategories = [
    "mens-shirts",
    "mens-shoes",
    "tops",
    "womens-dresses",
    "womens-shoes",
    "womens-bags",
    "womens-jewellery",
    "sunglasses"
]


const groceryCategories = [
    "groceries"
]


const products = productsData
    .filter((product) =>
    {
        return (
            electronicsCategories.includes(product.category) ||
            clothingCategories.includes(product.category) ||
            groceryCategories.includes(product.category)
        )
    })
    .map((product) =>
    {
        let category = "Grocery"


        if (electronicsCategories.includes(product.category))
        {
            category = "Electronics"
        }

        else if (clothingCategories.includes(product.category))
        {
            category = "Clothing"
        }


        // Convert USD price to INR

        let inrPrice = Math.round(product.price * 83)


        // Make prices end in 49 or 99

        let lastTwoDigits = inrPrice % 100


        if (lastTwoDigits < 50)
        {
            inrPrice =
                inrPrice -
                lastTwoDigits +
                49
        }

        else
        {
            inrPrice =
                inrPrice -
                lastTwoDigits +
                99
        }


        return {
            ...product,
            name: product.title,
            category: category,
            quantity: product.stock,
            price: inrPrice,
            image: product.images?.[0] || product.thumbnail
        }
    })


function App()
{
    // =========================
    // STATES
    // =========================

    const [searchTerm, setSearchTerm] = useState("")

    const [selectedCategory, setSelectedCategory] =
        useState("All")

    const [selectedPrice, setSelectedPrice] =
        useState("All")

    const [selectedProduct, setSelectedProduct] =
        useState(null)

    const [cart, setCart] =
        useState([])

    const [showCart, setShowCart] =
        useState(false)


    // =========================
    // INVENTORY
    // =========================

    const [inventory, setInventory] = useState(() =>
    {
        const stockData = {}


        products.forEach((product, index) =>
        {
            // Make every 15th product out of stock

            if (index % 15 === 0)
            {
                stockData[product.id] = 0
            }

            else
            {
                stockData[product.id] =
                    product.stock
            }
        })


        return stockData
    })


    // =========================
    // FILTER PRODUCTS
    // =========================

    const filteredProducts = products.filter((product) =>
    {
        // Search

        const matchesSearch =
            product.name
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )


        // Category

        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory


        // Price

        let matchesPrice = true


        if (selectedPrice === "Under500")
        {
            matchesPrice =
                product.price < 500
        }

        else if (selectedPrice === "500-2000")
        {
            matchesPrice =
                product.price >= 500 &&
                product.price <= 2000
        }

        else if (selectedPrice === "2000-10000")
        {
            matchesPrice =
                product.price > 2000 &&
                product.price <= 10000
        }

        else if (selectedPrice === "Above10000")
        {
            matchesPrice =
                product.price > 10000
        }


        return (
            matchesSearch &&
            matchesCategory &&
            matchesPrice
        )
    })


    // =========================
    // ADD TO CART
    // =========================

    const addToCart = (product) =>
    {
        const currentStock =
            inventory[product.id]


        // Don't add if out of stock

        if (currentStock <= 0)
        {
            return
        }


        setCart((currentCart) =>
        {
            const existingProduct =
                currentCart.find(
                    (item) =>
                        item.id === product.id
                )


            if (existingProduct)
            {
                return currentCart.map(
                    (item) =>
                    {
                        if (
                            item.id === product.id
                        )
                        {
                            return {
                                ...item,
                                cartQuantity:
                                    item.cartQuantity + 1
                            }
                        }


                        return item
                    }
                )
            }


            return [
                ...currentCart,
                {
                    ...product,
                    cartQuantity: 1
                }
            ]
        })


        // Decrease inventory

        setInventory((currentInventory) =>
        {
            return {
                ...currentInventory,
                [product.id]:
                    currentInventory[product.id] - 1
            }
        })


        setSelectedProduct(null)
    }


    // =========================
    // INCREASE CART QUANTITY
    // =========================

    const increaseQuantity = (productId) =>
    {
        // Don't increase if no stock

        if (inventory[productId] <= 0)
        {
            return
        }


        setCart((currentCart) =>
        {
            return currentCart.map((item) =>
            {
                if (item.id === productId)
                {
                    return {
                        ...item,
                        cartQuantity:
                            item.cartQuantity + 1
                    }
                }


                return item
            })
        })


        // Decrease inventory

        setInventory((currentInventory) =>
        {
            return {
                ...currentInventory,
                [productId]:
                    currentInventory[productId] - 1
            }
        })
    }


    // =========================
    // DECREASE CART QUANTITY
    // =========================

    const decreaseQuantity = (productId) =>
    {
        setCart((currentCart) =>
        {
            return currentCart
                .map((item) =>
                {
                    if (item.id === productId)
                    {
                        return {
                            ...item,
                            cartQuantity:
                                item.cartQuantity - 1
                        }
                    }


                    return item
                })
                .filter(
                    (item) =>
                        item.cartQuantity > 0
                )
        })


        // Return one item to inventory

        setInventory((currentInventory) =>
        {
            return {
                ...currentInventory,
                [productId]:
                    currentInventory[productId] + 1
            }
        })
    }


    // =========================
    // REMOVE FROM CART
    // =========================

    const removeFromCart = (productId) =>
    {
        const cartItem =
            cart.find(
                (item) =>
                    item.id === productId
            )


        if (!cartItem)
        {
            return
        }


        // Return all items to stock

        setInventory((currentInventory) =>
        {
            return {
                ...currentInventory,
                [productId]:
                    currentInventory[productId] +
                    cartItem.cartQuantity
            }
        })


        // Remove item

        setCart((currentCart) =>
        {
            return currentCart.filter(
                (item) =>
                    item.id !== productId
            )
        })
    }


    // =========================
    // CART COUNT
    // =========================

    const cartCount = cart.reduce(
        (total, item) =>
            total + item.cartQuantity,
        0
    )


    // =========================
    // CART TOTAL
    // =========================

    const cartTotal = cart.reduce(
        (total, item) =>
            total +
            item.price *
            item.cartQuantity,
        0
    )


    // =========================
    // HERO BUTTON
    // =========================

    const exploreProducts = () =>
    {
        document
            .getElementById("products")
            .scrollIntoView({
                behavior: "smooth"
            })
    }


    // =========================
    // RETURN
    // =========================

    return (
        <div className="app">


            {/* =========================
                HEADER
            ========================= */}

            <header className="header">


                <div className="logo">
                    🛒 ShopZone
                </div>


                <div className="search-box">

                    🔍

                    <input
                        type="text"
                        placeholder="Search for products..."
                        value={searchTerm}
                        onChange={(event) =>
                        {
                            setSearchTerm(
                                event.target.value
                            )
                        }}
                    />

                </div>


                <div className="header-icons">

                    <span>
                        ♡
                    </span>


                    <span
                        className="cart-icon"
                        onClick={() =>
                        {
                            setShowCart(true)
                        }}
                    >

                        🛒


                        {cartCount > 0 && (

                            <span className="cart-count">
                                {cartCount}
                            </span>

                        )}

                    </span>

                </div>

            </header>



            {/* =========================
                HERO
            ========================= */}

            <section className="hero">


                <div className="hero-content">


                    <p className="hero-small">
                        WELCOME TO SHOPZONE
                    </p>


                    <h1>

                        Find Something

                        <br />

                        <span>
                            You'll Love.
                        </span>

                    </h1>


                    <p className="hero-description">

                        Discover products you'll love,
                        from everyday essentials to the
                        latest tech and fashion.

                    </p>


                    <button
                        className="hero-button"
                        onClick={exploreProducts}
                    >

                        Explore Products

                        <span>
                            →
                        </span>

                    </button>


                </div>



                <div className="hero-visual">


                    <div className="hero-circle circle-one"></div>

                    <div className="hero-circle circle-two"></div>


                    <div className="hero-card card-one">
                        🎧
                    </div>


                    <div className="hero-card card-two">
                        👟
                    </div>


                    <div className="hero-card card-three">
                        💻
                    </div>


                    <div className="hero-badge">

                        <strong>
                            {products.length}+
                        </strong>

                        <span>
                            Products
                        </span>

                    </div>


                </div>

            </section>



            {/* =========================
                PRODUCTS
            ========================= */}

            <main
                className="products-section"
                id="products"
            >


                <div className="section-heading">


                    <div>

                        <p className="section-small">
                            OUR COLLECTION
                        </p>


                        <h2>
                            Explore Products
                        </h2>

                    </div>


                    <span className="product-count">
                        {filteredProducts.length} products
                    </span>


                </div>



                {/* =========================
                    FILTERS
                ========================= */}

                <div className="filters">


                    <div className="category-buttons">


                        <button
                            className={
                                selectedCategory === "All"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                            {
                                setSelectedCategory(
                                    "All"
                                )
                            }}
                        >
                            All Products
                        </button>


                        <button
                            className={
                                selectedCategory ===
                                "Electronics"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                            {
                                setSelectedCategory(
                                    "Electronics"
                                )
                            }}
                        >
                            ⚡ Electronics
                        </button>


                        <button
                            className={
                                selectedCategory ===
                                "Clothing"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                            {
                                setSelectedCategory(
                                    "Clothing"
                                )
                            }}
                        >
                            👕 Clothing
                        </button>


                        <button
                            className={
                                selectedCategory ===
                                "Grocery"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                            {
                                setSelectedCategory(
                                    "Grocery"
                                )
                            }}
                        >
                            🛒 Grocery
                        </button>


                    </div>



                    <select
                        value={selectedPrice}
                        onChange={(event) =>
                        {
                            setSelectedPrice(
                                event.target.value
                            )
                        }}
                    >

                        <option value="All">
                            All Prices
                        </option>


                        <option value="Under500">
                            Under ₹500
                        </option>


                        <option value="500-2000">
                            ₹500 - ₹2,000
                        </option>


                        <option value="2000-10000">
                            ₹2,000 - ₹10,000
                        </option>


                        <option value="Above10000">
                            Above ₹10,000
                        </option>

                    </select>


                </div>



                {/* =========================
                    PRODUCT GRID
                ========================= */}

                <div className="product-grid">


                    {filteredProducts.length > 0 ? (

                        filteredProducts.map(
                            (product) => (

                                <div
                                    className="product-card"
                                    key={product.id}
                                    onClick={() =>
                                    {
                                        setSelectedProduct(
                                            product
                                        )
                                    }}
                                >


                                    <div className="product-image">

                                        <img
                                            src={product.image}
                                            alt={product.name}
                                        />

                                    </div>



                                    <div className="product-info">


                                        <p className="product-category">
                                            {product.category}
                                        </p>


                                        <h3>
                                            {product.name}
                                        </h3>


                                        <div className="product-bottom">


                                            <strong>
                                                ₹
                                                {product.price.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>



                                            {inventory[
                                                product.id
                                            ] === 0 ? (

                                                <span className="out-stock">
                                                    Out of Stock
                                                </span>

                                            ) : (

                                                <span className="in-stock">
                                                    {
                                                        inventory[
                                                            product.id
                                                        ]
                                                    } in stock
                                                </span>

                                            )}


                                        </div>


                                    </div>


                                </div>

                            )
                        )

                    ) : (


                        <div className="no-products">

                            <div>
                                🔍
                            </div>


                            <h3>
                                No products found
                            </h3>


                            <p>
                                Try changing your search
                                or filters.
                            </p>

                        </div>

                    )}


                </div>


            </main>



            {/* =========================
                PRODUCT DETAILS MODAL
            ========================= */}

            {selectedProduct && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                    {
                        setSelectedProduct(null)
                    }}
                >


                    <div
                        className="product-modal"
                        onClick={(event) =>
                        {
                            event.stopPropagation()
                        }}
                    >


                        <button
                            className="modal-close"
                            onClick={() =>
                            {
                                setSelectedProduct(null)
                            }}
                        >
                            ×
                        </button>



                        <div className="modal-image">

                            <img
                                src={
                                    selectedProduct.image
                                }
                                alt={
                                    selectedProduct.name
                                }
                            />

                        </div>



                        <div className="modal-details">


                            <p className="modal-category">
                                {
                                    selectedProduct.category
                                }
                            </p>


                            <h2>
                                {
                                    selectedProduct.name
                                }
                            </h2>


                            <div className="rating">

                                ⭐ {
                                    selectedProduct.rating ||
                                    "4.5"
                                }

                            </div>


                            <div className="modal-price">

                                ₹
                                {selectedProduct.price.toLocaleString(
                                    "en-IN"
                                )}

                            </div>


                            <p className="modal-description">

                                {
                                    selectedProduct.description ||
                                    "A quality product selected for the ShopZone collection."
                                }

                            </p>


                            <div className="product-specs">


                                <div>

                                    <span>
                                        Brand
                                    </span>


                                    <strong>
                                        {
                                            selectedProduct.brand ||
                                            "ShopZone"
                                        }
                                    </strong>

                                </div>



                                <div>

                                    <span>
                                        Stock
                                    </span>


                                    <strong>

                                        {
                                            inventory[
                                                selectedProduct.id
                                            ] > 0

                                            ? `${inventory[
                                                selectedProduct.id
                                            ]} available`

                                            : "Out of Stock"
                                        }

                                    </strong>

                                </div>


                            </div>



                            <button
                                className="add-cart-button"

                                disabled={
                                    inventory[
                                        selectedProduct.id
                                    ] === 0
                                }

                                onClick={() =>
                                {
                                    addToCart(
                                        selectedProduct
                                    )
                                }}
                            >

                                {
                                    inventory[
                                        selectedProduct.id
                                    ] === 0

                                    ? "Out of Stock"

                                    : "Add to Cart"
                                }

                            </button>


                        </div>


                    </div>


                </div>

            )}



            {/* =========================
                CART
            ========================= */}

            {showCart && (

                <div
                    className="cart-overlay"
                    onClick={() =>
                    {
                        setShowCart(false)
                    }}
                >


                    <div
                        className="cart-panel"
                        onClick={(event) =>
                        {
                            event.stopPropagation()
                        }}
                    >


                        <div className="cart-header">


                            <div>

                                <h2>
                                    Your Cart
                                </h2>


                                <p>
                                    {cartCount} items
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                {
                                    setShowCart(false)
                                }}
                            >
                                ×
                            </button>


                        </div>



                        {cart.length === 0 ? (


                            <div className="empty-cart">

                                <div>
                                    🛒
                                </div>


                                <h3>
                                    Your cart is empty
                                </h3>


                                <p>
                                    Add something you love!
                                </p>

                            </div>


                        ) : (


                            <>


                                <div className="cart-items">


                                    {cart.map(
                                        (item) => (

                                            <div
                                                className="cart-item"
                                                key={item.id}
                                            >


                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                />


                                                <div className="cart-item-info">


                                                    <h3>
                                                        {item.name}
                                                    </h3>


                                                    <strong>
                                                        ₹
                                                        {item.price.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </strong>



                                                    <div className="quantity-controls">


                                                        <button
                                                            onClick={() =>
                                                            {
                                                                decreaseQuantity(
                                                                    item.id
                                                                )
                                                            }}
                                                        >
                                                            −
                                                        </button>


                                                        <span>
                                                            {
                                                                item.cartQuantity
                                                            }
                                                        </span>


                                                        <button
                                                            onClick={() =>
                                                            {
                                                                increaseQuantity(
                                                                    item.id
                                                                )
                                                            }}
                                                            disabled={
                                                                inventory[
                                                                    item.id
                                                                ] <= 0
                                                            }
                                                        >
                                                            +
                                                        </button>


                                                    </div>


                                                    <small className="remaining-stock">

                                                        {
                                                            inventory[
                                                                item.id
                                                            ]
                                                        }{" "}
                                                        left in stock

                                                    </small>


                                                </div>



                                                <button
                                                    className="remove-cart"
                                                    onClick={() =>
                                                    {
                                                        removeFromCart(
                                                            item.id
                                                        )
                                                    }}
                                                >
                                                    🗑
                                                </button>


                                            </div>

                                        )
                                    )}


                                </div>



                                <div className="cart-footer">


                                    <div className="cart-total">


                                        <span>
                                            Total
                                        </span>


                                        <strong>
                                            ₹
                                            {cartTotal.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>


                                    </div>


                                    <button className="checkout-button">
                                        Checkout
                                    </button>


                                </div>


                            </>

                        )}


                    </div>


                </div>

            )}


        </div>
    )
}


export default App
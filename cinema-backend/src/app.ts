import express, { Request, Response } from "express";
import cors from "cors";
import { authenticate, AuthRequest } from "./middleware/auth";

import { supabase } from "./config/supabase";

const isValidUUID = (value: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};


export const app = express();

app.use(cors());
app.use(express.json());


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Cinema QR Ordering Backend Running"
    });
});
// ======================================================
// CREATE THEATRE
// ======================================================

app.post(
    "/theatres",
    authenticate,
    async (req: AuthRequest, res: Response) => {

        const role = req.user?.role;

        if (role !== "manager" && role !== "theatre_owner") {
            return res.status(403).json({
                success: false,
                message: "Only managers and theatre owners can create theatres"
            });
        }

        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "name and slug are required"
            });
        }

        const { data: theatre, error } = await supabase
            .from("theatres")
            .insert({
                name,
                slug
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "Theatre created successfully",
            theatre
        });
    }
);


// ======================================================
// GET ONE THEATRE
// ======================================================

app.get(
    "/theatres/:id",
    authenticate,
    async (req: AuthRequest, res: Response) => {

        const { id } = req.params;

        const { data: theatre, error } = await supabase
            .from("theatres")
            .select(`
                id,
                name,
                slug,
                created_at
            `)
            .eq("id", id)
            .single();

        if (error || !theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found"
            });
        }

        return res.json({
            success: true,
            theatre
        });
    }
);
// ======================================================
// GET ALL THEATRES
// ======================================================

app.get(
    "/theatres",
    authenticate,
    async (req: AuthRequest, res: Response) => {

        const { data: theatres, error } = await supabase
            .from("theatres")
            .select(`
                id,
                name,
                slug,
                created_at
            `)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            theatres
        });
    }
);

// ======================================================
// CREATE SCREEN
// ======================================================

app.post(
    "/theatres/:theatreId/screens",
    authenticate,
    async (req: AuthRequest, res: Response) => {

        const role = req.user?.role;

        if (role !== "manager" && role !== "theatre_owner") {
            return res.status(403).json({
                success: false,
                message: "Only managers and theatre owners can create screens"
            });
        }

        const { theatreId } = req.params;
        const { name, screen_number } = req.body;

        if (!name || screen_number === undefined) {
            return res.status(400).json({
                success: false,
                message: "name and screen_number are required"
            });
        }

        const { data: theatre, error: theatreError } = await supabase
            .from("theatres")
            .select("id")
            .eq("id", theatreId)
            .single();

        if (theatreError || !theatre) {
            return res.status(404).json({
                success: false,
                message: "Theatre not found"
            });
        }

        const { data: screen, error } = await supabase
            .from("screens")
            .insert({
                theatre_id: theatreId,
                name,
                screen_number
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "Screen created successfully",
            screen
        });
    }
);

// ======================================================
// CREATE SEAT
// ======================================================

app.post(
    "/screens/:screenId/seats",
    authenticate,
    async (req: AuthRequest, res: Response) => {

        const role = req.user?.role;

        if (role !== "manager" && role !== "theatre_owner") {
            return res.status(403).json({
                success: false,
                message: "Only managers and theatre owners can create seats"
            });
        }

        const { screenId } = req.params;
        const { row_label, seat_number, seat_label, qr_token } = req.body;

        if (!row_label || seat_number === undefined || !seat_label || !qr_token) {
            return res.status(400).json({
                success: false,
                message: "row_label, seat_number, seat_label and qr_token are required"
            });
        }

        const { data: screen, error: screenError } = await supabase
            .from("screens")
            .select("id")
            .eq("id", screenId)
            .single();

        if (screenError || !screen) {
            return res.status(404).json({
                success: false,
                message: "Screen not found"
            });
        }

        const { data: seat, error } = await supabase
            .from("seats")
            .insert({
                screen_id: screenId,
                row_label,
                seat_number,
                seat_label,
                qr_token,
                active: true
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "Seat created successfully",
            seat
        });
    }
);

// ======================================================
// CREATE MENU CATEGORY
// ======================================================

app.post(
    "/theatres/:theatreId/menu/categories",
    authenticate,
    async (req: AuthRequest, res: Response) => {

        const role = req.user?.role;

        if (role !== "manager" && role !== "theatre_owner") {
            return res.status(403).json({
                success: false,
                message: "Only managers and theatre owners can create menu categories"
            });
        }

        const { theatreId } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const { data: category, error } = await supabase
            .from("menu_categories")
            .insert({
                theatre_id: theatreId,
                name
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "Menu category created successfully",
            category
        });
    }
);

// ======================================================
// CREATE PRODUCT
// ======================================================

app.post(
    "/theatres/:theatreId/menu/products",
    authenticate,
    async (req: AuthRequest, res: Response) => {

        const role = req.user?.role;

        if (role !== "manager" && role !== "theatre_owner") {
            return res.status(403).json({
                success: false,
                message: "Only managers and theatre owners can create products"
            });
        }

        const { theatreId } = req.params;
        const { name, price, category_id } = req.body;

        if (!name || price === undefined || !category_id) {
            return res.status(400).json({
                success: false,
                message: "name, price and category_id are required"
            });
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative"
            });
        }

        const { data: category, error: categoryError } = await supabase
            .from("menu_categories")
            .select("id")
            .eq("id", category_id)
            .eq("theatre_id", theatreId)
            .single();

        if (categoryError || !category) {
            return res.status(404).json({
                success: false,
                message: "Menu category not found for this theatre"
            });
        }

        const { data: product, error } = await supabase
            .from("products")
            .insert({
                theatre_id: theatreId,
                category_id,
                name,
                price: Number(price),
                active: true
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    }
);


// ======================================================
// QR → SEAT → SCREEN → THEATRE
// ======================================================

app.get(
    "/public/seat/:token",
    async (req: Request, res: Response) => {

        const { token } = req.params;

        const { data: seat, error } = await supabase
            .from("seats")
            .select(`
                id,
                row_label,
                seat_number,
                seat_label,
                qr_token,
                active,
                screens (
                    id,
                    name,
                    screen_number,
                    theatres (
                        id,
                        name,
                        slug
                    )
                )
            `)
            .eq("qr_token", token)
            .eq("active", true)
            .single();

        if (error || !seat) {
            return res.status(404).json({
                success: false,
                message: "Invalid QR code"
            });
        }

        res.json({
            success: true,
            seat
        });
    }
);


// ======================================================
// GET THEATRE MENU
// ======================================================

app.get(
    "/public/menu/:theatreId",
    async (req: Request, res: Response) => {

        const { theatreId } = req.params;

        const { data, error } = await supabase
            .from("products")
            .select(`
                id,
                name,
                price,
                category_id,
                menu_categories (
                    name
                )
            `)
            .eq("theatre_id", theatreId)
            .eq("active", true);

        if (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            products: data
        });
    }
);


// ======================================================
// CREATE ORDER
// ======================================================

app.post(
    "/orders",
    async (req: Request, res: Response) => {

        try {

            const { seat_id, items } = req.body;

            // -------------------------------
            // Validate request
            // -------------------------------

            if (!seat_id || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "seat_id and at least one item are required"
                });
            }


            // -------------------------------
            // Check seat
            // -------------------------------

            const { data: seat, error: seatError } = await supabase
                .from("seats")
                .select("id, active")
                .eq("id", seat_id)
                .single();

            if (seatError || !seat || !seat.active) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or inactive seat"
                });
            }


            // -------------------------------
            // Get product IDs
            // -------------------------------

            const productIds = items.map(
                (item: any) => item.product_id
            );

            const { data: products, error: productError } = await supabase
                .from("products")
                .select("id, name, price, active")
                .in("id", productIds);

            if (productError) {
                return res.status(500).json({
                    success: false,
                    message: productError.message
                });
            }


            // -------------------------------
            // Validate products
            // -------------------------------

            if (!products || products.length !== productIds.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more products are invalid"
                });
            }


            // -------------------------------
            // Calculate total
            // -------------------------------

            let total = 0;

            const orderItems = [];

            for (const item of items) {

                const product = products.find(
                    (p) => p.id === item.product_id
                );

                const quantity = Number(item.quantity);

                if (!product || !product.active) {
                    return res.status(400).json({
                        success: false,
                        message: `Product ${item.product_id} is unavailable`
                    });
                }

                if (!Number.isInteger(quantity) || quantity <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Quantity must be a positive integer"
                    });
                }

                const unitPrice = Number(product.price);

                total += unitPrice * quantity;

                orderItems.push({
                    product_id: product.id,
                    quantity,
                    unit_price: unitPrice
                });
            }


            // -------------------------------
            // Create order
            // -------------------------------

            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
                    seat_id,
                    status: "paid",
                    total
                })
                .select()
                .single();

            if (orderError || !order) {
                return res.status(500).json({
                    success: false,
                    message: orderError?.message || "Failed to create order"
                });
            }


            // -------------------------------
            // Add order items
            // -------------------------------

            const itemsToInsert = orderItems.map((item) => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price
            }));

            const { data: createdItems, error: itemsError } = await supabase
                .from("order_items")
                .insert(itemsToInsert)
                .select();

            if (itemsError) {

                // Remove incomplete order
                await supabase
                    .from("orders")
                    .delete()
                    .eq("id", order.id);

                return res.status(500).json({
                    success: false,
                    message: itemsError.message
                });
            }


            // -------------------------------
            // Success
            // -------------------------------

            return res.status(201).json({
                success: true,
                message: "Order created successfully",
                order: {
                    ...order,
                    items: createdItems
                }
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
);

// ======================================================
// GET ALL ACTIVE ORDERS
// ======================================================

app.get(
    "/orders",
    async (req: Request, res: Response) => {

        const { data: orders, error } = await supabase
            .from("orders")
            .select(`
                id,
                seat_id,
                status,
                total,
                created_at,
                seats (
    seat_label,
    row_label,
    seat_number,
    screens (
        name,
        screen_number,
        theatres (
            name
        )
    )
),
                order_items (
                    id,
                    product_id,
                    quantity,
                    unit_price,
                    products (
                        name
                    )
                )
            `)
            .in("status", [
    "pending",
    "paid",
    "accepted",
    "preparing",
    "ready",
    "out_for_delivery"
])
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            orders
        });
    }
);

// ======================================================
// GET ORDER
// ======================================================

app.get(
    "/orders/:id",
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const { data: order, error } = await supabase
            .from("orders")
            .select(`
                id,
                seat_id,
                status,
                total,
                created_at,
                order_items (
                    id,
                    product_id,
                    quantity,
                    unit_price,
                    products (
                        name
                    )
                )
            `)
            .eq("id", id)
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            order
        });
    }
);
// ======================================================
// GET ORDERS FOR A SEAT
// ======================================================

app.get(
    "/orders/seat/:seatId",
    async (req: Request, res: Response) => {

        const { seatId } = req.params;

        const { data: orders, error } = await supabase
            .from("orders")
            .select(`
                id,
                seat_id,
                status,
                total,
                created_at,
                order_items (
                    id,
                    product_id,
                    quantity,
                    unit_price,
                    products (
                        name
                    )
                )
            `)
            .eq("seat_id", seatId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        res.json({
            success: true,
            orders
        });
    }
);

// ======================================================
// UPDATE ORDER STATUS
// ======================================================

app.patch(
    "/orders/:id/status",
    authenticate,
    async (req: AuthRequest, res: Response) => {

        const { id } = req.params;
        const { status } = req.body;
        const role = req.user?.role;

const allowedTransitions: Record<string, string[]> = {
    kitchen: ["accepted", "preparing", "ready"],
    delivery: ["out_for_delivery", "delivered"]
};

if (!role || !allowedTransitions[role]) {
    return res.status(403).json({
        success: false,
        message: "You are not authorized to update orders"
    });
}

if (!allowedTransitions[role].includes(status)) {
    return res.status(403).json({
        success: false,
        message: `Role '${role}' cannot set status to '${status}'`
    });
}
const { data: currentOrder, error: orderError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .single();

if (orderError || !currentOrder) {
    return res.status(404).json({
        success: false,
        message: "Order not found"
    });
}

const validTransitions: Record<string, string[]> = {
    pending: ["accepted", "cancelled"],
    paid: ["accepted", "cancelled"],
    accepted: ["preparing", "cancelled"],
    preparing: ["ready"],
    ready: ["out_for_delivery"],
    out_for_delivery: ["delivered"]
};

if (!validTransitions[currentOrder.status]?.includes(status)) {
    return res.status(400).json({
        success: false,
        message: `Cannot change order from '${currentOrder.status}' to '${status}'`
    });
}


        const validStatuses = [
    "pending",
    "paid",
    "accepted",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
    "cancelled"
];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const { data: order, error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            message: "Order status updated",
            order
        });
    }
);
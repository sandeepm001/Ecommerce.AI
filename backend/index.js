const port = 4000;
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const { mongoose } = require("mongoose");
const { type } = require("os");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "secret_token";
const SHOP_EMAIL = process.env.SHOP_EMAIL || "orders@local-shop.test";
const MongoURI = process.env.MongoURI || "mongodb://localhost:27017/local-shop";
const OTP_TTL_MINUTES = 10;
app.use(express.json());
app.use(cors());

//db connection
mongoose.connect(MongoURI)
    .then(() => {
        console.log("connected to db")
    })
    .catch((err) => {
        console.log("error connecting to db" + err)
    })

///multer setup
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})
//creating Upload end point for images

//routes

app.get("/", (req, res) => {
    res.json("express app is running")
})


//creating schema for addproduct
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    new_price: {
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    stock: {
        type: Number,
        default: 25
    },
    rating: {
        type: Number,
        default: 4.4
    },
    tags: {
        type: [String],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    },
});

const Order = mongoose.model("Order", {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            productId: Number,
            name: String,
            image: String,
            price: Number,
            quantity: Number,
            total: Number
        }
    ],
    shippingAddress: {
        addressId: String,
        fullName: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    amounts: {
        subtotal: Number,
        shipping: Number,
        tax: Number,
        total: Number
    },
    payment: {
        provider: {
            type: String,
            default: "mock"
        },
        method: String,
        status: {
            type: String,
            enum: ["initiated", "paid", "failed"],
            default: "initiated"
        },
        sessionId: String,
        reference: String,
        paidAt: Date
    },
    status: {
        type: String,
        enum: ["pending_payment", "placed", "packed", "shipped", "delivered", "cancelled"],
        default: "pending_payment"
    },
    timeline: [
        {
            label: String,
            description: String,
            date: Date,
            completed: Boolean
        }
    ],
    cancellation: {
        reason: String,
        date: Date
    },
    email: {
        sent: {
            type: Boolean,
            default: false
        },
        sentAt: Date,
        error: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const EmailLog = mongoose.model("EmailLog", {
    to: String,
    subject: String,
    body: String,
    status: String,
    error: String,
    orderId: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const EmailOtp = mongoose.model("EmailOtp", {
    name: String,
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: String,
    otp: String,
    expiresAt: Date,
    verified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const buildOrderTimeline = (createdAt = new Date(), status = "placed") => {
    const steps = [
        ["Order placed", "We received your order.", 0],
        ["Payment confirmed", "Payment has been verified.", 2],
        ["Packed", "Your items are being prepared.", 24],
        ["Shipped", "The package is on the way.", 48],
        ["Delivered", "Estimated delivery completed.", 96]
    ];
    const completedIndex = status === "cancelled"
        ? 1
        : Math.max(0, steps.findIndex(([label]) => label.toLowerCase().includes(status)));

    return steps.map(([label, description, hours], index) => ({
        label,
        description,
        date: new Date(createdAt.getTime() + hours * 60 * 60 * 1000),
        completed: index <= completedIndex
    }));
};

const sendOrderEmail = async (user, order) => {
    const subject = `Order confirmation #${order._id.toString().slice(-6).toUpperCase()}`;
    const body = [
        `Hi ${user.name || "Customer"},`,
        "",
        `Your order has been placed successfully.`,
        `Order total: Rs. ${order.amounts.total}`,
        `Items: ${order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}`,
        "",
        "Thank you for shopping with us."
    ].join("\n");

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        await EmailLog.create({
            to: user.email,
            subject,
            body,
            status: "mocked",
            orderId: order._id.toString()
        });
        console.log(`Mock email queued for ${user.email}: ${subject}`);
        return { sent: true, mocked: true };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: SHOP_EMAIL,
            to: user.email,
            subject,
            text: body
        });
        await EmailLog.create({ to: user.email, subject, body, status: "sent", orderId: order._id.toString() });
        return { sent: true };
    } catch (error) {
        await EmailLog.create({ to: user.email, subject, body, status: "failed", error: error.message, orderId: order._id.toString() });
        return { sent: false, error: error.message };
    }
};

const sendEmail = async ({ to, subject, text, purpose, orderId }) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        await EmailLog.create({
            to,
            subject,
            body: text,
            status: "mocked",
            orderId
        });
        console.log(`Mock ${purpose || "email"} queued for ${to}: ${subject}`);
        return { sent: true, mocked: true };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: SHOP_EMAIL,
            to,
            subject,
            text
        });
        await EmailLog.create({ to, subject, body: text, status: "sent", orderId });
        return { sent: true };
    } catch (error) {
        await EmailLog.create({ to, subject, body: text, status: "failed", error: error.message, orderId });
        return { sent: false, error: error.message };
    }
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const createDefaultCart = () => {
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    return cart;
};

const buildCartOrder = async (cartData) => {
    const ids = Object.keys(cartData || {})
        .filter((id) => Number(cartData[id]) > 0)
        .map(Number);

    if (!ids.length) {
        return null;
    }

    const products = await Product.find({ id: { $in: ids }, available: true });
    const items = products.map((product) => {
        const quantity = Number(cartData[product.id]) || 0;
        return {
            productId: product.id,
            name: product.name,
            image: product.image,
            price: product.new_price,
            quantity,
            total: product.new_price * quantity
        };
    }).filter((item) => item.quantity > 0);

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const shipping = subtotal >= 999 ? 0 : 79;
    const tax = Math.round(subtotal * 0.05);

    return {
        items,
        amounts: {
            subtotal,
            shipping,
            tax,
            total: subtotal + shipping + tax
        }
    };
};

const normalizeAddress = (address = {}) => ({
    fullName: address.fullName || "",
    phone: address.phone || "",
    address: address.address || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || ""
});

const findSameAddress = (addresses = [], address) => {
    const normalized = normalizeAddress(address);
    return addresses.find((saved) => (
        saved.fullName === normalized.fullName &&
        saved.phone === normalized.phone &&
        saved.address === normalized.address &&
        saved.city === normalized.city &&
        saved.state === normalized.state &&
        saved.pincode === normalized.pincode
    ));
};

const saveAddressIfNeeded = async (user, shippingAddress) => {
    if (!user.addresses) {
        user.addresses = [];
    }

    if (shippingAddress.addressId) {
        const existingById = user.addresses.id(shippingAddress.addressId);
        if (existingById) {
            return existingById;
        }
    }

    const existing = findSameAddress(user.addresses, shippingAddress);
    if (existing) {
        return existing;
    }

    const address = {
        ...normalizeAddress(shippingAddress),
        isDefault: user.addresses.length === 0
    };
    user.addresses.push(address);
    await user.save();
    return user.addresses[user.addresses.length - 1];
};

//addproduct endpoint

app.post('/addProduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_arr = products.slice(-1);
        let last_product = last_product_arr[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
        description: req.body.description,
        stock: req.body.stock,
        tags: req.body.tags
    })
    console.log(product)
    await product.save();
    console.log("saved")
    res.json({ success: true, name: req.body.name })

})

//deleting a product by id

app.post('/deleteProduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("item removed from db");
    res.json({
        success: true,
        name: req.body.name
    })
})

//get all products api

app.get('/allProducts', async (req, res) => {
    let products = await Product.find({});
    console.log("all products fetched");
    res.send(products);
})

//get new collection api
app.get('/newCollection',async(req,res)=>{
    let products = await Product.find({});
    let newCollection = products.slice(1).slice(-8)
    console.log("new collection fetched")
    res.send(newCollection)
})

//get popular in women

app.get('/popularinmen',async(req,res)=>{
    let products = await Product.find({category:"Men"});
    let men_products = products.slice(0,4);
    console.log('men popular products been retrived');
    res.send(men_products)
})
//middle ware to fetch user

const fetchUser = async(req,res,next) =>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please autheticate using valid token"})
    }else{
        try {
            const data = jwt.verify(token, JWT_SECRET);
            req.user = data.user;
            next()
        } catch (error) {
            res.status(401).send({erros:"Please authenticate using a valid token"})
            
        }
        
    }
}

//adding items to the cart

app.post('/addToCart',fetchUser ,async (req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    if (!userData.cartData) {
        userData.cartData = createDefaultCart();
    }
    if (!userData.cartData[req.body.itemId]) {
        userData.cartData[req.body.itemId] = 0;
    }
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.json({ success: true, message: "Added" });
    console.log("item added",req.body.itemId)
})

//remove item from the cart

app.post('/removeFromCart',fetchUser,async(req,res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData && userData.cartData[req.body.itemId] > 0){
        userData.cartData[req.body.itemId] -= 1;
    } 
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.json({ success: true, message: "Removed" });
    console.log("item removed",req.body.itemId)
    
})

//get all items of a cart

app.post('/getCart',fetchUser,async(req,res)=>{
    console.log("getcart")
    let userData = await Users.findOne({_id:req.user.id})
    res.json(userData.cartData);
})

app.post('/checkout/create', fetchUser, async (req, res) => {
    try {
        const userData = await Users.findOne({ _id: req.user.id });
        const cartOrder = await buildCartOrder(userData.cartData);

        if (!cartOrder || !cartOrder.items.length) {
            return res.status(400).json({ success: false, errors: "Your cart is empty" });
        }

        const savedAddress = await saveAddressIfNeeded(userData, req.body.shippingAddress || {});
        const sessionId = `mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const order = new Order({
            userId: req.user.id,
            items: cartOrder.items,
            amounts: cartOrder.amounts,
            shippingAddress: {
                addressId: savedAddress?._id?.toString(),
                ...normalizeAddress(savedAddress || req.body.shippingAddress)
            },
            payment: {
                provider: req.body.provider || "mock",
                method: req.body.paymentMethod || "card",
                status: "initiated",
                sessionId
            },
            status: "pending_payment",
            timeline: buildOrderTimeline(new Date(), "pending_payment")
        });

        await order.save();

        res.json({
            success: true,
            orderId: order._id,
            paymentSession: {
                provider: order.payment.provider,
                sessionId,
                amount: order.amounts.total,
                currency: "INR"
            },
            order
        });
    } catch (error) {
        res.status(500).json({ success: false, errors: "Could not create checkout session" });
    }
});

app.post('/checkout/confirm', fetchUser, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.body.orderId, userId: req.user.id });

        if (!order) {
            return res.status(404).json({ success: false, errors: "Order not found" });
        }

        const paid = req.body.status !== "failed";
        order.payment.status = paid ? "paid" : "failed";
        order.payment.reference = req.body.paymentReference || `PAY-${Date.now()}`;
        order.payment.paidAt = paid ? new Date() : undefined;
        order.status = paid ? "placed" : "pending_payment";
        order.timeline = buildOrderTimeline(order.date, order.status);
        await order.save();

        if (paid) {
            await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: createDefaultCart() });
            const user = await Users.findOne({ _id: req.user.id });
            const emailResult = await sendOrderEmail(user, order);
            order.email = {
                sent: Boolean(emailResult.sent),
                sentAt: emailResult.sent ? new Date() : undefined,
                error: emailResult.error
            };
            await order.save();
        }

        res.json({ success: paid, order });
    } catch (error) {
        res.status(500).json({ success: false, errors: "Could not confirm payment" });
    }
});

app.get('/orders/me', fetchUser, async (req, res) => {
    const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ success: true, orders });
});

app.post('/orders/cancel', fetchUser, async (req, res) => {
    const order = await Order.findOne({ _id: req.body.orderId, userId: req.user.id });

    if (!order) {
        return res.status(404).json({ success: false, errors: "Order not found" });
    }

    if (["delivered", "cancelled"].includes(order.status)) {
        return res.status(400).json({ success: false, errors: "This order cannot be cancelled" });
    }

    order.status = "cancelled";
    order.cancellation = {
        reason: req.body.reason || "No reason provided",
        date: new Date()
    };
    order.timeline = [
        ...buildOrderTimeline(order.date, "placed"),
        {
            label: "Cancelled",
            description: order.cancellation.reason,
            date: order.cancellation.date,
            completed: true
        }
    ];
    await order.save();
    res.json({ success: true, order });
});

//get search item

app.get('/search',async(req,res)=>{
    const query = req.query.q;
    try {
        const result = await Product.find({
            name:{$regex : query, $options:'i'}
        })
        res.json(result)
        
    } catch (error) {
        res.status(500).json({errors:"something went wrong"})
        
    }
})
//Schema for user creation

const Users = mongoose.model("User", {
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    addresses: [
        {
            fullName: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            pincode: String,
            isDefault: {
                type: Boolean,
                default: false
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now,
    }
})


//Creating Registeing user

app.post('/signup', async (req, res) => {
    const email = String(req.body.email || "").toLowerCase().trim();
    let check = await Users.findOne({ email });
    if (check) {
        return res.status(400).json({ success: false, errors: "existing user found with same email address" })
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await EmailOtp.findOneAndUpdate(
        { email },
        {
            name: req.body.username,
            email,
            password: req.body.password,
            otp,
            expiresAt,
            verified: false,
            attempts: 0
        },
        { upsert: true, new: true }
    );

    const emailResult = await sendEmail({
        to: email,
        subject: "Your signup verification OTP",
        text: [
            `Hi ${req.body.username || "there"},`,
            "",
            `Your verification OTP is ${otp}.`,
            `It expires in ${OTP_TTL_MINUTES} minutes.`,
            "",
            "If you did not request this, you can ignore this email."
        ].join("\n"),
        purpose: "signup OTP"
    });

    if (!emailResult.sent) {
        return res.status(500).json({ success: false, errors: "Could not send verification email" });
    }

    res.json({ success: true, requiresOtp: true, message: "OTP sent to your email" });
})

app.post('/verifySignup', async (req, res) => {
    const email = String(req.body.email || "").toLowerCase().trim();
    const otp = String(req.body.otp || "").trim();
    const pendingSignup = await EmailOtp.findOne({ email });

    if (!pendingSignup) {
        return res.status(400).json({ success: false, errors: "Please request a new OTP" });
    }

    if (pendingSignup.expiresAt < new Date()) {
        await EmailOtp.deleteOne({ email });
        return res.status(400).json({ success: false, errors: "OTP expired. Please request a new one" });
    }

    if (pendingSignup.attempts >= 5) {
        return res.status(429).json({ success: false, errors: "Too many attempts. Please request a new OTP" });
    }

    if (pendingSignup.otp !== otp) {
        pendingSignup.attempts += 1;
        await pendingSignup.save();
        return res.status(400).json({ success: false, errors: "Invalid OTP" });
    }

    let check = await Users.findOne({ email });
    if (check) {
        await EmailOtp.deleteOne({ email });
        return res.status(400).json({ success: false, errors: "existing user found with same email address" });
    }

    let cart = createDefaultCart();
    const user = new Users({
        name: pendingSignup.name,
        email,
        password: pendingSignup.password,
        cartData: cart,
        emailVerified: true,
    })

    await user.save();
    await EmailOtp.deleteOne({ email });

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, JWT_SECRET);
    res.json({ success: true, token })
})

//login ---------------------------------
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passwordCompare = req.body.password === user.password;
        if (passwordCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, JWT_SECRET);
            res.json({ success: true, token })
        } else {
            res.json({ success: false, errors: "please check credintials again" })
        }
    } else {
        res.json({ success: false, errors: "Email is not registered" })
    }
})

app.get('/account', fetchUser, async (req, res) => {
    const user = await Users.findOne({ _id: req.user.id }).select("-password");
    res.json({ success: true, user });
});

app.post('/address/add', fetchUser, async (req, res) => {
    const user = await Users.findOne({ _id: req.user.id });
    if (!user.addresses) {
        user.addresses = [];
    }
    const address = {
        fullName: req.body.fullName,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        isDefault: !user.addresses || user.addresses.length === 0
    };

    user.addresses.push(address);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
});

app.post('/address/default', fetchUser, async (req, res) => {
    const user = await Users.findOne({ _id: req.user.id });

    if (!user || !user.addresses?.id(req.body.addressId)) {
        return res.status(404).json({ success: false, errors: "Address not found" });
    }

    user.addresses.forEach((address) => {
        address.isDefault = address._id.toString() === req.body.addressId;
    });
    await user.save();

    res.json({ success: true, addresses: user.addresses });
});

app.listen(port, (err) => {
    if (err) {
        console.log("error running" + err)
    } else {
        console.log("Server listening on port " + port)
    }
})

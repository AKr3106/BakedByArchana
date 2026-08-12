import nodemailer from "nodemailer";

/**
 * Sends an email notification to the Admin with order details.
 * @param {Object} order - The saved order document from MongoDB.
 */
export const sendAdminOrderNotification = async (order) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
            console.warn("Email configuration is missing in environment variables. Email notification skipped.");
            return;
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Generate items rows for the email HTML table
        const itemsListHTML = order.items.map(item => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${item.price * item.quantity}</td>
            </tr>
        `).join("");

        const orderDate = order.createdAt 
            ? new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) 
            : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #d1415a; border-bottom: 2px solid #d1415a; padding-bottom: 10px; text-align: center;">🍰 BakedByArchana - New Order Received!</h2>
                
                <table style="width: 100%; margin-bottom: 20px;">
                    <tr>
                        <td><strong>Order ID:</strong> #${order._id}</td>
                        <td style="text-align: right;"><strong>Date:</strong> ${orderDate}</td>
                    </tr>
                </table>

                <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">Customer & Delivery Details</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${order.shippingAddress.fullName}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
                <p style="margin: 5px 0;"><strong>Delivery Address:</strong><br>
                ${order.shippingAddress.street},<br>
                ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}</p>

                <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f8f8f8;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qty</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Price</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsListHTML}
                    </tbody>
                </table>

                <div style="text-align: right; font-size: 16px; margin-bottom: 20px;">
                    <strong>Total Amount:</strong> <span style="color: #d1415a; font-size: 18px; font-weight: bold;">₹${order.totalAmount}</span>
                </div>

                <table style="width: 100%; border-top: 1px solid #eee; padding-top: 10px;">
                    <tr>
                        <td><strong>Payment Method:</strong> ${order.paymentMethod}</td>
                        <td style="text-align: right;"><strong>Payment Status:</strong> ${order.paymentStatus}</td>
                    </tr>
                </table>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `🍰 New Order Alert! #${order._id} - BakedByArchana`,
            html: emailHTML,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Admin order notification email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending admin order notification email:", error);
        throw error;
    }
};

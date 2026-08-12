/**
 * Sends a WhatsApp order confirmation message with detailed breakdown using UltraMsg API.
 * @param {string} customerPhone - The customer's phone number.
 * @param {Object} order - The saved order document from MongoDB.
 */
export const sendWhatsAppOrderConfirmation = async (customerPhone, order) => {
    try {
        const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
        const token = process.env.ULTRAMSG_TOKEN;

        if (!instanceId || !token) {
            console.warn("UltraMsg configuration is missing in environment variables. WhatsApp notification skipped.");
            return;
        }

        // Sanitize customer phone: keep only digits, take the last 10 digits, and prepend country code '91'
        const digitsOnly = customerPhone.replace(/\D/g, "");
        const tenDigits = digitsOnly.slice(-10);
        const formattedPhone = `91${tenDigits}`;

        // Create the itemized list of items ordered
        const itemsList = order.items
            .map(item => `• ${item.name} x${item.quantity} — ₹${item.price}`)
            .join("\n");

        // Format message body
        const messageBody = `🍰 *BakedByArchana - Order Confirmed!*

Hi ${order.shippingAddress.fullName}, thank you for ordering with us!

*Order ID:* #${order._id.toString().slice(-6)}

*Items Ordered:*
${itemsList}

*Grand Total:* ₹${order.totalAmount} (${order.paymentMethod})

*Delivery Address:*
${order.shippingAddress.street}, ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}

We will start baking your cake shortly! For queries, contact us at +91 8777396996.`;

        const endpoint = `https://api.ultramsg.com/${instanceId}/messages/chat`;

        // Send POST request to UltraMsg using global fetch (available in Node.js 18+)
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                token,
                to: formattedPhone,
                body: messageBody
            })
        });

        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            data = { error: text || `Failed to parse response. Status: ${response.status}` };
        }

        if (!response.ok || data.error) {
            throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error) || `HTTP error! status: ${response.status}`);
        }

        console.log("WhatsApp confirmation sent successfully via UltraMsg. Message ID:", data.id || data.sent);
        return data;
    } catch (error) {
        console.error("Error sending WhatsApp confirmation via UltraMsg:", error);
        throw error;
    }
};

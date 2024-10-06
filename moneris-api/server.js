const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Hàm tạo số đơn hàng ngẫu nhiên
function generateRandomOrderNo() {
    return 'ORD' + Math.floor(Math.random() * 1000000000).toString();
}
const TICKET_CONST = "1726328034d9mZ3X9Vm8vpTgT4bmEHkEPx4OrMNT"
// Hàm gọi API để nhận ticket number
async function fetchTicketNumber(txn_total, cust_id, dynamic_descriptor, language) {
    const store_id = 'store3';
    const api_token = 'yesguy';
    const checkout_id = 'chkt5DDT8tore3';
    const environment = "qa"
    const order_no = generateRandomOrderNo(); // Sinh số đơn hàng ngẫu nhiên
    var data = {
        store_id: store_id,
        api_token: api_token,
        checkout_id: checkout_id,
        order_no: order_no,
        action: 'preload',
        "environment": environment,
        txn_total: txn_total, // Sử dụng txn_total từ yêu cầu
        cust_id: cust_id, // Sử dụng cust_id từ yêu cầu
        dynamic_descriptor: dynamic_descriptor, // Sử dụng dynamic_descriptor từ yêu cầu
        language: language // Sử dụng language từ yêu cầu
    }
    try {
        const response = await axios.post(
            'https://gatewayt.moneris.com/chktv2/request/request.php',
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        let ticketNo = ""
        if (response.data && response.data.ticket) {
            ticketNo = response.data.ticket;
        } else {
            // throw new Error('Ticket number not found in response.');
            //need https to success
            ticketNo = TICKET_CONST
        }
        return {
            order_no: order_no,
            ticket: ticketNo,
            success: response.data?.success ?? false
        }
    } catch (error) {
        console.error('Error fetching ticket number:', error.message);
        throw error;
    }
}

app.post('/api/get-ticket', async (req, res) => {
    console.log(req.body)
    const { txn_total, cust_id, dynamic_descriptor, language } = req.body;

    if (!txn_total || !environment || !cust_id || !dynamic_descriptor || !language) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const ticket = await fetchTicketNumber(txn_total, cust_id, dynamic_descriptor, language);
        res.json({
            success: ticket.success,
            order_no: ticket.order_no,
            ticket: ticket.ticket
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

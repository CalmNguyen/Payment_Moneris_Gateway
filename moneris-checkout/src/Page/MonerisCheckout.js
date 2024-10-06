import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MonerisCheckout = () => {
    const [ticketNumber, setTicketNumber] = useState('');
    const [orderNo, setOrtherNo] = useState('');
    const [inputTicket, setInputTicket] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Add Moneris Checkout script to the page
        const script = document.createElement('script');
        script.src = 'https://gatewayt.moneris.com/chktv2/js/chkt_v2.00.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (ticketNumber) {
            const myCheckout = new window.monerisCheckout();
            myCheckout.setMode('qa'); // Change to 'production' for live environment
            myCheckout.setCheckoutDiv('monerisCheckout');

            // Set up callbacks
            myCheckout.setCallback('cancel_transaction', function () {
                console.log('Transaction cancelled');
                alert('Transaction cancelled');
            });

            myCheckout.setCallback('payment_receipt', function (receipt) {
                console.log('Payment receipt:', receipt);
                alert('Payment receipt received');
            });

            myCheckout.setCallback('payment_complete', function () {
                console.log('Payment complete');
                alert('Payment complete!' + ' orderNo:' + orderNo + ' - Ticket:' + ticketNumber);
            });

            document.getElementById('checkoutButton').addEventListener('click', function () {
                if (typeof myCheckout !== 'undefined') {
                    myCheckout.startCheckout(ticketNumber);
                } else {
                    console.error('Moneris Checkout library not loaded.');
                }
            });
        }
    }, [ticketNumber]);

    const handleTicketInputChange = (event) => {
        setInputTicket(event.target.value);
    };

    const handleFetchTicket = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/get-ticket', {
                txn_total: '100.00',
                environment: 'qa',
                cust_id: 'custom32423er123',
                dynamic_descriptor: 'example_desc',
                language: 'en'
            });
            setTicketNumber(response.data.ticket);
            setOrtherNo(response.data.order_no)
        } catch (error) {
            console.error('Error fetching ticket:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Moneris Checkout</h1>
            <p>Enter the ticket number and click the button below to start the secure payment process with Moneris.</p>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={handleFetchTicket} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Fetch Ticket'}
                </button>
            </div>

            <button id="checkoutButton" disabled={!ticketNumber}>
                Pay Now
            </button>

            <div id="outerDiv" style={{ width: '400px', height: '300px' }}>
                <div id="monerisCheckout"></div>
            </div>

        </div>
    );
};

export default MonerisCheckout;

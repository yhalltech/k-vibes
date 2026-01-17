// Enhanced Payment Form - ALWAYS VISIBLE Copy Buttons
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingType = urlParams.get('type');
    const totalAmount = urlParams.get('total');
    
    $('#bookingEventName').val('Kalenjin Vibes');
    
    window.cartData = null;
    window.pendingOrderData = null;
    
    // COPY FUNCTIONALITY - ALWAYS VISIBLE
    window.copyToClipboard = function(text, buttonId) {
        navigator.clipboard.writeText(text).then(function() {
            const btn = document.getElementById(buttonId);
            const originalHTML = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Copied!';
            btn.style.background = 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
            btn.style.color = 'white';
            
            showCopyToast('✓ Copied to clipboard!');
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }).catch(function(err) {
            console.error('Copy failed:', err);
            showCopyToast('Failed to copy', 'error');
        });
    };
    
    function showCopyToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#25D366' : '#ff4444'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            z-index: 10001;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        if (!document.querySelector('[data-toast-style]')) {
            style.setAttribute('data-toast-style', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    function updatePaymentAmounts() {
        const totalAmount = parseFloat($('#bookingAmount').val() || 
            $('#summaryAmount').text().replace(/[^0-9.-]+/g, "") || 
            urlParams.get('total') || 
            $('#total-amount-display').text().replace(/[^0-9.-]+/g, "") || 
            0);
        
        if (totalAmount > 0) {
            const formattedAmount = 'Ksh ' + totalAmount.toLocaleString();
            $('#mpesaAmount').text(formattedAmount);
            $('#paybillAmount').text(formattedAmount);
        }
    }
    
    function handlePaymentTypes() {
        if (bookingType === 'cart') {
            handleCartCheckout();
        } else if (bookingType === 'talent_booking') {
            handleTalentBooking();
        } else if (localStorage.getItem('pendingTicketOrder')) {
            handleEventTickets();
        } else if (totalAmount) {
            handleGeneralCheckout();
        }
        setTimeout(updatePaymentAmounts, 100);
    }
    
    function handleCartCheckout() {
        const cart = JSON.parse(localStorage.getItem('kalenjinvibes_cart')) || [];
        window.cartData = cart;
        
        if (cart.length > 0) {
            $('#orderSummary').show();
            const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const displayTotal = parseFloat(totalAmount) || cartTotal;
            
            let cartItemsHtml = '';
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                cartItemsHtml += `
                    <div class="order-item d-flex justify-content-between mb-2">
                        <span>${item.quantity}x ${item.name}</span>
                        <span style="font-weight: 600;">Ksh ${itemTotal.toLocaleString()}</span>
                    </div>
                `;
            });
            
            $('#order-items').html(cartItemsHtml);
            $('#total-amount-display').text('Ksh ' + displayTotal.toLocaleString());
            
            $('#bookingSummary').show().html(`
                <h4 class="mb-3">🛒 Shopping Cart Order</h4>
                <div class="alert alert-info">
                    <p><strong>Order Type:</strong> Shopping Cart Purchase</p>
                    <p><strong>Total Items:</strong> ${cart.length}</p>
                    <p><strong>Total Amount:</strong> Ksh ${displayTotal.toLocaleString()}</p>
                </div>
            `);
            
            $('#bookingType').val('cart_checkout');
            $('#bookingAmount').val(displayTotal);
        }
    }
    
    function handleTalentBooking() {
        $('#bookingSummary').show();
        $('#summaryTalentName').text(urlParams.get('talent_name') || 'N/A');
        $('#summaryEventName').text('Kalenjin Vibes');
        $('#summaryEventDate').text(urlParams.get('event_date') || 'N/A');
        $('#summaryLocation').text(urlParams.get('location') || 'N/A');
        const talentAmount = parseFloat(urlParams.get('amount') || 0);
        $('#summaryAmount').text(talentAmount.toLocaleString());
        
        $('#bookingType').val('talent_booking');
        $('#bookingAmount').val(talentAmount || '');
    }
    
    function handleEventTickets() {
        try {
            const orderData = JSON.parse(localStorage.getItem('pendingTicketOrder'));
            window.pendingOrderData = orderData;
            
            if (orderData.ticketData && orderData.ticketData.length > 0) {
                $('#orderSummary').show();
                
                const orderItemsHtml = orderData.ticketData.map(ticket => 
                    `<div class="order-item d-flex justify-content-between mb-2">
                        <span>${ticket.quantity}x ${ticket.category}</span>
                        <span style="font-weight: 600;">Ksh ${(ticket.quantity * ticket.price).toLocaleString()}</span>
                    </div>`
                ).join('');
                
                $('#order-items').html(orderItemsHtml);
                const totalAmount = parseFloat(orderData.subtotal || 0);
                $('#total-amount-display').text('Ksh ' + totalAmount.toLocaleString());
                
                $('#bookingType').val('event_tickets');
                $('#bookingAmount').val(totalAmount);
            }
        } catch (e) {
            console.error('Error:', e);
        }
    }
    
    function handleGeneralCheckout() {
        const amount = parseFloat(totalAmount || 0);
        if (amount > 0) {
            $('#bookingAmount').val(amount);
            $('#bookingSummary').show().html(`
                <h4 class="mb-3">💳 Payment Summary</h4>
                <div class="alert alert-info">
                    <p><strong>Amount:</strong> Ksh ${amount.toLocaleString()}</p>
                </div>
            `);
        }
    }
    
    handlePaymentTypes();
    
    $('#payment_method').on('change', function() {
        const method = $(this).val();
        $('#mpesa-details, #paybill-details, #transaction-reference-group').hide();
        $('#transaction_reference').removeAttr('required');
        
        if (method === 'mpesa') {
            $('#mpesa-details, #transaction-reference-group').show();
            $('#transaction_reference').attr('required', 'required');
            
            // Add ALWAYS VISIBLE copy button for Till Number
            setTimeout(() => {
                const tillNumber = '3049015';
                const tillHtml = `
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span>4. Enter Till Number: <strong style="color: #28a745; font-size: 20px;">${tillNumber}</strong></span>
                        <button type="button" class="copy-btn-inline" id="copyTillBtn" onclick="copyToClipboard('${tillNumber}', 'copyTillBtn')">
                            <i class="far fa-copy"></i> Copy
                        </button>
                    </div>
                `;
                $('#mpesa-details ul li:nth-child(4)').html(tillHtml);
            }, 100);
            
        } else if (method === 'paybill') {
            $('#paybill-details, #transaction-reference-group').show();
            $('#transaction_reference').attr('required', 'required');
            
            // Add ALWAYS VISIBLE copy buttons for Paybill
            setTimeout(() => {
                const businessNumber = '542542';
                const accountNumber = '79233';
                
                const businessHtml = `
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span>4. Business Number: <strong style="color: #28a745; font-size: 20px;">${businessNumber}</strong></span>
                        <button type="button" class="copy-btn-inline" id="copyBusinessBtn" onclick="copyToClipboard('${businessNumber}', 'copyBusinessBtn')">
                            <i class="far fa-copy"></i> Copy
                        </button>
                    </div>
                `;
                
                const accountHtml = `
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span>5. Account Number: <strong style="color: #28a745; font-size: 20px;">${accountNumber}</strong></span>
                        <button type="button" class="copy-btn-inline" id="copyAccountBtn" onclick="copyToClipboard('${accountNumber}', 'copyAccountBtn')">
                            <i class="far fa-copy"></i> Copy
                        </button>
                    </div>
                `;
                
                $('#paybill-details ul li:nth-child(4)').html(businessHtml);
                $('#paybill-details ul li:nth-child(5)').html(accountHtml);
            }, 100);
        }
        
        updatePaymentAmounts();
    });
    
    $('#cancel-btn').on('click', function(e) {
        e.preventDefault();
        if (confirm('Cancel payment?')) {
            localStorage.removeItem('pendingTicketOrder');
            window.location.href = 'index.html';
        }
    });
    
    $('#payment-form').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            full_name: $('#full_name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone_number').val().trim(),
            payment_method: $('#payment_method').val(),
            transaction_code: $('#transaction_reference').val().trim(),
            amount: $('#bookingAmount').val() || '0'
        };
        
        if (!formData.full_name || !formData.email || !formData.phone || !formData.payment_method || !formData.transaction_code) {
            alert('Please fill all required fields');
            return false;
        }
        
        let message = `💳 PAYMENT CONFIRMATION\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `📧 ${formData.full_name}\n`;
        message += `📞 ${formData.phone}\n`;
        message += `💰 Ksh ${parseFloat(formData.amount).toLocaleString()}\n`;
        message += `🔢 ${formData.transaction_code}\n\n`;
        message += `✅ Kalenjin Vibes Payment`;
        
        const whatsappUrl = `https://wa.me/254797265275?text=${encodeURIComponent(message)}`;
        
        const submitBtn = $('#complete-purchase-btn');
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Processing...').prop('disabled', true);
        
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            showCopyToast('✓ Redirecting to WhatsApp...');
            setTimeout(() => window.location.href = 'index.html', 2000);
        }, 1000);
        
        return false;
    });
});
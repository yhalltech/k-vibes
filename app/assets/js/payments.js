// Payment Form Handler - Direct WhatsApp Redirect
$(document).ready(function() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingType = urlParams.get('type');
    const totalAmount = urlParams.get('total');
    
    // Always set event name to "Kalenjin Vibes"
    $('#bookingEventName').val('Kalenjin Vibes');
    
    // Initialize global variables
    window.cartData = null;
    window.pendingOrderData = null;
    
    // Function to update payment amounts dynamically
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
    
    // Handle different payment types
    function handlePaymentTypes() {
        // Check for cart checkout
        if (bookingType === 'cart') {
            handleCartCheckout();
        }
        // Check for talent booking
        else if (bookingType === 'talent_booking') {
            handleTalentBooking();
        }
        // Check for event tickets from localStorage
        else if (localStorage.getItem('pendingTicketOrder')) {
            handleEventTickets();
        }
        // General checkout with total amount
        else if (totalAmount) {
            handleGeneralCheckout();
        }
        
        // Update payment amounts
        setTimeout(updatePaymentAmounts, 100);
    }
    
    // Handle cart checkout
    function handleCartCheckout() {
        const cart = JSON.parse(localStorage.getItem('kalenjinvibes_cart')) || [];
        window.cartData = cart;
        
        if (cart.length > 0) {
            $('#orderSummary').show();
            
            // Calculate total
            const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const displayTotal = parseFloat(totalAmount) || cartTotal;
            
            // Build cart items summary
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
            
            // Show summary
            $('#bookingSummary').show().html(`
                <h4 class="mb-3">🛒 Shopping Cart Order</h4>
                <div class="alert alert-info">
                    <p><strong>Order Type:</strong> Shopping Cart Purchase</p>
                    <p><strong>Total Items:</strong> ${cart.length}</p>
                    <p><strong>Total Amount:</strong> Ksh ${displayTotal.toLocaleString()}</p>
                </div>
            `);
            
            // Set form values
            $('#bookingType').val('cart_checkout');
            $('#bookingAmount').val(displayTotal);
            $('#bookingEventName').val('Kalenjin Vibes Shopping');
        }
    }
    
    // Handle talent booking
    function handleTalentBooking() {
        $('#bookingSummary').show();
        $('#summaryTalentName').text(urlParams.get('talent_name') || 'N/A');
        $('#summaryEventName').text('Kalenjin Vibes'); // Always show this
        $('#summaryEventDate').text(urlParams.get('event_date') || 'N/A');
        $('#summaryLocation').text(urlParams.get('location') || 'N/A');
        const talentAmount = parseFloat(urlParams.get('amount') || 0);
        $('#summaryAmount').text(talentAmount.toLocaleString());
        
        // Populate hidden form fields
        $('#bookingType').val('talent_booking');
        $('#bookingTalentId').val(urlParams.get('talent_id') || '');
        $('#bookingTalentName').val(urlParams.get('talent_name') || '');
        $('#bookingEventName').val('Kalenjin Vibes'); // Always set this
        $('#bookingLocation').val(urlParams.get('location') || '');
        $('#bookingEventDate').val(urlParams.get('event_date') || '');
        $('#bookingAmount').val(talentAmount || '');
        $('#bookingNotes').val(urlParams.get('notes') || '');
        
        // Pre-fill contact info if available
        if (urlParams.get('first_name') && urlParams.get('last_name')) {
            $('#full_name').val(urlParams.get('first_name') + ' ' + urlParams.get('last_name'));
        }
        if (urlParams.get('email')) {
            $('#email').val(urlParams.get('email'));
        }
        if (urlParams.get('phone_number')) {
            $('#phone_number').val(urlParams.get('phone_number'));
        }
    }
    
    // Handle event tickets
    function handleEventTickets() {
        try {
            const orderData = JSON.parse(localStorage.getItem('pendingTicketOrder'));
            window.pendingOrderData = orderData;
            
            if (orderData.ticketData && orderData.ticketData.length > 0) {
                $('#orderSummary').show();
                
                // Build ticket items
                const orderItemsHtml = orderData.ticketData.map(ticket => 
                    `<div class="order-item d-flex justify-content-between mb-2">
                        <span>${ticket.quantity}x ${ticket.category}</span>
                        <span style="font-weight: 600;">Ksh ${(ticket.quantity * ticket.price).toLocaleString()}</span>
                    </div>`
                ).join('');
                
                $('#order-items').html(orderItemsHtml);
                const totalAmount = parseFloat(orderData.subtotal || 0);
                $('#total-amount-display').text('Ksh ' + totalAmount.toLocaleString());
                
                // Show summary
                $('#bookingSummary').show().html(`
                    <h4 class="mb-3">🎫 Event Ticket Order</h4>
                    <div class="alert alert-info">
                        <p><strong>Event:</strong> Kalenjin Vibes</p>
                        <p><strong>Event ID:</strong> ${orderData.event_id || 'N/A'}</p>
                        <p><strong>Total Amount:</strong> Ksh ${totalAmount.toLocaleString()}</p>
                        <p><strong>Tickets:</strong></p>
                        <ul class="mb-0">
                            ${orderData.ticketData.map(ticket => 
                                `<li>${ticket.quantity}x ${ticket.category} @ Ksh ${ticket.price.toLocaleString()}</li>`
                            ).join('')}
                        </ul>
                    </div>
                `);
                
                $('#bookingType').val('event_tickets');
                $('#bookingAmount').val(totalAmount);
                $('#bookingEventName').val('Kalenjin Vibes');
            }
        } catch (e) {
            console.error('Error parsing pending order:', e);
        }
    }
    
    // Handle general checkout
    function handleGeneralCheckout() {
        const amount = parseFloat(totalAmount || 0);
        if (amount > 0) {
            $('#bookingAmount').val(amount);
            $('#bookingSummary').show().html(`
                <h4 class="mb-3">💳 Payment Summary</h4>
                <div class="alert alert-info">
                    <p><strong>Amount to Pay:</strong> Ksh ${amount.toLocaleString()}</p>
                    <p><strong>Service:</strong> Kalenjin Vibes</p>
                </div>
            `);
            $('#bookingType').val('general');
        }
    }
    
    // Initialize payment types
    handlePaymentTypes();
    
    // Show/hide payment method details
    $('#payment_method').on('change', function() {
        const method = $(this).val();
        $('#mpesa-details, #paybill-details, #transaction-reference-group').hide();
        $('#transaction_reference').removeAttr('required');
        
        if (method === 'mpesa') {
            $('#mpesa-details, #transaction-reference-group').show();
            $('#transaction_reference').attr('required', 'required');
        } else if (method === 'paybill') {
            $('#paybill-details, #transaction-reference-group').show();
            $('#transaction_reference').attr('required', 'required');
        }
        
        $('#transaction-error').hide();
        $('#transaction_reference').css('border-color', '#ddd');
        updatePaymentAmounts();
    });
    
    // Clear error on input
    $('#transaction_reference').on('input', function() {
        if ($(this).val().trim().length > 0) {
            $('#transaction-error').hide();
            $(this).css('border-color', '#ddd');
        }
    });
    
    // Cancel button handler
    $('#cancel-btn').on('click', function(e) {
        e.preventDefault();
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Cancel Payment?',
                text: 'Are you sure you want to cancel this payment?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Cancel',
                cancelButtonText: 'Continue Payment',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Clear localStorage data
                    localStorage.removeItem('pendingTicketOrder');
                    // Don't clear cart here - user might want to continue shopping
                    window.location.href = 'index.html';
                }
            });
        } else {
            if (confirm('Are you sure you want to cancel this payment?')) {
                localStorage.removeItem('pendingTicketOrder');
                window.location.href = 'index.html';
            }
        }
    });
    
    // Form submission handler - DIRECT WHATSAPP REDIRECT
    $('#payment-form').on('submit', function(e) {
        e.preventDefault();
        
        // Validate required fields
        const requiredFields = ['full_name', 'email', 'phone_number', 'payment_method'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = $('#' + fieldId);
            if (!field.val().trim()) {
                isValid = false;
                field.addClass('is-invalid');
                field.next('.invalid-feedback').remove();
                field.after(`<div class="invalid-feedback">This field is required</div>`);
            } else {
                field.removeClass('is-invalid');
            }
        });
        
        // Validate transaction code if payment method selected
        const paymentMethod = $('#payment_method').val();
        const transactionCode = $('#transaction_reference').val().trim();
        
        if (paymentMethod && !transactionCode) {
            $('#transaction-error').show();
            $('#transaction_reference').addClass('is-invalid').focus();
            isValid = false;
        }
        
        if (!isValid) {
            return false;
        }
        
        // Get form data
        const formData = {
            full_name: $('#full_name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone_number').val().trim(),
            payment_method: paymentMethod,
            transaction_code: transactionCode,
            booking_type: $('#bookingType').val(),
            amount: $('#bookingAmount').val() || '0',
            event_name: 'Kalenjin Vibes'
        };
        
        // Build WhatsApp message based on booking type
        let whatsappMessage = '';
        const eventName = 'Kalenjin Vibes';
        
        switch(formData.booking_type) {
            case 'cart_checkout':
                whatsappMessage = buildCartWhatsAppMessage(formData);
                break;
            case 'event_tickets':
                whatsappMessage = buildEventTicketsWhatsAppMessage(formData);
                break;
            case 'talent_booking':
                whatsappMessage = buildTalentBookingWhatsAppMessage(formData);
                break;
            default:
                whatsappMessage = buildGeneralWhatsAppMessage(formData);
        }
        
        // Create WhatsApp URL
        const whatsappNumber = '254797265275';
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Show loading state
        const submitBtn = $('#complete-purchase-btn');
        const originalText = submitBtn.html();
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Processing...').prop('disabled', true);
        
        // Clear relevant localStorage data
        if (formData.booking_type === 'cart_checkout') {
            localStorage.removeItem('kalenjinvibes_cart');
        } else if (formData.booking_type === 'event_tickets') {
            localStorage.removeItem('pendingTicketOrder');
        }
        
        // DIRECTLY REDIRECT TO WHATSAPP
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            
            // Show success message
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Payment Submitted!',
                    text: 'You will be redirected to WhatsApp to complete the payment confirmation.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            
            // Redirect to homepage after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        }, 1000);
        
        return false;
    });
    
    // Helper function to build cart WhatsApp message
    function buildCartWhatsAppMessage(formData) {
        let message = `🛒 SHOPPING CART PAYMENT CONFIRMATION\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `📧 CONTACT INFORMATION:\n`;
        message += `• Name: ${formData.full_name}\n`;
        message += `• Email: ${formData.email}\n`;
        message += `• Phone: ${formData.phone}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `🛍️ ORDER DETAILS:\n`;
        message += `• Service: ${eventName} Shopping\n`;
        message += `• Order Type: Shopping Cart\n\n`;
        
        // Add cart items
        if (window.cartData && window.cartData.length > 0) {
            message += `📦 ITEMS ORDERED:\n`;
            window.cartData.forEach(item => {
                const itemTotal = item.price * item.quantity;
                message += `• ${item.quantity}x ${item.name} - Ksh ${itemTotal.toLocaleString()}\n`;
            });
            message += `\n`;
        }
        
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `💰 PAYMENT INFORMATION:\n`;
        message += `• Total Amount: Ksh ${parseFloat(formData.amount).toLocaleString()}\n`;
        message += `• Payment Method: ${formData.payment_method.toUpperCase()}\n`;
        message += `• Transaction Code: ${formData.transaction_code}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `✅ Payment completed for ${eventName}\n\n`;
        message += `📞 Contact: +254797265275\n`;
        message += `📧 Email: kalenjinvibezke@gmail.com`;
        
        return message;
    }
    
    // Helper function to build event tickets WhatsApp message
    function buildEventTicketsWhatsAppMessage(formData) {
        let message = `🎫 EVENT TICKET PAYMENT CONFIRMATION\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `📧 CONTACT INFORMATION:\n`;
        message += `• Name: ${formData.full_name}\n`;
        message += `• Email: ${formData.email}\n`;
        message += `• Phone: ${formData.phone}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `🎪 EVENT DETAILS:\n`;
        message += `• Event: ${eventName}\n`;
        
        if (window.pendingOrderData) {
            message += `• Event ID: ${window.pendingOrderData.event_id || 'N/A'}\n\n`;
            
            if (window.pendingOrderData.ticketData && window.pendingOrderData.ticketData.length > 0) {
                message += `🎟️ TICKET DETAILS:\n`;
                window.pendingOrderData.ticketData.forEach(ticket => {
                    const ticketTotal = ticket.quantity * ticket.price;
                    message += `• ${ticket.quantity}x ${ticket.category} - Ksh ${ticketTotal.toLocaleString()}\n`;
                });
                message += `\n`;
            }
        }
        
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `💰 PAYMENT INFORMATION:\n`;
        message += `• Total Amount: Ksh ${parseFloat(formData.amount).toLocaleString()}\n`;
        message += `• Payment Method: ${formData.payment_method.toUpperCase()}\n`;
        message += `• Transaction Code: ${formData.transaction_code}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `✅ Payment completed for ${eventName}\n\n`;
        message += `📞 Contact: +254797265275\n`;
        message += `📧 Email: kalenjinvibezke@gmail.com`;
        
        return message;
    }
    
    // Helper function to build talent booking WhatsApp message
    function buildTalentBookingWhatsAppMessage(formData) {
        let message = `🎤 TALENT BOOKING PAYMENT CONFIRMATION\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `📧 CONTACT INFORMATION:\n`;
        message += `• Name: ${formData.full_name}\n`;
        message += `• Email: ${formData.email}\n`;
        message += `• Phone: ${formData.phone}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `🎭 BOOKING DETAILS:\n`;
        message += `• Talent: ${$('#summaryTalentName').text()}\n`;
        message += `• Event: ${eventName}\n`;
        message += `• Date: ${$('#summaryEventDate').text()}\n`;
        message += `• Location: ${$('#summaryLocation').text()}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `💰 PAYMENT INFORMATION:\n`;
        message += `• Total Amount: Ksh ${parseFloat(formData.amount).toLocaleString()}\n`;
        message += `• Payment Method: ${formData.payment_method.toUpperCase()}\n`;
        message += `• Transaction Code: ${formData.transaction_code}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `✅ Booking completed for ${eventName}\n\n`;
        message += `📞 Contact: +254797265275\n`;
        message += `📧 Email: kalenjinvibezke@gmail.com`;
        
        return message;
    }
    
    // Helper function to build general WhatsApp message
    function buildGeneralWhatsAppMessage(formData) {
        let message = `💳 PAYMENT CONFIRMATION\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `📧 CONTACT INFORMATION:\n`;
        message += `• Name: ${formData.full_name}\n`;
        message += `• Email: ${formData.email}\n`;
        message += `• Phone: ${formData.phone}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `💰 PAYMENT INFORMATION:\n`;
        message += `• Service: ${eventName}\n`;
        message += `• Total Amount: Ksh ${parseFloat(formData.amount).toLocaleString()}\n`;
        message += `• Payment Method: ${formData.payment_method.toUpperCase()}\n`;
        message += `• Transaction Code: ${formData.transaction_code}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `✅ Payment completed for ${eventName}\n\n`;
        message += `📞 Contact: +254797265275\n`;
        message += `📧 Email: kalenjinvibezke@gmail.com`;
        
        return message;
    }
    
    // Auto-format phone number
    $('#phone_number').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.startsWith('0')) {
                value = '254' + value.substring(1);
            } else if (!value.startsWith('254') && value.length === 9) {
                value = '254' + value;
            }
            
            // Format for display
            let displayValue = value;
            if (value.length === 12) {
                displayValue = value.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
            }
            
            $(this).val(displayValue);
        }
    });
    
    // Add validation styles
    $('input[required]').on('blur', function() {
        if (!$(this).val().trim()) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });
    
    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
});
// Payment Form Handler - Direct WhatsApp Redirect
$(document).ready(function() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingType = urlParams.get('type');
    
    // Always set event name to "Kalenjin Vibes Night"
    $('#bookingEventName').val('Kalenjin Vibes Night');
    
    // Function to update payment amounts dynamically
    function updatePaymentAmounts() {
        const totalAmount = parseFloat($('#bookingAmount').val() || $('#summaryAmount').text().replace(/,/g, '') || urlParams.get('total') || 0);
        if (totalAmount > 0) {
            $('#mpesaAmount').text('Ksh ' + totalAmount.toLocaleString());
            $('#paybillAmount').text('Ksh ' + totalAmount.toLocaleString());
        }
    }
    
    // Handle talent booking
    if (bookingType === 'talent_booking') {
        $('#bookingSummary').show();
        $('#summaryTalentName').text(urlParams.get('talent_name') || 'N/A');
        $('#summaryEventName').text('Kalenjin Vibes Night'); // Always show this
        $('#summaryEventDate').text(urlParams.get('event_date') || 'N/A');
        $('#summaryLocation').text(urlParams.get('location') || 'N/A');
        const talentAmount = parseFloat(urlParams.get('amount') || 0);
        $('#summaryAmount').text(talentAmount.toLocaleString());
        
        // Populate hidden form fields
        $('#bookingType').val('talent_booking');
        $('#bookingTalentId').val(urlParams.get('talent_id') || '');
        $('#bookingTalentName').val(urlParams.get('talent_name') || '');
        $('#bookingEventName').val('Kalenjin Vibes Night'); // Always set this
        $('#bookingLocation').val(urlParams.get('location') || '');
        $('#bookingEventDate').val(urlParams.get('event_date') || '');
        $('#bookingAmount').val(urlParams.get('amount') || '');
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
        
        updatePaymentAmounts();
    } else {
        const urlTotal = urlParams.get('total');
        if (urlTotal) {
            const totalAmount = parseFloat(urlTotal || 0);
            $('#bookingAmount').val(totalAmount);
            updatePaymentAmounts();
        }
        $('#bookingType').val('general');
    }
    
    // Check for event ticket order from localStorage
    const pendingOrder = localStorage.getItem('pendingTicketOrder');
    if (pendingOrder) {
        try {
            const orderData = JSON.parse(pendingOrder);
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
                
                $('#bookingSummary').show().html(`
                    <h4 class="mb-3">Event Ticket Order Summary</h4>
                    <div class="alert alert-info">
                        <p><strong>Event:</strong> Kalenjin Vibes Night</p>
                        <p><strong>Event ID:</strong> ${orderData.event_id || 'N/A'}</p>
                        <p><strong>Total Amount:</strong> Ksh ${totalAmount.toLocaleString()}</p>
                        <p><strong>Tickets:</strong></p>
                        <ul>
                            ${orderData.ticketData.map(ticket => 
                                `<li>${ticket.quantity}x ${ticket.category} @ Ksh ${ticket.price.toLocaleString()} = Ksh ${(ticket.quantity * ticket.price).toLocaleString()}</li>`
                            ).join('')}
                        </ul>
                    </div>
                `);
                
                $('#bookingType').val('event_tickets');
                $('#bookingAmount').val(orderData.subtotal);
                $('#bookingEventName').val('Kalenjin Vibes Night'); // Always set this
                window.pendingOrderData = orderData;
                updatePaymentAmounts();
            }
        } catch (e) {
            console.error('Error parsing pending order:', e);
        }
    }
    
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
    
    // Update amounts on load
    setTimeout(updatePaymentAmounts, 100);
    
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
                    localStorage.removeItem('pendingTicketOrder');
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
    
    // Form submission handler - DIRECT WHATSAPP REDIRECT (NO SUCCESS MESSAGE)
    $('#payment-form').on('submit', function(e) {
        e.preventDefault();
        
        // Validate transaction code
        const paymentMethod = $('#payment_method').val();
        const transactionCode = $('#transaction_reference').val().trim();
        
        if (paymentMethod && !transactionCode) {
            $('#transaction-error').show();
            $('#transaction_reference').focus().css('border-color', '#dc3545');
            return false;
        }
        
        // Get form data
        const fullName = $('#full_name').val() || '';
        const email = $('#email').val() || '';
        const phone = $('#phone_number').val() || '';
        const amount = $('#bookingAmount').val() || $('#summaryAmount').text().replace(/,/g, '');
        const bookingType = $('#bookingType').val();
        
        // Build WhatsApp message - Always include "Kalenjin Vibes Night"
        let whatsappMessage = '';
        const eventName = 'Kalenjin Vibes Night';
        
        if (bookingType === 'event_tickets') {
            let eventId = 'N/A';
            let ticketDetails = '';
            
            if (window.pendingOrderData) {
                const orderData = window.pendingOrderData;
                eventId = orderData.event_id || 'N/A';
                
                if (orderData.ticketData && orderData.ticketData.length > 0) {
                    ticketDetails = orderData.ticketData.map(ticket => 
                        `${ticket.quantity}x ${ticket.category} @ Ksh ${ticket.price.toLocaleString()} = Ksh ${(ticket.quantity * ticket.price).toLocaleString()}`
                    ).join('\n');
                }
            }
            
            whatsappMessage = `🎫 EVENT TICKET PAYMENT CONFIRMATION\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `📧 CONTACT INFORMATION:\n`;
            whatsappMessage += `Name: ${fullName}\n`;
            whatsappMessage += `Email: ${email}\n`;
            whatsappMessage += `Phone: ${phone}\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `🎪 EVENT DETAILS:\n`;
            whatsappMessage += `Event: ${eventName}\n`;
            whatsappMessage += `Event ID: ${eventId}\n\n`;
            
            if (ticketDetails) {
                whatsappMessage += `🎟️ TICKET DETAILS:\n`;
                whatsappMessage += `${ticketDetails}\n\n`;
            }
            
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `💰 PAYMENT INFORMATION:\n`;
            whatsappMessage += `Total Amount: Ksh ${parseFloat(amount).toLocaleString()}\n`;
            whatsappMessage += `Payment Method: ${paymentMethod.toUpperCase()}\n`;
            whatsappMessage += `Transaction Reference: ${transactionCode}\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `✅ Payment completed for ${eventName}\n\n`;
            whatsappMessage += `📞 Contact: +254701 576 004\n`;
            whatsappMessage += `📧 Email: kalenjinvibezke@gmail.com`;
            
        } else if (bookingType === 'talent_booking') {
            whatsappMessage = `🎤 TALENT BOOKING PAYMENT CONFIRMATION\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `📧 CONTACT INFORMATION:\n`;
            whatsappMessage += `Name: ${fullName}\n`;
            whatsappMessage += `Email: ${email}\n`;
            whatsappMessage += `Phone: ${phone}\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `🎭 BOOKING DETAILS:\n`;
            whatsappMessage += `Talent: ${$('#summaryTalentName').text()}\n`;
            whatsappMessage += `Event: ${eventName}\n`;
            whatsappMessage += `Date: ${$('#summaryEventDate').text()}\n`;
            whatsappMessage += `Location: ${$('#summaryLocation').text()}\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `💰 PAYMENT INFORMATION:\n`;
            whatsappMessage += `Total Amount: Ksh ${parseFloat(amount).toLocaleString()}\n`;
            whatsappMessage += `Payment Method: ${paymentMethod.toUpperCase()}\n`;
            whatsappMessage += `Transaction Reference: ${transactionCode}\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `✅ Booking completed for ${eventName}\n\n`;
            whatsappMessage += `📞 Contact: +254701 576 004\n`;
            whatsappMessage += `📧 Email: kalenjinvibezke@gmail.com`;
            
        } else {
            whatsappMessage = `💳 PAYMENT CONFIRMATION\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `📧 CONTACT INFORMATION:\n`;
            whatsappMessage += `Name: ${fullName}\n`;
            whatsappMessage += `Email: ${email}\n`;
            whatsappMessage += `Phone: ${phone}\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `💰 PAYMENT INFORMATION:\n`;
            whatsappMessage += `For Event: ${eventName}\n`;
            whatsappMessage += `Total Amount: Ksh ${parseFloat(amount).toLocaleString()}\n`;
            whatsappMessage += `Payment Method: ${paymentMethod.toUpperCase()}\n`;
            whatsappMessage += `Transaction Reference: ${transactionCode}\n\n`;
            whatsappMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            whatsappMessage += `✅ Payment completed for ${eventName}\n\n`;
            whatsappMessage += `📞 Contact: +254701 576 004\n`;
            whatsappMessage += `📧 Email: kalenjinvibezke@gmail.com`;
        }
        
        // Create WhatsApp URL
        const whatsappNumber = '254797265275';
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Clear localStorage
        localStorage.removeItem('pendingTicketOrder');
        if (window.pendingOrderData) {
            delete window.pendingOrderData;
        }
        
        // DIRECTLY REDIRECT TO WHATSAPP - NO SUCCESS MESSAGE DISPLAYED
        window.open(whatsappUrl, '_blank');
        
        // Optionally redirect to homepage after 1 second
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1000);
        
        // Prevent form from showing any success message
        return false;
    });
});
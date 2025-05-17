/**
 * Helcim Pay JS Integration
 * Based on Helcim documentation: https://devdocs.helcim.com/docs/helcimpayjs
 */

(function () {
  // Initialize the Helcim Pay global object
  window.helcimPay = {
    // The iframe element
    iframe: null,

    // The iframe container element
    container: null,

    /**
     * Append Helcim Pay iFrame to the DOM
     * @param {string} token - Checkout token from initialization API
     */
    appendHelcimPayIframe: function (token) {
      console.log('Appending Helcim Pay iFrame with token:', token);

      // Create container if it doesn't exist
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'helcim-pay-container';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.container.style.zIndex = '9999';
        this.container.style.display = 'flex';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        document.body.appendChild(this.container);
      }

      // Create the iframe
      this.iframe = document.createElement('iframe');
      this.iframe.id = 'helcim-pay-iframe';
      this.iframe.src = 'https://secure.helcim.app/helcim-pay/' + token;
      this.iframe.style.width = '100%';
      this.iframe.style.maxWidth = '500px';
      this.iframe.style.height = '600px';
      this.iframe.style.border = 'none';
      this.iframe.style.borderRadius = '8px';
      this.iframe.style.backgroundColor = 'white';
      this.iframe.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

      // Append iframe to container
      this.container.appendChild(this.iframe);

      // Setup event listener for messages from the iframe
      window.addEventListener('message', this.handleHelcimResponse);
    },

    /**
     * Remove Helcim Pay iFrame from the DOM
     */
    removeHelcimPayIframe: function () {
      console.log('Removing Helcim Pay iFrame');

      if (this.container) {
        document.body.removeChild(this.container);
        this.container = null;
        this.iframe = null;
      }

      // Remove the event listener
      window.removeEventListener('message', this.handleHelcimResponse);
    },

    /**
     * Handle messages from the Helcim Pay iFrame
     * @param {MessageEvent} event - The message event from the iframe
     */
    handleHelcimResponse: function (event) {
      // Check if the message is from Helcim
      if (
        event.origin.includes('helcim.app') ||
        event.origin.includes('helcim.com')
      ) {
        console.log('Received message from Helcim:', event.data);

        try {
          const data =
            typeof event.data === 'string'
              ? JSON.parse(event.data)
              : event.data;

          // Check if this is a payment response
          if (data && (data.paid === true || data.status === 'success')) {
            console.log(
              'Payment successful! Transaction ID:',
              data.transactionId || data.txnId
            );

            // Dispatch custom event
            const customEvent = new CustomEvent('helcimPaymentComplete', {
              detail: data,
            });
            window.dispatchEvent(customEvent);

            // Clean up
            window.helcimPay.removeHelcimPayIframe();
          }
        } catch (error) {
          console.error('Error processing Helcim response:', error);
        }
      }
    },
  };

  console.log('Helcim Pay JS initialized');
})();

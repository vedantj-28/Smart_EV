import { Invoice, InvoiceItem, ChargingSession, User } from '../types';
import { generateInvoiceNumber } from '../lib/utils';

export interface InvoiceTemplate {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  gstNumber: string;
  website: string;
}

export class InvoiceService {
  private static instance: InvoiceService;
  private template: InvoiceTemplate = {
    companyName: 'EV Smart Charger Pvt. Ltd.',
    companyAddress: 'Plot No. 123, Tech Park, Mumbai - 400001',
    companyPhone: '+91 98765 43210',
    companyEmail: 'billing@evsmartcharger.com',
    gstNumber: 'GST123456789',
    website: 'www.evsmartcharger.com',
  };

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  generateInvoice(session: ChargingSession, user: User): Invoice {
    const invoiceItems: InvoiceItem[] = [
      {
        description: `EV Charging Session - ${session.stationId}`,
        units: session.energyConsumed,
        rate: session.costPerKwh,
        amount: session.totalCost,
      },
    ];

    // Add service charges if applicable
    if (session.energyConsumed > 50) {
      invoiceItems.push({
        description: 'Fast Charging Premium',
        units: 1,
        rate: 25,
        amount: 25,
      });
    }

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const gstRate = 0.18; // 18% GST
    const gst = subtotal * gstRate;
    const total = subtotal + gst;

    return {
      id: `inv-${session.id}`,
      sessionId: session.id,
      userId: session.userId,
      vehicleId: session.vehicleId,
      invoiceNumber: generateInvoiceNumber(),
      date: session.endTime || session.startTime,
      items: invoiceItems,
      subtotal,
      tax: gst,
      total,
      paymentMethod: 'Wallet',
      transactionId: `TXN${Date.now()}`,
    };
  }

  generateInvoiceHTML(invoice: Invoice, user: User): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info h1 { color: #3B82F6; margin: 0; }
          .invoice-details { text-align: right; }
          .billing-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: 600; }
          .total-section { text-align: right; }
          .total-row { font-weight: bold; font-size: 18px; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="company-info">
              <h1>${this.template.companyName}</h1>
              <p>${this.template.companyAddress}</p>
              <p>Phone: ${this.template.companyPhone}</p>
              <p>Email: ${this.template.companyEmail}</p>
              <p>GST: ${this.template.gstNumber}</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${invoice.date.toLocaleDateString()}</p>
              <p><strong>Vehicle:</strong> ${invoice.vehicleId}</p>
            </div>
          </div>

          <div class="billing-info">
            <h3>Charging Session Details</h3>
            <p><strong>Session ID:</strong> ${invoice.sessionId}</p>
            <p><strong>Vehicle Number:</strong> ${invoice.vehicleId}</p>
            <p><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${invoice.transactionId}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Units (kWh)</th>
                <th>Rate (₹/kWh)</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.units.toFixed(2)}</td>
                  <td>₹${item.rate.toFixed(2)}</td>
                  <td>₹${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <p>Subtotal: ₹${invoice.subtotal.toFixed(2)}</p>
            <p>GST (18%): ₹${invoice.tax.toFixed(2)}</p>
            <p class="total-row">Total: ₹${invoice.total.toFixed(2)}</p>
          </div>

          <div class="footer">
            <p>Thank you for charging with ${this.template.companyName} ⚡</p>
            <p>Visit us at ${this.template.website}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  downloadInvoicePDF(invoice: Invoice, user: User): void {
    const htmlContent = this.generateInvoiceHTML(invoice, user);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  emailInvoice(invoice: Invoice, user: User): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate email sending
      setTimeout(() => {
        console.log(`Emailing invoice ${invoice.invoiceNumber} to ${user.email}`);
        resolve(Math.random() > 0.1); // 90% success rate
      }, 1500);
    });
  }
}

export const invoiceService = InvoiceService.getInstance();
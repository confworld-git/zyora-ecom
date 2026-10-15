import { useSearchParams } from "react-router-dom";
import "./Policies.css";
import ScrollReveal from "../ScrollReveal.jsx";

const policies = [
  {
    id: "shipping",
    title: "Shipping Policy",
    content: `Welcome to ZYORA. We aim to deliver your orders safely and efficiently. This Shipping Policy explains how orders are processed, shipped, tracked and delivered when you shop through our website [www.zyoraecom.in](https://www.zyoraecom.in).

## 1. Order Processing
- Orders are processed after successful payment confirmation or confirmation of a Cash on Delivery (COD) order, where available.
- Our standard order processing time is 1–3 business days.
- Orders placed on Sundays, public holidays or during promotional sales may require additional processing time.
- Customers will receive an order confirmation through the contact details provided at checkout, where supported.

## 2. Shipping Locations
ZYORA currently delivers to eligible serviceable PIN codes within India.

Delivery availability depends on the customer's location and the courier partner's service coverage.

## 3. Estimated Delivery Time
- Metro cities: approximately 2–5 business days.
- Other serviceable locations: approximately 4–8 business days.
- Remote locations: delivery may take additional time.

These are estimates and are not guaranteed delivery dates. Delays may occur because of weather, courier disruptions, public holidays, operational issues or other circumstances beyond our reasonable control.

## 4. Shipping Charges
Shipping charges, if applicable, will be displayed during checkout before the customer confirms the order.

ZYORA may offer free shipping on selected products, promotional orders or purchases above a specified value. Any applicable conditions will be stated on the website.

## 5. Order Tracking
Once an order has been dispatched, tracking details will be shared by email, SMS, WhatsApp or another available communication channel.

Customers can use the tracking information provided to check shipment progress.

## 6. Incorrect Address and Failed Delivery
Customers are responsible for providing accurate shipping information, including their full address, PIN code and contact number.

If a delivery fails because of an incorrect address, unavailable recipient or repeated unsuccessful delivery attempts, the courier may return the shipment to us. Additional shipping charges or reshipment arrangements may apply where legally permissible and disclosed to the customer.

Please contact us promptly if you notice an error in your delivery address.

## 7. Damaged, Missing or Incorrect Items
If your order arrives damaged, incomplete or with an incorrect product, contact us at [zyoraecommerce@gmail.com](mailto:zyoraecommerce@gmail.com) within 48 hours of delivery, preferably with photographs of the product, packaging and shipping label.

We will review the complaint and arrange an appropriate resolution in accordance with our Return & Refund Policy and applicable law.

## 8. Contact Information
For shipping-related questions, please contact:
- Business name: ZYORA
- Email: [zyoraecommerce@gmail.com](mailto:zyoraecommerce@gmail.com)
- Phone: +91 7010423318`,
  },
  {
    id: "returns",
    title: "Return & Refund Policy",
    content: `At ZYORA, customer satisfaction is important to us. This policy explains the conditions for requesting returns, exchanges, replacements and refunds for products purchased through [www.zyoraecom.in](https://www.zyoraecom.in).

## 1. Return Eligibility
Customers may request a return within 2 days from delivery, provided the product is eligible under the product listing and this policy.

A product may qualify for return or replacement if:
- It arrives damaged or defective.
- The wrong product has been delivered.
- The product is materially different from its description.
- The product is missing essential parts or accessories.
- Another return ground is available under the product listing or applicable law.

## 2. Conditions for Returns
Where applicable, returned products should:
- Be unused and in their original condition.
- Include original packaging, tags, accessories, manuals and other supplied items.
- Be accompanied by the order number or proof of purchase.

These conditions do not remove a customer's legal rights regarding defective, damaged, incorrect or misdescribed products.

## 3. Non-Returnable Products
Certain products may not be eligible for change-of-mind returns, depending on their nature and the conditions disclosed before purchase. Examples may include:
- Personal-care or hygiene products once opened, where appropriate.
- Perishable products.
- Customised or personalised items.
- Products specifically marked as non-returnable before purchase.

Non-returnable status cannot be used as a blanket reason to refuse remedies required by applicable consumer law.

## 4. How to Request a Return
To request a return or replacement:
1. Contact [zyoraecommerce@gmail.com](mailto:zyoraecommerce@gmail.com) or use the Contact Us page.
2. Provide your order number, product name and reason for the request.
3. Attach photographs or videos if the product is damaged, defective or incorrect.
4. Wait for instructions and confirmation from our support team.
5. Pack the product securely and follow the return shipping instructions provided.

Please do not send products to an address that has not been confirmed by our support team.

## 5. Return Shipping Charges
- For products damaged in transit, defective products, incorrect deliveries where ZYORA is responsible, ZYORA will arrange or cover reasonable return shipping costs as applicable.
- For eligible change of mind returns, return shipping charges will be handled according to the terms disclosed before purchase.
- No return shipping fee will be charged where prohibited by applicable law.

## 6. Refund Processing
Where a return is required, we will inspect the returned product and notify you of the outcome. Refund requests will not be accepted for items that are damaged, used or different from the product ordered.

Approved refunds will generally be initiated within 7–14 business days after approval, subject to applicable legal requirements and payment-provider processing times.
- Online payments: Refunds will generally be issued to the original payment method.
- Cash on Delivery: Customers may be asked to provide appropriate bank or other permitted refund details.
- Shipping charges: Refund treatment will depend on the reason for return, the original order terms and applicable law.

The time taken for the amount to appear in the customer's account may depend on the bank, payment gateway or card issuer.

## 7. Order Cancellation
Customers may request cancellation before the order is dispatched by contacting customer support.

If the order has already been dispatched, cancellation may not be possible through the normal process, but the customer may be eligible for a return or other remedy under the applicable policy and law.

Any cancellation charges must comply with applicable law and the terms disclosed at checkout.

## 8. Replacement or Exchange
Where an exchange or replacement is available, it will depend on stock availability and product eligibility.

If the same item is unavailable, we will communicate the available options, such as a refund or another mutually agreed resolution, subject to applicable law.

## 9. Late, Missing or Incorrect Refunds
If you have not received an approved refund within the communicated period, please contact us with your order number and refund confirmation details.

We will investigate the issue with the relevant payment provider or courier partner, as appropriate.

## 10. Contact Us
For return and refund requests:
- Email: [zyoraecommerce@gmail.com](mailto:zyoraecommerce@gmail.com)
- Phone: +91 7010423318`,
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    content: `Welcome to ZYORA. These Terms & Conditions govern your access to and use of [www.zyoraecom.in](https://www.zyoraecom.in), including browsing, purchasing products and communicating with our business.

By accessing or using the website, you agree to these terms and applicable laws. If you do not agree, please discontinue use of the website.

## 1. Business Information
The website is operated by Suhale A.K, trading under the brand name ZYORA, with its registered or principal business address at Chennai, India.

Customer support details:
- Email: [zyoraecommerce@gmail.com](mailto:zyoraecommerce@gmail.com)
- Phone: +91 7010423318

## 2. Eligibility
You must be legally capable of entering into a binding contract under applicable law to place an order. If you are below the age of majority, you may use the website only with the involvement and permission of a parent or legal guardian, as applicable.

## 3. Product Information
We make reasonable efforts to display accurate product descriptions, photographs, prices, sizes, colours, specifications and availability.

However, actual product appearance may vary slightly because of screen settings, lighting, manufacturing variations or similar factors.

If a product is materially different from its description, applicable consumer rights and remedies will apply.

## 4. Prices and Payments
- All prices will be displayed in Indian Rupees (INR), unless otherwise stated.
- Applicable taxes and compulsory charges will be disclosed as required.
- Shipping charges, where applicable, will be displayed before order confirmation.
- Orders are subject to payment verification and stock availability.
- Available payment methods will be shown at checkout.

ZYORA will not request your card PIN, OTP or banking password through email or phone. Never share such credentials with anyone claiming to represent us.

## 5. Orders and Acceptance
Placing an order constitutes an offer to purchase the selected product.

An automated order acknowledgement does not necessarily mean that the order has been finally accepted. We may contact you if there is an issue with payment, stock availability, delivery details or suspected fraudulent activity.

If an order cannot be fulfilled after payment, we will inform you and arrange an appropriate refund in accordance with applicable law.

## 6. Order Cancellation, Returns and Refunds
Order cancellations, returns, exchanges, replacements and refunds are governed by our Return & Refund Policy.

Nothing in these Terms & Conditions limits statutory consumer rights or remedies that cannot lawfully be excluded.

## 7. Shipping and Delivery
Delivery estimates, shipping fees, tracking, failed deliveries and shipping-related complaints are governed by our Shipping Policy.

Delivery timelines are estimates unless a specific delivery commitment is expressly confirmed.

## 8. Acceptable Use
You agree not to:
- Use the website for unlawful or fraudulent activities.
- Attempt unauthorized access to website systems or customer information.
- Upload malicious code or interfere with website functionality.
- Provide false information or impersonate another person.
- Misuse the website in a manner that harms ZYORA, customers or third parties.

## 9. Intellectual Property
Unless otherwise stated, website content, including the ZYORA brand, logos, product descriptions, graphics and original text, is owned by or licensed to the relevant rights holder.

You may not reproduce, distribute, modify or commercially exploit protected content without prior permission, except where permitted by law.

## 10. Third-Party Services
Our website may use third-party payment gateways, courier services, analytics tools or other service providers.

Their services may be subject to separate terms and privacy policies. ZYORA will address its own responsibilities under applicable law and will not exclude liability where such exclusion is prohibited.

## 11. Limitation of Liability
To the extent permitted by applicable law, ZYORA will not be responsible for indirect losses that could not reasonably have been anticipated.

Nothing in these terms excludes or limits liability for fraud, wilful misconduct, statutory consumer remedies or any other liability that cannot lawfully be excluded or limited.

## 12. Privacy
Personal information collected through the website is handled according to our Privacy Policy.

## 13. Complaints and Grievance Redressal
Customers may submit complaints using the Contact Us page or the customer support details displayed on the website.
- Email: [zyoraecommerce@gmail.com](mailto:zyoraecommerce@gmail.com)
- Phone: +91 7010423318

We will acknowledge complaints within the legally required timeframe and seek to resolve them within the applicable statutory period. Under the current e-commerce rules, a consumer complaint is generally required to be acknowledged within 48 hours and redressed within one month.

## 14. Governing Law and Disputes
These terms are governed by the laws of India. Any dispute will be handled by the competent authority or court with jurisdiction under applicable law. Nothing in this clause removes a consumer's statutory rights.

## 15. Changes to These Terms
We may update these terms to reflect changes in our services, business operations or legal requirements. The updated version will be published on the website with a revised date.`,
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    content: `Last Updated: 14 October 2026

ZYORA respects your privacy and aims to handle your personal information responsibly. This Privacy Policy explains what information we collect, how we use it, when we share it and the choices available to you when you visit [www.zyoraecom.in](https://www.zyoraecom.in) or place an order.

## 1. Information We Collect
Depending on how you use our website, we may collect the following information:

Personal and contact information
- Full name
- Email address
- Mobile number
- Billing and delivery address

Order information
- Products purchased
- Order number and purchase history
- Payment status and transaction reference
- Return, refund or customer support details

Technical information
- IP address and browser or device information
- Website usage data, such as pages visited
- Cookies and similar technologies, where used

We aim to collect only information reasonably needed for the purposes described in this policy.

## 2. How We Use Your Information
We may use your information to:
- Process, confirm and deliver orders.
- Collect and verify payments.
- Provide tracking, returns, replacements and refunds.
- Respond to enquiries and complaints.
- Prevent fraud and protect website security.
- Maintain business, accounting and tax records.
- Improve website performance and customer experience.
- Send promotional communications where permitted and where required, with your consent.
- Comply with applicable legal obligations.

## 3. Payments
Payments may be processed by third-party payment gateways, banks or other authorised payment providers.

ZYORA generally receives the transaction information needed to confirm and manage payments. We do not intend to store full payment card details, card security codes or banking passwords on our own systems.

Payment providers may process your information according to their own privacy and security practices.

## 4. Cookies and Analytics
Our website may use cookies or similar technologies to:
- Keep the shopping cart working.
- Remember relevant preferences.
- Understand website traffic and performance.
- Support security and fraud prevention.
- Measure advertising effectiveness, where enabled.

You can manage cookies through your browser settings. Blocking certain cookies may affect some website features.

Where required, we will obtain consent for non-essential cookies or similar technologies.

## 5. Sharing of Information
We may share relevant information with:
- Courier and logistics partners to deliver orders.
- Payment gateways and financial institutions to process transactions.
- Website hosting, technology and customer support providers.
- Accounting, legal or professional advisers.
- Government authorities or law-enforcement agencies where legally required.

We do not sell personal information to third parties as a standalone product. Service providers receiving information on our behalf should be subject to appropriate contractual and security safeguards.

## 6. Marketing Communications
We may send order updates and essential service messages relating to your purchases.

Promotional emails, SMS messages or other marketing communications will be handled in accordance with applicable law and consent requirements. You can opt out of promotional communications using the unsubscribe option or by contacting us.

Opting out of marketing will not prevent us from sending necessary messages concerning an existing order or legal obligation.

## 7. Data Security
We take reasonable measures designed to protect personal information against unauthorised access, loss, misuse, alteration or disclosure.

However, no internet transmission or electronic storage system can be guaranteed to be completely secure. We will handle security incidents in accordance with applicable legal requirements.

## 8. Data Retention
We retain personal information for as long as reasonably necessary for order fulfilment, customer support, legal compliance, accounting, dispute resolution, security and other legitimate purposes.

When information is no longer required, we will delete it or anonymise it where appropriate, subject to applicable retention obligations.

## 9. Your Privacy Rights
Subject to applicable law and its commencement provisions, you may have rights to:
- Request information about personal data we process.
- Request correction or updating of inaccurate information.
- Request deletion of personal data where legally applicable.
- Withdraw consent where processing relies on consent.
- Raise a privacy grievance or complaint.
- Exercise other rights available under applicable data-protection law.

To submit a request, contact [zyoraecommerce@gmail.com](mailto:zyoraecommerce@gmail.com).

We may need to verify your identity before acting on a request.

India's Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025 have phased commencement provisions, so ZYORA should review its procedures and timelines against the provisions applicable to it.

## 10. Children's Privacy
Our website is intended for customers who can lawfully make purchases. We do not knowingly seek to collect children's personal information in violation of applicable law. If you believe a child has provided personal information inappropriately, please contact us.

## 11. Third-Party Websites
Our website may contain links to external websites or services. ZYORA is not responsible for the privacy practices of independent third parties. Please review their privacy policies before sharing information with them.

## 12. Changes to This Privacy Policy
We may update this policy when our business practices, technology or legal obligations change. The revised policy will be published on this page with an updated date.`,
  },
];

const renderInline = (text) => {
  const parts = [];
  const tokenPattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(
        <a key={match.index} href={match[2]}>
          {match[1]}
        </a>,
      );
    } else {
      parts.push(<strong key={match.index}>{match[3]}</strong>);
    }
    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
};

const renderPolicyContent = (content) => {
  const lines = content.split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      blocks.push(
        <h2 key={`heading-${index}`}>{renderInline(heading[1])}</h2>,
      );
      index += 1;
      continue;
    }

    const listItem = line.match(/^(-|\d+\.)\s+(.+)$/);
    if (listItem) {
      const ordered = /^\d+\./.test(listItem[1]);
      const items = [];
      while (index < lines.length) {
        const currentItem = lines[index]
          .trim()
          .match(/^(-|\d+\.)\s+(.+)$/);
        if (!currentItem || /^\d+\./.test(currentItem[1]) !== ordered) break;
        items.push(
          <li key={`item-${index}`}>{renderInline(currentItem[2])}</li>,
        );
        index += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={`list-${index}`}>{items}</List>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      if (/^(#{1,3}\s+|-|\d+\.)/.test(lines[index].trim())) break;
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p key={`paragraph-${index}`}>{renderInline(paragraph.join(" "))}</p>,
    );
  }

  return blocks;
};

const Policies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPolicy = searchParams.get("policy");
  const selectedPolicy =
    policies.find((policy) => policy.id === requestedPolicy) ?? policies[0];

  const selectPolicy = (policyId) => {
    setSearchParams({ policy: policyId });
  };

  return (
    <ScrollReveal as="main" className="policies-page">
      <header className="policies-heading">
        <p className="policies-eyebrow">ZYORA CUSTOMER CARE</p>
        <h1>Policies</h1>
        <p>Everything you need to know about shopping with ZYORA.</p>
      </header>

      <div className="policies-layout">
        <nav className="policies-nav" aria-label="Policy list">
          <p className="policies-nav-label">POLICIES</p>
          {policies.map((policy) => (
            <button
              aria-current={selectedPolicy.id === policy.id ? "page" : undefined}
              className={
                selectedPolicy.id === policy.id
                  ? "policies-nav-item is-active"
                  : "policies-nav-item"
              }
              key={policy.id}
              onClick={() => selectPolicy(policy.id)}
              type="button"
            >
              <span>{policy.title}</span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </nav>

        <ScrollReveal as="article" className="policy-document" aria-live="polite">
          <div className="policy-document-heading">
            <p>ZYORA POLICIES</p>
            <h2>{selectedPolicy.title}</h2>
          </div>
          <div className="policy-document-content">
            {renderPolicyContent(selectedPolicy.content)}
          </div>
        </ScrollReveal>
      </div>
    </ScrollReveal>
  );
};

export default Policies;

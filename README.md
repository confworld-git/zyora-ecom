# React + Vite

## Order fulfillment

Orders default to self-shipping. In the admin Orders screen, add an optional
carrier, tracking number, and HTTPS tracking URL, then update the order status
manually. Customers can view those tracking details and download their order
invoice from their account.

To use Shiprocket, change the order's shipping method to Shiprocket and save it
before choosing **Send to Shiprocket**. If a shipment was deleted in Shiprocket,
verify that there first, then use **Mark deleted in Shiprocket** to clear its
stored tracking IDs and unlock order updates or another Shiprocket submission.

The A4 invoice and 4x6-inch shipping label templates are rendered in the browser
and downloaded directly as PDF files; the generated PDFs are not stored on the
server. The invoice includes the customer and sender details, order/payment
status, items and quantities, shipping/platform charges, discounts, and total.
It is an order summary, not a GST tax invoice. The shipping label includes
sender and recipient addresses, product details, order number, and print date.
The label is not a courier-issued or prepaid postage label.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
